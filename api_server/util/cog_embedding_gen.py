import requests


def img_embeddings(text, cogSvcsEndpoint, cogSvcsApiKey):
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