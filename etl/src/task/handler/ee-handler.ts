import { plainToClass } from 'class-transformer';
import { getEventType, getExtrinsicType } from '../../common/util';
import { Event } from '../../domain/event.domain';
import { Extrinsic } from '../../domain/extrinsic.domain';
import { IRawData } from '../block-factory';
import { BlockTask } from '../block-task';

export function eeHandler(task: BlockTask, raw: IRawData) {
    const { events, block } = raw;
    for (const [idx, ex] of block.extrinsics.entries()) {
        const exType = getExtrinsicType(ex).split('.');
        task.addExtrinsic(
            plainToClass(Extrinsic, {
                hash: ex.hash.toString(),
                blockNumber: task.block.number,
                blockHash: task.block.hash,
                args: ex.args.toString(),
                section: exType[0],
                method: exType[1],
                index: idx,
                signer: ex.signature.signer.toString(),
                meta: ex.meta.toString(),
            }),
        );
    }
    for (const ev of events) {
        const evType = getEventType(ev).split('.');
        task.addEvent(
            plainToClass(Event, {
                blockNumber: task.block.number,
                blockHash: task.block.hash,
                data: ev.event.data.toString(),
                section: evType[0],
                method: evType[1],
                extrinsicIndex: ev.phase.value.toString() ? ev.phase.value.toString() : null,
                meta: ev.event.meta.toString(),
            }),
        );
    }
}
