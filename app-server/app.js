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

// array object hasil pembacaan terakhir dari masing-masing sensor
var lastReadingSensors = [];

// var dumpSesnsorReading = ['1x1=10,1x2=40,1x3=13\n','1x1=10,1x2=40,1x3=13\n','1x1=10,1x2=40,1x3=15\n','1x1=10,1x2=20,1x3=15\n','1x1=5,1x2=40,1x3=15\n'];

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	console.log('client is connected!');

	
	sp.on('data', (sensorData) => {

		handleSensorData(sensorData, (reportData) => {
			socket.emit('message',reportData);
		});

	});
	

	// setInterval(() => {
	// 	var i = Math.floor(Math.random() * dumpSesnsorReading.length);
	// 	handleSensorData(dumpSesnsorReading[i], (reportData) => {
	// 		console.log(reportData);
	// 		socket.emit('message', reportData);
	// 	});
	// },5000);

});

http.listen(8000, () => {
	console.log('server is running on port 8000');
});


function handleSensorData(data, callback) {

	/*
	Kiriman data dari sensor dalam bentuk: 1x1=20,1x2=100,1x3=12
	dimana angka di depan tanda 'x' menunjukkan baris rak dan angka di belakangnya
	menunjukkan nomor kolom. Angka setelah '=' menunjukkan nilai pembacaan sensor
	*/
	// Pertama-tama kita pecah terlebih dahulu data menjadi array masing-masing sensor
	var sensors = data.split(',');

	// Untuk masing-masing sensor kita lakukan proses pengecekan 
	// dan pembentukan objek yang akan dikirimkan ke sisi client sebagai report
	sensors.forEach( (sensor) => {

		var sensorDataItems 	= sensor.split('='),
			sensorLocation 		= sensorDataItems[0].split('x'),
			sensorDataObject = {
				sensor: {
					row: sensorLocation[0],
					column: sensorLocation[1]
				},
				value: parseInt(sensorDataItems[1])
			};
		var lastReadingCurrentSensor = lastReadingSensors.filter((item) => {
			return item.sensor.row === sensorDataObject.sensor.row && item.sensor.column === sensorDataObject.sensor.column;
		});

		if ( lastReadingCurrentSensor.length === 0 ) {
			sensorDataObject.time = new Date;
			lastReadingSensors.push(sensorDataObject);
			callback.call(this, sensorDataObject);

		} else {
			var current = lastReadingCurrentSensor.pop();
			if( sensorDataObject.value !== current.value && sensorDataObject.value != 0) {
				sensorDataObject.time = new Date;

				// ganti isi array dengan yang baru
				lastReadingSensors[lastReadingSensors.indexOf(current)]  = sensorDataObject;
				callback.call(this, sensorDataObject);
			}
		}
	});
}