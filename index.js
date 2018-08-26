var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var credenciales = {
    user: "root",
    password: "",
    port: "3306",
    host: "localhost",
    database: "bd_proyecto"
};

//Exponer una carpeta como publica, unicamente para archivos estaticos: .html, imagenes, .css, .js
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session(
    {
        secret: "ASDFE$%#%", resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 600000
        }
    }));

var log = express.static("logeado");
app.use(
    function (peticion, respuesta, next) {
        if (peticion.session.codigoUsuario) {
            log(peticion, respuesta, next);
        }
        else
            return next();
    }
);

function verificarAutenticacion(peticion, respuesta, next) {
    if (peticion.session.codigoUsuario)
        return next();
    else
        respuesta.send("ERROR, ACCESO NO AUTORIZADO");
}

app.post("/registrar", function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `INSERT INTO tbl_usuarios(USERNAME, CORREO, CONTRASENA, NOMBRE, APELLIDO, CODIGO_PLAN) 
    VALUES (?,?,sha1(?),?,?,1)`;

    conexion.query(
        sql,
        [request.body.username, request.body.email, request.body.contrasena, request.body.nombre, request.body.apellido],
        function (err, result) {
            if (err) throw err;
            response.send(result);
        }
    );
});

app.post("/login", function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    conexion.query("SELECT codigo_usuario, correo, username, codigo_plan FROM tbl_usuarios WHERE correo=? and contrasena=sha1(?)",
        [peticion.body.email, peticion.body.contrasena],
        function (err, data, fields) {
            if (data.length > 0) {
                peticion.session.codigoUsuario = data[0].codigo_usuario;
                peticion.session.codigoPlan = data[0].codigo_plan;
                peticion.session.username = data[0].username;
                data[0].estatus = 0;
                respuesta.send(data[0]);
            } else {
                respuesta.send({ estatus: 1, mensaje: "Login fallido" });
            }

        }
    );
});

app.get("/logout", function (peticion, respuesta) {
    peticion.session.destroy();
    respuesta.redirect("index.html");
});

app.post("/agregar-carpeta", function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `INSERT INTO tbl_carpetas(NOMBRE_CARPETA, FECHA_CREACION, CODIGO_USUARIO_DUENO, CODIGO_PRIVACIDAD, CODIGO_CARPETA_PADRE) 
    VALUES (?,NOW(),?,?,?)`;

    conexion.query(
        sql,
        [peticion.body.carpeta, peticion.session.codigoUsuario, peticion.body.privacidad, peticion.body.carpetapadre],
        function (err, result) {
            if (err) throw err;
            respuesta.send(result);
        }
    );
});

app.post("/agregar-archivo", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `INSERT INTO tbl_archivo(NOMBRE_ARCHIVO, FECHA_CREACION, PESO_ARCHIVO_BITS, CODIGO_CARPETA, CODIGO_LENGUAJE) 
    VALUES (?,NOW(),0,?,?)`;

    conexion.query(
        sql,
        [peticion.body.archivo, peticion.body.carpeta, peticion.body.lenguaje],
        function (err, result) {
            if (err) throw err;
            respuesta.send(result);
        }
    );
});

app.post("/carpeta-inicial", function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    conexion.query(`SELECT CODIGO_CARPETA FROM tbl_carpetas WHERE (NOMBRE_CARPETA = "inicial") AND (CODIGO_USUARIO_DUENO = ?)`,
        [peticion.session.codigoUsuario],
        function (err, data, fields) {
            if (data.length > 0) {
                data[0].estatus = 0;
                respuesta.send(data[0]);
            } else {
                respuesta.send({ estatus: 1, mensaje: "Login fallido" });
            }

        }
    );
});

app.get("/obtener-carpetas", function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT CODIGO_CARPETA, NOMBRE_CARPETA FROM tbl_carpetas WHERE (CODIGO_USUARIO_DUENO = ?) AND (CODIGO_CARPETA_PADRE = ?)`;
    var carpetas = [];
    conexion.query(sql,
        [
            request.session.codigoUsuario,
            request.query.carpetapadre
        ])
        .on("result", function (resultado) {
            carpetas.push(resultado);
        })
        .on("end", function () {
            response.send(carpetas);
        });
});

app.get("/carpetas-compartidas", function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT * FROM tbl_carpetas WHERE CODIGO_CARPETA IN (SELECT CODIGO_CARPETA FROM tbl_usuarios_x_carpeta WHERE (CODIGO_USUARIO = ?))    `;
    var carpetas = [];
    conexion.query(sql,
        [request.session.codigoUsuario])
        .on("result", function (resultado) {
            carpetas.push(resultado);
        })
        .on("end", function () {
            response.send(carpetas);
        });
});

