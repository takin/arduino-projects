var express 			= require('express'),
	app 				= express(),
	http 				= require('http').Server(app),
	io 					= require('socket.io')(http),
	serial 				= require('serialport'),
	SerialPort 			= serial.SerialPort,
	lastReadingSensors 	= [];

var sp = new SerialPort('/dev/ttyACM0', {
	baudrate: 115200,
	parser: serial.parsers.readline('\n')
});

sp.on('error', (e) => {
	console.log('Sensor not detected!');
});

// array object hasil pembacaan terakhir dari masing-masing sensor

// var dumpSesnsorReading = ['1x1=10,1x2=40,1x3=13\n','1x1=10,1x2=40,1x3=13\n','1x1=10,1x2=40,1x3=15\n','1x1=10,1x2=20,1x3=15\n','1x1=5,1x2=40,1x3=15\n'];

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

sp.on('open', () => {
	io.on('connection', (socket) => {
		console.log('a client connected');

		sp.on('data', (sensorData) => {

			var arrayOfSensorObjectData = handleSensorData(sensorData);
			sp.pause();
			arrayOfSensorObjectData.forEach(function(item) {

				var current = lastReadingSensors.filter((lastItem) => {
					return JSON.stringify(item.sensor) === JSON.stringify(lastItem.sensor);
				});

				if ( current.length === 0 ) {
					if ( item.value !== 0 ) {
						socket.emit('message', item);
						lastReadingSensors.push(item);
					}
				} else {
					current = current.pop();
					if ( item.value !== 0 && current.value !== item.value ) {
						socket.emit('message', item);
						lastReadingSensors[lastReadingSensors.indexOf(current)] = item;
					}
				}

			});
			sp.resume();
		});


	});
})

http.listen(8000, () => {
	console.log('server is running on port 8000');
});


function handleSensorData(data) {

	var returnData = [];
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
				time: new Date,
				value: parseInt(sensorDataItems[1])
			};

		returnData.push(sensorDataObject);
	});

	return returnData;
}