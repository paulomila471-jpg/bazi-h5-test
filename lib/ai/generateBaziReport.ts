import type { BaziChart, BaziFormData } from "@/lib/bazi/types";
import { createBaziReportPrompt, createMockBaziReport } from "@/lib/bazi/reportPrompt";
import { generateAnnualHighlights } from "@/lib/bazi/rules/annualHighlights";
import { aiDisclosureText, complianceDisclaimer } from "@/lib/compliance/config";
import { buildSafetyPromptInstruction, sanitizeGeneratedText } from "@/lib/compliance/contentFilter";

export async function generateBaziReport(form: BaziFormData, chart: BaziChart) {
  const annualHighlights = generateAnnualHighlights({
    birthInfo: form,
    focus: form.focus,
    pillars: chart
  });
  const prompt = [
    createBaziReportPrompt(form, chart, annualHighlights),
    buildSafetyPromptInstruction()
  ].join("\n\n");

  // Future integration point for DeepSeek/OpenAI server-side API routes.
  // The MVP returns a deterministic local report so the full flow works offline.
  const rawReport = [
    aiDisclosureText,
    createMockBaziReport(form, chart, annualHighlights),
    complianceDisclaimer
  ].join("\n\n");
  const filtered = sanitizeGeneratedText(rawReport);

  return {
    prompt,
    report: filtered.text,
    filterHits: filtered.hits
  };
}
