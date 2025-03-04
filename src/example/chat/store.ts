import { createStore } from "zustand";

import { MockAPI, type DataType } from "./__apis";
import { createPaginate, PaginateStore } from "@/model/createPaginate";
import { mutateState } from "@/core/utils";

export function chatStore(
  set: (obj: Partial<ReturnType<typeof chatStore>>) => void,
  get: () => ReturnType<typeof chatStore>
) {
  return {
    chatList: [
      {
        id: "chatId1",
        title: "会话1",
      },
      {
        id: "chatId2",
        title: "会话2",
      },
      {
        id: "chatId3",
        title: "会话3",
      },
    ],
    currentChatId: "",
    chatStores: {} as Record<string, PaginateStore<DataType>>,
    switchChat(id: string) {
      mutateState(set, get, (state) => {
        if (!state.chatStores[id]) {
          state.chatStores[id] = createStore(
            createPaginate({
              fetchData: MockAPI.getList,
            })
          );
        }
        state.currentChatId = id;
      });
    },
    computed: {
      get currentChat() {
        return get().chatStores[get().currentChatId];
      },
    },
  };
}
