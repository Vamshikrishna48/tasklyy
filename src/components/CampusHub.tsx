import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, 
  Palette, 
  PenTool, 
  Video, 
  Camera, 
  GraduationCap, 
  Megaphone, 
  Music,
  Sparkles
} from "lucide-react";

interface HubNode {
  id: string;
  label: string;
  icon: any;
  // Position percentage in the container
  x: number;
  y: number;
  // Control point for quadratic bezier curve (relative offset from center to node)
  cxOffset: number;
  cyOffset: number;
  color: string;
}

const hubNodes: HubNode[] = [
  { id: "code", label: "Development", icon: Code, x: 20, y: 20, cxOffset: -10, cyOffset: -5, color: "#0093e2" },
  { id: "design", label: "UI/UX Design", icon: Palette, x: 50, y: 10, cxOffset: 0, cyOffset: -15, color: "#a855f7" },
  { id: "writing", label: "Content Writing", icon: PenTool, x: 80, y: 20, cxOffset: 10, cyOffset: -5, color: "#3b82f6" },
  
  { id: "video", label: "Video Editing", icon: Video, x: 15, y: 50, cxOffset: -15, cyOffset: 0, color: "#ec4899" },
  { id: "photos", label: "Photography", icon: Camera, x: 85, y: 50, cxOffset: 15, cyOffset: 0, color: "#f97316" },
  
  { id: "tutor", label: "Academic Tutoring", icon: GraduationCap, x: 20, y: 80, cxOffset: -10, cyOffset: 5, color: "#14b8a6" },
  { id: "marketing", label: "Marketing & Ads", icon: Megaphone, x: 50, y: 90, cxOffset: 0, cyOffset: 15, color: "#eab308" },
  { id: "music", label: "Audio & Music", icon: Music, x: 80, y: 80, cxOffset: 10, cyOffset: 5, color: "#22c55e" },
];

export default function CampusHub() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-[#070b14] py-20 px-4 border-t border-b border-white/5">
      {/* Background glowing effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-3xl opacity-40 pointer-events-none" />
      </div>

      {/* Subtle tech background grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0093e2 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all font-display px-3.5 py-1 text-xs tracking-wider uppercase">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            The Campus Ecosystem
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            The Student Opportunity Network
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
            A centralized hub connecting diverse campus talents. Hover over any node to see how skills link directly to micro-projects.
          </p>
        </div>

        {/* Graphical Connection Area */}
        <div className="relative w-full max-w-3xl aspect-[4/3] md:aspect-[16/9] mx-auto bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden p-6 flex items-center justify-center shadow-2xl shadow-black/80">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              {hubNodes.map((node) => (
                <linearGradient key={`grad-${node.id}`} id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0093e2" />
                  <stop offset="100%" stopColor={node.color} />
                </linearGradient>
              ))}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {hubNodes.map((node) => {
              // Calculate control points dynamically based on coordinates
              // Center is at 50, 50. Node is at node.x, node.y
              const cx = 50 + node.cxOffset;
              const cy = 50 + node.cyOffset;
              
              const pathData = `M 50 50 Q ${cx} ${cy} ${node.x} ${node.y}`;
              const isHovered = hoveredNode === node.id;

              return (
                <g key={`line-${node.id}`}>
                  {/* Default background path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={2}
                    pathLength="100"
                    style={{ vectorEffect: "non-scaling-stroke" }}
                  />

                  {/* Active highlighted path on hover */}
                  <motion.path
                    d={pathData}
                    fill="none"
                    stroke={`url(#grad-${node.id})`}
                    strokeWidth={isHovered ? 3.5 : 1.5}
                    pathLength="100"
                    initial={{ strokeDasharray: "100 100", strokeDashoffset: 100, opacity: 0 }}
                    animate={{ 
                      strokeDashoffset: isHovered ? 0 : 100,
                      opacity: isHovered ? 1 : 0.08
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut"
                    }}
                    filter={isHovered ? "url(#glow)" : undefined}
                    style={{ vectorEffect: "non-scaling-stroke" }}
                  />
                  
                  {/* Glowing moving dot along line when hovered */}
                  {isHovered && (
                    <motion.path
                      d={pathData}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={3}
                      pathLength="100"
                      strokeDasharray="4 96"
                      animate={{ strokeDashoffset: [100, 0] }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      style={{ vectorEffect: "non-scaling-stroke" }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Central Logo Node */}
          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                scale: hoveredNode ? 1.05 : [1, 1.03, 1],
                boxShadow: hoveredNode 
                  ? `0 0 35px 5px rgba(0, 147, 226, 0.25)` 
                  : "0 0 20px 2px rgba(0, 147, 226, 0.1)"
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-black border-2 border-primary/30 flex items-center justify-center p-3 relative group"
            >
              {/* Internal glow aura */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 via-purple-500/10 to-transparent opacity-50" />
              
              <img
                src="/taskly-logo.png"
                alt="Tasskly Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,147,226,0.3)]"
              />
            </motion.div>
            
            {/* Minimal glowing label below center node */}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-2 font-display">
              Tasskly
            </span>
          </div>

          {/* Surrounding Skill Nodes */}
          {hubNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const Icon = node.icon;

            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <motion.button
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ scale: 1.15 }}
                  animate={{
                    borderColor: isHovered ? node.color : "rgba(255, 255, 255, 0.08)",
                    backgroundColor: isHovered ? "rgba(0, 0, 0, 0.85)" : "rgba(10, 15, 30, 0.7)",
                    boxShadow: isHovered ? `0 0 25px ${node.color}44` : "0 4px 12px rgba(0,0,0,0.4)"
                  }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl border flex items-center justify-center p-3 cursor-pointer transition-all duration-300 relative"
                >
                  {/* Glowing center dot in node (matching user reference screenshot) */}
                  <span 
                    className="absolute w-2 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: node.color,
                      boxShadow: `0 0 10px 2px ${node.color}`,
                      opacity: isHovered ? 1 : 0.8,
                      transform: isHovered ? "scale(1.2)" : "scale(1)"
                    }}
                  />
                  
                  {/* Icon rendered as a background glow on hover */}
                  <Icon 
                    className="w-full h-full transition-all duration-300" 
                    style={{ 
                      color: isHovered ? node.color : "rgba(255,255,255,0.25)",
                      opacity: isHovered ? 0.95 : 0.15,
                      filter: isHovered ? `drop-shadow(0 0 8px ${node.color})` : "none"
                    }}
                  />
                </motion.button>
                
                {/* Node Skill Title */}
                <motion.span
                  animate={{
                    color: isHovered ? "#ffffff" : "rgba(148, 163, 184, 0.4)",
                    textShadow: isHovered ? `0 0 8px ${node.color}aa` : "none"
                  }}
                  className="text-[9px] md:text-[11px] font-semibold text-center select-none tracking-wide"
                >
                  {node.label}
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Inline Badge helper to avoid package imports if needed
function Badge({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
