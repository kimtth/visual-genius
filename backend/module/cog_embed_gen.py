import httpx
import requests


def generate_embeddings(text, cogSvcsEndpoint, cogSvcsApiKey):  
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeText"  
  
    params = {  
        "api-version": "2023-02-01-preview"  
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
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeImage"  
    params = {  
        "api-version": "2023-02-01-preview"  
    }  
  
    headers = {  
        "Content-Type": "application/json",  
        "Ocp-Apim-Subscription-Key": cogSvcsApiKey  
    }  
  
    data = {  
        "url": image_url  
    }

    try:
        print(image_url)
        async with httpx.AsyncClient() as client:
            response = await client.post(url, params=params, headers=headers, json=data)
            if response.status_code != 200:  
                print(f"Error: {response.status_code}, {response.text}")  
                response.raise_for_status()  
        
            embeddings = response.json()["vector"]  
            return embeddings  
    except Exception as exc:
        # print(exc)
        return []


async def generate_image_embeddings_by_stream(image_stream, cogSvcsEndpoint, cogSvcsApiKey):  
    url = f"{cogSvcsEndpoint}/computervision/retrieval:vectorizeImage"  
    params = {  
        "api-version": "2023-02-01-preview"  
    }  
  
    headers = {  
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": cogSvcsApiKey  
    }  

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, params=params, headers=headers, data=image_stream) 
            if response.status_code != 200:  
                print(f"Error: {response.status_code}, {response.text}")  
                response.raise_for_status()  
        
            embeddings = response.json()["vector"]  
            return embeddings  
    except Exception as exc:
        # print(exc)
        return []


    

