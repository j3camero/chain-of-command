const config = require('./config');
const mysql = require('mysql');

let connected = false;
let connection;
let failedAttempts = 0;

function isConnected() {
    return connected;
}

function getConnection() {
    return connection;
}

function handleDisconnect() {
    console.log('Connecting to database.');
    connection = mysql.createConnection(config.sqlConfig);

    connection.connect(function(err) {
	if (err) {
	    console.log('error when connecting to db:', err);
	    failedAttempts += 1;
	    if (failedAttempts > 100) {
		throw 'Could not connect to the DB after many tries.';
	    } else {
		setTimeout(handleDisconnect, 5000);
	    }
	    return;
	}
	console.log('Database connected.');
	connected = true;
	failedAttempts = 0;
    });

    connection.on('error', function(err) {
	connected = false;
	console.log('db error:', err);
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
	    handleDisconnect();
	} else {
	    throw err;
	}
    });
}

handleDisconnect();

// Send a simple query periodically to keep the connection alive.
setInterval(function () {
    if (connected) {
	connection.query('SELECT 1');
    }
}, 8 * 60 * 1000);

module.exports = {
    getConnection,
    isConnected,
};
