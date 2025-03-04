import produce, { type Draft } from "immer";
import { type StoreApi } from "zustand";

export interface PaginateStoreBaseDataItem {
  id: string | number;
}

export type PaginateStore<T extends PaginateStoreBaseDataItem> = StoreApi<
  ReturnType<createPaginate<T>>
>;

type createPaginate<T extends PaginateStoreBaseDataItem> = ReturnType<
  typeof createPaginate<T>
>;

export function createPaginate<T extends PaginateStoreBaseDataItem>({
  fetchData,
}: {
  fetchData: (req: { limit?: number; cursor: string }) => Promise<{
    data: T[];
    cursor: string;
    hasMore: boolean;
  }>;
}) {
  return function PaginateStore(
    set: (obj: Partial<ReturnType<typeof PaginateStore>>) => void,
    get: () => ReturnType<typeof PaginateStore>
  ) {
    return {
      data: [] as T[],
      hasMore: true,
      cursor: "",
      loading: false,
      setLoading(loading: boolean) {
        set({ loading });
      },
      addData(res: { data: T[]; hasMore: boolean; cursor: string }) {
        set(
          produce(get(), (state) => {
            state.data.push(...(res.data as Draft<T>[]));
            state.hasMore = res.hasMore;
            state.cursor = res.cursor;
          })
        );
      },
      updateItem(id: string | number, item: Partial<T>) {
        set(
          produce(get(), (state) => {
            const index = state.data.findIndex((item2) => item2.id === id);
            if (index !== -1) {
              Object.assign(state.data[index], item);
            }
          })
        );
      },
      deleteItem(id: string | number) {
        set(
          produce(get(), (state) => {
            state.data.splice(
              state.data.findIndex((item2) => item2.id === id),
              1
            );
          })
        );
      },
      clearData() {
        set({ data: [], cursor: "", hasMore: true });
      },

      async fetchNextPage(req?: { limit?: number }) {
        if (!get().hasMore && get().loading) {
          return;
        }
        get().setLoading(true);
        try {
          const res = await fetchData({
            limit: req?.limit,
            cursor: get().cursor,
          });
          get().addData(res);
          get().setLoading(false);
        } catch (e) {
          get().setLoading(false);
          throw e;
        }
      },
    };
  };
}
