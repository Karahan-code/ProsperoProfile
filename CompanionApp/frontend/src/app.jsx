import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Disc3,
  Gamepad2,
  HardDrive,
  Library,
  Pencil,
  Plus,
  Search,
  Trophy,
  WifiOff,
  X,
} from 'lucide-react'
import { AVATAR_OPTIONS } from './components/avatarOptions.js'

const API_BASE = 'http://localhost:3000'
const PROFILE_USERNAME = 'karahan'
const PROFILE_STATUS = 'Offline'

const INITIAL_GAMES = [
  { id: 'elden-ring', name: 'Elden Ring', platform: 'PS5', playtime: 186, trophies: { earned: 32, total: 42 }, status: 'Playing', hasPhysicalCopy: false, artwork: 'from-amber-900 via-orange-950 to-slate-950' },
  { id: 'bloodborne', name: 'Bloodborne', platform: 'PS4', playtime: 94, trophies: { earned: 25, total: 34 }, status: 'Completed', hasPhysicalCopy: true, artwork: 'from-rose-950 via-red-950 to-slate-950' },
  { id: 'dark-souls-iii', name: 'Dark Souls III', platform: 'PS4', playtime: 121, trophies: { earned: 27, total: 43 }, status: 'Completed', hasPhysicalCopy: false, artwork: 'from-slate-700 via-indigo-950 to-slate-950' },
  { id: 'stalker', name: 'S.T.A.L.K.E.R.', platform: 'PC', playtime: 38, trophies: { earned: 11, total: 28 }, status: 'Playing', hasPhysicalCopy: true, artwork: 'from-lime-950 via-emerald-950 to-slate-950' },
  { id: 'ghost-of-tsushima', name: 'Ghost of Tsushima', platform: 'PS5', playtime: 76, trophies: { earned: 38, total: 52 }, status: 'Planning', hasPhysicalCopy: false, artwork: 'from-fuchsia-950 via-rose-950 to-slate-950' },
  { id: 'hollow-knight', name: 'Hollow Knight', platform: 'Switch', playtime: 52, trophies: { earned: 18, total: 63 }, status: 'Playing', hasPhysicalCopy: false, artwork: 'from-cyan-950 via-blue-950 to-slate-950' },
]

const STATUS_OPTIONS = ['Playing', 'Completed', 'Planning', 'Dropped']
const PLATFORM_OPTIONS = ['PS5', 'PS4', 'Switch', 'PS3', 'PS2', 'PC']
const PLATFORM_FILTERS = ['All', 'PS5', 'PS4', 'Switch', 'PS3', 'PS2']

function createDefaultProfile() {
  return {
    username: PROFILE_USERNAME,
    avatar: AVATAR_OPTIONS[0].id,
    stats: {},
    games: INITIAL_GAMES.map((game) => ({ ...game, trophies: { ...game.trophies } })),
  }
}

function placeholderCover(name) {
  return `https://via.placeholder.com/300x450/1a1a1a/00ff00?text=${encodeURIComponent(name)}`
}

function placeholderHero(name) {
  return `https://via.placeholder.com/1920x620/101510/9cff35?text=${encodeURIComponent(name)}`
}

function placeholderLogo(name) {
  return `https://via.placeholder.com/900x300/00000000/ffffff?text=${encodeURIComponent(name)}`
}

