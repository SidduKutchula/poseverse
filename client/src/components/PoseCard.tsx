import { Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PoseCardProps {
  id: string;
  name: string;
  imageUrl: string;
  difficulty: "Beginner" | "Easy" | "Intermediate" | "Pro";
  occasion: string;
  people: string;
  cameraAngle: string;
  isSaved?: boolean;
  matchScore?: number;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-700",
  Easy: "bg-blue-100 text-blue-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Pro: "bg-red-100 text-red-700",
};

export function PoseCard({
  id,
  name,
  imageUrl,
  difficulty,
  occasion,
  people,
  cameraAngle,
  isSaved = false,
  matchScore,
  onSave,
  onShare,
}: PoseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(id);
  };

  const handleCardClick = () => {
    window.location.href = `/pose/${id}`;
  };

  return (
    <div className="group block h-full cursor-pointer" onClick={handleCardClick}>
        <div
          className="relative overflow-hidden rounded-lg bg-card shadow-soft transition-smooth group-hover:shadow-soft-lg group-hover:scale-[1.02]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {/* Shimmer Loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-card to-muted" />
            )}

            {/* Image */}
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Overlay on Hover */}
            {isHovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  View Pose Guide
                </Button>
              </div>
            )}

            {/* Difficulty Badge - Top Left */}
            <div className="absolute left-3 top-3 z-10">
              <Badge className={`${difficultyColors[difficulty]} font-medium`}>
                {difficulty}
              </Badge>
            </div>

            {/* Match Score Badge - Top Right (if provided) */}
            {matchScore && (
              <div className="absolute right-3 top-3 z-10">
                <Badge className="bg-amber-100 text-amber-700 font-medium">
                  {matchScore}% match
                </Badge>
              </div>
            )}

            {/* Save Button - Top Right (if no match score) */}
            {!matchScore && (
              <button
                onClick={handleSave}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 transition-all hover:bg-white"
              >
                <Heart
                  size={20}
                  className={`transition-colors ${
                    saved ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Card Body */}
          <div className="space-y-3 p-4">
            {/* Pose Name */}
            <h3 className="font-serif text-base font-normal text-foreground line-clamp-1">
              {name}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {occasion}
              </span>
              <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {people}
              </span>
            </div>

            {/* Camera Angle & Share */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">{cameraAngle}</span>
              <button
                onClick={handleShare}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
