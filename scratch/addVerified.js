import fs from "fs";
import path from "path";

const filePath = "c:/Users/Siddu/Desktop/poseverse/client/src/data/poses.js";
let content = fs.readFileSync(filePath, "utf8");

// Add imageVerified: true to all poses by matching their alphanumeric id pattern (e.g. w1, pw2)
const updatedContent = content.replace(/(\s+)id:\s*"([a-z]+\d+)"/g, "$1imageVerified: true,$1id: \"$2\"");

fs.writeFileSync(filePath, updatedContent, "utf8");
console.log("Successfully updated poses.js with imageVerified: true flag!");
