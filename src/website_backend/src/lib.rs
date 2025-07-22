mod http;
mod storages;
mod users_store;

use ic_cdk::api;
use ic_ledger_types::{AccountIdentifier, GetBlocksArgs, Memo, Operation, QueryBlocksResponse,Timestamp, Tokens};
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk::{post_upgrade, pre_upgrade, query, update};
use serde::Serialize;
use crate::users_store::{UserData, UserTier};
use candid::{CandidType, Deserialize, Principal, Nat};
use serde_json::to_string;
use num_bigint::BigUint;
use std::any::Any;

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub struct ParsedTransaction {
    pub from: Option<AccountIdentifier>,
    pub to: Option<AccountIdentifier>,
    pub amount: Option<Tokens>,
    pub memo: Option<Memo>,
    pub timestamp: Timestamp,
}

pub async fn get_parsed_transaction(block_height: u64) -> Result<ParsedTransaction, String> {
    ic_cdk::println!("Fetching block at height: {} and type {:?}", block_height, block_height.type_id());
    let args = GetBlocksArgs {
        start: block_height,
        length: 1,
    };

    let (response,): (QueryBlocksResponse,) = ic_cdk::call(
        Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").expect("Could not decode the principal."),
        "query_blocks",
        (args,),
    )
    .await
    .map_err(|e| format!("Gagal panggil ledger: {:?}", e))?;

    let block = response
        .blocks
        .get(0)
        .ok_or(format!("Block height {} tidak ditemukan", block_height))?;

    let tx = &block.transaction;

    let (from, to, amount) = match &tx.operation {
        Some(Operation::Transfer { from, to, amount, .. }) => {
            (Some(*from), Some(*to), Some(*amount))
        }
        _ => (None, None, None), // Jika bukan transfer
    };

    let parsed = ParsedTransaction {
        from,
        to,
        amount,
        memo: Some(tx.memo.clone()),
        timestamp: block.timestamp,
    };

    Ok(parsed)
}

#[ic_cdk::update]
pub async fn get_tx_summary(block_height: u64, memo: u64) -> String {
    ic_cdk::println!("Fetching block at height: {} and type {:?}", block_height, block_height.type_id());
    let principal = ic_cdk::caller();
    let result = get_parsed_transaction(block_height).await;

    ic_cdk::println!("Transaction Summary for block height {}: {:?}", block_height, result);

    let memo_obj = Memo(memo);
    ic_cdk::println!("Memo dari frontend: {:?}", memo_obj);

    match result {
        Ok(tx) => {
            ic_cdk::println!("memo dari block: {:?}", tx.memo);
            if tx.memo == Some(memo_obj) {
                if let Some(amount) = tx.amount.clone() {
                    let nat_amount = Nat::from(amount.e8s());
                    ic_cdk::println!("Nat amount: {:?}", nat_amount);
                    let sumcredit = calculate_credit_from_icp(nat_amount) as u8;
                    ic_cdk::println!("Sum credit calculated: {}", sumcredit);
                    users_store::add_credit(principal, sumcredit);
                    ic_cdk::println!("✅ Credit added: {} to {}", sumcredit, principal);
                } else {
                    ic_cdk::println!("⚠️ No amount found in transaction");
                }
            } else {
                ic_cdk::println!("❌ Memo mismatch: expected '{}', got {:?}", memo_obj.0, tx.memo);
            }

            to_string(&tx).unwrap_or_else(|_| "{}".to_string())
        }
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}



#[ic_cdk::query]
pub fn calculate_credit_from_icp(amount: Nat) -> u64 {
    const ICP_PRICE_USD: f64 = 8.75;

    let big_amount: &BigUint = &amount.0;
    let amount_e8s: f64 = big_amount.to_string().parse().unwrap_or(0.0);

    let icp = amount_e8s / 100_000_000.0;
    let usd = icp * ICP_PRICE_USD;

    // Aman: pakai pembulatan
    usd.round() as u64
}


#[query]
pub async fn get_account_id_for_canister() -> String {
    let principal = api::id();
    ic_cdk::println!("Principal ID dari canister backend: {}", principal);
    principal.to_text()
}



#[update]
pub async fn send_http_post_request(image: Vec<u8>, style: Vec<u8>) -> Vec<u8> {
    let principal = ic_cdk::caller();
    ic_cdk::println!("principal kamu: {}", principal);

    if !users_store::is_registered(principal) {
        ic_cdk::trap(&format!("User not registered: {}", principal.to_string()));
    }

    let user_data = users_store::get_user_data(principal.clone());

    // Validasi kredit berdasarkan tier
    match user_data.tier {
        users_store::UserTier::Basic | users_store::UserTier::Premium => {
            if user_data.credits.is_empty() || user_data.credits[0] == 0 {
                ic_cdk::println!("Insufficient credit for this user");
                return vec![0];
            }
        }
        users_store::UserTier::Ultimate => {
            // Misal ultimate bebas akses, tidak perlu cek kredit
        }
    }

    let mut combined = Vec::new();
    combined.extend_from_slice(&style);
    combined.extend_from_slice(&image);

    let response = http::send_http_post(image, style).await;
    ic_cdk::println!("jumlah data gambar: {:?}", response.len());

    // Kurangi kredit jika bukan Ultimate
    if user_data.tier != users_store::UserTier::Ultimate {
        users_store::reduction_credit(principal.clone());
    }

    response
}




#[update]
pub async fn save_image_to_store(cid: String) {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found for saving CID");
    } else {
        storages::save_image(principal, cid);
        ic_cdk::println!("Gambar berhasil disimpan: ");
    }
}

#[update]
pub async fn initialize_credit() -> String {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        users_store::save_user(principal.clone());
    }
    principal.to_string()
}

#[query]
pub async fn get_balance() -> Vec<u8> {
    let principal = ic_cdk::caller();

    // langsung ambil user_data
    let user_data = users_store::get_user_data(principal);

    ic_cdk::print(format!(
        "Pengguna dengan principal {} login dengan level: {:?}",
        principal, user_data.tier
    ));

    user_data.credits.clone()
}

#[query]
pub async fn get_tier() -> String {
    let principal = ic_cdk::caller();

    // langsung ambil user_data
    let user_data = users_store::get_user_data(principal);

    ic_cdk::print(format!(
        "Pengguna dengan principal {} login dengan level: {:?}",
        principal, user_data.tier
    ));

    format!("{:?}", user_data.tier.clone())
}

#[query]
pub async fn get_images_by_principal() -> Vec<String> {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found");
    } else {
        let cid = storages::retrieve_images(principal);
        cid.iter().map(|cid| cid.to_string()).collect()
    }
}

#[update]
pub async fn delete_image_by_index(index: usize) {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found for delete image");
    } else {
        storages::delete_image(principal, index);
    }
}

#[pre_upgrade]
fn pre_upgrade() {
    storages::storage_pre_upgrade();
    users_store::user_pre_upgrade();
}

#[post_upgrade]
fn post_upgrade() {
    storages::storage_post_upgrade();
    users_store::user_post_upgrade();
}

ic_cdk::export_candid!();
