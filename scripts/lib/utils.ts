import _ from 'lodash'
import { sleep } from "../../src/wait";
import { PopulatedTransaction, Signer, Wallet, BigNumber } from "ethers";
import { Awaited, AsyncOrSync } from "ts-essentials";
import { Provider } from "@ethersproject/providers";
import { HDKey } from "ethereum-cryptography/hdkey";
import * as bip39 from "bip39";
import { TokensMap, GeysersMap } from "../../src/types";
const delay_parallel_effects = <T>(funcs: (() => Promise<T>)[]) => {
    return Promise.all(funcs.map((f, i) => sleep(i * 50).then(f)));
};

const sign_transactions = async (
    signer: Signer,
    txs: AsyncOrSync<PopulatedTransaction>[],
    nonce?: number
) => {
    if (!nonce) {
        nonce = await signer.getTransactionCount();
    }
    const address = await signer.getAddress();
    const _txs = await Promise.all(txs).then((txs) =>
        Promise.all(
            txs
                .map((tx, i) => ({ ...tx, from: address, nonce: nonce! + i }))
                .map(
                    async (tx): Promise<PopulatedTransaction> => ({
                        ...tx,
                        gasLimit: tx.gasLimit || (await signer.estimateGas(tx)),
                        gasPrice: tx.gasPrice || (await signer.getGasPrice()),
                        chainId: tx.chainId || (await signer.getChainId()),
                    })
                )
        )
    );
    const out = await Promise.all(_txs.map((tx) => signer.signTransaction(tx)));
    return out;
};

const send_transactions = async (provider: Provider, txs: AsyncOrSync<string[]>) => {
    const _txs = await txs;
    return Promise.all(_txs.map((tx) => provider.sendTransaction(tx)));
};

const wait_for_confirmed = async (
    txrs: Awaited<ReturnType<typeof send_transactions>>,
    confirmations: number = 1
) => {
    return Promise.all(txrs.map((txr) => txr.wait(confirmations)));
};

const get_signers = async (mnemonic: string, provider: Provider) => {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const privKeys = [];
    for (let i = 0; i < 20; i++) {
        privKeys.push(hdkey.derive(`m/44'/60'/0'/0/${i.toString()}`));
    }
    return privKeys.map((x) => {
        return new Wallet(x.privateKey!, provider);
    });
};

const sequentialize = <T>(funcs: (() => Promise<T>)[]) => {
    let p: Promise<T[] | void> = Promise.resolve();
    for (const f of funcs) {
        p = p.then((acc) =>
            f().then((out) => {
                if (acc) {
                    acc.push(out);
                    return acc
                }
                return [out];
            })
        );
    }
    return p.then(out => out || []);
};

const signal_token_locks = async (
    locker: Signer,
    tokens: TokensMap,
    geysers: GeysersMap,
    distr: { [geyser: string]: { [tokenAddress: string]: BigNumber } },
    startTime: number,
    durationSec: number
) => {
    const txs = await Promise.all(
        _.map(geysers, (geyser, geyserName) =>
            Promise.all(
                _.values(tokens).map((token, tokenName) =>
                    geyser.populateTransaction.signalTokenLock(
                        token.address,
                        distr[geyserName][tokenName],
                        durationSec,
                        startTime
                    )
                )
            )
        )
    ).then((all) => _.flatMap(all));
    const signed = await sign_transactions(locker, txs);
    const txrs = await send_transactions(locker.provider!, signed);
    await wait_for_confirmed(txrs);
};

const add_distribution_tokens = async (
    signer: Signer,
    geysers: GeysersMap,
    tokens: TokensMap
) => {
    const txs = await Promise.all(
        _.map(geysers, (geyser) =>
            Promise.all(
                _.values(tokens).map((token) =>
                    geyser.populateTransaction.addDistributionToken(token.address)
                )
            )
        )
    ).then((all) => _.flatten(all));
    const signed = await sign_transactions(signer, txs);
    const txrs = await send_transactions(signer.provider!, signed);
    await wait_for_confirmed(txrs);
};

export {
    add_distribution_tokens,
    signal_token_locks,
    delay_parallel_effects,
    sequentialize,
    sign_transactions,
    send_transactions,
    get_signers,
    wait_for_confirmed,
};
