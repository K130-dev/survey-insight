import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const geminiClient = new GoogleGenAI({ apiKey: apiKey });

export async function summarizeTextStream(question: string, answers: string[], onChunk: (text: string) => void): Promise<void> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `
    You are an expert survey analyst. 
    Analyze the following ${answers.length} responses to the question: "${question}".
    
    Please provide a detailed and highly structured summary. 
    Use clear headings, bullet points, and bold text to organize the insights. 
    Group the feedback into key themes, highlight the most common sentiments, and note any significant outliers or actionable suggestions.
    
    CRITICAL REQUIREMENT: For each key theme or category you identify, you MUST include an estimated percentage. 
    IMPORTANT: You must classify each response into its SINGLE most relevant primary theme, so that the sum of the percentages across all primary themes equals EXACTLY 100%. Do not let the total percentage exceed 100%.
    Please append this percentage directly to the category heading (e.g., "### 薪酬福利 (占比 45%)").
    
    CRITICAL REQUIREMENT: DO NOT reveal your persona. DO NOT use phrases like "作为一名分析师" (As an analyst) or similar. Just provide the analysis directly.
    
    Provide enough detail to fully capture the breadth of the feedback.
    
    IMPORTANT: Please provide the summary in Chinese (Simplified).
    Format the output using Markdown (e.g., bullet points, bold text).

    Responses:
    ${answers.map(a => `- ${a}`).join('\n')}
  `;

  try {
    const responseStream = await geminiClient.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

export async function summarizeText(question: string, answers: string[]): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `
    You are an expert survey analyst. 
    Analyze the following ${answers.length} responses to the question: "${question}".
    
    Please provide a detailed and highly structured summary. 
    Use clear headings, bullet points, and bold text to organize the insights. 
    Group the feedback into key themes, highlight the most common sentiments, and note any significant outliers or actionable suggestions.
    
    CRITICAL REQUIREMENT: For each key theme or category you identify, you MUST include an estimated percentage. 
    IMPORTANT: You must classify each response into its SINGLE most relevant primary theme, so that the sum of the percentages across all primary themes equals EXACTLY 100%. Do not let the total percentage exceed 100%.
    Please append this percentage directly to the category heading (e.g., "### 薪酬福利 (占比 45%)").
    
    CRITICAL REQUIREMENT: DO NOT reveal your persona. DO NOT use phrases like "作为一名分析师" (As an analyst) or similar. Just provide the analysis directly.
    
    Provide enough detail to fully capture the breadth of the feedback.
    
    IMPORTANT: Please provide the summary in Chinese (Simplified).
    Format the output using Markdown (e.g., bullet points, bold text).

    Responses:
    ${answers.map(a => `- ${a}`).join('\n')}
  `;

  try {
    const response = await geminiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text || "No summary could be generated.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}
