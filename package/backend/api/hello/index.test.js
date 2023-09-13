import request from "supertest";
import app from "@howlpack/howlpack-backend/app.js";

test("Hello world works", async () => {
  const response = await request(app.callback()).get("/api/hello");
  expect(response.status).toBe(200);
  expect(response.text).toMatchSnapshot();
});
