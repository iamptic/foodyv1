import React from 'react';
import { Input } from './Input';

export default function AddressForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Input label="Город" value={value.city || ''} onChange={e => onChange({ ...value, city: e.target.value })} />
      <Input label="Адрес" value={value.address || ''} onChange={e => onChange({ ...value, address: e.target.value })} />
      <Input label="Широта" value={value.lat || ''} onChange={e => onChange({ ...value, lat: e.target.value })} />
      <Input label="Долгота" value={value.lng || ''} onChange={e => onChange({ ...value, lng: e.target.value })} />
    </div>
  );
}
