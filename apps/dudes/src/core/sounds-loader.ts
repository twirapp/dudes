declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

export const Sound = {
  Jump: 'Jump'
} as const
export type SoundType = keyof typeof Sound

export interface SoundAsset {
  alias: SoundType
  src: string
}

const audioContext = new (window.AudioContext || window.webkitAudioContext)()

export class SoundsLoader {
  private sounds = new Map<string, AudioBuffer>()

  constructor(private readonly soundAssets: SoundAsset[] = []) {}

  async init(): Promise<void> {
    for (const sound of this.soundAssets) {
      try {
        const response = await fetch(sound.src)
        const buffer = await response.arrayBuffer()

        const audioBuffer = await audioContext.decodeAudioData(buffer)
        this.sounds.set(sound.alias, audioBuffer)
      } catch (err) {
        console.error(`Failed to load sound from ${sound.src}`, err)
      }
    }
  }

  async play(soundType: SoundType, volume: number): Promise<void> {
    return new Promise((resolve) => {
      const sound = this.sounds.get(soundType)
      if (!sound) return resolve()

      const bufferSource = audioContext.createBufferSource()
      bufferSource.buffer = sound

      const gainNode = audioContext.createGain()
      gainNode.gain.value = volume
      gainNode.connect(audioContext.destination)

      bufferSource.connect(gainNode)
      bufferSource.start(0)
      bufferSource.addEventListener('ended', () => {
        resolve()
      })
    })
  }
}
