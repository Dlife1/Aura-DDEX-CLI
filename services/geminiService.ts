import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { AiAuditResult, ImageAnalysisResult, GroundingResult, ASDPReport } from "../types";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const SYSTEM_INSTRUCTION = `
You are the LINKZ GEN-UI ENGINE (Gresham Protocol), a highly advanced audit system for music supply chain metadata and equity distribution.
Your job is to analyze release metadata, AP2 transaction logic, and smart waterfall schedules.
You speak in a high-tech, financial-strategic tone, focusing on "Equity Generation", "Synergistic Assets", and "Autonomous Deployment".
`;

const CHAT_INSTRUCTION = `
You are the LINKZ Terminal Assistant. You help users construct CLI commands for the Gresham Protocol.
The available command is 'AURA-DDEX-CLI distribute'.
Flags: --release-id, --asset-source, --ddex-profile, --e2e-scope, --schedule-strategy.
Focus on "Nocturnal-Industrial" aesthetics and "High-Equity Potential".
`;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// --- CORE ANALYTICS ---

export const performSemanticAudit = async (releaseId: string, profile: string): Promise<AiAuditResult> => {
  try {
    const ai = getClient();
    if (!ai) return getMockAuditData();

    const prompt = `
      Perform a semantic audit for Release ID: ${releaseId} using DDEX Profile: ${profile}.
      Analyze potential metadata conflicts, check for 'gaming' terms in titles, and predict supply chain latency.
      Context: Artist 'ZacDWatts', Title 'from the concrete jungle'. Style: Industrial Soul.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            semanticScore: { type: Type.NUMBER, description: "Score from 0 to 100 indicating metadata quality" },
            complianceStatus: { type: Type.STRING, enum: ["PASS", "WARN", "FAIL"] },
            flaggedTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketPrediction: { type: Type.STRING, description: "A brief, 1-sentence prediction on market fit." },
            optimizationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["semanticScore", "complianceStatus", "marketPrediction"],
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiAuditResult;
    }
    return getMockAuditData();

  } catch (error) {
    console.error("Gemini Audit Failed:", error);
    return getMockAuditData();
  }
};

export const analyzeCoverArt = async (base64Image: string): Promise<ImageAnalysisResult> => {
  try {
    const ai = getClient();
    if (!ai) return getMockImageAnalysis();

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analyze this music cover art for DSP compliance. Check for: blurred text, offensive imagery, or upscaling artifacts. Rate quality 0-100." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCompliant: { type: Type.BOOLEAN },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            qualityScore: { type: Type.NUMBER }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ImageAnalysisResult;
    }
    return getMockImageAnalysis();
  } catch (e) {
    console.error("Image analysis failed", e);
    return getMockImageAnalysis();
  }
};

export const analyzeASDPStatus = async (metrics: { synergy: number, agents: number }): Promise<ASDPReport> => {
  try {
    const ai = getClient();
    if (!ai) return { synergyScore: metrics.synergy, clsScore: 0.05, status: 'OPTIMAL', activeAgents: metrics.agents, mutationProposal: "System nominal." };

    const prompt = `
      Analyze the ASDP (Autonomous Self-Deployment Protocol) status.
      Current Synergy Score: ${metrics.synergy}.
      Active Agents: ${metrics.agents}.
      
      If Synergy Score < 0, propose a code mutation to fix 'ANTAGONISTIC_AGENTS'.
      If Synergy Score > 0, confirm 'OPTIMAL' status.
      Return a JSON report.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synergyScore: { type: Type.NUMBER },
            clsScore: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ['OPTIMAL', 'DEGRADED', 'CRITICAL'] },
            activeAgents: { type: Type.NUMBER },
            mutationProposal: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text) as ASDPReport;
    return { synergyScore: metrics.synergy, clsScore: 0.05, status: 'OPTIMAL', activeAgents: metrics.agents };

  } catch (e) {
    console.error("ASDP Analysis Failed", e);
    return { synergyScore: -5, clsScore: 0.12, status: 'DEGRADED', activeAgents: 4, mutationProposal: "Error connecting to ACME Engine." };
  }
}

