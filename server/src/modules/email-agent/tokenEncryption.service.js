
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_HEX_LENGTH = 64;

const getEncryptionKey = () => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;

  if (!key || !new RegExp(`^[0-9a-fA-F]{${KEY_HEX_LENGTH}}$`).test(key)) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 32-byte hexadecimal key"
    );
  }

  return Buffer.from(key, "hex");
};

export const encryptToken = (token) => {
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("Token must be a non-empty string");
  }

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex")
  ].join(":");
};

export const decryptToken = (encryptedToken) => {
  if (typeof encryptedToken !== "string" || !encryptedToken) {
    throw new Error("Encrypted token must be a non-empty string");
  }

  const parts = encryptedToken.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  if (
    !/^[0-9a-fA-F]{24}$/.test(ivHex) ||
    !/^[0-9a-fA-F]{32}$/.test(authTagHex) ||
    !/^(?:[0-9a-fA-F]{2})+$/.test(encryptedHex)
  ) {
    throw new Error("Invalid encrypted token format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};
