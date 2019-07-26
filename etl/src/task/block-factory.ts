import { AccountId, Block as RawBlock, EventRecord } from '@plugnet/types';
import BN = require('bn.js');
import { BlockTask } from '../task/block-task';

export interface IBlockFee {
    baseFee: BN;
    byteFee: BN;
    transferFee: BN;
}

export interface ISessionInfo {
    sessionProgress: number;
    sessionLength: number;
    eraProgress: number;
    eraLength: number;
}

export interface IRawData {
    block: RawBlock;
    events: EventRecord[];
    blockFee: IBlockFee;
    validators: AccountId[];
    sessionInfo: ISessionInfo;
}

export type TaskHandler = (task: BlockTask, raw: IRawData) => void;

export class BlockFactory {
    private readonly handlers: TaskHandler[] = [];

    constructor(...handlers: TaskHandler[]) {
        this.handlers = this.handlers.concat(handlers);
    }

    public async build(rawData: IRawData): Promise<BlockTask> {
        const task = new BlockTask();

        for (const fn of this.handlers) {
            await fn(task, rawData);
        }
        await task.generateBalances();
        return task;
    }
}
