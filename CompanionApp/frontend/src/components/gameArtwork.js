const FALLBACK_ARTWORKS = [
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=85',
]

export function getGameArtwork(game) {
  const suppliedArtwork = game.artworkUrl || game.coverUrl || game.imageUrl || game.iconUrl || game.cover
  if (typeof suppliedArtwork === 'string' && /^https?:\/\//i.test(suppliedArtwork)) {
    return suppliedArtwork
  }

  const seed = `${game.titleId || ''}${game.titleName || ''}`
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)
  return FALLBACK_ARTWORKS[seed % FALLBACK_ARTWORKS.length]
}
