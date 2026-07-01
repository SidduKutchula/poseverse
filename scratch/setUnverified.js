import fs from "fs";

const filePath = "c:/Users/Siddu/Desktop/poseverse/client/src/data/poses.js";
let content = fs.readFileSync(filePath, "utf8");

const targetIds = ["m3", "t1", "t2", "c1", "c2", "f1", "f2", "g1"];

targetIds.forEach((id) => {
  const regex = new RegExp(`imageVerified:\\s*true,\\s*id:\\s*"${id}"`, "g");
  content = content.replace(regex, `imageVerified: false,\n    id: "${id}"`);
});

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully set broken pose URLs to imageVerified: false!");
