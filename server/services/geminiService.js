import { GoogleGenAI, Type } from "@google/genai";

/**
 * Initializes Google Gen AI SDK client.
 * Uses GEMINI_API_KEY from environment variables.
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in server/.env."
    );
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Candidate models to try in order of preference, ensuring reliability in case of temporary 503 load.
 */
const CANDIDATE_MODELS = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

/**
 * System prompt explicitly defining the AI's role, constraints, and structured extraction rules.
 */
const SYSTEM_INSTRUCTION = `
You are a specialized medical prescription and diagnostic test extraction assistant for a healthcare price comparison platform.

YOUR SOLE RESPONSIBILITY:
- Accurately read the uploaded medical prescription, lab requisition, or doctor's order.
- Extract ONLY the names of diagnostic laboratory tests, radiology scans, pathology investigations, and clinical procedures explicitly ordered or recommended for the patient.

STRICT RULES & CONSTRAINTS:
1. ONLY extract diagnostic tests, scans, or lab panels (e.g., "Complete Blood Count (CBC)", "MRI Brain", "Lipid Profile", "Ultrasound Whole Abdomen", "Chest X-Ray PA View", "Thyroid Profile (T3, T4, TSH)", "HbA1c", "Liver Function Test (LFT)", "ECG", "Urine Routine").
2. DO NOT extract medications, drugs, syrups, tablets, dosages, or general pharmacy items.
3. DO NOT diagnose any illness or suggest treatments.
4. DO NOT invent or assume tests that are not clearly written or implied in the document.
5. If handwritten text is partially ambiguous, provide the most likely standard clinical test name based on medical terminology context.
6. If the uploaded file is NOT a prescription / medical document or contains no diagnostic tests, set "tests" to an empty array [] and set "isPrescriptionValid" to false (or true if it's a valid prescription with only medications and 0 tests).
7. Respond ONLY in valid JSON matching the requested schema.
`;

/**
 * Extracts diagnostic tests and scans from a prescription buffer (Image or PDF).
 * @param {Buffer} fileBuffer - In-memory file buffer from Multer
 * @param {string} mimeType - MIME type of the file (e.g. image/jpeg, application/pdf)
 * @returns {Promise<{ tests: Array<{ name: string, category: string, notes?: string }>, doctorNotes?: string, isPrescriptionValid: boolean }>}
 */
export const extractTestsFromPrescription = async (fileBuffer, mimeType) => {
  const ai = getGeminiClient();
  const base64Data = fileBuffer.toString("base64");

  let lastError = null;

  // Try available models with fallback
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: "Analyze this prescription and extract all prescribed diagnostic tests and scans.",
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isPrescriptionValid: {
                type: Type.BOOLEAN,
                description: "Whether the document is a readable medical prescription/lab requisition.",
              },
              tests: {
                type: Type.ARRAY,
                description: "List of diagnostic tests and scans found.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "Standard clean test name (e.g., 'MRI Brain', 'CBC', 'Lipid Profile').",
                    },
                    category: {
                      type: Type.STRING,
                      description: "Category (e.g., 'Imaging', 'Laboratory', 'Cardiology', 'Pathology', 'General Diagnostic').",
                    },
                    notes: {
                      type: Type.STRING,
                      description: "Any specific notes, fasting requirements, or contrast instructions mentioned.",
                    },
                  },
                  required: ["name", "category"],
                },
              },
              doctorNotes: {
                type: Type.STRING,
                description: "Brief summary or observation of the prescription.",
              },
            },
            required: ["isPrescriptionValid", "tests"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Received empty text from Gemini.");
      }

      const parsedData = JSON.parse(responseText);
      return parsedData;
    } catch (err) {
      console.warn(`Attempt with ${modelName} encountered an issue: ${err.message}. Trying next fallback if available...`);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to extract prescription with AI models.");
};
