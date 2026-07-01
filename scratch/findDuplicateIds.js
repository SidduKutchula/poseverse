import { POSES } from "../client/src/data/poses.js";

const seen = {};
let duplicates = 0;
POSES.forEach((p) => {
  if (seen[p.id]) {
    console.log(`❌ Duplicate ID found: ${p.id}`);
    duplicates++;
  }
  seen[p.id] = true;
});

if (duplicates === 0) {
  console.log("✅ No duplicate IDs found in poses.js catalog!");
}
