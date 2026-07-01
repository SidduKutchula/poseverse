import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TypewriterText = ({ text, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    
    // Safety check
    if (!text) return;

    const interval = setInterval(() => {
      setDisplayedText((prev) => text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 25); // 25ms per character

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-1.5 h-4 ml-0.5 bg-primary align-middle"
      />
    </span>
  );
};

export default TypewriterText;
