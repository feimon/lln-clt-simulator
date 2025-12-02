
import { GoogleGenAI } from "@google/genai";
import { DistributionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMathExplanation = async (
  distribution: DistributionType,
  stats: {
    sampleSize?: number;
    numSimulations?: number;
  }
): Promise<string> => {
  // Use gemini-3-pro-preview for complex math/STEM reasoning tasks
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    I am running a dynamic simulation of the Central Limit Theorem (CLT) where I am increasing the Sample Size (n).
    Underlying Distribution: ${distribution}.
    Current Sample Size (n): ${stats.sampleSize}.
    Total Simulations (M): ${stats.numSimulations} (Fixed).
    
    We are observing the histogram of sample means compared to the theoretical Normal Distribution (Red curve).
    
    Please explain briefly (in 2-3 sentences) to a student:
    1. Why does the histogram fit the red curve better as n increases?
    2. Explain the relationship between the "narrowing" of the curve and the Standard Error (sigma/sqrt(n)).
    3. Confirm that the convergence happens regardless of the original distribution shape.
    
    Address the user directly. Use Markdown for formatting (bolding key terms).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate an explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while fetching the explanation. Please try again.";
  }
};
