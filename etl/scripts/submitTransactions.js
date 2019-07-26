// Run setBalance.js if not enough balance
const { ApiPromise, WsProvider } = require('@plugnet/api');
const testKeyring = require('@plugnet/keyring/testing');
const { randomAsU8a } = require('@plugnet/util-crypto');

const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const AMOUNT = 5000;

main().catch(console.error);

async function main() {
    const provider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create(provider);

    const keyring = testKeyring.default();
    const nonce = await api.query.system.accountNonce(ALICE);
    const alicePair = keyring.getPair(ALICE);

    const recipient = keyring.addFromSeed(randomAsU8a(32)).address;

    console.log(
        'Sending',
        AMOUNT,
        'from',
        alicePair.address,
        'to',
        recipient,
        'with nonce',
        nonce.toString(),
    );

    api.tx.balances
        .transfer(recipient, AMOUNT)
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
