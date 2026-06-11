import { Link } from "wouter";

export interface CategoryCardProps {
  id: string;
  name: string;
  imageUrl: string;
  poseCount: number;
  slug: string;
}

export function CategoryCard({
  name,
  imageUrl,
  poseCount,
  slug,
}: CategoryCardProps) {
  const handleClick = () => {
    window.location.href = `/explore?category=${slug}`;
  };

  return (
    <div className="group block h-full cursor-pointer" onClick={handleClick}>
        <div className="relative h-72 overflow-hidden rounded-2xl shadow-soft transition-smooth">
          {/* Image */}
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
            <div>
              <h3 className="font-serif text-2xl font-normal text-white">
                {name}
              </h3>
            </div>
            <div className="text-sm font-medium text-white/80">
              {poseCount} poses
            </div>
          </div>
        </div>
    </div>
  );
}
