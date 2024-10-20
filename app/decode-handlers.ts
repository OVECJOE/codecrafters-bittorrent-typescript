import type { DecodedValue, Handler } from "./types";

export const stringDecodingHandler: Handler<string> = {
    /**
     * Decodes a bencoded string
     * @param text bencoded string to decode
     * @returns {[string, number]} a tuple containing the decoded string and the number of characters consumed
     * 
     * @example
     * decodeBencodedString("4:spam") // "spam"
     * decodeBencodedString("0:") // ""
     */
    action(text): [string, number] {
        const colonIndex = text.indexOf(":");
        if (colonIndex === -1) {
            throw new Error("Invalid bencoded string");
        }

        const length = parseInt(text.substring(0, colonIndex));
        if (isNaN(length)) {
            throw new Error("Invalid bencoded string");
        }

        const decoded = text.substring(colonIndex + 1, colonIndex + 1 + length);

        return [decoded, colonIndex + 1 + length];
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
     * @returns {[number, number]} a tuple containing the decoded integer and the number of characters consumed
     * 
     * @example
     * decodeBencodedInteger("i3e") // 3
     * decodeBencodedInteger("i-3e") // -3
     * decodeBencodedInteger("i0e") // 0
     */
    action(text): [number, number] {
        const endOfInteger = text.indexOf("e");
        if (text[0] !== "i" || endOfInteger === -1) {
            throw new Error("Invalid bencoded integer");
        }

        const decoded = parseInt(text.substring(1, endOfInteger));
        if (isNaN(decoded)) {
            throw new Error("Invalid bencoded integer");
        }

        return [decoded, endOfInteger + 1];
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

/**
 * Decodes a bencoded list
 * @param text bencoded list to decode
 * @returns {[(DecodedValue | DecodedValue[])[], number]} a tuple containing the decoded list and the number of characters consumed
 * 
 * @example
 * decodeBencodedList("l4:spam4:eggse") // ["spam", "eggs"]
 * decodeBencodedList("li3e6:applese") // [3, "apples"]
 * decodeBencodedList("ll4:spam4:eggse3:fooe") // [["spam", "eggs"], "foo"]
 * decodeBencodedList("le") // []
 */
export const decodeBencodedList: Handler<(DecodedValue | DecodedValue[])[]> = {
    action(text) {
        const endOfList = text.lastIndexOf("e");
        if (text[0] !== "l" || endOfList === -1) {
            throw new Error("Invalid bencoded list");
        }

        const result: ReturnType<typeof decodeBencodedList.action>[0] = [];
        
        let index = 1;
        let decoded: any;
        while (index < endOfList) {
            let consumedSize: number = 0;
            let tail = text.substring(index, endOfList);

            if (stringDecodingHandler.check(tail)) {
                [decoded, consumedSize] = stringDecodingHandler.action(tail);
            } else if (integerDecodingHandler.check(tail)) {
                [decoded, consumedSize] = integerDecodingHandler.action(tail);
            } else if (this.check(tail)) {
                const listEnd = tail.lastIndexOf("e");
                if (listEnd === -1) {
                    throw new Error("Invalid bencoded list");
                }

                [decoded, consumedSize] = this.action(tail.substring(0, listEnd + 1));
            } else {
                index++;
                continue;
            }

            result.push(decoded);
            index += consumedSize;
        }

        return [result, endOfList + 1];
    },
    check(text) {
        return /^l.*e/.test(text);
    }
}