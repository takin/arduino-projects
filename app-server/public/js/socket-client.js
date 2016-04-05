'use strict';

$(document).ready(function() {
	
	var socket = io();

	socket.on('message', function(message) {
		console.log(message);
	});
	
})
