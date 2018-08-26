$(document).ready(function () {
    $.ajax({
        url: "/carpeta-inicial",
        method: "POST",
        dataType: "json",
        success: function (respuesta) {
            $('#carpetaActual').val(respuesta.CODIGO_CARPETA);
            cargarCarpetas();
        }
    });
});