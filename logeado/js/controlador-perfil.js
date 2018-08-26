$("#guardarInfo").click(function () {
    var parametros = "nombre=" + $("#nombreUsuario").val()
        + "&apellido=" + $("#apellidoUsuario").val()
        + "&username=" + $("#username").val()
        + "&correo=" + $("#correoUsuario").val()
        + "&nacimiento=" + $("#fechaNacimiento").val()
        + "&genero=" + $('input[name=genero]:checked').val();
    $.ajax({
        url: "/actualizar-usuario",
        data: parametros,
        method: "POST",
        dataType: "json",
        success: function (respuesta) {
            alert("Información actualizada");
            window.location.href = "perfil.html";
        }
    });
});

$(document).ready(function () {
    $("#table").html("");
    $.ajax({
        url: "/info-perfil",
        method: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#table").append(
                `<tbody>
                <tr>
                  <th>Nombre: </th>
                  <th>${respuesta.NOMBRE}</th>
                </tr>
                <tr>
                  <th>Apellido: </th>
                  <th>${respuesta.APELLIDO}</th>
                </tr>
                <tr>
                  <th>Nombre de usuario: </th>
                  <th>${respuesta.USERNAME}</th>
                </tr>
                <tr>
                  <th>Correo: </th>
                  <th>${respuesta.CORREO}</th>
                </tr>
                <tr>
                  <th>Fecha nacimiento: </th>
                  <th>${respuesta.FECHA_NACIMIENTO}</th>
                </tr>
                <tr>
                    <th>Genero: </th>
                    <th>${respuesta.GENERO}</th>
                </tr>
                <tr>
                  <th>Plan: </th>
                  <th>${respuesta.NOMBRE_PLAN}</th>
                </tr>
              </tbody>`
            );
            $("#nombreUsuario").val(respuesta.NOMBRE);
            $("#apellidoUsuario").val(respuesta.APELLIDO);
            $("#username").val(respuesta.USERNAME);
            $("#correoUsuario").val(respuesta.CORREO);
            if (respuesta.FECHA_NACIMIENTO != "-")
                $("#fechaNacimiento").val(respuesta.FECHA_NACIMIENTO);
            if (respuesta.GENERO != "-")
                $("input[name=genero][value=" + respuesta.GENERO + "]").prop('checked', true);
        }
    });
});