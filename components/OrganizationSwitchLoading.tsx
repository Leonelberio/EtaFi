"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";

interface OrganizationSwitchLoadingProps {
  fromOrgName: string;
  toOrgName: string;
  isVisible: boolean;
}

export function OrganizationSwitchLoading({
  fromOrgName,
  toOrgName,
  isVisible,
}: OrganizationSwitchLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const steps = [
      { delay: 0, text: "Saving organization preference..." },
      { delay: 800, text: "Updating data context..." },
      { delay: 1600, text: "Refreshing projects..." },
      { delay: 2400, text: "Finalizing switch..." },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, step.delay);
    });

    // Complete after all steps
    setTimeout(() => {
      setCurrentStep(steps.length);
    }, 3200);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center"
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main Animation Container */}
        <div className="relative mb-8">
          {/* Organization Icons */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            {/* From Organization */}
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ 
                scale: currentStep >= 1 ? 0.8 : 1,
                opacity: currentStep >= 1 ? 0.6 : 1
              }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 max-w-24 truncate">
                {fromOrgName}
              </p>
            </motion.div>

            {/* Arrow Animation */}
            <motion.div
              initial={{ x: 0, opacity: 0.3 }}
              animate={{ 
                x: currentStep >= 2 ? [0, 10, 0] : 0,
                opacity: currentStep >= 1 ? 1 : 0.3
              }}
              transition={{ 
                x: { repeat: currentStep >= 2 ? Infinity : 0, duration: 1.5 },
                opacity: { duration: 0.3 }
              }}
            >
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </motion.div>

            {/* To Organization */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ 
                scale: currentStep >= 2 ? 1 : 0.8,
                opacity: currentStep >= 2 ? 1 : 0.6
              }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 max-w-24 truncate">
                {toOrgName}
              </p>
            </motion.div>
          </div>

          {/* Progress Ring */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="text-indigo-500"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: currentStep / 4,
                  strokeDasharray: "314.159",
                  strokeDashoffset: "314.159"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>
            
            {/* Center Check Icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: currentStep >= 4 ? 1 : 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
          </div>
        </div>

        {/* Loading Text */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep >= 4 ? "Switch Complete!" : "Switching Organization"}
          </h2>
          <p className="text-gray-600">
            {currentStep >= 4 
              ? "Redirecting to your new workspace..." 
              : currentStep < 4 
                ? [
                    "Saving organization preference...",
                    "Updating data context...", 
                    "Refreshing projects...",
                    "Finalizing switch..."
                  ][currentStep] || "Preparing switch..."
                : "Redirecting..."
            }
          </p>
        </motion.div>

        {/* Loading Dots */}
        {currentStep < 4 && (
          <motion.div 
            className="flex justify-center space-x-1 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
