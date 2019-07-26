import { ApiPromise, WsProvider } from '@plugnet/api';
import { genAllQueries } from './utils/utils';

describe('Queries exist', () => {
    let api: ApiPromise;
    let chainQuries: string[];
    beforeAll(async () => {
        const endPoint = 'ws://127.0.0.1:9944';
        const provider = new WsProvider(endPoint);
        api = await ApiPromise.create(provider);
        chainQuries = genAllQueries(api);
    });

    describe('Api service', () => {
        it('getEvents', () => {
            const getEvents = ['system.events'];
            expect(chainQuries).toEqual(expect.arrayContaining(getEvents));
        });
        it('getBlockFee', () => {
            const getBlockFee = ['balances.transactionBaseFee', 'balances.transactionByteFee' , 'balances.transferFee'];
            expect(chainQuries).toEqual(expect.arrayContaining(getBlockFee));
        });
        it('getValidators', () => {
            const getValidators = ['session.validators'];
            expect(chainQuries).toEqual(expect.arrayContaining(getValidators));
        });
        it('getSessionInfo', () => {
            const getSessionInfo = [
                'session.sessionLength',
                'session.lastLengthChange',
                'session.currentIndex',
                'staking.lastEraLengthChange',
                'staking.sessionsPerEra',
            ];
            expect(chainQuries).toEqual(expect.arrayContaining(getSessionInfo));
        });
        it('getByteCode', () => {
            const getByteCode = ['contract.contractInfoOf', 'contract.codeStorage'];
            expect(chainQuries).toEqual(expect.arrayContaining(getByteCode));
        });
    });
});
