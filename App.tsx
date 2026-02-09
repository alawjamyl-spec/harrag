
import React, { useState, useCallback } from 'react';
import { Calculator, Utensils, BrainCircuit, Activity, Info, ChevronLeft } from 'lucide-react';
import { UserData, CalorieResults, Gender, ActivityLevel, Goal } from './types';
import CalorieForm from './components/CalorieForm';
import ResultsDisplay from './components/ResultsDisplay';
import NutritionAI from './components/NutritionAI';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [results, setResults] = useState<CalorieResults | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'results' | 'ai'>('calculator');

  const calculateCalories = (data: UserData) => {
    // Mifflin-St Jeor Equation
    let bmr = 0;
    if (data.gender === Gender.MALE) {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
    } else {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    }

    const tdee = bmr * parseFloat(data.activityLevel);
    
    let targetCalories = tdee;
    if (data.goal === Goal.LOSS) targetCalories -= 500;
    if (data.goal === Goal.GAIN) targetCalories += 500;

    // Standard split: 30% Protein, 40% Carbs, 30% Fats
    const macros = {
      protein: Math.round((targetCalories * 0.3) / 4),
      carbs: Math.round((targetCalories * 0.4) / 4),
      fats: Math.round((targetCalories * 0.3) / 9),
    };

    setUserData(data);
    setResults({ bmr, tdee, targetCalories, macros });
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 md:pt-6">
      <header className="max-w-4xl mx-auto px-4 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 leading-none">رشاقة</h1>
              <p className="text-slate-500 text-sm mt-1">حاسبة السعرات والذكاء الاصطناعي</p>
            </div>
          </div>
          {results && activeTab !== 'calculator' && (
            <button 
              onClick={() => setActiveTab('calculator')}
              className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl transition hover:bg-emerald-100"
            >
              <span>تعديل البيانات</span>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Calculator className="text-emerald-500" />
                  أدخل بياناتك الجسمانية
                </h2>
                <p className="text-slate-500">سنستخدم هذه البيانات لحساب احتياجك اليومي من السعرات بدقة عالية.</p>
              </div>
              <CalorieForm onCalculate={calculateCalories} />
            </div>
          </div>
        )}

        {activeTab === 'results' && results && userData && (
          <ResultsDisplay results={results} userData={userData} onAskAI={() => setActiveTab('ai')} />
        )}

        {activeTab === 'ai' && userData && results && (
          <NutritionAI userData={userData} results={results} />
        )}
      </main>

      {/* Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-around items-center md:hidden z-50">
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'calculator' ? 'text-emerald-500' : 'text-slate-400'}`}
        >
          <Calculator size={24} />
          <span className="text-[10px] font-bold">الحاسبة</span>
        </button>
        <button 
          onClick={() => results ? setActiveTab('results') : null}
          className={`flex flex-col items-center gap-1 ${!results ? 'opacity-30' : ''} ${activeTab === 'results' ? 'text-emerald-500' : 'text-slate-400'}`}
          disabled={!results}
        >
          <Utensils size={24} />
          <span className="text-[10px] font-bold">النتائج</span>
        </button>
        <button 
          onClick={() => results ? setActiveTab('ai') : null}
          className={`flex flex-col items-center gap-1 ${!results ? 'opacity-30' : ''} ${activeTab === 'ai' ? 'text-emerald-500' : 'text-slate-400'}`}
          disabled={!results}
        >
          <BrainCircuit size={24} />
          <span className="text-[10px] font-bold">استشارة</span>
        </button>
      </nav>

      {/* Side Nav for Desktop */}
      <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`p-4 rounded-2xl shadow-lg transition ${activeTab === 'calculator' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 hover:text-emerald-500'}`}
          title="الحاسبة"
        >
          <Calculator size={24} />
        </button>
        <button 
          onClick={() => results ? setActiveTab('results') : null}
          className={`p-4 rounded-2xl shadow-lg transition ${!results ? 'opacity-30 cursor-not-allowed' : ''} ${activeTab === 'results' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 hover:text-emerald-500'}`}
          disabled={!results}
          title="النتائج"
        >
          <Utensils size={24} />
        </button>
        <button 
          onClick={() => results ? setActiveTab('ai') : null}
          className={`p-4 rounded-2xl shadow-lg transition ${!results ? 'opacity-30 cursor-not-allowed' : ''} ${activeTab === 'ai' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 hover:text-emerald-500'}`}
          disabled={!results}
          title="استشارة الذكاء الاصطناعي"
        >
          <BrainCircuit size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
