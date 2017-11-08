import * as NodeCache from 'node-cache'

let localCache: NodeCache

const getCache = (): NodeCache => {
  if (!localCache) {
    localCache = new NodeCache()
  }
  return localCache
}

export const cache = getCache()