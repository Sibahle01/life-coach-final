export default function MenuHero() {
  return (
    // UPDATED: Added a class for background image with responsive height
    <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      
      {/* ADDED: Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: "url('/images/menu/menu-hero.jpg')",
        }}
      >
        {/* ADDED: Dark overlay for better contrast (optional but recommended for hero images) */}
        <div className="absolute inset-0 bg-forest/40 backdrop-blur-[1px]"></div>
      </div>

      {/* REMOVED: Text overlay content */}
      {/* <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-cream mb-4">
          Our Menu
        </h1>
        <p className="text-cream text-xl md:text-2xl max-w-2xl">
          Experience the rich flavors of Africa, crafted with passion
        </p>
      </div> 
      */}
    </section>
  );
}