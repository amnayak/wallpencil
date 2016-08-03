module.exports = function(app,io){

	app.get('/', function(req, res){
		res.render('home'); //render home view
	});

	app.get('/create', function(req,res){
		var id = Math.round((Math.random() * 1000000));
		res.redirect('canvas/'+id);
	});

	app.get('/canvas/:id', function(req,res){
			// Listen for connections
			io.sockets.on('connection', function (socket) {
				socket.on('create', function(data) {
					data["uid"].room = data["rid"]; //set user's room
				    socket.join(data["rid"]); //join room
				  });
					socket.on('mousemove', function (data) {
							socket.broadcast.to(data["current_room"]).emit('moving', data);
						});
					});
		res.render('canvas'); //render canvas view
	});
};
