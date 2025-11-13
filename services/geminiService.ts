import { GoogleGenAI } from "@google/genai";

export const generateText = async (prompt: string): Promise<string> => {
  try {
    // Check for GEMINI_API_KEY first, then fall back to API_KEY to support different environments.
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      // Throw a specific, clear error if neither key is configured.
      // The UI will catch this and display a user-friendly message.
      throw new Error("AI API Key not found. Please configure GEMINI_API_KEY or API_KEY.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    // Re-throw the error so the UI layer can handle it.
    throw error;
  }
};

// Gist Synchronization Service
const GIST_ID_REGEX = /([a-f0-9]{32})/;
const FILENAME_REGEX = /([^\/]+)\/?$/;

const getGistId = (url: string): string | null => {
  const normalizedUrl = url.split('?')[0];
  const match = normalizedUrl.match(GIST_ID_REGEX);
  return match ? match[1] : null;
};

const getFilename = (url: string): string | null => {
    const normalizedUrl = url.split('?')[0].replace(/\/$/, '');
    const match = normalizedUrl.match(FILENAME_REGEX);
    return match ? match[1] : 'ai-text-data.json';
}

export const loadFromGist = async (rawUrl: string, token: string): Promise<any> => {
    if (!rawUrl || !token) {
        throw new Error('Gist URL and Token are required.');
    }
    
    // Add a cache-busting query parameter to ensure the latest version is fetched.
    const cacheBustedUrl = `${rawUrl.split('?')[0]}?_=${new Date().getTime()}`;

    const response = await fetch(cacheBustedUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3.raw',
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new Error(`فشل تحميل البيانات من Gist. Status: ${response.status}`);
    }
    return response.json();
};

export const saveToGist = async (rawUrl: string, token: string, data: any): Promise<void> => {
    if (!rawUrl || !token) {
        throw new Error('Gist URL and Token are required.');
    }

    const gistId = getGistId(rawUrl);
    const filename = getFilename(rawUrl);

    if (!gistId || !filename) {
        throw new Error('رابط Gist غير صالح. لم يتمكن من استخراج معرف Gist أو اسم الملف.');
    }

    const apiUrl = `https://api.github.com/gists/${gistId}`;

    const body = {
        files: {
            [filename]: {
                content: JSON.stringify(data, null, 2),
            },
        },
    };

    const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`فشل حفظ البيانات إلى Gist: ${errorData.message}`);
    }
};