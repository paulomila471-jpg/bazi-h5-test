import type { Metadata } from "next";
import { EnglishHomeClient } from "./EnglishHomeClient";

export const metadata: Metadata = {
  title: "Eastern Destiny & Divination Reading",
  description: "Early-access Eastern divination and BaZi destiny readings for overseas users."
};

export default function EnglishHomePage() {
  return <EnglishHomeClient />;
}
