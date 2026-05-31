import assert from "node:assert/strict";
import { calculateBazi } from "../lib/bazi/calculateBazi.ts";
import type { BaziFormData } from "../lib/bazi/types.ts";

function form(input: Partial<BaziFormData>): BaziFormData {
  return {
    question: "测试",
    birthDate: "2026-02-04",
    birthTime: "12:00",
    gender: "female",
    birthPlace: "",
    focus: "综合",
    calendarType: "solar",
    isLeapMonth: false,
    useTrueSolarTime: false,
    ziHourDayChangeRule: "after_23",
    ...input
  };
}

function pillars(input: Partial<BaziFormData>) {
  const chart = calculateBazi(form(input));
  return [
    `${chart.year.stem}${chart.year.branch}`,
    `${chart.month.stem}${chart.month.branch}`,
    `${chart.day.stem}${chart.day.branch}`,
    `${chart.hour.stem}${chart.hour.branch}`
  ];
}

const cases = [
  {
    name: "立春前仍按上一年、节气丑月",
    input: { birthDate: "2026-02-03", birthTime: "22:30" },
    expected: ["乙巳", "己丑", "戊申", "癸亥"]
  },
  {
    name: "立春后切换丙午年、寅月",
    input: { birthDate: "2026-02-04", birthTime: "12:00" },
    expected: ["丙午", "庚寅", "己酉", "庚午"]
  },
  {
    name: "春节日期不决定年柱，使用立春后甲辰年",
    input: { birthDate: "2024-02-10", birthTime: "12:00" },
    expected: ["甲辰", "丙寅", "甲辰", "庚午"]
  },
  {
    name: "公历 1990-01-27 按立春前己巳年",
    input: { birthDate: "1990-01-27", birthTime: "08:30" },
    expected: ["己巳", "丁丑", "壬辰", "甲辰"]
  },
  {
    name: "农历 2024 正月初一换算后排盘",
    input: {
      calendarType: "lunar",
      birthDate: "2024-01-01",
      birthTime: "12:00"
    },
    expected: ["甲辰", "丙寅", "甲辰", "庚午"]
  }
] as const;

for (const item of cases) {
  assert.deepEqual(pillars(item.input), item.expected, item.name);
}

const lateZi = pillars({ birthDate: "1988-02-03", birthTime: "23:30", ziHourDayChangeRule: "after_23" });
assert.deepEqual(lateZi, ["丁卯", "癸丑", "己丑", "甲子"], "23点后换日规则应影响日柱和时柱");

const first = pillars({ birthDate: "1990-01-01", birthTime: "08:30" }).join(" ");
const second = pillars({ birthDate: "1995-06-15", birthTime: "08:30" }).join(" ");
assert.notEqual(first, second, "不同出生日期应生成不同四柱");

console.log("bazi calendar tests passed");
