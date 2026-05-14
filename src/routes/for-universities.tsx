import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/for-universities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/for-universities"!</div>
}
