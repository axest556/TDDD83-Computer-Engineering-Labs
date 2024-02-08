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

    $.ajax({
        type: 'GET',
        url: host + '/cars/' + id,
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function(car) {
            $("#car_id").val(car.id);
            $("#make-input").val(car.make);
            $("#model-input").val(car.model);
            $("#customer_id-input").val(car.user ? car.user.id : '');
        },
    });
}

function save() {
    $("#exampleModalCenter").modal();

    const id = Math.floor(document.getElementById('car_id').value);
    const make = document.getElementById('make-input').value;
    const model = document.getElementById('model-input').value;
    const user_id = Math.floor(document.getElementById('customer_id-input').value);
    
    const data = {
        make: make,
        model: model,
        user_id: user_id 
    };

    $.ajax({
        url: host + '/cars/' + id,
        type: 'PUT',
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
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
        user_id: user_id 
    };

    $.ajax({
        url: host + '/cars',
        type: 'POST',
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
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
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function(response) {
            alert("Bil med id " + id + " borttagen. \nVänligen ladda om listan.");
        },
    });
}

function bookCar(id) {

    $.ajax({
        url: host + '/cars/' + id + '/booking',
        type: 'POST',
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function(response) {
            alert();
            showCarPage();
        },
    });
}

function unbookCar(id) {

    $.ajax({
        url: host + '/cars/' + id + '/booking',
        type: 'PUT',
        contentType: 'application/json',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function(response) {
            alert("Bilen är avbokad");
            showCarPage();
        },
    });
}

function present_cars() {

    $.ajax({
        type: 'GET',
        url: host + '/cars',
        headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem('auth')).token},
        success: function(cars) {
            var carList = $("#car-list");
            carList.empty(); 
            var currentUserId = JSON.parse(sessionStorage.getItem('auth')).user.id; 
            
            //alert(currentUserId);

            cars.forEach(function(car) {
                // if (car.user && car.user.id) {
                //     alert(car.user.id);
                // }
                var userName = car.user ? car.user.name : 'Ingen användare tilldelad';
                var listItem = $("<li>")
                    .addClass("car-item")
                    .html(`
                        <h3> Märke: ${car.make} </h3>
                        <h5> Modell: ${car.model}</h5>
                        <p id = "user_id_id">Bokad av: ${userName}</p>
                        <button class="car-button edit-button" onclick="editCar(${car.id})">Redigera</button>
                        <button class="car-button delete-button" onclick="deleteCar(${car.id})">Ta bort</button>
                        <button class="car-button book-button" onclick="bookCar(${car.id})">Boka</button>
                        <button class="car-button unbook-button" onclick="unbookCar(${car.id})">Avboka</button>
                    `);

                if (JSON.parse(sessionStorage.getItem('auth')).user.is_admin) {
                    listItem.find('.edit-button, .delete-button').show();
                    listItem.find('.book-button').hide();
                } else {
                    listItem.find('.edit-button, .delete-button').hide();
                    if (userName != 'Ingen användare tilldelad') {
                        listItem.find('#user_id_id').show();
                        listItem.find('.book-button').hide();
                        if (car.user && car.user.id === currentUserId) {
                            listItem.find('.unbook-button').show();
                        } else {
                            listItem.find('.unbook-button').hide();
                        }
                    } else {
                        listItem.find('.book-button').show();
                        listItem.find('#user_id_id').hide();
                        listItem.find('.unbook-button').hide();
                    }
                }
                carList.append(listItem);
            });          
        }
    });

}

function checkAuthenticationStatus() {
    var authenticationData = JSON.parse(sessionStorage.getItem('auth'));
    if (authenticationData) {
        $("#nav-login").hide();
        $("#nav-register").hide();
        $("#nav-logout").show();
        $("#nav-cars").show();
    } else {
        $("#nav-login").show();
        $("#nav-register").show();
        $("#nav-logout").hide();
        $("#nav-cars").hide();
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