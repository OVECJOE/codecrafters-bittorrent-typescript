import { promises as fs } from "fs";
import type { FileName } from "./types";
import { createHash } from "crypto";

export function throwayIf(condition: boolean, message: string, error?: ErrorConstructor): asserts condition is false {
    if (!condition) return;
    throw new (error || Error)(message);
}

export function readInChunks(file: FileName, encoding: BufferEncoding = 'utf-8'): AsyncGenerator<Buffer> {
    return (async function* () {
        const reader = await fs.open(file, 'r');
        const stream = reader.createReadStream({ highWaterMark: 1024 * 1024, encoding });

        for await (const chunk of stream) {
            yield chunk;
        }
    })();
}

export function hashUsing(data: string, algorithm: 'sha1' | 'md5'): string {
    return createHash(algorithm).update(data).digest('hex');
}