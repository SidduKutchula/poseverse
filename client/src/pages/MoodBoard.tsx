import { useState } from "react";
import { Download, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoseCard } from "@/components/PoseCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

// Mock saved poses
const mockSavedPoses = [
  {
    id: "1",
    name: "Romantic Beachside Hold",
    imageUrl: "https://source.unsplash.com/400x500/?couple,beach",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
  },
  {
    id: "2",
    name: "Forehead Kiss at Sunset",
    imageUrl: "https://source.unsplash.com/400x500/?couple,sunset",
    difficulty: "Easy" as const,
    occasion: "Pre-Wedding",
    people: "Couple",
    cameraAngle: "Close-up",
  },
  {
    id: "3",
    name: "Walking Away Together",
    imageUrl: "https://source.unsplash.com/400x500/?couple,walking",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
  },
];

export default function MoodBoard() {
  const { isAuthenticated, user } = useAuth();
  const [savedPoses, setSavedPoses] = useState(mockSavedPoses);
  const [shareLink, setShareLink] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-4xl font-normal text-foreground mb-4">
            Your Mood Board
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to create and manage your mood boards
          </p>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="bg-primary hover:bg-primary-dark text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleRemove = (id: string) => {
    setSavedPoses(savedPoses.filter((pose) => pose.id !== id));
  };

  const handleShare = () => {
    // Generate mock share link
    const token = Math.random().toString(36).substring(7);
    setShareLink(`/moodboard/share/${token}`);
    // Copy to clipboard
    navigator.clipboard.writeText(
      `${window.location.origin}/moodboard/share/${token}`
    );
    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-2">
              Your Mood Board
            </h1>
            <p className="text-muted-foreground">
              {savedPoses.length} poses saved
            </p>
          </div>

          {savedPoses.length > 0 && (
            <Button
              onClick={handleShare}
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              <Share2 size={18} className="mr-2" />
              Share with Photographer
            </Button>
          )}
        </div>

        {/* Empty State */}
        {savedPoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">
                Your mood board is empty
              </p>
              <Link href="/explore">
                <a>
                  <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
                    Explore Poses
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Poses Grid */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPoses.map((pose) => (
                <div key={pose.id} className="relative group">
                  <PoseCard
                    {...pose}
                    isSaved={true}
                    onSave={(id) => handleRemove(id)}
                    onShare={(id) => console.log("Shared pose:", id)}
                  />

                  {/* Remove Button on Hover */}
                  <button
                    onClick={() => handleRemove(pose.id)}
                    className="absolute top-3 right-3 z-20 rounded-full bg-red-500/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card shadow-soft-lg">
              <div className="container flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  {savedPoses.length} poses saved
                </p>

                <div className="flex gap-3">
                  <Button variant="outline">
                    <Download size={18} className="mr-2" />
                    Download as PDF
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="bg-primary hover:bg-primary-dark text-primary-foreground"
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Spacer for sticky bar */}
            <div className="h-20" />
          </>
        )}
      </div>
    </div>
  );
}
