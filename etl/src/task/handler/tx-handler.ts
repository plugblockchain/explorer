import { plainToClass } from 'class-transformer';
import { config } from '../../common/config';
import { getEventType, getExtrinsicType, getTransactionFee } from '../../common/util';
import { Transaction, TransactionType } from '../../domain/transaction.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function txHandler(task: BlockTask, raw: IRawData) {
    const assetId = config.get('assetId', 16000);
    const { events, block, blockFee } = raw;
    const { baseFee, byteFee } = blockFee;

    for (const [idx, ex] of block.extrinsics.entries()) {
        const exType = getExtrinsicType(ex);
        if (exType !== 'balances.transfer') {
            continue;
        }

        const size = ex.toU8a().byteLength;
        const gaStatus = events.find(
            e =>
                getEventType(e) === 'system.ExtrinsicSuccess' &&
                Number(e.phase.value.toString()) === idx,
        );
        const ev = events.find(
            e =>
                getEventType(e) === 'balances.Transfer' &&
                Number(e.phase.value.toString()) === idx,
        );
        const txn = plainToClass(Transaction, {
            hash: ex.hash.toString(),
            blockNumber: task.block.number,
            blockHash: task.block.hash,
            fromAddress: ex.signature.signer.toString(),
            toAddress: ex.args[0].toString(),
            value: ex.args[1].toString(),
            fee:  getTransactionFee(baseFee.toNumber(), byteFee.toNumber(), size),
            nonce: ex.signature.nonce.toNumber(),
            size,
            status: !!gaStatus,
            timestamp: task.block.timestamp,
            assetId,
            gasLimit: null,
            index: idx,
            type: TransactionType.Normal,
            data: null,
        });
        task.addTransaction(txn);
    }
}