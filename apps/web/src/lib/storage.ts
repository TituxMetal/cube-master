// Shared versioned localStorage helper (ADR-0007). Every persisted store wraps
// its payload in a `{ version, data }` envelope so a schema change is detectable
// from day one. Reads never throw — they fall back to a default on a missing
// key, malformed JSON, or a version mismatch. Writes are best-effort and swallow
// quota/availability errors so a full or disabled localStorage degrades to
// in-memory rather than crashing the app.

export type VersionedEnvelope<T> = {
  version: number
  data: T
}

type VersionedStorageConfig<T> = {
  key: string
  version: number
  fallback: T
  // Validate the decoded data for the CURRENT version; return null to reject → fallback.
  validate?: (data: unknown) => T | null
  // Upgrade an older stored envelope to the current shape; return null to reject → fallback.
  migrate?: (stored: VersionedEnvelope<unknown>) => T | null
}

export type VersionedStorage<T> = {
  load: () => T
  save: (data: T) => void
}

const isEnvelope = (value: unknown): value is VersionedEnvelope<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  'version' in value &&
  typeof (value as { version: unknown }).version === 'number' &&
  'data' in value

export const createVersionedStorage = <T>(
  config: VersionedStorageConfig<T>
): VersionedStorage<T> => {
  const { key, version, fallback, validate, migrate } = config

  const load = (): T => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback

      const parsed: unknown = JSON.parse(raw)
      if (!isEnvelope(parsed)) return fallback

      if (parsed.version === version) {
        if (!validate) return parsed.data as T
        const valid = validate(parsed.data)
        return valid === null ? fallback : valid
      }

      // Older stored version → optional caller migration; newer/unknown → fallback.
      if (parsed.version < version && migrate) {
        const migrated = migrate(parsed)
        return migrated === null ? fallback : migrated
      }

      if (parsed.version < version && !migrate) {
        console.warn(
          `[storage] ${key}: version bumped ${parsed.version}→${version} without a migrate function — stored data discarded. Provide migrate or document this as an intentional reset.`
        )
      }

      return fallback
    } catch {
      return fallback
    }
  }

  const save = (data: T): void => {
    try {
      const envelope: VersionedEnvelope<T> = { version, data }
      localStorage.setItem(key, JSON.stringify(envelope))
    } catch {
      // Storage full or unavailable (private browsing) — silently ignore.
    }
  }

  return { load, save }
}
