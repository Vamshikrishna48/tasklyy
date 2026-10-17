import React, { useState, useRef } from "react";

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  glare?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = "",
  depth = 18,
  glare = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    setRotX(rotateX);
    setRotY(rotateY);

    if (glare) {
      setGlarePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.22,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      className={`relative ${className}`}
      {...props}
    >
      <div
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="w-full h-full relative rounded-2xl will-change-transform"
      >
        {children}

        {/* Dynamic Specular Glare Reflection */}
        {glare && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  );
};
