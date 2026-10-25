const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { Client, enterPassiveModeIPv4 } = require('basic-ftp');

const FTP_PORTS = [1337, 2121, 21];
const FTP_CONNECT_TIMEOUT_MS = 4000;
const FTP_TRANSFER_TIMEOUT_MS = 30000;
const HTTP_TIMEOUT_MS = 15000;
const REMOTE_DATABASE_PATH = '/system_data/priv/mms/app.db';

let activeDownload = null;
let activeConsoleIp = null;

async function connectToConsole(ipAddress) {
	if (!isPrivateIpv4(ipAddress)) {
		throw new Error('Enter a valid private IPv4 address for your console.');
	}

	for (const port of FTP_PORTS) {
		const client = new Client(FTP_CONNECT_TIMEOUT_MS);
		client.prepareTransfer = enterPassiveModeIPv4;

		try {
			await withTimeout(
				client.access({ host: ipAddress, port, secure: false }),
				FTP_CONNECT_TIMEOUT_MS,
				`FTP connection to ${ipAddress}:${port} timed out.`
			);
			setConsoleHost(ipAddress);
			return { host: ipAddress, port };
		} catch (error) {
			console.info(`[FTP] Connection check on port ${port} failed: ${getErrorCode(error)}`);
		} finally {
			client.close();
		}
	}

	throw new Error('Connection timed out. Check IP and payload.');
}

function setConsoleHost(ipAddress) {
	if (!isPrivateIpv4(ipAddress)) {
		throw new Error('Enter a valid private IPv4 address for your console.');
	}
	activeConsoleIp = ipAddress;
}

function isPrivateIpv4(ipAddress) {
	if (typeof ipAddress !== 'string') return false;
	const octets = ipAddress.split('.');
	if (octets.length !== 4 || octets.some((octet) => !/^\d{1,3}$/.test(octet))) return false;

	const [first, second, third, fourth] = octets.map(Number);
	if ([first, second, third, fourth].some((octet) => octet < 0 || octet > 255)) return false;
	return first === 10
		|| (first === 172 && second >= 16 && second <= 31)
		|| (first === 192 && second === 168);
}

function downloadDatabase(ipAddress = activeConsoleIp || process.env.PS5_IP?.trim()) {
	if (!activeDownload) {
		activeDownload = downloadDatabaseOnce(ipAddress).finally(() => {
			activeDownload = null;
		});
	}

	return activeDownload;
}

async function downloadDatabaseOnce(host) {
	if (!host) {
		throw new Error('Connect a console or set a valid PS5_IP in the backend environment.');
	}

	const localDbPath = path.resolve(__dirname, '../../local_app.db');
	const temporaryPath = `${localDbPath}.part`;
	const ftpFailures = [];

	for (const port of FTP_PORTS) {
		const client = new Client(FTP_TRANSFER_TIMEOUT_MS);
		client.prepareTransfer = enterPassiveModeIPv4;

		try {
			console.log(`[FTP] Trying FTP on port ${port}...`);
			await withTimeout(
				client.access({ host, port, secure: false }),
				FTP_CONNECT_TIMEOUT_MS,
				`FTP connection to ${host}:${port} timed out.`
			);
			await fsPromises.rm(temporaryPath, { force: true });
			await client.downloadTo(temporaryPath, REMOTE_DATABASE_PATH);
			await fsPromises.rename(temporaryPath, localDbPath);
			console.log(`[FTP] Download successful on port ${port}: ${localDbPath}`);
			return localDbPath;
		} catch (error) {
			const code = getErrorCode(error);
			const message = error?.message ?? String(error);
			const timedOut = code === 'ETIMEDOUT' || error?.name === 'TimeoutError';
			const nextPort = FTP_PORTS[FTP_PORTS.indexOf(port) + 1];
			const nextStep = nextPort ? `trying ${nextPort}` : 'moving to HTTP fallback';
			const reason = timedOut ? `timeout (${code})` : `failed (${code})`;

			console.log(`[FTP] Port ${port} ${reason}: ${message}; ${nextStep}...`);
			ftpFailures.push(`port ${port}: ${code} ${message}`);
			await fsPromises.rm(temporaryPath, { force: true }).catch(() => {});
		} finally {
			client.close();
		}
	}

	console.log('[HTTP] All FTP ports failed, attempting Web File Manager fallback...');
	const url = `http://${host}:8080${REMOTE_DATABASE_PATH}`;

	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}
		if (!response.body) {
			throw new Error('HTTP response did not contain a file body.');
		}

		await fsPromises.rm(temporaryPath, { force: true });
		await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(temporaryPath));
		await fsPromises.rename(temporaryPath, localDbPath);
		console.log(`[HTTP] Download successful via HTTP: ${localDbPath}`);
		return localDbPath;
	} catch (error) {
		const code = getErrorCode(error);
		const message = error?.message ?? String(error);
		await fsPromises.rm(temporaryPath, { force: true }).catch(() => {});
		console.error(`[HTTP] Web File Manager fallback failed (${code}): ${message}`);
		throw new Error(
			`Database download failed. FTP attempts: ${ftpFailures.join('; ')}. HTTP fallback: ${code} ${message}`,
			{ cause: error }
		);
	}
}

function getErrorCode(error) {
	return error?.code ?? error?.errno ?? error?.cause?.code ?? error?.name ?? 'UNKNOWN';
}

function withTimeout(promise, timeoutMs, message) {
	let timer;
	const timeout = new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			const error = new Error(message);
			error.code = 'ETIMEDOUT';
			reject(error);
		}, timeoutMs);
	});

	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

module.exports = { connectToConsole, downloadDatabase, setConsoleHost };
