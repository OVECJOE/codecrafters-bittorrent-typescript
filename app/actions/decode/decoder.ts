import type { DecodedValue, DecodedValueType, EncodedValue, Handler, IDecoder } from "../../types";
import { decodeBencodedDictionary, decodeBencodedInteger, decodeBencodedList, decodeBencodedString } from "./decode-handlers";

class Decoder implements IDecoder {
    private handlers: Handler<DecodedValue | DecodedValue[]>[] = [];

    constructor(
        private setup?: (decoder: Decoder) => void,
        private teardown?: (decoder: Decoder) => void
    ) {
        this.setup?.(this);
    }

    register<T>(handler: Handler<DecodedValueType<T>>) {
        this.handlers.push(handler);
    }

    decode(text: EncodedValue): DecodedValue | DecodedValue[] | null {
        let result: [any, number] | null = null;

        for (const handler of this.handlers) {
            if (handler.check(text)) {
                result = handler.action(text);
                break;
            }
        }

        // run teardown first
        this.teardown?.(this);
        return result?.[0] ?? null;
    }
}

// Setup the decoder
const decoder = new Decoder(
    (decoder) => {
        decoder.register(decodeBencodedString);
        decoder.register(decodeBencodedInteger);
        decoder.register(decodeBencodedList);
        decoder.register(decodeBencodedDictionary);
    }
);

export default decoder;
