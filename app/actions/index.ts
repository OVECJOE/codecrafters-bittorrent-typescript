import { readFile } from "node:fs/promises";
import type { DecodedValue, EncodedValue, FileName, TorrentFileStructure } from "../types";
import decoder from "./decode/decoder";
import { throwayIf } from "../utils";
import { decodeBencodedDictionary } from "./decode/decode-handlers";
import { getByteSize, getInfoHash, getTrackerURL } from "./info/extractors";

export function decode(bencodedValue: EncodedValue): DecodedValue | DecodedValue[] {
  const decoded = decoder.decode(bencodedValue);
  if (decoded === null) {
    throw new Error("Invalid bencoded value");
  }
  return decoded;
}

export async function getInfo(torrentFile: string): Promise<string> {
  const data = await readFile(torrentFile, { encoding: 'binary', flag: 'r' }).catch(() => null);

  throwayIf(!data, "Torrent file is empty");
  throwayIf(!decodeBencodedDictionary.check(data!), "Content is not a valid bencoded dictionary");

  let decoded: TorrentFileStructure, decodedSize: number, result = "";
  [decoded, decodedSize] = decodeBencodedDictionary.action(data!);

  result += `Tracker URL: ${getTrackerURL(decoded)}\n`; // tracker URL used to find peers
  result += `Length: ${getByteSize(decoded)}\n`; // length of the file to be downloaded (in bytes)
  result += `Info Hash: ${getInfoHash(decoded.info)}\n`; // hash of the bencoded info dictionary

  return result;
}
