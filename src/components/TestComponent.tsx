export default function AfricanPattern({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 800 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="africanPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <line x1="2" y1="0" x2="2" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="0" x2="8" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="8" x2="28" y2="8" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="2"/>
          <line x1="32" y1="8" x2="38" y2="14" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="8" x2="32" y2="14" stroke="currentColor" strokeWidth="2"/>
          <line x1="32" y1="26" x2="38" y2="32" stroke="currentColor" strokeWidth="2"/>
          <line x1="38" y1="26" x2="32" y2="32" stroke="currentColor" strokeWidth="2"/>
        </pattern>
      </defs>
      <rect width="800" height="40" fill="url(#africanPattern)"/>
    </svg>
  );
}