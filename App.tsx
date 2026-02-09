
import React, { useState, useRef, useEffect } from 'react';
import { 
  Calculator, Utensils, BrainCircuit, Activity, ChevronLeft, 
  Send, Bot, User, Loader2, Sparkles, ArrowDown, ArrowUp, Scale, Info 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GoogleGenAI } from '@google/genai';

// --- TYPES ---
enum Gender { MALE = 'male', FEMALE = 'female' }
enum ActivityLevel { 
  SEDENTARY = '1.2', 
  LIGHTLY_ACTIVE = '1.375', 
  MODERATELY_ACTIVE = '1.55', 
  VERY_ACTIVE = '1.725', 
  EXTRA_ACTIVE = '1.9' 
}
enum Goal { LOSS = 'loss', MAINTAIN = 'maintain', GAIN = 'gain' }

interface UserData {
  age: number; weight: number; height: number;
  gender: Gender; activityLevel: ActivityLevel; goal: Goal;
}

interface CalorieResults {
  bmr: number; tdee: number; targetCalories: number;
  macros: { protein: number; carbs: number; fats: number; };
}

// --- SUB-COMPONENT: CALORIE FORM ---
const CalorieForm = ({ onCalculate }: { onCalculate: (data: UserData) => void }) => {
  const [formData, setFormData] = useState<UserData>({
    age: 25, weight: 70, height: 170,
    gender: Gender.MALE, activityLevel: ActivityLevel.MODERATELY_ACTIVE, goal: Goal.MAINTAIN,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onCalculate(formData); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">الجنس</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
              className={`py-3 rounded-xl border-2 transition font-bold ${formData.gender === Gender.MALE ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}>ذكر</button>
            <button type="button" onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
              className={`py-3 rounded-xl border-2 transition font-bold ${formData.gender === Gender.FEMALE ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}>أنثى</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">العمر</label>
          <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })} className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">الوزن (كجم)</label>
          <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">الطول (سم)</label>
          <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })} className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-emerald-500" /></div>
        </div>
      </div>
      <div className="space-y-4">
        <div><label className="block text-sm font-bold text-slate-700 mb-2">مستوى النشاط</label>
        <select value={formData.activityLevel} onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })} className="w-full p-4 rounded-xl border-2 border-slate-100 bg-white outline-none focus:border-emerald-500">
          <option value={ActivityLevel.SEDENTARY}>خامل (قليل أو بلا تمارين)</option>
          <option value={ActivityLevel.LIGHTLY_ACTIVE}>نشاط خفيف (تمارين 1-3 أيام)</option>
          <option value={ActivityLevel.MODERATELY_ACTIVE}>نشاط متوسط (تمارين 3-5 أيام)</option>
          <option value={ActivityLevel.VERY_ACTIVE}>نشاط عالي (تمارين 6-7 أيام)</option>
        </select></div>
        <div><label className="block text-sm font-bold text-slate-700 mb-2">الهدف</label>
        <div className="flex flex-col gap-2">
          {[{id: Goal.LOSS, l: 'خسارة وزن'}, {id: Goal.MAINTAIN, l: 'ثبات'}, {id: Goal.GAIN, l: 'زيادة وزن'}].map(g => (
            <button key={g.id} type="button" onClick={() => setFormData({...formData, goal: g.id})} className={`p-3 rounded-xl border-2 text-right transition ${formData.goal === g.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 text-slate-400'}`}>{g.l}</button>
          ))}
        </div></div>
        <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-600 transition">احسب الآن</button>
      </div>
    </form>
  );
};

