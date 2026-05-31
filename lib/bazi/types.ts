export type Gender = "male" | "female";
export type BaziFocus = "综合" | "事业" | "财运" | "感情" | "流年";
export type BirthCalendarType = "solar" | "lunar";
export type ZiHourDayChangeRule = "after_23" | "after_00";

export type BaziFormData = {
  question: string;
  profileName?: string;
  birthDate: string;
  birthTime: string;
  gender: Gender;
  birthPlace?: string;
  focus: BaziFocus;
  calendarType: BirthCalendarType;
  isLeapMonth: boolean;
  useTrueSolarTime: boolean;
  ziHourDayChangeRule: ZiHourDayChangeRule;
};

export type Pillar = {
  stem: string;
  branch: string;
  tenGod: string;
  hiddenStems: string[];
  palace: string;
  palaceMeaning: string;
};

export type BaziChartSettings = {
  calendarType: BirthCalendarType;
  calendarTypeLabel: string;
  inputDate: string;
  inputTime: string;
  solarDate: string;
  isLeapMonth: boolean;
  yearRule: string;
  monthRule: string;
  timeStandard: string;
  trueSolarTime: string;
  ziHourDayChangeRule: string;
  library: string;
};

export type BaziChart = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: string;
  tenGods: string[];
  hiddenStems: Record<string, string[]>;
  palaceNotes: Record<string, string>;
  settings: BaziChartSettings;
};

export type BaziReportRecord = BaziFormData & {
  id: string;
  userId: string;
  profileId: string;
  reportType: string;
  reportCode?: string;
  manualUnlockStatus?: "pending_manual_unlock" | "paid" | "sent" | "cancelled";
  module: "bazi";
  pillars: BaziChart;
  report: string;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
};
