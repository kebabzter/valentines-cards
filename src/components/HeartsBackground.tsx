"use client";

const HEARTS = [
  { top: "8%", left: "6%", size: 16, opacity: 0.18 },
  { top: "14%", left: "26%", size: 18, opacity: 0.17 },
  { top: "10%", left: "48%", size: 20, opacity: 0.18 },
  { top: "16%", left: "70%", size: 18, opacity: 0.17 },
  { top: "9%", left: "86%", size: 16, opacity: 0.16 },

  { top: "26%", left: "12%", size: 18, opacity: 0.16 },
  { top: "24%", left: "38%", size: 20, opacity: 0.18 },
  { top: "22%", left: "60%", size: 18, opacity: 0.16 },
  { top: "28%", left: "82%", size: 18, opacity: 0.15 },

  { top: "40%", left: "8%", size: 20, opacity: 0.17 },
  { top: "38%", left: "30%", size: 18, opacity: 0.16 },
  { top: "42%", left: "52%", size: 22, opacity: 0.18 },
  { top: "36%", left: "74%", size: 18, opacity: 0.16 },
  { top: "44%", left: "90%", size: 18, opacity: 0.15 },

  { top: "56%", left: "14%", size: 18, opacity: 0.16 },
  { top: "52%", left: "36%", size: 20, opacity: 0.18 },
  { top: "58%", left: "58%", size: 18, opacity: 0.17 },
  { top: "54%", left: "80%", size: 20, opacity: 0.17 },

  { top: "70%", left: "6%", size: 18, opacity: 0.16 },
  { top: "68%", left: "28%", size: 20, opacity: 0.18 },
  { top: "72%", left: "50%", size: 18, opacity: 0.17 },
  { top: "66%", left: "72%", size: 18, opacity: 0.16 },
  { top: "74%", left: "88%", size: 18, opacity: 0.15 },

  { top: "84%", left: "18%", size: 18, opacity: 0.17 },
  { top: "88%", left: "42%", size: 20, opacity: 0.18 },
  { top: "82%", left: "64%", size: 18, opacity: 0.16 },
  { top: "86%", left: "82%", size: 20, opacity: 0.17 },
];

export function HeartsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 text-pink-400">
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            top: heart.top,
            left: heart.left,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            fontWeight: 700,
          }}
        >
          {"<3"}
        </span>
      ))}
    </div>
  );
}

