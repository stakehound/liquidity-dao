import winston, { Logger } from "winston";
import yargs from "yargs";

let _logger: Logger;

const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

if (process.env.NODE_ENV === "PRODUCTION") {
    const argv = yargs(process.argv.slice(2)).option("logfile", {
        type: "string",
        demandOption: true,
        describe: "logfile",
    }).argv;
    _logger = winston.createLogger({
        format,
        level: "info",
        transports: [
            new winston.transports.File({ filename: argv.logfile, level: "info" }),
        ],
    });
    _logger.info("logging mode: production");
} else if (process.env.NODE_ENV === "DEV_DEPLOY") {
    _logger = winston.createLogger({
        format,
        level: "info",
        transports: [
            new winston.transports.Console({ level: "info" }),
            new winston.transports.File({
                filename: `deploy-${new Date().toISOString()}.log`,
                level: "info",
            }),
        ],
    });
    _logger.info("logging mode: dev deploy");
} else if (process.env.NODE_ENV === "DEVELOPMENT") {
    const argv = yargs(process.argv.slice(2)).option("logfile", {
        type: "string",
        demandOption: true,
        describe: "logfile",
    }).argv;
    _logger = winston.createLogger({
        format,
        level: "info",
        transports: [
            new winston.transports.Console({ level: "info" }),
            new winston.transports.File({ filename: argv.logfile, level: "info" }),
        ],
    });
    _logger.info("logging mode: development");
} else {
    _logger = winston.createLogger({
        format,
        level: "info",
        transports: [new winston.transports.Console({ level: "info" })],
    });
    _logger.info("logging mode: testing");
}

const logger = _logger!;
export default logger;
