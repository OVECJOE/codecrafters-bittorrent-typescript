export type EncodedValue = string;
export type DecodedValue = number | string;
export type DecodedValueType<T> = T extends DecodedValue | DecodedValue[] ? T : any;

export type BencodedString = `${number}:${string}`;
export type BencodedInteger = `i${number}e`;
export type BencodedList = `l${EncodedValue}e`;

export type Handler<T> = {
    action: (text: EncodedValue) => [DecodedValueType<T>, number];
    check: (text: EncodedValue) => boolean;
}

export interface IDecoder {
    register<T extends DecodedValue>(handler: Handler<T>): void;
    decode(text: EncodedValue): DecodedValue | DecodedValue[] | null;
}

export enum CLISupportedActions {
    DECODE = "decode",
    INFO = "info"
}

export type FileName = `${string}.${string}`;
export type TorrentFileStructure = {
    announce: string;
    'created by'?: string;
    info: {
        'piece length': number;
        pieces: string;
        name: string;
        length: number;
    };
}
