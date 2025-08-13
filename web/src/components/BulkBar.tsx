import React from 'react';
import Button from './Button';

export default function BulkBar({ count, onArchive, onClear }:{ count:number; onArchive:()=>void; onClear:()=>void }){
  if (!count) return null;
  return (
    <div className="flex items-center justify-between p-2 rounded-xl border bg-gray-50">
      <div>Выбрано: <b>{count}</b></div>
      <div className="flex gap-2">
        <Button className="bg-gray-200" onClick={onClear}>Снять выделение</Button>
        <Button className="bg-indigo-600 text-white" onClick={onArchive}>Архивировать выбранные</Button>
      </div>
    </div>
  );
}
