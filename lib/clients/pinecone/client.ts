import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey) {
  throw new Error('Missing PINECONE_API_KEY env var');
}

const pc = new Pinecone({ apiKey });

const index = pc.index('chatbot-main-3');

export default index;
export { pc };
