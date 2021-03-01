import * as z from "zod";
import { getAddress } from "ethers/lib/utils";

const distributionSchema = z.object({
    cycle: z.number(),
    rewards: z.record(z.string()),
    users: z.record(
        z.object({
            reward: z.record(z.string()),
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
    startBlock: z.string(),
    geysers: z.array(z.string().refine((x) => x === getAddress(x))),
    signer: z.string(),
    stTokens: z.array(z.string().refine((x) => x === getAddress(x))),
});

type DistrSchemaType = z.infer<typeof distributionSchema>;

type ConfSchemaType = z.infer<typeof confSchema>;

export { distributionSchema, confSchema, DistrSchemaType, ConfSchemaType };
