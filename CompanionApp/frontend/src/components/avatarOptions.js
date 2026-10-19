import { Crosshair, Gamepad2, Orbit, Shield, Zap } from 'lucide-react'

export const AVATAR_OPTIONS = [
  { id: 'arcade', label: 'Arcade', icon: Gamepad2, color: 'text-lime-200', background: 'bg-lime-300/10' },
  { id: 'orbit', label: 'Orbit', icon: Orbit, color: 'text-sky-200', background: 'bg-sky-300/10' },
  { id: 'shield', label: 'Shield', icon: Shield, color: 'text-violet-200', background: 'bg-violet-300/10' },
  { id: 'strike', label: 'Strike', icon: Crosshair, color: 'text-amber-200', background: 'bg-amber-300/10' },
  { id: 'pulse', label: 'Pulse', icon: Zap, color: 'text-rose-200', background: 'bg-rose-300/10' },
]