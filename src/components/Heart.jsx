import React from 'react';

export default function Heart({ size = 48, color = '#ff6b81', className = '' }) {
  const s = size;
  return (
    <svg
      className={className}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="heart"
    >
      <path d="M12 21s-6.716-4.634-9.428-7.346C.86 11.942.5 10.59.5 9.5.5 6.738 2.738 4.5 5.5 4.5c1.54 0 3.04.73 4 1.88 0 0 .24.28.5.62.26-.34.5-.62.5-.62.96-1.15 2.46-1.88 4-1.88 2.762 0 5 2.238 5 5 0 1.09-.36 2.442-2.072 4.154C18.716 16.366 12 21 12 21z" />
    </svg>
  );
}