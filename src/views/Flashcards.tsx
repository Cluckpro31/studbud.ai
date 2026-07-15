import React, { useState } from 'react';
import { useWebLLM } from '../context/WebLLMContext';
import { Sparkles, RefreshCw, Check, X } from 'lucide-react';
import textbooksData from '../data/textbooks.json';
import './Flashcards.css';

interface Flashcard {
  front: string;
  back: string;
}

const Flashcards: React.FC = () => {
  const { isReady, generateText } = useWebLLM();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const generateCards = async () => {
    if (!topic.trim() || !isReady) return;
    setIsGenerating(true);
    setErrorMsg('');
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      let context = "";
      const lowerTopic = topic.toLowerCase();
      for (const subject of textbooksData.subjects) {
        for (const chapter of subject.chapters) {
          if (lowerTopic.includes(chapter.title.toLowerCase()) || chapter.content.toLowerCase().includes(lowerTopic)) {
            context += `[${chapter.title}]: ${chapter.content}\n`;
          }
        }
      }

      const systemPrompt = `You are an expert AI tutor. Generate 5 flashcards for the given topic. 
      Use this context if relevant: ${context}
      Return ONLY valid JSON in this exact format:
      [
        {"front": "Concept name or question", "back": "Short explanation or answer"}
      ]`;

      const response = await generateText(`Topic: ${topic}. Give me exactly 5 flashcards in JSON. You MUST return ONLY a JSON array.`, systemPrompt, 1024);
      
      let cleanResponse = response.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const arrayMatch = cleanResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (!arrayMatch) {
        throw new Error("No JSON array found in response");
      }
      
      let jsonStr = arrayMatch[0];
      jsonStr = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
      jsonStr = jsonStr.replace(/}\s*{/g, '},{');
      
      const parsedCards = JSON.parse(jsonStr) as Flashcard[];
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        setCards(parsedCards);
      } else {
        throw new Error("Parsed JSON is not a valid array of flashcards.");
      }
    } catch (error: any) {
      console.error("Failed to generate flashcards", error);
      setErrorMsg(`Generation failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    }
  };

  return (
    <div className="flashcards-view animate-fade-in">
      <div className="flashcards-header">
        <h2>Smart Flashcards</h2>
        <p>AI-optimized spaced repetition for your textbooks.</p>
        {!isReady && <p className="text-warning">Please initialize the AI model in the Chat view first.</p>}
      </div>

      <div className="flashcards-container">
        <div className="glass-panel generate-panel">
          <div className="generate-header">
            <h3>Generate Deck</h3>
            <Sparkles size={18} color="var(--accent-secondary)" />
          </div>
          
          <div className="input-group">
            <label>Topic</label>
            <input 
              type="text"
              className="input-field" 
              placeholder="e.g. Mitochondria, Cell Biology"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          <button 
            className="btn-cyan" 
            onClick={generateCards}
            disabled={!isReady || !topic.trim() || isGenerating}
            style={{ width: '100%', marginTop: '24px' }}
          >
            {isGenerating ? <><RefreshCw size={16} className="spin"/> Generating...</> : 'Create Deck'}
          </button>
        </div>

        <div className="glass-panel preview-panel">
          {cards.length === 0 && !isGenerating && !errorMsg && (
             <div className="empty-state">
               <Sparkles size={48} color="var(--bg-secondary)" />
               <p>Enter a topic to generate flashcards offline.</p>
             </div>
          )}

          {errorMsg && (
             <div className="empty-state">
               <p className="text-warning">{errorMsg}</p>
             </div>
          )}

          {isGenerating && (
            <div className="empty-state">
              <div className="spinner-cyan"></div>
              <p>Extracting key concepts...</p>
            </div>
          )}

          {cards.length > 0 && (
            <div className="flashcard-play">
               <div className="play-header">
                <span className="badge outline">Reviewing</span>
                <span className="question-count">Card {currentIndex + 1} of {cards.length}</span>
              </div>

              <div 
                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <h3>{cards[currentIndex].front}</h3>
                    <span className="flip-hint">Click to reveal</span>
                  </div>
                  <div className="flashcard-back">
                    <p>{cards[currentIndex].back}</p>
                  </div>
                </div>
              </div>

              {isFlipped && (
                <div className="flashcard-actions animate-fade-in">
                  <button className="action-btn incorrect" onClick={nextCard}>
                    <X size={24} />
                    <span>Needs Review</span>
                  </button>
                  <button className="action-btn correct" onClick={nextCard}>
                    <Check size={24} />
                    <span>Got It</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
