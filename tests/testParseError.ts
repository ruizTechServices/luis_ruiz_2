// testParseError.ts

import { parseError } from '../lib/functions/parseError'

// Test Cases
const errors = [
  "Something went wrong!",
  new Error("This is a real error."),
  { foo: "bar" },
  null,
  undefined,
  404,
]

for (const err of errors) {
  const parsed = parseError(err)
  console.log("🚨 Input:", err)
  console.log("✅ Output:", parsed)
  console.log("───────────────")
}
