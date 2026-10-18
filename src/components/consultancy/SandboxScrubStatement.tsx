import React, { useRef, useEffect, useState } from "react";

interface SandboxScrubStatementProps {
  label?: string;
  statement?: string;
}

export const SandboxScrubStatement: React.FC<SandboxScrubStatementProps> = ({
  label = "The Mentorship Standard",
  statement = "Every student deserves direct access to someone who has already walked the path. No middlemen. No obsolete hearsay. Just real, verified 1-on-1 guidance from top seniors, alumni, and working engineers.",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  const words = statement.split(" ");

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start highlighting when top of element reaches 85% of viewport
      // Complete highlighting when bottom reaches 35% of viewport
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.35;

      const current = rect.top;
      const clamped = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setProgress(clamped);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="sb-statement-section">
      <p className="sb-statement-label">{label}</p>
      <h3 className="sb-statement-text">
        {words.map((word, i) => {
          const wordThreshold = i / (words.length - 1 || 1);
          const isLit = progress >= wordThreshold;
          return (
            <span
              key={i}
              className={`sb-word ${isLit ? "is-active" : "is-muted"}`}
            >
              {word}
            </span>
          );
        })}
      </h3>
    </section>
  );
};
