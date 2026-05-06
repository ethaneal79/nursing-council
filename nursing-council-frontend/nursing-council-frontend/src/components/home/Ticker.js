import React, { useState, useEffect } from 'react';
import { COLORS, S } from '../../styles/theme';

export default function Ticker({ news }) {
  const [tickerIdx, setTickerIdx] = useState(0);
  
  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % news.length), 4000);
    return () => clearInterval(t);
  }, [news.length]);

  return (
    <div style={S.ticker}>
      <span style={{ background: COLORS.primaryDark, color: COLORS.white, padding: "2px 10px", borderRadius: 2, fontSize: 11, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>
        NOTICE
      </span>
      <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {news[tickerIdx]}
      </span>
    </div>
  );
}