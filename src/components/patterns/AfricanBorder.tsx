interface AfricanBorderProps {
  variant?: "top" | "bottom" | "both";
  className?: string;
  color?: "gold" | "forest" | "cream" | "charcoal";
}

export default function AfricanBorder({ 
  variant = "top", 
  className = "",
  color = "gold"
}: AfricanBorderProps) {
  
  const colorMap = {
    gold: "#d4af37",
    forest: "#1a4d2e",
    cream: "#f5f5f0",
    charcoal: "#2d3748"
  };

  const selectedColor = colorMap[color];

  const patterns = {
    top: (
      <div className={`h-2 w-full ${className}`}>
        <div className="h-full w-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='8' viewBox='0 0 60 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4c6 0 6-4 12-4s6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4' stroke='${encodeURIComponent(selectedColor)}' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 8px",
        }} />
      </div>
    ),
    bottom: (
      <div className={`h-2 w-full ${className}`}>
        <div className="h-full w-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='8' viewBox='0 0 60 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4c6 0 6-4 12-4s6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4' stroke='${encodeURIComponent(selectedColor)}' stroke-width='2' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 8px",
        }} />
      </div>
    )
  };

  return (
    <div className="w-full">
      {(variant === "top" || variant === "both") && patterns.top}
      {(variant === "bottom" || variant === "both") && patterns.bottom}
    </div>
  );
}
