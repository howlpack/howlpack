export const backendUrl = (path = "", host) => {
  if (!host) {
    host =
      process.env.BACKEND_URL ??
      process.env.API_HOST + ":" + process.env.API_PORT;
  }
  return new URL(path, host).toString();
};

export const frontendUrl = (path = "", host) => {
  if (!host) {
    host = process.env.FRONTEND_URL;
  }
  return new URL(path, host).toString();
};
