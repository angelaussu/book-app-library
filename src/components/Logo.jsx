import React from 'react'

export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#1c65da" />
      {/* Snowflake/asterisk style icon */}
      <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
        <line x1="20" y1="10" x2="20" y2="30" />
        <line x1="10" y1="20" x2="30" y2="20" />
        <line x1="12.93" y1="12.93" x2="27.07" y2="27.07" />
        <line x1="27.07" y1="12.93" x2="12.93" y2="27.07" />
        {/* Inner dots */}
        <circle cx="20" cy="14" r="1.2" fill="#fff" stroke="none" />
        <circle cx="20" cy="26" r="1.2" fill="#fff" stroke="none" />
        <circle cx="14" cy="20" r="1.2" fill="#fff" stroke="none" />
        <circle cx="26" cy="20" r="1.2" fill="#fff" stroke="none" />
      </g>
    </svg>
  )
}
