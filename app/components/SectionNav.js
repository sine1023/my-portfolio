"use client";

import { useEffect, useState } from "react";

export default function SectionNav({ items }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const elements = items
      .map((n) => document.getElementById(n.id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // 화면 위쪽에 가장 가까운(가장 먼저 걸린) 섹션을 현재 섹션으로 취급
          const topMost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(topMost.target.id);
        }
      },
      {
        // 상단 고정 내비게이션 높이만큼 빼고, 화면 위쪽 30% 지점을 기준선으로 삼음
        rootMargin: "-56px 0px -70% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="section-nav">
      <div className="wrap section-nav-inner">
        {items.map((n) => (
          <a
            key={n.id}
            href={`#${n.id}`}
            className={n.id === activeId ? "active" : ""}
          >
            {n.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
