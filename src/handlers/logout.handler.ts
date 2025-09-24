'use client'

export async function logoutHandler() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Logout failed')
}
