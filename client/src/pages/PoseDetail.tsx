import { useState } from "react";
import { useRoute } from "wouter";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { PoseCard } from "@/components/PoseCard";

// Mock data
const mockPoseDetail = {
  id: "1",
  name: "Romantic Beachside Hold",
  category: "Wedding",
  difficulty: "Easy",
  people: "Couple",
  imageUrl: "https://source.unsplash.com/600x750/?couple,beach,portrait",
  thumbnails: [
    "https://source.unsplash.com/150x200/?couple,beach,portrait,1",
    "https://source.unsplash.com/150x200/?couple,beach,portrait,2",
    "https://source.unsplash.com/150x200/?couple,beach,portrait,3",
  ],
  description:
    "A romantic pose perfect for couples on the beach. The groom stands behind the bride, both looking towards the horizon.",
  steps: [
    {
      label: "Body Position",
      description:
        "Groom stands behind bride, both facing the same direction. Bride leans back slightly into groom's chest.",
    },
    {
      label: "Hand Placement",
      description:
        "Groom wraps arms around bride's waist. Bride rests hands on groom's arms or holds his hands.",
    },
    {
      label: "Face Direction",
      description: "Both look toward the horizon or slightly to the side. Avoid looking directly at camera.",
    },
    {
      label: "Eye Expression",
      description:
        "Soft, relaxed gaze. Think of a peaceful moment together rather than smiling for the camera.",
    },
    {
      label: "Camera Angle",
      description:
        "Shoot from a slightly lower angle to capture the sky and horizon. Position 10-15 feet away.",
    },
    {
      label: "Lighting Tip",
      description:
        "Golden hour (sunset) works best. Position couple between camera and sun for backlighting effect.",
    },
  ],
  cameraSettings: {
    lens: "50mm or 85mm",
    aperture: "f/2.0–f/2.8",
    light: "Golden hour/Overcast",
    outfit: "Flowy fabrics work best",
  },
  tags: ["Romantic", "Beach", "Couple"],
};

const relatedPoses = [
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
  {
    id: "4",
    name: "Back to Back Couple",
    imageUrl: "https://source.unsplash.com/400x500/?couple,back",
    difficulty: "Easy" as const,
    occasion: "Couple",
    people: "Couple",
    cameraAngle: "Full Body",
  },
];

export default function PoseDetail() {
  const [match, params] = useRoute("/pose/:id");
  const [mainImage, setMainImage] = useState(mockPoseDetail.imageUrl);

  if (!match) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/explore">
            <a className="hover:text-foreground transition-colors">Explore</a>
          </Link>
          <span>/</span>
          <span>{mockPoseDetail.category}</span>
          <span>/</span>
          <span className="text-foreground">{mockPoseDetail.name}</span>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left - Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="mb-6 overflow-hidden rounded-2xl bg-muted shadow-soft-lg">
              <img
                src={mainImage}
                alt={mockPoseDetail.name}
                className="h-96 w-full object-cover md:h-[500px]"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {mockPoseDetail.thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(thumb)}
                  className={`overflow-hidden rounded-lg border-2 transition-all ${
                    mainImage === thumb
                      ? "border-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Caption */}
            <p className="mt-4 text-xs text-muted-foreground">
              Reference photos from professional photographers
            </p>
          </div>

          {/* Right - Pose Guide */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-serif text-4xl font-normal text-foreground mb-4">
                {mockPoseDetail.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-primary text-primary-foreground">
                  {mockPoseDetail.difficulty}
                </Badge>
                <Badge variant="outline">{mockPoseDetail.people}</Badge>
                <Badge variant="outline">{mockPoseDetail.category}</Badge>
              </div>

              <p className="text-muted-foreground">
                {mockPoseDetail.description}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Step-by-Step Guide */}
            <div>
              <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                Step-by-Step Pose Guide
              </h2>

              <div className="space-y-4">
                {mockPoseDetail.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camera Settings */}
            <div>
              <h3 className="font-serif text-xl font-normal text-foreground mb-4">
                Best Camera Settings
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(mockPoseDetail.cameraSettings).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {key === "lens"
                          ? "Lens"
                          : key === "aperture"
                            ? "Aperture"
                            : key === "light"
                              ? "Best Light"
                              : "Outfit"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                Save to Mood Board
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 size={18} className="mr-2" />
                Share Pose
              </Button>
              <Button variant="outline" className="w-full">
                <Download size={18} className="mr-2" />
                Download Reference
              </Button>
            </div>
          </div>
        </div>

        {/* Related Poses */}
        <div className="mt-16 border-t border-border pt-16">
          <h2 className="font-serif text-3xl font-normal text-foreground mb-8">
            You Might Also Like
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPoses.map((pose) => (
              <PoseCard
                key={pose.id}
                {...pose}
                onSave={(id) => console.log("Saved pose:", id)}
                onShare={(id) => console.log("Shared pose:", id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
