import {poseidon} from '@big-whale-labs/poseidon';

class dpPoseidonCache {
  static cache = new Map();

  static getCache(x : bigint | string | bigint[]): null | bigint {
    if (x instanceof Array) {
      const key = x.join();
      return dpPoseidonCache.getCache(key);
    }

    return dpPoseidonCache
      .cache
      .get(x);
  }

  static setCache(x : bigint | string | bigint[], v : bigint) {
    if (x instanceof Array) {
      const key = x.join();
      dpPoseidonCache.setCache(key, v);
      return;
    }

    dpPoseidonCache
      .cache
      .set(x, v);
  }
}

export function dpPoseidonHash(inputs : bigint[], isDpEnabled = true): bigint {
  if (isDpEnabled) {
    const cache = dpPoseidonCache.getCache(inputs);
    if (cache) {
      return cache;
    }
  }

  const res = poseidon(inputs);
  if (isDpEnabled) {
    dpPoseidonCache.setCache(inputs, res);
  }
  return res;
}