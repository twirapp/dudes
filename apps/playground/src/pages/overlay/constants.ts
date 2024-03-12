import type {
  AssetsLoaderOptions,
  DudesLayer,
  SoundAsset
} from '@twirapp/dudes/types'

export const dudesSounds: SoundAsset[] = [
  {
    alias: 'Jump',
    src: './sounds/jump.mp3'
  }
]

export const baseUrl = import.meta.env.DEV
  ? location.origin
  : 'https://twirapp.github.com/dudes'

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
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASAAAAAgCAYAAACy9KU0AAAAAXNSR0IArs4c6QAAAVVJREFUeJzt3EFuwyAQBVCoehnfuCfLpoehC9ep1UYuWDhD7PckVjb+I0CjbEhKAAAAAAAAAEAnueHdcuC3qVO7B0etfXR+pOjzf8r82iJLKW35OeeW71fV0Pj+S2xAS37tHhyw9iPkR4o+/6fNf68Jv91uTeEppVRKSTnnUlNE3eeaF6BX9hD5LXvQee2HyN85r8vZCz7/p86vaUDRTr0B/Ku5+S+s//jeoguADbua/33y3Lj2/nriCTQgIIwGBITRgIAwGhAQRgMCwmhAQBgNCAijAQFhNCAgjAYEhHmV2/BXz0/p+1rCNE0R2VH51ZkH1xK9/xfP//hMaT4MZZHmOzb38efZPKeL5U5PS/7eC4wj5q9LqRxHicgve/WqJXr/y8+dtofjUV1H5W+twXrU5rd2qPVXf8/detbL1fOvKvLvONZG3f9nZjvnAAAAAAAAADCmLynTrb5yQ6D8AAAAAElFTkSuQmCC'
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
