import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SimplifyRequest {
  text: string;
  targetGrade?: number;
  targetLang?: string;
}

export interface SimplifyResponse {
  original_text: string;
  simplified_text: string;
  simplification_type: string;
  translated_text?: string;
  target_lang?: string;
  readability: {
    before: number;
    after: number;
  };
}

export interface AnalyzeImageResponse {
  extracted_text: string;
  simplified_text: string;
  actions: string[];
}

export interface TranslateRequest {
  text: string;
  targetLang: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  original_text: string;
  simplified_text: string;
  actions: string[];
  type: string;
}

export const apiService = {
  // Simplify text
  simplifyText: async (text: string, targetGrade?: number, targetLang?: string): Promise<SimplifyResponse> => {
    const response = await api.post<SimplifyResponse>('/simplify', {
      text,
      target_grade: targetGrade,
      target_lang: targetLang,
    });
    return response.data;
  },

  // Analyze image
  analyzeImage: async (file: File): Promise<AnalyzeImageResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post<AnalyzeImageResponse>('/analyze_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Translate text
  translateText: async (text: string, targetLang: string): Promise<{ translated_text: string }> => {
    const response = await api.post('/translate', {
      text,
      target_lang: targetLang,
    });
    return response.data;
  },

  // Text to speech
  textToSpeech: async (text: string): Promise<Blob> => {
    const response = await api.post('/tts', { text }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get history
  getHistory: async (): Promise<{ items: HistoryItem[] }> => {
    const response = await api.get('/history');
    return response.data;
  },
};

export default apiService;
