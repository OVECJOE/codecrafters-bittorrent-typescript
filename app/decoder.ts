import type { DecodedValue, EncodedValue, Handler, IDecoder } from "./types";

class Decoder implements IDecoder {
    private handlers: Handler<DecodedValue>[] = [];

    constructor(
        private setup?: (decoder: Decoder) => void,
        private defaultHandler?: Handler<DecodedValue>,
        private teardown?: (decoder: Decoder) => void
    ) {
        this.setup?.(this);
    }

    register<T extends DecodedValue>(handler: Handler<T>) {
        this.handlers.push(handler);
    }

    decode(text: EncodedValue): DecodedValue | null {
        let result: DecodedValue | null = null;

        for (const handler of this.handlers) {
            if (handler.check(text)) {
                result = handler.action(text);
                break;
            }
        }

        if (this.defaultHandler) {
            result = this.defaultHandler.action(text);
        }

        // run teardown first
        this.teardown?.(this);

        return result;
    }
}

// decoding handlers for all supported types

const stringDecodingHandler: Handler<string> = {
    /**
     * Decodes a bencoded string
     * @param text bencoded string to decode
     * @returns decoded string
     * 
     * @example
     * decodeBencodedString("4:spam") // "spam"
     * decodeBencodedString("0:") // ""
     */
    action(text) {
        const colonIndex = text.indexOf(":");
        if (colonIndex === -1) {
            throw new Error("Invalid bencoded string");
        }

        const length = parseInt(text.substring(0, colonIndex));
        if (isNaN(length)) {
            throw new Error("Invalid bencoded string");
        }

        return text.substring(colonIndex + 1);
        // return text.substring(colonIndex + 1, colonIndex + 1 + length);
    },
    /**
     * Checks if the given text is a bencoded string
     * @param text text to check
     * @returns true if the text is a bencoded string, false otherwise
     */
    check(text) {
        return /^\d+:/.test(text);
    }
}

const integerDecodingHandler: Handler<number> = {
    /**
     * Decodes a bencoded integer
     * @param text becoded string to decode
     * @returns decoded integer
     * 
     * @example
     * decodeBencodedInteger("i3e") // 3
     * decodeBencodedInteger("i-3e") // -3
     * decodeBencodedInteger("i0e") // 0
     */
    action(text) {
        if (text[0] !== "i" || text[text.length - 1] !== "e") {
            throw new Error("Invalid bencoded integer");
        }

        return parseInt(text.substring(1, text.length - 1));
    },
    /**
     * Checks if the given text is a bencoded integer
     * @param text text to check
     * @returns true if the text is a bencoded integer, false otherwise
     */
    check(text) {
        return /^i-?\d+e$/.test(text);
    }
}

// Setup the decoder
const decoder = new Decoder(
    (decoder) => {
        decoder.register(stringDecodingHandler);
        decoder.register(integerDecodingHandler);
    }
);

export default decoder;