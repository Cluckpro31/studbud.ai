import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, User, Download, RefreshCw } from 'lucide-react';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { useWebLLM } from '../context/WebLLMContext';
import textbooksData from '../data/textbooks.json';
import localforage from 'localforage';
import './AIChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIChat: React.FC = () => {
  const { isLoading, progress, isReady, initializeEngine, generateTextStream } = useWebLLM();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I'm StudBud. Ask me any doubts about your NCERT or ICSE syllabus, or have me generate a practice problem!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessageContent = (content: string) => {
    const mermaidRegex = /```(?:mermaid)?\n([\s\S]*?)```/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'mermaid', content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    if (parts.length === 0) return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;

    return (
      <>
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>{part.content}</span>;
          } else {
            return <MermaidDiagram key={idx} chart={part.content.trim()} />;
          }
        })}
      </>
    );
  };

  const extractContext = (query: string): string => {
    // A simplistic mock RAG implementation.
    // In a real app, this would use embeddings + cosine similarity.
    let context = "";
    const lowerQuery = query.toLowerCase();
    
    for (const subject of textbooksData.subjects) {
      for (const chapter of subject.chapters) {
        if (
          lowerQuery.includes(chapter.title.toLowerCase()) || 
          lowerQuery.includes('cell') && chapter.id === 'bio-11-8' ||
          lowerQuery.includes('solid') && chapter.id === 'chem-12-1' ||
          lowerQuery.includes('haloalkane') && chapter.id === 'chem-12-10'
        ) {
          context += `[From ${subject.name} - Chapter: ${chapter.title}]: ${chapter.content}\n\n`;
        }
      }
    }
    // Limit context length to prevent the model from taking too long to process (prefill phase)
    return context.length > 1500 ? context.substring(0, 1500) + "..." : context;
  };

  const handleSend = async () => {
    if (!input.trim() || !isReady) return;

    const userQuery = input.trim();
    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: userQuery };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const retrievedContext = extractContext(userQuery);
      
      const systemPrompt = `You are StudBud, an expert offline AI educational assistant. 
      You strictly assist with NCERT and ICSE textbook doubts based ON THE PROVIDED CONTEXT below.
      RULES:
      1. Be extremely concise and to the point. No fluff.
      2. If the answer is in the context, use it accurately.
      3. Do NOT hallucinate. If you are unsure, say you don't know based on the provided data.
      4. If the user asks for a diagram, flowchart, or infographic, you MUST output valid mermaid.js syntax inside a \`\`\`mermaid code block. ONLY use simple 'graph TD' syntax. 
      Example flowchart format:
      \`\`\`mermaid
      graph TD;
        A[Concept] --> B[Detail];
      \`\`\`
      Do NOT include any extra text inside the mermaid block other than the graph definition.
      
      CONTEXT:
      ${retrievedContext ? retrievedContext : 'No specific textbook context found for this query.'}`;

      const prompt = `Student says: ${userQuery}\n\nPlease answer clearly and pedagogically.`;
      
      const asyncGenerator = generateTextStream(prompt, systemPrompt);
      const newMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: newMsgId,
        role: 'assistant',
        content: ""
      }]);

      let fullResponse = "";
      setIsTyping(false); // Hide typing indicator since text is about to stream

      let chunkCount = 0;
      for await (const chunk of asyncGenerator) {
        fullResponse += chunk;
        chunkCount++;
        
        // Update UI every 3 chunks to significantly improve performance/speed
        // This stops React from bottlenecking the AI inference
        if (chunkCount % 3 === 0) {
          setMessages(prev => prev.map(m => 
            m.id === newMsgId ? { ...m, content: fullResponse } : m
          ));
        }
      }
      
      // Ensure the very last chunk is always rendered
      setMessages(prev => prev.map(m => 
        m.id === newMsgId ? { ...m, content: fullResponse } : m
      ));
      
      // Track analytics
      localforage.getItem<number>('studbud_chat_queries').then(queries => {
        localforage.setItem('studbud_chat_queries', (queries || 0) + 1);
      }).catch(console.error);
      
      
    } catch (error: any) {
      console.error("WebLLM Error:", error);
      const errorStr = error?.message || String(error) || 'Please ensure the model is loaded.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Error: Failed to generate response. Details: ${errorStr}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-chat-view animate-fade-in">
      <div className="chat-header glass-panel">
        <div>
          <h2>Study Assistant</h2>
          <p>Powered by offline On-Device AI</p>
        </div>
        {!isReady && (
          <button 
            className="btn-primary" 
            onClick={initializeEngine} 
            disabled={isLoading}
          >
            {isLoading ? <><RefreshCw size={16} className="spin" /> {progress}</> : <><Download size={16} /> Download & Initialize Model (~2GB)</>}
          </button>
        )}
        {isReady && <span className="badge outline"><Cpu size={14} /> Local AI Active</span>}
      </div>

      <div className="chat-messages glass-panel">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? <User size={18} /> : msg.role === 'assistant' ? <Cpu size={18} /> : '!'}
            </div>
            <div className={`message-bubble ${msg.role}`}>
              {renderMessageContent(msg.content)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper assistant">
            <div className="message-avatar"><Cpu size={18} /></div>
            <div className="message-bubble assistant typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container glass-panel">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isReady ? "Ask anything about your textbooks..." : "Please initialize the AI model first..."}
          disabled={!isReady || isTyping}
        />
        <button 
          className="btn-cyan send-btn" 
          onClick={handleSend}
          disabled={!isReady || !input.trim() || isTyping}
        >
          <Send size={18} fill="black" />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
