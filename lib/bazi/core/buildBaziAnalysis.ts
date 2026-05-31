import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { generateAnnualHighlights } from "@/lib/bazi/rules/annualHighlights";
import { generateLuckCycles } from "@/lib/bazi/rules/luckCycles";
import { generateProfessionalView } from "@/lib/bazi/rules/professionalView";
import { generateRelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziChart, BaziFocus, BaziFormData } from "@/lib/bazi/types";
import { buildEnReportSections } from "@/lib/bazi/reportTemplates/en";
import { buildZhReportSections, type BaziReportSections } from "@/lib/bazi/reportTemplates/zh";

export type BaziAnalysisLocale = "zh" | "en";

export type BaziAnalysis = {
  birthInfo: BaziFormData;
  focus: BaziFocus;
  locale: BaziAnalysisLocale;
  pillars: BaziChart;
  dayMaster: string;
  tenGods: string[];
  hiddenStems: BaziChart["hiddenStems"];
  annualHighlights: ReturnType<typeof generateAnnualHighlights>;
  relationshipProfile: ReturnType<typeof generateRelationshipProfile>;
  luckCycles: ReturnType<typeof generateLuckCycles>;
  professionalView: string;
  reportSections: BaziReportSections;
};

export function buildBaziAnalysis(input: {
  birthInfo: BaziFormData;
  focus?: BaziFocus;
  locale: BaziAnalysisLocale;
  pillars?: BaziChart;
}): BaziAnalysis {
  const focus = input.focus || input.birthInfo.focus;
  const birthInfo = { ...input.birthInfo, focus };
  const pillars = input.pillars || calculateBazi(birthInfo);
  const annualHighlights = generateAnnualHighlights({ birthInfo, focus, pillars });
  const relationshipProfile = generateRelationshipProfile({ form: birthInfo, pillars, annualHighlights });
  const luckCycles = generateLuckCycles({ form: birthInfo, pillars, count: 6 });
  const professionalView = generateProfessionalView({ form: birthInfo, pillars });
  const templateInput = {
    birthInfo,
    focus,
    pillars,
    annualHighlights,
    relationshipProfile,
    luckCycles,
    professionalView
  };

  return {
    birthInfo,
    focus,
    locale: input.locale,
    pillars,
    dayMaster: pillars.dayMaster,
    tenGods: pillars.tenGods,
    hiddenStems: pillars.hiddenStems,
    annualHighlights,
    relationshipProfile,
    luckCycles,
    professionalView,
    reportSections: input.locale === "en" ? buildEnReportSections(templateInput) : buildZhReportSections(templateInput)
  };
}
