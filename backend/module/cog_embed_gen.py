import os
import httpx
import requests


def generate_embeddings(text, cogSvcsEndpoint, cogSvcsApiKey):
    cog_svcs_api_version = os.getenv("COGNITIVE_SERVICES_API_VERSION", "2024-02-01")
    cog_svcs_model_version = os.getenv("COGNITIVE_SERVICES_MODEL_VERSION", "2023-04-15")
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeText"  

    params = {
        "api-version": cog_svcs_api_version,
        "model-version": cog_svcs_model_version,
    } 
  
    headers = {  
        "Content-Type": "application/json",  
        "Ocp-Apim-Subscription-Key": cogSvcsApiKey  
    }  
  
    data = {  
        "text": text  
    }  
  
    response = requests.post(url, params=params, headers=headers, json=data)  
  
    if response.status_code == 200:  
        embeddings = response.json()["vector"]  
        return embeddings  
    else:  
        print(f"Error: {response.status_code} - {response.text}")  
        return None
    

async def generate_image_embeddings(image_url, cogSvcsEndpoint, cogSvcsApiKey):
    cog_svcs_api_version = os.getenv("COGNITIVE_SERVICES_API_VERSION", "2024-02-01")
    cog_svcs_model_version = os.getenv("COGNITIVE_SERVICES_MODEL_VERSION", "2023-04-15")
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeImage"  

    params = {
        "api-version": cog_svcs_api_version,
        "model-version": cog_svcs_model_version,
    } 
  
    headers = {  
        "Content-Type": "application/json",  
        "Ocp-Apim-Subscription-Key": cogSvcsApiKey  
    }  
  
    data = {  
        "url": image_url  
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, params=params, headers=headers, json=data)
            if response.status_code != 200:  
                print(f"Error: {response.status_code}, {response.text}: {image_url}")  
                response.raise_for_status()  
        
            embeddings = response.json()["vector"]  
            return embeddings  
    except Exception as exc:
        print('Embedding generation failed:', exc)
        return []


    

