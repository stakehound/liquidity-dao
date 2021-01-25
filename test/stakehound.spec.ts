import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import _ from "lodash";
import {
    StakehoundGeyser,
    Multiplexer,
    MerkleMock__factory,
    StakedToken__factory,
    StakedToken,
} from "../typechain";

import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "../src/abi/StakedToken.json";
import { Interface, LogDescription, BytesLike } from "ethers/lib/utils";

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
import { fetch_rewards } from "../src/s3";
import { approve_rewards, init_rewards, bump_rewards, Context } from "../src/system";
import {
    deploy_test_scenario,
    DeployTestScenarioContext,
} from "../scripts/test/lib/test-scenario";
const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

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
    let context: DeployTestScenarioContext;
    const s3 = new S3({
        credentials,
    });
    this.beforeAll(async function () {
        this.timeout(100000);
        signers = await ethers.getSigners();
        context = await deploy_test_scenario();
        ({ multiplexer } = context);
    });
    it("rewards type", async function () {
        this.timeout(100000);
        const { startBlock, proposer, approver } = context;
        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [startBlock.timestamp + 60 * 60 * 24],
        });
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const geysers = _.keys(context.geysers);
        const proposeContext: Context = {
            startBlock: startBlock.number,
            multiplexer,
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
            s3,
            epoch: 10,
            provider: ethers.provider,
            rate: 1000,
        };
       
        await init_rewards(proposeContext, proposer);
        await approve_rewards(proposeContext, approver);
        const lastpub = await multiplexer.lastPublishedMerkleData();
        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [startBlock.timestamp + 60 * 60 * 24 * 2],
        });
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const waitP = wait_for_next_proposed(
            ethers.provider,
            multiplexer,
            lastpub.cycle.toNumber(),
            1000
        );
        const nextEndBlock = await ethers.provider.getBlock(
            await ethers.provider.getBlockNumber()
        );
        const lastpubStart = await ethers.provider.getBlock(
            lastpub.startBlock.toNumber()
        );
        const lastpubEnd = await ethers.provider.getBlock(lastpub.endBlock.toNumber());
        await bump_rewards(
            proposeContext,
            proposer,
            lastpub,
            lastpubStart,
            lastpubEnd,
            nextEndBlock
        );
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        expect((await waitP).cycle.toNumber()).to.eq(lastpub.cycle.toNumber() + 1);
        await approve_rewards(proposeContext, approver);
        const last = await multiplexer.lastPublishedMerkleData();
        const rewards = await fetch_rewards(s3, last.root);
        const m = MultiMerkle.fromMerkleRewards(last.cycle.toNumber(), rewards);
        const _s = signers[3];
        const caddress = _.keys(m.merkleRewards.claims).find((c) => c === _s.address)!;
        const c = m.merkleRewards.claims[caddress]!;
        const shares = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).sharesOf(_s.address)
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
        const newShares = await Promise.all(
            c.tokens.map((x) =>
                StakedToken__factory.connect(x, ethers.provider).sharesOf(_s.address)
            )
        );
        const expected = _.zip(shares, c.amounts).map(([b, c]) => b!.add(c!));
        expect(
            _.zip(newShares, expected).every(([n, e]) =>
                n!.sub(e!).lt(BigNumber.from(10).pow(n!.toString().length - 4))
            )
        ).to.eq(true);
    });
    it("test wait_for_time", async function () {
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
