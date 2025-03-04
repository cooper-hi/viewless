export function createDeprecatedStore<T>(creator: T): T {
  function storeCreator() {
    return (creator as () => unknown)();
  }
  storeCreator.$deprecatedStore = true;
  return storeCreator as unknown as T;
}
