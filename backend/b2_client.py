import os
from b2sdk.v2 import InMemoryAccountInfo, B2Api
import uuid

# Load credentials from environment
B2_KEY_ID = os.getenv("B2_KEY_ID")
B2_APP_KEY = os.getenv("B2_APP_KEY")
B2_BUCKET_NAME = os.getenv("B2_BUCKET_NAME")

def get_b2_api():
    info = InMemoryAccountInfo()
    b2_api = B2Api(info)
    if B2_KEY_ID and B2_APP_KEY:
        b2_api.authorize_account("production", B2_KEY_ID, B2_APP_KEY)
    return b2_api

def upload_file_to_b2(local_file_path: str, file_name: str = None) -> str:
    """
    Uploads a local file to Backblaze B2 and returns its public URL.
    """
    if not file_name:
        # Generate a unique file name if none is provided
        extension = os.path.splitext(local_file_path)[1]
        file_name = f"assets/{uuid.uuid4()}{extension}"
        
    b2_api = get_b2_api()
    bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
    
    print(f"Uploading {local_file_path} to B2 bucket {B2_BUCKET_NAME} as {file_name}...")
    uploaded_file = bucket.upload_local_file(
        local_file=local_file_path,
        file_name=file_name
    )
    
    # Construct the public URL (Assuming a public bucket for MVP frontend rendering)
    download_url = b2_api.account_info.get_download_url()
    public_url = f"{download_url}/file/{B2_BUCKET_NAME}/{file_name}"
    
    return public_url

def upload_bytes_to_b2(file_bytes: bytes, file_name: str) -> str:
    """
    Uploads raw bytes to Backblaze B2.
    """
    b2_api = get_b2_api()
    bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
    
    print(f"Uploading raw bytes to B2 bucket {B2_BUCKET_NAME} as {file_name}...")
    uploaded_file = bucket.upload_bytes(
        data_bytes=file_bytes,
        file_name=file_name
    )
    
    download_url = b2_api.account_info.get_download_url()
    public_url = f"{download_url}/file/{B2_BUCKET_NAME}/{file_name}"
    
    return public_url
