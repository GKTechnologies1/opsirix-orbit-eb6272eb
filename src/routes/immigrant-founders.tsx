import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/immigrant-founders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/immigrant-founders"!</div>
}
