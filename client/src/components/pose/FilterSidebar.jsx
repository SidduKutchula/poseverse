import React from "react";
import { Check, X } from "lucide-react";
import { CATEGORIES } from "../../data/poses";

const FilterCheckbox = ({ label, checked, onChange }) => (
  <label
    onClick={onChange}
    className="flex items-center gap-2.5 cursor-pointer group py-1 select-none"
  >
    <div
      className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-all duration-150 shrink-0 ${
        checked
          ? "bg-primary border-primary"
          : "bg-white border-border group-hover:border-primary"
      }`}
    >
      {checked && <Check size={10} className="text-white" strokeWidth={4} />}
    </div>
    <span className={`text-sm transition-colors duration-150 ${checked ? "text-textPrimary font-medium" : "text-textSecondary group-hover:text-textPrimary"}`}>
      {label}
    </span>
  </label>
);

const FilterSidebar = ({ filters, setFilters, onClose, totalResults }) => {
  const categoriesList = CATEGORIES;
  
  const shootTypesList = ["Indoor", "Outdoor", "Both"];
  const peopleList = ["Solo", "Couple", "Group"];
  const difficultyList = ["All", "Beginner", "Easy", "Intermediate", "Pro"];
  
  const stylesList = ["Traditional", "Modern", "Cinematic", "Candid"];
  const lightingList = ["Natural", "Studio", "Golden Hour", "Night"];

  const handleCategoryToggle = (slug) => {
    const isSelected = filters.categories.includes(slug);
    const updated = isSelected
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    setFilters((prev) => ({ ...prev, categories: updated }));
  };

  const handleCheckboxToggle = (field, value) => {
    const list = filters[field] || [];
    const isSelected = list.includes(value);
    const updated = isSelected
      ? list.filter((v) => v !== value)
      : [...list, value];
    setFilters((prev) => ({ ...prev, [field]: updated }));
  };

  const handleRadioSelect = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearAll = () => {
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
  };

  return (
    <aside className="w-full bg-white flex flex-col h-full border border-border rounded-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border bg-[#FAFAF8]">
        <div>
          <h2 className="font-serif text-lg font-bold text-textPrimary">Filters</h2>
          <p className="text-xs text-textMuted mt-0.5">{totalResults} poses found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary hover:text-primaryDark transition-colors"
          >
            Clear All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-full hover:bg-border"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filters */}
      <div className="p-4 space-y-6 overflow-y-auto flex-grow max-h-[70vh] md:max-h-[calc(100vh-14rem)]">
        {/* Occasion / Category section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            Occasion
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {categoriesList.map((cat) => (
              <FilterCheckbox
                key={cat.slug}
                label={cat.label || cat.name}
                checked={filters.categories.includes(cat.slug)}
                onChange={() => handleCategoryToggle(cat.slug)}
              />
            ))}
          </div>
        </div>

        {/* Shoot Type Section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            Shoot Type
          </h3>
          <div className="flex flex-col gap-2">
            {shootTypesList.map((item) => (
              <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="shootType"
                  value={item}
                  checked={filters.shootType === item || (item === "Both" && filters.shootType === "")}
                  onChange={() => handleRadioSelect("shootType", item === "Both" ? "" : item)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span className={`text-sm transition-colors ${
                  (filters.shootType === item || (item === "Both" && filters.shootType === "")) 
                    ? "text-textPrimary font-medium" 
                    : "text-textSecondary group-hover:text-textPrimary"
                }`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* People Count section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            People
          </h3>
          <div className="flex flex-col gap-2">
            {peopleList.map((item) => (
              <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="people"
                  value={item}
                  checked={filters.people === item}
                  onChange={() => handleRadioSelect("people", item)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <span className={`text-sm transition-colors ${
                  filters.people === item 
                    ? "text-textPrimary font-medium" 
                    : "text-textSecondary group-hover:text-textPrimary"
                }`}>
                  {item}
                </span>
              </label>
            ))}
            {filters.people && (
              <button
                onClick={() => handleRadioSelect("people", "")}
                className="text-left text-xs font-medium text-primary hover:underline mt-1"
              >
                Clear People selection
              </button>
            )}
          </div>
        </div>

        {/* Style section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            Style
          </h3>
          <div className="space-y-1">
            {stylesList.map((style) => (
              <FilterCheckbox
                key={style}
                label={style}
                checked={filters.styles.includes(style)}
                onChange={() => handleCheckboxToggle("styles", style)}
              />
            ))}
          </div>
        </div>

        {/* Difficulty section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            Difficulty
          </h3>
          <div className="flex flex-wrap gap-2">
            {difficultyList.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleRadioSelect("difficulty", level)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                  filters.difficulty === level
                    ? "bg-primaryLight border-primary text-primaryDark"
                    : "bg-white border-border text-textSecondary hover:border-primaryMid hover:text-textPrimary"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Lighting section */}
        <div>
          <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">
            Lighting
          </h3>
          <div className="space-y-1">
            {lightingList.map((light) => (
              <FilterCheckbox
                key={light}
                label={light}
                checked={filters.lighting.includes(light)}
                onChange={() => handleCheckboxToggle("lighting", light)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
