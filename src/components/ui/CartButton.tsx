// src/components/ui/CartButton.tsx
'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

// ✅ 1. Define the props interface
interface CartButtonProps {
  iconColor?: string;  // e.g., 'text-forest' or 'text-white'
  hoverBg?: string;    // e.g., 'hover:bg-cream-dark' or 'hover:bg-white/20'
}

// ✅ 2. Accept the props with default values
export default function CartButton({ 
  iconColor = 'text-forest', 
  hoverBg = 'hover:bg-cream-dark' 
}: CartButtonProps) {
  const { totalItems, setIsCartOpen } = useCart();
  
  return (
    <button
      onClick={() => setIsCartOpen(true)}
      // ✅ 3. Use the hoverBg prop dynamically
      className={`relative p-2 ${hoverBg} rounded-full transition-colors`}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      {/* ✅ 4. Use the iconColor prop dynamically */}
      <ShoppingBag className={`w-6 h-6 ${iconColor}`} />
      
      {totalItems > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-gold text-forest text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {totalItems > 9 ? '9+' : totalItems}
        </motion.div>
      )}
    </button>
  );
}