import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  BINARY_HABITS,
  DayRecord,
  EMPTY_DAY_RECORD,
  RED_BULL_HABITS,
  RecordsByDate,
} from "@/constants/habits";

const STORAGE_KEY = "less-bull:day-records:v1";
const binaryHabitIds = new Set<string>(BINARY_HABITS.map((habit) => habit.id));
const redBullHabitIds = new Set<string>(
  RED_BULL_HABITS.map((habit) => habit.id),
);

export async function loadRecords(): Promise<RecordsByDate> {
  try {
    const rawRecords = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawRecords) {
      return {};
    }

    return sanitizeRecords(JSON.parse(rawRecords));
  } catch {
    return {};
  }
}

export async function saveRecord(dateKey: string, record: DayRecord) {
  const records = await loadRecords();
  const nextRecords = {
    ...records,
    [dateKey]: sanitizeRecord(record),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));

  return nextRecords;
}

export async function saveRecords(records: RecordsByDate) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(sanitizeRecords(records)),
  );
}

export function getRecordForDate(records: RecordsByDate, dateKey: string) {
  return records[dateKey] ?? EMPTY_DAY_RECORD;
}

function sanitizeRecords(value: unknown): RecordsByDate {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<RecordsByDate>((records, [key, record]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      records[key] = sanitizeRecord(record);
    }

    return records;
  }, {});
}

function sanitizeRecord(value: unknown): DayRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_DAY_RECORD;
  }

  const record = value as Partial<DayRecord>;
  const redBullChoice =
    typeof record.redBullChoice === "string" &&
    redBullHabitIds.has(record.redBullChoice)
      ? record.redBullChoice
      : null;
  const completedHabits = Array.isArray(record.completedHabits)
    ? record.completedHabits.filter((habitId) => binaryHabitIds.has(habitId))
    : [];

  return {
    redBullChoice,
    completedHabits: Array.from(new Set(completedHabits)),
  };
}
