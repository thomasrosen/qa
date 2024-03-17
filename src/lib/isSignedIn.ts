export function isSignedIn(session: any) {
  return !!session && Object.keys(session).length > 0 && !!session.user
}

export function isSignedOut(session: any) {
  return isSignedIn(session) === false
}
