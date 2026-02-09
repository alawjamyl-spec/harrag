
import React, { useState } from 'react';
import { UserData, Gender, ActivityLevel, Goal } from '../types.ts';

interface CalorieFormProps {
  onCalculate: (data: UserData) => void;
}

const CalorieForm: React.FC<CalorieFormProps> = ({ onCalculate }) => {
  const [formData, setFormData] = useState<UserData>({
    age: 25,
    weight: 70,
    height: 170,
    gender: Gender.MALE,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    goal: Goal.MAINTAIN,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">الجنس</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
              className={`py-3 rounded-xl border-2 transition font-bold ${formData.gender === Gender.MALE ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
            >
              ذكر
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
              className={`py-3 rounded-xl border-2 transition font-bold ${formData.gender === Gender.FEMALE ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400'}`}
            >
              أنثى
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">العمر</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition"
            placeholder="مثال: 25"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الوزن (كجم)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition"
              placeholder="70"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الطول (سم)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
              className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition"
              placeholder="170"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">مستوى النشاط</label>
          <select
            value={formData.activityLevel}
            onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition bg-white"
          >
            <option value={ActivityLevel.SEDENTARY}>خامل (قليل أو بلا تمارين)</option>
            <option value={ActivityLevel.LIGHTLY_ACTIVE}>نشاط خفيف (تمارين 1-3 أيام/أسبوع)</option>
            <option value={ActivityLevel.MODERATELY_ACTIVE}>نشاط متوسط (تمارين 3-5 أيام/أسبوع)</option>
            <option value={ActivityLevel.VERY_ACTIVE}>نشاط عالي (تمارين 6-7 أيام/أسبوع)</option>
            <option value={ActivityLevel.EXTRA_ACTIVE}>نشاط فائق (تمارين شاقة يومياً)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">الهدف الصحي</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: Goal.LOSS, label: 'خسارة الوزن (عجز 500 سعر)' },
              { id: Goal.MAINTAIN, label: 'المحافظة على الوزن' },
              { id: Goal.GAIN, label: 'زيادة الوزن (فائض 500 سعر)' }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFormData({ ...formData, goal: g.id })}
                className={`p-4 rounded-xl border-2 text-right transition font-medium ${formData.goal === g.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform active:scale-95 mt-4"
        >
          احسب السعرات الآن
        </button>
      </div>
    </form>
  );
};

export default CalorieForm;
