import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword } from '../../lib/passwordValidation';

interface PasswordRequirementsDisplayProps {
  password: string;
  showAlways?: boolean;
}

export const PasswordRequirementsDisplay: React.FC<PasswordRequirementsDisplayProps> = ({
  password,
  showAlways = true,
}) => {
  if (!showAlways && !password) return null;

  const { requirements } = validatePassword(password);

  return (
    <div className="mt-2 p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-left">
      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
        Password requirements
      </p>
      <ul className="space-y-1.5">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
              req.met ? 'text-emerald-700 font-medium' : 'text-slate-500'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] transition-colors ${
                req.met
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {req.met ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
            </span>
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
