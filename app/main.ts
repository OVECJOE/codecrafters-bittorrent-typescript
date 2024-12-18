import { decode, getInfo } from "./actions";
import { CLISupportedActions } from "./types";
import { throwayIf } from "./utils";

(() => {
  const args = process.argv;

  try {
    throwayIf(args.length < 3, "No action provided");
    throwayIf(
      !Object.values<string>(CLISupportedActions).includes(args[2]),
      "Invalid action provided"
    );

    switch (args[2]) {
      case CLISupportedActions.DECODE:
        throwayIf(args.length < 4, "No bencoded value provided");
        const bencodedValue = args[3];

        console.time("decode");
        console.log(JSON.stringify(decode(bencodedValue)));
        console.timeEnd("decode");
        break;
      case CLISupportedActions.INFO:
        throwayIf(args.length < 4, "No torrent file provided");
        const torrentFile = args[3];
        
        console.time("info");
        getInfo(torrentFile).then((info) => {
          console.log(info);
          console.timeEnd("info");
        });
        break;
      default:
        throw new Error("Invalid action provided");
    }
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})()
