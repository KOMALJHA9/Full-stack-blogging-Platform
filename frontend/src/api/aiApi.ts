import axios, { AxiosError } from 'axios';

export interface AiDraft {
  title: string;
  content: string;
  tag: string;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const response = error as AxiosError<{ message?: string }>;
    return response.response?.data?.message || fallback;
  }
  return fallback;
};

export const generatePostDraft = async (prompt: string): Promise<AiDraft> => {
  try {
    const response = await axios.post<AiDraft>('/api/ai/draft', { prompt });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not generate a draft. Please try again.'));
  }
};

export const generatePostSummary = async (content: string): Promise<string> => {
  try {
    const response = await axios.post<{ summary: string }>('/api/ai/summary', { content });
    return response.data.summary;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not generate a summary. Please try again.'));
  }
};

export const sendChatMessage = async (message: string, history: AiMessage[]): Promise<string> => {
  try {
    const response = await axios.post<{ reply: string }>('/api/ai/chat', { message, history });
    return response.data.reply;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Could not reach the AI assistant. Please try again.'));
  }
};