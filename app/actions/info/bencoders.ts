import type { BencodedInteger, BencodedList, BencodedString, DecodedValue } from "../../types";

export const bencodeString = (s: string): BencodedString => {
    return `${s.length}:${s}`;
};

export const bencodeInteger = (i: number): BencodedInteger => {
    return `i${i}e`;
}

export const bencodeList = (list: any[]): string => {
    let encodedList = "";
    for (let item of list) {
      if (typeof item === "number") encodedList += bencodeInteger(item);
      else if (typeof item === "string") encodedList += bencodeString(item);
      else if (Array.isArray(item)) encodedList += bencodeList(item);
      else if (typeof item === "object" && item !== null && !Array.isArray(item))
        encodedList += bencodeDictionary(item);
    }
    return `l${encodedList}e`;
};

export const bencodeDictionary = (dict: { [key: string]: DecodedValue | DecodedValue[] }): string => {
    let encodedDict = "";
    for (let item in dict) {
        const key = bencodeString(item);
        if (typeof dict[item] === "number")
        encodedDict += `${key}${bencodeInteger(dict[item])}`;
        else if (typeof dict[item] === "string")
        encodedDict += `${key}${bencodeString(dict[item])}`;
        else if (typeof Array.isArray(dict[item]))
        encodedDict += `${key}${bencodeList(dict[item])}`;
        else if (
        typeof dict[item] === "object" &&
        dict[item] !== null &&
        !Array.isArray(dict[item])
        )
        encodedDict += `${key}${bencodeDictionary(dict[item])}`;
    }
    return `d${encodedDict}e`;
};
