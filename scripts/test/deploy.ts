import { deploy_test_scenario } from "./lib/test-scenario";
import logger from "../../src/logger";

deploy_test_scenario(true)
    .then(() => process.exit(0))
    .catch((error) => {
        logger.error(error);
        process.exit(1);
    });
