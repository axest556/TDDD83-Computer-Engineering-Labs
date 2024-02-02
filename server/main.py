#!/usr/bin/env python3
from flask import abort, Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity



app = Flask(__name__, static_folder='../client', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_very_complex_string_here'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

@app.route("/")
def client():
    return app.send_static_file("client.html")

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def __repr__(self):
        return f'<Car {self.id}: {self.make} {self.model}>'
  
    def serialize(self):
        user_data = self.user.serialize() if self.user else None
        return {
            'id': self.id,
            'make': self.make,
            'model': self.model,
            'user': user_data
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    password_hash = db.Column(db.String, nullable=False)
    cars = db.relationship('Car', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.id}: {self.name} {self.email}>'
  
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_admin': self.is_admin
        }
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

@app.route('/cars', methods=['GET', 'POST'])
@jwt_required()
def cars():
    if request.method == 'GET':
        all_cars = Car.query.all()
        return jsonify([car.serialize() for car in all_cars])
    elif request.method == 'POST':
        data = request.get_json()
        new_car = Car(make=data['make'], model=data['model'])
        if 'user_id' in data:
            user = User.query.get(data['user_id'])
            if user:
                new_car.user = user
        db.session.add(new_car)
        db.session.commit()
        return jsonify(new_car.serialize()), 201

@app.route('/cars/<int:car_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_car(car_id):
    car = Car.query.get(car_id)
    if car is None:
        abort(404)
    if request.method == 'GET':
        return jsonify(car.serialize())
    elif request.method == 'PUT':
        data = request.get_json()
        if 'make' in data:
            car.make = data['make']
        if 'model' in data:
            car.model = data['model']
        if 'user_id' in data:
            user = User.query.get(data['user_id'])
            car.user = user if user else abort(404)
        db.session.commit()
        return jsonify(car.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(car)
        db.session.commit()
        return '', 200

@app.route('/users', methods=['GET', 'POST'])
@jwt_required()
def users():
    if request.method == 'GET':
        all_users = User.query.all()
        return jsonify([user.serialize() for user in all_users])
    elif request.method == 'POST':
        data = request.get_json()
        new_user = User(name=data['name'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.serialize()), 201

@app.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_users(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404)
    if request.method == 'GET':
        return jsonify(user.serialize())
    elif request.method == 'PUT':
        data = request.get_json()
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        db.session.commit()
        return jsonify(user.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return '', 200

@app.route('/users/<int:user_id>/cars')
@jwt_required()
def get_cars(user_id):
    user = User.query.get(user_id)
    if user is None:
        abort(404)
    return jsonify([car.serialize() for car in user.cars])

@app.route('/sign-up', methods=['POST'])
def signup():
    data = request.get_json()

    new_user = User(name=data['name'], email=data['email'])

    password = data['password']

    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods = ['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({"token": access_token, "user": user.serialize()}), 200    
    else:
        return jsonify({'msg': 'Invalid email or password'}), 401


if __name__ == "__main__":
    app.run(port=5002, debug=True)
