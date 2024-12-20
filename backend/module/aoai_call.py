import json
import os
import httpx

from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from openai import AzureOpenAI

from module import prompt_template


load_dotenv(verbose=False)

aoai_model_deployment_name = os.getenv("AZURE_OPENAI_MODEL_DEPLOYMENT_NAME")
aoai_img_model_deployment_name = os.getenv(
    "AZURE_OPENAI_IMG_MODEL_DEPLOYMENT_NAME")


# may change in the future
# https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#rest-api-versioning
aoai_client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION_CHAT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY")
)

async def img_gen(query):
    try:
        response = aoai_client.images.generate(
            model=aoai_img_model_deployment_name,  # the name of your DALL-E 3 deployment
            prompt=query,
            response_format='url',
            size='1024x1024', # Dalle-3 not support 512x512
            n=1
        )

        json_response = json.loads(response.model_dump_json())

        image_url = json_response["data"][0]["url"]
    except Exception as e:
        return ""

    return image_url


async def img_gen_desc(query):
    prompt = prompt_template.return_prompt('imgGen')
    prompt = prompt.format(query=query)

    message_history = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query}
    ]

    try:
        response = aoai_client.chat.completions.create(
            model=aoai_model_deployment_name,
            messages=message_history,
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )

        msg = response.choices[0].message.content
    except Exception as e:
        raise Exception(e)

    return msg


async def img_to_storage(blob_service_client, container_name, filename, image_url):
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        img = Image.open(BytesIO(response.content))

        container_client = blob_service_client.get_container_client(
            container_name)
        # Upload the file data to the container
        container_client.upload_blob(
            name=filename, data=img.tobytes(), overwrite=True)


async def img_list_gen(query, persona):
    prompt = prompt_template.return_prompt('imgList')
    prompt = prompt.format(persona=persona)

    message_history = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query}
    ]

    try:
        response = aoai_client.chat.completions.create(
            model=aoai_model_deployment_name,
            messages=message_history,
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )

        msg = response.choices[0].message.content
    except Exception as e:
        raise Exception(e)

    return msg


async def img_step_gen(query, persona):
    prompt = prompt_template.return_prompt('imgStep')
    prompt = prompt.format(persona=persona)

    message_history = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": query}
    ]

    try:
        response = aoai_client.chat.completions.create(
            model=aoai_model_deployment_name,
            messages=message_history,
            temperature=0.7,
            max_tokens=800,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )

        msg = response.choices[0].message.content
    except Exception as e:
        raise Exception(e)

    return msg
