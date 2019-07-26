import { ApiPromise, WsProvider } from '@plugnet/api';
import { genAllEvents } from './utils/utils';

describe('Events exist', () => {
    let api: ApiPromise;
    let chainEvents: string[];
    beforeAll(async () => {
        const endPoint = 'ws://127.0.0.1:9944';
        const provider = new WsProvider(endPoint);
        api = await ApiPromise.create(provider);
        chainEvents = genAllEvents(api);
    });

    it('General Events', () => {
        const generalEvents = ['system.ExtrinsicSuccess'];
        expect(chainEvents).toEqual(expect.arrayContaining(generalEvents));
    });

    it('Transaction Events', () => {
        const transactionEvents = ['balances.Trasfer'];
        expect(chainEvents).toEqual(expect.arrayContaining(transactionEvents));
    });

    it('Contract Events', () => {
        const contractEvents = ['contract.Instantiated, contract.Transfer'];
        expect(chainEvents).toEqual(expect.arrayContaining(contractEvents));
    });

    it('Staking Events', () => {
        const stakingEvents = ['staking.Reward', 'staking.OfflineSlash', 'staking.OfflineWarning'];
        expect(chainEvents).toEqual(expect.arrayContaining(stakingEvents));
    });

});