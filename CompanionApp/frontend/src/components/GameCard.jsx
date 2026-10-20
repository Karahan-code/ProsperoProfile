import { Check, ChevronDown, Clock3, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getGameArtwork } from './gameArtwork.js'

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

function StatusDropdown({ status, onStatusChange, title }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const statusStyle = STATUS_STYLES[status]
  const currentOption = GAME_STATUSES.find((option) => option.value === status)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!menuRef.current?.parentElement?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    menuRef.current?.querySelector('[aria-selected="true"]')?.focus()

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function focusOption(offset) {
    const options = [...(menuRef.current?.querySelectorAll('[role="option"]') || [])]
    const activeIndex = options.indexOf(document.activeElement)
    const nextIndex = Math.min(options.length - 1, Math.max(0, activeIndex + offset))
    options[nextIndex]?.focus()
  }

  function handleMenuKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const options = menuRef.current?.querySelectorAll('[role="option"]')
      options?.[event.key === 'Home' ? 0 : options.length - 1]?.focus()
    }
  }

  return (
    <div className="relative min-w-0 max-w-[58%]">
      <button
        ref={triggerRef}
        className="inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-slate-300 outline-none transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] focus-visible:border-lime-300/40"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Tracking status for ${title}: ${currentOption?.label}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        data-sound="click"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={`size-1.5 shrink-0 rounded-full ${statusStyle.dot}`} />
          <span className={`truncate ${statusStyle.text}`}>{currentOption?.label}</span>
        </span>
        <ChevronDown size={12} aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label={`Choose tracking status for ${title}`}
          className="dropdown-enter absolute bottom-[calc(100%+8px)] right-0 z-40 w-48 overflow-hidden rounded-lg border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
          onKeyDown={handleMenuKeyDown}
        >
          {GAME_STATUSES.map((option) => {
            const selected = option.value === status
            const optionStyle = STATUS_STYLES[option.value]

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors duration-150 hover:bg-white/[0.08] focus-visible:bg-white/[0.08] focus-visible:outline-none ${selected ? 'bg-white/[0.055] text-white' : 'text-slate-300'}`}
                onClick={() => {
                  onStatusChange(option.value)
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                data-sound="hover"
                data-sound-click
              >
                <span className={`size-2 shrink-0 rounded-full ${optionStyle.dot} ${selected ? 'shadow-[0_0_10px_currentColor]' : ''}`} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected && <Check size={13} className="shrink-0 text-lime-200" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

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

export default function GameCard({ game, status = 'planning', onStatusChange, onArtworkHover }) {
  const currentStatus = STATUS_STYLES[status] ? status : 'planning'
  const statusStyle = STATUS_STYLES[currentStatus]
  const title = game.titleName || 'Untitled game'
  const titleId = game.titleId || ''
  const platform = game.platform || (/^CUSA/i.test(titleId) ? 'PS4' : 'PS5')
  const playtime = numberOrNull(game.playtimeHours ?? game.totalPlaytimeHours ?? game.playtime?.hours ?? game.playtime)
  const trophies = gameTrophies(game)
  const progress = trophies.total > 0 && trophies.earned !== null ? Math.min(100, (trophies.earned / trophies.total) * 100) : 0
  const artwork = getGameArtwork(game)

  return (
    <article
      className={`group min-w-0 rounded-lg border border-white/10 border-l-2 ${statusStyle.border} bg-slate-900/60 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-500 ease-out hover:z-30 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/30 hover:shadow-[0_0_28px_rgba(148,163,184,0.12)]`}
      onMouseEnter={() => onArtworkHover?.(artwork)}
      onMouseLeave={() => onArtworkHover?.(null)}
      onFocus={() => onArtworkHover?.(artwork)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onArtworkHover?.(null)
      }}
      data-sound="hover"
    >
      <div className="relative isolate aspect-16/10 overflow-hidden rounded-tl-[7px] rounded-tr-[7px] bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-950">
        <img src={artwork} alt="" className="absolute inset-0 z-0 size-full object-cover transition duration-700 group-hover:scale-110" />
        <div aria-hidden="true" className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(6,9,18,0.06),rgba(6,9,18,0.72)),radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.2),transparent_26%)]" />
        <div aria-hidden="true" className="absolute -right-10 top-5 z-10 size-44 rounded-full border border-white/20 transform-[scaleX(1.45)_rotate(-25deg)]" />
        <div aria-hidden="true" className="absolute -right-5 top-10 z-10 size-36 rounded-full border border-white/20 transform-[scaleX(1.45)_rotate(30deg)]" />
        <span className={`absolute left-3 top-3 z-20 rounded-sm px-2 py-1 text-[10px] font-bold text-white shadow ${platform === 'PS4' ? 'bg-blue-700' : 'bg-black/65 backdrop-blur-sm'}`}>{platform}</span>
        <span className="absolute inset-0 z-20 grid place-items-center text-6xl font-semibold text-white/75 [text-shadow:0_3px_24px_rgba(0,0,0,0.35)]">{initialsFor(title)}</span>
        <span className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-3 text-[9px] text-white/70">
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
          <div className="h-full rounded-full bg-linear-to-r from-amber-300 to-yellow-100 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
          <span className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
            <span className={`size-2 shrink-0 rounded-full ${statusStyle.dot}`} />
            <span className={statusStyle.text}>{GAME_STATUSES.find((option) => option.value === currentStatus)?.label}</span>
          </span>
          <StatusDropdown status={currentStatus} onStatusChange={onStatusChange} title={title} />
        </div>
      </div>
    </article>
  )
}