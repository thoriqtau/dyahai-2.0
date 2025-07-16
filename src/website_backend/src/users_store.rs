use ic_cdk::{ init, storage,  query, update};
use std::cell::RefCell;
use std::collections::BTreeMap;
use candid::Principal;

type UserStore = BTreeMap<Principal, Vec<u8>>;

thread_local! {
    // Penyimpanan untuk Principal dan daftar gambar mereka
    static USERS_STORE: RefCell<UserStore> = RefCell::default();
}

#[init]
fn init() {
    // Inisialisasi kosong atau tindakan lain yang diperlukan
    ic_cdk::println!("Canister initialized.");
}

#[update]
pub fn save_user(principal: Principal) {
    let credit: Vec<u8> = vec![3];
    USERS_STORE.with(|user| {
        user.borrow_mut()
            .entry(principal.clone())
            .or_insert_with(Vec::new) // Jika pengguna baru, buatkan Vec kosong
            .push(credit[0]); // Menyimpan nilai credit pertama
    });
    ic_cdk::println!("User Stored for principal: {} dan credit {}", principal, credit[0]);
}

#[update]
pub fn add_credit(principal: Principal, additional_credit: u8) {
    // Menambahkan credit ke pengguna yang sudah ada
    USERS_STORE.with(|user| {
        if let Some(credits) = user.borrow_mut().get_mut(&principal) {
            credits.push(additional_credit); // Menambahkan credit baru ke dalam daftar credit pengguna
            ic_cdk::println!("Added credit {} for principal: {}", additional_credit, principal);
        } else {
            ic_cdk::trap(&format!("User with principal {} not found", principal));
        }
    });
}

#[query]
pub fn get_credit(principal: Principal) -> Vec<u8> {
    // Mengambil credit yang terkait dengan Principal
    USERS_STORE.with(|user| {
        if let Some(credit) = user.borrow().get(&principal) {
            credit.clone()
        } else {
            ic_cdk::trap(&format!("No credits found for principal: {}", principal));
        }
    })
}

#[update]
pub fn reduction_credit(principal: Principal) {
    USERS_STORE.with(|user| {
        if let Some(credits) = user.borrow_mut().get_mut(&principal) {
            if !credits.is_empty() {
                let current_credit = credits[0];
                if current_credit >= 1 {
                    credits[0] -= 1;
                    ic_cdk::println!("Reduced credit by 1 for principal: {}", principal);
                } else {
                    ic_cdk::trap(&format!("Insufficient credit for principal: {}", principal));
                }
            } else {
                ic_cdk::trap(&format!("No credit available for principal: {}", principal));
            }
        } else {
            ic_cdk::trap(&format!("User with principal {} not found", principal));
        }
    });
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
    ic_cdk::println!("Post-upgrade: Data users restored from stable memory.");
}

