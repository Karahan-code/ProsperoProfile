import { CircleUserRound, UserRoundPen } from 'lucide-react'
import { AVATAR_OPTIONS } from './avatarOptions.js'

const TROPHY_FINISHES = {
  bronze: { stops: ['#ffe2b1', '#bd7437', '#65300f'], glow: 'shadow-orange-500/10' },
  silver: { stops: ['#ffffff', '#aeb9c8', '#586477'], glow: 'shadow-slate-200/10' },
  gold: { stops: ['#fff2a6', '#e7a827', '#8b5010'], glow: 'shadow-amber-300/10' },
  platinum: { stops: ['#e4fdff', '#8bd8ee', '#3e628b'], glow: 'shadow-sky-300/15' },
}

function TrophyBadge({ label, value, finish }) {
  const gradientId = `trophy-${finish}`
  const stops = TROPHY_FINISHES[finish].stops
  const count = value === null || value === undefined ? '--' : `+${value}`

  return (
    <div className="flex min-w-0 items-center justify-center gap-1" title={`${label}: ${value ?? 'unavailable'} trophies`}>
      <span className={`relative grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-black/25 shadow-lg ${TROPHY_FINISHES[finish].glow} animate-pulse`}>
        <svg viewBox="0 0 32 32" className="size-[21px]" role="img" aria-label={`${label} trophy`}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={stops[0]} />
              <stop offset="52%" stopColor={stops[1]} />
              <stop offset="100%" stopColor={stops[2]} />
            </linearGradient>
          </defs>
          <path
            d="M10 5h12v6.2c0 4.2-2.4 7.2-6 8.5-3.6-1.3-6-4.3-6-8.5V5Z"
            fill={`url(#${gradientId})`}
            stroke="rgba(255,255,255,.75)"
            strokeWidth="1"
          />
          <path d="M10 7H6v3c0 3.1 1.8 4.8 5.1 5M22 7h4v3c0 3.1-1.8 4.8-5.1 5M16 19.8V24m-4 2h8m-7-2h6" fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          {finish === 'platinum' && <path d="m24.5 3 .6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6.6-1.5Z" fill="#e4fdff" />}
        </svg>
      </span>
      <span className="text-[10px] font-semibold tabular-nums text-slate-200">{count}</span>
    </div>
  )
}

export default function ProfileHeader({ profile, stats, onEdit }) {
  const avatar = AVATAR_OPTIONS.find((option) => option.id === profile.avatarId) || AVATAR_OPTIONS[0]

  return (
    <section className="relative mt-6 overflow-hidden rounded-lg border border-white/10 bg-slate-900/55 shadow-xl shadow-black/10 backdrop-blur-xl" aria-label="Player profile and global stats">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,rgba(132,204,22,0.13),transparent_42%),linear-gradient(115deg,rgba(255,255,255,0.035),transparent_60%)]" />
      <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-10">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="relative size-[76px] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-slate-800 shadow-lg shadow-black/30 sm:size-[88px]">
            <img className="size-full object-cover" src={avatar.image} alt={`${avatar.label} gamer avatar`} />
            <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${avatar.accent} to-transparent opacity-70`} />
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-[3px] border-slate-900 bg-emerald-400" aria-label="Online" title="Online" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">PLAYER PROFILE</p>
            <h2 className="truncate text-2xl font-semibold text-white sm:text-3xl">{profile.username}</h2>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> Online</div>
          </div>
          <button className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-white/20 hover:text-white" type="button" onClick={onEdit} aria-label="Edit profile" title="Edit profile" data-sound="click">
            <UserRoundPen size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1.2fr]">
          <div className="rounded-lg border border-white/[0.08] bg-black/15 p-4">
            <p className="text-[10px] font-medium uppercase text-slate-500">Total playtime</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.playtimeHours === null ? '--' : stats.playtimeHours.toLocaleString()}<span className="ml-1.5 text-xs font-normal text-slate-400">Hours</span></p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-black/15 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium uppercase text-slate-500">Trophies earned</p>
              <p className="text-lg font-semibold text-white">{stats.trophyTotal ?? '--'}</p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <TrophyBadge label="Bronze" value={stats.trophies?.bronze} finish="bronze" />
              <TrophyBadge label="Silver" value={stats.trophies?.silver} finish="silver" />
              <TrophyBadge label="Gold" value={stats.trophies?.gold} finish="gold" />
              <TrophyBadge label="Platinum" value={stats.trophies?.platinum} finish="platinum" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-between border-t border-white/[0.07] px-5 py-3 text-[10px] text-slate-500 sm:px-7">
        <span className="inline-flex items-center gap-2"><CircleUserRound size={13} className="text-slate-400" /> LOCAL PROFILE</span>
        <span>GLOBAL STATS</span>
      </div>
    </section>
  )
}
