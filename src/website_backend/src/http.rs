use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use ic_cdk::update;
use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize)]
struct FileResponse {
     filename: String,
     file_data: Vec<u8>,
}

#[update]
pub async fn send_http_post(image:Vec<u8> ) -> Vec<u8> {

    let host = "https://pure-readily-squid.ngrok-free.app";
    let url = "https://pure-readily-squid.ngrok-free.app/api/generate";

    let request_headers = vec![
        HttpHeader {
            name: "Host".to_string(),
            value: format!("{host}:443"),
        },
        HttpHeader {
            name: "User-Agent".to_string(),
            value: "demo_HTTP_POST_canister".to_string(),
        },
        HttpHeader {
            name: "Idempotency-Key".to_string(),
            value: "UUID-123456789".to_string(),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/octed-stream".to_string(),
        },
    ];
    let request_body: Option<Vec<u8>> = Some(image);

    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        max_response_bytes: None,
        method: HttpMethod::POST,
        headers: request_headers,
        body: request_body,
        transform: None,
    };
    match http_request(request,10836727600u128).await {
        Ok((response,)) => {
            response.body
        }
        Err((_r, m)) => {
            let error = m.to_string();
            let json_utf8: Vec<u8> = error.into_bytes();
            json_utf8
        }
    }

}