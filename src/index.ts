import * as z from "zod";
import yargs from "yargs";
import { readFileSync } from "fs";
import { Context, run_propose, approve_rewards, init_rewards } from "./system";
import S3 from "aws-sdk/clients/s3";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet, providers } from "ethers";
import { Multiplexer__factory } from "../typechain";
import { getAddress } from "ethers/lib/utils";

const distributionSchema = z.object({
    cycle: z.number(),
    rewards: z.record(z.string()),
    rewardsInRange: z.record(z.string()),
    rewardsDistributed: z.record(z.string()),
    rewardsDistributedInRange: z.record(z.string()),
    users: z.record(
        z.object({
            reward: z.record(z.string()),
            rewardInRange: z.record(z.string()),
        })
    ),
});
const confSchema = z.object({
    providerUrl: z.string().url(),
    credentials: z.object({
        accessKeyId: z.string(),
        secretAccessKey: z.string(),
    }),
    initDistributionPath: z.string(),
    rate: z.number(),
    epoch: z.number(),
    multiplexer: z.string().refine((x) => x === getAddress(x)),
    startBlock: z.number(),
    geysers: z.array(z.string().refine((x) => x === getAddress(x))),
    activeKey: z.string(),
});

const fetchContext = (configPath: string): Context => {
    const conf = confSchema.parse(
        JSON.parse(readFileSync(configPath).toString("utf8"))
    );
    const initDistribution = distributionSchema.parse(
        JSON.parse(readFileSync(conf.initDistributionPath).toString())
    );
    const provider = new JsonRpcProvider(conf.providerUrl);
    const s3 = new S3({ credentials: conf.credentials });
    const signer = new Wallet(conf.activeKey).connect(provider);
    const multiplexer = Multiplexer__factory.connect(conf.multiplexer, signer);
    return {
        epoch: conf.epoch,
        geysers: conf.geysers.sort(),
        startBlock: conf.startBlock,
        initDistribution,
        rate: conf.rate,
        credentials: conf.credentials,
        signer,
        provider,
        s3,
        multiplexer,
    };
};

const argv = yargs(process.argv.slice(2))
    .command("init <config>", "init first rewards", (yargv) =>
        yargv.positional("config", {
            type: "string",
            demandOption: true,
            describe: "JSON file to read config",
        })
    )
    .command("propose <config>", "run reward proposer", (yargv) =>
        yargv.positional("config", {
            type: "string",
            demandOption: true,
            describe: "JSON file to read config",
        })
    )
    .demandCommand(1).argv;

const run_with_context = (func: (context: Context) => Promise<void>) => {
    const con = fetchContext(argv.config!);
    func(con)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
};

if (argv._[0] === "propose") {
    run_with_context(run_propose);
} else if (argv._[0] === "init") {
    run_with_context(init_rewards);
} else if (argv._[0] === "approve") {
    run_with_context(approve_rewards);
}
