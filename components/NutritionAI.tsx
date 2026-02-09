
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserData, CalorieResults } from '../types.ts';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface NutritionAIProps {
  userData: UserData;
  results: CalorieResults;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const NutritionAI: React.FC<NutritionAIProps> = ({ userData, results }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        text: `أهلاً بك! أنا خبير التغذية الذكي. بناءً على بياناتك (احتياجك: ${Math.round(results.targetCalories)} سعرة)، يمكنني مساعدتك في تصميم وجباتك أو الإجابة على أي تساؤل صحي. كيف أبدأ معك اليوم؟`
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `أنت خبير تغذية ومدرب رياضي محترف...`;

      const conversationHistory = messages
        .filter((m, index) => !(index === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...conversationHistory, 
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "عذراً، حدث خطأ في معالجة الطلب.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، واجهت مشكلة في الاتصال." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[600px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot size={24} />
          </div>
          <div>
            <h4 className="font-bold">مستشارك الصحي</h4>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <Loader2 className="animate-spin text-emerald-500 mx-auto" />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل خبير التغذية..."
            className="w-full p-4 pr-12 rounded-2xl bg-slate-50 outline-none"
          />
          <button onClick={handleSend} className="absolute left-2 p-3 bg-emerald-500 text-white rounded-xl">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionAI;
