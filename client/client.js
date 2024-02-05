
var host = window.location.protocol + '//' + location.host

function loaded() {
    checkAuthenticationStatus();
    $(".container-fluid").html($("#view-home").html());
    alert("Sidan laddades");
}

function showCarPage() {
    $(".container-fluid").html($("#view-cars").html());
    present_cars();
}

function editCar(id) {
    $("#exampleModalCenter").modal();

    $.get(host + '/cars/' + id, function(car) {
        $("#car_id").val(car.id);
        $("#make-input").val(car.make);
        $("#model-input").val(car.model);
        // Updated to use 'user.id' instead of 'customer.id'
        $("#customer_id-input").val(car.user ? car.user.id : '');
    });
}

function save() {
    $("#exampleModalCenter").modal();

    const id = Math.floor(document.getElementById('car_id').value);
    const make = document.getElementById('make-input').value;
    const model = document.getElementById('model-input').value;
    // Updated to reflect the model change
    const user_id = Math.floor(document.getElementById('customer_id-input').value);
    
    const data = {
        make: make,
        model: model,
        user_id: user_id // Reflecting the backend expectation
    };

    $.ajax({
        url: host + '/cars/' + id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            $('#exampleModalCenter').modal('hide');
            showCarPage();
        },
    });
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
    const user_id = Math.floor(document.getElementById('customer_id-input2').value);

    const data = {
        make: make,
        model: model,
        user_id: user_id // Reflecting the model change
    };

    $.ajax({
        url: host + '/cars',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
           $('#addCarModal').modal('hide');
           showCarPage();
        },
    });
}

function deleteCar(id) {
    $.ajax({
        url: host + '/cars/' + id,
        type: 'DELETE',
        success: function(response) {
            alert("Bil med id " + id + " borttagen. \nVänligen ladda om listan.");
            showCarPage(); // Refresh the list after deletion
        },
    });
}

function present_cars() {
    $.get(host + '/cars', function(cars) {
        var carList = $("#car-list");
        carList.empty(); // Clear the list before appending new items

        cars.forEach(function(car) {
            // Updated to use 'user' instead of 'customer'
            var userName = car.user ? car.user.name : 'Ingen användare tilldelad';

            var listItem = $("<li>")
                .addClass("car-item")
                .html(`
                    <h3> Märke: ${car.make} </h3>
                    <h5> Modell: ${car.model}</h5>
                    <p>Användare: ${userName}</p>
                    <button class="car-button edit-button" onclick="editCar(${car.id})">Redigera</button>
                    <button class="car-button delete-button" onclick="deleteCar(${car.id})">Ta bort</button>
                `);

            carList.append(listItem);
        });
    });
}

function checkAuthenticationStatus() {
    var authenticationData = JSON.parse(sessionStorage.getItem('auth'));
    if (authenticationData) {
        $("#nav-login").hide();
        $("#nav-register").hide();
        $("#nav-logout").show();
    } else {
        $("#nav-login").show();
        $("#nav-register").show();
        $("#nav-logout").hide();
    }

}

$(document).on('submit', '#registration-form', function(e) {
    e.preventDefault(); 

    var userData = {
        name: $('#name-field').val(),
        email: $('#email-field').val(),
        password: $('#password-field').val()
    };

    $.ajax({
        type: 'POST',
        url: host + '/sign-up',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            alert("Profil skapad.");
            $(".container-fluid").html($("#view-home").html());
        }
    });
});

$(document).on('submit', '#login-form', function(e) {
    e.preventDefault(); 

    var loginData = {
        email: $('#email-field').val(),
        password: $('#password-field').val()
    };

    $.ajax({
        type: 'POST',
        url: host + '/login',
        contentType: 'application/json',
        data: JSON.stringify(loginData),
        success: function(response) {
            sessionStorage.setItem('auth', JSON.stringify(response));
            alert("Inloggad");
            checkAuthenticationStatus();
            $(".container-fluid").html($("#view-home").html());
        }
    });
});

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

    $('#nav-register').click(function (e) {
        e.preventDefault();
        $(".container-fluid").html($("#view-register").html());
    });

    $('#nav-login').click(function (e) {
        e.preventDefault();
        $(".container-fluid").html($("#view-login").html());
    });

    $('#nav-logout').click(function (e) {
        e.preventDefault();
        sessionStorage.removeItem('auth');
        alert("Du är utloggad.");
        checkAuthenticationStatus();
        $(".container-fluid").html($("#view-home").html());
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