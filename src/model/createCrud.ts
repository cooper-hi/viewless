import { mutateState } from "@/core/utils";

export interface BaseDataItem {
  id: string | number;
}
export interface ICrudData<DataItem extends BaseDataItem> {
  items: DataItem[];
  hasMore: boolean;
  cursor: string;
  total?: number;
}

export function createCrud<
  DataItem extends BaseDataItem,
  GetReq,
  CreateReq,
  CreateRes extends { item?: DataItem },
  UpdateReq,
  UpdateRes,
  DeleteReq extends { id: string | number },
  DeleteRes
>(config: {
  get: (req: GetReq & { cursor: string }) => Promise<ICrudData<DataItem>>;
  create: (req: CreateReq) => Promise<CreateRes>;
  update: (req: UpdateReq) => Promise<UpdateRes>;
  delete: (req: DeleteReq) => Promise<DeleteRes>;
}) {
  return function crud(
    set: (obj: Partial<ReturnType<typeof crud>>) => void,
    get: () => ReturnType<typeof crud>
  ) {
    return {
      data: { items: [], hasMore: false, cursor: "" } as ICrudData<DataItem>,
      error: null as unknown | null,
      loading: false,
      currentGetData: null as ICrudData<DataItem> | null,
      setLoading(loading: boolean) {
        set({ loading });
      },
      async get(req: GetReq): Promise<ICrudData<DataItem>> {
        try {
          set({ loading: true });
          const lastCursor = get().data.cursor;
          const res = await config.get({ ...req, cursor: lastCursor });

          if (!lastCursor) {
            set({
              data: res,
              loading: false,
              error: null,
              currentGetData: res,
            });
          } else {
            mutateState(set, get, (state) => {
              const { items, ...rest } = res;
              state.data.items.push(...items);
              Object.assign(state.data, rest);
              state.currentGetData = res;
            });
          }
          return res;
        } catch (error) {
          set({ loading: false, error });
          throw error;
        }
      },
      async create({
        req,
        item,
        position,
      }: {
        req: CreateReq;
        item?: DataItem;
        position?: "before" | "after";
      }): Promise<CreateRes> {
        try {
          if (item) {
            mutateState(set, get, (state) => {
              if (position === "before") {
                state.data.items.unshift(item);
              } else {
                state.data.items.push(item);
              }
            });
          }
          set({ loading: true });
          const res = await config.create(req);
          const backendItem = res.item;
          if (!item && backendItem) {
            mutateState(set, get, (state) => {
              if (position === "before") {
                state.data.items.unshift(backendItem);
              } else {
                state.data.items.push(backendItem);
              }
            });
          }
          set({ loading: false, error: null });
          return res;
        } catch (error) {
          if (item) {
            mutateState(set, get, (state) => {
              state.data.items.splice(
                state.data.items.findIndex((item2) => item2.id === item.id),
                1
              );
            });
          }
          set({ loading: false, error });
          throw error;
        }
      },
      async update({
        req,
        item,
      }: {
        req: UpdateReq;
        item?: Partial<DataItem> & BaseDataItem;
      }): Promise<UpdateRes> {
        const currentItem = get().currentGetData?.items.find(
          (i) => i.id === item?.id
        );
        try {
          if (item) {
            mutateState(set, get, (state) => {
              const index = state.data.items.findIndex((i) => i.id === item.id);
              if (index !== -1) {
                Object.assign(state.data.items[index], item);
              }
            });
          }

          set({ loading: true });
          const res = await config.update(req);
          set({ loading: false, error: null });
          return res;
        } catch (error) {
          if (currentItem) {
            mutateState(set, get, (state) => {
              const index = state.data.items.findIndex(
                (i) => i.id === currentItem.id
              );
              if (index !== -1) {
                state.data.items[index] = currentItem;
              }
            });
          }
          set({ loading: false, error });
          throw error;
        }
      },
      async delete(req: DeleteReq): Promise<DeleteRes> {
        const currentIndex = Number(
          get().data?.items.findIndex((i) => i.id === req.id)
        );
        const currentItem =
          currentIndex >= 0 ? get().data?.items[currentIndex] : null;

        try {
          mutateState(set, get, (state) => {
            const index = state.data.items.findIndex(
              (item) => item.id === req.id
            );
            if (index !== -1) {
              state.data.items.splice(index, 1);
            }
          });
          set({ loading: true });
          const res = await config.delete(req);
          set({ loading: false, error: null });
          return res;
        } catch (error) {
          if (currentItem) {
            mutateState(set, get, (state) => {
              state.data.items[currentIndex] = currentItem;
            });
          }
          set({ loading: false, error });
          throw error;
        }
      },
    };
  };
}
