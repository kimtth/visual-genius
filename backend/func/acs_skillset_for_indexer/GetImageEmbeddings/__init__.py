import os
import json
import logging
import requests
import azure.functions as func

# Sample of input and output data
# https://learn.microsoft.com/en-us/azure/search/cognitive-search-custom-skill-web-api#sample-input-json-structure
# https://learn.microsoft.com/en-us/azure/search/cognitive-search-custom-skill-web-api#sample-output-json-structure


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python HTTP trigger function processed a request.")

    try:
        req_body = req.get_body().decode("utf-8")
        logging.info(f"Request body: {req_body}")

        request = json.loads(req_body)
        values = request.get("values", [])

        if not values:
            logging.info("No values provided in the request.")
            return func.HttpResponse(
                json.dumps({"values": []}), mimetype="application/json", status_code=200
            )

        response_results = []
        for value in values:
            record_id = value.get("recordId", "Unknown")
            logging.info(f"Processing recordId: {record_id}")

            img_path = value.get("data", {}).get("imgPath")
            if not img_path:
                logging.error("imgPath is missing.")
                response = create_error_response(record_id, "Missing key: imgPath")
                response_results.append(response)
                continue

            vector = get_image_embeddings(img_path)
            if vector:
                response = create_success_response(record_id, vector)
            else:
                response = create_error_response(
                    record_id, "Failed to retrieve image embeddings."
                )
            response_results.append(response)

        logging.info(f"Response body: {response_results}")
        return func.HttpResponse(
            json.dumps({"values": response_results}),
            mimetype="application/json",
            status_code=200,
        )
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return func.HttpResponse(f"Internal Server Error: {e}", status_code=500)


def get_image_embeddings(img_path):
    cog_svcs_endpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
    cog_svcs_api_key = os.getenv("COGNITIVE_SERVICES_API_KEY")
    cog_svcs_api_version = os.getenv("COGNITIVE_SERVICES_API_VERSION", "2024-02-01")
    cog_svcs_model_version = os.getenv("COGNITIVE_SERVICES_MODEL_VERSION", "2023-04-15")

    url = f"{cog_svcs_endpoint}/computervision/retrieval:vectorizeImage"
    params = {
        "api-version": cog_svcs_api_version,
        "model-version": cog_svcs_model_version,
    }
    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": cog_svcs_api_key,
    }
    data = {"url": img_path}

    try:
        response = requests.post(url, params=params, headers=headers, json=data)
        logging.debug(f"API Response {response.status_code}: {response.text}")
        if response.status_code == 404:
            logging.error("API endpoint not found. Check the env variables.")
            return None
        if response.status_code != 200:
            logging.error(f"Error: {response.status_code}, {response.text}")
            return None
        vector = response.json().get("vector")
        if not vector:
            logging.error("Vector not found in the API response.")
            return None
        return vector
    except Exception as e:
        logging.error(f"Error getting image embeddings: {e}")
        return None


def create_success_response(record_id, vector):
    return {
        "recordId": record_id,
        "data": {"vector": vector},
        "errors": [],
        "warnings": None,
    }


def create_error_response(record_id, message):
    return {
        "recordId": record_id,
        "data": None,
        "errors": [{"message": message}],
        "warnings": None,
    }
