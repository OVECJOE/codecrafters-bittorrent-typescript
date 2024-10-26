import type { DecodedValue, Handler } from "../../types";

export const decodeBencodedString: Handler<string> = {
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

export const decodeBencodedInteger: Handler<number> = {
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
        if (text[0] !== "l" || text.indexOf("e") === -1) {
            throw new Error("Invalid bencoded list");
        }

        const result: (DecodedValue | DecodedValue[])[] = [];
        
        let index = 1;
        let decoded: any;
        while (index < text.length) {
            let consumedSize: number = 0;
            let tail = text.substring(index);

            if (decodeBencodedString.check(tail)) {
                [decoded, consumedSize] = decodeBencodedString.action(tail);
            } else if (decodeBencodedInteger.check(tail)) {
                [decoded, consumedSize] = decodeBencodedInteger.action(tail);
            } else if (this.check(tail)) {
                [decoded, consumedSize] = this.action(tail);
            } else if (tail[0] === 'e') {
                index++;
                break;
            } else {
                throw new Error("Invalid bencoded list");
            }

            result.push(decoded);
            index += consumedSize;
        }

        return [result, index];
    },
    check(text) {
        return /^l.*e/.test(text);
    }
}

/**
 * Decodes a bencoded dictionary
 * @param text bencoded dictionary to decode
 * @returns {[Record<string, DecodedValue | DecodedValue[]>, number]} a tuple containing the decoded dictionary and the number of characters consumed
 * 
 * @example
 * decodeBencodedDictionary("d3:cow3:moo4:spam4:eggse") // { cow: "moo", spam: "eggs" }
 * decodeBencodedDictionary("d4:spaml1:a1:bee") // { spam: ["a", "b"] }
 * decodeBencodedDictionary("d9:publisher3:bob17:publisher-webpage15:www.example.com18:publisher.location4:homee") // { publisher: "bob", "publisher-webpage": "www.example.com", "publisher.location": "home" }
 */
export const decodeBencodedDictionary: Handler<Record<string, DecodedValue | DecodedValue[]>> = {
    action(text) {
        if (text[0] !== "d" || text.indexOf("e") === -1) {
            throw new Error("Invalid bencoded dictionary");
        }

        const result: Record<string, DecodedValue | DecodedValue[]> = {};
        
        let index = 1;
        let decoded: any;
        let key: string;
        while (index < text.length) {
            let consumedSize: number = 0;
            let tail = text.substring(index);

            if (decodeBencodedString.check(tail)) {
                [key, consumedSize] = decodeBencodedString.action(tail);
            } else if (tail[0] === 'e') {
                index++;
                break;
            } else {
                throw new Error("Invalid bencoded dictionary");
            }

            index += consumedSize;
            tail = text.substring(index);

            if (decodeBencodedString.check(tail)) {
                [decoded, consumedSize] = decodeBencodedString.action(tail);
            } else if (decodeBencodedInteger.check(tail)) {
                [decoded, consumedSize] = decodeBencodedInteger.action(tail);
            } else if (decodeBencodedList.check(tail)) {
                [decoded, consumedSize] = decodeBencodedList.action(tail);
            } else if (decodeBencodedDictionary.check(tail)) {
                [decoded, consumedSize] = decodeBencodedDictionary.action(tail);
            } else {
                throw new Error("Invalid bencoded dictionary");
            }

            result[key] = decoded;
            index += consumedSize;
        }

        return [result, index];
    },
    check(text) {
        return /^d.*e/.test(text);
    }
}
