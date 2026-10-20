const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { addGameAssets } = require('../services/imageService');

const defaultDatabasePath = path.resolve(__dirname, '../../local_app.db');
const tableCandidates = ['tbl_contentinfo', 'tbl_appbrowse', 'tbl_appinfo'];

function openDatabase(databasePath) {
	return new Promise((resolve, reject) => {
		const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READONLY, (error) => {
			if (error) reject(error);
			else resolve(database);
		});
	});
}

function queryAll(database, sql, parameters = []) {
	return new Promise((resolve, reject) => {
		database.all(sql, parameters, (error, rows) => {
			if (error) reject(error);
			else resolve(rows);
		});
	});
}

function closeDatabase(database) {
	return new Promise((resolve, reject) => {
		database.close((error) => {
			if (error) reject(error);
			else resolve();
		});
	});
}

function quoteIdentifier(identifier) {
	return `"${identifier.replace(/"/g, '""')}"`;
}

async function getGames(databasePath = defaultDatabasePath) {
	const database = await openDatabase(databasePath);
	let games;

	try {
		const tables = await queryAll(
			database,
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
		);
		const tableNames = tables.map(({ name }) => name);
		const tableName = tableCandidates
			.map((candidate) => tableNames.find((name) => name.toLowerCase() === candidate)
				|| tableNames.find((name) => name.toLowerCase().startsWith(`${candidate}_`)))
			.find(Boolean);

		if (!tableName) {
			throw new Error(`No supported game table found. Checked: ${tableCandidates.join(', ')}.`);
		}

		const columns = await queryAll(database, `PRAGMA table_info(${quoteIdentifier(tableName)})`);
		const columnNames = columns.map(({ name }) => name);
		const titleIdColumn = columnNames.find((name) => name.toLowerCase() === 'titleid');
		const titleNameColumn = columnNames.find((name) => name.toLowerCase() === 'titlename');
		const appTypeColumn = columnNames.find((name) => name.toLowerCase() === 'apptype');

		if (!titleIdColumn || !titleNameColumn) {
			throw new Error(`Table ${tableName} does not contain titleId and titleName columns.`);
		}

		const titleId = quoteIdentifier(titleIdColumn);
		const titleName = quoteIdentifier(titleNameColumn);
		const conditions = [
			`${titleId} IS NOT NULL`,
			`${titleId} <> ''`,
			`${titleName} IS NOT NULL`,
			`${titleName} <> ''`,
		];
		const parameters = [];

		if (appTypeColumn) {
			conditions.push(`${quoteIdentifier(appTypeColumn)} = ?`);
			parameters.push(1);
		} else if (tableName.toLowerCase().startsWith('tbl_contentinfo')) {
			throw new Error(`Table ${tableName} is missing the appType column required to identify games.`);
		} else {
			conditions.push(`(${titleId} LIKE ? OR ${titleId} LIKE ?)`);
			parameters.push('PPSA%', 'CUSA%');
		}

		games = await queryAll(
			database,
			`SELECT ${titleId} AS titleId, ${titleName} AS titleName
			 FROM ${quoteIdentifier(tableName)}
			 WHERE ${conditions.join(' AND ')}
			 ORDER BY ${titleName} COLLATE NOCASE`,
			parameters
		);
	} finally {
		await closeDatabase(database);
	}

	return addGameAssets(games, 'titleName');
}

module.exports = { getGames };
