import produce from "immer";
import { CallbackFnType, ICtx } from "./type";

export function isHook(value: unknown) {
  return (
    typeof value === "function" &&
    (value as unknown as { $isHook?: boolean }).$isHook
  );
}

export function isDeprecatedStore(value: unknown) {
  return (
    typeof value === "function" &&
    (value as unknown as { $deprecatedStore?: boolean }).$deprecatedStore
  );
}

export function mutateState<T>(
  set: (obj: Partial<T>) => void,
  get: () => T,
  updater: (state: T) => void
) {
  set(produce(get(), updater));
}

export function globalHooks() {
  const list: CallbackFnType[] = [];

  function register(callback: CallbackFnType) {
    list.push(callback);
  }

  return {
    onCreated: register,
    emitCreated(ctx: ICtx) {
      list.forEach((callback) => callback(ctx));
    },
    clearCreated() {
      list.length = 0;
    },
  };
}
