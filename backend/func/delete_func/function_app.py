import azure.functions as func
import logging

app = func.FunctionApp()

# v2 does not require function.json
@app.function_name(name="HttpTrigger1")
@app.route(route="hello", auth_level=func.AuthLevel.ANONYMOUS) # HTTP Trigger
def delete_data_in_blob_acs(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    return func.HttpResponse(
        "This HTTP triggered function executed successfully.",
        status_code=200
        )
