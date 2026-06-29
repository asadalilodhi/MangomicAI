import os
import boto3
import requests
import time
import uuid
from botocore.config import Config
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# B2 credentials
B2_KEY_ID = os.getenv("B2_KEY_ID")
B2_APPLICATION_KEY = os.getenv("B2_APPLICATION_KEY")
B2_BUCKET_NAME = os.getenv("B2_BUCKET_NAME")

# AI credentials
GMI_API_KEY = os.getenv("GMI_API_KEY")

s3 = boto3.client(
    's3',
    endpoint_url='https://s3.eu-central-003.backblazeb2.com', 
    aws_access_key_id=B2_KEY_ID,
    aws_secret_access_key=B2_APPLICATION_KEY,
    config=Config(signature_version='s3v4')
)

aiml_client = OpenAI(
    api_key=os.getenv("AIML_API_KEY"), 
    base_url="https://api.aimlapi.com/v1", 
)

MODEL_ROUTER = {
    "Manga": "blackforestlabs/flux-pro-1.1",
    "Anime": "hunyuan/hunyuan-image-v3-text-to-image",
    "Photorealistic": "blackforestlabs/flux-pro-1.1",
    "Comic": "stable-diffusion-v35-large",
    "Manhwa": "blackforestlabs/flux-dev"
}

def generate_and_upload_media(image_prompt: str, dialogue: str, style_template: str = None, panel_characters: list[str] = None, all_characters: list = None) -> tuple[str, str]:
    """Generates image and TTS, uploads to B2, returns public URLs."""
    
    # 1. Apply Style Modifiers and Character Consistency (Poor man's LoRA)
    final_prompt = image_prompt
    
    # Append character visual descriptions to ensure consistency
    if panel_characters and all_characters:
        for char_id in panel_characters:
            char_data = next((c for c in all_characters if c.id == char_id), None)
            if char_data and char_data.visual_description:
                final_prompt += f", {char_data.name} is {char_data.visual_description}"

    model_id = "stabilityai/stable-diffusion-xl-base-1.0" # Default fallback
    if style_template:
        model_id = MODEL_ROUTER.get(style_template, model_id)
        try:
            import json
            with open("style_templates.json", "r") as f:
                styles = json.load(f)
            if style_template in styles:
                final_prompt = f"{final_prompt}, {styles[style_template]}"
        except Exception as e:
            print(f"Error loading style templates: {e}")

    # 2. Generate Image via AIML API
    try:
        res = aiml_client.images.generate(
            model=model_id,
            prompt=final_prompt,
            n=1,
            size="1024x1024",
            timeout=25.0
        )
        image_url = res.data[0].url
    except Exception as e:
        print(f"Image generation failed: {e}")
        # fallback placeholder
        image_url = "https://placehold.co/1024x1024.png?text=Image+Failed"
        
    # Download image bytes
    try:
        img_data = requests.get(image_url, timeout=10.0).content
        img_id = str(uuid.uuid4())
        img_filename = f"panels/{img_id}.png"
        
        s3.put_object(Bucket=B2_BUCKET_NAME, Key=img_filename, Body=img_data, ContentType="image/png")
        final_image_url = f"https://f003.backblazeb2.com/file/{B2_BUCKET_NAME}/{img_filename}"
    except Exception as e:
        print(f"S3 upload failed: {e}")
        final_image_url = image_url # fallback to the temporary url
        
    return final_image_url, None
