import { Checkbox } from "expo-checkbox";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  BINARY_HABITS,
  BinaryHabitId,
  calculatePoints,
  DayRecord,
  getScoreColor,
  RED_BULL_HABITS,
  RedBullHabitId,
  RecordsByDate,
} from "@/constants/habits";
import {
  getRecordForDate,
  loadRecords,
  saveRecords,
} from "@/lib/day-records";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
const today = new Date();
const todayKey = getDateKey(today);
const palette = {
  background: "#0A0F0E",
  calendarPanel: "#103A37",
  calendarPanelBorder: "rgba(166, 214, 202, 0.22)",
  calendarText: "#F4FFF9",
  calendarMuted: "#C7E2DB",
  divider: "rgba(208, 239, 231, 0.32)",
  surface: "#22312D",
  surfaceSelected: "#36564D",
  surfaceBorder: "#4E6860",
  surfaceBorderSelected: "#8EEAD9",
  text: "#F5FAF7",
  mutedText: "#D0DDD7",
  accent: "#8EEAD9",
  today: "#F2CC62",
  monthButton: "rgba(244, 255, 249, 0.1)",
  monthButtonBorder: "rgba(244, 255, 249, 0.22)",
};

export default function Index() {
  const [records, setRecords] = useState<RecordsByDate>({});
  const recordsRef = useRef<RecordsByDate>({});
  const saveQueueRef = useRef(Promise.resolve());
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today));
  const selectedDateKey = getDateKey(selectedDate);
  const selectedRecord = getRecordForDate(records, selectedDateKey);
  const selectedPoints = calculatePoints(selectedRecord);
  const monthDays = useMemo(
    () => buildMonthGrid(visibleMonth),
    [visibleMonth],
  );
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;

    loadRecords().then((loadedRecords) => {
      if (isMounted) {
        recordsRef.current = loadedRecords;
        setRecords(loadedRecords);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateSelectedRecord(
    createNextRecord: (currentRecord: DayRecord) => DayRecord,
  ) {
    const currentRecords = recordsRef.current;
    const nextRecord = createNextRecord(
      getRecordForDate(currentRecords, selectedDateKey),
    );
    const nextRecords = {
      ...currentRecords,
      [selectedDateKey]: nextRecord,
    };

    recordsRef.current = nextRecords;
    setRecords(nextRecords);
    saveQueueRef.current = saveQueueRef.current.then(
      () => saveRecords(nextRecords),
      () => saveRecords(nextRecords),
    );

    try {
      await saveQueueRef.current;
    } catch {
      // Keep the optimistic UI usable even if a local storage write fails.
    }
  }

  function selectRedBullChoice(choice: RedBullHabitId) {
    updateSelectedRecord((currentRecord) => {
      return {
        ...currentRecord,
        redBullChoice: currentRecord.redBullChoice === choice ? null : choice,
      };
    });
  }

  function toggleBinaryHabit(habitId: BinaryHabitId) {
    updateSelectedRecord((currentRecord) => {
      const completedHabits = currentRecord.completedHabits.includes(habitId)
        ? currentRecord.completedHabits.filter(
            (completedHabitId) => completedHabitId !== habitId,
          )
        : [...currentRecord.completedHabits, habitId];

      return {
        ...currentRecord,
        completedHabits,
      };
    });
  }

  function moveMonth(offset: number) {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset),
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          flex: 1,
          minHeight: "100%",
          flexDirection: isWide ? "row" : "column",
        }}
      >
        <View
          style={{
            flex: isWide ? 1.1 : undefined,
            backgroundColor: palette.calendarPanel,
            borderBottomColor: isWide
              ? "transparent"
              : palette.calendarPanelBorder,
            borderBottomWidth: isWide ? 0 : 1,
            borderRightColor: isWide
              ? palette.calendarPanelBorder
              : "transparent",
            borderRightWidth: isWide ? 1 : 0,
            paddingBottom: 24,
            paddingLeft: 24 + insets.left,
            paddingRight: 24 + (isWide ? 0 : insets.right),
            paddingTop: 24 + insets.top,
            gap: 20,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <MonthButton label="‹" onPress={() => moveMonth(-1)} />
            <Text
              selectable
              style={{
                color: palette.calendarText,
                flex: 1,
                fontSize: 24,
                fontWeight: "800",
                letterSpacing: 0,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {formatMonthTitle(visibleMonth)}
            </Text>
            <MonthButton label="›" onPress={() => moveMonth(1)} />
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              {dayLabels.map((dayLabel, index) => (
                <Text
                  key={`${dayLabel}-${index}`}
                  selectable
                  style={{
                    color: palette.calendarMuted,
                    flex: 1,
                    fontSize: 16,
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                >
                  {dayLabel}
                </Text>
              ))}
            </View>

            <View
              style={{
                borderTopColor: palette.divider,
                borderTopWidth: 1,
                gap: 8,
                paddingTop: 8,
              }}
            >
              {monthDays.map((week, weekIndex) => (
                <View
                  key={`week-${weekIndex}`}
                  style={{ flexDirection: "row", gap: 6 }}
                >
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return (
                        <View
                          key={`empty-${weekIndex}-${dayIndex}`}
                          style={{
                            aspectRatio: 1.2,
                            borderColor: "transparent",
                            borderWidth: 2,
                            flex: 1,
                          }}
                        />
                      );
                    }

                    const dateKey = getDateKey(date);
                    const points = calculatePoints(records[dateKey]);
                    const isSelected = dateKey === selectedDateKey;
                    const isToday = dateKey === todayKey;
                    const isSelectedToday = isSelected && isToday;

                    return (
                      <Pressable
                        key={dateKey}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${formatLongDate(date)}`}
                        onPress={() => setSelectedDate(date)}
                        style={({ pressed }) => ({
                          alignItems: "center",
                          aspectRatio: 1.2,
                          backgroundColor: getScoreColor(points),
                          borderColor: isSelected
                            ? palette.calendarText
                            : isToday
                              ? palette.today
                              : "transparent",
                          borderRadius: 8,
                          borderStyle: isSelectedToday ? "dashed" : "solid",
                          borderWidth: 2,
                          flex: 1,
                          justifyContent: "center",
                          opacity: pressed ? 0.78 : 1,
                        })}
                      >
                        {isSelectedToday ? (
                          <View
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            style={{
                              borderColor: palette.today,
                              borderRadius: 5,
                              borderWidth: 2,
                              bottom: 4,
                              left: 4,
                              position: "absolute",
                              right: 4,
                              top: 4,
                            }}
                          />
                        ) : null}
                        <Text
                          selectable
                          style={{
                            color: "#FFFFFF",
                            textShadowColor: "rgba(0, 0, 0, 0.35)",
                            textShadowOffset: { height: 1, width: 0 },
                            textShadowRadius: 2,
                            fontSize: 17,
                            fontVariant: ["tabular-nums"],
                            fontWeight: "800",
                          }}
                        >
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            gap: 14,
            paddingBottom: 16 + insets.bottom,
            paddingLeft: 20 + (isWide ? 0 : insets.left),
            paddingRight: 20 + insets.right,
            paddingTop: 16 + (isWide ? insets.top : 0),
          }}
        >
          <Text
            selectable
            style={{
              color: palette.mutedText,
              fontSize: 16,
              fontVariant: ["tabular-nums"],
              fontWeight: "700",
            }}
          >
            {selectedPoints} points
          </Text>

          <View style={{ gap: 8 }}>
            <Text
              selectable
              style={{
                color: palette.text,
                fontSize: 15,
                fontWeight: "800",
                textTransform: "uppercase",
              }}
            >
              Red Bull
            </Text>
            {RED_BULL_HABITS.map((habit) => {
              const isSelected = selectedRecord.redBullChoice === habit.id;

              return (
                <Pressable
                  key={habit.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() => selectRedBullChoice(habit.id as RedBullHabitId)}
                  style={({ pressed }) => ({
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? palette.surfaceSelected
                      : palette.surface,
                    borderColor: isSelected
                      ? palette.surfaceBorderSelected
                      : palette.surfaceBorder,
                    borderRadius: 8,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: 12,
                    justifyContent: "space-between",
                    minHeight: 44,
                    opacity: pressed ? 0.72 : 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  })}
                >
                  <Text
                    selectable
                    style={{
                      color: palette.text,
                      flex: 1,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {habit.label}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: palette.mutedText,
                      fontSize: 15,
                      fontVariant: ["tabular-nums"],
                      fontWeight: "800",
                    }}
                  >
                    {habit.points} pt{habit.points === 1 ? "" : "s"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: 8 }}>
            <Text
              selectable
              style={{
                color: palette.text,
                fontSize: 15,
                fontWeight: "800",
                textTransform: "uppercase",
              }}
            >
              Habits
            </Text>
            {BINARY_HABITS.map((habit) => {
              const isChecked = selectedRecord.completedHabits.includes(
                habit.id as BinaryHabitId,
              );

              return (
                <Pressable
                  key={habit.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => toggleBinaryHabit(habit.id as BinaryHabitId)}
                  style={({ pressed }) => ({
                    alignItems: "center",
                    backgroundColor: palette.surface,
                    borderColor: palette.surfaceBorder,
                    borderRadius: 8,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: 12,
                    minHeight: 44,
                    opacity: pressed ? 0.72 : 1,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  })}
                >
                  <View pointerEvents="none">
                    <Checkbox
                      color={isChecked ? palette.accent : undefined}
                      value={isChecked}
                    />
                  </View>
                  <Text
                    selectable
                    style={{
                      color: palette.text,
                      flex: 1,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {habit.label}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: palette.mutedText,
                      fontSize: 15,
                      fontVariant: ["tabular-nums"],
                      fontWeight: "800",
                    }}
                  >
                    {habit.points} pt
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function MonthButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: palette.monthButton,
        borderColor: palette.monthButtonBorder,
        borderRadius: 8,
        borderWidth: 1,
        height: 44,
        justifyContent: "center",
        opacity: pressed ? 0.72 : 1,
        width: 44,
      })}
    >
      <Text
        selectable
        style={{ color: palette.calendarText, fontSize: 28, fontWeight: "800" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDay.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      return new Date(year, month, index + 1);
    }),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return Array.from({ length: cells.length / 7 }, (_, weekIndex) => {
    return cells.slice(weekIndex * 7, weekIndex * 7 + 7);
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(date);
}
