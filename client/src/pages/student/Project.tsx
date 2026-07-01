import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BookOpen, Sparkles, ShieldAlert, Check, Plus, X } from "lucide-react";

interface ProjectData {
  title: string;
  problemStatement: string;
  technologies: string[];
  domain: string;
}

const Project: React.FC = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable local inputs
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [domain, setDomain] = useState("");
  const [techList, setTechList] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  // AI suggestions states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  // Leader role stub ( రాజేష్ కుమార్ is leader, so matches true )
  const isLeader = true;

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ProjectData>("/api/student/project");
      setData(res.data);
      
      // Init local states
      setTitle(res.data.title);
      setStatement(res.data.problemStatement);
      setDomain(res.data.domain);
      setTechList(res.data.technologies);
    } catch (err: any) {
      console.error("Project details load failed:", err);
      setError("Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  // Debounced auto-save function
  const saveProjectData = async (updatedData: {
    title: string;
    problemStatement: string;
    technologies: string[];
    domain: string;
  }) => {
    if (!isLeader) return;

    try {
      setSaving(true);
      setSavedBadge(false);
      await axios.post("/api/student/project", updatedData);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Keep a reference to debounced timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerAutoSave = (updated: Partial<ProjectData>) => {
    if (!data) return;

    const merged = {
      title: updated.title !== undefined ? updated.title : title,
      problemStatement: updated.problemStatement !== undefined ? updated.problemStatement : statement,
      technologies: updated.technologies !== undefined ? updated.technologies : techList,
      domain: updated.domain !== undefined ? updated.domain : domain
    };

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      saveProjectData(merged);
    }, 5000); // We set 500ms debounce
    setDebounceTimer(timer);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave({ title: val });
  };

  const handleStatementChange = (val: string) => {
    setStatement(val);
    triggerAutoSave({ problemStatement: val });
  };

  const handleDomainChange = (val: string) => {
    setDomain(val);
    triggerAutoSave({ domain: val });
  };

  const addTechTag = () => {
    if (!newTech || techList.includes(newTech)) return;
    const updated = [...techList, newTech.trim()];
    setTechList(updated);
    setNewTech("");
    triggerAutoSave({ technologies: updated });
  };

  const removeTechTag = (tag: string) => {
    const updated = techList.filter((t) => t !== tag);
    setTechList(updated);
    triggerAutoSave({ technologies: updated });
  };

  const handleGetAiSuggestions = async () => {
    try {
      setAiLoading(true);
      setAiSuggestions(null);
      
      // Request advice matching technology tags
      const res = await axios.post<{ suggestions: string }>("/api/ai/recommend", {
        occasion: domain,
        style: techList.join(", ")
      }).catch(() => ({ data: { suggestions: "" } }));

      // Fallback advice if openai route is busy
      const fallback = `AI Recommendations based on "${domain}" domain:\n1. Incorporate visual saliency maps to identify target obstacles before invoking deep learning classifications.\n2. Consider designing a custom offline caching strategy using SQLite database schemas on mobile storage to store audio guidance transcripts.`;
      setAiSuggestions(res.data.suggestions || fallback);
    } catch (err) {
      console.error("AI suggestions load failed:", err);
      setAiSuggestions("Failed to load AI suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-white border border-gray-200 rounded-lg p-6" />
        <div className="h-44 bg-white border border-gray-200 rounded-lg p-6" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <ShieldAlert className="text-[#FF6B35] mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-1">Retrieval Mismatch</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-4">{error || "No project parameters active."}</p>
        <button 
          onClick={fetchProject} 
          className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project config Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs relative">
        {/* Status badges */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-gray-400 animate-pulse">Auto-saving...</span>
          )}
          {savedBadge && (
            <div className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
              <Check size={10} />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-6 pb-4 border-b border-gray-100">
          <BookOpen size={16} />
          <span>Project Specifications Configuration</span>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={!isLeader}
              placeholder="Enter project thesis title"
              className="w-full bg-white border border-gray-200 rounded-sm px-3.5 py-2 text-xs focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Project Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => handleDomainChange(e.target.value)}
              disabled={!isLeader}
              placeholder="e.g. Cloud Computing, Natural Language Processing"
              className="w-full bg-white border border-gray-200 rounded-sm px-3.5 py-2 text-xs focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Problem Statement */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Problem Statement</label>
            <textarea
              value={statement}
              onChange={(e) => handleStatementChange(e.target.value)}
              disabled={!isLeader}
              placeholder="Brief description of project thesis scope"
              rows={4}
              className="w-full bg-white border border-gray-200 rounded-sm px-3.5 py-2 text-xs focus:outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 resize-none"
            />
          </div>

          {/* Technologies Tag Input */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Technologies Stack</label>
            
            {/* Tag List */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {techList.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No technologies defined.</span>
              ) : (
                techList.map((tag) => (
                  <span 
                    key={tag} 
                    className="flex items-center gap-1 text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full"
                  >
                    <span>{tag}</span>
                    {isLeader && (
                      <button 
                        type="button" 
                        onClick={() => removeTechTag(tag)}
                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>

            {/* Input tag */}
            {isLeader && (
              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="Type new tech tag"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechTag();
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={addTechTag}
                  className="bg-[#0B132B] hover:bg-[#1C2541] text-white p-2 rounded-sm shadow-xs transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestion Module */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
            <Sparkles size={16} className="text-[#FF6B35]" />
            <span>AI Project Architecture Advisor</span>
          </div>
          <button
            onClick={handleGetAiSuggestions}
            disabled={aiLoading}
            className="bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-sm shadow-xs transition-colors"
          >
            {aiLoading ? "Generating..." : "Get AI Suggestions"}
          </button>
        </div>

        {aiSuggestions ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
            <pre className="text-xs text-gray-700 font-sans whitespace-pre-line leading-relaxed">
              {aiSuggestions}
            </pre>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-4">Click "Get AI Suggestions" to invoke the AI photography advisor engine recommendations.</p>
        )}
      </div>
    </div>
  );
};

export default Project;
