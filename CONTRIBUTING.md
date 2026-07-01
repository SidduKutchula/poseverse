# Contributing to PoseVerse — Pose Data Verification Guidelines

Every photo displayed in the PoseVerse catalog must be verified by a human for content and semantic accuracy before it can be flagged as active. AI-generated image guesses and raw automated lookups are not permitted.

---

## 📋 The Verification Checklist

When adding new poses, set `imageVerified: false` by default. Open the photo URL in a browser and check against all five verification conditions. Only set `imageVerified: true` once you have manual confirmation of all of the following:

1. **People Count (`peopleCount`)**: 
   - Verify the subject count in the photo (Solo, Couple, or Group) matches the database tag. For example, couple poses must display exactly two people.
2. **Clothing & Category Styling**: 
   - Ensure clothing matches the occasion culture (e.g. saree or sherwani for *Traditional*, wedding dress or suit for *Wedding*, cap/gown for *Graduation*, maternity dress for *Maternity*).
3. **Posing Action & Silhouette**: 
   - Confirm the visible pose matches the specific pose name. For instance, if the pose is named "Forehead Kiss", the photo must clearly show a forehead kiss action, not a generic hug or cheek kiss.
4. **Setting & Location (`locationType`)**: 
   - Confirm the setting matches the indoor/outdoor designation (e.g., studio background for indoor, beach/garden for outdoor).
5. **Lighting Configuration**: 
   - Verify the image lighting style matches the lighting tags (e.g., warm rim lighting for *Golden Hour*, dark low-light setups for *Night Photography*, controlled studio shadows for *Studio*).

---

## 🛠️ Validation Script

Before committing any updates to `poses.js`, execute the structural verification script to capture any schema drift:

```bash
node server/scripts/validatePoses.js
```

This checks:
- Category slug presence
- Step count equals exactly 6 for verified poses
- Minimum 3 thumbnail links for verified poses
- Matching tag arrays containing `categoryLabel`
- Presence of main image properties
