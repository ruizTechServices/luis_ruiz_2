import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX;

if (!apiKey) {
  throw new Error('Missing PINECONE_API_KEY env var');
}

if (!indexName) {
  throw new Error('Missing PINECONE_INDEX env var');
}

const pc = new Pinecone({ apiKey });

const index = pc.index(indexName);

export default index;
export { pc };
