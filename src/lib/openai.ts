/*
 * OpenAI Client Configuration
 * 
 * Creates an OpenAI SDK client pointed at the Memcode gateway instead of
 * OpenAI directly. This gives us $10 of free credits with a compatible API.
 * 
 * The baseURL swap is the key trick - the OpenAI SDK works with any
 * OpenAI-compatible API, so we just change the endpoint URL.
 * 
 * Model used: gpt-5.6-luna (cheapest available, good enough for structured JSON)
 * Max tokens: 2500 (enough for full diagnosis + spare parts + repair options)
 */import OpenAI from "openai";

// Create OpenAI client pointing at Memcode gateway (not OpenAI directly)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export default openai;
