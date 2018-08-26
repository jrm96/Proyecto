$("#agregarUsuario").click(function () {
    if ($("#nombreUsuario").val() == "") {
        alert("Ingrese un nombre para la carpeta");
    } else {
        var parametros = "usuario=" + $("#nombreUsuario").val() + "&carpeta=" + $("#carpetaActual").val() + "&acceso=" + $("#acceso").val();
        $.ajax({
            url: "/agregar-usuario-carpeta",
            data: parametros,
            method: "POST",
            dataType: "json",
            success: function (respuesta) {
                if (respuesta.estatus == 1)
                    alert(respuesta.mensaje);
                else {
                    alert("Se ha añadido el usuario exitosamente");
                    $('#compCarpeta').modal('hide');
                }
            }
        });
    }
});

//GUARDAR 
$("#guardarCarpeta").click(function () {
    if ($("#nombreCarpeta").val() == "") {
        alert("Ingrese un nombre para la carpeta");
    } else if ($("#nombreCarpeta").val() == "inicial") {
        alert("Nombre invalido");
    } else {
        var parametros = "carpeta=" + $("#nombreCarpeta").val() + "&privacidad=" + $("#privacidad").val() + "&carpetapadre=" + $("#carpetaActual").val();
        $.ajax({
            url: "/agregar-carpeta",
            data: parametros,
            method: "POST",
            dataType: "json",
            success: function (respuesta) {
                alert("Se ha creado la carpeta exitosamente");
                $('#crearCarpeta').modal('hide');
                cargarCarpetas();
            }
        });
    }
});

$("#guardarArchivo").click(function () {
    if ($("#nombreArchivo").val() == "") {
        alert("Ingrese un nombre para el archivo");
    } else {
        var parametros = "archivo=" + $("#nombreArchivo").val() + "&lenguaje=" + $("#lenguaje").val() + "&carpeta=" + $("#carpetaActual").val();
        $.ajax({
            url: "/agregar-archivo",
            data: parametros,
            method: "POST",
            dataType: "json",
            success: function (respuesta) {
                alert("Se ha creado el archivo exitosamente");
                $('#crearArchivo').modal('hide');
                cargarCarpetas();
            }
        });
    }
});



function cargarCarpetas() {
    $.ajax({
        url: "/obtener-carpetas",
        method: "GET",
        data: "carpetapadre=" + $("#carpetaActual").val(),
        dataType: "json",
        success: function (respuesta) {
            $("#container").html("");
            for (var i = 0; i < respuesta.length; i++) {
                $("#container").append(
                    `<div class="col-xl-1 col-lg-1 col-md-2 col-sm4 col-4 d-none d-sm-block form-main">
                    <div class="col-12  archivo text-center">
                      <div onclick="infoCarpeta(${respuesta[i].CODIGO_CARPETA})" ondblclick="cambiarCarpeta(${respuesta[i].CODIGO_CARPETA})">
                        <img src="img/folder.png" class="mx-auto" width="90%">
                        <p class="nombre">${respuesta[i].NOMBRE_CARPETA}</p>
                      </div>
      
                    </div>
                  </div>`
                );
            }
            cargarArchivos();
        }
    });
}

function cargarArchivos() {
    $.ajax({
        url: "/obtener-archivos",
        method: "GET",
        data: "carpetapadre=" + $("#carpetaActual").val(),
        dataType: "json",
        success: function (respuesta) {
            for (var i = 0; i < respuesta.length; i++) {
                $("#container").append(
                    `<div class="col-xl-1 col-lg-1 col-md-2 col-sm4 col-4 d-none d-sm-block form-main">
                    <div class="col-12  archivo text-center">
                      <div onclick="infoArchivo(${respuesta[i].CODIGO_ARCHIVO})" ondblclick="abrirArchivo(${respuesta[i].CODIGO_ARCHIVO})">
                        <img src="img/file.png" class="mx-auto" width="90%">
                        <p class="nombre">${respuesta[i].NOMBRE_ARCHIVO}</p>
                      </div>
      
                    </div>
                  </div>`
                );
            }
        }
    });
}

