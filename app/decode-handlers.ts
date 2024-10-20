import type { DecodedValue, Handler } from "./types";

export const stringDecodingHandler: Handler<string> = {
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

        return text.substring(colonIndex + 1, colonIndex + 1 + length);
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

export const integerDecodingHandler: Handler<number> = {
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
        const endOfInteger = text.indexOf("e");
        if (text[0] !== "i" || endOfInteger === -1) {
            throw new Error("Invalid bencoded integer");
        }

        return parseInt(text.substring(1, endOfInteger));
    },
    /**
     * Checks if the given text is a bencoded integer
     * @param text text to check
     * @returns true if the text is a bencoded integer, false otherwise
     */
    check(text) {
        return /^i-?\d+e/.test(text);
    }
}

export const listDecodingHandler: Handler<DecodedValue[]> = {
    action(text) {
        if (text[0] !== "l" || text[text.length - 1] !== "e") {
            throw new Error("Invalid bencoded list");
        }

        const result: DecodedValue[] = [];
        
        let index = 1;
        while (index < text.length - 1) {
            let decoded = null;
            let tail = text.substring(index, text.length - 1);
            
            if (stringDecodingHandler.check(tail)) {
                decoded = stringDecodingHandler.action(tail);
            } else if (integerDecodingHandler.check(tail)) {
                decoded = integerDecodingHandler.action(tail);
            } else {
                index++;
                continue;
            }

            result.push(decoded);
            index += decoded.toString().length;
        }

        return result;
    },
    check(text) {
        return /^l.*e$/.test(text);
    }
}