import { Clock3, Trophy } from 'lucide-react'

const GAME_STATUSES = [
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Planning to play' },
  { value: 'dropped', label: 'Deleted / Dropped' },
]

const STATUS_STYLES = {
  playing: { border: 'border-l-emerald-400', dot: 'bg-emerald-400', text: 'text-emerald-200' },
  completed: { border: 'border-l-sky-400', dot: 'bg-sky-400', text: 'text-sky-200' },
  planning: { border: 'border-l-slate-500', dot: 'bg-slate-500', text: 'text-slate-300' },
  dropped: { border: 'border-l-rose-400', dot: 'bg-rose-400', text: 'text-rose-200' },
}

const COVER_STYLES = [
  'from-lime-200 via-emerald-700 to-slate-950',
  'from-orange-200 via-rose-700 to-slate-950',
  'from-sky-200 via-cyan-800 to-slate-950',
  'from-violet-200 via-indigo-800 to-slate-950',
  'from-amber-100 via-amber-700 to-slate-950',
]

function initialsFor(title = '') {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?'
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function gameTrophies(game) {
  const trophies = game.trophies || {}
  return {
    earned: numberOrNull(game.trophiesEarned ?? game.earnedTrophies ?? trophies.earned),
    total: numberOrNull(game.totalTrophies ?? game.trophiesTotal ?? trophies.total),
  }
}

export default function GameCard({ game, status = 'planning', onStatusChange }) {
  const currentStatus = STATUS_STYLES[status] ? status : 'planning'
  const statusStyle = STATUS_STYLES[currentStatus]
  const title = game.titleName || 'Untitled game'
  const titleId = game.titleId || ''
  const platform = game.platform || (/^CUSA/i.test(titleId) ? 'PS4' : 'PS5')
  const playtime = numberOrNull(game.playtimeHours ?? game.totalPlaytimeHours ?? game.playtime?.hours ?? game.playtime)
  const trophies = gameTrophies(game)
  const progress = trophies.total > 0 && trophies.earned !== null ? Math.min(100, (trophies.earned / trophies.total) * 100) : 0
  const cover = COVER_STYLES[(titleId.charCodeAt(0) || title.length) % COVER_STYLES.length]

  return (
    <article className={`group min-w-0 overflow-hidden rounded-lg border border-white/10 border-l-2 ${statusStyle.border} bg-slate-900/60 shadow-lg shadow-black/10 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-white/20`}>
      <div className={`relative isolate aspect-[16/10] overflow-hidden bg-gradient-to-br ${cover}`}>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.34),transparent_22%),linear-gradient(135deg,transparent_42%,rgba(0,0,0,0.55))]" />
        <div aria-hidden="true" className="absolute -right-10 top-5 size-44 rounded-full border border-white/20 [transform:scaleX(1.45)_rotate(-25deg)]" />
        <div aria-hidden="true" className="absolute -right-5 top-10 size-36 rounded-full border border-white/20 [transform:scaleX(1.45)_rotate(30deg)]" />
        <span className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] font-bold text-white shadow ${platform === 'PS4' ? 'bg-blue-700' : 'bg-black/85'}`}>{platform}</span>
        <span className="absolute inset-0 grid place-items-center text-6xl font-semibold text-white/75 [text-shadow:0_3px_24px_rgba(0,0,0,0.35)]">{initialsFor(title)}</span>
        <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-[9px] text-white/70">
          <span className="truncate">{titleId || 'TITLE ID UNAVAILABLE'}</span>
          <span className="shrink-0">GAME ARCHIVE</span>
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-white" title={title}>{title}</h3>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-400"><Clock3 size={14} /> {playtime === null ? '--' : `${playtime.toLocaleString()} hrs`}</span>
          <span className="inline-flex items-center gap-1.5 text-slate-400"><Trophy size={13} className="text-amber-200" /> {trophies.earned === null || trophies.total === null ? '-- / --' : `${trophies.earned} / ${trophies.total}`}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-label={trophies.total === null ? 'Trophy progress unavailable' : `${Math.round(progress)} percent trophy progress`}>
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-100 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>

        <label className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <span className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
            <span className={`size-2 shrink-0 rounded-full ${statusStyle.dot}`} />
            <span className={statusStyle.text}>{GAME_STATUSES.find((option) => option.value === currentStatus)?.label}</span>
          </span>
          <select
            className="max-w-[58%] cursor-pointer appearance-none rounded-md border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-right text-[11px] text-slate-300 outline-none transition hover:border-white/20 focus:border-lime-300/40"
            value={currentStatus}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label={`Tracking status for ${title}`}
          >
            {GAME_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
    </article>
  )
}