import { Lunar, Solar } from "lunar-typescript";
import type { BaziChart, BaziFormData, Pillar } from "./types";
import { hiddenStemRules } from "./rules/hiddenStems";

const stemElements: Record<string, string> = {
  甲: "woodYang",
  乙: "woodYin",
  丙: "fireYang",
  丁: "fireYin",
  戊: "earthYang",
  己: "earthYin",
  庚: "metalYang",
  辛: "metalYin",
  壬: "waterYang",
  癸: "waterYin"
};

const elementOrder = ["wood", "fire", "earth", "metal", "water"];

const palaceNotes = {
  year: "年柱看祖上、早年环境与外部资源，是命局的根基背景。",
  month: "月柱看事业土壤、社会位置与中年发力点，是格局成败的关键。",
  day: "日柱看自我、伴侣关系与内在选择，是命局的核心位置。",
  hour: "时柱看晚年、子女、长期成果与理想落点，是人生后势的延展。"
};

function splitStem(stem: string) {
  const code = stemElements[stem];
  if (!code) return { element: "wood", polarity: "Yang" };
  return {
    element: code.replace("Yang", "").replace("Yin", ""),
    polarity: code.endsWith("Yang") ? "Yang" : "Yin"
  };
}

function relation(dayStem: string, otherStem: string) {
  const day = splitStem(dayStem);
  const other = splitStem(otherStem);
  const samePolarity = day.polarity === other.polarity;

  if (day.element === other.element) return samePolarity ? "比肩" : "劫财";

  const dayIndex = elementOrder.indexOf(day.element);
  const otherIndex = elementOrder.indexOf(other.element);
  const producedByDay = elementOrder[(dayIndex + 1) % 5];
  const producesDay = elementOrder[(dayIndex + 4) % 5];
  const controlledByDay = elementOrder[(dayIndex + 2) % 5];
  const controlsDay = elementOrder[(dayIndex + 3) % 5];

  if (other.element === producedByDay) return samePolarity ? "食神" : "伤官";
  if (other.element === controlledByDay) return samePolarity ? "偏财" : "正财";
  if (other.element === controlsDay) return samePolarity ? "七杀" : "正官";
  if (other.element === producesDay) return samePolarity ? "偏印" : "正印";

  return "比肩";
}

function makePillar(ganzhi: string, palace: keyof typeof palaceNotes, dayStem: string): Pillar {
  const stem = ganzhi.slice(0, 1);
  const branch = ganzhi.slice(1, 2);

  return {
    stem,
    branch,
    tenGod: relation(dayStem, stem),
    hiddenStems: hiddenStemRules[branch] || [],
    palace,
    palaceMeaning: palaceNotes[palace]
  };
}

function parseInputDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function parseInputTime(time: string) {
  const [hour = 12, minute = 0] = time.split(":").map(Number);
  return { hour, minute };
}

function getSolar(form: BaziFormData) {
  const { year, month, day } = parseInputDate(form.birthDate);
  const { hour, minute } = parseInputTime(form.birthTime || "12:00");

  if (form.calendarType === "lunar") {
    const lunarMonth = form.isLeapMonth ? -month : month;
    return Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, 0).getSolar();
  }

  return Solar.fromYmdHms(year, month, day, hour, minute, 0);
}

export function calculateBazi(form: BaziFormData): BaziChart {
  const solar = getSolar(form);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // sect=1: 23:00后按次日排日柱；sect=2: 23:00后仍按当日排日柱。
  eightChar.setSect(form.ziHourDayChangeRule === "after_23" ? 1 : 2);

  const dayStem = eightChar.getDay().slice(0, 1);
  const chart = {
    year: makePillar(eightChar.getYear(), "year", dayStem),
    month: makePillar(eightChar.getMonth(), "month", dayStem),
    day: makePillar(eightChar.getDay(), "day", dayStem),
    hour: makePillar(eightChar.getTime(), "hour", dayStem)
  };

  return {
    ...chart,
    dayMaster: dayStem,
    tenGods: [chart.year.tenGod, chart.month.tenGod, chart.day.tenGod, chart.hour.tenGod],
    hiddenStems: {
      年支: chart.year.hiddenStems,
      月支: chart.month.hiddenStems,
      日支: chart.day.hiddenStems,
      时支: chart.hour.hiddenStems
    },
    palaceNotes,
    settings: {
      calendarType: form.calendarType,
      calendarTypeLabel: form.calendarType === "lunar" ? "农历/阴历" : "公历/阳历",
      inputDate: form.birthDate,
      inputTime: form.birthTime,
      solarDate: solar.toYmdHms(),
      isLeapMonth: form.isLeapMonth,
      yearRule: "立春换年",
      monthRule: "节气换月",
      timeStandard: "北京时间",
      trueSolarTime: form.useTrueSolarTime ? "已选择，当前版本仅预留，未做经度校正" : "未校正真太阳时",
      ziHourDayChangeRule: form.ziHourDayChangeRule === "after_23" ? "23点后换日" : "0点后换日",
      library: "lunar-typescript"
    }
  };
}
