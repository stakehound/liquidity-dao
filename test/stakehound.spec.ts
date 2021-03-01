import { expect, use } from "chai";
import HRE, { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import { Signer, BigNumber } from "ethers";
import _ from "lodash";
import {
    StakehoundGeyser,
    Multiplexer,
    StakedToken__factory,
    StakedToken,
} from "../typechain";

import geyserAbi from "../artifacts/contracts/stakehound-geyser/StakehoundGeyser.sol/StakehoundGeyser.json";
import stakedTokenAbi from "../src/abi/StakedToken.json";

import {
    wait_for_next_proposed,
    wait_for_block,
    wait_for_time,
    sleep,
} from "../src/wait";
import MultiMerkle from "../src/MultiMerkle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import S3 from "aws-sdk/clients/s3";
import { fetch_rewards } from "../src/s3";
import {
    approve_rewards,
    init_rewards,
    bump_rewards,
    StakehoundContext,
} from "../src/system";
import {
    deploy_test_scenario,
    DeployTestContext,
} from "../scripts/test/lib/test-scenario";
import { writeFileSync } from "fs";
const giface = new ethers.utils.Interface(
    geyserAbi.abi
) as StakehoundGeyser["interface"];
const siface = new ethers.utils.Interface(stakedTokenAbi) as StakedToken["interface"];

use(solidity);

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
        await HRE.network.provider.request({
            method: "evm_mine",
        });
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
        for (let i = 0; i < 80; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const geysers = _.keys(context.geysers);
        const proposeContext: StakehoundContext = {
            startBlock,
            multiplexer,
            initDistribution: {
                cycle: 0,
                rewards: {},
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

        writeFileSync("config.json", JSON.stringify(proposeContext));
        const ip = init_rewards(proposeContext, proposer);
        await sleep(1000);
        const ap = approve_rewards(proposeContext, approver);
        await sleep(3000);

        await HRE.network.provider.request({
            method: "evm_increaseTime",
            params: [30],
        });
        for (let i = 0; i < 180; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const i = await ip;
        const a = await ap;
        await Promise.all([a.tx.wait(1), i.tx.wait(1)]);
        const lastpub = await multiplexer.lastPublishedMerkleData();
        await HRE.network.provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [startBlock.timestamp + 60 * 60 * 24 * 2],
        });
        for (let i = 0; i < 180; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        await Promise.all([a.thirty, i.thirty]);
        // const waitP = wait_for_next_proposed(
        //     ethers.provider,
        //     multiplexer,
        //     lastpub.endBlock.toNumber(),
        //     lastpub.cycle.toNumber(),
        //     1000
        // );
        const ar1 = approve_rewards(proposeContext, approver);
        const bp = bump_rewards(proposeContext, proposer);
        await HRE.network.provider.request({
            method: "evm_increaseTime",
            params: [30],
        });
        for (let i = 0; i < 180; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const b = await bp;
        for (let i = 0; i < 180; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const a1 = await ar1;
        //await [a1.tx.wait(1), b.tx.wait(1)];
        //expect((await waitP).lastPropose.cycle.toNumber()).to.eq(
        //    lastpub.cycle.toNumber() + 1
        //);
        await HRE.network.provider.request({
            method: "evm_increaseTime",
            params: [30],
        });
        for (let i = 0; i < 180; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        await [a1.thirty, a.thirty, b.thirty, i.thirty];
        const last = await multiplexer.lastPublishedMerkleData();
        const rewards = await fetch_rewards(s3, last.root);
        const m = MultiMerkle.fromMerkleRewards(last.cycle.toNumber(), rewards);
        const _s = signers[4];
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
        for (let i = 0; i < 40; i++) {
            await HRE.network.provider.request({
                method: "evm_mine",
            });
        }
        const wb = await wp;
        expect(wb.timestamp).to.gte(wtime);
    });
});
