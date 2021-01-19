import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import _ from "lodash";
import { StakehoundGeyser, Multiplexer, MerkleMock__factory } from "../typechain";
import { deploy_test, init_test, DeployTestContext } from "./utils/deploy-test";
import { JsonRpcSigner, Log } from "@ethersproject/providers";
import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "../src/abi/StakedToken.json";
import { StakedToken, StakedToken__factory } from "../src/types";
import { Interface, LogDescription, BytesLike } from "ethers/lib/utils";
import { fetchEvents, collectActions } from "../src/events";
import { keccak256 } from "ethereumjs-util";
import {
    fetch_system_rewards,
    create_calc_geyser_stakes,
    get_rewards,
    combine_rewards,
    compare_rewards,
    play_system_rewards,
    validate_rewards,
} from "../src/calc_stakes";
import { log_pair } from "./utils/test";
import {
    wait_for_next_proposed,
    wait_for_block,
    wait_for_time,
    sleep,
} from "../src/wait";
import MultiMerkle, { rewards_to_claims, encode_claim } from "../src/MultiMerkle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import S3 from "aws-sdk/clients/s3";
import cids from "cids";
import { upload_rewards, fetch_rewards } from "../src/s3";
import { approve_rewards, init_rewards, bump_rewards } from "../src/system";
const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

const MAX_NUMBER = BigNumber.from(
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

function tryParseLogs(logs: Log[], ifaces: Interface[]) {
    const out: LogDescription[] = [];
    for (const log of logs) {
        for (const iface of ifaces) {
            try {
                out.push(iface.parseLog(log));
                break;
            } catch (e) {}
        }
    }
    return out;
}

const cid_from_hash = (hash: BytesLike) => {
    const _hash = Buffer.from("1220" + hash.toString().slice(2), "hex");
    const cid = new cids(1, "dag-pb", _hash);
    return cid;
};

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

describe("Stakehound", function () {
    let signers: SignerWithAddress[];
    let multiplexer: Multiplexer;
    let context: DeployTestContext;
    const s3 = new S3({
        credentials,
    });
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
        context = await deploy_test();
        ({ multiplexer } = context);
    });
    it("rewards type", async function () {
        this.timeout(100000);
        const startBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        await init_test(context);
        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [startBlock.timestamp + 60 * 60 * 24],
        });
        await signers[0].sendTransaction({ value: 0, to: signers[0].address });
        const endBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const geysers = [
            context.geysers.seth.address,
            context.geysers.sfiro.address,
            context.geysers.seth.address,
        ];

        const config = {
            startBlock: startBlock.number,
            multiplexer: multiplexer,
            initDistribution: {
                cycle: 0,
                rewards: {},
                rewardsDistributed: {},
                rewardsDistributedInRange: {},
                rewardsInRange: {},
                users: {},
            },
            signer: signers[0],
            geysers,
            credentials,
        };
        await init_rewards(config, s3, ethers.provider, endBlock.number);
        await approve_rewards(config, s3, ethers.provider);
        const newr = await multiplexer.lastPublishedMerkleData();
        const waitP = wait_for_next_proposed(
            ethers.provider,
            multiplexer,
            newr.cycle.toNumber() + 1,
            1000
        );
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const nextEndBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        await bump_rewards(config, s3, ethers.provider, nextEndBlock.number);
        await approve_rewards(config, s3, ethers.provider);
        expect((await waitP).cycle.toNumber()).to.eq(newr.cycle.toNumber() + 1);
        const last = await multiplexer.lastPublishedMerkleData();
        const rewards = await fetch_rewards(s3, last.root);
        const m = MultiMerkle.fromMerkleRewards(last.cycle.toNumber(), rewards);
        const _s = signers[3];
        const caddress = _.keys(m.merkleRewards.claims).find((c) => c === _s.address)!;
        const c = m.merkleRewards.claims[caddress]!;
        const balances = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).balanceOf(_s.address)
            )
        );
        await multiplexer
            .connect(_s)
            .claim(
                c.tokens,
                c.amounts,
                last.cycle,
                m.getHexProof({ ...c, cycle: last.cycle.toNumber(), account: caddress })
            );
        const newBalances = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).balanceOf(_s.address)
            )
        ).then((all) => all.map((x) => x.toString()));
        const expected = _.zip(balances, c.amounts).map(([b, c]) =>
            b!.add(c!).toString()
        );
        expect(_.isEqual(newBalances, expected)).to.eq(true);
    });
    it("test wait_for_block", async function () {
        this.timeout(100000);
        const block = await ethers.provider.getBlock("latest");
        const wtime = block.timestamp + 60 * 60 * 24;
        const wp = wait_for_time(ethers.provider, wtime, 1000);
        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [wtime],
        });
        await sleep(2000);
        let p: Promise<any> = Promise.resolve();
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        await p;
        const wb = await wp;
        expect(wb.timestamp).to.gte(wtime);
    });
});
