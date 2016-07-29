$(function(){
	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}
	var room_id = Number(window.location.pathname.match(/\/canvas\/(\d+)$/)[1]);
	document.title = "Private Canvas | " + room_id;
	var url = 'http://localhost:8000/';
	document.getElementById('link').value = url + 'canvas/' + room_id;

	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');

	// Generate an unique ID and color
	var id = Math.round($.now()*Math.random());
	var color = '#' + Math.floor(Math.random() * 16777215).toString(16);

	// A flag for drawing activity
	var drawing = false;

	var clients = {};
	var cursors = {};

	var socket = io.connect();
	socket.emit('create', {"rid" : room_id, "uid" :id});

	socket.on('moving', function (data) {

		if(! (data.id in clients)){
			//create a cursor for new user
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}

		// Move the mouse pointer
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});

		// If user is drawing
		if(data.drawing && clients[data.id]){
			// draw line
			ctx.strokeStyle = data.color;
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}

		// save current location for next line
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});

	var prev = {};

	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;

		instructions.fadeOut();
	});

	doc.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	var lastEmit = $.now();

	doc.on('mousemove',function(e){
		if($.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id,
				'current_room' : room_id,
				'color' : color
			});
			lastEmit = $.now();
		}

		//draw line for current user
		if(drawing){
			ctx.strokeStyle = color;
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

	// Remove inactive users after 100s
	setInterval(function(){
		for(ident in clients){
			if($.now() - clients[ident].updated > 100000){
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}

	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}
});
