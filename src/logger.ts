import winston, { Logger } from "winston";

let logger: Logger = undefined as any;

const init_logger = (filename?: string) => {
    logger = winston.createLogger({
        transports: filename
            ? [
                  new winston.transports.Console(),
                  new winston.transports.File({ filename }),
              ]
            : [new winston.transports.Console()],
    });
};

export { init_logger }

export default logger;
