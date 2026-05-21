import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PageLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 12;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fce8e8]">
      {/* Decorative floating dots */}
      <div className="absolute top-[12%] right-[10%] w-10 h-10 rounded-full border border-rose-200 opacity-60" />
      <div className="absolute top-[20%] left-[8%] w-3 h-3 rounded-full bg-rose-300 opacity-50" />
      <div className="absolute bottom-[30%] right-[18%] w-2 h-2 rounded-full bg-rose-400 opacity-40" />
      <div className="absolute bottom-[20%] left-[12%] w-8 h-8 rounded-full border border-rose-200 opacity-50" />
      <div className="absolute top-[45%] left-[5%] w-2 h-2 rounded-full bg-rose-300 opacity-60" />
      <div className="absolute top-[35%] right-[5%] w-2 h-2 rounded-full bg-rose-300 opacity-40" />

      {/* Center card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo pill / card */}
        <div className="relative flex flex-col items-center justify-center px-6">
          {/* Outer pill border */}
          <div className="absolute inset-0 rounded-[4rem] border border-rose-200 w-80 h-40 -translate-x-1/2 left-1/2" />

          {/* White circle with logo and Brand name inline */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-row items-center justify-center gap-4 mt-8 mb-8 z-10"
          >
            <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center">
              <img
                src="/taskly-logo.png"
                alt="Tasklyy logo"
                className="w-36 h-36 object-contain"
              />
            </div>
            <span className="font-display text-2xl font-black text-gray-700">
              Tasklyy
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="w-64 flex flex-col items-center gap-2">
          <div className="w-full h-1 bg-rose-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-rose-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 85)}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-rose-400 tracking-wide">
            Loading your tasks...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PageLoader;
