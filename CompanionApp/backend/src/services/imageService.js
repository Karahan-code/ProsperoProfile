const API_BASE_URL = 'https://www.steamgriddb.com/api/v2';
const REQUEST_TIMEOUT_MS = 8000;
const assetCache = new Map();

function createFallbackAssets(title) {
	const encodedTitle = encodeURIComponent(title || 'Game');
	return {
		coverUrl: `https://via.placeholder.com/600x900/1a1a1a/00ff00?text=${encodedTitle}`,
		heroUrl: `https://via.placeholder.com/1920x620/101510/9cff35?text=${encodedTitle}`,
		logoUrl: `https://via.placeholder.com/900x300/00000000/ffffff?text=${encodedTitle}`,
	};
}

async function requestData(endpoint) {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${process.env.STEAMGRIDDB_API_KEY}`,
			Accept: 'application/json',
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`SteamGridDB returned HTTP ${response.status} for ${endpoint}.`);
	}

	const payload = await response.json();
	if (!Array.isArray(payload.data)) {
		throw new Error(`SteamGridDB returned an invalid response for ${endpoint}.`);
	}
	return payload.data;
}

function firstImageUrl(items) {
	const item = items.find((asset) => typeof asset.url === 'string' && /^https:\/\//i.test(asset.url));
	return item?.url || null;
}

async function getGameAssets(title) {
	const cleanTitle = typeof title === 'string' ? title.trim() : '';
	const fallbackAssets = createFallbackAssets(cleanTitle);
	if (!cleanTitle) return fallbackAssets;

	const cacheKey = cleanTitle.toLocaleLowerCase();
	if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);

	const pendingRequest = (async () => {
		const apiKey = process.env.STEAMGRIDDB_API_KEY;
		if (!apiKey) {
			console.warn('STEAMGRIDDB_API_KEY is not configured; using fallback game artwork.');
			return fallbackAssets;
		}

		try {
			const searchResults = await requestData(`/search/autocomplete/${encodeURIComponent(cleanTitle)}`);
			const gameId = searchResults.find((result) => result.id !== undefined
				&& result.id !== null
				&& Number.isInteger(Number(result.id))
				&& Number(result.id) > 0)?.id;
			if (!gameId) return fallbackAssets;

			const [grids, heroes, logos] = await Promise.all([
				requestData(`/grids/game/${encodeURIComponent(gameId)}?dimensions=600x900`)
					.catch((error) => {
						console.warn(`Could not fetch cover art for "${cleanTitle}": ${error.message}`);
						return [];
					}),
				requestData(`/heroes/game/${encodeURIComponent(gameId)}`)
					.catch((error) => {
						console.warn(`Could not fetch hero art for "${cleanTitle}": ${error.message}`);
						return [];
					}),
				requestData(`/logos/game/${encodeURIComponent(gameId)}`)
					.catch((error) => {
						console.warn(`Could not fetch logo art for "${cleanTitle}": ${error.message}`);
						return [];
					}),
			]);

			return {
				coverUrl: firstImageUrl(grids) || fallbackAssets.coverUrl,
				heroUrl: firstImageUrl(heroes) || fallbackAssets.heroUrl,
				logoUrl: firstImageUrl(logos) || fallbackAssets.logoUrl,
			};
		} catch (error) {
			console.warn(`Could not search SteamGridDB for "${cleanTitle}": ${error.message}`);
			return fallbackAssets;
		}
	})();

	assetCache.set(cacheKey, pendingRequest);
	try {
		return await pendingRequest;
	} catch (error) {
		assetCache.delete(cacheKey);
		throw error;
	}
}

async function addGameAssets(games, titleField = 'name') {
	return Promise.all(games.map(async (game) => {
		const title = game[titleField] || game.titleName || game.name || '';
		return {
			...game,
			assets: {
				...createFallbackAssets(title),
				...(game.assets && typeof game.assets === 'object' ? game.assets : {}),
				...(await getGameAssets(title)),
			},
		};
	}));
}

module.exports = { addGameAssets, createFallbackAssets, getGameAssets };
