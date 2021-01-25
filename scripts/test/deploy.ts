import { deploy_test_scenario } from "./lib/test-scenario";

deploy_test_scenario()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

