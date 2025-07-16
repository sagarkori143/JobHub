import React from "react";
import { Loader2 } from "lucide-react";

interface Step {
  key: string;
  label: string;
}

interface ResumeStepperLoaderProps {
  step: string | null;
  steps: Step[];
}

export const ResumeStepperLoader: React.FC<ResumeStepperLoaderProps> = ({ step, steps }) => {
  const currentStepIdx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex flex-col items-center w-full mb-2 max-w-lg md:max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-8 md:gap-16 mb-1 w-full">
        {steps.map((stepObj, idx) => (
          <React.Fragment key={stepObj.key}>
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full flex items-center justify-center border transition-all duration-200
                  ${idx < currentStepIdx ? 'bg-green-500 border-green-500 text-white' :
                    idx === currentStepIdx ? 'bg-blue-600 border-blue-600 text-white animate-pulse' :
                    'bg-gray-200 border-gray-300 text-gray-400'}
                  w-5 h-5 md:w-7 md:h-7 text-xs md:text-base`}
              >
                {idx < currentStepIdx ? (
                  <span className="font-bold">✓</span>
                ) : idx === currentStepIdx ? (
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`mt-0.5 text-[10px] md:text-xs font-medium ${idx === currentStepIdx ? 'text-blue-700' : 'text-gray-500'}`}>{stepObj.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 md:h-1 ${idx < currentStepIdx ? 'bg-green-500' : 'bg-gray-300'} transition-all duration-200 flex-grow`} style={{ minWidth: 32, maxWidth: 120 }}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <span className="text-xs md:text-sm font-medium text-blue-700 mb-1">{steps[currentStepIdx]?.label || ''}</span>
    </div>
  );
}; 