from quart import Quart, request, jsonify
from quart_sqlalchemy import SQLAlchemy
from quart import url_for
from quart import Blueprint

from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.models import Vector
import os
from dotenv import load_dotenv
from util import generate_embeddings

app = Quart(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.db'
db = SQLAlchemy(app)

load_dotenv()
service_endpoint = os.getenv("AZURE_SEARCH_SERVICE_ENDPOINT")
index_name = os.getenv("AZURE_SEARCH_INDEX_NAME")
key = os.getenv("AZURE_SEARCH_ADMIN_KEY")
cogSvcsEndpoint = os.getenv("COGNITIVE_SERVICES_ENDPOINT")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")
cogSvcsApiKey = os.getenv("COGNITIVE_SERVICES_API_KEY")

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

# TODO: fix imgPath to Azure Blob Storage
@app.route('/images', methods=['GET', 'POST'])
@app.route('/images/<id>', methods=['GET', 'PUT', 'DELETE'])
def image_handler(id=None):
    if request.method == 'GET':
        if id:
            item = Image.query.filter_by(categoryId=id).first()
            item_dict = item.to_dict()
            item_dict['imgPath'] = url_for('static', filename=item.imgPath)
            return jsonify(item_dict)
        else:
            items = Image.query.all()
            items_list = [item.to_dict() for item in items]
            for item in items_list:
                item['imgPath'] = url_for('static', filename=item['imgPath'])
            return jsonify(items_list)
    elif request.method == 'POST':
        file = request.files['file']
        filename = file.filename
        file.save(os.path.join(app.static_folder, filename))
        new_item = Image(imgPath=os.path.join('static', filename))
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
        os.remove(os.path.join(app.root_path, item.imgPath))
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
