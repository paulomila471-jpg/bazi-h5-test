import type { AnnualHighlight } from "@/lib/bazi/rules/annualHighlights";
import type { LuckCycle } from "@/lib/bazi/rules/luckCycles";
import type { RelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziChart, BaziFocus, BaziFormData } from "@/lib/bazi/types";
import {
  baziFocusToEnglish,
  createEnglishOverview,
  createEnglishRelationshipSummary,
  translateAnnualHighlight,
  translateLuckCycle
} from "@/lib/bazi/english";
import type { BaziReportSections } from "./zh";

export function buildEnReportSections(input: {
  birthInfo: BaziFormData;
  focus: BaziFocus;
  pillars: BaziChart;
  annualHighlights: AnnualHighlight[];
  relationshipProfile: RelationshipProfile;
  luckCycles: LuckCycle[];
  professionalView: string;
}): BaziReportSections {
  const { focus, pillars, annualHighlights, relationshipProfile, luckCycles } = input;
  const overview = createEnglishOverview(pillars, focus);
  const years = annualHighlights.map(translateAnnualHighlight);
  const cycles = luckCycles.map(translateLuckCycle);
  const relation = createEnglishRelationshipSummary(relationshipProfile);
  const wealthYear = years.find((item) => item.tag.includes("Wealth")) || years[0];

  return [
    {
      title: "Core Life Pattern",
      content: `${overview.title} ${overview.pattern} This suggests your life pattern works best when you understand timing instead of forcing every outcome. The main focus here is ${baziFocusToEnglish[focus]}.`
    },
    {
      title: "Personality & Inner Drive",
      content: `You may find that your inner drive is shaped by ${overview.keywords.join(", ")}. In practical terms, this means your choices improve when you balance instinct with structure and steady follow-through.`
    },
    {
      title: "Career Direction",
      content: cycles[0]?.career || "This suggests career growth should be built through visible skills, clearer positioning, and practical consistency."
    },
    {
      title: "Wealth Timing",
      content: wealthYear
        ? `${wealthYear.year} is highlighted as ${wealthYear.tag}. A practical way to use this period is to review pricing, collaboration terms, spending habits, and how your skills turn into income.`
        : "Wealth timing is best used as a planning tool. Be careful with impulsive financial decisions and unclear agreements."
    },
    {
      title: "Love & Relationship Pattern",
      content: `Your Peach Blossom / romantic attraction score is ${relationshipProfile.peachBlossomScore}. This suggests ${relation.peachType}. Be careful with unclear boundaries and confusing chemistry with long-term compatibility.`
    },
    {
      title: "Key Years Ahead",
      content: years.map((item) => `${item.year}: ${item.tag}. ${item.description}`).join(" ")
    },
    {
      title: "10-Year Luck Cycles",
      content: cycles.slice(0, 3).map((item) => `${item.ageRange}: ${item.tag}, ${item.tenGod}. ${item.career}`).join(" ")
    },
    {
      title: "Best Partner Type",
      content: `You may work best with someone who is ${relation.suitablePartners.join(", ")}. You may want to be careful with people who are ${relation.unsuitablePartners.join(", ")}.`
    },
    {
      title: "Practical Advice",
      content: "This BaZi / Chinese Birth Chart reading is for cultural reflection and personal reference. Use it to improve timing, self-awareness, and decision quality, not as medical, legal, investment, or marriage advice."
    }
  ];
}
