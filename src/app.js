require('./config/config')
const express = require('express');;
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


const dirPublic = path.join(__dirname, "../public")
app.use(express.static(dirPublic))


// let contador = 0
const { Usuarios } = require('./usuarios');
const usuarios = new Usuarios();

io.on('connection', client => {

	console.log("un usuario se ha conectado")

	// client.emit("mensaje", "Bienvenido a mi página")

	// client.on("mensaje", (informacion) =>{
	// console.log(informacion)
	// })

	// client.on("contador", () =>{
	// 	contador ++
	// 	console.log(contador)
	// 	io.emit("contador", contador )
	// })

	client.on('usuarioNuevo', (usuario) =>{
		let listado = usuarios.agregarUsuario(client.id, usuario)
		console.log(listado)
		let texto = `Se ha conectado ${usuario}`
		io.emit('nuevoUsuario', texto )
	})

	client.on('disconnect',()=>{
		let usuarioBorrado = usuarios.borrarUsuario(client.id)
		let texto = `Se ha desconectado ${usuarioBorrado.nombre}`
		io.emit('usuarioDesconectado', texto)
			})

	client.on("texto", (text, callback) =>{
		let usuario = usuarios.getUsuario(client.id)
		let texto = `${usuario.nombre} : ${text}`
		
		io.emit("texto", (texto))
		callback()
	})

	client.on("textoPrivado", (text, callback) =>{
		let usuario = usuarios.getUsuario(client.id)
		let texto = `${usuario.nombre} : ${text.mensajePrivado}`
		let destinatario = usuarios.getDestinatario(text.destinatario)
		client.broadcast.to(destinatario.id).emit("textoPrivado", (texto))
		callback()
	})

	
});

server.listen(process.env.PORT, (err) => {
	console.log ('servidor en el puerto ' + process.env.PORT)
});