import { useEffect, useState } from 'react';
import { idlFactory as website_backend_idl, canisterId as website_backend_id } from '../../../declarations/website_backend';
import { idlFactory as website_icp_ledger_idl, canisterId as website_icp_ledger_id } from '../../../declarations/icp_ledger';
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from '@dfinity/principal';

export const useAuth = () => {
  const [principalId, setPrincipalId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credit, setCredit] = useState(0);
  const [actor, setActor] = useState(null);
  const [actoricp, setActoricp] = useState(null);

  const whitelist = [website_backend_id];

  useEffect(() => {
      const init = async () => {
        const isConnected = await window.ic?.plug?.isConnected();
        const hasAgent = window.ic?.plug?.agent;
        if (isConnected && hasAgent) {
          console.log('🔄 Sudah terkoneksi sebelumnya. Mengambil principal & build actor...');
          const principal = await window.ic.plug.agent.getPrincipal();
          setPrincipalId(principal.toText());
          setIsLoggedIn(true);
          await buildActor();
          return;
        }

        console.log('🆕 Belum terkoneksi. Menjalankan initPlug...');
        // await initPlug();
      };
      init();
  }, []);

  const initPlug = async () => {
    console.log("🔌 initPlug jalan bang");
    if (!window.ic?.plug) {
    console.warn("🔌 Plug wallet extension not detected.");
    return;
    }
    const connected = await window.ic.plug.isConnected();
    console.log("🔌 Plug isConnected:", connected);

    if (!connected) {
      console.log("🔐 Not connected. Requesting connection...");
      await window.ic.plug.requestConnect({
        whitelist,
        onConnectionUpdate: async () => {
          console.log("🔄 Account switched, rebuilding actor...");
          await buildActor();
        }
      });
    }

    const principal = await window.ic.plug.agent.getPrincipal();
    setPrincipalId(principal.toText());
    setIsLoggedIn(true);
    console.log("✅ Connected as:", principal.toText());

    await buildActor();

    window.ic.plug.onExternalDisconnect(() => {
      console.warn("🔌 Disconnected externally");
      setPrincipalId('');
      setIsLoggedIn(false);
      setCredit(0);
      setActor(null);
      window.location.href = '/';
    });
  };


  const buildActor = async () => {
    const newActor = await window.ic.plug.createActor({
      canisterId: website_backend_id,
      interfaceFactory: website_backend_idl,
    });
    const newActoricp = await window.ic.plug.createActor({
      canisterId: website_icp_ledger_id,
      interfaceFactory: website_icp_ledger_idl,
    });
    setActor(newActor);
    setActoricp(newActoricp);
    console.log("🎭 Actor built:", newActor);
    console.log("🎭 Actor built:", newActoricp);
    await refreshCredit(newActor);
  };

  const Login = async () => {
    await initPlug();
  };

  const Logout = async () => {
    if (window.ic?.plug) {
      await window.ic.plug.disconnect();
      setPrincipalId('');
      setIsLoggedIn(false);
      setCredit(0);
      setActor(null);
      window.location.href = '/';
    }
  };

  const refreshCredit = async (customActor = actor) => {
    if (!customActor) return;
    try {
      await customActor.initialize_credit();
      const balance = await customActor.get_balance();
      setCredit(Number(balance));
      console.log("💰 Credit:", balance.toString());
    } catch (error) {
      console.error('⚠ Error fetching credit:', error);
    }
  };
  const TopupCredit = async (amount, type = "credit") => {
    if (!actor) return;
    try {
      const memo = 1311;
      console.log('💳 Topping up credit...');

      // 1. Ambil principal string dari canister
      const canisterPrincipalStr = await actor.get_account_id_for_canister();
      console.log('Canister Principal String:', canisterPrincipalStr);

      // 2. Konversi ke Principal
      const canisterPrincipal = Principal.fromText(canisterPrincipalStr);

      // 3. Buat AccountIdentifier dari Principal
      const accountIdentifier = AccountIdentifier.fromPrincipal({
        principal: canisterPrincipal
      });

      const toAccount = Array.from(accountIdentifier.toUint8Array());

      // 4. Timestamp nanos
      const now = BigInt(Date.now()) * 1_000_000n;

      // 5. Kirim ICP
      const result = await actoricp.transfer({
        to: toAccount,
        fee: { e8s: 10_000n },
        memo: BigInt(memo),
        from_subaccount: [],
        created_at_time: [{ timestamp_nanos: now }],
        amount: { e8s: BigInt(amount) },
      });

      // const data = await actoricp.query_blocks({
      //   start : result.Ok,
      //   length: 1,
      // })

      // console.log("📦 Transaction data:", data);

      console.log("✅ Transfer result:", result.Ok);

      //Validasi transaksi
      const validate_transaction = await actor.get_tx_summary(result.Ok , memo);
      console.log('Transaction Summary:', JSON.parse(validate_transaction));

      await refreshCredit();
      console.log('✅ Credit topped up successfully!');
    } catch (error) {
      console.error('⚠ Error topping up credit:', error);
    }
  };

  return {
    principalId,
    credit,
    isLoggedIn,
    Login,
    Logout,
    refreshCredit,
    actor,
    TopupCredit
  };
};

















