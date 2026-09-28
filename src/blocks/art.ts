// Illustration styles (drawn in illustration.tsx). No React here: the
// server reads these names too.
export const illustrationStyles = [
  'blobs',
  'geometric',
  'orbit',
  'waves',
  'grid',
  'cards',
] as const
export type IllustrationStyle = (typeof illustrationStyles)[number]

export const illustrationHelp =
  'illustration: a picture drawn in code, used instead of a photo: ' +
  '"blobs" (soft color clouds), "geometric" (shapes), "orbit" (rings ' +
  'and dots), "waves", "grid" (tiles, some lit), "cards" (an abstract ' +
  'app screen); illustrationIcon puts an icon in its center.'
