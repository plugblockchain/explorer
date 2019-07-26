import { ApiPromise, WsProvider } from '@plugnet/api';

describe('Transaction etracted correctly', () => {
    let api: ApiPromise;
    beforeAll(async () => {
        const endPoint = 'ws://127.0.0.1:9944';
        const provider = new WsProvider(endPoint);
        api = await ApiPromise.create(provider);
    });
    // TODO
    // Submit transaction and verify
});