import { nanoid } from 'nanoid'

export function createAnonymousUser() {
  return {
    id: nanoid(),
    email: '',
    name: '',
    image: '',
  }
}
