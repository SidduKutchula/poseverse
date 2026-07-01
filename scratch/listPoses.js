import { POSES } from "../client/src/data/poses.js";

console.log(`Total Poses: ${POSES.length}`);
POSES.forEach((p) => {
  console.log(`- ${p.id}: "${p.name}" (category: ${p.category}, verified: ${p.imageVerified})`);
});
