import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1",
  timeout: 360000,  // Override default timeout with longer timeout for reasoning models
});

export default client;