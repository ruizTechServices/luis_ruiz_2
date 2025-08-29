// lib/functions/generateUUID.ts

/**
 * Generates a random UUID using the Web Crypto API.
 * @returns {string} A randomly generated UUID v4 string.
 */
export default function generateUUID(): string {
    return crypto.randomUUID()
  }
  

//The test for this function is in the `tests/testUUID.ts` file