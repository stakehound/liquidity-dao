import yargs from "yargs";
import {
    StakehoundContext,
    run_propose,
    run_approve,
    run_init,
    run_force_approve,
    run_force_propose,
} from "./src/system";
import { Signer, } from "ethers";
import { fetchContext } from "./src/utils";
import logger from "./src/logger";

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
    )
    .command("force-propose <config>", "run reward proposer once, don't validate", (yargv) =>
        yargv.positional("config", {
            type: "string",
            demandOption: true,
            describe: "JSON file to read config",
        })
    )
    .command("force-approve <config>", "run reward approver once, don't validate", (yargv) =>
        yargv.positional("config", {
            type: "string",
            demandOption: true,
            describe: "JSON file to read config",
        })
    )
    .option("logfile", {
        type: "string",
        demandOption: true,
        describe: "logfile",
    })
    .demandCommand(1).argv;

const run_with_context = (
    func: (context: StakehoundContext, signer: Signer) => Promise<void>
) => {
    fetchContext(argv.config!)
        .then((con) => {
            logger.info({
                role: argv._[0],
                epoch: `${con.epoch / 60} minutes`,
            });
            return func(con, con.signer);
        })
        .then(() => process.exit(0))
        .catch((error) => {
            logger.error(error);
            process.exit(1);
        });
};

if (argv._[0] === "propose") {
    run_with_context(run_propose);
} else if (argv._[0] === "init") {
    run_with_context(run_init);
} else if (argv._[0] === "approve") {
    run_with_context(run_approve);
} else if (argv._[0] === "force-approve") {
    run_with_context(run_force_approve);
} else if (argv._[0] === "force-propose") {
    run_with_context(run_force_propose);
}
