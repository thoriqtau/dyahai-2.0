use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod,
    TransformArgs, TransformContext, TransformFunc, HttpResponse,
};
use ic_cdk::{query, update};
use candid::{CandidType, Deserialize, Func};
use serde::Serialize;
use base64::{engine::general_purpose, Engine as _};

#[derive(Serialize)]
struct InputPayload {
    input: InputImages,
}

#[derive(Serialize)]
struct InputImages {
    source_image: String,
    target_image: String,
    source_indexes: String,
    target_indexes: String,
    background_enhance: bool,
    face_restore: bool,
    face_upsample: bool,
    upscale: u8,
    codeformer_fidelity: f32,
    output_format: String,
}

#[derive(CandidType, Deserialize)]
struct FileResponse {
    filename: String,
    file_data: Vec<u8>,
}

#[derive(Deserialize)]
struct ApiOutput {
    image: String,
}

#[derive(Deserialize)]
struct ApiResponse {
    output: ApiOutput,
}

#[query]
fn transform(raw: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: raw.response.status,
        headers: vec![],
        body: raw.response.body,
    }
}

#[update]
pub async fn send_http_post(source_image: Vec<u8>, target_image: Vec<u8>) -> Vec<u8> {

    ic_cdk::println!("[DEBUG] Source image size: {}", source_image.len());
    ic_cdk::println!("[DEBUG] Target image size: {}", target_image.len());

    let source_b64 = general_purpose::STANDARD.encode(&source_image);
    let target_b64 = general_purpose::STANDARD.encode(&target_image);

    ic_cdk::println!("[DEBUG] Source image (base64, truncated): {}", &source_b64[..100.min(source_b64.len())]);
    ic_cdk::println!("[DEBUG] Target image (base64, truncated): {}", &target_b64[..100.min(target_b64.len())]);

    let url = "https://api.runpod.ai/v2/{YOUR_ID_PROJECT}/runsync";

    // let source_b64 = general_purpose::STANDARD.encode(source_image);
    // let target_b64 = general_purpose::STANDARD.encode(target_image);

    let payload = InputPayload {
        input: InputImages {
            source_image: source_b64,
            target_image: target_b64,
            source_indexes: "-1".to_string(),
            target_indexes: "-1".to_string(),
            background_enhance: true,
            face_restore: true,
            face_upsample: true,
            upscale: 1,
            codeformer_fidelity: 0.2,
            output_format: "JPEG".to_string(),
        },
    };

    let json_payload = serde_json::to_vec(&payload).expect("Failed to serialize payload");

    let request_headers = vec![
        HttpHeader {
            name: "Host".to_string(),
            value: "api.runpod.ai".to_string(),
        },
        
        HttpHeader {
            name: "Authorization".to_string(),
            value: "{YOUR_API_KEY}".to_string(),
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
            value: "application/json".to_string(), // <--- penting!
        },
    ];

    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        max_response_bytes: None,
        method: HttpMethod::POST,
        headers: request_headers,
        body: Some(json_payload),
        transform: Some(TransformContext {
            function: TransformFunc(Func {
                principal: ic_cdk::id(),
                method: "transform".to_string(),
            }),
            context: vec![],
        }),
    };

    match http_request(request, 10_000_000_000).await {
        Ok((response,)) => {
            let body_str = String::from_utf8_lossy(&response.body);
            ic_cdk::println!("[DEBUG] Raw JSON: {}", body_str);

            match serde_json::from_str::<ApiResponse>(&body_str) {
                Ok(api_response) => {
                    // Decode base64 image
                    match general_purpose::STANDARD.decode(&api_response.output.image) {
                        Ok(decoded_image) => {
                            ic_cdk::println!("[DEBUG] Image decoded, size: {}", decoded_image.len());
                            decoded_image
                        }
                        Err(e) => {
                            ic_cdk::println!("[ERROR] Failed to decode image: {}", e);
                            vec![]
                        }
                    }
                }
                Err(e) => {
                    ic_cdk::println!("[ERROR] Failed to parse JSON: {}", e);
                    vec![]
                }
            }
        },
        Err((_r, m)) => {
            ic_cdk::println!("[ERROR] HTTP request failed: {}", m);
            m.to_string().into_bytes()
        },
    }

}
