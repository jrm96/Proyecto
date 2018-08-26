function archivosCompartidos() {
    $.ajax({
        url: "/archivos-compartidos",
        method: "GET",
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

$(document).ready(function(){
    $.ajax({
        url: "/carpetas-compartidas",
        method: "GET",
        dataType: "json",
        success: function (respuesta) {
            console.log(respuesta);
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
            archivosCompartidos();
        }
    });
});