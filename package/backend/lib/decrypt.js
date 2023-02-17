import createHttpError from "http-errors";
import { decrypt } from "@howlpack/howlpack-shared/crypto.js";

export function decryptProductId(encryptedProductId) {
  try {
    const encrypted = JSON.parse(
      Buffer.from(encryptedProductId, "base64").toString("utf-8")
    );
    try {
      return JSON.parse(decrypt(encrypted));
    } catch (e) {
      throw createHttpError(400, "cannot decrypt or parse decrypted result", {
        data: { encryptedProductId, encrypted },
      });
    }
  } catch (e) {
    throw createHttpError(400, "cannot parse encrypted productId", {
      data: { encryptedProductId },
    });
  }
}
