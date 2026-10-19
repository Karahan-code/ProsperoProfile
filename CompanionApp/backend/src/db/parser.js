const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const defaultDatabasePath = path.resolve(__dirname, '../../local_app.db');

function getInstalledGames(databasePath = defaultDatabasePath) {
	return new Promise((resolve, reject) => {
		const database = new sqlite3.Database(databasePath, sqlite3.OPEN_READONLY, (openError) => {
			if (openError) {
				reject(openError);
				return;
			}

			database.all(
				`SELECT titleName, titleId
				 FROM tbl_appbrowse_00
				 WHERE titleName IS NOT NULL
				   AND titleName <> ''
				   AND titleId IS NOT NULL
				   AND titleId <> ''
				 ORDER BY titleName COLLATE NOCASE`,
				(queryError, rows) => {
					database.close((closeError) => {
						if (queryError) {
							reject(queryError);
						} else if (closeError) {
							reject(closeError);
						} else {
							resolve(rows);
						}
					});
				}
			);
		});
	});
}

module.exports = { getInstalledGames };
