// tests/testOwnership.ts
import { isOwner } from '../lib/auth/ownership';

// Store original environment value
const originalOwnerEmails = process.env.OWNER_EMAILS;

// Setup test emails
process.env.OWNER_EMAILS = "giosterr44@gmail.com,owner2@example.com";

console.log("=== Testing isOwner function ===");

// Test 1: Valid owner emails
console.log("Testing valid owner emails:");
console.log(`giosterr44@gmail.com: ${isOwner('giosterr44@gmail.com') === true ? '✅ Pass' : '❌ Fail'}`);
console.log(`GIOSTERR44@GMAIL.COM (case insensitive): ${isOwner('GIOSTERR44@GMAIL.COM') === true ? '✅ Pass' : '❌ Fail'}`);
console.log(`owner2@example.com: ${isOwner('owner2@example.com') === true ? '✅ Pass' : '❌ Fail'}`);

// Test 2: Non-owner emails
console.log("\nTesting non-owner emails:");
console.log(`random@example.com: ${isOwner('random@example.com') === false ? '✅ Pass' : '❌ Fail'}`);
console.log(`notowner@gmail.com: ${isOwner('notowner@gmail.com') === false ? '✅ Pass' : '❌ Fail'}`);

// Test 3: Undefined or null emails
console.log("\nTesting undefined or null emails:");
console.log(`undefined: ${isOwner(undefined) === false ? '✅ Pass' : '❌ Fail'}`);
console.log(`null: ${isOwner(null) === false ? '✅ Pass' : '❌ Fail'}`);

// Test 4: Empty OWNER_EMAILS
console.log("\nTesting empty OWNER_EMAILS:");
process.env.OWNER_EMAILS = "";
console.log(`giosterr44@gmail.com with empty OWNER_EMAILS: ${isOwner('giosterr44@gmail.com') === false ? '✅ Pass' : '❌ Fail'}`);

// Restore original environment
process.env.OWNER_EMAILS = originalOwnerEmails;

console.log("\n✅ All tests completed");
