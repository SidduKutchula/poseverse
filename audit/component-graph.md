# Component Graph

This file traces the React component hierarchy and lists components that are dead or never imported.

## Component Import Hierarchy (Mermaid Diagram)

```mermaid
graph TD
  PoseCard["PoseCard"] --> AIWizard["AIWizard"]
  PoseCard["PoseCard"] --> MoodBoard["MoodBoard"]
  PoseImage["PoseImage"] --> CategoryCard["CategoryCard"]
  PoseImage["PoseImage"] --> PoseCard["PoseCard"]
  DifficultyBadge["DifficultyBadge"] --> PoseCard["PoseCard"]
  TagPill["TagPill"] --> PoseCard["PoseCard"]
  AIWizard["AIWizard"] --> AIRecommend["AIRecommend"]
  SEO["SEO"] --> Admin["Admin"]
  PoseCard["PoseCard"] --> Explore["Explore"]
  FilterSidebar["FilterSidebar"] --> Explore["Explore"]
  Shimmer["Shimmer"] --> Explore["Explore"]
  SEO["SEO"] --> Explore["Explore"]
  PoseImage["PoseImage"] --> Explore["Explore"]
  CategoryCard["CategoryCard"] --> Home["Home"]
  PoseCard["PoseCard"] --> Home["Home"]
  SEO["SEO"] --> Home["Home"]
  SEO["SEO"] --> MoodBoard["MoodBoard"]
  MoodBoard["MoodBoard"] --> MoodBoard["MoodBoard"]
  PoseImage["PoseImage"] --> PoseDetail["PoseDetail"]
  DifficultyBadge["DifficultyBadge"] --> PoseDetail["PoseDetail"]
  TagPill["TagPill"] --> PoseDetail["PoseDetail"]
  StepGuide["StepGuide"] --> PoseDetail["PoseDetail"]
  SEO["SEO"] --> PoseDetail["PoseDetail"]
  SEO["SEO"] --> Profile["Profile"]
```

## Dead or Unused Components

Components that have an imported-by count of 0 (excluding pages / routing layout endpoints):

| Component Name | File Path |
| :--- | :--- |
| None | All components are actively imported! |
