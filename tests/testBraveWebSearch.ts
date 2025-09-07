// testBraveWebSearch.ts
// Test the Brave web search functionality
// Run with: npx tsx tests/testBraveWebSearch.ts

import 'dotenv/config';

(async () => {
  const hasKey = !!process.env.BRAVE_API_KEY;
  if (!hasKey) {
    console.log('⏭️ Skipping Brave web search test (no BRAVE_API_KEY).');
    process.exit(0);
  }
  
  try {
    const { runWebSearch } = await import('@/lib/functions/search');
    const query = "TypeScript best practices";
    const results = await runWebSearch(query);
    
    console.log(`Query: "${query}"`);
    console.log('Search results:');
    console.log(results);
    
    if (results.includes('Search failed')) {
      console.error('❌ Search request failed - check API key and endpoint');
      process.exit(1);
    } else {
      console.log('✅ Search completed successfully');
    }
  } catch (error) {
    console.error('❌ Error testing Brave web search:', error);
    process.exit(1);
  }
})();
