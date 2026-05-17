import React from 'react';
import Ticker from '../components/home/Ticker';
import HeroSection from '../components/home/HeroSection';
import QuickCards from '../components/home/QuickCards';
import WelcomeSection from '../components/home/WelcomeSection';
import { NewsSection } from '../components/home/NewsSection';
import InfoCards from '../components/home/InfoCards';
import { COLORS, S } from '../styles/theme';

export default function HomePage({ setPage }) {
  const news = [
    "Notice: Online registration portal now open for 2026 batch — apply before 30 June 2026.",
    "Notification: Renewal deadline extended to 31 August 2026 for 2023–2024 license holders.",
    "Circular: Mandatory refresher course for GNM nurses — details updated on council portal.",
    "Alert: Verification of certificates is now fully online — no physical visit required.",
  ];

  return (
    <div>
      <Ticker news={news} />
      <HeroSection setPage={setPage} />
      <QuickCards setPage={setPage} />
      <div style={{ background: COLORS.white }}>
        <div style={{ ...S.section, display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
          <WelcomeSection />
          <NewsSection news={news} />
        </div>
      </div>
      <InfoCards />
    </div>
  );
}