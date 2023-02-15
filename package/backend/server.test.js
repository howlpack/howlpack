import { jest } from "@jest/globals";
import app from "./app.js";

const mockListen = jest.fn();
app.listen = mockListen;

afterEach(() => {
  mockListen.mockReset();
});

test("Server works", async () => {
  await import("./server.js");
  expect(mockListen.mock.calls.length).toBe(1);
  expect(mockListen.mock.calls[0][0]).toBe(process.env.API_PORT);
});
