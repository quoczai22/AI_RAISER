import { getPositiveIntEnv, loadEnvFile } from "./env.js";

loadEnvFile();

export async function generateGeminiJson({ systemInstruction, prompt, schema }) {
  const defaultModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const apiKey = process.env.GEMINI_API_KEY || "";
  const timeoutMs = getPositiveIntEnv("GEMINI_TIMEOUT_MS", 45000);

  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.code = "NO_GEMINI_API_KEY";
    throw error;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${defaultModel}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(endpoint, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseFormat: {
          text: {
            mimeType: "APPLICATION_JSON",
            schema,
          },
        },
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }),
  }).finally(() => clearTimeout(timeout));

  const rawPayload = await response.text();
  let payload = {};
  try {
    payload = rawPayload ? JSON.parse(rawPayload) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const error = new Error(payload.error?.message || rawPayload.slice(0, 200) || "Gemini request failed.");
    error.code = `GEMINI_HTTP_${response.status}`;
    error.status = response.status;
    throw error;
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const error = new Error("Gemini returned an empty response.");
    error.status = 502;
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    const error = new Error("Gemini returned invalid JSON.");
    error.code = "GEMINI_INVALID_JSON";
    error.cause = parseError;
    throw error;
  }
}
