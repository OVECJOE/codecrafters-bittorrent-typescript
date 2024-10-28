import type { TorrentFileStructure } from "../../types";
import { hashUsing } from "../../utils";
import { decodeBencodedDictionary } from "../decode/decode-handlers";
import { bencodeDictionary } from './bencoders';

export function getByteSize(decodedData: Pick<TorrentFileStructure, 'info'>): number {
    return decodedData.info.length;
}

export function getTrackerURL(decodedData: Pick<TorrentFileStructure, 'announce'>): string {
    return decodedData.announce;
}

export function getInfoHash(info: TorrentFileStructure['info']): string {
    return hashUsing(bencodeDictionary(info), 'sha1');
}
