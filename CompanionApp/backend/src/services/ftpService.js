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

function downloadDatabase() {
	if (!activeDownload) {
		activeDownload = downloadDatabaseOnce().finally(() => {
			activeDownload = null;
		});
	}

	return activeDownload;
}

async function downloadDatabaseOnce() {
	const host = process.env.PS5_IP?.trim();
	if (!host) {
		throw new Error('Set a valid PS5_IP in the backend environment.');
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

module.exports = { downloadDatabase };
