import * as Client from '@storacha/client'
import { StoreMemory } from '@storacha/client/stores/memory'
import * as Proof from '@storacha/client/proof'
import { Signer } from '@storacha/client/principal/ed25519'

let clientInstance = null;

export const getStorachaClient = async () => {
    console.log("Initializing Storacha client...");
    // console.log("process.env.KEY", process.env.CANISTER_KEY);
    // console.log("process.env.PROOF", process.env.CANISTER_PROOF);
    if (clientInstance) return clientInstance;

    const principal = Signer.parse(process.env.CANISTER_KEY);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });
    const proof = await Proof.parse(process.env.CANISTER_PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    clientInstance = client;
    console.log("Storacha client initialized with space:", space.did());
    return client;
};

export const uploadBlobToStoracha = async (file) => {
    const client = await getStorachaClient();
    console.log("client jalan bang");
    const result = await client.uploadFile(file);
    console.log("result jalan bang");
    return result;
};