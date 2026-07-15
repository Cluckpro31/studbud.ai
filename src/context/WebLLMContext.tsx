import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import * as webllm from '@mlc-ai/web-llm';

interface WebLLMContextType {
  engine: any;
  isLoading: boolean;
  progress: string;
  isReady: boolean;
  initializeEngine: () => Promise<void>;
  generateText: (prompt: string, systemPrompt?: string, maxTokens?: number) => Promise<string>;
  generateTextStream: (prompt: string, systemPrompt?: string, maxTokens?: number) => AsyncGenerator<string, void, unknown>;
}

const WebLLMContext = createContext<WebLLMContextType | undefined>(undefined);

// Using a smaller 1B model for extreme speed and low memory usage
const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export const WebLLMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [engine, setEngine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [isReady, setIsReady] = useState(false);

  const initializeEngine = async () => {
    if (engine || isLoading) return;
    setIsLoading(true);
    setProgress('Initializing WebLLM...');

    if (!navigator.gpu) {
      setProgress("Error: WebGPU is not supported on this browser/device. Please try Chrome on desktop or Android.");
      setIsLoading(false);
      return;
    }

    try {
      if ((window as any).__WEBLLM_ENGINE__) {
        setEngine((window as any).__WEBLLM_ENGINE__);
        setIsReady(true);
        setProgress('Ready');
        setIsLoading(false);
        return;
      }

      const initProgressCallback = (report: webllm.InitProgressReport) => {
        setProgress(report.text);
      };

      const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      const newEngine = await webllm.CreateWebWorkerMLCEngine(
        worker, 
        SELECTED_MODEL, 
        { initProgressCallback },
        { context_window_size: 2048 } // Drastically reduces VRAM requirements to fix "Invalid buffer" OOM
      );

      (window as any).__WEBLLM_ENGINE__ = newEngine;
      setEngine(newEngine);
      setIsReady(true);
      setProgress('Ready');
    } catch (error: any) {
      console.error("Failed to load WebLLM:", error);
      const errorMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      setProgress(`Error: ${errorMsg || 'Failed to load model.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateText = async (prompt: string, systemPrompt: string = "You are a helpful AI study assistant named StudBud.", maxTokens?: number): Promise<string> => {
    if (!engine) throw new Error("Engine not initialized");

    const messages: webllm.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const reply = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: maxTokens !== undefined ? maxTokens : 1024,
    });

    return reply.choices[0].message.content || "";
  };

  const generateTextStream = async function* (prompt: string, systemPrompt: string = "You are a helpful AI study assistant named StudBud.", maxTokens?: number): AsyncGenerator<string, void, unknown> {
    if (!engine) throw new Error("Engine not initialized");

    const messages: webllm.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const asyncChunkGenerator = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: maxTokens !== undefined ? maxTokens : (prompt.length < 50 ? 256 : 1024),
      stream: true,
    });

    for await (const chunk of asyncChunkGenerator) {
      yield chunk.choices[0].delta.content || "";
    }
  };

  return (
    <WebLLMContext.Provider value={{ engine, isLoading, progress, isReady, initializeEngine, generateText, generateTextStream }}>
      {children}
    </WebLLMContext.Provider>
  );
};

export const useWebLLM = () => {
  const context = useContext(WebLLMContext);
  if (context === undefined) {
    throw new Error('useWebLLM must be used within a WebLLMProvider');
  }
  return context;
};
