export function createAction<R extends unknown[], T>(
  action: (...args: R) => Promise<T>
) {
  return function actionCreator(
    set: (obj: Partial<ReturnType<typeof actionCreator>>) => void,
    get: () => ReturnType<typeof actionCreator>
  ) {
    return {
      data: undefined as T | undefined,
      error: null as unknown | null,
      loading: false,
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      async call(...args: R): Promise<T> {
        set({ loading: true });
        try {
          const res = await action(...args);
          set({ data: res, loading: false, error: null });
          return res;
        } catch (err) {
          set({ loading: false, error: err });
          throw err;
        }
      },
    };
  };
}
