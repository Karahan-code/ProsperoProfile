let audioContext
let audioUnlocked = false

export function playUiSound(type = 'hover') {
  if (type === 'click') audioUnlocked = true
  if (!audioUnlocked) return

  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  audioContext ||= new AudioContextClass()
  if (audioContext.state === 'suspended') audioContext.resume()

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const now = audioContext.currentTime
  const isClick = type === 'click'

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(isClick ? 720 : 960, now)
  oscillator.frequency.exponentialRampToValueAtTime(isClick ? 460 : 720, now + (isClick ? 0.075 : 0.04))
  gain.gain.setValueAtTime(isClick ? 0.018 : 0.009, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + (isClick ? 0.08 : 0.045))
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + (isClick ? 0.08 : 0.045))
}
