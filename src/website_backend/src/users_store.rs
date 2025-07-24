use ic_cdk::{ init, storage,  query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use candid::Principal;


type UserStore = BTreeMap<Principal, UserData>;

use candid::{CandidType, Deserialize};

#[derive(Clone, CandidType, Deserialize)]
pub struct UserData {
    pub credits: Vec<u8>,
    pub tier: UserTier,
}




thread_local! {
    // Penyimpanan untuk Principal dan daftar gambar mereka
    static USERS_STORE: RefCell<UserStore> = RefCell::default();
}

#[init]
fn init() {
    // Inisialisasi kosong atau tindakan lain yang diperlukan
    ic_cdk::println!("Canister initialized.");
}


#[derive(Debug, CandidType, Deserialize, Clone, PartialEq)]
pub enum UserTier {
    Basic,
    Premium,
    Ultimate,
}



#[update]
pub fn save_user(principal: Principal) {
    let data = UserData {
        credits: vec![3],
        tier: UserTier::Basic, // Default tier
    };
    USERS_STORE.with(|user| {
        user.borrow_mut().insert(principal.clone(), data);
    });
    ic_cdk::println!("User Stored for principal: {}", principal);
}

// #[query]
// pub fn get_user_tier(principal: Principal) -> UserTier {
//     USERS_STORE.with(|user| {
//         user.borrow().get(&principal)
//             .map(|data| data.tier.clone())
//             .unwrap_or(UserTier::Basic) // default fallback
//     })
// }

#[update]
pub fn upgrade_tier(principal: Principal, new_tier: UserTier) {
    USERS_STORE.with(|user| {
        if let Some(user_data) = user.borrow_mut().get_mut(&principal) {
            user_data.tier = new_tier;
            ic_cdk::println!("Tier upgraded for principal: {}", principal);
        } else {
            ic_cdk::trap("User not found for tier upgrade");
        }
    });
}


#[update]
pub fn add_credit(principal: Principal, additional_credit: u8) {
    // Menambahkan credit ke pengguna yang sudah ada
    USERS_STORE.with(|user| {
        if let Some(user_data) = user.borrow_mut().get_mut(&principal) {
            user_data.credits[0] += additional_credit;
            ic_cdk::println!("Added credit {} for principal: {}", additional_credit, principal);
        } else {
            ic_cdk::trap(&format!("User with principal {} not found", principal));
        }
    });
}

#[query]
pub fn get_credit(principal: Principal) -> Vec<u8> {
    USERS_STORE.with(|user| {
        user.borrow()
            .get(&principal)
            .map(|u| u.credits.clone()) // ✔ ambil field-nya
            .unwrap_or_else(|| ic_cdk::trap("User not found"))
    })
}



#[update]
pub fn reduction_credit(principal: Principal) {
    USERS_STORE.with(|user| {
        if let Some(user_data) = user.borrow_mut().get_mut(&principal) {
            if !user_data.credits.is_empty() && user_data.credits[0] >= 1 {
                user_data.credits[0] -= 1;
                ic_cdk::println!("Reduced credit by 1 for principal: {}", principal);
            } else {
                ic_cdk::trap(&format!("Insufficient credit for principal: {}", principal));
            }
        } else {
            ic_cdk::trap(&format!("User with principal {} not found", principal));
        }
    });
}


#[query]
pub fn get_user_data(principal: Principal) -> UserData {
    USERS_STORE.with(|user| {
        user.borrow()
            .get(&principal)
            .cloned()
            .unwrap_or_else(|| ic_cdk::trap("User not found"))
    })
}


#[query]
pub fn is_registered(principal: Principal) -> bool {
    USERS_STORE.with(|user| user.borrow().contains_key(&principal))
}

pub fn user_pre_upgrade() {
    USERS_STORE.with(|user| {
        storage::stable_save((user.borrow().clone(),)).unwrap();
    });
    ic_cdk::println!("Pre-upgrade: Data saved to stable memory.");
}

pub fn user_post_upgrade() {
    // Memulihkan USER_STORE dari stable memory setelah upgrade
    let (restored_user,): (UserStore,) = storage::stable_restore().unwrap();
    USERS_STORE.with(|user| {
        *user.borrow_mut() = restored_user;
    });
    ic_cdk::println!("Post-upgrade: Data users restored from stable memory.");
}