import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface FilterState {
  search: string;
  occasions: string[];
  shootType: string;
  people: string;
  styles: string[];
  difficulty: string;
  lighting: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
}

const occasions = [
  "Wedding",
  "Pre-Wedding",
  "Maternity",
  "Birthday",
  "Traditional",
  "Couple",
  "Kids",
  "Graduation",
  "Fashion",
  "Festival",
  "Outdoor",
  "Reels",
];

const styles = ["Traditional", "Modern", "Cinematic", "Candid"];
const lighting = ["Natural", "Studio", "Golden Hour", "Night"];

export function FilterSidebar({
  filters,
  onFiltersChange,
  onApply,
  onClear,
}: FilterSidebarProps) {
  const [openAccordions, setOpenAccordions] = useState({
    occasion: true,
    shootType: true,
    people: true,
    style: true,
    difficulty: true,
    lighting: true,
  });

  const toggleAccordion = (key: keyof typeof openAccordions) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleOccasionChange = (occasion: string, checked: boolean) => {
    const newOccasions = checked
      ? [...filters.occasions, occasion]
      : filters.occasions.filter((o) => o !== occasion);
    onFiltersChange({ ...filters, occasions: newOccasions });
  };

  const handleShootTypeChange = (value: string) => {
    onFiltersChange({ ...filters, shootType: value });
  };

  const handlePeopleChange = (value: string) => {
    onFiltersChange({ ...filters, people: value });
  };

  const handleStyleChange = (style: string, checked: boolean) => {
    const newStyles = checked
      ? [...filters.styles, style]
      : filters.styles.filter((s) => s !== style);
    onFiltersChange({ ...filters, styles: newStyles });
  };

  const handleDifficultyChange = (value: string) => {
    onFiltersChange({ ...filters, difficulty: value });
  };

  const handleLightingChange = (light: string, checked: boolean) => {
    const newLighting = checked
      ? [...filters.lighting, light]
      : filters.lighting.filter((l) => l !== light);
    onFiltersChange({ ...filters, lighting: newLighting });
  };

  const hasActiveFilters =
    filters.search ||
    filters.occasions.length > 0 ||
    filters.shootType ||
    filters.people ||
    filters.styles.length > 0 ||
    filters.difficulty ||
    filters.lighting.length > 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* Search */}
      <div>
        <Input
          placeholder="Search poses..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Occasion Filter */}
      <Collapsible open={openAccordions.occasion}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("occasion")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          Occasion
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.occasion ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {occasions.map((occasion) => (
            <div key={occasion} className="flex items-center gap-2">
              <Checkbox
                id={`occasion-${occasion}`}
                checked={filters.occasions.includes(occasion)}
                onCheckedChange={(checked) =>
                  handleOccasionChange(occasion, checked as boolean)
                }
              />
              <Label
                htmlFor={`occasion-${occasion}`}
                className="text-sm font-normal cursor-pointer"
              >
                {occasion}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Shoot Type Filter */}
      <Collapsible open={openAccordions.shootType}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("shootType")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          Shoot Type
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.shootType ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <RadioGroup value={filters.shootType} onValueChange={handleShootTypeChange}>
            {["Indoor", "Outdoor", "Both"].map((type) => (
              <div key={type} className="flex items-center gap-2">
                <RadioGroupItem value={type} id={`shootType-${type}`} />
                <Label
                  htmlFor={`shootType-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* People Filter */}
      <Collapsible open={openAccordions.people}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("people")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          People
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.people ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <RadioGroup value={filters.people} onValueChange={handlePeopleChange}>
            {["Solo", "Couple", "Group"].map((type) => (
              <div key={type} className="flex items-center gap-2">
                <RadioGroupItem value={type} id={`people-${type}`} />
                <Label
                  htmlFor={`people-${type}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Style Filter */}
      <Collapsible open={openAccordions.style}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("style")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          Style
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.style ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {styles.map((style) => (
            <div key={style} className="flex items-center gap-2">
              <Checkbox
                id={`style-${style}`}
                checked={filters.styles.includes(style)}
                onCheckedChange={(checked) =>
                  handleStyleChange(style, checked as boolean)
                }
              />
              <Label
                htmlFor={`style-${style}`}
                className="text-sm font-normal cursor-pointer"
              >
                {style}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Difficulty Filter */}
      <Collapsible open={openAccordions.difficulty}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("difficulty")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          Difficulty
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.difficulty ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <RadioGroup value={filters.difficulty} onValueChange={handleDifficultyChange}>
            {["All", "Beginner", "Easy", "Pro"].map((level) => (
              <div key={level} className="flex items-center gap-2">
                <RadioGroupItem value={level} id={`difficulty-${level}`} />
                <Label
                  htmlFor={`difficulty-${level}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {level}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>

      {/* Lighting Filter */}
      <Collapsible open={openAccordions.lighting}>
        <CollapsibleTrigger
          onClick={() => toggleAccordion("lighting")}
          className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary"
        >
          Lighting
          <ChevronDown
            size={16}
            className={`transition-transform ${
              openAccordions.lighting ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {lighting.map((light) => (
            <div key={light} className="flex items-center gap-2">
              <Checkbox
                id={`lighting-${light}`}
                checked={filters.lighting.includes(light)}
                onCheckedChange={(checked) =>
                  handleLightingChange(light, checked as boolean)
                }
              />
              <Label
                htmlFor={`lighting-${light}`}
                className="text-sm font-normal cursor-pointer"
              >
                {light}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Action Buttons */}
      <div className="space-y-2 border-t border-border pt-4">
        <Button
          onClick={onApply}
          className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
        >
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X size={16} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
