import { GoogleGenAI } from "@google/genai";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const generateText = async (prompt: string): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("AI API Key not found. Please configure GEMINI_API_KEY or API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const maxRetries = 3;
  let currentDelay = 2000; // Start with 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error(`Error generating text (Attempt ${attempt}/${maxRetries}):`, error);
      const errorMessage = (error instanceof Error) ? error.message.toLowerCase() : String(error).toLowerCase();
      
      // Check for specific retry-able errors (503, overloaded, resource exhausted)
      const isRetryable = errorMessage.includes('503') || 
                          errorMessage.includes('overloaded') || 
                          errorMessage.includes('busy') ||
                          errorMessage.includes('resource has been exhausted');

      if (isRetryable && attempt < maxRetries) {
        console.log(`Model is busy or overloaded. Retrying in ${currentDelay / 1000}s...`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff: 2s, 4s
      } else {
        // If it's not a retry-able error or we've run out of retries, re-throw it.
        throw error;
      }
    }
  }
  
  // This line is technically unreachable if the loop always throws on the last attempt,
  // but it's required for TypeScript to be happy about the return type.
  throw new Error("Failed to generate text after multiple retries.");
};


// Gist Synchronization Service
const GIST_ID_REGEX = /([a-f0-9]{32})/;
const FILENAME_REGEX = /([^\/]+)\/?$/;

const getGistId = (url: string): string | null => {
  const normalizedUrl = url.split('?')[0];
  const match = normalizedUrl.match(GIST_ID_REGEX);
  return match ? match[1] : null;
};

export const getFilename = (url: string): string | null => {
    const normalizedUrl = url.split('?')[0].replace(/\/$/, '');
    const match = normalizedUrl.match(FILENAME_REGEX);
    return match ? match[1] : 'ai-text-data.json';
}

export const loadFromGist = async (rawUrl: string, token: string): Promise<any> => {
    if (!rawUrl || !token) {
        throw new Error('Gist URL and Token are required for this operation.');
    }

    const gistId = getGistId(rawUrl);
    const filename = getFilename(rawUrl);

    if (!gistId || !filename) {
        throw new Error('Invalid Gist URL. Could not extract Gist ID or filename.');
    }

    const apiUrl = `https://api.github.com/gists/${gistId}`;

    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        if (response.status === 404) {
             throw new Error(`فشل تحميل البيانات من Gist. لم يتم العثور على Gist (404). يرجى التحقق من الرابط.`);
        }
        if (response.status === 401 || response.status === 403) {
            throw new Error(`فشل تحميل البيانات من Gist. فشل المصادقة (${response.status}). يرجى التحقق من رمز GitHub الخاص بك.`);
        }
        throw new Error(`فشل تحميل البيانات من Gist. Status: ${response.status}`);
    }

    const gistData = await response.json();

    if (!gistData.files || !gistData.files[filename]) {
        throw new Error(`الملف '${filename}' غير موجود في Gist.`);
    }

    const fileContent = gistData.files[filename].content;

    try {
        if (!fileContent || fileContent.trim() === '') {
             throw new Error('محتوى ملف Gist فارغ. لا يمكن تحليل البيانات.');
        }
        return JSON.parse(fileContent);
    } catch (e) {
        console.error("JSON Parse Error in loadFromGist:", e, "Content:", fileContent);
        throw new Error('فشل في تحليل محتوى JSON من ملف Gist.');
    }
};


export const saveToGist = async (rawUrl: string, token: string, data: any): Promise<any> => {
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
    
    return await response.json();
};
