import type { DecodedValue, EncodedValue, Handler, IDecoder } from "./types";
import { integerDecodingHandler, listDecodingHandler, stringDecodingHandler } from "./decode-handlers";

class Decoder implements IDecoder {
    private handlers: Handler<DecodedValue | DecodedValue[]>[] = [];

    constructor(
        private setup?: (decoder: Decoder) => void,
        private teardown?: (decoder: Decoder) => void
    ) {
        this.setup?.(this);
    }

    register<T extends DecodedValue | DecodedValue[]>(handler: Handler<T>) {
        this.handlers.push(handler);
    }

    decode(text: EncodedValue): DecodedValue | DecodedValue[] | null {
        let result: DecodedValue | DecodedValue[] | null = null;

        for (const handler of this.handlers) {
            if (handler.check(text)) {
                result = handler.action(text);
                break;
            }
        }

        // run teardown first
        this.teardown?.(this);
        return result;
    }
}

// Setup the decoder
const decoder = new Decoder(
    (decoder) => {
        decoder.register(stringDecodingHandler);
        decoder.register(integerDecodingHandler);
        decoder.register(listDecodingHandler);
    }
);

export default decoder;
