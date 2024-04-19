export function HideFromTranslation({
  real,
  children,
}: {
  real: React.ReactNode // this will be shown when rendered
  children: React.ReactNode // this is to provide context to the translation api
}) {
  return real
}
