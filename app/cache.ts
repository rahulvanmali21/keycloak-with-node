import NodeCache from "node-cache";

const options = { stdTTL: 60 * 5 }

export const cache = new NodeCache(options);




