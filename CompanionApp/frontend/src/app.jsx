import { useEffect, useState } from 'react'
import { ArrowDownUp, ArrowLeft, ArrowRight, Check, Gamepad2, Library, LoaderCircle, RefreshCw, Search, Signal } from 'lucide-react'
import GameCard from './components/GameCard.jsx'
import ProfileHeader from './components/ProfileHeader.jsx'
import { AVATAR_OPTIONS } from './components/avatarOptions.js'
import { playUiSound } from './components/uiSounds.js'

const PROFILE_STORAGE_KEY = 'prosperoprofile.profile'
const STATUS_STORAGE_KEY = 'prosperoprofile.game-statuses'
const MINIMUM_LOADING_DURATION = 3000
const PS5_USERS = ['karahan', 'Player 2', 'Guest']

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
    syncUsers: Array.isArray(profile.syncUsers) ? profile.syncUsers : [],
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

function ProfileSetup({ onCreate, error }) {
  const [username, setUsername] = useState('')
  const [avatarId, setAvatarId] = useState(AVATAR_OPTIONS[0].id)
  const [stage, setStage] = useState(1)
  const [scanning, setScanning] = useState(false)
  const [selectedProfiles, setSelectedProfiles] = useState(['karahan'])
  const [setupError, setSetupError] = useState('')

  useEffect(() => {
    if (stage !== 2) return undefined

    const scanTimer = window.setTimeout(() => setScanning(false), 1100)
    return () => window.clearTimeout(scanTimer)
  }, [stage])

  function handleSubmit(event) {
    event.preventDefault()
    const cleanUsername = username.trim()
    if (cleanUsername.length < 2) {
      setSetupError('Choose a username with at least 2 characters.')
      return
    }
    setUsername(cleanUsername)
    setSetupError('')
    setScanning(true)
    setStage(2)
  }

  function toggleProfile(profileName) {
    setSelectedProfiles((current) => current.includes(profileName)
      ? current.filter((name) => name !== profileName)
      : [...current, profileName])
    setSetupError('')
  }

  function finishSetup() {
    if (selectedProfiles.length === 0) {
      setSetupError('Select at least one local profile to sync.')
      return
    }
    onCreate({ username: username.trim(), avatarId, syncUsers: selectedProfiles })
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
              <p className="mb-4 text-xs font-medium uppercase text-lime-200">FIRST-TIME SETUP · STEP {stage} OF 2</p>
              <h1 className="max-w-sm text-4xl font-semibold leading-tight text-white sm:text-5xl">{stage === 1 ? 'Make this space yours.' : 'Choose your profiles.'}</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">{stage === 1 ? 'Choose a name and a player picture for your local companion profile.' : 'Select the local PS5 users whose library you want to bring into your collection.'}</p>
            </div>
            <div className="mt-10 flex items-center gap-4 rounded-lg border border-white/[0.08] bg-black/20 p-3">
              <img className="size-16 rounded-md border border-white/15 object-cover shadow-lg" src={AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId)?.image} alt="" />
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-500">PLAYER PICTURE</p>
                <p className="mt-1 text-sm font-semibold text-white">{AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId)?.label}</p>
                <p className="mt-1 text-xs text-slate-500">Your identity across the collection</p>
              </div>
            </div>
            <div className="mt-12 flex items-center gap-3 text-xs text-slate-500">
              <span className="size-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.6)]" />
              PROFILE SAVED ON THIS DEVICE
            </div>
          </section>

          {stage === 1 ? (
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
                setSetupError('')
              }}
              className="h-12 w-full rounded-lg border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-lime-300/50 focus:ring-2 focus:ring-lime-300/10"
              required
            />

            <div className="mb-3 mt-8 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-slate-200">Choose your avatar</h2>
              <span className="text-xs text-slate-500">{AVATAR_OPTIONS.length} PLAYER PICTURES</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3" role="radiogroup" aria-label="Choose a player picture">
              {AVATAR_OPTIONS.map((avatar) => {
                const selected = avatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Choose ${avatar.label} player picture`}
                    onClick={() => setAvatarId(avatar.id)}
                    data-sound="click"
                    className={`group relative aspect-square overflow-hidden rounded-lg border transition focus-visible:outline-none ${selected ? 'border-lime-300 ring-2 ring-lime-300/30' : 'border-white/10 hover:border-white/50'}`}
                  >
                    <img src={avatar.image} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                    <span aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${avatar.accent} via-transparent to-black/10 opacity-70`} />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/90 to-transparent px-1 pb-1.5 pt-4 text-[9px] font-medium text-white sm:text-[10px]">{avatar.label}</span>
                    {selected && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.9)]" />}
                  </button>
                )
              })}
            </div>

            {setupError && <p className="mt-4 text-sm text-rose-300" role="alert">{setupError}</p>}
            {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
            <button className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2 focus:ring-offset-slate-900" type="submit" data-sound="click">
              Continue to PS5 profiles <ArrowRight size={16} />
            </button>
          </form>
          ) : (
            <section className="p-7 sm:p-10" aria-labelledby="profile-sync-title">
              <div className="mb-7 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-lime-300/20 bg-lime-300/10 text-lime-200">
                  <Gamepad2 size={18} />
                </span>
                <div>
                  <h2 id="profile-sync-title" className="text-sm font-semibold text-white">PS5 USER SCAN</h2>
                  <p className="mt-1 text-[10px] uppercase text-slate-500">LOCAL CONSOLE · NETWORK DISCOVERY</p>
                </div>
              </div>

              {scanning ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-black/15 text-center">
                  <div className="relative grid size-16 place-items-center rounded-full border border-lime-300/20 bg-lime-300/[0.06] text-lime-200">
                    <span className="absolute inset-0 animate-ping rounded-full border border-lime-300/30" />
                    <LoaderCircle size={25} className="animate-spin" />
                  </div>
                  <p className="mt-5 text-sm font-medium text-white">Scanning for local users</p>
                  <p className="mt-2 text-xs text-slate-500">Connecting to your console profile list...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Found local PS5 users. Select the profiles you want to sync:</p>
                      <p className="mt-1 text-xs text-slate-500">{selectedProfiles.length} of {PS5_USERS.length} selected</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-medium text-lime-200 transition hover:text-lime-100"
                      onClick={() => {
                        setSelectedProfiles(selectedProfiles.length === PS5_USERS.length ? [] : [...PS5_USERS])
                        setSetupError('')
                      }}
                      data-sound="click"
                    >
                      {selectedProfiles.length === PS5_USERS.length ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  <div className="space-y-2" role="group" aria-label="PS5 profiles to sync">
                    {PS5_USERS.map((profileName, index) => {
                      const selected = selectedProfiles.includes(profileName)
                      return (
                        <label
                          key={profileName}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-all duration-200 ${selected ? 'border-lime-300/30 bg-lime-300/[0.06]' : 'border-white/[0.08] bg-black/15 hover:border-white/20 hover:bg-white/[0.035]'}`}
                          data-sound="hover"
                          data-sound-click
                        >
                          <input
                            className="peer sr-only"
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleProfile(profileName)}
                          />
                          <span className={`grid size-5 shrink-0 place-items-center rounded border transition-colors ${selected ? 'border-lime-300 bg-lime-300 text-slate-950' : 'border-white/20 bg-slate-950 text-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-lime-300/50'}`}>
                            {selected && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                          </span>
                          <span className={`grid size-10 shrink-0 place-items-center rounded-md border text-xs font-semibold ${index === 0 ? 'border-lime-300/20 bg-lime-300/10 text-lime-100' : 'border-white/10 bg-white/[0.05] text-slate-300'}`}>
                            {profileName.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">{profileName}</span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">{index === 0 ? 'ACTIVE CONSOLE USER' : 'LOCAL USER'}</span>
                          </span>
                          {selected && <span className="size-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]" />}
                        </label>
                      )
                    })}
                  </div>
                  {setupError && <p className="mt-4 text-sm text-rose-300" role="alert">{setupError}</p>}
                  {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
                      type="button"
                      onClick={() => {
                        setSetupError('')
                        setStage(1)
                      }}
                      data-sound="click"
                    >
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-lime-200 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:ring-offset-2 focus:ring-offset-slate-900"
                      type="button"
                      onClick={finishSetup}
                      data-sound="click"
                    >
                      Finish Setup &amp; Sync <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
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
  const [profileSaveError, setProfileSaveError] = useState('')
  const [lastSynced, setLastSynced] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [hoveredArtwork, setHoveredArtwork] = useState(null)
  const [showSplash, setShowSplash] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const splashTimer = window.setTimeout(() => setShowSplash(false), 1500)
    return () => window.clearTimeout(splashTimer)
  }, [])

  useEffect(() => {
    let ignoreResponse = false

    async function fetchGames() {
      const loadingStartedAt = Date.now()
      try {
        const response = await fetch('http://localhost:3000/api/games')
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Could not reach the game library.')
        const gameList = Array.isArray(payload) ? payload : payload.games
        if (!Array.isArray(gameList)) throw new Error('The games API returned an invalid response.')

        if (!ignoreResponse) {
          setGames(gameList)
          setLastSynced(new Date())
        }
      } catch (loadError) {
        if (!ignoreResponse) setError(loadError.message || 'Could not reach the game library.')
      } finally {
        const remainingLoadingTime = Math.max(0, MINIMUM_LOADING_DURATION - (Date.now() - loadingStartedAt))
        await new Promise((resolve) => setTimeout(resolve, remainingLoadingTime))
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
      setProfileSaveError('')
      setProfile(nextProfile)
    } catch {
      setProfileSaveError('This browser could not save the profile. Check local storage settings and try again.')
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

  function handlePointerOver(event) {
    const soundTarget = event.target.closest?.('[data-sound="hover"]')
    if (soundTarget && !soundTarget.contains(event.relatedTarget)) playUiSound('hover')
  }

  function handleClick(event) {
    if (event.target.closest?.('[data-sound="click"], [data-sound-click]')) playUiSound('click')
  }

  let content = <ProfileSetup onCreate={createProfile} error={profileSaveError} />

  if (profile) {
    const normalizedQuery = query.trim().toLowerCase()
    const filteredGames = games.filter((game) => `${game.titleName || ''} ${game.titleId || ''}`.toLowerCase().includes(normalizedQuery))
    const stats = summarizeGames(games)

    content = (
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 text-slate-100 sm:px-7 lg:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#090c0e]" />
        <div
          className={`absolute inset-[-4%] bg-cover bg-center opacity-0 blur-3xl transition-opacity duration-700 ${hoveredArtwork ? 'opacity-35' : ''}`}
          style={hoveredArtwork ? { backgroundImage: `url("${hoveredArtwork}")` } : undefined}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_16%_0%,rgba(34,197,94,0.07),transparent_34%),radial-gradient(ellipse_at_92%_46%,rgba(14,165,233,0.05),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-[#090c0e]/55" />
      </div>
      <header className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.08]">
        <a className="inline-flex items-center gap-3 text-sm font-semibold text-white" href="#dashboard" aria-label="ProsperoProfile home">
          <span className="grid size-9 place-items-center rounded-lg border border-lime-300/20 bg-lime-300/10 text-lime-200"><Gamepad2 size={18} /></span>
          <span>prospero<span className="font-normal text-slate-400">profile</span></span>
        </a>
        <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:flex ${error ? 'border-rose-300/15 bg-rose-300/[0.06] text-rose-200' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}>
          <Signal size={14} className={error ? 'text-rose-300' : 'text-lime-200'} />
          <span className="relative grid size-2 place-items-center">
            {error && <span className="absolute size-full animate-ping rounded-full bg-rose-400 opacity-70" />}
            <span className={`relative size-1.5 rounded-full ${error ? 'bg-rose-300' : loading ? 'animate-pulse bg-amber-200' : 'bg-lime-300'}`} />
          </span>
          {error ? 'CONSOLE OFFLINE' : loading ? 'SYNCING LIBRARY' : 'CONSOLE READY'}
        </div>
        <button className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-300 transition hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50" type="button" onClick={refreshLibrary} disabled={loading} aria-label="Refresh game library" title="Refresh library" data-sound="click">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div id="dashboard" className="relative z-10 flex-1 pb-10">
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

          {error && !loading && (
            <div className="mt-5 flex flex-col justify-between gap-3 rounded-lg border border-rose-300/15 bg-rose-300/[0.05] p-4 sm:flex-row sm:items-center" role="alert">
              <div><p className="text-sm font-medium text-rose-100">Library unavailable</p><p className="mt-1 text-sm text-rose-200/70">{error}</p></div>
              <button className="inline-flex items-center gap-2 self-start text-sm text-lime-200 hover:text-lime-100 sm:self-auto" type="button" onClick={refreshLibrary} data-sound="click">Try again <ArrowRight size={14} /></button>
            </div>
          )}

          {loading && games.length === 0 && (
            <div className="mt-5" role="status" aria-label="Loading games from your console" aria-busy="true">
              <p className="sr-only">Connecting to your console library...</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/55 animate-pulse">
                    <div className="aspect-16/10 bg-gradient-to-br from-slate-700/70 via-slate-800/60 to-slate-950/80" />
                    <div className="space-y-3 p-4">
                      <div className="h-3.5 w-3/5 rounded bg-white/10" />
                      <div className="flex justify-between gap-4"><div className="h-3 w-1/3 rounded bg-white/[0.07]" /><div className="h-3 w-1/4 rounded bg-white/[0.07]" /></div>
                      <div className="h-1.5 rounded-full bg-white/[0.07]" />
                      <div className="flex justify-between border-t border-white/[0.07] pt-3"><div className="h-3 w-1/4 rounded bg-white/[0.07]" /><div className="h-6 w-2/5 rounded bg-white/[0.07]" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && games.length === 0 && <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><Gamepad2 size={25} className="text-slate-500" /><p className="text-sm font-medium text-slate-200">No installed games found</p><p className="text-sm text-slate-500">Refresh after your console is connected.</p></div>}

          {!loading && !error && games.length > 0 && filteredGames.length === 0 && <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><Search size={22} className="text-slate-500" /><p className="text-sm font-medium text-slate-200">No matches</p><p className="text-sm text-slate-500">Try another title or title ID.</p></div>}

          {!loading && filteredGames.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-live="polite">
              {filteredGames.map((game) => {
                const gameKey = String(game.titleId || game.titleName || 'unknown')
                return <GameCard key={gameKey} game={game} status={gameStatuses[gameKey]} onStatusChange={(status) => updateGameStatus(gameKey, status)} onArtworkHover={setHoveredArtwork} />
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="relative z-10 flex min-h-12 items-center justify-between gap-4 border-t border-white/[0.08] text-[10px] text-slate-600">
        <span>PROSPEROPROFILE <span className="text-lime-300">/</span> COMPANION APP</span>
        <span>{filteredGames.length} {filteredGames.length === 1 ? 'TITLE' : 'TITLES'} IN VIEW</span>
      </footer>
    </main>
    )
  }

  return (
    <div className="min-h-screen" onPointerOver={handlePointerOver} onClick={handleClick}>
      <div
        className={`transition-opacity duration-500 ${showSplash ? 'pointer-events-none opacity-0' : 'app-content-enter opacity-100'}`}
        aria-hidden={showSplash}
        inert={showSplash}
      >
        {content}
      </div>
      {showSplash && (
        <div className="pointer-events-none fixed inset-0 z-[100] bg-[#090c0e]" aria-hidden="true">
          <div className="splash-logo-flight grid size-9 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/10 text-lime-200 shadow-[0_0_36px_rgba(190,242,100,0.16)]">
            <Gamepad2 size={18} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
