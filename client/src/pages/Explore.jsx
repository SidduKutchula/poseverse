import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Grid, List, Check, X, Sparkles } from "lucide-react";
import PoseCard from "../components/pose/PoseCard";
import FilterSidebar from "../components/pose/FilterSidebar";
import Shimmer from "../components/ui/Shimmer";
import SEO from "../components/layout/SEO";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import PoseImage from "../components/ui/PoseImage";
import QueryBuilder from "../components/pose/QueryBuilder";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search") || "";
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    categories: categoryParam ? [categoryParam] : [],
    shootType: "", // Indoor / Outdoor / Both
    people: "", // Solo / Couple / Group
    styles: [], // checkboxes: Traditional / Modern / Cinematic / Candid
    difficulty: "All", // Segmented: All / Beginner / Easy / Pro / Intermediate
    lighting: [], // checkboxes: Natural / Studio / Golden Hour / Night
    search: searchParam,
    sort: "trending",
  });

  const [searchInput, setSearchInput] = useState(searchParam);
  const [poses, setPoses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid / list

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);

  const handleQueryBuilderResults = (pexelsPoses, compiledQuery) => {
    setPoses(pexelsPoses);
    setTotalCount(pexelsPoses.length);
    setHasMore(false);
    showToast(`Fetched ${pexelsPoses.length} Pexels poses for "${compiledQuery}"`, "success");
  };

  // Sync category parameter from URL on mount or URL change
  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({
        ...prev,
        categories: [categoryParam],
      }));
    }
  }, [categoryParam]);

  // Debounce the search input (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // When filters or sort changes, reset page and fetch poses
  useEffect(() => {
    setPage(1);
    fetchPoses(1, false);
  }, [
    filters.categories,
    filters.shootType,
    filters.people,
    filters.styles,
    filters.difficulty,
    filters.lighting,
    filters.search,
    filters.sort,
  ]);

  // Fetch more poses when page increments
  useEffect(() => {
    if (page > 1) {
      fetchPoses(page, true);
    }
  }, [page]);

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 120 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loading]);

  const fetchPoses = async (pageNum, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      
      if (filters.categories.length > 0) {
        filters.categories.forEach((cat) => params.append("category", cat));
      }
      if (filters.difficulty && filters.difficulty !== "All") {
        params.append("difficulty", filters.difficulty);
      }
      if (filters.people && filters.people !== "All") {
        params.append("people", filters.people);
      }
      if (filters.shootType && filters.shootType !== "Both" && filters.shootType !== "") {
        params.append("location", filters.shootType);
      }
      if (filters.styles.length > 0) {
        filters.styles.forEach((st) => params.append("style", st));
      }
      if (filters.lighting.length > 0) {
        filters.lighting.forEach((lt) => params.append("lighting", lt));
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.sort) {
        params.append("sort", filters.sort);
      }
      params.append("page", pageNum);
      params.append("limit", 20);

      const response = await api.get(`/poses?${params.toString()}`);
      const newPoses = response.data.poses || [];
      const totalPages = response.data.pagination?.pages || 1;

      setPoses((prev) => {
        const combined = isLoadMore ? [...prev, ...newPoses] : newPoses;
        const unique = [];
        const seenIds = new Set();
        for (const item of combined) {
          const id = item.id || item._id;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            unique.push(item);
          }
        }
        return unique;
      });
      
      setHasMore(pageNum < totalPages);
      setTotalCount(response.data.pagination?.total || newPoses.length);
    } catch (error) {
      console.error("Error fetching poses:", error);
      showToast("Error loading poses from server", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value }));
  };

  return (
    <>
      <SEO
        title="Explore Photography Poses"
        description="Search and filter through our curation of wedding, traditional, couple, and festival poses. Filter by lighting, subject count, difficulty, and shoot style."
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#FAFAF8] min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-sans"
      >
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-textPrimary">Explore Poses</h1>
              <p className="text-sm text-textSecondary mt-1 font-light">
                Browse professional photoshoot poses, setup suggestions, and guide details.
              </p>
            </div>

            {/* Search, Sort and Grid Toggle controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:max-w-xs">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-textMuted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search poses..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="w-full bg-white border border-border rounded-sm py-2 pl-9 pr-4 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder-textMuted"
                />
              </div>

              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="bg-white border border-border rounded-sm py-2 px-3 text-sm text-textPrimary focus:outline-none focus:border-primary cursor-pointer shrink-0"
              >
                <option value="trending">Trending First</option>
                <option value="name">Alphabetical</option>
                <option value="newest">Newest</option>
              </select>

              {/* Grid / List view toggle */}
              <div className="hidden sm:flex border border-border rounded-sm overflow-hidden bg-white shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-primaryLight text-primary" : "text-textSecondary hover:text-textPrimary"
                  }`}
                  title="Grid view"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-primaryLight text-primary" : "text-textSecondary hover:text-textPrimary"
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>

              <button
                onClick={() => setIsQueryBuilderOpen(true)}
                className="flex items-center gap-1.5 bg-[#FAECE7] hover:bg-[#FAECE7]/80 text-[#D85A30] border border-primary/20 rounded-sm py-2 px-3.5 text-sm font-semibold transition-colors shrink-0 shadow-sm"
              >
                <Sparkles size={14} />
                AI Query Builder
              </button>

              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1 bg-white border border-border rounded-sm py-2 px-3 text-sm text-textSecondary hover:text-primary transition-colors shrink-0"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block md:col-span-1">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                totalResults={totalCount}
              />
            </div>

            {/* Main area - Right Column */}
            <div className="md:col-span-3">
              {loading && poses.length === 0 ? (
                /* Shimmer Loader */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Shimmer key={i} />
                  ))}
                </div>
              ) : poses.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-border rounded-sm p-12 text-center max-w-md mx-auto space-y-4 shadow-sm mt-8">
                  <div className="w-12 h-12 rounded-full bg-primaryLight text-primary flex items-center justify-center mx-auto">
                    <Grid size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-textPrimary">No Poses Found</h3>
                    <p className="text-sm text-textSecondary font-light">
                      We couldn't find any poses matching your active filters. Try resetting some options.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setFilters({
                        categories: [],
                        shootType: "",
                        people: "",
                        styles: [],
                        difficulty: "All",
                        lighting: [],
                        search: "",
                        sort: "trending",
                      });
                    }}
                    className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm transition-colors shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                /* Masonry or List Grid of Poses */
                <motion.div
                  key={`${viewMode}-${JSON.stringify(filters)}-${poses.length}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {viewMode === "grid" ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 w-full">
                      {poses.map((pose, index) => (
                        <div key={pose.id || pose._id} className="break-inside-avoid mb-4">
                          <PoseCard pose={pose} index={index} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* List View Layout */
                    <div className="flex flex-col gap-4">
                      {poses.map((pose, index) => (
                        <motion.div
                          key={pose.id || pose._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.04 }}
                          className="bg-white border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 p-4 hover:translate-y-[-2px] transition-transform cursor-pointer"
                          onClick={() => window.location.assign(`/pose/${pose.id || pose._id}`)}
                        >
                          <div className="w-full sm:w-[150px] aspect-[4/5] sm:aspect-square shrink-0 rounded-sm overflow-hidden bg-[#F3F0EB]">
                            <PoseImage
                              pose={pose}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex flex-col grow justify-between">
                            <div>
                              <span className="text-[10px] tracking-wider uppercase font-semibold text-primary block mb-1">
                                {pose.categoryLabel || pose.category}
                              </span>
                              <h3 className="font-serif text-lg font-bold text-textPrimary hover:text-primary transition-colors">
                                {pose.name}
                              </h3>
                              <p className="text-sm text-textSecondary font-light line-clamp-2 mt-1">
                                {pose.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                              <span className="text-[10px] tracking-wider uppercase font-semibold text-textMuted bg-[#FAFAF8] px-2 py-0.5 rounded-sm border border-border">
                                {pose.difficulty}
                              </span>
                              {pose.peopleCount && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold text-textMuted bg-[#FAFAF8] px-2 py-0.5 rounded-sm border border-border">
                                  {pose.peopleCount}
                                </span>
                              )}
                              {pose.cameraAngle && (
                                <span className="text-[10px] tracking-wider uppercase font-semibold text-textMuted bg-[#FAFAF8] px-2 py-0.5 rounded-sm border border-border">
                                  {pose.cameraAngle}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Infinite Scroll loading indicator */}
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer (Slide-up bottom sheet) */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50">
              {/* Backdrop closer */}
              <div
                className="absolute inset-0 z-0"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              {/* Drawer container */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative z-10 bg-white rounded-t-lg max-h-[85vh] flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-border bg-[#FAFAF8]">
                  <h3 className="font-serif text-lg font-bold text-textPrimary">Refine Search</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-full hover:bg-border"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto grow p-4">
                  <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setIsMobileFilterOpen(false)}
                    totalResults={totalCount}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Query Builder Modal */}
        <AnimatePresence>
          {isQueryBuilderOpen && (
            <QueryBuilder
              isOpen={isQueryBuilderOpen}
              onClose={() => setIsQueryBuilderOpen(false)}
              onResultsFetched={handleQueryBuilderResults}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Explore;
