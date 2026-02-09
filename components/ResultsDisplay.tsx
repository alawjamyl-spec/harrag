
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalorieResults, UserData, Goal } from '../types';
// Added Info to the imports from luc-react
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
        {/* Main Calorie Card */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center items-center text-center">
          <span className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-xs">هدفك اليومي</span>
          <div className="relative mb-4">
            <h3 className="text-6xl font-black text-slate-800">{Math.round(results.targetCalories)}</h3>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">سعرة حرارية</span>
          </div>
          <div className="flex items-center gap-2 mt-8 px-6 py-2 bg-slate-50 rounded-2xl">
            {goalInfo.icon}
            <span className="font-bold text-slate-700">{goalInfo.text}</span>
          </div>
          
          <div className="grid grid-cols-2 w-full gap-4 mt-8 border-t border-slate-50 pt-8">
            <div className="text-center">
              <span className="block text-slate-400 text-xs font-bold mb-1">معدل الحرق الأساسي</span>
              <span className="text-xl font-bold text-slate-700">{Math.round(results.bmr)}</span>
            </div>
            <div className="text-center border-r border-slate-100">
              <span className="block text-slate-400 text-xs font-bold mb-1">إجمالي الحرق اليومي</span>
              <span className="text-xl font-bold text-slate-700">{Math.round(results.tdee)}</span>
            </div>
          </div>
        </div>

        {/* AI Action Card */}
        <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl shadow-emerald-200 text-white flex flex-col justify-between items-center text-center overflow-hidden relative">
          <Sparkles className="absolute top-4 right-4 text-emerald-400 opacity-50" size={40} />
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-3">هل تريد خطة وجبات؟</h4>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed">تحدث مع خبير التغذية الذكي للحصول على اقتراحات وجبات تناسب سعراتك.</p>
          </div>
          <button 
            onClick={onAskAI}
            className="w-full bg-white text-emerald-600 font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-50 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            تحدث مع الذكاء الاصطناعي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macros Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="text-amber-500" />
            توزيع المغذيات الكبرى (الماكروز)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} سعرة`, name]}
                />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {chartData.map(item => (
              <div key={item.name} className="text-center p-3 rounded-2xl border border-slate-50">
                <span className="block text-[10px] font-bold text-slate-400 mb-1">{item.name}</span>
                <span className="text-lg font-black" style={{ color: item.color }}>{item.grams}ج</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            {/* Added Info icon which was previously missing from imports */}
            <Info className="text-blue-500" />
            نصائح سريعة
          </h4>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
              <div className="h-10 w-10 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">1</div>
              <p className="text-sm text-slate-600 leading-relaxed">اشرب 2-3 لتر من الماء يومياً للمساعدة في عمليات الأيض.</p>
            </div>
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
              <div className="h-10 w-10 shrink-0 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">2</div>
              <p className="text-sm text-slate-600 leading-relaxed">ركز على مصادر البروتين الخالية من الدهون لدعم كتلتك العضلية.</p>
            </div>
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
              <div className="h-10 w-10 shrink-0 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">3</div>
              <p className="text-sm text-slate-600 leading-relaxed">النوم الكافي (7-8 ساعات) ضروري جداً لتنظيم الهرمونات وحرق الدهون.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
