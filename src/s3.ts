import S3 from "aws-sdk/clients/s3";
import { MerkleRewards } from "./MultiMerkle";
import logger from "./logger";

const upload_rewards = (s3: S3, rewards: MerkleRewards) => {
    const data = JSON.stringify(rewards);
    const req: S3.PutObjectRequest = {
        Body: data,
        Key: `stakehound-rewards-${rewards.merkleRoot}.json`,
        Bucket: "stakehound",
    };
    // call S3 to retrieve upload file to specified bucket
    return new Promise<void>((res, rej) =>
        s3.upload(req, function (err, data) {
            if (err) {
                logger.error("upload_rewards: Error", err);
                rej();
            }
            if (data) {
                res();
            }
        })
    );
};

const fetch_rewards = (s3: S3, merkleRoot: string) => {
    const req: S3.GetObjectRequest = {
        Key: `stakehound-rewards-${merkleRoot}.json`,
        Bucket: "stakehound",
    };
    // call S3 to retrieve upload file to specified bucket
    return new Promise<MerkleRewards>((res, rej) =>
        s3.getObject(req, function (err, data) {
            if (err) {
                logger.error("fetch_rewards: Error", err);
                rej();
            }
            if (data) {
                if (!data.Body) {
                    logger.error("fetch_rewards: didn't get response body");
                    rej();
                    return;
                }
                res(JSON.parse(data.Body!.toString()));
            }
        })
    );
};

export { upload_rewards, fetch_rewards };
