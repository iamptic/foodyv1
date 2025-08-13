import React from 'react';
import { OrderStatus } from '../types';

const statuses: (OrderStatus | 'all')[] = ['all','new','in_progress','done','archived','canceled'];

export default function StatusTabs({ value, onChange }:{ value: OrderStatus | 'all'; onChange: (v: OrderStatus | 'all')=>void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map(s => (
        <button
          key={s}
          onClick={()=>onChange(s)}
          className={`px-3 py-1 rounded-full border ${value===s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
