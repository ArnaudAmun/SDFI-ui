import * as BufferLayout from "buffer-layout";

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a float64 bit 
 */
const f64 = (property = "f64") => {
  return BufferLayout.blob(8, property);
};

export const SDFI_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("tokenAPubkey"),
  publicKey("tokenBPubkey"),
  f64("tokenAWeight"),
  f64("tokenBWeight"),
]);

export interface SDFILayout {
  isInitialized: number,
  initializerPubkey: Uint8Array,
  tokenAPubkey: Uint8Array,
  tokenBPubkey: Uint8Array,
  tokenAWeight: Uint8Array,
  tokenBWeight: Uint8Array,
}
