export const makeValueGuard = <T extends Record<string, string>>(obj: T) => {
  const set = new Set<string>(Object.values(obj))

  return (value: unknown): value is T[keyof T] => typeof value === 'string' && set.has(value)
}

export const makeKeyGuard = <T extends Record<string, unknown>>(obj: T) => {
  const set = new Set<string>(Object.keys(obj))

  return (key: unknown): key is keyof T => typeof key === 'string' && set.has(key)
}
