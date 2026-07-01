import React from "react";

const StepGuide = ({ steps }) => {
  if (!steps || !Array.isArray(steps)) return null;

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 items-start">
          {/* Step Number Circle */}
          <div className="w-8 h-8 rounded-full bg-primaryLight text-primary font-serif flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-primary/20">
            {index + 1}
          </div>
          {/* Step Content */}
          <div>
            <h4 className="font-sans font-semibold text-textPrimary text-sm">
              {step.label || `Step ${index + 1}`}
            </h4>
            <p className="font-sans text-sm text-textSecondary mt-0.5 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepGuide;
