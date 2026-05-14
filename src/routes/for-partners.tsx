import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/for-partners')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/for-partners"!</div>
}
