const { ApiPromise, WsProvider } = require('@plugnet/api');
const testKeyring = require('@plugnet/keyring/testing');

const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const FREE = 10000000;
const RESERVED = 10000000;

main().catch(console.error);

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create(provider);

    const keyring = testKeyring.default();
    const nonce = await api.query.system.accountNonce(ALICE);
    const alicePair = keyring.getPair(ALICE);

    console.log(
        'Setting balance amount free',
        FREE,
        'reserved',
        RESERVED,
        'for',
        alicePair.address,
        'with nonce',
        nonce.toString(),
    );

    api.tx.sudo
        .sudo(api.tx.balances.setBalance(alicePair.address, FREE, RESERVED))
        .sign(alicePair, { nonce })
        .send(({ events = [], status }) => {
            console.log('Transaction status:', status.type);

            if (status.isFinalized) {
                console.log('Completed at block hash', status.asFinalized.toHex());
                console.log('Events:');

                events.forEach(({ phase, event: { data, method, section } }) => {
                    console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                });
                process.exit();
            }
        });
}
