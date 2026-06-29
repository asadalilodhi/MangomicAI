import os
import boto3
from dotenv import load_dotenv
load_dotenv()
s3 = boto3.client('s3', endpoint_url='https://s3.us-west-003.backblazeb2.com', aws_access_key_id=os.getenv('B2_KEY_ID'), aws_secret_access_key=os.getenv('B2_APPLICATION_KEY'))
print(s3.list_buckets())
