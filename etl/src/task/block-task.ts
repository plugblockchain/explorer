import { Hash } from '@plugnet/types';
import { plainToClass } from 'class-transformer';
import { config } from '../common/config';
import { Balance } from '../domain/balance.domain';
import { Block } from '../domain/block.domain';
import { Contract } from '../domain/contract.domain';
import { Event } from '../domain/event.domain';
import { Extrinsic } from '../domain/extrinsic.domain';
import { Session } from '../domain/session.domain';
import { Staking, StakingType } from '../domain/staking.domain';
import { Trace } from '../domain/trace.domain';
import { Transaction } from '../domain/transaction.domain';
import * as apiService from '../service/api.service';

export class BlockTask {
    public block: Block;

    public readonly transactions: Transaction[] = [];
    public readonly session: Session[] = [];
    public readonly balances: Balance[] = [];
    public readonly stakings: Staking[] = [];
    public readonly contracts: Contract[] = [];
    public readonly traces: Trace[] = [];
    public readonly extrinsics: Extrinsic[] = [];
    public readonly events: Event[] = [];

    private changes = {};

    public addTransaction(tx: Transaction) {
        this.block.transactionCount++;
        this.transactions.push(tx);

        for (const acc of [tx.fromAddress, tx.toAddress]) {
            this.addChange(acc);
        }
    }

    public addExtrinsic(e: Extrinsic) {
        this.extrinsics.push(e);
    }

    public addEvent(e: Event) {
        this.events.push(e);
    }

    public addTrace(trace: Trace) {
        this.traces.push(trace);
        for (const acc of [trace.fromAddress, trace.toAddress]) {
            this.addChange(acc);
        }
    }

    public addContract(contract: Contract) {
        this.contracts.push(contract);
        this.addChange(contract.creator);
        this.addChange(contract.address);
    }

    public setSession(session: Session) {
        this.session.push(session);
    }

    public addStaking(staking: Staking) {
        this.stakings.push(staking);
        if (staking.event !== StakingType.Start) {
            this.addChange(staking.address);
        }
    }

    public get<T>(key: string): T[] {
        return this[key];
    }

    public async generateBalances() {
        const assetId = config.get('assetId', 16000);
        const blockHash = new Hash(this.block.hash);
        const balanceSearch = [];
        for (const acc of Object.keys(this.changes)) {
            balanceSearch.push({ address: acc });
        }

        const data = await Promise.all(
            balanceSearch.map(bal => apiService.getBalance(bal.address, blockHash)),
        );

        for (const [idx, value] of data.entries()) {
            const { address } = balanceSearch[idx];
            const b = plainToClass(Balance, {
                address,
                balance: value.free,
                blockNumber: this.block.number,
                assetId,
                reservedBalance: value.reserved,
            });
            this.balances.push(b);
        }
    }

    private addChange(addr: string) {
        if (this.changes[addr]) {
            if (!this.changes[addr].includes('')) {
                this.changes[addr].push('');
            }
        } else {
            this.changes[addr] = [''];
        }
    }
}
