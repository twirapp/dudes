import type {
  AssetsLoaderOptions,
  DudesLayer,
  SoundAsset
} from '@twirapp/dudes-vue/types'

export const dudesSounds: SoundAsset[] = [
  {
    alias: 'Jump',
    src: './sounds/jump.mp3'
  }
]

const productionUrl = 'https://twirapp.github.io/dudes'
export const baseUrl = import.meta.env.DEV ? location.origin : productionUrl

export const assetsLoaderOptions: AssetsLoaderOptions = {
  basePath: baseUrl + '/sprites/',
  defaultSearchParams: {
    ts: Date.now()
  }
}

export const dudesLayers: Record<DudesLayer, { name: string; src: string }[]> =
  {
    body: [
      {
        name: 'Dude',
        src: 'body/dude.png'
      },
      {
        name: 'Cat',
        src: 'body/cat.png'
      },
      {
        name: 'Devil',
        src: 'body/devil.png'
      }
    ],
    eyes: [
      {
        name: 'Dude',
        src: 'eyes/dude.png'
      },
      {
        name: 'Toned glasses',
        src: 'eyes/toned-glasses.png'
      },
      {
        name: 'Smart guy glasses',
        src: 'eyes/smart-guy-glasses.png'
      }
    ],
    mouth: [
      {
        name: 'Cat',
        src: 'mouth/cat.png'
      },
      {
        name: 'Mexican moustache',
        src: 'mouth/mexican-moustache.png'
      }
    ],
    hat: [
      {
        name: 'Santa hat',
        src: 'hat/santa.png'
      },
      {
        name: 'Cowboy hat',
        src: 'hat/cowboy.png'
      },
      {
        name: 'Girl ribbon',
        src: 'hat/girl-ribbon.png'
      }
    ],
    cosmetics: [
      {
        name: 'Gun',
        src: 'cosmetics/gun.png'
      },
      {
        name: 'Lightsaber',
        src: 'cosmetics/lightsaber.png'
      },
      {
        name: 'Cigarette',
        src: 'cosmetics/cigarette.png'
      }
    ]
  }
