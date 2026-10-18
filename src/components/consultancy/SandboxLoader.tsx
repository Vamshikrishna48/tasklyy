import React, { useState, useEffect } from "react";

interface SandboxLoaderProps {
  onComplete: () => void;
}

export const SandboxLoader: React.FC<SandboxLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Check if previously loaded in this session
    const hasLoaded = sessionStorage.getItem("tasskly:consultancy:loaded");
    if (hasLoaded) {
      setIsFinished(true);
      onComplete();
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      // Accelerating progress curve
      const step = Math.max(1, Math.round((100 - current) * 0.15));
      current += step;

      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        sessionStorage.setItem("tasskly:consultancy:loaded", "1");

        setTimeout(() => {
          setIsFinished(true);
          setTimeout(onComplete, 850);
        }, 300);
      } else {
        setProgress(current);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  // 14 orbital dot positions around the center mark
  const dots = [
    { cx: 14, cy: 18.5 }, { cx: 23, cy: 18.5 }, { cx: 32, cy: 18.5 }, { cx: 41, cy: 18.5 }, { cx: 50, cy: 18.5 },
    { cx: 50, cy: 27.5 }, { cx: 50, cy: 36.5 }, { cx: 50, cy: 45.5 },
    { cx: 41, cy: 45.5 }, { cx: 32, cy: 45.5 }, { cx: 23, cy: 45.5 }, { cx: 14, cy: 45.5 },
    { cx: 14, cy: 36.5 }, { cx: 14, cy: 27.5 }
  ];

  const litCount = Math.round((progress / 100) * dots.length);

  return (
    <div className={`sb-loader ${isFinished ? "is-finished" : ""}`} aria-hidden={isFinished}>
      {/* Central SVG Loader Mark */}
      <svg className="sb-loader-mark" viewBox="0 0 64 64">
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r="2.5"
            className={`sb-loader-dot ${i < litCount ? "is-active" : ""}`}
          />
        ))}
        <circle cx="32" cy="32" r="5" className="sb-loader-core" />
      </svg>

      <p className="sb-loader-word">Tasskly · Consultancy</p>
      <p className="sb-loader-count">{progress}</p>
    </div>
  );
};
