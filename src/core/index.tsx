import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ContextValue } from "./type";
import { globalHooks, isDeprecatedStore, isHook } from "./utils";
import { Container } from "inversify";
import {
  createStore,
  type StoreApi,
  useStore as useZustandStore,
} from "zustand";

const { onCreated, emitCreated, clearCreated } = globalHooks();

export function createViewless<
  S extends Record<
    string,
    | ((set: (obj: any) => any, get: () => any) => any)
    | ((...args: any[]) => any)
  >,
  T extends Record<string, new (...arg: any[]) => unknown>
>(stores: S, services: T) {
  type StoresRes = {
    [K in keyof S]: ReturnType<S[K]>;
  };
  type ServicesRes = {
    [K in keyof T]: InstanceType<T[K]>;
  };
  type StoresAndServicesRes = StoresRes & ServicesRes;

  // 是否开启了provider使用方式
  let providerEnable = false;
  const hooksDefinition: Record<string, (...args: any[]) => any> = {};

  Object.entries(stores).forEach(([key, value]) => {
    if (isHook(value)) {
      hooksDefinition[key] = value;
      return;
    }
  });

  const Context = createContext<ContextValue>({
    stores: {},
    hookStore: {},
  } as ContextValue);

  /**
   * 通过hook的方式注册使用store
   * @param name: 有效的store名称
   * @param params： store中与name匹配的参数
   * @returns store中对应的返回类型
   */
  function useHook<
    K extends keyof S,
    N extends Parameters<S[K]> = Parameters<S[K]>,
    M = ReturnType<S[K]>
  >(name: K, params: N): M {
    const context = useContext(Context);
    const useHookDefinition = hooksDefinition[name as string];
    const res = useHookDefinition(...params);
    useEffect(() => {
      context.hookStore.setState({
        [name as string]: res,
      });
    }, [name, res]);

    return res;
  }

  function UseHook<
    K extends keyof S,
    N extends Parameters<S[K]> = Parameters<S[K]>
  >(props: { name: K; params: N }) {
    const { name, params } = props;
    useHook(name, params);
    return null;
  }

  // 自动执行注册的hook
  function AutoRunHook() {
    const res = Object.entries(hooksDefinition).map(([key, value]) => {
      const hookParams = (value as unknown as { $hookParams?: any })
        ?.$hookParams;
      return hookParams ? (
        <UseHook key={key} name={key} params={hookParams} />
      ) : null;
    });

    return <>{res}</>;
  }

  function Provider({
    parent,
    children,
    containerCreated,
  }: {
    parent?: Container;
    children: ReactNode;
    containerCreated?: (container: Container) => void;
  }): JSX.Element {
    const contextValue = useMemo(() => {
      const container = new Container({ defaultScope: "Singleton" });
      if (parent) {
        container.parent = parent;
      }
      containerCreated?.(container);
      const storesValue: Record<string, StoreApi<unknown>> = {};
      Object.entries(stores).forEach(([key, value]) => {
        if (isHook(value)) {
          return;
        }
        if (isDeprecatedStore(value)) {
          storesValue[key] = (value as () => StoreApi<unknown>)();
          container.bind(key).toConstantValue(storesValue[key]);
          return;
        }

        const store = createStore(value);
        storesValue[key] = store;
        container.bind(key).toConstantValue(
          new Proxy(
            {},
            {
              get(target, prop) {
                return store.getState()[prop];
              },
            }
          )
        );
      });

      const hookStore = createStore<Record<string, unknown>>(
        (set, get) => ({})
      );
      Object.entries(hooksDefinition).forEach(([key, value]) => {
        container.bind(key).toConstantValue(
          new Proxy(value, {
            get(target, prop) {
              return (
                hookStore.getState()[key as string] as Record<string, unknown>
              )?.[prop as string];
            },
          })
        );
      });

      Object.entries(services).forEach(([key, value]) => {
        container.bind(key).to(value);
      });

      const result = { services: container, stores: storesValue, hookStore };
      emitCreated({ container: result, Context });

      providerEnable = true;
      return result;
    }, []);

    return (
      <Context.Provider value={contextValue}>
        <AutoRunHook />
        {children}
      </Context.Provider>
    );
  }

  function useStore<K extends keyof S, M = ReturnType<S[K]>>(
    name: K,
    selector?: (store: ReturnType<S[K]>) => M
  ) {
    const context = useContext(Context);
    return useZustandStore(context.stores[name as string], selector as any);
  }

  function useService<K extends keyof T>(name: K): InstanceType<T[K]> {
    const context = useContext(Context);
    return context.services.get(name as string);
  }

  // 兼容之前的，不推荐使用
  function useServices(): ServicesRes {
    const context = useContext(Context);
    return new Proxy(
      {},
      {
        get(target, key) {
          return context.services.get(key as string);
        },
      }
    ) as ServicesRes;
  }

  function useViewless(): StoresAndServicesRes {
    const context = useContext(Context);

    const res = new Proxy(
      {},
      {
        get(target, key) {
          const storeInstance = context.stores[key as string];
          const store = useZustandStore(
            storeInstance || {
              getState: () => {
                return null;
              },
              subscribe: () => {},
            }
          );

          const hookRes = useZustandStore(
            context.hookStore,
            (state) => state[key as string]
          );
          if (context.stores[key as string]) {
            return store;
          }
          if (key in hooksDefinition) {
            return hookRes;
          }

          return new Proxy(
            {},
            {
              get(_, prop) {
                const service = context.services.get(key as string) as Record<
                  string,
                  unknown
                >;
                if (!service) {
                  return service;
                }
                const value = service[prop as string];
                if (typeof value === "function") {
                  return value.bind(service);
                }
                return value;
              },
            }
          );
        },
      }
    ) as StoresAndServicesRes;

    if (!providerEnable) {
      throw new Error("useViewless must be used in Provider");
    }

    return res;
  }

  function View({
    children,
    onMounted,
  }: {
    children: (res: StoresAndServicesRes) => ReactNode;
    onMounted?: (res: StoresAndServicesRes) => void;
  }): JSX.Element {
    const context = useContext(Context);
    const res = useViewless();
    useEffect(() => {
      onMounted?.(
        new Proxy(
          {},
          {
            get(target, key) {
              return context.services.get(key as string);
            },
          }
        ) as StoresAndServicesRes
      );
    }, []);
    return <>{children(res)}</>;
  }

  return {
    useZustandStore,
    Context,
    Provider,
    useHook,
    useStore,
    useService,
    useServices,
    useViewless,
    View,
    UseHook,
  };
}
