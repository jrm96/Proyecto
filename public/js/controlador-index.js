$("#registrarse").click(function () {
    if (($("#nombre").val() == "") || ($("#apellido").val() == "") || ($("#username").val() == "") ||
        ($("#email").val() == "") || ($("#contrasena").val()) == "" || ($("#confirmarContrasena").val() == "")) {
        alert("Ingrese todos los campos");
    } else if ($("#confirmarContrasena").val() != $("#contrasena").val()) {
        alert("Las contraseñas no coinciden");
    } else {
        var parametros = "nombre=" + $("#nombre").val() + "&apellido=" + $("#apellido").val()
            + "&username=" + $("#username").val() + "&email=" + $("#email").val()
            + "&contrasena=" + $("#contrasena").val();
        $.ajax({
            url: "/registrar",
            data: parametros,
            method: "POST",
            dataType: "json",
            success: function (respuesta) {
                alert("Se ha registrado exitosamente");
                window.location.href = "login.html";

            }
        });
    }

});

$("#ingresar").click(function () {

    var parametros = "email=" + $("#email").val() + "&contrasena=" + $("#contrasena").val();
    $.ajax({
        url: "/login",
        data: parametros,
        method: "POST",
        dataType: "json",
        success: function (respuesta) {
            if (respuesta.estatus ==0 )
                //alert("Credenciales correctas");    
                window.location.href ="home.html";
            else
                alert("Credenciales incorrectas");

        }
    });
});