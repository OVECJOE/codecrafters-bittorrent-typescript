export type EncodedValue = string;
export type DecodedValue = number | string;
export type DecodedValueType<T> = T extends DecodedValue | DecodedValue[] ? T : any;

export type Handler<T> = {
    action: (text: EncodedValue) => [DecodedValueType<T>, number];
    check: (text: EncodedValue) => boolean;
}

export interface IDecoder {
    register<T extends DecodedValue>(handler: Handler<T>): void;
    decode(text: EncodedValue): DecodedValue | DecodedValue[] | null;
}