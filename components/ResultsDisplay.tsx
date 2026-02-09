
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalorieResults, UserData, Goal } from '../types.ts';
import { Sparkles, ArrowDown, ArrowUp, Zap, Scale, Info } from 'lucide-react';

interface ResultsDisplayProps {
  results: CalorieResults;
  userData: UserData;
  onAskAI: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, userData, onAskAI }) => {
  const chartData = [
    { name: 'بروتين', value: results.macros.protein * 4, grams: results.macros.protein, color: '#10b981' },
    { name: 'كربوهيدرات', value: results.macros.carbs * 4, grams: results.macros.carbs, color: '#3b82f6' },
    { name: 'دهون', value: results.macros.fats * 9, grams: results.macros.fats, color: '#f59e0b' },
  ];

  const getGoalText = () => {
    switch(userData.goal) {
      case Goal.LOSS: return { text: 'خسارة وزن', icon: <ArrowDown className="text-red-500" /> };
      case Goal.GAIN: return { text: 'بناء عضلات', icon: <ArrowUp className="text-blue-500" /> };
      default: return { text: 'ثبات الوزن', icon: <Scale className="text-emerald-500" /> };
    }
  };

  const goalInfo = getGoalText();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-xl border flex flex-col items-center text-center">
          <span className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-xs">هدفك اليومي</span>
          <div className="relative mb-4">
            <h3 className="text-6xl font-black text-slate-800">{Math.round(results.targetCalories)}</h3>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">سعرة</span>
          </div>
          <div className="flex items-center gap-2 mt-8 px-6 py-2 bg-slate-50 rounded-2xl">
            {goalInfo.icon}
            <span className="font-bold text-slate-700">{goalInfo.text}</span>
          </div>
        </div>

        <div className="bg-emerald-600 p-8 rounded-3xl text-white flex flex-col justify-between items-center text-center">
          <Sparkles size={40} className="mb-4" />
          <h4 className="text-xl font-bold mb-3">هل تريد خطة وجبات؟</h4>
          <button onClick={onAskAI} className="w-full bg-white text-emerald-600 font-bold py-4 rounded-2xl">
            تحدث مع الذكاء الاصطناعي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">توزيع المغذيات</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl border">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Info className="text-blue-500" /> نصائح</h4>
          <div className="space-y-4 text-sm text-slate-600">
             <p>• اشرب الماء بكثرة.</p>
             <p>• ركز على البروتين.</p>
             <p>• نم جيداً.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
