import React from 'react';
import Button from './Button';
import { Order } from '../types';

export default function OrdersTable({ orders, onArchive, selected, onToggle }:
  { orders: Order[]; onArchive: (id: string) => void; selected: Set<string>; onToggle: (id: string) => void }) {
  const allSelected = orders.length > 0 && orders.every(o => selected.has(o.id));
  const toggleAll = () => {
    const all = allSelected;
    orders.forEach(o => {
      const has = selected.has(o.id);
      if (all && has) onToggle(o.id);
      if (!all && !has) onToggle(o.id);
    });
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full border rounded-xl">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
            <th className="p-2 text-left">№</th>
            <th className="p-2 text-left">Статус</th>
            <th className="p-2 text-left">Сумма</th>
            <th className="p-2 text-left">Создан</th>
            <th className="p-2"/>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-t">
              <td className="p-2"><input type="checkbox" checked={selected.has(o.id)} onChange={() => onToggle(o.id)} /></td>
              <td className="p-2">{o.number}</td>
              <td className="p-2">{o.status}</td>
              <td className="p-2">{o.total.toFixed(2)}</td>
              <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
              <td className="p-2 text-right">
                {o.status !== 'archived' && (
                  <Button className="bg-gray-200" onClick={() => onArchive(o.id)}>В архив</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
