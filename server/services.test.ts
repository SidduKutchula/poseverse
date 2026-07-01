import { describe, expect, it, vi, beforeEach } from "vitest";
import * as userService from "./services/userService.js";
import * as poseService from "./services/poseService.js";
import * as moodBoardService from "./services/moodBoardService.js";

// Mock repositories to test the service layer in isolation
vi.mock("./repositories/userRepository.js", () => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  saveUser: vi.fn(),
}));

vi.mock("./repositories/poseRepository.js", () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  count: vi.fn(),
}));

vi.mock("./repositories/moodBoardRepository.js", () => ({
  findByUserId: vi.fn(),
  findByShareToken: vi.fn(),
  create: vi.fn(),
  saveMoodBoard: vi.fn(),
}));

describe("Layered Business Services Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PoseService Feed Parameters", () => {
    it("should successfully filter mock poses by category in offline mode", async () => {
      const result = await poseService.getPosesFeed({
        categories: ["wedding"],
        page: 1,
        limit: 5,
      });

      expect(result.poses).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.poses.every((p) => p.category === "wedding")).toBe(true);
    });

    it("should paginated results correctly based on limit size", async () => {
      const result = await poseService.getPosesFeed({
        page: 1,
        limit: 3,
      });

      expect(result.poses.length).toBeLessThanOrEqual(3);
      expect(result.pagination.limit).toBe(3);
    });
  });

  describe("UserService Offline Auth Fallbacks", () => {
    it("should register new offline mock users and return signed tokens", async () => {
      const name = "Mock Developer";
      const email = `test_${Date.now()}@example.com`;
      const password = "secure_password_123";

      const result = await userService.registerUser({ name, email, password });

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.name).toBe(name);
      expect(result.user.email).toBe(email);
    });

    it("should prevent duplicate offline user emails", async () => {
      const name = "Mock Developer";
      const email = "admin@poseverse.com"; // default offline user
      const password = "secure_password_123";

      await expect(
        userService.registerUser({ name, email, password })
      ).rejects.toThrow("User already exists with this email");
    });
  });

  describe("MoodBoard Saved Poses Lists", () => {
    it("should append a pose to user's saved list in offline mode", async () => {
      const userId = "offline_user_id";
      const poseId = "w2"; // Bride Veil Portrait

      const list = await moodBoardService.addPoseToSavedList(userId, poseId);

      expect(list).toBeDefined();
      expect(list.some((p) => p.id === poseId)).toBe(true);
    });

    it("should support reordering saved poses arrays in offline mode", async () => {
      const userId = "offline_user_id";
      
      // Seed two items
      await moodBoardService.addPoseToSavedList(userId, "w2");
      await moodBoardService.addPoseToSavedList(userId, "w3");

      const reordered = await moodBoardService.reorderSavedPoses(userId, ["w3", "w2"]);

      expect(reordered[0]?.id).toBe("w3");
      expect(reordered[1]?.id).toBe("w2");
    });
  });
});
