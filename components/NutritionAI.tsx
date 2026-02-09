
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
        text: `أهلاً بك! أنا خبير التغذية الذكي. بناءً على بياناتك (احتياجك: ${Math.round(results.targetCalories)} سعرة)، كيف أساعدك اليوم؟`
      }]);
    }
  }, [results.targetCalories]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // الحصول على المفتاح بأمان
    const apiKey = (window as any).process?.env?.API_KEY || "";
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'user', text: input }, { role: 'model', text: "⚠️ عذراً، يجب إعداد مفتاح API الخاص بـ Gemini في إعدادات Netlify ليعمل الذكاء الاصطناعي." }]);
      setInput('');
      return;
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `أنت خبير تغذية. احتياج المستخدم: ${Math.round(results.targetCalories)} سعرة. الماكروز: بروتين ${results.macros.protein}ج، كربوهيدرات ${results.macros.carbs}ج، دهون ${results.macros.fats}ج. الهدف: ${userData.goal}.`;

      const history = messages
        .filter((m, i) => !(i === 0 && m.role === 'model'))
        .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
        config: { systemInstruction, temperature: 0.7 }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "لا توجد إجابة." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "حدث خطأ في الاتصال بالذكاء الاصطناعي." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex items-center gap-3">
        <Bot size={20} className="text-emerald-500" />
        <h4 className="font-bold text-sm">مستشارك الصحي الذكي</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <Loader2 className="animate-spin text-emerald-500 mx-auto" size={20} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-white border-t">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن وجبات صحية..."
            className="w-full p-3 pr-10 rounded-xl bg-slate-50 outline-none text-sm border focus:border-emerald-500"
          />
          <button onClick={handleSend} className="absolute left-2 text-emerald-500 p-2">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionAI;
