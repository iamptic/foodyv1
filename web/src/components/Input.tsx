import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string };

export const Input = React.forwardRef<HTMLInputElement, Props>(({ label, hint, ...rest }, ref) => (
  <label className="block mb-3">
    {label && <div className="mb-1 text-sm text-gray-700">{label}</div>}
    <input ref={ref} className="w-full rounded-xl border px-3 py-2 outline-none focus:ring" {...rest} />
    {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
  </label>
));
