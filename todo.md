# PoseVerse TODO

## Design System & Foundation
- [x] Configure Tailwind CSS with custom design tokens (colors, typography, spacing)
- [x] Import Google Fonts (DM Serif Display, DM Sans)
- [x] Create global CSS variables and theme system
- [x] Set up color palette (terracotta primary, muted neutrals, gold accents)
- [x] Define shadow system (soft shadows only)
- [x] Configure border radius tokens (8px, 12px, 16px)

## Core Components
- [x] PoseCard component (image, difficulty badge, save button, hover overlay)
- [x] ImageShimmer/Skeleton loader component (built into PoseCard)
- [x] CategoryCard component (image with gradient overlay, category name)
- [x] FilterSidebar component (accordion filters, apply/clear buttons)
- [x] Toast notification system (success, error, info states)
- [x] Navigation/Navbar component (sticky, responsive mobile menu)
- [x] Footer component (links, social icons, tagline)

## Pages - Public Features
- [x] Home/Landing page (hero section, stats bar, category grid, how-it-works, footer)
- [x] Explore page (sidebar filters, masonry grid, sort/view toggle)
- [x] Pose Detail page (image gallery, step-by-step guide, camera settings, related poses)
- [x] AI Recommend page (5-step wizard, loading state, results grid with match scores)
- [x] 404/NotFound page (exists from template)

## Pages - Authentication
- [x] Login page (Google OAuth, email/password form)
- [x] Signup page (Google OAuth, email/password form)
- [x] Auth flow integration (OAuth callback, session management via template)

## Pages - User Features
- [x] Mood Board page (protected route, grid with save/share buttons)
- [x] Public Mood Board share view (read-only, no auth required)
- [x] User Profile page (basic profile info, logout)

## Database Schema & Backend (via Mongoose & MongoDB)
- [x] Define Pose schema (name, description, category, difficulty, metadata, etc.)
- [x] Define Category schema (name, slug, unsplashKeyword, poseCount, icon)
- [x] Define MoodBoard schema (userId, poses array, shareToken, isPublic)
- [x] Extend User schema (add savedPoses, moodBoards relations)
- [x] Create seed data (36 poses across 12 categories)
- [x] Implement robust in-memory offline fallback datasets for all data features

## Backend API Endpoints (via REST / Express)
- [x] GET /api/poses (with filtering: category, difficulty, style, location, people, search, sort, page, limit)
- [x] GET /api/poses/:id (single pose detail)
- [x] GET /api/categories (list all categories)
- [x] POST /api/ai/recommend (OpenAI integration with local offline matching fallback)
- [x] GET /api/moodboard (protected - get user's mood board)
- [x] POST /api/moodboard/add (protected - add pose to mood board)
- [x] POST /api/moodboard/reorder (protected - reorder poses in mood board)
- [x] DELETE /api/moodboard/:poseId (protected - remove pose from mood board)
- [x] GET /api/moodboard/share/:token (public - get shared mood board by token)

## Frontend-Backend Integration
- [x] Wire Explore page to backend poses API
- [x] Wire Pose Detail page to backend pose/:id API
- [x] Wire AI Recommend page to OpenAI integration
- [x] Wire Mood Board to backend moodboard API
- [x] Implement auth flow (login, signup, logout)
- [x] Add protected route guards for authenticated pages

## Image & Media
- [x] Set up Unsplash Source API integration for pose reference images (via URLs)
- [x] Implement image lazy loading and shimmer effect
- [x] Configure image optimization (aspect ratios, object-fit)
- [ ] Set up on-demand AI image generation for custom pose references (future enhancement)

## Animations & Interactions
- [x] Page transition animations (Framer Motion)
- [x] Card hover animations (translateY, shadow)
- [x] Image load shimmer animations
- [x] Filter apply stagger animations
- [x] Save heart scale animation
- [x] Step wizard slide animations
- [x] AI loading typewriter animation
- [x] Remove from board fade-out animation
- [x] Smooth scroll behavior

## Mobile Responsiveness
- [x] Mobile-first design for all pages
- [x] Responsive breakpoints (640px, 768px, 1024px)
- [ ] Sidebar → bottom sheet drawer on mobile (Explore page)
- [x] Pose grid responsive columns (1 → 2 → 3)
- [x] Hero section mobile typography
- [x] Touch-friendly button sizes and spacing
- [x] Mobile navigation hamburger menu

## Testing
- [ ] Write vitest tests for PoseCard component
- [ ] Write vitest tests for CategoryCard component
- [ ] Write vitest tests for FilterSidebar component
- [x] Write vitest tests for authentication controllers
- [x] Write vitest tests for service layers (Pose, User, MoodBoard)
- [x] Write vitest tests for Mongoose plugins (soft delete)

## Deployment & Polish
- [x] Add toast notification system for user feedback
- [x] Performance optimization (code splitting, lazy loading)
- [ ] SEO optimization (meta tags, structured data)
- [ ] Accessibility audit (WCAG compliance, keyboard navigation)
- [ ] Cross-browser testing
- [ ] Final checkpoint and deployment

## Current Status
**Phase 3 Complete**: Database schemas, backend REST APIs (with local fallbacks), and frontend-backend integration fully implemented and tested.
**Next**: Additional interactive animations, mobile filters bottom drawer, and automated visual testing.

## Future Enhancements (Out of Scope)
- [ ] On-demand AI image generation for custom pose references
- [ ] Advanced analytics (trending poses, user behavior)
- [ ] Social sharing and pose recommendations
- [ ] Photographer portfolio integration
- [ ] Advanced mood board collaboration features
- [ ] Drag-to-reorder mood board poses (react-beautiful-dnd)
- [ ] Infinite scroll pagination on Explore page