function formatHours(hours) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(hours)
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function CustomDropdown({ label, value, options, onChange, className = '', placement = 'bottom' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
      type="button"
      className="inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-2.5 text-[10px] text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] focus-visible:border-lime-300/40"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={label}
      onClick={() => setIsOpen((open) => !open)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={12} className={`shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`absolute right-0 z-50 min-w-full origin-top overflow-hidden rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 ${placement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'} ${isOpen ? 'visible translate-y-0 scale-100 opacity-100' : `invisible ${placement === 'top' ? 'translate-y-1' : '-translate-y-1'} scale-[0.98] opacity-0`}`}
        role="listbox"
        aria-label={label}
        aria-hidden={!isOpen}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={value === option}
            tabIndex={isOpen ? 0 : -1}
            className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs transition-all duration-300 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none ${value === option ? 'text-lime-200' : 'text-slate-300'}`}
            onClick={() => {
              onChange(option)
              setIsOpen(false)
            }}
          >
            {option}
            {value === option && <Check size={12} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function BentoPanel({ children, className = '', ...props }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_22px_60px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-500 ease-out ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

function GameTile({ game, onTogglePhysical, onEditPlaytime, onStatusChange }) {
  const [editing, setEditing] = useState(false)
  const [playtime, setPlaytime] = useState(String(game.playtime))
  const [editError, setEditError] = useState('')
  const progress = game.trophies.total > 0
    ? Math.min(100, Math.round((game.trophies.earned / game.trophies.total) * 100))
    : 0

  function savePlaytime(event) {
    event.preventDefault()
    const hours = Number(playtime)
    if (!Number.isFinite(hours) || hours < 0) {
      setEditError('Enter a valid non-negative number of hours.')
      return
    }
    onEditPlaytime(game.id, hours)
    setEditing(false)
    setEditError('')
  }

  return (
    <article className="group relative flex min-h-[230px] flex-col overflow-visible rounded-xl border border-white/[0.09] bg-[#0b1010]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 ease-out hover:z-20 hover:border-lime-200/25 hover:shadow-[0_18px_40px_rgba(0,0,0,0.3),0_0_28px_rgba(163,230,53,0.06)]">
      <div className={`relative isolate flex min-h-[140px] items-end overflow-hidden bg-gradient-to-br ${game.artwork || 'from-slate-700 via-slate-900 to-black'} p-4`}>
        <img src={game.assets?.coverUrl || placeholderCover(game.name)} alt={`${game.name} cover art`} loading="lazy" className="absolute inset-0 -z-0 size-full object-cover opacity-65 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" />
        <div aria-hidden="true" className="absolute inset-0 -z-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div aria-hidden="true" className="absolute -right-5 -top-16 size-40 rounded-full border border-white/20 shadow-[0_0_70px_rgba(255,255,255,0.08)] transition-transform duration-700 group-hover:scale-110" />
        <div aria-hidden="true" className="absolute -right-2 -top-10 size-32 rounded-full border border-white/10" />
        <span className="relative z-10 text-4xl font-black tracking-tight text-white/80 [text-shadow:0_4px_24px_rgba(0,0,0,0.5)]">{initials(game.name)}</span>
        <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-white/85 backdrop-blur-md">{game.platform || 'PS5'}</span>
        {game.hasPhysicalCopy && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-lime-300/35 bg-lime-300/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-lime-100 shadow-[0_0_18px_rgba(163,230,53,0.14)] backdrop-blur-md">
            <Disc3 size={12} /> Physical Copy Owned
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white" title={game.name}>{game.name}</h3>
            {editing ? (
              <form className="mt-2" onSubmit={savePlaytime}>
                <label className="sr-only" htmlFor={`playtime-${game.id}`}>Playtime in hours</label>
                <div className="flex gap-2">
                  <input
                    id={`playtime-${game.id}`}
                    autoFocus
                    min="0"
                    step="0.5"
                    type="number"
                    value={playtime}
                    onChange={(event) => {
                      setPlaytime(event.target.value)
                      setEditError('')
                    }}
                    className="h-8 w-24 rounded-md border border-white/10 bg-black/40 px-2 text-xs text-white outline-none focus:border-lime-300/50"
                  />
                  <button className="grid size-8 place-items-center rounded-md bg-lime-300 text-slate-950 transition-all duration-500 ease-out hover:bg-lime-200" type="submit" aria-label={`Save playtime for ${game.name}`}><Check size={14} /></button>
                  <button className="grid size-8 place-items-center rounded-md border border-white/10 text-slate-400 transition-all duration-500 ease-out hover:text-white" type="button" onClick={() => { setEditing(false); setPlaytime(String(game.playtime)); setEditError('') }} aria-label="Cancel playtime edit"><X size={14} /></button>
                </div>
                {editError && <p className="mt-1 text-[10px] text-rose-300" role="alert">{editError}</p>}
              </form>
            ) : (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock3 size={12} className="text-lime-200/70" /> {formatHours(game.playtime)} hrs played
                <button
                  className="ml-1 grid size-6 place-items-center rounded-md text-slate-500 transition-all duration-500 ease-out hover:bg-white/[0.08] hover:text-lime-200"
                  type="button"
                  onClick={() => { setPlaytime(String(game.playtime)); setEditing(true) }}
                  aria-label={`Edit playtime for ${game.name}`}
                  title="Edit playtime"
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
          </div>
          <button
            className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-all duration-500 ease-out ${game.hasPhysicalCopy ? 'border-lime-300/30 bg-lime-300/10 text-lime-200' : 'border-white/10 bg-white/[0.025] text-slate-500 hover:border-lime-300/30 hover:text-lime-200'}`}
            type="button"
            onClick={() => onTogglePhysical(game.id)}
            aria-pressed={game.hasPhysicalCopy}
            aria-label={`${game.hasPhysicalCopy ? 'Remove' : 'Mark'} physical copy for ${game.name}`}
            title={game.hasPhysicalCopy ? 'Physical copy owned' : 'Mark physical copy owned'}
          >
            <Disc3 size={16} />
          </button>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Trophy progress</span>
            <span className="tabular-nums text-slate-300">{game.trophies.earned} / {game.trophies.total}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-200 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400"><span className={`size-1.5 rounded-full ${game.status === 'Playing' ? 'bg-lime-300 shadow-[0_0_9px_rgba(190,242,100,0.8)]' : game.status === 'Completed' ? 'bg-sky-300' : game.status === 'Dropped' ? 'bg-rose-300' : 'bg-slate-500'}`} />{game.status}</span>
            <CustomDropdown
              label={`Status for ${game.name}`}
              value={game.status}
              options={STATUS_OPTIONS}
              onChange={(status) => onStatusChange(game.id, status)}
              className="w-28"
              placement="top"
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function AddGameModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [playtime, setPlaytime] = useState('0')
  const [platform, setPlatform] = useState('PS5')
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function submit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    const hours = Number(playtime)
    if (!cleanName) {
      setError('Enter a game name to continue.')
      return
    }
    if (!Number.isFinite(hours) || hours < 0) {
      setError('Enter a valid non-negative number of hours.')
      return
    }
    onAdd(cleanName, hours, platform)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101717]/95 p-6 shadow-[0_28px_100px_rgba(0,0,0,0.6)] backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="add-game-title">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-lime-200">LOCAL COLLECTION</p>
            <h2 id="add-game-title" className="mt-2 text-xl font-semibold text-white">Add custom game</h2>
            <p className="mt-1 text-sm text-slate-400">Your collection syncs to your local profile.</p>
          </div>
          <button className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition-all duration-500 ease-out hover:border-white/20 hover:text-white" type="button" onClick={onClose} aria-label="Close add game dialog"><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <label className="mb-2 block text-xs font-medium text-slate-300" htmlFor="new-game-name">Game name</label>
          <input id="new-game-name" autoFocus maxLength={60} value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="e.g. Returnal" className="mb-4 h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/40" />
          <label className="mb-2 block text-xs font-medium text-slate-300" htmlFor="new-game-hours">Initial playtime (hours)</label>
          <input id="new-game-hours" min="0" step="0.5" type="number" value={playtime} onChange={(event) => { setPlaytime(event.target.value); setError('') }} className="h-11 w-full rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-white outline-none focus:border-lime-300/40" />
          <label className="mb-2 mt-4 block text-xs font-medium text-slate-300">Platform</label>
          <CustomDropdown label="Game platform" value={platform} options={PLATFORM_OPTIONS} onChange={setPlatform} className="w-full" />
          {error && <p className="mt-3 text-xs text-rose-300" role="alert">{error}</p>}
          <button className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-green-700/50 bg-green-900/30 px-4 text-sm font-semibold text-green-400 transition-colors hover:bg-green-800/40" type="submit"><Plus size={16} /> Save game</button>
        </form>
      </section>
    </div>
  )
}

export default function App() {
  const [profile, setProfile] = useState(createDefaultProfile)
  const profileRef = useRef(profile)
  const nextGameId = useRef(profile.games.length)
  const coverRequests = useRef(new Set())
  const saveQueue = useRef(Promise.resolve())
  const profileVersion = useRef(0)
  const [profileReady, setProfileReady] = useState(false)
  const [profileDirty, setProfileDirty] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [isSplashing, setIsSplashing] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All games')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [showAddGame, setShowAddGame] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSplashing(false), 2000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let ignoreResponse = false

    async function loadProfile() {
      try {
        const response = await fetch(`${API_BASE}/api/profile/${PROFILE_USERNAME}`)
        if (response.status === 404) {
          if (!ignoreResponse) {
            const defaultProfile = createDefaultProfile()
            profileRef.current = defaultProfile
            setProfile(defaultProfile)
            setProfileReady(true)
            profileVersion.current += 1
            setProfileDirty(true)
          }
          return
        }
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Could not load profile.')
        if (typeof payload.username !== 'string' || !Array.isArray(payload.games)) {
          throw new Error('The profile API returned an invalid profile.')
        }

        const defaultProfile = createDefaultProfile()
        const loadedProfile = {
          ...defaultProfile,
          ...payload,
          avatar: payload.avatar ?? defaultProfile.avatar,
          games: payload.games.map((game) => ({
            platform: 'PS5',
            hasPhysicalCopy: false,
            ...game,
            trophies: { earned: 0, total: 0, ...game.trophies },
          })),
        }
        if (!ignoreResponse) {
          profileRef.current = loadedProfile
          setProfile(loadedProfile)
          setProfileReady(true)
        }
      } catch (error) {
        if (!ignoreResponse) {
          setProfileError(`${error.message || 'Could not load profile.'} Showing the built-in offline profile.`)
          setProfileReady(true)
        }
      }
    }

    loadProfile()
    return () => {
      ignoreResponse = true
    }
  }, [])

  useEffect(() => {
    if (!profileReady || !profileDirty) return undefined

    const version = profileVersion.current
    const timer = window.setTimeout(() => {
      const games = profile.games
      const stats = games.reduce((result, game) => ({
        totalPlaytime: result.totalPlaytime + Number(game.playtime || 0),
        totalTrophiesEarned: result.totalTrophiesEarned + Number(game.trophies?.earned || 0),
        totalTrophies: result.totalTrophies + Number(game.trophies?.total || 0),
        gameCount: result.gameCount + 1,
      }), { totalPlaytime: 0, totalTrophiesEarned: 0, totalTrophies: 0, gameCount: 0 })

      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(async () => {
          const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...profile, stats }),
          })
          const result = await response.json()
          if (!response.ok) throw new Error(result.message || 'Could not save profile.')
          if (profileVersion.current === version) {
            setProfileDirty(false)
            setProfileError('')
          }
        })
        .catch((error) => {
          setProfileError(`${error.message || 'Could not save profile.'} Your edits remain available for this session.`)
        })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [profile, profileDirty, profileReady])

  useEffect(() => {
    if (!profileReady) return
    profile.games.forEach((game) => {
      if (game.assets?.coverUrl && game.assets?.heroUrl && game.assets?.logoUrl) return
      if (coverRequests.current.has(game.name)) return
      coverRequests.current.add(game.name)
      fetch(`${API_BASE}/api/game-assets?titleName=${encodeURIComponent(game.name)}`)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Asset lookup failed for ${game.name}.`)
          const result = await response.json()
          if (!result.assets || typeof result.assets.coverUrl !== 'string'
            || typeof result.assets.heroUrl !== 'string' || typeof result.assets.logoUrl !== 'string') {
            throw new Error(`SteamGridDB returned incomplete image assets for ${game.name}.`)
          }
          const current = profileRef.current
          const nextProfile = {
            ...current,
            games: current.games.map((item) => item.id === game.id ? { ...item, assets: result.assets } : item),
          }
          profileRef.current = nextProfile
          setProfile(nextProfile)
          profileVersion.current += 1
          setProfileDirty(true)
        })
        .catch((error) => {
          console.warn(error.message)
        })
    })
  }, [profile.games, profileReady])

  const games = profile.games
  const totals = useMemo(() => games.reduce((result, game) => ({
    playtime: result.playtime + Number(game.playtime || 0),
    earned: result.earned + Number(game.trophies?.earned || 0),
    trophies: result.trophies + Number(game.trophies?.total || 0),
  }), { playtime: 0, earned: 0, trophies: 0 }), [games])

  const visibleGames = useMemo(() => games.filter((game) => {
    const matchesQuery = game.name.toLowerCase().includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'All games' || game.status === statusFilter
    const matchesPlatform = platformFilter === 'All' || game.platform === platformFilter
    return matchesQuery && matchesStatus && matchesPlatform
  }), [games, platformFilter, query, statusFilter])

  function updateProfile(nextProfile) {
    profileRef.current = nextProfile
    setProfile(nextProfile)
    profileVersion.current += 1
    setProfileDirty(true)
  }

  function updateGame(id, updates) {
    const nextProfile = profileRef.current
    updateProfile({
      ...nextProfile,
      games: nextProfile.games.map((game) => game.id === id ? { ...game, ...updates } : game),
    })
  }

  function addGame(name, playtime, platform) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const currentProfile = profileRef.current
    let id = `${slug || 'custom-game'}-${nextGameId.current++}`
    while (currentProfile.games.some((game) => game.id === id)) {
      id = `${slug || 'custom-game'}-${nextGameId.current++}`
    }
    updateProfile({ ...currentProfile, games: [...currentProfile.games, {
      id,
      name,
      platform,
      playtime,
      trophies: { earned: 0, total: 0 },
      status: 'Planning',
      hasPhysicalCopy: false,
      artwork: 'from-violet-950 via-slate-900 to-black',
    }] })
    setShowAddGame(false)
    setStatusFilter('All games')
    setPlatformFilter('All')
    setQuery('')
  }

  const heroProgress = totals.trophies > 0 ? Math.round((totals.earned / totals.trophies) * 100) : 0
  const sessionTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const heroGame = games.find((game) => game.id === 'elden-ring') || games[0]
  const selectedAvatar = typeof profile.avatar === 'string'
    ? AVATAR_OPTIONS.find((avatar) => avatar.id === profile.avatar)
    : null
  const avatarImage = selectedAvatar?.image
    || (typeof profile.avatar === 'string' && /^https?:\/\//i.test(profile.avatar) ? profile.avatar : profile.avatar?.image)

  return (
    <>
    <main className={`relative isolate min-h-screen overflow-hidden px-4 pb-10 text-slate-100 transition-opacity duration-500 sm:px-7 lg:px-10 ${isSplashing ? 'pointer-events-none opacity-0' : 'animate-fade-in'}`}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[#080c0d]" />
      <div aria-hidden="true" className="pointer-events-none fixed -left-40 -top-44 -z-10 size-[34rem] rounded-full bg-lime-400/[0.07] blur-[130px]" />
      <div aria-hidden="true" className="pointer-events-none fixed -right-40 top-1/3 -z-10 size-[32rem] rounded-full bg-emerald-400/[0.045] blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:48px_48px]" />

      <header className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between border-b border-white/[0.08]">
        <a className="inline-flex items-center gap-3 text-sm font-semibold text-white" href="#dashboard" aria-label="ProsperoProfile home">
          <span className="grid size-9 place-items-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-lime-200"><Gamepad2 size={18} /></span>
          <span>prospero<span className="font-normal text-slate-400">profile</span></span>
        </a>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] ${profileError ? 'border-amber-300/20 bg-amber-300/[0.045] text-amber-200' : 'border-rose-300/15 bg-rose-300/[0.045] text-rose-200'}`}>
          <WifiOff size={13} /> {profileError ? 'SYNC ISSUE' : profileDirty ? 'SAVING PROFILE' : 'OFFLINE MODE'}
        </div>
      </header>

      <div id="dashboard" className="mx-auto max-w-[1440px]">
        <div className="mb-5 mt-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-lime-200/80">YOUR PERSONAL GAME SPACE</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Good to see you, {profile.username}<span className="text-lime-300">.</span></h1>
          </div>
          <p className="text-xs text-slate-500">{profileDirty ? 'Saving changes to profile...' : 'Profile stored on this server'} <span className="mx-1.5 text-slate-700">/</span> {profileReady ? 'Local library ready' : 'Loading profile...'}</p>
        </div>

        {profileError && <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-xs text-amber-100" role="status">{profileError}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <BentoPanel className="group min-h-[360px] md:col-span-2 lg:col-span-4 lg:row-span-2 lg:min-h-[520px]">
            <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${heroGame?.artwork || 'from-amber-900 via-slate-900 to-black'} opacity-40 blur-2xl transition-all duration-700 group-hover:scale-110`} />
            {heroGame && <img aria-hidden="true" src={heroGame.assets?.heroUrl || placeholderHero(heroGame.name)} alt="" className="absolute inset-0 size-full object-cover opacity-45 transition-opacity duration-700 group-hover:opacity-60" />}
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(190,242,100,0.13),transparent_32%),linear-gradient(110deg,rgba(8,12,13,0.25),rgba(8,12,13,0.94)_72%)]" />
            <div aria-hidden="true" className="absolute -right-16 top-8 size-72 rounded-full border border-white/[0.07] shadow-[0_0_100px_rgba(255,255,255,0.035)]" />
            <div aria-hidden="true" className="absolute -right-8 top-16 size-56 rounded-full border border-white/[0.06]" />
            <div className="relative flex h-full min-h-[330px] flex-col justify-between p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-slate-300 backdrop-blur-md"><Trophy size={12} className="text-lime-200" /> PLAYER OVERVIEW</span>
                <span className="text-[9px] font-semibold tracking-[0.18em] text-white/45">01 / 05</span>
              </div>
              <div className="max-w-[440px]">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total playtime</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-semibold leading-none tracking-[-0.07em] text-white tabular-nums sm:text-7xl">{formatHours(totals.playtime)}</span>
                  <span className="text-sm font-medium text-slate-400">hours</span>
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold tracking-[0.2em] text-lime-200">CURRENT OBSESSION</p>
                    {heroGame
                      ? <img className="mt-1 h-12 max-w-56 object-contain object-left drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] sm:h-16" src={heroGame.assets?.logoUrl || placeholderLogo(heroGame.name)} alt={`${heroGame.name} logo`} />
                      : <p className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">Build your collection</p>}
                    {heroGame && <p className="mt-1 text-xs text-slate-400">{formatHours(heroGame.playtime)} hours logged · {heroGame.status}</p>}
                  </div>
                  <div className="w-36 shrink-0 sm:w-44">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-slate-400"><span>Trophy progress</span><span className="font-semibold text-white">{heroProgress}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-300 shadow-[0_0_12px_rgba(190,242,100,0.38)] transition-all duration-700" style={{ width: `${heroProgress}%` }} /></div>
                    <p className="mt-1.5 text-right text-[9px] text-slate-500">{totals.earned} / {totals.trophies} earned</p>
                  </div>
                </div>
              </div>
            </div>
          </BentoPanel>

          <BentoPanel className="flex min-h-[250px] flex-col justify-between p-5 sm:p-6 md:col-span-1 lg:col-span-2 lg:row-span-1">
            <div className="flex items-start justify-between">
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500">PLAYER PROFILE</span>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] tracking-wide text-slate-500">LOCAL</span>
            </div>
            <div className="flex flex-col items-center py-4 text-center">
              <div className="relative grid size-16 place-items-center overflow-hidden rounded-[1.3rem] border border-lime-200/25 bg-gradient-to-br from-lime-200/20 via-emerald-900/40 to-slate-950 text-2xl font-bold text-lime-100 shadow-[0_0_48px_rgba(163,230,53,0.11),inset_0_1px_0_rgba(255,255,255,0.15)]">
                {avatarImage ? <img src={avatarImage} alt="" className="size-full object-cover" /> : profile.username.slice(0, 1).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-[3px] border-[#111617] bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.7)]" />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-white">{profile.username}</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-rose-300"><span className="size-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.7)]" /> {PROFILE_STATUS}</p>
            </div>
            <div className="flex items-end justify-between border-t border-white/[0.08] pt-4">
              <div><p className="text-[9px] tracking-[0.16em] text-slate-500">IN YOUR LIBRARY</p><p className="mt-1 text-2xl font-semibold text-white tabular-nums">{String(games.length).padStart(2, '0')}<span className="ml-1.5 text-xs font-normal text-slate-400">games</span></p></div>
              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lime-200"><Gamepad2 size={17} /></span>
            </div>
          </BentoPanel>

          <BentoPanel className="flex min-h-[250px] flex-col justify-between p-5 sm:p-6 md:col-span-1 lg:col-span-2 lg:row-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500">RECENT ACTIVITY</span>
              <span className="size-1.5 animate-pulse rounded-full bg-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]" />
            </div>
            <div className="py-3">
              <p className="text-[10px] text-slate-500">Last Session: Today <span className="font-medium text-slate-300">{sessionTime}</span></p>
              <h2 className="mt-2 text-xl font-semibold text-white">Bloodborne</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400"><Clock3 size={12} className="text-lime-200/70" /> 2 Hours</p>
            </div>
            <div className="flex items-center gap-1.5 border-t border-white/[0.08] pt-3 text-[9px] font-medium tracking-[0.12em] text-slate-500"><span className="size-1.5 rounded-full bg-rose-400" /> SAVED TO LOCAL HISTORY</div>
          </BentoPanel>

          <BentoPanel className="group flex min-h-[116px] flex-col justify-center gap-5 p-5 md:col-span-3 lg:col-span-6 lg:row-span-1 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="flex shrink-0 items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-lime-200"><HardDrive size={18} /></span>
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500">CONSOLE STORAGE</p>
                <p className="mt-1 text-sm text-slate-300"><span className="text-xl font-semibold text-white tabular-nums">650</span> GB / 825 GB used <span className="ml-1 text-[10px] text-slate-500">· 175 GB free</span></p>
              </div>
            </div>
            <div className="min-w-0 flex-1 sm:max-w-[58%]">
              <div className="mb-2 flex items-center justify-between text-[9px] text-slate-500"><span>79% occupied</span><button className="inline-flex items-center gap-1.5 text-slate-400 transition-all duration-500 ease-out hover:text-lime-200" type="button">Manage games <ArrowUpRight size={11} /></button></div>
              <div className="h-2.5 overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.07] shadow-inner">
                <div className="h-full w-[79%] rounded-full bg-gradient-to-r from-lime-400 via-lime-300 to-emerald-200 shadow-[0_0_18px_rgba(163,230,53,0.34)] transition-all duration-700 group-hover:brightness-110" />
              </div>
            </div>
          </BentoPanel>

          <BentoPanel className="md:col-span-3 lg:col-span-6">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-lime-300/15 bg-lime-300/[0.07] text-lime-200"><Library size={17} /></span>
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-500">YOUR COLLECTION</p>
                  <h2 className="mt-0.5 text-lg font-semibold text-white">Game library <span className="ml-1 text-sm font-normal text-slate-500">{String(games.length).padStart(2, '0')}</span></h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border border-white/10 bg-black/20 px-3 text-slate-500 transition-all duration-500 ease-out focus-within:border-lime-300/40 sm:w-44">
                  <Search size={14} />
                  <input className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600" type="search" placeholder="Find a game..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search game library" />
                </label>
                <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/20 p-1" role="group" aria-label="Filter by platform">
                  {PLATFORM_FILTERS.map((platform) => (
                    <button
                      key={platform}
                      className={`shrink-0 rounded-md border px-2 py-1.5 text-[9px] font-semibold transition-all duration-300 ${platformFilter === platform ? 'border-lime-300/40 bg-lime-300/10 text-lime-100 shadow-[inset_0_0_12px_rgba(163,230,53,0.06)]' : 'border-transparent text-slate-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200'}`}
                      type="button"
                      aria-pressed={platformFilter === platform}
                      onClick={() => setPlatformFilter(platform)}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 text-slate-500">
                  <ArrowDownUp size={13} />
                  <CustomDropdown
                    label="Filter by game status"
                    value={statusFilter}
                    options={['All games', ...STATUS_OPTIONS]}
                    onChange={setStatusFilter}
                    className="w-24"
                  />
                </div>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-700/50 bg-green-900/30 px-4 text-xs font-semibold text-green-400 transition-colors hover:bg-green-800/40" type="button" onClick={() => setShowAddGame(true)}><Plus size={15} /> Add custom game</button>
              </div>
            </div>
            <div className="border-t border-white/[0.08] p-4 sm:p-5">
              {visibleGames.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleGames.map((game) => (
                    <GameTile
                      key={game.id}
                      game={game}
                      onTogglePhysical={(id) => {
                        const current = games.find((item) => item.id === id)
                        updateGame(id, { hasPhysicalCopy: !current?.hasPhysicalCopy })
                      }}
                      onEditPlaytime={(id, hours) => updateGame(id, { playtime: hours })}
                      onStatusChange={(id, status) => updateGame(id, { status })}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-white/10 text-center">
                  <div><span className="mx-auto grid size-10 place-items-center rounded-xl bg-white/[0.04] text-slate-500"><Search size={16} /></span><p className="mt-3 text-sm text-slate-300">No games found</p><p className="mt-1 text-xs text-slate-500">Try another search, status, or platform filter.</p></div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[9px] tracking-[0.12em] text-slate-600">
                <span>{visibleGames.length} OF {games.length} GAMES SHOWN</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-lime-300" /> PROFILE LIBRARY</span>
              </div>
            </div>
          </BentoPanel>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[9px] tracking-[0.14em] text-slate-600">
          <span>PROSPEROPROFILE <span className="text-slate-700">/</span> PERSONAL GAME ARCHIVE</span>
          <span className="inline-flex items-center gap-1.5"><Check size={11} className="text-lime-300/70" /> {profileDirty ? 'SAVING PROFILE' : profileError ? 'SYNC NEEDED' : 'PROFILE SYNCED'}</span>
        </footer>
      </div>

      {showAddGame && <AddGameModal onClose={() => setShowAddGame(false)} onAdd={addGame} />}
    </main>
    {isSplashing && (
      <div className="splash-overlay fixed inset-0 z-[100] grid place-items-center bg-black" aria-label="Loading ProsperoProfile">
        <span className="splash-logo-flight grid size-14 place-items-center rounded-2xl border border-lime-300/30 bg-lime-300/10 text-lime-200 shadow-[0_0_60px_rgba(163,230,53,0.2)]">
          <Gamepad2 size={27} />
        </span>
      </div>
    )}
    </>
  )
}
