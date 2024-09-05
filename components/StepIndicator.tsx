// StepIndicator.tsx
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
            {index + 1}
          </div>
          <span className={`ml-2 ${index <= currentStep ? 'text-blue-500' : 'text-gray-500'}`}>{step}</span>
          {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mx-4"></div>}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
