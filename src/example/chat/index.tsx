import { createViewless } from "@/core";
import { chatStore } from "./store";
import { useEffect } from "react";
import { Avatar, List, Menu, Skeleton } from "antd";
import { PaginateStore } from "@/model/createPaginate";
import { DataType } from "./__apis";
import InfiniteScroll from "react-infinite-scroll-component";

const { Provider, useZustandStore, useViewless } = createViewless(
  { chats: chatStore },
  {}
);

function CurrentChat({ chatStore }: { chatStore: PaginateStore<DataType> }) {
  const paginage = useZustandStore(chatStore);
  useEffect(() => {
    paginage.fetchNextPage();
  }, [chatStore]);

  return (
    <div id="scrollablePaginateDemo">
      <InfiniteScroll
        dataLength={paginage.data.length}
        next={paginage.fetchNextPage}
        hasMore={paginage.hasMore}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage="It is all, nothing more 🤐"
        scrollableTarget="scrollablePaginateDemo"
      >
        <List
          dataSource={paginage.data}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.picture.large} />}
                title={item.name.last}
                description={item.email}
              />
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
}

function ChatList() {
  const { chats } = useViewless();
  useEffect(() => {
    chats.switchChat(chats.chatList[0].id);
  }, []);

  return (
    <div>
      <div>
        <div>ChatApp</div>
        <Menu defaultSelectedKeys={[chats.chatList[0].id]} mode="inline">
          {chats.chatList.map((item) => {
            return (
              <Menu.Item
                key={item.id}
                onClick={() => chats.switchChat(item.id)}
              >
                {item.title}
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
      <div>
        {chats.currentChatId && (
          <CurrentChat chatStore={chats.computed.currentChat} />
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  return (
    <Provider>
      <ChatList />
    </Provider>
  );
}
