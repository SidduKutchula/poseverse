import Pose from "../models/Pose.js";
import { generateBLIPCaption, getCLIPImageEmbedding } from "./aiService.js";

class ImageProcessorQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.concurrency = 2;
    this.activeCount = 0;
  }

  // Add image to queue
  enqueue(poseId) {
    if (!this.queue.includes(poseId)) {
      this.queue.push(poseId);
      this.processNext();
    }
  }

  async processNext() {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const poseId = this.queue.shift();

    try {
      await this.analyzeImage(poseId);
    } catch (err) {
      console.error(`Error processing image ${poseId} in background queue:`, err.message);
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }

  async analyzeImage(poseId) {
    console.log(`[Queue] Analyzing image ${poseId}...`);
    const pose = await Pose.findOne({ id: poseId });
    if (!pose || pose.processed) {
      return;
    }

    // Call Salesforce BLIP-2 to get visual caption details
    const caption = await generateBLIPCaption(pose.image);
    
    // Call OpenAI CLIP to generate real visual embeddings
    const embedding = await getCLIPImageEmbedding(pose.image);

    // Structure metadata extraction based on the BLIP-2 visual caption
    const cleanCaption = caption.toLowerCase();
    
    const event = cleanCaption.includes("wedding") ? "Wedding" : cleanCaption.includes("birthday") ? "Birthday" : "Maternity";
    const poseType = cleanCaption.includes("sitting") ? "Sitting" : cleanCaption.includes("standing") ? "Standing" : "Candid";
    const peopleCount = cleanCaption.includes("couple") || cleanCaption.includes("two") ? "Couple" : "Solo";
    const mood = cleanCaption.includes("smile") || cleanCaption.includes("happy") ? "Happy" : "Elegant";
    const lighting = cleanCaption.includes("sunset") || cleanCaption.includes("golden") ? "Golden Hour" : "Soft Light";
    const background = cleanCaption.includes("garden") || cleanCaption.includes("outdoor") ? "Garden" : "Studio";
    const outfit = cleanCaption.includes("traditional") || cleanCaption.includes("ethnic") ? "Traditional" : "Western";
    const cameraAngle = cleanCaption.includes("low angle") ? "Low Angle" : "Eye Level";
    
    pose.description = caption;
    pose.category = event.toLowerCase();
    pose.imageEmbedding = embedding;
    pose.processed = true;

    // Apply strict quality criteria (Step 10)
    const isTiny = (pose.width && pose.width < 400) || (pose.height && pose.height < 400);
    const isLowRes = (pose.width && pose.width < 800) && (pose.height && pose.height < 800);
    if (isTiny || isLowRes) {
      console.warn(`[Queue] Image ${poseId} rejected due to low resolution (${pose.width}x${pose.height})`);
      pose.imageVerified = false;
    }

    await pose.save();
    console.log(`[Queue] Successfully analyzed image ${poseId}.`);
  }
}

export const imageProcessorQueue = new ImageProcessorQueue();
export default imageProcessorQueue;