function infoCarpeta(codigoCarpeta) {
    $("#table").html("");
    $("#tablaNombre").html("");
    $.ajax({
        url: "/info-carpeta",
        method: "GET",
        data: "carpeta=" + codigoCarpeta,
        dataType: "json",
        success: function (respuesta) {
            $("#tablaNombre").html(respuesta.NOMBRE_CARPETA);
            var fecha = respuesta.FECHA_CREACION.split(/[- : T .]/);
            var fechaCreacion = new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3], fecha[4], fecha[5]);
            var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            fechaCreacion = fechaCreacion.toLocaleString("es-ES", options);

            var fecham = respuesta.FECHA_MODIFICACION.split(/[- : T .]/);
            var fechaModificacion = new Date(fecham[0], fecham[1] - 1, fecham[2], fecham[3], fecham[4], fecham[5]);
            fechaModificacion = fechaModificacion.toLocaleString("es-ES", options);

            $("#table").append(
                `<tbody>
                <tr>
                  <th>Nombre: </th>
                  <th>${respuesta.NOMBRE_CARPETA}</th>
                </tr>
                <tr>
                  <th>Propietario: </th>
                  <th>${respuesta.USUARIO}</th>
                </tr>
                <tr>
                  <th>Fecha creación: </th>
                  <th>${fechaCreacion}</th>
                </tr>
                <tr>
                    <th>Fecha última modificación: </th>
                    <th>${fechaModificacion}</th>
                  </tr>
              </tbody>`
            );

        }
    });
}

function infoArchivo(codigoArchivo) {
    $("#table").html("");
    $("#tablaNombre").html("");
    $.ajax({
        url: "/info-archivo",
        method: "GET",
        data: "archivo=" + codigoArchivo,
        dataType: "json",
        success: function (respuesta) {
            $("#tablaNombre").html(respuesta.NOMBRE_ARCHIVO);
            var fecha = respuesta.FECHA_CREACION.split(/[- : T .]/);
            var fechaCreacion = new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3], fecha[4], fecha[5]);
            var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
            fechaCreacion = fechaCreacion.toLocaleString("es-ES", options);

            var fecham = respuesta.FECHA_MODIFICACION.split(/[- : T .]/);
            var fechaModificacion = new Date(fecham[0], fecham[1] - 1, fecham[2], fecham[3], fecham[4], fecham[5]);
            fechaModificacion = fechaModificacion.toLocaleString("es-ES", options);

            $("#table").append(
                `<tbody>
                <tr>
                  <th>Nombre: </th>
                  <th>${respuesta.NOMBRE_ARCHIVO}</th>
                </tr>
                <tr>
                  <th>Lenguaje: </th>
                  <th>${respuesta.LENGUAJE}</th>
                </tr>
                <tr>
                  <th>Propietario: </th>
                  <th>${respuesta.USUARIO}</th>
                </tr>
                <tr>
                  <th>Fecha creación: </th>
                  <th>${fechaCreacion}</th>
                </tr>
                <tr>
                    <th>Fecha última modificación: </th>
                    <th>${fechaModificacion}</th>
                  </tr>
              </tbody>`
            );

        }
    });
}

function abrirArchivo(codigoArchivo) {
    $.ajax({
        url: "/abrir-archivo",
        data: "codigoarchivo=" + codigoArchivo,
        method: "POST",
        dataType: "text",
        success: function (respuesta) {
            window.location.href = "archivo.html";
        }
    });
}

function cambiarCarpeta(codigoCarpeta) {
    $('#carpetaActual').val(codigoCarpeta);
    cargarCarpetas();
}

//cargar lenguajes
$("#btnArchivo").click(function () {
    $("#lenguaje").html("");
    $.ajax({
        url: "/obtener-lenguajes",
        method: "GET",
        dataType: "json",
        success: function (respuesta) {
            for (var i = 0; i < respuesta.length; i++) {
                $("#lenguaje").append(`<option value="${respuesta[i].CODIGO_LENGUAJE}">${respuesta[i].NOMBRE_LENGUAJE}</option>`);
            }
        }
    });
});


