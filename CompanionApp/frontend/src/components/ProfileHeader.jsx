import { CircleUserRound, Trophy, UserRoundPen } from 'lucide-react'
import { AVATAR_OPTIONS } from './avatarOptions.js'

export function AvatarGlyph({ avatarId, size = 28 }) {
  const avatar = AVATAR_OPTIONS.find((option) => option.id === avatarId) || AVATAR_OPTIONS[0]
  const Icon = avatar.icon
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />
}

function TrophyCount({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5" title={`${label} trophies`}>
      <Trophy size={13} className={color} aria-hidden="true" />
      <span className="text-xs text-slate-300">{value ?? '--'}</span>
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
          <div className={`relative grid size-[76px] shrink-0 place-items-center rounded-lg border border-white/10 ${avatar.background} ${avatar.color} sm:size-[88px]`}>
            <AvatarGlyph avatarId={profile.avatarId} size={34} />
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-[3px] border-slate-900 bg-emerald-400" aria-label="Online" title="Online" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">PLAYER PROFILE</p>
            <h2 className="truncate text-2xl font-semibold text-white sm:text-3xl">{profile.username}</h2>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-400" /> Online</div>
          </div>
          <button className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-slate-400 transition hover:border-white/20 hover:text-white" type="button" onClick={onEdit} aria-label="Edit profile" title="Edit profile">
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
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <TrophyCount label="Bronze" value={stats.trophies?.bronze} color="text-amber-700" />
              <TrophyCount label="Silver" value={stats.trophies?.silver} color="text-slate-300" />
              <TrophyCount label="Gold" value={stats.trophies?.gold} color="text-yellow-300" />
              <TrophyCount label="Platinum" value={stats.trophies?.platinum} color="text-sky-200" />
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