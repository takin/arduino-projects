var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var serial = require('serialport');
var SerialPort = serial.SerialPort;
var sp = new SerialPort('/dev/ttyACM0', {
	baudrate: 115200,
	parser: serial.parsers.readline('\n')
});

// array of sensors data
var sensorsData = [];


app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	console.log('client is connected!');

	sp.on('data', (sensorData) => {

		handleSensorData(sensorData, (dataIsChanged) => {
			if ( dataIsChanged ) {
				socket.emit('message',sensorsData);
			}
		});

	});

	sp.on('error', () => {
		socket.emmit('error','Sensor not detected!');
	});

});

http.listen(8000, () => {
	console.log('server is running on port 8000');
});



function handleSensorData(data, callback) {

	var splittedData = data.split(',');
	var dataHasChanged = false;

	splittedData.forEach(function (sensor) {

		// split item sensor dan pembacaannya
		var sensorItem = sensor.split('=');
		console.log(sensorItem);

		var sensordata = {
			time: new Date(),
			name: sensorItem[0],
			value: sensorItem[1]
		};

		if ( sensorsData.length > 0 ) {

			sensorsData.forEach(function (item) {
				if ( item.name === sensorsData.name ) {
					if ( sensorsData.value !== item.value ) {
						item.value = sensorsData.value;
						dataHasChanged = true;
					}
				}
			});

		} else {
			sensorsData.append(sensorData);
		}

	});

//	callback.call(this, dataHasChanged);
}