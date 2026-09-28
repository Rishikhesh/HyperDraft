// Showcase blocks: device frames, terminal, globe, logos, feeds…
// The AI fills in simple strings and lists; each block turns them into
// the Magic UI component's shape.
import type { BaseComponentProps } from '@json-render/react'
import type { z } from 'zod'
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list'
import { AvatarCircles } from '@/components/ui/avatar-circles'
import { DockIcon, Dock as MagicDock } from '@/components/ui/dock'
import { File, Folder, Tree } from '@/components/ui/file-tree'
import { Globe as MagicGlobe } from '@/components/ui/globe'
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog'
import { IconCloud } from '@/components/ui/icon-cloud'
import { Iphone } from '@/components/ui/iphone'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import { Safari } from '@/components/ui/safari'
import {
  AnimatedSpan,
  Terminal as MagicTerminal,
  TypingAnimation,
} from '@/components/ui/terminal'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { Icon } from './icons'
import { Illustration } from './illustration'
import { list, text } from './safe'
import { useDark } from './use-dark'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

// "GitHub" → the simpleicons.org logo. Brand colors in light mode; in
// dark mode light gray, since some brands are black (GitHub, Vercel).
function logoUrl(name: string, dark: boolean) {
  const slug = text(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return `https://cdn.simpleicons.org/${slug}${dark ? '/e5e5e5' : ''}`
}

export function DeviceFrame({ props }: PropsOf<'DeviceFrame'>) {
  const image = props.image || undefined
  // No screenshot: the screen shows a drawn one
  const screen = (
    <Illustration
      style={props.illustration ?? 'cards'}
      moving={props.illustrationMotion === 'moving'}
      icon={props.illustrationIcon}
      seed={props.url ?? 'app'}
      className="size-full"
    />
  )
  if (props.device === 'phone') {
    return (
      <div className={cn('mx-auto w-full max-w-[280px]', props.className)}>
        <Iphone src={image} screen={screen} />
      </div>
    )
  }
  return (
    <div className={cn('w-full', props.className)}>
      <Safari
        url={props.url ?? 'example.com'}
        imageSrc={image}
        screen={screen}
      />
    </div>
  )
}

export function Terminal({ props }: PropsOf<'Terminal'>) {
  return (
    <MagicTerminal className={cn('w-full max-w-none', props.className)}>
      {list(props.lines).map((line, index) =>
        line.kind === 'command' ? (
          <TypingAnimation
            key={index}
          >{`$ ${text(line.text)}`}</TypingAnimation>
        ) : (
          <AnimatedSpan
            key={index}
            className={cn(line.kind === 'success' && 'text-emerald-500')}
          >
            {line.text}
          </AnimatedSpan>
        ),
      )}
    </MagicTerminal>
  )
}

// cobe's options for a dark globe; the default one is white
const darkGlobe = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.3, 0.3, 0.3] as [number, number, number],
  markerColor: [251 / 255, 100 / 255, 21 / 255] as [number, number, number],
  glowColor: [0.25, 0.25, 0.35] as [number, number, number],
  markers: [],
}

export function Globe({ props }: PropsOf<'Globe'>) {
  const dark = useDark()
  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-md',
        props.className,
      )}
    >
      <MagicGlobe
        key={String(dark)}
        className="absolute inset-0 max-w-none"
        config={dark ? darkGlobe : undefined}
      />
    </div>
  )
}

export function LogoCloud3D({ props }: PropsOf<'LogoCloud3D'>) {
  const dark = useDark()
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md items-center justify-center',
        props.className,
      )}
    >
      <IconCloud
        key={String(dark)}
        showControl={false}
        images={list(props.logos).map((name) => logoUrl(name, dark))}
      />
    </div>
  )
}

export function OrbitingLogos({ props }: PropsOf<'OrbitingLogos'>) {
  const dark = useDark()
  const logos = list(props.logos)
  const half = Math.ceil(logos.length / 2)
  const ring = (names: string[]) =>
    names.map((name, index) => (
      <img
        key={index}
        src={logoUrl(name, dark)}
        alt={name}
        className="size-full"
        // Brands missing from simpleicons: hide, not a broken image
        onError={(event) => (event.currentTarget.hidden = true)}
      />
    ))
  return (
    <div
      className={cn(
        'relative flex h-[420px] w-full items-center justify-center',
        'overflow-hidden',
        props.className,
      )}
    >
      {props.center && (
        <span className="z-10 text-2xl font-bold tracking-tight">
          {props.center}
        </span>
      )}
      <OrbitingCircles iconSize={36} radius={170}>
        {ring(logos.slice(0, half))}
      </OrbitingCircles>
      <OrbitingCircles iconSize={28} radius={95} reverse speed={1.5}>
        {ring(logos.slice(half))}
      </OrbitingCircles>
    </div>
  )
}

