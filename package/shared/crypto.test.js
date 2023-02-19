describe("crypto", () => {
  test("encrypt and decrypt", async () => {
    process.env.ENCRYPTION_SECRET_KEY = "fv96XDhsrAPCg3T3gPgvgAZg7An68DYP";

    const { encrypt, decrypt } = await import("./crypto.js");

    const secret = "secret_text";
    const encrypted = encrypt(secret);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toEqual(secret);
  });
});
