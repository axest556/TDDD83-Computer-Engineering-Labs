//client.js
function loaded() {
    $(".container-fluid").html($("#view-home").html())
    alert("Sidan laddades");
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
    
})