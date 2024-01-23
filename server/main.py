 #!/usr/bin/env python3
from flask import abort
from flask import Flask
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask import request

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

@app.route('/hello')
def hello():
    return jsonify("Hello, World!")


#Lab 1 nedan

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)  # Foreign key to Customer

    def __repr__(self):
        return '<Car {}: {} {} '.format(self.id, self.make, self.model)
  
    def serialize(self):
       customer_data = self.customer.serialize() if self.customer else None
       return {
            'id': self.id,
            'make': self.make,
            'model': self.model,
            'customer': customer_data
        }


@app.route('/cars', methods=['GET', 'POST'])
def cars():
  if request.method == 'GET':
        all_cars = Car.query.all()
        car_list = [car.serialize() for car in all_cars]
        return jsonify(car_list)
  elif request.method == 'POST':
        data = request.get_json()  # Get data from request body

        new_car = Car(make=data['make'], model=data['model'])

        if 'customer_id' in data:
            customer = Customer.query.get(data['customer_id'])
            if customer:
                new_car.customer = customer

        db.session.add(new_car)
        db.session.commit()

        return jsonify(new_car.serialize()), 201  


@app.route('/cars/<int:car_id>', methods=['GET', 'PUT', 'DELETE'])    
def handle_car(car_id):
    car = Car.query.get(car_id)
    if car is None:
        abort(404)  
    
    if request.method == 'GET':   
        return jsonify(car.serialize())  
    elif request.method == "PUT":
        data = request.get_json()

        if 'make' in data:
            car.make = data['make']
        if 'model' in data:
            car.model = data['model']
        if 'customer_id' in data:
            customer = Customer.query.get(data['customer_id'])
            car.customer = customer if customer else abort(404)

        db.session.commit()
        return jsonify(car.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(car)
        db.session.commit()
        return '', 200  


class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    cars = db.relationship('Car', backref='customer', lazy=True)

    def __repr__(self):
     return '<Customer {}: {} {}'.format(self.id, self.name, self.email)
  
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }


@app.route('/customers', methods=['GET', 'POST'])
def customers():
    if request.method == 'GET':
        all_customers = Customer.query.all()
        customer_list = [customer.serialize() for customer in all_customers]
        return jsonify(customer_list)
    elif request.method == 'POST':
        data = request.get_json()  # Get data from request body

        new_customer = Customer(name=data['name'], email=data['email'])
        db.session.add(new_customer)
        db.session.commit()

        return jsonify(new_customer.serialize()), 201  


@app.route('/customers/<int:customer_id>', methods=['GET', 'PUT', 'DELETE'])    
def handle_customers(customer_id):
    customer = Customer.query.get(customer_id)
    if customer is None:
        abort(404)  
    
    if request.method == 'GET':   
        return jsonify(customer.serialize())  
    elif request.method == "PUT":
        data = request.get_json()

        if 'name' in data:
            customer.name = data['name']
        if 'email' in data:
            customer.email = data['email']

        db.session.commit()
        return jsonify(customer.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(customer)
        db.session.commit()
        return '', 200


@app.route('/customers/<int:customer_id>/cars')
def get_cars(customer_id):
    customer = Customer.query.get(customer_id)    
    if customer is None:
        abort(404)

    all_cars = customer.cars
    car_list = [{'id': car.id, 'make': car.make, 'model': car.model} for car in all_cars]
    return jsonify(car_list)

# Lab 1 ovan

if __name__ == "__main__":  
    app.run(port=5002, debug=True) # På MacOS, byt till 5001 eller dylikt


