import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-primary text-white",
  };

  const icons = {
    success: <CheckCircle size={18} className="shrink-0" />,
    error: <AlertCircle size={18} className="shrink-0" />,
    info: <Info size={18} className="shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-center justify-between p-4 rounded-sm shadow-md ${bgColors[type]} max-w-sm w-full`}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
