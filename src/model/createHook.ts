export function createHook<T, R extends unknown[]>(
  useHookDefinition: (...args: R) => T,
  hookParams?: R
) {
  function useHook(
    ...args: Parameters<typeof useHookDefinition>
  ): ReturnType<typeof useHookDefinition> {
    return useHookDefinition(...args);
  }
  useHook.$isHook = true;
  useHook.$hookParams = hookParams;
  return useHook;
}
