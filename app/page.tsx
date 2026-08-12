import type { Metadata } from "next";
import { PortfolioApp } from "./portfolio-app";

export const metadata: Metadata = {
  title: "隨飛｜一個人先找，或一群人一起決定",
  description:
    "先找自己的便宜旅行靈感，或先成團、私填條件、找出全員可行交集；每個答案都在點擊前重新驗價。",
};

export default function Home() {
  return <PortfolioApp />;
}
