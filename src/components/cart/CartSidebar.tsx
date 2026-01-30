// src/components/cart/CartSidebar.tsx - SIMPLIFIED VERSION
'use client';

import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { KentePattern, ZigzagPattern } from '@/components/patterns/AfricanPatterns';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const {
    items,
    totalItems,
    subtotal,
    tax,
    total,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const router = useRouter();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleCheckout = () => {
    router.push('/checkout');
    setIsCartOpen(false);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 z-40"
      />
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream-light z-50 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream-light z-10 border-b border-cream-dark">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-forest" />
                <h2 className="text-2xl font-bold text-forest">Your Order</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-cream-dark rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-charcoal" />
              </button>
            </div>
            <ZigzagPattern className="w-full h-2 text-gold" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-forest/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-forest mb-2">Your cart is empty</h3>
              <p className="text-charcoal-light mb-6">
                Add delicious African dishes to get started
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-forest hover:bg-forest-dark text-white font-bold rounded-full transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-forest mb-3">
                  Your Selection ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </h3>
                
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="bg-white rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-forest">{item.name}</h4>
                          <p className="text-sm text-charcoal-light mt-1">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-cream-dark rounded-full transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4 text-charcoal-light" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-cream hover:bg-cream-dark rounded-full transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-forest" />
                          </button>
                          <span className="font-bold text-forest w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-cream hover:bg-cream-dark rounded-full transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-forest" />
                          </button>
                        </div>
                        <div className="font-bold text-forest">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="font-bold text-forest mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Tax (15% VAT)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-cream-dark">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-forest">Total</span>
                      <span className="font-bold text-lg text-forest">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-light mt-2">
                      Choose pickup or dine-in at checkout
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gold hover:bg-gold-light text-forest font-bold py-4 rounded-full transition-all shadow-lg hover:shadow-gold/30"
                >
                  Proceed to Checkout
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 border-2 border-forest text-forest hover:bg-forest hover:text-white font-bold py-3 rounded-full transition-colors"
                  >
                    Clear Cart
                  </button>
                  
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1 border-2 border-gold text-gold hover:bg-gold hover:text-forest font-bold py-3 rounded-full transition-colors"
                  >
                    Add More
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Pattern */}
        <div className="sticky bottom-0 bg-cream-light pt-4 border-t border-cream-dark">
          <KentePattern className="w-full h-3 text-forest/20" />
        </div>
      </motion.div>
    </>
  );
}