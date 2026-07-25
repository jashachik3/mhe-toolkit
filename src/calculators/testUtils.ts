// Narrows a `T | null` calculator result to `T` for tests that expect a
// valid result — throws with a clear message instead of a TS18047 "possibly
// null" type error if a calculator unexpectedly returns null for what
// should be valid input.
export function unwrap<T>(value: T | null): T {
  if (value === null) throw new Error("expected a non-null result");
  return value;
}
