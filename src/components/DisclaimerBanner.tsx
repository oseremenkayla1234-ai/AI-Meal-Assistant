import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside
      id="wellness-disclaimer-banner"
      aria-label="Wellness and medical disclaimer"
      className="bg-amber-50/95 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center font-medium">
        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
        <span>
          <strong>General Wellness Notice:</strong> AI Meal Assistant offers general wellness suggestions, not medical advice. Consult a healthcare professional for clinical dietary needs.
        </span>
      </div>
    </aside>
  );
};
