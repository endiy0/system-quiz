import { useEffect } from 'react'
import { type Role, socket } from '../socket'

export function useRoleRegistration(role: Role) {
  useEffect(() => {
    socket.emit('role', role)
  }, [role])
}

export function NotFoundPage() {
  return (
    <main className="screen-page">
      <h1>404 Not Found</h1>
    </main>
  )
}
