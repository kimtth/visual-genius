from quart import Quart, request, jsonify
from quart_sqlalchemy import SQLAlchemy
from quart import url_for
from quart import Blueprint

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.models import Vector

from dotenv import load_dotenv
from util import generate_embeddings
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os

app = Quart(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.db'
db = SQLAlchemy(app)

load_dotenv()
# Set the connection string and container name
connection_string = os.getenv("BLOB_CONNECTION_STRING")
container_name = os.getenv("BLOB_CONTAINER_NAME")
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")

# Create the BlobServiceClient object which will be used to create a container client
blob_service_client = BlobServiceClient.from_connection_string(connection_string)


# TODO: https://github.com/Azure-Samples/azure-search-openai-demo/blob/main/app/backend/app.py

class Category(db.Model):
    id = db.Column(db.String, primary_key=True)
    category = db.Column(db.String)
    title = db.Column(db.String)
    difficulty = db.Column(db.String)
    imgNum = db.Column(db.Integer)
    contentUrl = db.Column(db.PickleType)


class Image(db.Model):
    id = db.Column(db.String, primary_key=True)
    categoryId = db.Column(db.String, db.ForeignKey('category.id'))
    title = db.Column(db.String)
    imgPath = db.Column(db.String)


@app.route('/category', methods=['GET', 'POST'])
@app.route('/category/<id>', methods=['GET', 'PUT', 'DELETE'])
def category_handler(id=None):
    if request.method == 'GET':
        if id:
            item = Category.query.get(id)
            return jsonify(item.to_dict())
        else:
            items = Category.query.all()
            return jsonify([item.to_dict() for item in items])
    elif request.method == 'POST':
        data = request.get_json()
        new_item = Category(**data)
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    elif request.method == 'PUT':
        data = request.get_json()
        item = Category.query.get(id)
        for key, value in data.items():
            setattr(item, key, value)
        db.session.commit()
        return jsonify(item.to_dict())
    elif request.method == 'DELETE':
        item = Category.query.get(id)
        db.session.delete(item)
        db.session.commit()
        return '', 204


@app.route('/images', methods=['GET', 'POST'])
@app.route('/images/<id>', methods=['GET', 'PUT', 'DELETE'])
def image_handler(id=None):
    if request.method == 'GET':
        if id:
            item = Image.query.filter_by(categoryId=id).first()
            item_dict = item.to_dict()

            # Get the primary blob service endpoint for your storage account
            primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
            # Construct the URL for the blob
            blob_url = f"{primary_endpoint}/{container_name}/{item.imgPath}"
            # Set the imgPath attribute to the blob URL
            item_dict['imgPath'] = blob_url

            return jsonify(item_dict)
        else:
            items = Image.query.all()
            items_list = [item.to_dict() for item in items]
            for item in items_list:
                # Get the primary blob service endpoint for your storage account
                primary_endpoint = f"https://{blob_service_client.account_name}.blob.core.windows.net"
                # Construct the URL for the blob
                blob_url = f"{primary_endpoint}/{container_name}/{item.imgPath}"
                # Set the imgPath attribute to the blob URL
                item['imgPath'] = blob_url

            return jsonify(items_list)
    elif request.method == 'POST':
        file = request.files['file']
        filename = file.filename
        # Get a reference to a container client
        container_client = blob_service_client.get_container_client(container_name)
        # Upload the file data to the container
        container_client.upload_blob(name=filename, data=file, overwrite=True)
        new_item = Image(imgPath=filename)
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    elif request.method == 'PUT':
        data = request.get_json()
        item = Image.query.get(id)
        for key, value in data.items():
            setattr(item, key, value)
        db.session.commit()
        return jsonify(item.to_dict())
    elif request.method == 'DELETE':
        item = Image.query.get(id)
        # Get the blob client for the image
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=item.imgPath)
        # Delete the blob from the container
        blob_client.delete_blob()
        db.session.delete(item)
        db.session.commit()
        return '', 204


@app.route('/search', methods=['GET'])
def search_handler():
    data = request.get_json()
    query = data['query']

    # Initialize the SearchClient
    credential = AzureKeyCredential(key)
    search_client = SearchClient(endpoint=service_endpoint,
                                 index_name=index_name,
                                 credential=credential)
    vector = Vector(value=generate_embeddings(
        query, cogSvcsEndpoint, cogSvcsApiKey), k=3, fields="imageVector")

    # Perform vector search
    results = search_client.search(
        search_text=None,
        vectors=[vector],
        select=["title", "imgPath"]
    )

    # Print the search results
    for result in results:
        print(f"Title: {result['title']}")
        print(f"Image URL: {result['imgPath']}")
        print("\n")

    # Return the search results
    img_ids = [result['id'] for result in results]

    items = Image.query.filter(Image.id.in_(img_ids)).all()
    items_list = [item.to_dict() for item in items]
    for item in items_list:
        item['imgPath'] = url_for('static', filename=item['imgPath'])
    return jsonify(items_list)


if __name__ == '__main__':
    app.run(debug=True)
