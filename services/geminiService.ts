
import { GoogleGenAI, Modality } from "@google/genai";
import { UserInput, SimulationResult, FinalDirective, DecisionCrossroad, SavedSimulation, ReasoningArtifacts } from "../types";
import { INTERPRETER_INSTRUCTION, SIMULATOR_INSTRUCTION, REFLECTION_LOOP_INSTRUCTION, DIRECTIVE_INSTRUCTION } from "../constants";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function cleanJSON(text: string): string {
  let cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  if (cleaned.includes('```')) {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) cleaned = match[1];
  }
  return cleaned;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        await sleep(Math.pow(2, i) * 2000);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// CALL #1: Decision Interpreter
export const interpretDecision = async (
  input: Partial<UserInput>,
  images: string[] = [],
  history: SavedSimulation[] = [],
  currentReasoning?: ReasoningArtifacts
): Promise<ReasoningArtifacts> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const promptText = `
        CURRENT INPUT:
        Foundations: ${input.situation || 'N/A'}
        Pivot: ${input.decision || 'N/A'}
        Goals: ${input.goals || 'N/A'}
        Fears: ${input.fears || 'N/A'}
        Constraints: ${input.constraints || 'N/A'}
        
        PREVIOUS INTERPRETATION (to refine): ${JSON.stringify(currentReasoning || {})}
        
        If an image is provided, analyze the environment and current reality context from the visual data as well.
      `;

    const contents: any = { parts: [{ text: promptText }] };
    images.forEach(img => {
      if (img.includes(',')) {
        contents.parts.push({ 
          inlineData: { 
            data: img.split(',')[1], 
            mimeType: 'image/jpeg' 
          } 
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: INTERPRETER_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
};

// CALL #2: Scenario Simulator
export const simulateScenarios = async (
  reasoning: ReasoningArtifacts,
  values: string[],
  images: string[] = []
): Promise<SimulationResult> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      DECISION STATE V1:
      ${JSON.stringify(reasoning)}
      
      SELECTED LIFE DRIVERS:
      ${values.join(', ')}
    `;

    const contents: any = { parts: [{ text: prompt }] };
    images.forEach(img => {
      if (img.includes(',')) {
        contents.parts.push({ 
          inlineData: { 
            data: img.split(',')[1], 
            mimeType: 'image/jpeg' 
          } 
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        systemInstruction: SIMULATOR_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(cleanJSON(response.text));
    result.reasoningArtifacts = reasoning;

    // Optional Reflection Loop
    const reflection = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `REVIEW SIMULATION: ${JSON.stringify(result)}`,
      config: {
        systemInstruction: REFLECTION_LOOP_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });
    result.reflection = JSON.parse(cleanJSON(reflection.text));

    return result;
  });
};

export const synthesizeDirective = async (
  input: UserInput,
  crossroads: DecisionCrossroad[],
  answers: Record<number, 'yes' | 'no'>,
  reasoning?: ReasoningArtifacts
): Promise<FinalDirective> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const pathData = crossroads.map((c, i) => `Junction ${i+1}: ${c.question} -> ${answers[i]}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        DECISION STATE V1: ${JSON.stringify(reasoning)}
        PATH CHOSEN:
        ${pathData}
      `,
      config: { 
        systemInstruction: DIRECTIVE_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(cleanJSON(response.text));
  });
};

export const generateVisionBoard = async (title: string, desc: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A beautiful vision board: ${title}. ${desc}. Inspiring, high-quality.` }] }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const generateVoiceDirective = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function playPCM(base64: string, onEnded?: () => void) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  try {
    const bytes = decode(base64);
    const buffer = await decodeAudioData(bytes, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    if (onEnded) source.onended = onEnded;
    source.start();
    return { stop: () => { try { source.stop(); } catch (e) {} } };
  } catch (error) {
    return null;
  }
}
