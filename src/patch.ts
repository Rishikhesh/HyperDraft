import { applySpecPatch, type JsonPatch, type Spec } from '@json-render/core'

// Returns a NEW spec with the patches applied. The old spec is untouched.
// applySpecPatch edits in place, so we patch a deep copy. Keeping old
// specs intact is what will make undo work.
export function applyPatches(spec: Spec, patches: JsonPatch[]): Spec {
  const next = structuredClone(spec)
  for (const patch of patches) applySpecPatch(next, patch)
  return next
}
