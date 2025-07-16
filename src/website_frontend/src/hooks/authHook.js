import { useEffect, useState } from 'react';
import { website_backend } from '../../../declarations/website_backend';
import { nftwallet } from '../../../declarations/nftwallet';
import { AuthClient } from '@dfinity/auth-client';
import { Actor } from '@dfinity/agent';

export const useAuth = () => {
  const [authClient, setAuthClient] = useState(null);
  const [principalId, setPrincipalId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credit, setCredit] = useState(0);
  
  useEffect(() => {
    createAuthClient();
  }, []);

  const createAuthClient = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);
    await onIdentityUpdate(client);
  };

  const identityProvider = () => {
    const canisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
    if (!canisterId) return '';

    const network = process.env.DFX_NETWORK;
    if (network === 'local') {
      return `http://${canisterId}.localhost:4943`;
    } else if (network === 'ic') {
      return `https://${canisterId}.ic0.app`;
    }
    return `https://${canisterId}.dfinity.network`;
  };

  const onIdentityUpdate = async (client) => {
    if (!client) return;
    Actor.agentOf(website_backend)?.replaceIdentity(client.getIdentity());
    const isAuth = await client.isAuthenticated();
    if(isAuth) {
      const principal = await client.getIdentity().getPrincipal().toText();
      setPrincipalId(principal);
      console.log("principal :", principal);
      setIsLoggedIn(isAuth);
      getData();
    }
  };

  const Login = async () => {
    if (!authClient) return;
    await new Promise((resolve, reject) => 
      authClient.login({
        identityProvider: identityProvider(),
        onSuccess: resolve,
        onError: reject
      })
    );
    await onIdentityUpdate(authClient);
  };

  const Logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    await onIdentityUpdate(authClient);
    window.location.href = '/'
  };

  const getData = async () => {
    try {
      await website_backend.initialize_credit();
      const balance = await website_backend.get_balance();
      setCredit(balance);
      console.log("credit :", balance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return { authClient, principalId, credit, isLoggedIn, Login, Logout, refreshCredit: getData };
};




// import { useEffect, useState } from 'react';
// import { website_backend } from '../../../declarations/website_backend';
// import { nftwallet } from '../../../declarations/nftwallet';
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
//     // console.log("principal :", principalId);
//     // console.log("credit :", credit);
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
//     setIsLoggedIn(isAuth);
//     if(isAuth) {
//       handleSubmit();
//       // const principal = await client.getIdentity().getPrincipal().toText();
//       // setPrincipalId(principal);
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

//   const handleSubmit = async () => {
//     try {
//       console.log('feth principal....')
//       await website_backend.initialize_credit();
//       const balance = await website_backend.get_balance();
//       setCredit(balance);
//     } catch (error) {
//       console.error('Error fetching balance:', error);
//     }
//   };

//   return { authClient, principalId, credit, isLoggedIn, Login, Logout };
// };