export function ActivityFeed({ props }: PropsOf<'ActivityFeed'>) {
  return (
    <div className={cn('w-full max-w-md', props.className)}>
      <AnimatedList delay={1200}>
        {list(props.items).map((item, index) => (
          <AnimatedListItem key={index}>
            <figure
              className="flex items-center gap-3 rounded-xl border bg-card p-4"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center
                  rounded-full bg-primary/10 text-primary"
              >
                <Icon name={item.icon ?? 'bell'} className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col text-sm">
                <span className="font-medium">
                  {item.title}
                  {item.time && (
                    <span className="font-normal text-muted-foreground">
                      {' · '}
                      {item.time}
                    </span>
                  )}
                </span>
                {item.description && (
                  <span className="truncate text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </span>
            </figure>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  )
}

export function AvatarStack({ props }: PropsOf<'AvatarStack'>) {
  const avatars = list(props.people).map((name) => ({
    imageUrl:
      'https://api.dicebear.com/9.x/notionists/svg?seed=' +
      encodeURIComponent(text(name)),
    profileUrl: '#',
  }))
  return (
    <div className={cn('flex items-center gap-3', props.className)}>
      <AvatarCircles avatarUrls={avatars} numPeople={props.extra ?? 0} />
      {props.label && (
        <span className="text-sm text-muted-foreground">{props.label}</span>
      )}
    </div>
  )
}

type Node = { id: string; name: string; children: Node[] }

// ["src/app/page.tsx", "src/lib/db.ts"] → nested folders and files
function toTree(paths: string[]): Node[] {
  const root: Node[] = []
  for (const path of paths) {
    let level = root
    let id = ''
    for (const name of text(path).split('/').filter(Boolean)) {
      id = id ? `${id}/${name}` : name
      let node = level.find((item) => item.name === name)
      if (!node) level.push((node = { id, name, children: [] }))
      level = node.children
    }
  }
  return root
}

function TreeNodes({ nodes }: { nodes: Node[] }) {
  return nodes.map((node) =>
    node.children.length ? (
      <Folder key={node.id} value={node.id} element={node.name}>
        <TreeNodes nodes={node.children} />
      </Folder>
    ) : (
      <File key={node.id} value={node.id}>
        <p>{node.name}</p>
      </File>
    ),
  )
}

export function FileTree({ props }: PropsOf<'FileTree'>) {
  const nodes = toTree(list(props.paths))
  const folders = (items: Node[]): string[] =>
    items.flatMap((node) =>
      node.children.length ? [node.id, ...folders(node.children)] : [],
    )
  return (
    <div
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-xl border bg-card p-2',
        props.className,
      )}
    >
      <Tree initialExpandedItems={folders(nodes)} className="p-2">
        <TreeNodes nodes={nodes} />
      </Tree>
    </div>
  )
}

export function Dock({ props }: PropsOf<'Dock'>) {
  return (
    <div className={cn('flex w-full justify-center', props.className)}>
      <MagicDock direction="middle">
        {list(props.items).map((item, index) => (
          <DockIcon key={index} aria-label={item.label} title={item.label}>
            <Icon name={item.icon ?? 'star'} className="size-5" />
          </DockIcon>
        ))}
      </MagicDock>
    </div>
  )
}

// A YouTube embed URL's thumbnail, when no image is given
function youtubeThumbnail(url: string): string | undefined {
  const id = /youtube\.com\/embed\/([\w-]{6,})/.exec(url)?.[1]
  return id && `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
}

export function VideoPreview({ props }: PropsOf<'VideoPreview'>) {
  const thumbnail = props.image || youtubeThumbnail(text(props.video))
  return (
    <div className={cn('w-full', props.className)}>
      <HeroVideoDialog
        animationStyle={props.animation ?? 'from-center'}
        videoSrc={text(props.video)}
        thumbnailSrc={thumbnail ?? ''}
        thumbnailAlt="Video"
      />
    </div>
  )
}
