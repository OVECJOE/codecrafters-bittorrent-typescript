import fs from "node:fs/promises";
import type { DecodedValue, EncodedValue, FileName, TorrentFileStructure } from "../types";
import decoder from "./decode/decoder";
import { readFileFast } from "../utils";
import { decodeBencodedDictionary } from "./decode/decode-handlers";

export function decodeBencode(bencodedValue: EncodedValue): DecodedValue | DecodedValue[] {
  const decoded = decoder.decode(bencodedValue);
  if (decoded === null) {
    throw new Error("Invalid bencoded value");
  }
  return decoded;
}

export async function getInfo(torrentFile: string): Promise<string> {
    const data = await readFileFast(torrentFile as FileName);
    if (!data) {
        throw new Error("Torrent file is empty");
    }

    if (!decodeBencodedDictionary.check(data)) {
        throw new Error("Content is not a valid bencoded dictionary");
    }

    let decoded: TorrentFileStructure, decodedSize: number, result = "";
    [decoded, decodedSize] = decodeBencodedDictionary.action(data);
    
    result += `Tracker URL: ${decoded.announce}\n`;
    result += `Length: ${decoded.info.length}\n`;

    return result;
}