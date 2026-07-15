import React, { useState } from 'react';
import { useWebLLM } from '../context/WebLLMContext';
import { Sparkles, CheckCircle2, ChevronRight, Download, RefreshCw } from 'lucide-react';
import textbooksData from '../data/textbooks.json';
import './QuizMaker.css';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

const QuizMaker: React.FC = () => {
  const { isReady, isLoading, progress, initializeEngine, generateText } = useWebLLM();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim() || !isReady) return;
    setIsGenerating(true);
    setErrorMsg('');
    setQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setScore(0);

    try {
      // Find matching context
      let context = "";
      const lowerTopic = topic.toLowerCase();
      for (const subject of textbooksData.subjects) {
        for (const chapter of subject.chapters) {
          if (lowerTopic.includes(chapter.title.toLowerCase()) || chapter.content.toLowerCase().includes(lowerTopic)) {
            context += `[${chapter.title}]: ${chapter.content}\n`;
          }
        }
      }

      const systemPrompt = `You are a strict JSON generator. Based on the topic provided, generate a quiz.
      Use the provided textbook context if relevant: ${context}.
      Return ONLY the JSON array containing exactly 5 questions. Do not include any markdown formatting or conversational text.`;

      const prompt = `Topic: ${topic}. Generate exactly 5 multiple-choice questions about the topic. 
      You MUST return ONLY a JSON array of objects. Write actual, real questions and options related to the topic. Do not just copy the example.
      Each object must have "question", "options" (array of 4 strings), and "correctAnswerIndex" (number 0-3). 
      Example structure: [{"question":"What is a real question about the topic?","options":["Option 1","Option 2","Option 3","Option 4"],"correctAnswerIndex":0}]`;
      
      const response = await generateText(prompt, systemPrompt, 1024);
      
      try {
        // Clean markdown if present
        let cleanResponse = response.replace(/```json/gi, '').replace(/```/gi, '').trim();
        let jsonStr = "";
        
        // Bulletproof balanced bracket extractor to ignore conversational text like "[more info]" at the end
        const extractBalancedArray = (text: string) => {
          const start = text.indexOf('[');
          if (start === -1) return null;
          
          let depth = 0;
          let inString = false;
          let escape = false;
          
          for (let i = start; i < text.length; i++) {
            const char = text[i];
            if (escape) { escape = false; continue; }
            if (char === '\\') { escape = true; continue; }
            if (char === '"') { inString = !inString; continue; }
            
            if (!inString) {
              if (char === '[') depth++;
              if (char === ']') {
                depth--;
                if (depth === 0) {
                  return text.substring(start, i + 1);
                }
              }
            }
          }
          return null;
        };

        const extracted = extractBalancedArray(cleanResponse);
        if (extracted) {
          jsonStr = extracted;
        } else {
          // Fallback if it completely forgot the array brackets
          const objStart = cleanResponse.indexOf('{');
          const objEnd = cleanResponse.lastIndexOf('}');
          if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
             jsonStr = "[" + cleanResponse.substring(objStart, objEnd + 1) + "]";
          } else {
             throw new Error("No JSON array found in response");
          }
        }
        
        // Fix common JSON errors from LLMs (trailing commas)
        jsonStr = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
        
        // Fix missing commas between objects in an array
        jsonStr = jsonStr.replace(/}\s*{/g, '},{');
        
        const rawQuiz = JSON.parse(jsonStr);
        if (Array.isArray(rawQuiz) && rawQuiz.length > 0) {
          const parsedQuiz = rawQuiz.map((q: any) => ({
            question: q.question || q.Question || q.QUESTION || "Question missing",
            options: q.options || q.Options || q.OPTIONS || ["A", "B", "C", "D"],
            correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.CorrectAnswerIndex !== undefined ? q.CorrectAnswerIndex : 0)
          }));
          setQuiz(parsedQuiz);
        } else {
          throw new Error("Invalid format - not an array");
        }
      } catch (e: any) {
        console.error("Failed to parse quiz JSON:", e, "Raw response:", response);
        setErrorMsg(`Failed to generate quiz. AI output was invalid: ${e.message}`);
      }

    } catch (error: any) {
      console.error(error);
      setErrorMsg(`Generation failed: ${error.message || 'Please ensure the model is loaded.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    setSelectedAnswer(index);
    if (quiz && index === quiz[currentQuestion].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="quiz-maker-view animate-fade-in">
      <div className="quiz-header">
        <h2>Quiz Maker</h2>
        <p>Transform your study materials into interactive challenges instantly.</p>
        {!isReady && <p className="text-warning">Please initialize the AI model in the Chat view first.</p>}
      </div>

      <div className="quiz-container">
        <div className="glass-panel generate-panel">
          <div className="generate-header">
            <h3>Generate Quiz</h3>
            <Sparkles size={18} color="var(--accent-primary)" />
          </div>
          
          <div className="input-group">
            <label>Topic or Keywords</label>
            <textarea 
              className="input-field" 
              placeholder="E.g. Solid State, Thermodynamics..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (isReady && topic.trim() && !isGenerating) {
                    generateQuiz();
                  }
                }
              }}
              rows={4}
            />
          </div>

          {!isReady ? (
            <button 
              className="btn-primary" 
              onClick={initializeEngine}
              disabled={isLoading}
              style={{ width: '100%', marginTop: '24px' }}
            >
              {isLoading ? <><RefreshCw size={16} className="spin" /> {progress}</> : <><Download size={16} /> Initialize AI Model</>}
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={generateQuiz}
              disabled={!topic.trim() || isGenerating}
              style={{ width: '100%', marginTop: '24px' }}
            >
              {isGenerating ? 'Generating...' : 'Create Quiz'}
            </button>
          )}
        </div>

        <div className="glass-panel preview-panel">
          {!quiz && !isGenerating && !showResults && !errorMsg && (
            <div className="empty-state">
              <Sparkles size={48} color="var(--bg-secondary)" />
              <p>Your quiz will appear here.</p>
            </div>
          )}

          {errorMsg && (
            <div className="empty-state">
              <p className="text-warning">{errorMsg}</p>
            </div>
          )}

          {isGenerating && (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>AI is crafting your questions...</p>
            </div>
          )}

          {quiz && !showResults && (
            <div className="quiz-play">
              <div className="play-header">
                <span className="badge outline">PREVIEW MODE</span>
                <span className="question-count">Question {currentQuestion + 1} of {quiz.length}</span>
              </div>
              
              <h3 className="question-text">{quiz[currentQuestion].question}</h3>
              
              <div className="options-list">
                {quiz[currentQuestion].options.map((opt, i) => {
                  let className = "option-btn ";
                  if (selectedAnswer !== null) {
                    if (i === quiz[currentQuestion].correctAnswerIndex) className += "correct ";
                    else if (i === selectedAnswer) className += "incorrect ";
                  }
                  
                  return (
                    <button 
                      key={i} 
                      className={className} 
                      onClick={() => handleAnswerSelect(i)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="option-text">{opt}</span>
                      {selectedAnswer !== null && i === quiz[currentQuestion].correctAnswerIndex && (
                        <CheckCircle2 className="result-icon" size={18} />
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedAnswer !== null && (
                <button className="btn-cyan next-btn" onClick={nextQuestion}>
                  {currentQuestion < quiz.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {showResults && (
            <div className="results-view text-center">
              <h2>Quiz Complete!</h2>
              <div className="score-circle">
                <span>{score}</span> / {quiz?.length}
              </div>
              <p>Great job! Keep practicing to achieve Euphoria.</p>
              <button className="btn-primary" onClick={() => { setQuiz(null); setShowResults(false); }}>
                Create Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizMaker;
