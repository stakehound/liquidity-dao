import { deploy_test_scenario } from "./lib/test-scenario";
import logger from "../../src/logger";

init_logger(`deploy_logs_${new Date().toISOString()}.log`);

deploy_test_scenario(true)
    .then(() => process.exit(0))
    .catch((error) => {
        logger.error(error);
        process.exit(1);
    });
