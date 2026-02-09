
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum ActivityLevel {
  SEDENTARY = '1.2',
  LIGHTLY_ACTIVE = '1.375',
  MODERATELY_ACTIVE = '1.55',
  VERY_ACTIVE = '1.725',
  EXTRA_ACTIVE = '1.9'
}

export enum Goal {
  LOSS = 'loss',
  MAINTAIN = 'maintain',
  GAIN = 'gain'
}

export interface UserData {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalorieResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}