// --- CHAT & GROUNDING ---

export const getChatResponse = async (message: string, history: any[] = []): Promise<string> => {
  try {
    const ai = getClient();
    if (!ai) return ":: SYSTEM OFFLINE :: API_KEY_MISSING ::";

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: CHAT_INSTRUCTION
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || ":: NO RESPONSE ::";
  } catch (e) {
    console.error("Chat failed", e);
    return ":: SYSTEM ERROR :: COMM_LINK_UNSTABLE ::";
  }
};

export const performGroundingQuery = async (prompt: string, type: 'MAPS' | 'SEARCH'): Promise<GroundingResult> => {
  try {
    const ai = getClient();
    if (!ai) return { text: "API Error", source: 'NONE', chunks: [] };

    let tools = [];
    let toolConfig = {};

    if (type === 'MAPS') {
      tools = [{ googleMaps: {} }];
      // Mock location for demo purposes, in prod use navigator.geolocation
      toolConfig = { retrievalConfig: { latLng: { latitude: 40.7128, longitude: -74.0060 } } }; 
    } else {
      tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: tools,
        toolConfig: type === 'MAPS' ? toolConfig : undefined
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text: response.text || "No data returned.",
      source: type,
      chunks: chunks
    };
  } catch (e) {
    console.error("Grounding error", e);
    return { text: ":: GROUNDING FAILED ::", source: 'NONE', chunks: [] };
  }
};

// --- TRANSCRIPTION ---

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const ai = getClient();
    if (!ai) return "";

    const base64Data = await blobToBase64(audioBlob);
    const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
           { inlineData: { mimeType: "audio/wav", data: cleanBase64 } }, // Assuming wav from MediaRecorder
           { text: "Transcribe this audio command accurately." }
        ]
      }
    });
    return response.text || "";
  } catch (e) {
    console.error("Transcription failed", e);
    return "";
  }
};

// --- LIVE API ---

export const createLiveSession = async (
  onAudioData: (buffer: AudioBuffer) => void
) => {
  const ai = getClient();
  if (!ai) throw new Error("No API Key");

  const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 16000});
  const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 24000});
  
  let nextStartTime = 0;
  const sources = new Set<AudioBufferSourceNode>();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        console.log("LINKZ LIVE: CONNECTED");
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createPcmBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
           nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
           const audioBuffer = await decodeAudioData(
             decode(base64Audio),
             outputAudioContext,
             24000,
             1
           );
           
           // Pass buffer to UI if needed for visuals, or just play it
           onAudioData(audioBuffer); 

           const source = outputAudioContext.createBufferSource();
           source.buffer = audioBuffer;
           source.connect(outputAudioContext.destination);
           source.addEventListener('ended', () => sources.delete(source));
           source.start(nextStartTime);
           nextStartTime += audioBuffer.duration;
           sources.add(source);
        }
      },
      onclose: () => console.log("LINKZ LIVE: CLOSED"),
      onerror: (e) => console.error("LINKZ LIVE ERROR", e)
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: "You are LINKZ-IAED, a voice-activated equity protocol assistant. Be brief and robotic.",
    },
  });

  return {
    disconnect: () => {
      sessionPromise.then(s => s.close());
      stream.getTracks().forEach(t => t.stop());
      inputAudioContext.close();
      outputAudioContext.close();
    }
  };
};

// --- HELPERS ---

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

// Mocks
const getMockAuditData = (): AiAuditResult => ({
  semanticScore: 98.4,
  complianceStatus: 'PASS',
  flaggedTerms: ['Nocturnal-Industrial (Approved)', 'High-Density Resilience'],
  marketPrediction: "Prime candidate for 'Counter-Programming' during holiday peak.",
  optimizationSuggestions: ["Emphasize 'Atmospheric Resilience' in metadata", "Deploy Kinetic Loops to social nodes"]
});

const getMockImageAnalysis = (): ImageAnalysisResult => ({
  isCompliant: true,
  issues: [],
  tags: ['Industrial', 'Urban Decay', 'High Contrast'],
  qualityScore: 99
});