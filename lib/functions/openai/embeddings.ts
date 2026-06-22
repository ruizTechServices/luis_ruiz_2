import openaiClient from "@/lib/clients/openai/client";

type OpenAIEmbeddingClient = {
  embeddings: {
    create(input: {
      model: string;
      input: string;
      encoding_format: "float";
    }): Promise<{ data: Array<{ embedding: number[] }> }>;
  };
};

/**
 * Generates an embedding vector for a given text string using the shared OpenAI client.
 *
 * This helper is **stateless** – it does not hold any global data of its own and
 * can therefore be imported safely in both server and client code (though the
 * actual call happens server-side via the route handler).
 *
 * @param text - The string to embed.
 * @param model - (Optional) Embedding model ID. Defaults to `text-embedding-3-small`.
 * @returns The raw embedding vector (array of floats) returned by OpenAI.
 */
export async function getTextEmbedding(
  text: string,
  model: string = "text-embedding-3-small",
  client: OpenAIEmbeddingClient = openaiClient,
): Promise<number[]> {
  const response = await client.embeddings.create({
    model,
    input: text,
    encoding_format: "float",
  });

  // The embeddings endpoint returns an array of embeddings (one per input).
  return response.data[0].embedding as number[];
}
