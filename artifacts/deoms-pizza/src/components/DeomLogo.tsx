export function DeomLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DEOMS Pizza logo"
    >
      {/* Outer crust */}
      <circle cx="22" cy="24" r="17" fill="#F5A623" />
      <circle cx="22" cy="24" r="14.5" fill="#E8C46A" />
      {/* Crust border */}
      <circle cx="22" cy="24" r="17" fill="none" stroke="#C8102E" strokeWidth="3" />
      {/* Slice dividers */}
      <line x1="22" y1="7" x2="22" y2="41" stroke="#C8102E" strokeWidth="1" strokeDasharray="2.5 2" />
      <line x1="5" y1="18" x2="39" y2="30" stroke="#C8102E" strokeWidth="1" strokeDasharray="2.5 2" />
      <line x1="5" y1="30" x2="39" y2="18" stroke="#C8102E" strokeWidth="1" strokeDasharray="2.5 2" />
      {/* Toppings */}
      <circle cx="22" cy="17" r="2.5" fill="#C8102E" opacity="0.9" />
      <circle cx="15.5" cy="26" r="2" fill="#C8102E" opacity="0.85" />
      <circle cx="28.5" cy="26" r="2" fill="#C8102E" opacity="0.85" />
      <circle cx="20" cy="32" r="1.8" fill="#C8102E" opacity="0.75" />
      <circle cx="27" cy="32" r="1.8" fill="#C8102E" opacity="0.75" />
      {/* "D" badge on top */}
      <rect x="13" y="1" width="18" height="13" rx="4" fill="#C8102E" />
      <text
        x="22"
        y="12"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="11"
        fontWeight="900"
        fill="white"
        textAnchor="middle"
        fontStyle="italic"
      >
        D
      </text>
    </svg>
  );
}
