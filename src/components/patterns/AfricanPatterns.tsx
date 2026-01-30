// src/components/patterns/AfricanPatterns.tsx
// Authentic African geometric patterns based on traditional textiles

export const KentePattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="kente" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Inspired by Ashanti Kente cloth - geometric strips */}
        <rect x="0" y="0" width="8" height="40" fill="currentColor" opacity="0.3"/>
        <rect x="10" y="0" width="6" height="40" fill="currentColor" opacity="0.5"/>
        <rect x="18" y="0" width="4" height="40" fill="currentColor" opacity="0.4"/>
        <rect x="24" y="0" width="6" height="40" fill="currentColor" opacity="0.6"/>
        <rect x="32" y="0" width="8" height="40" fill="currentColor" opacity="0.3"/>
        {/* Horizontal accents */}
        <rect x="0" y="8" width="40" height="2" fill="currentColor" opacity="0.7"/>
        <rect x="0" y="20" width="40" height="3" fill="currentColor" opacity="0.8"/>
        <rect x="0" y="30" width="40" height="2" fill="currentColor" opacity="0.7"/>
      </pattern>
    </defs>
    <rect width="200" height="40" fill="url(#kente)"/>
  </svg>
);

export const AdinkraPattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="adinkra" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Inspired by Ghanaian Adinkra symbols - unity and strength */}
        <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6"/>
        <path d="M20 12 L20 28 M12 20 L28 20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
        <path d="M15 15 L25 25 M25 15 L15 25" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        {/* Corner accents */}
        <circle cx="5" cy="5" r="2" fill="currentColor" opacity="0.5"/>
        <circle cx="35" cy="5" r="2" fill="currentColor" opacity="0.5"/>
        <circle cx="5" cy="35" r="2" fill="currentColor" opacity="0.5"/>
        <circle cx="35" cy="35" r="2" fill="currentColor" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="200" height="40" fill="url(#adinkra)"/>
  </svg>
);

export const KubaPattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="kuba" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        {/* Inspired by Kuba cloth - intricate geometric raffia designs */}
        <rect x="0" y="0" width="20" height="20" fill="none"/>
        <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="currentColor" opacity="0.4"/>
        <rect x="7" y="7" width="6" height="6" fill="currentColor" opacity="0.6"/>
        <path d="M3,10 L10,3 M17,10 L10,17 M10,3 L17,10 M3,10 L10,17" 
              stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="200" height="40" fill="url(#kuba)"/>
  </svg>
);

export const MudclothPattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="mudcloth" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        {/* Inspired by Malian Bogolanfini - symbols and geometric shapes */}
        <rect x="5" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <path d="M15,10 L15,20 M10,15 L20,15" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
        <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
        {/* Diagonal accents */}
        <path d="M5,5 L10,10 M20,10 L25,5 M5,25 L10,20 M20,20 L25,25" 
              stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="200" height="40" fill="url(#mudcloth)"/>
  </svg>
);

export const ZigzagPattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Traditional African chevron/zigzag pattern */}
    <path d="M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L110,0 L120,10 L130,0 L140,10 L150,0 L160,10 L170,0 L180,10 L190,0 L200,10" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          opacity="0.6"/>
    <path d="M0,10 L10,20 L20,10 L30,20 L40,10 L50,20 L60,10 L70,20 L80,10 L90,20 L100,10 L110,20 L120,10 L130,20 L140,10 L150,20 L160,10 L170,20 L180,10 L190,20 L200,10" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none"
          opacity="0.6"/>
  </svg>
);

export const DiamondPattern = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="diamond" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Diamond patterns common across African textiles */}
        <path d="M20,5 L35,20 L20,35 L5,20 Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none" 
              opacity="0.5"/>
        <path d="M20,10 L30,20 L20,30 L10,20 Z" 
              fill="currentColor" 
              opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="200" height="40" fill="url(#diamond)"/>
  </svg>
);