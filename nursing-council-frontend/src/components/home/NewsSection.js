import React, { useEffect, useState } from 'react';
import { COLORS, S } from '../../styles/theme';
import { fetchNotices } from '../../services/api';

export function NewsSection() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices()
      .then((res) => setNotices(res.data || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={S.section}>
      <div style={S.sectionTitle}>News &amp; Notices</div>
      <div style={{ height: 3, width: 50, background: COLORS.accent, margin: '8px 0 20px' }} />

      {loading && (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Loading notices…</div>
      )}

      {!loading && notices.length === 0 && (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>No notices available at this time.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {notices.map((notice) => (
          <div
            key={notice.id}
            style={{
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `4px solid ${notice.isTicker ? COLORS.accent : COLORS.primary}`,
              borderRadius: 6,
              padding: '14px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, flex: 1 }}>
                {notice.isTicker && (
                  <span style={{ background: COLORS.accent, color: COLORS.white, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, marginRight: 8, verticalAlign: 'middle' }}>
                    IMPORTANT
                  </span>
                )}
                {notice.title}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
                {new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.6 }}>
              {notice.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
