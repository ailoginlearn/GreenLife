import React from 'react';
import { isFirebaseEnabled } from '../lib/firebase';
import { ShieldCheck, Info } from 'lucide-react';

const MockNotice: React.FC = () => {
  return (
    <div className="bg-emerald-50 border-b border-emerald-150 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-emerald-800 gap-2 font-medium">
        <div className="flex items-center gap-2">
          {isFirebaseEnabled ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600 animate-pulse" />
          ) : (
            <Info className="h-4 w-4 text-amber-500" />
          )}
          <span>
            {isFirebaseEnabled ? (
              <span className="text-emerald-700">
                <strong>Fortress Mode Engaged:</strong> Connected to live Firestore Cloud Database & Auth Shield.
              </span>
            ) : (
              <span>
                <strong>Demonstration Sandbox Active:</strong> Simulating Database & Session storage locally in-browser. 
              </span>
            )}
          </span>
        </div>
        {!isFirebaseEnabled && (
          <span className="text-xs text-emerald-600 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded transition-all cursor-pointer select-none">
            Accept Firestore terms in setup UI to activate live cloud.
          </span>
        )}
      </div>
    </div>
  );
};

export default MockNotice;
