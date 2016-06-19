var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/resources/style.css', function(req, res) {
	res.sendFile(__dirname + '/resources/style.css');
});

app.get('/resources/main.js', function(req, res) {
	res.sendFile(__dirname + '/resources/main.js');
});

var port = 8080;
http.listen(port, function() {
	console.log("listening on *:" + port);
});

var numUsers = 0;

io.on('connection', function(socket) {
	var addedUser = false;

	//quando o client envia uma 'new message' esse listen executa
	socket.on('new message', function(msg){
		socket.broadcast.emit('new message', {
			username : socket.username,
			message : msg
		});
	});

	socket.on('add user', function(username) {
		if(addedUser) return;
		//registrando nome do usuario
		socket.username = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {
			numUsers: numUsers
		});

		socket.broadcast.emit('user joined', {
			username : socket.username,
			numUsers : numUsers
		});
	});

	//quando client emite 'typing', isso é compartilhado com os outros
	socket.on('typing', function() {
		socket.broadcast.emit('typing', {
			username : socket.username
		});
	});

	//quando client emite 'stop typing' isso é compartilhado
	socket.on('stop typing', function() {
		socket.broadcast.emit('stop typing', {
			username : socket.username
		});
	});

	//quando user disconecta...
	socket.on('disconnect', function() {
		if(addedUser) {
			--numUsers;

			//avisa a todos que o client saiu
			socket.broadcast.emit('user left', {
				username : socket.username,
				numUsers : numUsers
			});
		}
	});
});
