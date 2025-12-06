export const DudesFrameTags = {
  Idle: 'idle',
  Jump: 'jump',
  Fall: 'fall',
  Land: 'land',
  Walk: 'walk'
} as const

export type DudesFrameTags = typeof DudesFrameTags[keyof typeof DudesFrameTags]

export interface FrameAnimation {
  name: DudesFrameTags
  from: number
  to: number
}

export const frameAnimations: FrameAnimation[] = [
  {
    name: DudesFrameTags.Idle,
    from: 0,
    to: 2,
  },
  {
    name: DudesFrameTags.Jump,
    from: 3,
    to: 3,
  },
  {
    name: DudesFrameTags.Fall,
    from: 4,
    to: 4,
  },
  {
    name: DudesFrameTags.Land,
    from: 5,
    to: 5,
  },
  {
    name: DudesFrameTags.Walk,
    from: 6,
    to: 8,
  }
]
