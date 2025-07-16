mod http;
mod storages;
mod users_store;
use candid::Principal;
// use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use ic_cdk::{post_upgrade, pre_upgrade,update};

#[ic_cdk::update]
pub async fn send_http_post_request(image: Vec<u8>,style : Vec<u8>) -> Vec<u8> {
    let principal =ic_cdk::caller();
    let mut combined = Vec::new();
    combined.extend_from_slice(&style);
    combined.extend_from_slice(&image);
    let credit = users_store::get_credit(principal.clone());
    if credit[0] == 0 {
        ic_cdk::println!("Insufficient credit for this user");
        return vec![0];
    } else {
        let response = http::send_http_post(combined).await;
        ic_cdk::println!("principal kamu: {}", principal.to_string());
        ic_cdk::println!("atau gambar : {:?}", response.len());
        users_store::reduction_credit(principal.clone());
        response
    }
}

#[ic_cdk::update]
pub async fn save_image_to_store(cid: String) {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found for saving CID");
    } else {
        storages::save_image(principal, cid);
    }
}

#[ic_cdk::update]
pub async fn initialize_credit() -> String {
    let principal =ic_cdk::caller();
    let is_register = users_store::is_registered(principal);
    if is_register != true {
        users_store::save_user(principal.clone());
    }
    principal.to_string()
}

#[ic_cdk::query]
pub async fn get_balance() -> Vec<u8> {
    let principal = ic_cdk::caller();
    if !users_store::is_registered(principal) {
        ic_cdk::trap(&format!("No user found"));
    } else {
        let credit = users_store::get_credit(principal);
        credit
    }
}
#[ic_cdk::query]
pub async fn get_images_by_principal() -> Vec<String> {
    let principal = ic_cdk::caller();
    
    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found");
    } else {
        let cid = storages::retrieve_images(principal);

        let string_cid: Vec<String> = cid
            .iter()
            .map(|cid| cid.to_string())
            .collect();

        println!("User dari get_images_by_principal(): {:?}", principal.to_text());
        string_cid
    }
}
#[update]
pub async fn delete_image_by_index(index : usize) {
    let principal = ic_cdk::caller();

    if !users_store::is_registered(principal) {
        ic_cdk::trap("No user found for delete image");
    } else {
        storages::delete_image(principal,index);
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