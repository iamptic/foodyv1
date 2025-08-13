import React from 'react';

export default function Pagination({ total, page, pageSize, onChange }:{ total:number; page:number; pageSize:number; onChange:(p:number)=>void }){
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const prev = () => onChange(Math.max(1, page-1));
  const next = () => onChange(Math.min(pages, page+1));
  return (
    <div className="flex items-center gap-2 justify-end">
      <button className="px-3 py-1 rounded border" onClick={prev} disabled={page<=1}>Назад</button>
      <span className="text-sm">{page} / {pages}</span>
      <button className="px-3 py-1 rounded border" onClick={next} disabled={page>=pages}>Вперёд</button>
    </div>
  );
}
