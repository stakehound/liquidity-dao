"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_propose = exports.run_approve = exports.approve_rewards = exports.bump_rewards = exports.init_rewards = void 0;
const lodash_1 = __importDefault(require("lodash"));
const calc_stakes_1 = require("./calc_stakes");
const s3_1 = require("./s3");
const MultiMerkle_1 = __importStar(require("./MultiMerkle"));
const ts_essentials_1 = require("ts-essentials");
const wait_1 = require("./wait");
//  Proposer
const init_rewards = async (context, proposer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer) };
    const { s3, provider, startBlock, multiplexer } = context;
    const last = await multiplexer.lastProposedMerkleData();
    ts_essentials_1.assert(last.cycle.toNumber() === 0, "init_rewards: system already initialized");
    let end = await provider.getBlock((await provider.getBlockNumber()) - 30);
    const latestConfirmedEpoch = startBlock.timestamp +
        Math.floor((end.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    let endTime;
    if (latestConfirmedEpoch - startBlock.timestamp > 0) {
        endTime = latestConfirmedEpoch;
    }
    else {
        endTime = startBlock.timestamp + context.epoch;
        end = await wait_1.wait_for_time(provider, endTime, context.rate);
    }
    ts_essentials_1.assert(end.number > startBlock.number && endTime - startBlock.timestamp > 0, "init_rewards: starting too early");
    const r = await calc_stakes_1.fetch_system_rewards(provider, context.geysers, startBlock.number, end.number, endTime, 1);
    const rewards = calc_stakes_1.sum_rewards([r, calc_stakes_1.parse_rewards_fixed(context.initDistribution)]);
    ts_essentials_1.assert(calc_stakes_1.validate_rewards(rewards), "init_rewards: new calculated rewards with init distribution did not validate");
    const merkle = MultiMerkle_1.default.fromRewards(rewards);
    ts_essentials_1.assert(lodash_1.default.keys(merkle.merkleRewards.claims).length > 0, "init_rewards: no claims, either no staking or too early");
    await s3_1.upload_rewards(s3, merkle.merkleRewards);
    const txr = await multiplexer
        .proposeRoot(merkle.root, merkle.root, merkle.cycle, startBlock.number, end.number)
        .then((x) => x.wait(1));
    logger.info(`Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`);
};
exports.init_rewards = init_rewards;
const bump_rewards = async (context, proposer, last, lastEnd, nextEnd) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer) };
    const { s3, provider, startBlock, multiplexer } = context;
    const fetchedLastRewards = await s3_1.fetch_rewards(s3, last.root);
    ts_essentials_1.assert(last.root === fetchedLastRewards.merkleRoot, "bump_rewards: last published start block does not match last start block");
    const lastEndTime = startBlock.timestamp +
        Math.floor((lastEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    const r = await calc_stakes_1.fetch_system_rewards(provider, context.geysers, startBlock.number, lastEnd.number, lastEndTime, last.cycle.toNumber());
    const calcLastRewards = calc_stakes_1.sum_rewards([
        r,
        calc_stakes_1.parse_rewards_fixed(context.initDistribution),
    ]);
    ts_essentials_1.assert(calc_stakes_1.validate_rewards(calcLastRewards), "bump_rewards: validate last rewards with initial distribution failed");
    const calcMerkle = MultiMerkle_1.default.fromRewards(calcLastRewards);
    ts_essentials_1.assert(calcMerkle.root === last.root, "bump_rewards last reward root and calculated reward root failed to match");
    ts_essentials_1.assert(MultiMerkle_1.compare_merkle_rewards(calcMerkle.merkleRewards, fetchedLastRewards), "bump_rewards: fetched last rewards and calculated last rewards failed to match");
    const nextEndTime = startBlock.timestamp +
        Math.floor((nextEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    const newRewards = await calc_stakes_1.play_system_rewards(r, provider, context.geysers, startBlock.number, nextEnd.number, lastEndTime, nextEndTime);
    const newWithInit = calc_stakes_1.sum_rewards([
        newRewards,
        calc_stakes_1.parse_rewards_fixed(context.initDistribution),
    ]);
    ts_essentials_1.assert(calc_stakes_1.validate_rewards(newWithInit), "bump_rewards: new calculated rewards with init distribution did not validate");
    const merkle = MultiMerkle_1.default.fromRewards(newWithInit);
    await s3_1.upload_rewards(s3, merkle.merkleRewards);
    const txr = await multiplexer
        .proposeRoot(merkle.root, merkle.root, merkle.cycle, startBlock.number, nextEnd.timestamp)
        .then((x) => x.wait(1));
    logger.info(`Proposed merkle root ${merkle.merkleRewards.merkleRoot} with tx ${txr.transactionHash}`);
    return multiplexer.lastProposedMerkleData();
};
exports.bump_rewards = bump_rewards;
// Approver
const approve_rewards = async (context, approver) => {
    context = { ...context, multiplexer: context.multiplexer.connect(approver) };
    const { s3, provider, startBlock, multiplexer } = context;
    const published = await multiplexer.lastPublishedMerkleData();
    const proposed = await multiplexer.lastProposedMerkleData();
    logger.info(`approve:\nlast proposed: ${proposed.cycle.toNumber()}\nlast published ${published.cycle.toNumber()}`);
    ts_essentials_1.assert(published.cycle.lt(proposed.cycle), "approve_rewards: proposed cycle not greater than last published cycle");
    const proposedStart = await provider.getBlock(proposed.startBlock.toNumber());
    const proposedEnd = await provider.getBlock(proposed.endBlock.toNumber());
    const endTime = startBlock.timestamp +
        Math.floor((proposedEnd.timestamp - startBlock.timestamp) / context.epoch) *
            context.epoch;
    ts_essentials_1.assert(proposedStart.number === startBlock.number, "approve_rewards: proposed published start block does not match contextured start block");
    const r = await calc_stakes_1.fetch_system_rewards(provider, context.geysers, startBlock.number, proposedEnd.number, endTime, proposed.cycle.toNumber());
    const calcedRewards = calc_stakes_1.sum_rewards([
        r,
        calc_stakes_1.parse_rewards_fixed(context.initDistribution),
    ]);
    ts_essentials_1.assert(calc_stakes_1.validate_rewards(calcedRewards), "approve_rewards: calculated rewards with init distribution did not validate");
    const merkle = MultiMerkle_1.default.fromRewards(calcedRewards);
    const fetchedRewards = await s3_1.fetch_rewards(s3, proposed.root);
    ts_essentials_1.assert(merkle.root === proposed.root, "approve_rewards: calculated root does not match proposed");
    ts_essentials_1.assert(MultiMerkle_1.compare_merkle_rewards(fetchedRewards, merkle.merkleRewards), "approve_rewards: fetched rewards did not match calculated");
    const txr = await multiplexer
        .approveRoot(merkle.root, merkle.root, merkle.cycle, startBlock.number, proposedEnd.number)
        .then((x) => x.wait(1));
    logger.info(`Approving merkle root ${merkle.root} ${txr.transactionHash}`);
    return true;
};
exports.approve_rewards = approve_rewards;
const try_propose = async (context, proposer) => {
    context = { ...context, multiplexer: context.multiplexer.connect(proposer) };
    const { provider, startBlock, multiplexer } = context;
    const current = await provider.getBlockNumber();
    let last = await multiplexer.lastPublishedMerkleData();
    let lastConfirmed = await multiplexer.lastPublishedMerkleData({
        blockTag: current - 30,
    });
    if (!lodash_1.default.isEqual(last, lastConfirmed)) {
        await wait_1.wait_for_block(provider, current, context.rate); // waits 30 confirmations
        lastConfirmed = await multiplexer.lastPublishedMerkleData({
            blockTag: current,
        });
    }
    last = await multiplexer.lastPublishedMerkleData();
    ts_essentials_1.assert(lodash_1.default.isEqual(last, lastConfirmed), "run_propose: abnormalities in last published merkle data, another proposer is running?");
    const lastEnd = await provider.getBlock(last.endBlock.toNumber());
    const nextEndTime = // since it's complicated because of contract logic to make cycles perfectly match up with epochs
     startBlock.timestamp +
        (Math.floor((lastEnd.timestamp - startBlock.timestamp) / context.epoch) + 1) *
            context.epoch;
    const nextEnd = await wait_1.wait_for_time(provider, nextEndTime, context.rate);
    const propose = await bump_rewards(context, proposer, last, lastEnd, nextEnd);
    const fromEvent = await wait_1.wait_for_next_proposed(provider, multiplexer, context.rate, last.cycle.toNumber());
    ts_essentials_1.assert(lodash_1.default.isEqual(propose, fromEvent), "run_propose: proposed root does not match root from event, another proposer is running?");
    return true;
};
const run_propose = async (context, proposer) => {
    while (true) {
        try {
            const success = await Promise.race([
                try_propose(context, proposer),
                wait_1.sleep(1000 * (context.epoch + 60 * 10)).then(() => false),
            ]);
            if (!success) {
                throw new Error("propose took too long");
            }
        }
        catch (e) {
            console.error(`run_propose: ${e}`);
            await wait_1.sleep(1000 * 60 * 10); // try again in ten minutes
        }
    }
};
exports.run_propose = run_propose;
const run_approve = async (context, approver) => {
    while (true) {
        try {
            const success = await Promise.race([
                approve_rewards(context, approver),
                wait_1.sleep(1000 * (context.epoch + 60 * 10)).then(() => false),
            ]);
            if (!success) {
                throw new Error("approve took too long");
            }
        }
        catch (e) {
            console.error(`run_approve: ${e}`);
            await wait_1.sleep(1000 * 60 * 10); // try again in ten minutes
        }
    }
};
exports.run_approve = run_approve;
