import type { DecodedValue, EncodedValue } from "./types";
import decoder from "./decoder";

function decodeBencode(bencodedValue: EncodedValue): DecodedValue | DecodedValue[] {
  const decoded = decoder.decode(bencodedValue);
  if (decoded === null) {
    throw new Error("Invalid bencoded value");
  }
  return decoded;
}

const args = process.argv;
const bencodedValue = args[3];

if (args[2] === "decode") {
  try {
    const decoded = decodeBencode(bencodedValue);
    console.log(JSON.stringify(decoded));
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
}
