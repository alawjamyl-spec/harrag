
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { UserData, CalorieResults } from '../types';
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

  // Initial welcome message from AI
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
      // Initialize GoogleGenAI client with API key from environment
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `أنت خبير تغذية ومدرب رياضي محترف. 
      بيانات المستخدم الحالية: 
      - العمر: ${userData.age}
      - الوزن: ${userData.weight} كجم
      - الطول: ${userData.height} سم
      - الجنس: ${userData.gender}
      - الهدف: ${userData.goal}
      - الاحتياج اليومي من السعرات: ${Math.round(results.targetCalories)} سعرة.
      - الماكروز المقترحة: بروتين ${results.macros.protein}ج، كربوهيدرات ${results.macros.carbs}ج، دهون ${results.macros.fats}ج.
      قدم نصائح عملية بالعربية، كن مشجعاً وواضحاً. لا تقدم نصائح طبية خطيرة، وذكّر المستخدم دائماً باستشارة طبيب عند الضرورة.`;

      // Filter conversation history to ensure it starts with a 'user' message as required by Gemini
      // We exclude the hardcoded welcome message from the history sent to the model.
      const conversationHistory = messages
        .filter((m, index) => !(index === 0 && m.role === 'model'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Call generateContent with both model name and prompt (contents) as per guidelines
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

      // Directly access .text property from GenerateContentResponse
      const aiText = response.text || "عذراً، حدث خطأ في معالجة الطلب.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة مرة أخرى." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[600px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Bot size={24} />
          </div>
          <div>
            <h4 className="font-bold">مستشارك الصحي</h4>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-400">نشط الآن</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{
            role: 'model',
            text: "تم إعادة ضبط المحادثة. كيف يمكنني مساعدتك الآن؟"
          }])}
          className="p-2 hover:bg-slate-800 rounded-lg transition"
          title="مسح المحادثة"
        >
          <RefreshCw size={20} className="text-slate-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100'}`}>
                {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Sparkles size={16} className="text-emerald-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-emerald-500" />
              <span className="text-xs text-slate-400 font-bold italic">جاري التفكير...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن وصفة صحية أو نصيحة تمرين..."
            className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 outline-none transition text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute left-2 p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center">الذكاء الاصطناعي قد يخطئ، لا تستخدمه كبديل للرأي الطبي المختص.</p>
      </div>
    </div>
  );
};

export default NutritionAI;
