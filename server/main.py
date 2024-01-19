 #!/usr/bin/env python3
from flask import abort
from flask import Flask
from flask import jsonify

app = Flask(__name__)

@app.route('/hello')
def hello():
    return jsonify("Hello, World!")



# Lab 1 nedan
car_list = [
    {"id": 1, "make": "Volvo", "model": "V70"},
    {"id": 2, "make": "SAAB", "model": "95"}
]   

@app.route('/cars')
def cars():
    return jsonify (car_list)


@app.route('/cars/<int:car_id>')    
def show_car(car_id):
    if car_id not in [1,2]:
        abort(404)
    return  jsonify (car_list[car_id-1])
    
# Lab 1 ovan



if __name__ == "__main__":
    app.run(port=5002, debug=True) # På MacOS, byt till 5001 eller dylikt


