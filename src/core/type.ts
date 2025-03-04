import { Container } from "inversify";
import { StoreApi } from "zustand";

export interface ContextValue {
  services: Container;
  stores: Record<string, StoreApi<unknown>>;
  hookStore: StoreApi<Record<string, unknown>>;
}

export interface ICtx {
  container: ContextValue;
  Context: React.Context<ContextValue>;
}

export type CallbackFnType = (ctx: ICtx) => void;
