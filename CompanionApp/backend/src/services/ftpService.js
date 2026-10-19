const path = require('path');
const { Client } = require('basic-ftp');

async function downloadDatabase() {
	const host = process.env.PS5_IP;
	const port = Number(process.env.PS5_FTP_PORT);

	if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error('Set a valid PS5_IP and PS5_FTP_PORT in the backend environment.');
	}

	const client = new Client();
	const localDbPath = path.resolve(__dirname, '../../app.db');

	try {
		await client.access({ host, port });
		await client.downloadTo(localDbPath, '/system_data/priv/mms/app.db');
		return localDbPath;
	} finally {
		client.close();
	}
}

module.exports = { downloadDatabase };
