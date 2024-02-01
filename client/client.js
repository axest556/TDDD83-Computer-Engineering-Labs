//client.js
function loaded() {
    $(".container-fluid").html($("#view-home").html())
    alert("Sidan laddades");
}


function showCarPage() {
    $(".container-fluid").html($("#view-cars").html())
    present_cars();
}

function editCar(id) {
    $("#exampleModalCenter").modal();

    var car = serverStub.getCar(id);

    $("#car_id").val(car.id);
    $("#make-input").val(car.make);
    $("#model-input").val(car.model);
    $("#customer_id-input").val(car.customer_id);
}

function save() {
    $("#exampleModalCenter").modal();

    const id = Math.floor(document.getElementById('car_id').value);
    const make = document.getElementById('make-input').value;
    const model = document.getElementById('model-input').value;
    const customer_id = Math.floor(document.getElementById('customer_id-input').value);
    
    serverStub.updateCar(id, make, model, customer_id);

    $('#exampleModalCenter').modal('hide');
    showCarPage();
}

function showAddCar() {
    $("#addCarModal").modal();

    $("#make-input2").val("");
    $("#model-input2").val("");
    $("#customer_id-input2").val("");
}

function addCar() {
    $("#addCarModal").modal();

    const make = document.getElementById('make-input2').value;
    const model = document.getElementById('model-input2').value;
    const customer_id = Math.floor(document.getElementById('customer_id-input2').value);

    serverStub.addCar(make, model, customer_id);
    
    $('#addCarModal').modal('hide');
    showCarPage();
}


function deleteCar(id) {
    alert("Bil " + serverStub.getCar(id).make + " borttagen. \nVänligen ladda om listan.");
    serverStub.deleteCar(id);
    //showCarPage();
}

function present_cars() {
   var cars = serverStub.getCars();
   var carList = $("#car-list");

    cars.forEach(function(car) {
    var customer = car.customer_id ? serverStub.getCustomer(car.customer_id) : null;
    var customerName = customer ? customer.name : 'Ingen kund tilldelad';

    var listItem = $("<li>")
        .addClass("car-item")
        .html(`
            <h3> Märke: ${car.make} </h3>
            <h5> Modell: ${car.model}</h3>
            <p>Kund: ${customerName}</p>
            <button class="car-button edit-button" id="edit-button" onclick="editCar(${car.id})">Redigera</button>
            <button class="car-button delete-button" id="delete-button" onclick="deleteCar(${car.id})">Ta bort</button>
            <br>
            <br>
        `);

        carList.append(listItem);

    });
}


$(document).ready(function(){
   // Kod i detta block körs när dokumentet laddats klart.
   loaded();

   $('#nav-home').click(function (e) {
        e.preventDefault();
        $(".container-fluid").html($("#view-home").html());
    });

    $('#nav-contact').click(function (e) {
        e.preventDefault();
     $(".container-fluid").html($("#view-contact").html());
    });

    $('#nav-cars').click(function (e) {
        e.preventDefault();
        showCarPage();
    });

    $(document).on('click', '#reload-cars', function (e) {
        e.preventDefault();
        showCarPage();
    });
    
    $(document).on('click', '#submit-formula', function (e) {
        e.preventDefault();

        var namn = $('#name-field').val();
        var email = $('#email-field').val();
        var meddelande = $('#message-field').val();

        alert("Namn: " + namn + "\nE-post: " + email + "\nMeddelande: " + meddelande);
    });

})