app.get("/obtener-archivos", verificarAutenticacion, function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT CODIGO_ARCHIVO, NOMBRE_ARCHIVO FROM tbl_archivo WHERE CODIGO_CARPETA = ?`;
    var archivos = [];
    conexion.query(sql,
        [
            request.query.carpetapadre
        ])
        .on("result", function (resultado) {
            archivos.push(resultado);
        })
        .on("end", function () {
            response.send(archivos);
        });
});

app.get("/archivos-compartidos", function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT * FROM tbl_archivo WHERE CODIGO_ARCHIVO IN (SELECT CODIGO_ARCHIVO FROM tbl_usuarios_x_archivo WHERE (CODIGO_USUARIO = ?))    `;
    var carpetas = [];
    conexion.query(sql,
        [request.session.codigoUsuario])
        .on("result", function (resultado) {
            carpetas.push(resultado);
        })
        .on("end", function () {
            response.send(carpetas);
        });
});

app.get("/obtener-lenguajes", function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT CODIGO_LENGUAJE, NOMBRE_LENGUAJE FROM tbl_lenguaje`;
    var lenguajes = [];
    conexion.query(sql)
        .on("result", function (resultado) {
            lenguajes.push(resultado);
        })
        .on("end", function () {
            response.send(lenguajes);
        });
});

app.get("/info-carpeta", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT A.NOMBRE_CARPETA AS NOMBRE_CARPETA, A.FECHA_CREACION AS FECHA_CREACION, 
                IFNULL(A.FECHA_ULTIMA_MODIFICACION, A.FECHA_CREACION) AS FECHA_MODIFICACION, B.USERNAME AS USUARIO 
                FROM tbl_carpetas A
                INNER JOIN tbl_usuarios B
                ON A.CODIGO_USUARIO_DUENO = B.CODIGO_USUARIO
                WHERE A.CODIGO_CARPETA = ?`;
    conexion.query(sql,
        [peticion.query.carpeta],
        function (err, data, fields) {
            if (data.length > 0) {
                respuesta.send(data[0]);
            } else {
                respuesta.send({ estatus: 1, mensaje: "Carpeta inválida" });
            }

        }
    );
});

