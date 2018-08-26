function guardarArchivo(llamada) {
    var code = editor.getValue();
    var parametros = "contenido=" + code;
    $.ajax({
        url: "/guardar-archivo",
        data: parametros,
        method: "POST",
        dataType: "json",
        success: function (respuesta) {
            if (llamada == 1)
                alert("Archivo guardado");
            else
                console.log("Archivo guardado");
        }
    });
}

$("#agregarUsuario").click(function () {
    if ($("#nombreUsuario").val() == "") {
        alert("Ingrese un nombre para la carpeta");
    } else {
        var parametros = "usuario=" + $("#nombreUsuario").val() + "&acceso=" + $("#acceso").val();
        $.ajax({
            url: "/agregar-usuario-archivo",
            data: parametros,
            method: "POST",
            dataType: "json",
            success: function (respuesta) {
                if (respuesta.estatus == 1)
                    alert(respuesta.mensaje);
                else {
                    alert("Se ha añadido el usuario exitosamente");
                    $('#compArchivo').modal('hide');
                }
            }
        });
    }
});

$(document).ready(function () {
    $.ajax({
        url: "/cargar-archivo",
        method: "POST",
        dataType: "json",
        success: function (respuesta) {
            if (respuesta.CONTENIDO_ARCHIVO != "0")
                editor.session.setValue(respuesta.CONTENIDO_ARCHIVO);
            editor.session.setMode("ace/mode/" + respuesta.LENGUAJE.toLowerCase());
            $("#nombreArchivo").html(respuesta.NOMBRE_ARCHIVO);
            setInterval(guardarArchivo, 120000);

        }
    });
});