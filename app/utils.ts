import { promises as fs } from "fs";
import type { FileName, ReadInChunksOptions } from "./types";

export function throwayIf(condition: boolean, message: string, error?: ErrorConstructor): asserts condition is false {
    if (!condition) return;
    throw new (error || Error)(message);
}

export function readInChunks(file: string, options?: ReadInChunksOptions): AsyncGenerator<Buffer> {
    return (async function* () {
        const reader = await fs.open(file, "r");
        const stream = reader.createReadStream({
            ...options,
            highWaterMark: options?.highWaterMark || 1024
        });

        for await (const chunk of stream) {
            yield chunk;
        }
    })();
}

export async function readFileFast(file: FileName, callback?: (data: Buffer) => void): Promise<string | undefined> {
    let data = "";
    for await (const chunk of readInChunks(file)) {
        if (!callback) {
            data += chunk.toString();
        } else {
            callback(chunk);
        }
    }

    return data || undefined;
}