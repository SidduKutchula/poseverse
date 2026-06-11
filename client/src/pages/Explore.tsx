import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Grid3x3, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { PoseCard } from "@/components/PoseCard";

// Mock data
const mockPoses = [
  {
    id: "1",
    name: "Romantic Beachside Hold",
    imageUrl: "https://source.unsplash.com/400x500/?couple,beach,portrait",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
  },
  {
    id: "2",
    name: "Veil Toss Portrait",
    imageUrl: "https://source.unsplash.com/400x500/?bride,veil,portrait",
    difficulty: "Intermediate" as const,
    occasion: "Wedding",
    people: "Solo",
    cameraAngle: "Medium",
  },
  {
    id: "3",
    name: "Forehead Kiss at Sunset",
    imageUrl: "https://source.unsplash.com/400x500/?couple,sunset,romantic",
    difficulty: "Easy" as const,
    occasion: "Pre-Wedding",
    people: "Couple",
    cameraAngle: "Close-up",
  },
  {
    id: "4",
    name: "Saree Twirl in Garden",
    imageUrl: "https://source.unsplash.com/400x500/?woman,saree,garden",
    difficulty: "Beginner" as const,
    occasion: "Traditional",
    people: "Solo",
    cameraAngle: "Full Body",
  },
  {
    id: "5",
    name: "Maternity Window Light",
    imageUrl: "https://source.unsplash.com/400x500/?maternity,window,light",
    difficulty: "Beginner" as const,
    occasion: "Maternity",
    people: "Solo",
    cameraAngle: "Profile",
  },
  {
    id: "6",
    name: "Bride Getting Ready",
    imageUrl: "https://source.unsplash.com/400x500/?bride,getting,ready",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Solo",
    cameraAngle: "Candid",
  },
  {
    id: "7",
    name: "Walking Away Together",
    imageUrl: "https://source.unsplash.com/400x500/?couple,walking,away",
    difficulty: "Easy" as const,
    occasion: "Wedding",
    people: "Couple",
    cameraAngle: "Wide",
  },
  {
    id: "8",
    name: "Sitting on Steps",
    imageUrl: "https://source.unsplash.com/400x500/?couple,sitting,steps",
    difficulty: "Beginner" as const,
    occasion: "Couple",
    people: "Couple",
    cameraAngle: "Medium",
  },
  {
    id: "9",
    name: "Flower Crown Portrait",
    imageUrl: "https://source.unsplash.com/400x500/?woman,flower,crown",
    difficulty: "Beginner" as const,
    occasion: "Birthday",
    people: "Solo",
    cameraAngle: "Close-up",
  },
  {
    id: "10",
    name: "Graduation Cap Toss",
    imageUrl: "https://source.unsplash.com/400x500/?graduation,cap,toss",
    difficulty: "Pro" as const,
    occasion: "Graduation",
    people: "Solo",
    cameraAngle: "Wide",
  },
  {
    id: "11",
    name: "Back to Back Couple",
    imageUrl: "https://source.unsplash.com/400x500/?couple,back,to,back",
    difficulty: "Easy" as const,
    occasion: "Couple",
    people: "Couple",
    cameraAngle: "Full Body",
  },
  {
    id: "12",
    name: "Traditional Mehndi Pose",
    imageUrl: "https://source.unsplash.com/400x500/?mehndi,hands,traditional",
    difficulty: "Beginner" as const,
    occasion: "Traditional",
    people: "Solo",
    cameraAngle: "Close-up",
  },
];

export default function Explore() {
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("trending");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    occasions: [],
    shootType: "",
    people: "",
    styles: [],
    difficulty: "",
    lighting: [],
  });
  const [filteredPoses, setFilteredPoses] = useState(mockPoses);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    if (category) {
      // Map slug to occasion name
      const occasionMap: Record<string, string> = {
        wedding: "Wedding",
        "pre-wedding": "Pre-Wedding",
        maternity: "Maternity",
        birthday: "Birthday",
        traditional: "Traditional",
        fashion: "Fashion",
        kids: "Kids",
        graduation: "Graduation",
      };
      const occasion = occasionMap[category];
      if (occasion) {
        setFilters((prev) => ({
          ...prev,
          occasions: [occasion],
        }));
      }
    }
  }, [location]);

  // Apply filters
  const applyFilters = () => {
    let result = mockPoses;

    // Search filter
    if (filters.search) {
      result = result.filter((pose) =>
        pose.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Occasion filter
    if (filters.occasions.length > 0) {
      result = result.filter((pose) =>
        filters.occasions.includes(pose.occasion)
      );
    }

    // People filter
    if (filters.people) {
      result = result.filter((pose) => pose.people === filters.people);
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== "All") {
      result = result.filter((pose) => pose.difficulty === filters.difficulty);
    }

    // Sort
    if (sortBy === "trending") {
      // Keep original order
    } else if (sortBy === "newest") {
      result = [...result].reverse();
    } else if (sortBy === "difficulty") {
      const difficultyOrder = ["Beginner", "Easy", "Intermediate", "Pro"];
      result = [...result].sort(
        (a, b) =>
          difficultyOrder.indexOf(a.difficulty) -
          difficultyOrder.indexOf(b.difficulty)
      );
    }

    setFilteredPoses(result);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
            Explore Poses
          </h1>
          <p className="text-muted-foreground">
            {filteredPoses.length} poses found
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-card p-4 shadow-soft">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                onApply={applyFilters}
                onClear={() =>
                  setFilters({
                    search: "",
                    occasions: [],
                    shootType: "",
                    people: "",
                    styles: [],
                    difficulty: "",
                    lighting: [],
                  })
                }
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 size={18} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List size={18} />
                </Button>
              </div>
            </div>

            {/* Poses Grid */}
            {filteredPoses.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredPoses.map((pose) => (
                  <PoseCard
                    key={pose.id}
                    {...pose}
                    onSave={(id) => console.log("Saved pose:", id)}
                    onShare={(id) => console.log("Shared pose:", id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
                <p className="text-muted-foreground">No poses found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
