import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Sparkles, Star, TrendingUp, Search } from "lucide-react";
import CategoryCard from "../components/pose/CategoryCard";
import PoseCard from "../components/pose/PoseCard";
import SEO from "../components/layout/SEO";
import api from "../utils/api";
import { CATEGORIES, HERO_IMAGES, POSES } from "../data/poses";

const Home = () => {
  const navigate = useNavigate();
  const categories = CATEGORIES;
  const heroImages = HERO_IMAGES;
  const testimonialAvatars = POSES.slice(0, 3).map((pose) => pose.image);

  const [trendingPoses, setTrendingPoses] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get("/poses?sort=trending&limit=5");
        setTrendingPoses(response.data.poses || []);
      } catch (error) {
        console.warn("Failed to fetch trending poses, using local fallback:", error.message);
        const mockTrending = POSES.filter((p) => p.trending).slice(0, 5);
        setTrendingPoses(mockTrending);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const stats = [
    { value: "500+", label: "Professional Poses" },
    { value: "12", label: "Shoot Occasions" },
    { value: "10,000+", label: "Happy Users" },
    { value: "4.9★", label: "User Rating" }
  ];

  const steps = [
    {
      number: "1",
      title: "Choose Occasion",
      desc: "Select from wedding, traditional, maternity, or reels shoot types."
    },
    {
      number: "2",
      title: "Browse & AI Suggest",
      desc: "Filter by difficulty, lighting, subject count, or let our AI guide you."
    },
    {
      number: "3",
      title: "Save & Share",
      desc: "Generate your digital mood board and share it instantly with your photographer."
    }
  ];

  const testimonials = [
    {
      name: "Priya & Rohan Sharma",
      city: "Mumbai",
      quote: "PoseVerse completely changed how we did our pre-wedding shoot. The lighting tips and camera angle suggestions made us feel like professional models!",
      avatar: testimonialAvatars[0]
    },
    {
      name: "Vikram Malhotra",
      city: "Delhi (Photographer)",
      quote: "Having clients share their PoseVerse mood board makes my job 10 times easier. I know exactly what shots they want, down to the lens settings.",
      avatar: testimonialAvatars[1]
    },
    {
      name: "Anjali Patel",
      city: "Ahmedabad",
      quote: "The AI Suggestion wizard matched our traditional festival shoot parameters perfectly. The steps were extremely simple to follow.",
      avatar: testimonialAvatars[2]
    }
  ];

  return (
    <>
      <SEO
        title="AI-Powered Photography Pose Inspiration Platform"
        description="Discover beautiful photoshoot poses for Indian weddings, maternity shoots, traditional festivals, couples, and Instagram reels. Use our AI Suggestion engine to plan the perfect shoot."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#FAFAF8] min-h-screen flex flex-col font-sans"
      >
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
          {/* CSS Mosaic Grid in Background */}
          <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-5 gap-6 p-8 opacity-25 pointer-events-none overflow-hidden">
            {heroImages.map((src, idx) => {
              const rotations = ["rotate-[-2deg] translate-y-4", "rotate-[1deg] translate-y-[-8px]", "rotate-[-1deg] translate-y-12", "rotate-[2deg] translate-y-2", "rotate-[-2deg] translate-y-[-16px]"];
              return (
                <div key={idx} className={`hidden sm:block ${rotations[idx]} h-full`}>
                  <img
                    src={src}
                    alt={`Hero ${idx + 1}`}
                    loading="eager"
                    className="rounded-md w-full h-full object-cover shadow-lg"
                  />
                </div>
              );
            })}
            {/* Fallback for very small screens */}
            <div className="sm:hidden col-span-2 h-full">
              <img
                src={heroImages[0]}
                alt="Hero Mobile"
                loading="eager"
                className="rounded-md w-full h-full object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-[#FAFAF8]/85 z-0 pointer-events-none" />

          {/* Center content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 flex flex-col items-center">
            <span className="text-xs font-bold tracking-widest text-textMuted uppercase mb-3 bg-[#E8E4DE] px-3 py-1 rounded-sm">
              AI-Powered · 500+ Poses · Free
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight text-textPrimary font-bold max-w-3xl">
              Your Photoshoot, <br className="hidden sm:inline" />
              <span className="text-primary italic">Perfectly Planned.</span>
            </h1>
            <p className="text-base sm:text-lg text-textSecondary max-w-2xl mt-4 leading-relaxed font-light">
              AI-curated pose ideas for weddings, traditional shoots, birthdays, and maternity photoshoots.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 w-full max-w-md relative flex items-center bg-white border border-border rounded-sm shadow-sm focus-within:border-primary transition-colors overflow-hidden">
              <Search className="absolute left-4 text-textMuted" size={18} />
              <input
                type="text"
                placeholder="Search wedding, traditional, candid poses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-24 py-3 text-sm text-textPrimary bg-transparent focus:outline-none placeholder-textMuted"
              />
              <button
                type="submit"
                className="absolute right-1.5 bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-sm transition-colors"
              >
                Search
              </button>
            </form>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/explore"
                className="bg-primary hover:bg-primaryDark text-white text-base font-semibold px-8 py-3.5 rounded-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Compass size={18} />
                Explore Poses
              </Link>
              <Link
                to="/ai-recommend"
                className="bg-transparent hover:bg-primaryLight border-2 border-primary text-primary hover:text-primaryDark text-base font-semibold px-8 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Get AI Suggestions
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-3">
                {testimonialAvatars.map((src, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full border-2 border-[#FAFAF8] overflow-hidden shadow-sm">
                    <img
                      src={src}
                      alt={`Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm text-textSecondary font-medium">
                Trusted by <span className="text-primary font-bold">10,000+</span> couples and photographers
              </span>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-y border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border">
              {stats.map((stat, idx) => (
                <div key={idx} className={`pt-4 md:pt-0 ${idx > 0 ? "md:pl-4" : ""}`}>
                  <h3 className="font-serif text-3xl sm:text-4xl text-primary font-bold">
                    {stat.value}
                  </h3>
                  <p className="text-xs sm:text-sm text-textMuted mt-1 font-medium tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category Grid Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-2 mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-textPrimary">
              Browse by Occasion
            </h2>
            <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto">
              Discover bespoke poses tailored specifically for every special occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </section>

        {/* Trending Poses Section */}
        <section className="py-20 bg-white border-y border-border w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl font-bold text-textPrimary flex items-center gap-2">
                  <TrendingUp className="text-primary" size={28} />
                  Trending Poses
                </h2>
                <p className="text-sm text-textSecondary max-w-md">
                  Our community's most saved and viewed photography poses this week.
                </p>
              </div>
              <Link
                to="/explore?sort=trending"
                className="text-primary hover:text-primaryDark text-sm font-semibold hover:underline shrink-0"
              >
                Explore All Poses →
              </Link>
            </div>

            {loadingTrending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[#F3F0EB] animate-pulse rounded-sm" />
                ))}
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {trendingPoses.map((pose, idx) => (
                  <div key={pose.id || pose._id} className="min-w-[260px] sm:min-w-[280px] w-[280px] shrink-0">
                    <PoseCard pose={pose} index={idx} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-2 mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-textPrimary">
                How It Works
              </h2>
              <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto">
                Plan your photoshoot in three simple steps.
              </p>
            </div>

            <div className="relative">
              {/* Dotted connecting line */}
              <div className="absolute top-8 left-4 right-4 hidden md:block border-t-2 border-dashed border-border z-0" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primaryLight text-primary font-serif flex items-center justify-center font-bold text-2xl border border-primary/20 shadow-sm">
                      {step.number}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-textPrimary">
                      {step.title}
                    </h3>
                    <p className="text-sm text-textSecondary max-w-xs leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-2 mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-textPrimary">
                Loved by Couples & Photographers
              </h2>
              <p className="text-sm sm:text-base text-textSecondary max-w-md mx-auto">
                Hear from our community who planned their dream shoots.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white border border-border p-6 rounded-sm shadow-sm flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-textPrimary">{t.name}</h4>
                      <p className="text-xs text-textMuted">{t.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-textSecondary italic leading-relaxed grow">
                    "{t.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Home;
