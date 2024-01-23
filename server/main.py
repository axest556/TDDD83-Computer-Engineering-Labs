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

    def __repr__(self):
     return '<Car {}: {} {}'.format(self.id, self.make, self.model)
  
    def serialize(self):
        return dict(id=self.id, make=self.make, model=self.model)

@app.route('/cars', methods=['GET', 'POST'])
def cars():
  if request.method == 'GET':
        all_cars = Car.query.all()
        car_list = [car.serialize() for car in all_cars]
        return jsonify(car_list)
  elif request.method == 'POST':
        data = request.get_json()  # Get data from request body

        new_car = Car(make=data['make'], model=data['model'])
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

        db.session.commit()
        return jsonify(car.serialize()), 200
    elif request.method == 'DELETE':
        db.session.delete(car)
        db.session.commit()
        return '', 200  

# Lab 1 ovan

if __name__ == "__main__":
    app.run(port=5002, debug=True) # På MacOS, byt till 5001 eller dylikt


