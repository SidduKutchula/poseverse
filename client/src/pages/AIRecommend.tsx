import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PoseCard } from "@/components/PoseCard";

type Step = 1 | 2 | 3 | 4 | 5;

interface RecommendationState {
  occasion: string;
  location: string;
  people: string;
  style: string;
  experience: string;
  timeOfDay: string;
}

// Mock recommended poses
const mockRecommendedPoses = [
  {
    id: "1",
    name: "Romantic Beachside Hold",
    imageUrl: "https://source.unsplash.com/400x500/?couple,beach",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
    matchScore: 95,
  },
  {
    id: "2",
    name: "Forehead Kiss at Sunset",
    imageUrl: "https://source.unsplash.com/400x500/?couple,sunset",
    difficulty: "Easy" as const,
    occasion: "Pre-Wedding",
    people: "Couple",
    cameraAngle: "Close-up",
    matchScore: 92,
  },
  {
    id: "3",
    name: "Walking Away Together",
    imageUrl: "https://source.unsplash.com/400x500/?couple,walking",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
    matchScore: 88,
  },
  {
    id: "4",
    name: "Back to Back Couple",
    imageUrl: "https://source.unsplash.com/400x500/?couple,back",
    difficulty: "Easy" as const,
    occasion: "Couple",
    people: "Couple",
    cameraAngle: "Full Body",
    matchScore: 85,
  },
  {
    id: "5",
    name: "Sitting on Steps",
    imageUrl: "https://source.unsplash.com/400x500/?couple,sitting",
    difficulty: "Beginner" as const,
    occasion: "Couple",
    people: "Couple",
    cameraAngle: "Medium",
    matchScore: 87,
  },
  {
    id: "6",
    name: "Night Silhouette Couple",
    imageUrl: "https://source.unsplash.com/400x500/?couple,night",
    difficulty: "Intermediate" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
    matchScore: 90,
  },
];

export default function AIRecommend() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(mockRecommendedPoses);
  const [state, setState] = useState<RecommendationState>({
    occasion: "",
    location: "",
    people: "",
    style: "",
    experience: "",
    timeOfDay: "",
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      // Generate recommendations
      handleGenerateRecommendations();
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsLoading(false);
    setCurrentStep(5);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const progressValue = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
            Find Your Perfect Poses
          </h1>
          <p className="text-muted-foreground">
            Answer 5 questions — AI picks the best poses for your shoot
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <Progress value={progressValue} className="h-1" />
        </div>

        {/* Steps */}
        {!isLoading && currentStep !== 5 && (
          <div className="space-y-8">
            {/* Step 1 - Occasion */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                  What's the occasion?
                </h2>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[
                    { emoji: "💍", label: "Wedding" },
                    { emoji: "🌸", label: "Pre-Wedding" },
                    { emoji: "🎂", label: "Birthday" },
                    { emoji: "🤰", label: "Maternity" },
                    { emoji: "🪔", label: "Traditional" },
                    { emoji: "❤️", label: "Couple" },
                    { emoji: "🎓", label: "Graduation" },
                    { emoji: "📸", label: "Fashion" },
                    { emoji: "🎉", label: "Festival" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() =>
                        setState({ ...state, occasion: item.label })
                      }
                      className={`rounded-lg border-2 p-4 text-center transition-all ${
                        state.occasion === item.label
                          ? "border-primary bg-primary-light"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="text-sm font-medium">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 - Location & People */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                    Where will you shoot?
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { emoji: "🏠", label: "Indoor" },
                      { emoji: "🌿", label: "Outdoor" },
                      { emoji: "🔄", label: "Both" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          setState({ ...state, location: item.label })
                        }
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          state.location === item.label
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                    How many people?
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { emoji: "👤", label: "Solo" },
                      { emoji: "👫", label: "Couple" },
                      { emoji: "👨‍👩‍👧", label: "Group" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          setState({ ...state, people: item.label })
                        }
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          state.people === item.label
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Style */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                  What style do you prefer?
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      label: "Traditional",
                      desc: "Classic, timeless poses",
                    },
                    {
                      label: "Modern",
                      desc: "Contemporary and trendy",
                    },
                    {
                      label: "Cinematic",
                      desc: "Dramatic and artistic",
                    },
                    {
                      label: "Candid",
                      desc: "Natural and unposed",
                    },
                    {
                      label: "Experimental",
                      desc: "Bold and creative",
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() =>
                        setState({ ...state, style: item.label })
                      }
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        state.style === item.label
                          ? "border-primary bg-primary-light"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 - Experience & Time */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                    What's your experience level?
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { emoji: "🌱", label: "First Time" },
                      { emoji: "📷", label: "Occasional" },
                      { emoji: "🏆", label: "Experienced" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          setState({ ...state, experience: item.label })
                        }
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          state.experience === item.label
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mb-6">
                    What time of day?
                  </h2>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { emoji: "🌅", label: "Morning" },
                      { emoji: "🌇", label: "Golden Hour" },
                      { emoji: "☀️", label: "Afternoon" },
                      { emoji: "🌙", label: "Night" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          setState({ ...state, timeOfDay: item.label })
                        }
                        className={`rounded-lg border-2 p-4 text-center transition-all ${
                          state.timeOfDay === item.label
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 justify-between pt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ChevronLeft size={18} className="mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                disabled={
                  (currentStep === 1 && !state.occasion) ||
                  (currentStep === 2 && (!state.location || !state.people)) ||
                  (currentStep === 3 && !state.style) ||
                  (currentStep === 4 && (!state.experience || !state.timeOfDay))
                }
              >
                {currentStep === 4 ? "Get My Poses" : "Next"}
                {currentStep < 4 && <ChevronRight size={18} className="ml-2" />}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your preferences...</p>
          </div>
        )}

        {/* Results */}
        {currentStep === 5 && !isLoading && (
          <div>
            <h2 className="font-serif text-3xl font-normal text-foreground mb-8">
              Your 12 Perfect Poses
            </h2>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((pose) => (
                <PoseCard
                  key={pose.id}
                  {...pose}
                  onSave={(id) => console.log("Saved pose:", id)}
                  onShare={(id) => console.log("Shared pose:", id)}
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline">Regenerate</Button>
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Save All to Mood Board
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
