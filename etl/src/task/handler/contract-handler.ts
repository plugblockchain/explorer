import { AccountId } from '@plugnet/types';
import { plainToClass } from 'class-transformer';
import { config } from '../../common/config';
import { getEventType, getExtrinsicType } from '../../common/util';
import { Contract } from '../../domain/contract.domain';
import { Trace } from '../../domain/trace.domain';
import { Transaction, TransactionType } from '../../domain/transaction.domain';
import * as apiService from '../../service/api.service';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export async function contractHandler(task: BlockTask, raw: IRawData) {
    const assetId = config.get('assetId', 16000);
    const { block, events } = raw;
    const filtered = raw.events.filter(e => getEventType(e) === 'contract.Instantiated');
    const byteCodes = await Promise.all(
        filtered.map(e => apiService.getByteCode(e.event.data[1] as AccountId)),
    );

    // tslint:disable-next-line: forin
    for (const i in filtered) {
        const e = filtered[i];
        const idx = e.phase.value.toString();
        const ex = block.extrinsics[idx];
        const contract = plainToClass(Contract, {
            address: e.event.data[1].toString(),
            blockNumber: task.block.number,
            timestamp: task.block.timestamp,
            endowment: ex.args[0].toString(),
            gasLimit: ex.args[1].toString(),
            codeHash: ex.args[2].toString(),
            data: ex.args[3].toString(),
            creator: e.event.data[0].toString(),
            byteCode: byteCodes[i],
            fee: null, // need to find out the fee
            name: null,
        });
        task.addContract(contract);
    }

    // contract call
    for (const [idx, ex] of block.extrinsics.entries()) {
        const exType = getExtrinsicType(ex);
        if (exType !== 'contract.call') {
            continue;
        }
        const size = ex.toU8a().byteLength;
        const transfertEvent = events.find(
            e =>
                getEventType(e) === 'contract.Transfer' &&
                Number(e.phase.value.toString()) === idx,
        );
        const txn = plainToClass(Transaction, {
            hash: ex.hash.toString(),
            blockNumber: task.block.number,
            blockHash: task.block.hash,
            fromAddress: ex.signature.signer.toString(),
            toAddress: ex.args[0].toString(),
            value: ex.args[1].toString(),
            fee: null, // need to find out the fee
            nonce: ex.signature.nonce.toNumber(),
            size,
            status: !!transfertEvent,
            timestamp: task.block.timestamp,
            assetId,
            gasLimit: Number(ex.args[2].toString()),
            index: idx,
            type: TransactionType.Contract,
            data: ex.args[3].toString(),
        });
        task.addTransaction(txn);

        // internal transaction
        for (const [traceIdx, e] of events
            .filter(E => Number(E.phase.value.toString()) === idx)
            .entries()) {
            if (e === transfertEvent || getEventType(e) !== 'contract.Transfer') {
                continue;
            }
            task.addTrace(
                plainToClass(Trace, {
                    transactionHash: txn.hash,
                    fromAddress: e.event.data[0].toString(),
                    toAddress: e.event.data[1].toString(),
                    value: e.event.data[2].toString(),
                    assetId,
                    blockNumber: task.block.number,
                    timestamp: task.block.timestamp,
                    index: traceIdx,
                    blockHash: task.block.hash,
                }),
            );
        }
    }
}
