import { useEffect, useState } from 'react'
import { ArrowDownUp, ArrowRight, Gamepad2, Library, LoaderCircle, RefreshCw, Search, Signal } from 'lucide-react'
import GameCard from './components/GameCard.jsx'
import ProfileHeader from './components/ProfileHeader.jsx'
import { AVATAR_OPTIONS } from './components/avatarOptions.js'

const PROFILE_STORAGE_KEY = 'prosperoprofile.profile'
const STATUS_STORAGE_KEY = 'prosperoprofile.game-statuses'

function readStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readProfile() {
  const profile = readStoredValue(PROFILE_STORAGE_KEY, null)
  if (!profile || typeof profile.username !== 'string') return null

  const validAvatar = AVATAR_OPTIONS.some((avatar) => avatar.id === profile.avatarId)
  return {
    username: profile.username,
    avatarId: validAvatar ? profile.avatarId : AVATAR_OPTIONS[0].id,
  }
}

function metricNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function getPlaytimeHours(game) {
  return metricNumber(game.playtimeHours ?? game.totalPlaytimeHours ?? game.playtime?.hours ?? game.playtime)
}

function getTrophies(game) {
  const trophies = game.trophies || {}
  return {
    earned: metricNumber(game.trophiesEarned ?? game.earnedTrophies ?? trophies.earned),
    total: metricNumber(game.totalTrophies ?? game.trophiesTotal ?? trophies.total),
    bronze: metricNumber(game.bronzeTrophies ?? trophies.bronze),
    silver: metricNumber(game.silverTrophies ?? trophies.silver),
    gold: metricNumber(game.goldTrophies ?? trophies.gold),
    platinum: metricNumber(game.platinumTrophies ?? trophies.platinum),
  }
}

function summarizeGames(games) {
  const playtimeValues = games.map(getPlaytimeHours).filter((value) => value !== null)
  const trophyValues = games.map(getTrophies)
  const trophyKinds = ['bronze', 'silver', 'gold', 'platinum']
  const earnedValues = trophyValues.map((value) => value.earned).filter((value) => value !== null)
  const hasCategoryData = trophyValues.some((value) => trophyKinds.some((kind) => value[kind] !== null))
  const categoryTotals = Object.fromEntries(trophyKinds.map((kind) => {
    const values = trophyValues.map((value) => value[kind]).filter((value) => value !== null)
    return [kind, values.length ? values.reduce((total, value) => total + value, 0) : null]
  }))

  return {
    playtimeHours: playtimeValues.length ? playtimeValues.reduce((total, value) => total + value, 0) : null,
    trophies: hasCategoryData ? categoryTotals : null,
    trophyTotal: earnedValues.length
      ? earnedValues.reduce((total, value) => total + value, 0)
      : hasCategoryData
        ? Object.values(categoryTotals).reduce((total, value) => total + (value || 0), 0)
        : null,
  }
}