// --- SUB-COMPONENT: RESULTS DISPLAY ---
const ResultsDisplay = ({ results, userData, onAskAI }: { results: CalorieResults, userData: UserData, onAskAI: () => void }) => {
  const chartData = [
    { name: 'بروتين', value: results.macros.protein * 4, color: '#10b981' },
    { name: 'كربوهيدرات', value: results.macros.carbs * 4, color: '#3b82f6' },
    { name: 'دهون', value: results.macros.fats * 9, color: '#f59e0b' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-xl border flex flex-col items-center justify-center">
          <span className="text-slate-400 font-bold text-xs uppercase mb-2">احتياجك اليومي</span>
          <div className="text-6xl font-black text-slate-800">{Math.round(results.targetCalories)} <span className="text-xl text-emerald-500">سعرة</span></div>
          <div className="mt-6 px-4 py-2 bg-slate-50 rounded-full flex items-center gap-2 text-slate-600 font-bold">
            {userData.goal === Goal.LOSS ? <ArrowDown size={18} className="text-red-500"/> : userData.goal === Goal.GAIN ? <ArrowUp size={18} className="text-blue-500"/> : <Scale size={18} className="text-emerald-500"/>}
            {userData.goal === Goal.LOSS ? 'خسارة وزن' : userData.goal === Goal.GAIN ? 'زيادة وزن' : 'ثبات وزن'}
          </div>
        </div>
        <div className="bg-emerald-600 p-8 rounded-3xl text-white flex flex-col items-center justify-center text-center gap-4 shadow-lg shadow-emerald-200">
          <BrainCircuit size={48} />
          <h4 className="font-bold">هل تريد خطة وجبات؟</h4>
          <button onClick={onAskAI} className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl">اسأل الذكاء الاصطناعي</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border h-64">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
           </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg border">
          <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><Utensils size={20} className="text-emerald-500"/> الماكروز اليومية</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-slate-500">البروتين</span><span className="font-bold">{results.macros.protein} جرام</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">الكربوهيدرات</span><span className="font-bold">{results.macros.carbs} جرام</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-500">الدهون</span><span className="font-bold">{results.macros.fats} جرام</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: NUTRITION AI ---
const NutritionAI = ({ userData, results }: { userData: UserData, results: CalorieResults }) => {
  const [messages, setMessages] = useState([{ role: 'model', text: 'أهلاً بك! أنا خبير التغذية الذكي. كيف يمكنني مساعدتك اليوم؟' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const apiKey = (window as any).process?.env?.API_KEY || "";
      if (!apiKey) throw new Error("Missing API Key");
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userText }] }],
        config: { systemInstruction: `أنت خبير تغذية. بيانات المستخدم: سعرات ${Math.round(results.targetCalories)}. الهدف: ${userData.goal}. أجب باختصار واحترافية باللغة العربية.` }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "عذراً، لم أتمكن من الرد." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "عذراً، يجب إعداد مفتاح API الخاص بـ Gemini في Netlify." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-900 p-4 text-white font-bold flex items-center gap-2"><Bot size={20} className="text-emerald-400"/> مستشارك الذكي</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border shadow-sm text-slate-700'}`}>{m.text}</div>
          </div>
        ))}
        {loading && <Loader2 className="animate-spin text-emerald-500 mx-auto" />}
      </div>
      <div className="p-3 border-t bg-white flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="اسأل عن الوجبات..." className="flex-1 p-3 rounded-xl bg-slate-100 outline-none focus:ring-2 ring-emerald-500" />
        <button onClick={handleSend} className="bg-emerald-500 text-white p-3 rounded-xl"><Send size={20}/></button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [results, setResults] = useState<CalorieResults | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'results' | 'ai'>('calculator');

  const calculate = (data: UserData) => {
    const bmr = data.gender === Gender.MALE 
      ? 10 * data.weight + 6.25 * data.height - 5 * data.age + 5 
      : 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    const tdee = bmr * parseFloat(data.activityLevel);
    let target = tdee;
    if (data.goal === Goal.LOSS) target -= 500;
    if (data.goal === Goal.GAIN) target += 500;
    
    setUserData(data);
    setResults({
      bmr, tdee, targetCalories: target,
      macros: { 
        protein: Math.round((target * 0.3) / 4), 
        carbs: Math.round((target * 0.4) / 4), 
        fats: Math.round((target * 0.3) / 9) 
      }
    });
    setActiveTab('results');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:py-10">
      <header className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg"><Activity size={32}/></div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">رشاقة</h1>
          <p className="text-slate-500">دليلك الذكي للسعرات والصحة</p>
        </div>
      </header>

      {activeTab === 'calculator' && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Calculator className="text-emerald-500"/> أدخل بياناتك</h2>
          <CalorieForm onCalculate={calculate} />
        </div>
      )}

      {activeTab === 'results' && results && userData && (
        <ResultsDisplay results={results} userData={userData} onAskAI={() => setActiveTab('ai')} />
      )}

      {activeTab === 'ai' && userData && results && (
        <NutritionAI userData={userData} results={results} />
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full flex gap-8 shadow-2xl z-50">
        <button onClick={() => setActiveTab('calculator')} className={`flex flex-col items-center gap-1 ${activeTab === 'calculator' ? 'text-emerald-400' : 'text-slate-400'}`}>
          <Calculator size={20}/><span className="text-[10px] font-bold">الحاسبة</span>
        </button>
        <button onClick={() => results && setActiveTab('results')} className={`flex flex-col items-center gap-1 ${activeTab === 'results' ? 'text-emerald-400' : 'text-slate-400'} ${!results ? 'opacity-20' : ''}`}>
          <Utensils size={20}/><span className="text-[10px] font-bold">النتائج</span>
        </button>
        <button onClick={() => results && setActiveTab('ai')} className={`flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'text-emerald-400' : 'text-slate-400'} ${!results ? 'opacity-20' : ''}`}>
          <BrainCircuit size={20}/><span className="text-[10px] font-bold">الذكاء</span>
        </button>
      </div>
    </div>
  );
};

export default App;
