import request from "supertest";
import app from "../app.js";

describe("CloudGuardian backend", () => {
  it("responds at the root route", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        project: "CloudGuardian",
        version: "1.0.0",
      })
    );
  });
});
