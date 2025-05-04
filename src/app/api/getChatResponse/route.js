import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { HumanMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";
import getRelevantDocuments from "../../../helpers/getDocuments"
// Setup LangChain with your API key
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY, // Ensure you have this API key in your .env
  model: "models/gemini-1.5-flash",
  temperature: 0.7,
  maxOutputTokens: 2048,
});

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "chat_history",
});

// Main API Route to handle user query
export async function POST(request) {
  try {
    const { message } = await request.json();  // Get the user's query from the request body
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const relevantDocs = await getRelevantDocuments(message);
    
    let retrievalContent = relevantDocs.map(doc => doc.content).join("\n");
    const prompt = `Here are some documents that might help answer your question:\n\n${retrievalContent}\n\nAnswer the following question based on the above information:\n${message}`;

    const chatHistory = [new HumanMessage(message)];
    const result = await model.invoke(chatHistory);
    const aiResponse = result.content.trim();

    return NextResponse.json({ aiResponse }, { status: 200 });

  } catch (error) {
    console.error("Error:", error.message || error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
