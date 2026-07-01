import axios from "axios";
import { POSES } from "../client/src/data/poses.js";

async function checkUrls() {
  console.log("Checking pose image URLs...");
  for (const p of POSES) {
    try {
      const response = await axios.head(p.image, { timeout: 3000 });
      console.log(`✅ ${p.id} (${p.name}): Status ${response.status}`);
    } catch (error) {
      console.log(`❌ ${p.id} (${p.name}): Broken! Error: ${error.message} (URL: ${p.image})`);
    }
  }
}

checkUrls();
