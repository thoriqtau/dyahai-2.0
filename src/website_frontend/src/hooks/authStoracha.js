import * as Client from '@storacha/client'
import { StoreMemory } from '@storacha/client/stores/memory'
import * as Proof from '@storacha/client/proof'
import { Signer } from '@storacha/client/principal/ed25519'
import { CID } from 'multiformats/cid'

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

export const removeAllContentFromStoracha = async () => {
    const client = await getStorachaClient();

    console.log("Mengambil semua konten dari space...");
    const contents = await client.capability.upload.list({ cursor: '', size: 5 }); // Dapatkan semua content yang terdaftar
    console.log("Ditemukan konten:", contents);
    console.log("Ditemukan konten:", contents.results);
    console.log("ke 0", contents.results[0].root.bytes);

    if (contents.size === 0) {
        console.log("Tidak ada konten yang ditemukan.");
        return;
    }


    for (const content of contents.results) {
        const rootBytes = content.root;

        const rootLink = CID.decode(rootBytes).link();
        console.log("rootLink", rootLink);

        try {
            await client.remove(rootLink, { shards: true });
            console.log(`✅ Berhasil hapus content CID: ${rootLink}`);
        } catch (error) {
            console.error(`❌ Gagal hapus content CID: ${rootLink}, error`);
        }
    }

    console.log("🚮 Semua konten selesai dihapus.");
};
export const removeContentFromStoracha = async (id) => {
    console.log("id", id);
    const client = await getStorachaClient();
    const rootLink = CID.parse(id).link();
    console.log("rootLink", rootLink);
    try {
        await client.remove(rootLink, { shards: true });
        console.log(`✅ Berhasil hapus content CID: ${rootLink}`);
    } catch (error) {
        console.error(`❌ Gagal hapus content CID: ${rootLink}, error`);
    }
};