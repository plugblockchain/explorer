import { ApiPromise, WsProvider } from '@plugnet/api';
import { AccountId, Block, BlockNumber, EventRecord, Hash, Header, Option } from '@plugnet/types';
import { config } from '../common/config';
import { logger } from '../common/logger';
import { IBlockFee, ISessionInfo } from '../task/block-factory';

let api: ApiPromise;

export async function connect() {
    if (api) {
        return;
    }
    const uri = config.get('node.ws');
    try {
        const provider = new WsProvider(uri);
        api = await ApiPromise.create(provider);
    } catch (e) {
        process.exitCode = 1;
        logger.error(e.stack);
        throw new Error('Connection to node failed');
    }
}

export function subscribe(callback: (header: Header) => void) {
    return api.rpc.chain.subscribeNewHead(callback);
}

export async function getBlock(n?: number): Promise<Block> {
    const hash = n ? await api.rpc.chain.getBlockHash(n) : await api.rpc.chain.getBlockHash();
    return api.rpc.chain.getBlock(hash).then((r: any) => r.block);
}

export async function getEvents(blockHash: Hash): Promise<EventRecord[]> {
    return api.query.system.events.at(blockHash) as any;
}

export async function getBlockFee(blockHash: Hash): Promise<IBlockFee> {
    const [baseFee, byteFee, transferFee] = await Promise.all([
        api.query.balances.transactionBaseFee.at(blockHash) as any,
        api.query.balances.transactionByteFee.at(blockHash) as any,
        api.query.balances.transferFee.at(blockHash) as any,
    ]);

    return { baseFee, byteFee, transferFee };
}

export async function getBalance(
    address: AccountId,
    blockHash?: Hash,
): Promise<{ free: string; reserved: string }> {
    const [free, reserved] = await Promise.all([
        getFreeBalance(address, blockHash),
        getReservedBalance(address, blockHash),
    ]);
    return { free, reserved };
}

export async function getFreeBalance(
    address: AccountId,
    blockHash?: Hash,
): Promise<string> {
    return blockHash
        ? api.query.balances.freeBalance
              .at(blockHash, address)
              .then(balance => balance ? balance.toString() : '0')
        : api.query.balances.freeBalance(address).then(balance => balance ? balance.toString() : '0');
}

export async function getReservedBalance(
    address: AccountId,
    blockHash?: Hash,
): Promise<string> {
    return blockHash
        ? api.query.balances.reservedBalance
              .at(blockHash, address)
              .then(balance => balance ? balance.toString() : '0')
        : api.query.balances.reservedBalance(address).then(balance => balance ? balance.toString() : '0');
}

export async function getValidators(blockHash: Hash): Promise<AccountId[]> {
    return api.query.session.validators.at(blockHash) as any;
}

export async function getSessionInfo(blockHash: Hash, blockNumber: number): Promise<ISessionInfo> {
    const [
        rsessionLength,
        lastLengthChangeOpt,
        CurrentIndex,
        lastEraLengthChange,
        sessionsPerEra,
    ]: any = await Promise.all([
        api.query.session.sessionLength.at(blockHash),
        (api.query.session.lastLengthChange.at(blockHash) as unknown) as Option<BlockNumber>,
        api.query.session.currentIndex.at(blockHash),
        api.query.staking.lastEraLengthChange.at(blockHash),
        api.query.staking.sessionsPerEra.at(blockHash),
    ]);
    const sessionLength = rsessionLength.toNumber();
    const lastLengthChange = lastLengthChangeOpt.unwrapOr(0);
    const sessionProgress: number =
        (blockNumber - lastLengthChange + sessionLength) % sessionLength;
    const eraProgress: number =
        ((CurrentIndex.toNumber() - lastEraLengthChange.toNumber()) % sessionsPerEra.toNumber()) *
            sessionLength +
        sessionProgress;
    const eraLength: number = sessionLength * sessionsPerEra.toNumber();
    return { sessionProgress, sessionLength, eraProgress, eraLength };
}

export async function getByteCode(address: AccountId) {
    const codeHash: any = await api.query.contract.contractInfoOf(address);
    const result = await api.query.contract.codeStorage(codeHash.value.asAlive.codeHash.toString());
    return JSON.parse(result.toString());
}
