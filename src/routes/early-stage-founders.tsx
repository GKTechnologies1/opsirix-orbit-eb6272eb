import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/early-stage-founders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/early-stage-founders"!</div>
}
