import React from 'react';

export default function DateRange({ value, onChange }:{ value:{from?: string; to?: string}; onChange:(v:{from?:string; to?:string})=>void }){
  return (
    <div className="flex items-center gap-2">
      <input type="date" value={value.from || ''} onChange={e=>onChange({ ...value, from: e.target.value })} className="rounded-xl border px-3 py-2" />
      <span>—</span>
      <input type="date" value={value.to || ''} onChange={e=>onChange({ ...value, to: e.target.value })} className="rounded-xl border px-3 py-2" />
    </div>
  );
}
