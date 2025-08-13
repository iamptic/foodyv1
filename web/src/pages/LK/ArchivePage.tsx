import React, { useEffect, useMemo, useState } from 'react';
import { OrdersAPI } from '../../lib/api';
import OrdersTable from '../../components/OrdersTable';
import Button from '../../components/Button';
import { downloadBlob } from '../../lib/csv';
import { Order, OrderStatus } from '../../types';
import StatusTabs from '../../components/StatusTabs';
import DateRange from '../../components/DateRange';
import Pagination from '../../components/Pagination';
import BulkBar from '../../components/BulkBar';

const PAGE_SIZE = 20;

export default function ArchivePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | 'all'>('done');
  const [dr, setDr] = useState<{from?: string; to?: string}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const query = useMemo(() => ({ status, dateFrom: dr.from, dateTo: dr.to, page, pageSize: PAGE_SIZE }), [status, dr, page]);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.list(query as any);
      setOrders(data.items);
      setTotal(data.total);
      setSelected(new Set());
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить заказы');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status, dr.from, dr.to, page]);

  const onArchive = async (id: string) => {
    try { await OrdersAPI.archive(id); await load(); }
    catch (e: any) { alert(e.message || 'Не удалось отправить в архив'); }
  };

  const onToggle = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const bulkArchive = async () => {
    if (selected.size === 0) return;
    try { await OrdersAPI.bulkArchive(Array.from(selected)); await load(); }
    catch (e: any) { alert(e.message || 'Не удалось архивировать выбранные'); }
  };

  const exportCsv = async () => {
    const resp = await OrdersAPI.csv(query as any);
    if (!resp.ok) { alert((await resp.text()) || 'Ошибка скачивания CSV'); return; }
    const blob = await resp.blob();
    downloadBlob(blob, `orders-${status}-${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <StatusTabs value={status} onChange={v=>{ setPage(1); setStatus(v); }} />
        <DateRange value={dr} onChange={v=>{ setPage(1); setDr(v); }} />
        <Button className="bg-indigo-600 text-white" onClick={exportCsv}>Скачать CSV</Button>
        <Button className="bg-gray-100" onClick={load}>Обновить</Button>
        {loading && <span>Загрузка…</span>}
        {error && <span className="text-red-600">{error}</span>}
      </div>

      <BulkBar count={selected.size} onArchive={bulkArchive} onClear={()=>setSelected(new Set())} />

      <OrdersTable orders={orders} onArchive={onArchive} selected={selected} onToggle={onToggle} />

      <Pagination total={total} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}
