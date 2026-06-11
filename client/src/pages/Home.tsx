import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";

// Mock data
const mockCategories = [
  {
    id: "1",
    name: "Wedding",
    slug: "wedding",
    imageUrl: "https://source.unsplash.com/400x500/?bride,portrait,wedding",
    poseCount: 124,
  },
  {
    id: "2",
    name: "Pre-Wedding",
    slug: "pre-wedding",
    imageUrl: "https://source.unsplash.com/400x500/?couple,portrait,romantic",
    poseCount: 98,
  },
  {
    id: "3",
    name: "Maternity",
    slug: "maternity",
    imageUrl: "https://source.unsplash.com/400x500/?maternity,woman,portrait",
    poseCount: 67,
  },
  {
    id: "4",
    name: "Birthday",
    slug: "birthday",
    imageUrl: "https://source.unsplash.com/400x500/?woman,portrait,birthday",
    poseCount: 89,
  },
  {
    id: "5",
    name: "Traditional",
    slug: "traditional",
    imageUrl: "https://source.unsplash.com/400x500/?indian,woman,saree",
    poseCount: 112,
  },
  {
    id: "6",
    name: "Fashion",
    slug: "fashion",
    imageUrl: "https://source.unsplash.com/400x500/?fashion,model,portrait",
    poseCount: 156,
  },
  {
    id: "7",
    name: "Kids",
    slug: "kids",
    imageUrl: "https://source.unsplash.com/400x500/?child,portrait,happy",
    poseCount: 73,
  },
  {
    id: "8",
    name: "Graduation",
    slug: "graduation",
    imageUrl: "https://source.unsplash.com/400x500/?graduation,portrait,person",
    poseCount: 54,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-primary-light to-background">
        {/* Background Mosaic */}
        <div className="absolute inset-0 opacity-40">
          <div className="grid grid-cols-5 gap-2 p-4 h-full">
            <img
              src="https://source.unsplash.com/300x400/?bride,portrait,wedding"
              alt=""
              className="h-full w-full object-cover rounded-lg transform -rotate-2"
            />
            <img
              src="https://source.unsplash.com/300x400/?couple,portrait,romantic"
              alt=""
              className="h-full w-full object-cover rounded-lg transform rotate-1"
            />
            <img
              src="https://source.unsplash.com/300x400/?indian,woman,saree,portrait"
              alt=""
              className="h-full w-full object-cover rounded-lg transform -rotate-1"
            />
            <img
              src="https://source.unsplash.com/300x400/?maternity,woman,portrait"
              alt=""
              className="h-full w-full object-cover rounded-lg transform rotate-2"
            />
            <img
              src="https://source.unsplash.com/300x400/?couple,outdoor,portrait,pose"
              alt=""
              className="h-full w-full object-cover rounded-lg transform -rotate-1"
            />
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-white/82" />

        {/* Content */}
        <div className="relative z-10 flex h-[90vh] flex-col items-center justify-center px-4">
          <div className="max-w-3xl text-center">
            {/* Label */}
            <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              AI-Powered · 500+ Poses · Free
            </p>

            {/* Headline */}
            <h1 className="mb-6 font-serif text-5xl md:text-6xl lg:text-7xl font-normal text-foreground text-balance">
              Your Photoshoot, Perfectly Planned.
            </h1>

            {/* Subheading */}
            <p className="mb-10 text-lg md:text-xl text-muted-foreground text-balance">
              Discover AI-curated pose ideas for weddings, birthdays, maternity
              shoots and more.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                onClick={() => (window.location.href = "/explore")}
              >
                Explore Poses
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary-light"
                onClick={() => (window.location.href = "/ai-recommend")}
              >
                Get AI Suggestions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card py-8 md:py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                500+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Poses</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                12
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                10k+
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Users</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl font-normal text-foreground">
                4.9★
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
              Browse by Occasion
            </h2>
            <p className="text-muted-foreground">
              Find the perfect poses for any event or photoshoot
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCategories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif text-lg font-normal">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-normal text-foreground mb-2">
                  Choose Your Occasion
                </h3>
                <p className="text-muted-foreground">
                  Select from 12+ categories including weddings, birthdays, maternity shoots, and more.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif text-lg font-normal">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-normal text-foreground mb-2">
                  Browse or Get AI Suggestions
                </h3>
                <p className="text-muted-foreground">
                  Explore our curated library or let AI recommend the perfect poses based on your shoot details.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif text-lg font-normal">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-normal text-foreground mb-2">
                  Save & Share with Your Photographer
                </h3>
                <p className="text-muted-foreground">
                  Create mood boards, save your favorites, and share them with your photographer for the perfect shoot.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-primary-foreground"
              onClick={() => (window.location.href = "/ai-recommend")}
            >
              Start Planning Your Shoot
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
