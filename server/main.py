 #!/usr/bin/env python3
from flask import abort
from flask import Flask
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy


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

@app.route('/cars')
def cars():
    all_cars = Car.query.all()
    car_list = [car.serialize() for car in all_cars]
    return jsonify(car_list)


@app.route('/cars/<int:car_id>')    
#def show_car(car_id):
    #if car_id not in [1,2]:
     #   abort(404)
    #return  jsonify (car_list[car_id-1])

def show_car(car_id):
    car = Car.query.get(car_id)  # Försök att hämta bilen med det angivna ID:t
    if car is None:
        abort(404)  # Om bilen inte finns, returnera 404
    return jsonify(car.serialize())  # Om bilen finns,   

# Lab 1 ovan



if __name__ == "__main__":
    app.run(port=5002, debug=True) # På MacOS, byt till 5001 eller dylikt


