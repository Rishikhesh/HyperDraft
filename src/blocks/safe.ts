// Specs are checked against the schemas when finished, but a draft
// that is still streaming, or an older saved design, may not match.
// Read lists and text through these, so a missing or wrong value draws
// nothing instead of crashing the element.
import { isArray, toString } from 'lodash-es'

export const list = <T>(value: T[] | null | undefined): T[] =>
  isArray(value) ? value : []

export const text = (value: unknown): string => toString(value)
