import { promises as fs } from "fs";
import type { FileName } from "./types";
import { createHash } from "crypto";

export function throwayIf(condition: boolean, message: string, error?: ErrorConstructor): asserts condition is false {
    if (!condition) return;
    throw new (error || Error)(message);
}

export function hashUsing(data: string, algorithm: 'sha1' | 'md5'): string {
    return createHash(algorithm).update(data).digest('hex');
}