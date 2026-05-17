export type RedBullHabitId = "redbull_1_or_less" | "redbull_2";

export type BinaryHabitId =
  | "healthy_meals"
  | "worked_out_long_walk"
  | "no_significant_snacking"
  | "bonus_exercise";

export type HabitId = RedBullHabitId | BinaryHabitId;

export type HabitDefinition = {
  id: HabitId;
  label: string;
  points: number;
};

export type DayRecord = {
  redBullChoice: RedBullHabitId | null;
  completedHabits: BinaryHabitId[];
};

export type RecordsByDate = Record<string, DayRecord>;

export const RED_BULL_HABITS: HabitDefinition[] = [
  { id: "redbull_1_or_less", label: "1 Redbull or less", points: 2 },
  { id: "redbull_2", label: "2 redbulls", points: 1 },
];

export const BINARY_HABITS: HabitDefinition[] = [
  { id: "healthy_meals", label: "Healthy Meals", points: 1 },
  { id: "worked_out_long_walk", label: "Worked out / Long walk", points: 1 },
  {
    id: "no_significant_snacking",
    label: "No significant candy or heavy snacking",
    points: 1,
  },
  { id: "bonus_exercise", label: "Bonus Exercise", points: 1 },
];

export const EMPTY_DAY_RECORD: DayRecord = {
  redBullChoice: null,
  completedHabits: [],
};

export function calculatePoints(record: DayRecord | undefined) {
  if (!record) {
    return 0;
  }

  const redBullPoints =
    RED_BULL_HABITS.find((habit) => habit.id === record.redBullChoice)
      ?.points ?? 0;
  const binaryPoints = record.completedHabits.reduce((total, habitId) => {
    return (
      total + (BINARY_HABITS.find((habit) => habit.id === habitId)?.points ?? 0)
    );
  }, 0);

  return redBullPoints + binaryPoints;
}

export function getScoreColor(points: number) {
  if (points >= 5) {
    return "#18D7E8";
  }

  if (points === 4) {
    return "#20E35B";
  }

  if (points === 3) {
    return "#F6D64B";
  }

  return "#E94141";
}
