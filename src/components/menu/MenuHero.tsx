import Image from 'next/image';

export default function MenuHero() {
  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest/80 to-charcoal/60 z-10" />
      
      {/* Background Image */}
      <Image
        src="/images/menu/menu-hero.jpg"
        alt="Ubuntu Garden Lounge Menu"
        fill
        className="object-cover"
        priority
      />
      
      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-4">
          Our Menu
        </h1>
        <p className="text-cream text-xl md:text-2xl max-w-3xl mb-8">
          A culinary journey through Africa's diverse flavors, 
          crafted with passion and served with warmth.
        </p>
        <div className="flex gap-4">
          <button className="bg-gold hover:bg-gold-dark text-charcoal px-6 py-3 rounded-lg font-semibold">
            Download Menu PDF
          </button>
          <button className="bg-transparent border-2 border-cream text-cream hover:bg-cream/10 px-6 py-3 rounded-lg font-semibold">
            Reserve a Table
          </button>
        </div>
      </div>
    </section>
  );
}