app.get("/info-archivo", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT A.NOMBRE_ARCHIVO AS NOMBRE_ARCHIVO, A.FECHA_CREACION AS FECHA_CREACION,
                IFNULL(A.FECHA_ULTIMA_MODIFICACION, A.FECHA_CREACION) AS FECHA_MODIFICACION, B.NOMBRE_LENGUAJE AS LENGUAJE, D.USERNAME AS USUARIO
                FROM tbl_archivo A
                INNER JOIN tbl_lenguaje B 
                ON A.CODIGO_LENGUAJE = B.CODIGO_LENGUAJE
                INNER JOIN tbl_carpetas C 
                ON A.CODIGO_CARPETA = C.CODIGO_CARPETA
                INNER JOIN tbl_usuarios D 
                ON C.CODIGO_USUARIO_DUENO = D.CODIGO_USUARIO
                WHERE A.CODIGO_ARCHIVO = ? `;
    conexion.query(sql,
        [peticion.query.archivo],
        function (err, data, fields) {
            if (data.length > 0) {
                respuesta.send(data[0]);
            } else {
                respuesta.send({ estatus: 1, mensaje: "Archivo inválido" });
            }

        }
    );
});

app.post("/abrir-archivo", function (peticion, respuesta) {
    respuesta.cookie("archivo", peticion.body.codigoarchivo);
    respuesta.send("Archivo por abrir ");
});

app.post("/cargar-archivo", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    conexion.query(`SELECT A.NOMBRE_ARCHIVO AS NOMBRE_ARCHIVO, A.CONTENIDO_ARCHIVO AS CONTENIDO_ARCHIVO, B.NOMBRE_LENGUAJE AS LENGUAJE
                    FROM tbl_archivo A
                    INNER JOIN tbl_lenguaje B 
                    ON A.CODIGO_LENGUAJE = B.CODIGO_LENGUAJE
                    WHERE A.CODIGO_ARCHIVO = ? `,
        [peticion.cookies.archivo],
        function (err, data, fields) {
            if (data.length > 0) {
                respuesta.send(data[0]);
            } else {
                respuesta.send({ estatus: 1, mensaje: "No existe el archivo" });
            }

        }
    );
});

app.post("/guardar-archivo", verificarAutenticacion, function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `UPDATE tbl_archivo SET CONTENIDO_ARCHIVO = ?, FECHA_ULTIMA_MODIFICACION = NOW() WHERE CODIGO_ARCHIVO = ?`;

    conexion.query(
        sql,
        [request.body.contenido, request.cookies.archivo],
        function (err, result) {
            if (err) throw err;
            response.send(result);
        }
    );
});

app.post("/agregar-usuario-archivo", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var usuario = "";
    conexion.query(
        `SELECT CODIGO_USUARIO FROM tbl_usuarios WHERE username = ?`,
        [peticion.body.usuario],
        function (err, data, fields) {
            if (data.length > 0) {
                usuario = data[0].CODIGO_USUARIO;
                var sql = `INSERT INTO tbl_usuarios_x_archivo(CODIGO_USUARIO, CODIGO_ARCHIVO, CODIGO_ACCESO) 
                VALUES (?, ?, ?)`;

                conexion.query(
                    sql,
                    [usuario, peticion.cookies.archivo, peticion.body.acceso],
                    function (err, result) {
                        if (err) throw err;
                        respuesta.send(result);
                    }
                );
            } else {
                respuesta.send({ estatus: 1, mensaje: "Usuario no encontrado" });
            }

        }
    );
});

app.post("/agregar-usuario-carpeta", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var usuario = "";
    conexion.query(
        `SELECT CODIGO_USUARIO FROM tbl_usuarios WHERE username = ?`,
        [peticion.body.usuario],
        function (err, data, fields) {
            if (data.length > 0) {
                usuario = data[0].CODIGO_USUARIO;
                var sql = `INSERT INTO tbl_usuarios_x_carpeta(CODIGO_USUARIO, CODIGO_CARPETA, CODIGO_ACCESO) 
                        VALUES (?, ?, ?)`;

                conexion.query(
                    sql,
                    [usuario, peticion.body.carpeta, peticion.body.acceso],
                    function (err, result) {
                        if (err) throw err;
                        respuesta.send(result);
                    }
                );
            } else {
                respuesta.send({ estatus: 1, mensaje: "Usuario no encontrado" });
            }

        }
    );
});

app.get("/info-perfil", verificarAutenticacion, function (peticion, respuesta) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `SELECT USERNAME, CORREO, A.NOMBRE, APELLIDO, IFNULL(DATE(FECHA_NACIMIENTO), "-") AS FECHA_NACIMIENTO, IFNULL(GENERO, "-") AS GENERO, B.NOMBRE AS NOMBRE_PLAN
                FROM tbl_usuarios A
                INNER JOIN tbl_planes B 
                ON A.CODIGO_PLAN = B.CODIGO_PLAN
                WHERE CODIGO_USUARIO = ?`;
    conexion.query(sql,
        [peticion.session.codigoUsuario],
        function (err, data, fields) {
            if (data.length > 0) {
                respuesta.send(data[0]);
            } else {
                peticion.session.destroy();
                respuesta.send({ estatus: 1, mensaje: "Usuario inválido" });
            }

        }
    );
});

app.post("/actualizar-usuario", verificarAutenticacion, function (request, response) {
    var conexion = mysql.createConnection(credenciales);
    var sql = `UPDATE tbl_usuarios SET USERNAME=?, CORREO=?, NOMBRE=?, APELLIDO=?, 
    FECHA_NACIMIENTO=?, GENERO=? WHERE CODIGO_USUARIO = ?`;

    conexion.query(
        sql,
        [request.body.username, request.body.correo, request.body.nombre, 
        request.body.apellido, request.body.nacimiento, request.body.genero, request.session.codigoUsuario],
        function (err, result) {
            if (err) throw err;
            response.send(result);
        }
    );
});

//Crear y levantar el servidor web.
app.listen(3000);