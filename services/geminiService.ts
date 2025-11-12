import { GoogleGenAI } from "@google/genai";

// Initialize ai instance. It will be null if the API_KEY is not available.
let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

try {
  // The SDK throws an error if the key is missing in a browser environment.
  // This check is a safeguard and provides a clearer error message.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e) {
  console.error("Failed to initialize Gemini AI SDK:", e);
  initializationError = "فشلت تهيئة خدمة الذكاء الاصطناعي. يرجى التأكد من أن مفتاح الواجهة البرمجية (API Key) قد تم إعداده بشكل صحيح في متغيرات البيئة (environment variables) الخاصة بالمشروع.";
}


export const generateText = async (prompt: string): Promise<string> => {
  if (initializationError || !ai) {
    return initializationError || "خدمة الذكاء الاصطناعي غير متوفرة.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
     // Check for specific API key errors from the backend
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission to access'))) {
        return "مفتاح الواجهة البرمجية (API Key) غير صالح أو لا يملك الصلاحيات اللازمة. يرجى التحقق منه.";
    }
    return "عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
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
    const response = await fetch(rawUrl, {
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