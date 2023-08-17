from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

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
            return jsonify(item.to_dict())
        else:
            items = Image.query.all()
            return jsonify([item.to_dict() for item in items])
    elif request.method == 'POST':
        data = request.get_json()
        new_item = Image(**data)
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
        db.session.delete(item)
        db.session.commit()
        return '', 204

if __name__ == '__main__':
    app.run(debug=True)

