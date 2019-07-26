import Bluebird = require('bluebird');
import * as knex from 'knex';
import { config } from '../common/config';
import { Block } from '../domain/block.domain';
import { DataModel } from '../domain/data-model.domain';
import { TaskCollection } from '../task/task-collection';

let db: knex;
const _SCHEMA = config.get('db.schema') ?  config.get('db.schema') + '.' : '';

export function init() {
    if (db) {
        return;
    }
    db = knex({
        client: 'pg',
        connection: {
            host: config.get('db.host'),
            port: Number(config.get('db.port')),
            user: config.get('db.username'),
            password: config.get('db.password'),
            database: config.get('db.name'),
        },
    });
}

export async function saveBlockTasks(collect: TaskCollection) {
    const blocks = collect.getData('block');
    const transactions = collect.getData('transactions');
    const sessions = collect.getData('session');
    const balances = collect.getData('balances');
    const stakings = collect.getData('stakings');
    const extrinsics = collect.getData('extrinsics');
    const events = collect.getData('events');
    const contracts = collect.getData('contracts');
    const traces = collect.getData('traces');

    return db.transaction(async t => {
        try {
            const bIds = blocks.map(b => b.number);
            await t(_SCHEMA + 'block')
                .whereIn('number', bIds)
                .del();
            await t(_SCHEMA + 'transaction')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'session')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'balance')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'validator')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'extrinsic')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'event')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'contract')
                .whereIn('block_number', bIds)
                .del();
            await t(_SCHEMA + 'trace')
                .whereIn('block_number', bIds)
                .del();

            await t.insert(blocks).into(_SCHEMA + 'block');
            await t.insert(transactions).into(_SCHEMA + 'transaction');
            await t.insert(sessions).into(_SCHEMA + 'session');
            await t.insert(balances).into(_SCHEMA + 'balance');
            await t.insert(stakings).into(_SCHEMA + 'validator');
            await t.insert(extrinsics).into(_SCHEMA + 'extrinsic');
            await t.insert(events).into(_SCHEMA + 'event');
            await t.insert(contracts).into(_SCHEMA + 'contract');
            await t.insert(traces).into(_SCHEMA + 'trace');

            return t.commit();
        } catch (err) {
            return t.rollback(err);
        }
    });
}

export function getLatestBlock(): Bluebird<Block> {
    return db
        .select()
        .from(_SCHEMA + 'block')
        .orderBy('number', 'DESC')
        .limit(1)
        .then((r: object[]) => (r[0] ? DataModel.build(Block, r[0]) : null));
}