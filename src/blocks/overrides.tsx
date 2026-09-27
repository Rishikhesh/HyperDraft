// Small fixes to json-render's own shadcn components.
import type { ComponentProps } from 'react'
import { shadcnComponents } from '@json-render/shadcn'

type StackProps = ComponentProps<typeof shadcnComponents.Stack>

// json-render's Stack defaults to align "start", so inputs and buttons
// in a vertical form shrink to their content. Stretch them instead
// (and center rows), unless the AI chose an alignment.
export function Stack(ctx: StackProps) {
  const vertical = ctx.props.direction !== 'horizontal'
  const align = ctx.props.align ?? (vertical ? 'stretch' : 'center')
  return <shadcnComponents.Stack {...ctx} props={{ ...ctx.props, align }} />
}
