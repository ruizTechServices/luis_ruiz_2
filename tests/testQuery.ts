import 'dotenv/config';

(async () => {
  const hasKey = !!process.env.PINECONE_API_KEY;
  if (!hasKey) {
    console.log('⏭️ Skipping Pinecone query test (no PINECONE_API_KEY).');
    process.exit(0);
  }
  try {
    const { semanticSearch } = await import('@/lib/functions/pinecone/query');
    const query = "How do I implement semantic search?";
    const results = await semanticSearch(query, 3);
    
    console.log(`Query: "${query}"`);
    console.log(`Found ${results.length} matches:`);
    
    results.forEach((match, index) => {
      console.log(`${index + 1}. ID: ${match.id}, Score: ${match.score}`);
      if (match.metadata) {
        console.log(`   Metadata:`, match.metadata);
      }
    });
  } catch (error) {
    console.error('Error testing semantic search:', error);
  }
})();
