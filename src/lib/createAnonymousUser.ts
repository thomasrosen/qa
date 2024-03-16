import { nanoid } from 'nanoid'

export function createAnonymousUser() {
  return {
    id: nanoid(),
    email: '1',
    name: '2',
    image: '3',
  }
}
