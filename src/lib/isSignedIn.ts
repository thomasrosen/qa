export function isSignedIn(session: any) {
  return !!session && Object.keys(session).length > 0 && !!session.user && !!session.user.id
}

export function isSignedOut(session: any) {
  return isSignedIn(session) === false
}
