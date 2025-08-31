import React from 'react';

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="#ffffff" />
      <path d="M24 10c5 0 9 4 9 9 0 7-9 15-9 15s-9-8-9-15c0-5 4-9 9-9z" fill="#0ea45a" />
      <circle cx="24" cy="19" r="3" fill="#085f3b" />
    </svg>
  );
}