// import { useEffect, useState } from 'react';
// import { website_backend } from '../../../declarations/website_backend';
// import { AuthClient } from '@dfinity/auth-client';
// import { Actor } from '@dfinity/agent';

// export const useAuth = () => {
//   const [authClient, setAuthClient] = useState(null);
//   const [principalId, setPrincipalId] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [credit, setCredit] = useState(0);
  
//   useEffect(() => {
//     createAuthClient();
//   }, []);

//   const createAuthClient = async () => {
//     const client = await AuthClient.create();
//     setAuthClient(client);
//     await onIdentityUpdate(client);
//   };

//   const identityProvider = () => {
//     const canisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
//     if (!canisterId) return '';

//     const network = process.env.DFX_NETWORK;
//     if (network === 'local') {
//       return `http://${canisterId}.localhost:4943`;
//     } else if (network === 'ic') {
//       return `https://${canisterId}.ic0.app`;
//     }
//     return `https://${canisterId}.dfinity.network`;
//   };

//   const onIdentityUpdate = async (client) => {
//     if (!client) return;
//     Actor.agentOf(website_backend)?.replaceIdentity(client.getIdentity());
//     const isAuth = await client.isAuthenticated();
//     if(isAuth) {
//       const principal = await client.getIdentity().getPrincipal().toText();
//       setPrincipalId(principal);
//       console.log("principal :", principal);
//       setIsLoggedIn(isAuth);
//       getData();
//     }
//   };

//   const Login = async () => {
//     if (!authClient) return;
//     await new Promise((resolve, reject) => 
//       authClient.login({
//         identityProvider: identityProvider(),
//         onSuccess: resolve,
//         onError: reject
//       })
//     );
//     await onIdentityUpdate(authClient);
//   };

//   const Logout = async () => {
//     if (!authClient) return;
//     await authClient.logout();
//     await onIdentityUpdate(authClient);
//     window.location.href = '/'
//   };

//   const getData = async () => {
//     try {
//       await website_backend.initialize_credit();
//       const balance = await website_backend.get_balance();
//       setCredit(balance);
//       console.log("credit :", balance.toString());
//     } catch (error) {
//       console.error('Error fetching balance:', error);
//     }
//   };

//   return { authClient, principalId, credit, isLoggedIn, Login, Logout, refreshCredit: getData };
// };




// // import { useEffect, useState } from 'react';
// // import { website_backend } from '../../../declarations/website_backend';
// // import { AuthClient } from '@dfinity/auth-client';
// // import { Actor } from '@dfinity/agent';

// // export const useAuth = () => {
// //   const [authClient, setAuthClient] = useState(null);
// //   const [principalId, setPrincipalId] = useState('');
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [credit, setCredit] = useState(0);
  
// //   useEffect(() => {
// //     createAuthClient();
// //   }, []);

  
// //   const createAuthClient = async () => {
// //     const client = await AuthClient.create();
// //     setAuthClient(client);
// //     await onIdentityUpdate(client);
// //     // console.log("principal :", principalId);
// //     // console.log("credit :", credit);
// //   };

// //   const identityProvider = () => {
// //     const canisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
// //     if (!canisterId) return '';

// //     const network = process.env.DFX_NETWORK;
// //     if (network === 'local') {
// //       return `http://${canisterId}.localhost:4943`;
// //     } else if (network === 'ic') {
// //       return `https://${canisterId}.ic0.app`;
// //     }
// //     return `https://${canisterId}.dfinity.network`;
// //   };

// //   const onIdentityUpdate = async (client) => {
// //     if (!client) return;
// //     Actor.agentOf(website_backend)?.replaceIdentity(client.getIdentity());
// //     const isAuth = await client.isAuthenticated();
// //     setIsLoggedIn(isAuth);
// //     if(isAuth) {
// //       handleSubmit();
// //       // const principal = await client.getIdentity().getPrincipal().toText();
// //       // setPrincipalId(principal);
// //     }
// //   };

// //   const Login = async () => {
// //     if (!authClient) return;
// //     await new Promise((resolve, reject) => 
// //       authClient.login({
// //         identityProvider: identityProvider(),
// //         onSuccess: resolve,
// //         onError: reject
// //       })
// //     );
// //     await onIdentityUpdate(authClient);
// //   };

// //   const Logout = async () => {
// //     if (!authClient) return;
// //     await authClient.logout();
// //     await onIdentityUpdate(authClient);
// //     window.location.href = '/'
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       console.log('feth principal....')
// //       await website_backend.initialize_credit();
// //       const balance = await website_backend.get_balance();
// //       setCredit(balance);
// //     } catch (error) {
// //       console.error('Error fetching balance:', error);
// //     }
// //   };

// //   return { authClient, principalId, credit, isLoggedIn, Login, Logout };
// // };