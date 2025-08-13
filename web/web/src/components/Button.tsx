import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export default function Button({ children, loading, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`rounded-xl px-4 py-2 shadow ${rest.className || ''} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? '…' : children}
    </button>
  );
}
