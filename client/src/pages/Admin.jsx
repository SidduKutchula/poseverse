import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Shield, Sparkles, TrendingUp, Trash2, Plus, X, Search, Database, Users, Layout } from "lucide-react";
import SEO from "../components/layout/SEO";
import api from "../utils/api";
import { CATEGORIES } from "../data/poses";

const Admin = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // overview, poses
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoses: 0,
    totalBoards: 0,
    databaseMode: "Unknown"
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Poses Manager state
  const [poses, setPoses] = useState([]);
  const [loadingPoses, setLoadingPoses] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Add Pose Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPose, setNewPose] = useState({
    name: "",
    description: "",
    category: "wedding",
    difficulty: "Beginner",
    peopleCount: "Couple",
    locationType: "Both",
    style: "Romantic",
    cameraAngle: "Eye level",
    lightingSuggestion: "Golden hour",
    tags: "",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=533&fit=crop",
    lens: "85mm",
    aperture: "f/2.2",
    bestLight: "Golden hour",
    outfit: "Traditional wear",
    steps: ["Stand close together", "Gently hold hands", "Look at each other and smile"]
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user.role === "admin") {
      fetchStats();
      fetchPoses();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      showToast("Failed to load statistics", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPoses = async () => {
    setLoadingPoses(true);
    try {
      const res = await api.get("/poses?limit=100");
      setPoses(res.data.poses || []);
    } catch (err) {
      console.error("Failed to load admin poses:", err);
      showToast("Failed to fetch poses list", "error");
    } finally {
      setLoadingPoses(false);
    }
  };

  // Auth Guards
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-40 bg-[#FAFAF8] min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleToggleTrending = async (poseId) => {
    try {
      const res = await api.put(`/admin/poses/${poseId}/trending`);
      const updatedPose = res.data;

      // Update local state
      setPoses((prev) =>
        prev.map((p) => ((p.id || p._id) === poseId ? { ...p, trending: updatedPose.trending } : p))
      );
      showToast(
        `Pose ${updatedPose.trending ? "featured in trending feed" : "removed from trending"}`,
        "success"
      );
    } catch (err) {
      console.error("Failed to update trending status:", err);
      showToast("Error updating trending status", "error");
    }
  };

  const handleDeletePose = async (poseId) => {
    if (!window.confirm("Are you sure you want to delete this pose? This action cannot be undone.")) return;

    try {
      await api.delete(`/admin/poses/${poseId}`);
      setPoses((prev) => prev.filter((p) => (p.id || p._id) !== poseId));
      setStats((prev) => ({ ...prev, totalPoses: Math.max(0, prev.totalPoses - 1) }));
      showToast("Pose successfully deleted", "success");
    } catch (err) {
      console.error("Failed to delete pose:", err);
      showToast("Failed to delete pose", "error");
    }
  };

  const handleAddPoseStepChange = (index, value) => {
    const updated = [...newPose.steps];
    updated[index] = value;
    setNewPose((prev) => ({ ...prev, steps: updated }));
  };

  const addPoseStepField = () => {
    setNewPose((prev) => ({ ...prev, steps: [...prev.steps, ""] }));
  };

  const removePoseStepField = (index) => {
    if (newPose.steps.length <= 1) return;
    const updated = newPose.steps.filter((_, i) => i !== index);
    setNewPose((prev) => ({ ...prev, steps: updated }));
  };

  const handleAddPoseSubmit = async (e) => {
    e.preventDefault();
    if (!newPose.name || !newPose.image) {
      return showToast("Please fill in Pose Name and Image URL", "info");
    }

    // Format fields for route payload
    const formattedPayload = {
      name: newPose.name,
      description: newPose.description,
      category: newPose.category,
      difficulty: newPose.difficulty,
      peopleCount: newPose.peopleCount,
      locationType: newPose.locationType,
      style: newPose.style,
      cameraAngle: newPose.cameraAngle,
      lightingSuggestion: newPose.lightingSuggestion,
      tags: newPose.tags.split(",").map((t) => t.trim()).filter(Boolean),
      steps: newPose.steps.map((text, idx) => ({
        label: `Step ${idx + 1}`,
        description: text
      })),
      bestSettings: {
        lens: newPose.lens,
        aperture: newPose.aperture,
        light: newPose.bestLight,
        outfit: newPose.outfit
      },
      image: newPose.image
    };

    try {
      const res = await api.post("/admin/poses", formattedPayload);
      const addedPose = res.data;

      setPoses((prev) => [addedPose, ...prev]);
      setStats((prev) => ({ ...prev, totalPoses: prev.totalPoses + 1 }));
      showToast("New photoshoot pose successfully added!", "success");
      setIsAddModalOpen(false);
      
      // Reset form
      setNewPose({
        name: "",
        description: "",
        category: "wedding",
        difficulty: "Beginner",
        peopleCount: "Couple",
        locationType: "Both",
        style: "Romantic",
        cameraAngle: "Eye level",
        lightingSuggestion: "Golden hour",
        tags: "",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=533&fit=crop",
        lens: "85mm",
        aperture: "f/2.2",
        bestLight: "Golden hour",
        outfit: "Traditional wear",
        steps: ["Stand close together", "Gently hold hands", "Look at each other and smile"]
      });
    } catch (err) {
      console.error("Failed to create pose:", err);
      showToast("Error creating pose on server", "error");
    }
  };

  const filteredPoses = poses.filter((pose) => {
    const matchesSearch =
      pose.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pose.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pose.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || pose.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO title="System Admin Panel — PoseVerse" description="Internal PoseVerse system moderator dashboard." />

      <div className="bg-[#FAFAF8] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            <div className="space-y-1">
              <h1 className="font-serif text-3xl font-bold text-textPrimary flex items-center gap-2">
                <Shield className="text-[#D85A30]" size={28} />
                Admin Console
              </h1>
              <p className="text-sm text-textSecondary font-light">
                Manage metadata, feature tags, and moderation controls.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2.5 rounded-sm shadow-sm flex items-center gap-2 transition-colors shrink-0"
            >
              <Plus size={16} />
              Add Custom Pose
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border space-x-6 text-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-textSecondary hover:text-primary"
              }`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab("poses")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "poses" ? "text-primary border-b-2 border-primary" : "text-textSecondary hover:text-primary"
              }`}
            >
              Poses Manager ({filteredPoses.length})
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {/* Stat 1 */}
                <div className="bg-white border border-border p-6 rounded-sm shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-textMuted">
                    <span className="text-xs uppercase font-bold tracking-wider">Total Poses</span>
                    <Layout size={20} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-textPrimary">
                    {loadingStats ? "..." : stats.totalPoses}
                  </h3>
                </div>

                {/* Stat 2 */}
                <div className="bg-white border border-border p-6 rounded-sm shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-textMuted">
                    <span className="text-xs uppercase font-bold tracking-wider">Total Users</span>
                    <Users size={20} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-textPrimary">
                    {loadingStats ? "..." : stats.totalUsers}
                  </h3>
                </div>

                {/* Stat 3 */}
                <div className="bg-white border border-border p-6 rounded-sm shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-textMuted">
                    <span className="text-xs uppercase font-bold tracking-wider">Boards Created</span>
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-textPrimary">
                    {loadingStats ? "..." : stats.totalBoards}
                  </h3>
                </div>

                {/* Stat 4 */}
                <div className="bg-white border border-border p-6 rounded-sm shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-textMuted">
                    <span className="text-xs uppercase font-bold tracking-wider">DB Mode</span>
                    <Database size={20} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#D85A30] truncate">
                    {loadingStats ? "..." : stats.databaseMode}
                  </h3>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="poses"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 bg-white border border-border p-6 rounded-sm shadow-sm"
              >
                {/* Search / Filter bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
                    <input
                      type="text"
                      placeholder="Search poses by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 pl-9 pr-4 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder-textMuted"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-textSecondary uppercase">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 text-sm text-textPrimary focus:outline-none focus:border-primary"
                    >
                      <option value="all">All Occasions</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                {loadingPoses ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-sm text-textSecondary">Loading library list...</p>
                  </div>
                ) : filteredPoses.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-border rounded-sm">
                    <p className="text-sm text-textMuted">No poses match current filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-[#FAFAF8] text-textSecondary font-semibold uppercase text-xs">
                          <th className="py-3 px-4">Preview</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">People</th>
                          <th className="py-3 px-4">Trending</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredPoses.map((pose) => {
                          const poseId = pose.id || pose._id;
                          return (
                            <tr key={poseId} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4">
                                <img
                                  src={pose.image}
                                  alt={pose.name}
                                  className="w-12 h-16 object-cover rounded-sm border border-border"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-textPrimary block">{pose.name}</span>
                                <span className="text-[10px] text-textMuted font-mono uppercase">{poseId}</span>
                              </td>
                              <td className="py-3 px-4 text-textSecondary capitalize">{pose.category}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border border-border bg-[#FAFAF8] text-textSecondary">
                                  {pose.difficulty}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-textSecondary">{pose.peopleCount || "Couple"}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleTrending(poseId)}
                                  className={`p-1.5 rounded-sm transition-colors ${
                                    pose.trending
                                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                                      : "bg-[#FAFAF8] text-textMuted border border-border hover:bg-amber-50 hover:text-amber-600"
                                  }`}
                                  title="Toggle Trending status"
                                >
                                  <TrendingUp size={16} />
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeletePose(poseId)}
                                  className="p-1.5 rounded-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                                  title="Delete Pose"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Custom Pose Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-border w-full max-w-3xl rounded-sm shadow-xl overflow-hidden max-h-[90vh] flex flex-col font-sans"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-[#FAFAF8]">
                <h3 className="font-serif text-lg font-bold text-textPrimary flex items-center gap-1.5">
                  <Plus size={20} className="text-primary" />
                  Add Custom Pose Guide
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-textMuted hover:text-textPrimary rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Scroll Body */}
              <form onSubmit={handleAddPoseSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Pose Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Whispering Sweet Nothings"
                      value={newPose.name}
                      onChange={(e) => setNewPose((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary placeholder-textMuted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Category / Occasion *
                    </label>
                    <select
                      value={newPose.category}
                      onChange={(e) => setNewPose((p) => ({ ...p, category: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Difficulty *
                    </label>
                    <select
                      value={newPose.difficulty}
                      onChange={(e) => setNewPose((p) => ({ ...p, difficulty: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Easy">Easy</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Subject Type
                    </label>
                    <select
                      value={newPose.peopleCount}
                      onChange={(e) => setNewPose((p) => ({ ...p, peopleCount: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary"
                    >
                      <option value="Solo">Solo</option>
                      <option value="Couple">Couple</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Location Type
                    </label>
                    <select
                      value={newPose.locationType}
                      onChange={(e) => setNewPose((p) => ({ ...p, locationType: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary"
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={newPose.image}
                      onChange={(e) => setNewPose((p) => ({ ...p, image: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary placeholder-textMuted"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                    Description / Mood Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how the pose feels and the visual effect it captures..."
                    value={newPose.description}
                    onChange={(e) => setNewPose((p) => ({ ...p, description: e.target.value }))}
                    className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary placeholder-textMuted"
                  />
                </div>

                <hr className="border-border" />

                {/* Technical Settings */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-textPrimary mb-3">Best Camera Settings</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Lens</label>
                      <input
                        type="text"
                        placeholder="85mm"
                        value={newPose.lens}
                        onChange={(e) => setNewPose((p) => ({ ...p, lens: e.target.value }))}
                        className="w-full bg-[#FAFAF8] border border-border rounded-sm py-1.5 px-3.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Aperture</label>
                      <input
                        type="text"
                        placeholder="f/2.2"
                        value={newPose.aperture}
                        onChange={(e) => setNewPose((p) => ({ ...p, aperture: e.target.value }))}
                        className="w-full bg-[#FAFAF8] border border-border rounded-sm py-1.5 px-3.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Best Light</label>
                      <input
                        type="text"
                        placeholder="Golden hour"
                        value={newPose.bestLight}
                        onChange={(e) => setNewPose((p) => ({ ...p, bestLight: e.target.value }))}
                        className="w-full bg-[#FAFAF8] border border-border rounded-sm py-1.5 px-3.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Outfit</label>
                      <input
                        type="text"
                        placeholder="Traditional wear"
                        value={newPose.outfit}
                        onChange={(e) => setNewPose((p) => ({ ...p, outfit: e.target.value }))}
                        className="w-full bg-[#FAFAF8] border border-border rounded-sm py-1.5 px-3.5 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Extra Guidance Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Camera Angle / Direction
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eye level, slightly offset"
                      value={newPose.cameraAngle}
                      onChange={(e) => setNewPose((p) => ({ ...p, cameraAngle: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Romantic, Close Up, Saree"
                      value={newPose.tags}
                      onChange={(e) => setNewPose((p) => ({ ...p, tags: e.target.value }))}
                      className="w-full bg-[#FAFAF8] border border-border rounded-sm py-2 px-3 focus:outline-none focus:border-primary placeholder-textMuted"
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* Step Guide list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-serif text-sm font-bold text-textPrimary">Step-by-Step Directions</h4>
                    <button
                      type="button"
                      onClick={addPoseStepField}
                      className="text-primary hover:text-primaryDark text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newPose.steps.map((stepText, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-textMuted shrink-0 w-16">Step {idx + 1}:</span>
                        <input
                          type="text"
                          required
                          value={stepText}
                          onChange={(e) => handleAddPoseStepChange(idx, e.target.value)}
                          placeholder="Instructions (e.g. Tilt chin slightly down)"
                          className="grow bg-[#FAFAF8] border border-border rounded-sm py-1.5 px-3 focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          disabled={newPose.steps.length <= 1}
                          onClick={() => removePoseStepField(idx)}
                          className="p-1.5 rounded-sm bg-gray-50 border border-border text-textMuted hover:text-red-500 disabled:opacity-40"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="py-2.5 px-5 rounded-sm text-xs border border-border hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-sm text-xs bg-primary hover:bg-primaryDark text-white font-semibold shadow-sm transition-colors"
                  >
                    Submit Pose
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Admin;
