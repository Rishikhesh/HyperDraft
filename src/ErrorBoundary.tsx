// If a generated UI crashes while rendering, show a message instead of
// a blank preview. React only supports this as a class component.
import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  // When this changes (a new UI arrives), try rendering again
  resetKey: unknown
}

type State = { error: Error | null; resetKey: unknown }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return props.resetKey === state.resetKey
      ? null
      : { error: null, resetKey: props.resetKey }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-md text-center text-sm">
          <p className="font-medium">This UI couldn't be displayed.</p>
          <p className="mt-1 text-muted-foreground">
            Undo, or ask for a change. ({this.state.error.message})
          </p>
        </div>
      </div>
    )
  }
}
