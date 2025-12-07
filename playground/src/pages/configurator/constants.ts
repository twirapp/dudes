import { DudesFrameTag } from '@twirapp/dudes-vue'

export interface FrameAnimation {
  name: DudesFrameTag
  from: number
  to: number
}

export const frameAnimations: FrameAnimation[] = [
  {
    name: DudesFrameTag.Idle,
    from: 0,
    to: 2,
  },
  {
    name: DudesFrameTag.Jump,
    from: 3,
    to: 3,
  },
  {
    name: DudesFrameTag.Fall,
    from: 4,
    to: 4,
  },
  {
    name: DudesFrameTag.Land,
    from: 5,
    to: 5,
  },
  {
    name: DudesFrameTag.Walk,
    from: 6,
    to: 8,
  },
]
