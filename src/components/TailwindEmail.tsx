import tailwindConfig from '@@/tailwind.config'
import { Tailwind } from '@react-email/tailwind'

export function TailwindEmail({ children }: { children: React.ReactNode }) {
  return <Tailwind config={tailwindConfig}>{children}</Tailwind>
}
