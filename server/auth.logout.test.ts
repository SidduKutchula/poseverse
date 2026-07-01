import { describe, expect, it } from "vitest";
import { logout } from "./controllers/authController.js";

describe("auth.logout controller", () => {
  it("clears the refreshToken cookie and returns success message", async () => {
    const req = {
      headers: {
        cookie: "refreshToken=test_token_123"
      }
    } as any;

    const headers: Record<string, string> = {};
    let jsonResponse: any = null;

    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
      json: (data: any) => {
        jsonResponse = data;
        return res;
      }
    } as any;

    await logout(req, res);

    expect(headers["Set-Cookie"]).toContain("refreshToken=");
    expect(headers["Set-Cookie"]).toContain("Max-Age=0");
    expect(jsonResponse).toEqual({ message: "Logged out successfully" });
  });
});
