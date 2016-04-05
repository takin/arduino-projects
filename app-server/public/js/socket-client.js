'use strict';

$(document).ready(function() {

	var socket = io();

	socket.on('message', function(data) {
		appendData(data);
	});
});


function appendData(data) {

	var tbody = document.querySelector('tbody');
	var tableRow = document.createElement('tr');
	
	var sensorRow = document.createElement('td');
	var sensorcolumn = document.createElement('td');
	var sensorReadingTime = document.createElement('td');
	var sensorReadingValue = document.createElement('td');

	var time = new Date(data.time);

	sensorRow.appendChild(document.createTextNode(data.sensor.row));
	sensorcolumn.appendChild(document.createTextNode(data.sensor.column));
	sensorReadingTime.appendChild(document.createTextNode(time.getFullYear() + '-' + time.getMonth() + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + '.' + time.getMilliseconds()));
	sensorReadingValue.appendChild(document.createTextNode(data.value));

	tableRow.appendChild(sensorRow);
	tableRow.appendChild(sensorcolumn);
	tableRow.appendChild(sensorReadingTime);
	tableRow.appendChild(sensorReadingValue);

	tbody.appendChild(tableRow);
	
}
