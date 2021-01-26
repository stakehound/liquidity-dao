import path from "path";
import yargs from "yargs";
import { readFileSync } from "fs";
import { StakehoundContext, run_propose, init_rewards, run_approve, run_init } from "./src/system";
import S3 from "aws-sdk/clients/s3";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet, Signer, providers } from "ethers";
import { fetchContext } from "./src/utils";
import { init_logger } from "./src/logger";



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
    .command("approve <config>", "run reward approver", (yargv) =>
        yargv.positional("config", {
            type: "string",
            demandOption: true,
            describe: "JSON file to read config",
        })
    ).option('logfile', {
        type: 'string',
        demandOption: true,
        describe: 'logfile'
    })
    .demandCommand(1).argv;

init_logger(argv.logfile)

const run_with_context = (
    func: (context: StakehoundContext, signer: Signer) => Promise<void>
) => {
    fetchContext(argv.config!)
        .then((con) => func(con, con.signer))
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
};

if (argv._[0] === "propose") {
    run_with_context(run_propose);
} else if (argv._[0] === "init") {
    run_with_context(run_init);
} else if (argv._[0] === "approve") {
    run_with_context(run_approve);
}
