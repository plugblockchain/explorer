import { ApiPromise, WsProvider } from '@plugnet/api';
import { genAllExtrinsics } from './utils/utils';

describe('Extrinsics exist', () => {
    let api: ApiPromise;
    let chainExtrinsics: string[];
    beforeAll(async () => {
        const endPoint = 'ws://127.0.0.1:9944';
        const provider = new WsProvider(endPoint);
        api = await ApiPromise.create(provider);
        chainExtrinsics = genAllExtrinsics(api);
    });

    it('Transaction Extrinsics', () => {
        const txExtrinsics = ['balances.transfer', 'contract.call'];
        expect(chainExtrinsics).toEqual(expect.arrayContaining(txExtrinsics));
    });
});
