import request from "supertest";

import app from "@howlpack/howlpack-backend/app.js";

test("Twitter callback", async () => {
  const msg = "foo";
  const state = {
    message: msg,
    dens_name: "howlpack",
    address: "juno1sp3wrffwvtsaz255x63w7c5m40glej8p3vwcwt",
    pubKey: "A4i50fakPVd3KGDzGmkKL88j6VcPZlqQ6x32t1sDCMqp",
    signature:
      "pDPhgDKjV82TDvq7IqAKX2LOnCwhuNcCcvMOaS5a1JocMKLZsx4RgH1A9Vz51mLguN+cM6eg2BBZoijJSVdy1Q==",
  };

  const code = "twitter_code";

  const response = await request(app.callback()).get(
    `/api/twitter/callback?state=${btoa(JSON.stringify(state))}&code=${code}`
  );
  expect(response.status).toBe(200);
  expect(response.text).toMatchSnapshot();
});
