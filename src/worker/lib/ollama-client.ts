/**
 * Ollama API Client for Meditron 7B Medical AI Model
 * Provides local AI inference for patient health summaries and medical chatbot
 */

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:11434',
      model: config.model || 'meditron',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
    };
  }

  /**
   * Generate text using Ollama's generate endpoint
   * @param prompt The user prompt
   * @param systemPrompt Optional system prompt for context
   * @returns Generated text response
   */
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n${prompt}` 
        : prompt;

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
            top_p: 0.9,
            top_k: 40,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaGenerateResponse;
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw new Error(`Failed to generate with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Chat with Ollama using the chat endpoint (supports conversation history)
   * @param messages Array of conversation messages
   * @returns Assistant's response
   */
  async chat(messages: OllamaMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
            top_p: 0.9,
            top_k: 40,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama chat error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaChatResponse;
      return data.message.content;
    } catch (error) {
      console.error('Ollama chat error:', error);
      throw new Error(`Failed to chat with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Ollama is running and accessible
   * @returns True if Ollama is healthy, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * List available models in Ollama
   * @returns Array of model names
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to list models');
      }
      const data = await response.json() as { models?: Array<{ name: string }> };
      return data.models?.map((m) => m.name) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Get configuration details
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }
}

/**
 * Simple in-memory cache for Ollama responses
 * Reduces redundant AI calls for identical patient data
 */
export class OllamaCache {
  private cache: Map<string, { response: string; timestamp: number }>;
  private ttl: number;

  constructor(ttlMinutes = 60) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Get cached response if available and not expired
   */
  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.response;
  }

  /**
   * Store response in cache
   */
  set(key: string, response: string): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate cache key from patient data
   */
  static generateKey(patientData: Record<string, unknown>): string {
    const { diagnoses, medications, lab_results, medical_record_number } = patientData;
    const dataString = `${medical_record_number}_${diagnoses}_${medications}_${lab_results}`;
    // Simple hash function (for production, use crypto.subtle.digest)
    return dataString.substring(0, 100).replace(/\s/g, '_');
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; ttlMinutes: number } {
    return {
      size: this.cache.size,
      ttlMinutes: this.ttl / (60 * 1000),
    };
  }
}
