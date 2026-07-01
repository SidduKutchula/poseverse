import { describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import softDeletePlugin from "./models/plugins/softDelete.js";

// Define a test model to isolate plugin behavior
const testSchema = new mongoose.Schema({
  name: String,
});
testSchema.plugin(softDeletePlugin);
const TestModel = mongoose.model("TestModel", testSchema);

describe("Soft Delete Mongoose Plugin Unit Tests", () => {
  it("should add isDeleted and deletedAt fields to the schema", () => {
    const paths = TestModel.schema.paths;
    expect(paths.isDeleted).toBeDefined();
    expect(paths.deletedAt).toBeDefined();
    expect((paths.isDeleted as any).options.default).toBe(false);
  });

  it("should check that query middlewares filter out isDeleted items", () => {
    const middleware = (TestModel.schema as any).s.hooks._pres.get("find");
    expect(middleware).toBeDefined();
    
    // Simulate query context
    const fakeQuery = {
      where: vi.fn().mockReturnThis(),
    };
    
    // Execute hook with fake query context
    for (const hook of middleware) {
      hook.fn.call(fakeQuery, () => {});
    }
    
    expect(fakeQuery.where).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
  });

  it("should support instance soft delete method", async () => {
    const doc = new TestModel({ name: "Testing Item" });
    
    // Mock save method to prevent actual database write attempts
    doc.save = vi.fn().mockResolvedValue(doc as any);
    
    await doc.softDelete();
    
    expect(doc.isDeleted).toBe(true);
    expect(doc.deletedAt).toBeInstanceOf(Date);
    expect(doc.save).toHaveBeenCalled();
  });
});