function ProfileSetup({ onCreate }) {
  const [username, setUsername] = useState('')
  const [avatarId, setAvatarId] = useState(AVATAR_OPTIONS[0].id)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const cleanUsername = username.trim()
    if (cleanUsername.length < 2) {
      setError('Choose a username with at least 2 characters.')
      return
    }
    onCreate({ username: cleanUsername, avatarId })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090c0e] px-5 py-10 text-slate-100 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(34,197,94,0.14),transparent_38%),radial-gradient(ellipse_at_85%_85%,rgba(14,165,233,0.13),transparent_34%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 w-full max-w-5xl">
        <a className="mb-10 inline-flex items-center gap-3 text-sm font-semibold text-white" href="#profile-setup">
          <span className="grid size-10 place-items-center rounded-lg border border-lime-300/20 bg-lime-300/10 text-lime-200">
            <Gamepad2 size={20} />
          </span>
          <span>prospero<span className="font-normal text-slate-400">profile</span></span>
        </a>

        <div className="grid overflow-hidden rounded-lg border border-white/10 bg-slate-900/65 shadow-2xl shadow-black/40 backdrop-blur-2xl md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between border-b border-white/10 bg-white/[0.025] p-7 sm:p-10 md:border-b-0 md:border-r">
            <div>
              <p className="mb-4 text-xs font-medium uppercase text-lime-200">FIRST-TIME SETUP</p>
              <h1 className="max-w-sm text-4xl font-semibold leading-tight text-white sm:text-5xl">Make this space yours.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Choose a name and an avatar for your local companion profile.</p>
            </div>
            <div className="mt-12 flex items-center gap-3 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.6)]" />
              PROFILE SAVED ON THIS DEVICE
            </div>
          </section>

          <form id="profile-setup" className="p-7 sm:p-10" onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="nickname"
              maxLength={24}
              minLength={2}
              placeholder="Your player name"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              className="h-12 w-full rounded-lg border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/50 focus:ring-2 focus:ring-lime-300/10"
              required
            />

            <div className="mb-3 mt-8 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-slate-200">Choose your avatar</h2>
              <span className="text-xs text-slate-500">{AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId)?.label}</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label="Choose an avatar">
              {AVATAR_OPTIONS.map((avatar) => {
                const Icon = avatar.icon
                const selected = avatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={avatar.label}
                    onClick={() => setAvatarId(avatar.id)}
                    className={`grid aspect-square place-items-center rounded-lg border transition ${selected ? 'border-lime-300/70 bg-lime-300/10 text-lime-200 ring-2 ring-lime-300/15' : 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-white/25 hover:bg-white/[0.07] hover:text-white'}`}
                  >
                    <Icon size={23} strokeWidth={1.7} />
                  </button>
                )
              })}
            </div>

            {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
            <button className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2 focus:ring-offset-slate-900" type="submit">
              Create Profile <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [profile, setProfile] = useState(readProfile)
  const [games, setGames] = useState([])
  const [gameStatuses, setGameStatuses] = useState(() => readStoredValue(STATUS_STORAGE_KEY, {}))
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastSynced, setLastSynced] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignoreResponse = false

    async function fetchGames() {
      try {
        const response = await fetch('/api/games')
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Could not reach the game library.')

        if (!ignoreResponse) {
          setGames(Array.isArray(payload.games) ? payload.games : [])
          setLastSynced(new Date())
        }
      } catch (loadError) {
        if (!ignoreResponse) setError(loadError.message || 'Could not reach the game library.')
      } finally {
        if (!ignoreResponse) setLoading(false)
      }
    }

    fetchGames()
    return () => {
      ignoreResponse = true
    }
  }, [refreshKey])

  function refreshLibrary() {
    setLoading(true)
    setError('')
    setRefreshKey((key) => key + 1)
  }

  function createProfile(nextProfile) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
      setProfile(nextProfile)
    } catch {
      setError('This browser could not save the profile. Check local storage settings and try again.')
    }
  }

  function editProfile() {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    setProfile(null)
  }

  function updateGameStatus(gameKey, status) {
    const nextStatuses = { ...gameStatuses, [gameKey]: status }
    setGameStatuses(nextStatuses)
    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(nextStatuses))
    } catch {
      setError('Game status could not be saved in this browser.')
    }
  }

  if (!profile) {
    return <ProfileSetup onCreate={createProfile} />
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredGames = games.filter((game) => `${game.titleName || ''} ${game.titleId || ''}`.toLowerCase().includes(normalizedQuery))
  const stats = summarizeGames(games)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 text-slate-100 sm:px-7 lg:px-10">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.08]">
        <a className="inline-flex items-center gap-3 text-sm font-semibold text-white" href="#dashboard" aria-label="ProsperoProfile home">
          <span className="grid size-9 place-items-center rounded-lg border border-lime-300/20 bg-lime-300/10 text-lime-200"><Gamepad2 size={18} /></span>
          <span>prospero<span className="font-normal text-slate-400">profile</span></span>
        </a>
        <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:flex ${error ? 'border-rose-300/15 bg-rose-300/[0.06] text-rose-200' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}>
          <Signal size={14} className={error ? 'text-rose-300' : 'text-lime-200'} />
          <span className={`size-1.5 rounded-full ${error ? 'bg-rose-300' : loading ? 'animate-pulse bg-amber-200' : 'bg-lime-300'}`} />
          {error ? 'CONSOLE OFFLINE' : loading ? 'SYNCING LIBRARY' : 'CONSOLE READY'}
        </div>
        <button className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-300 transition hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50" type="button" onClick={refreshLibrary} disabled={loading} aria-label="Refresh game library" title="Refresh library">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div id="dashboard" className="flex-1 pb-10">
        <ProfileHeader profile={profile} stats={stats} onEdit={editProfile} />

        <section className="mt-9" aria-labelledby="library-title">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-lime-200"><Library size={18} /></div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">YOUR COLLECTION</p>
                <h1 id="library-title" className="text-2xl font-semibold text-white">Game library</h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{loading ? '--' : String(games.length).padStart(2, '0')} TITLES</span>
              <span className="h-4 w-px bg-white/10" />
              <span>{lastSynced ? `SYNCED ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'NOT SYNCED'}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 border-y border-white/[0.08] py-3 sm:flex-row sm:items-center">
            <label className="flex h-10 w-full max-w-md items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-slate-500 transition focus-within:border-lime-300/40">
              <Search size={16} />
              <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" type="search" placeholder="Search games or title ID" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search games by title or title ID" />
            </label>
            <span className="inline-flex items-center gap-2 text-xs text-slate-500"><ArrowDownUp size={13} /> TITLE A-Z</span>
          </div>

          {error && (
            <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] p-4 sm:flex-row sm:items-center" role="alert">
              <div><p className="text-sm font-medium text-rose-100">Library unavailable</p><p className="mt-1 text-sm text-rose-200/70">{error}</p></div>
              <button className="inline-flex items-center gap-2 self-start text-sm text-lime-200 hover:text-lime-100 sm:self-auto" type="button" onClick={refreshLibrary}>Try again <ArrowRight size={14} /></button>
            </div>
          )}

          {loading && games.length === 0 && <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-400" role="status"><LoaderCircle size={20} className="animate-spin text-lime-200" /> Connecting to your console library...</div>}

          {!loading && !error && games.length === 0 && <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><Gamepad2 size={25} className="text-slate-500" /><p className="text-sm font-medium text-slate-200">No installed games found</p><p className="text-sm text-slate-500">Refresh after your console is connected.</p></div>}

          {!loading && !error && games.length > 0 && filteredGames.length === 0 && <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><Search size={22} className="text-slate-500" /><p className="text-sm font-medium text-slate-200">No matches</p><p className="text-sm text-slate-500">Try another title or title ID.</p></div>}

          {filteredGames.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
              {filteredGames.map((game) => {
                const gameKey = String(game.titleId || game.titleName || 'unknown')
                return <GameCard key={gameKey} game={game} status={gameStatuses[gameKey]} onStatusChange={(status) => updateGameStatus(gameKey, status)} />
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="flex min-h-12 items-center justify-between gap-4 border-t border-white/[0.08] text-[10px] text-slate-600">
        <span>PROSPEROPROFILE <span className="text-lime-300">/</span> COMPANION APP</span>
        <span>{filteredGames.length} {filteredGames.length === 1 ? 'TITLE' : 'TITLES'} IN VIEW</span>
      </footer>
    </main>
  )
}

export default App
