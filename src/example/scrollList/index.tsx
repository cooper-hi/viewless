import { createViewless } from "@/core";
import { createPaginate } from "@/model/createPaginate";
import { MockAPI } from "./__apis";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Avatar, List, Skeleton } from "antd";

const { Provider, useViewless } = createViewless(
  {
    paginage: createPaginate({ fetchData: MockAPI.getList }),
  },
  {}
);

function Paginate() {
  const { paginage } = useViewless();

  useEffect(() => {
    paginage.fetchNextPage();
  }, []);

  return (
    <div id="scrollablePaginateDemo">
      <InfiniteScroll
        dataLength={paginage.data.length}
        next={paginage.fetchNextPage}
        hasMore={paginage.hasMore}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<div>没有更多了</div>}
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

export default function ScrollList() {
  return (
    <Provider>
      <Paginate />
    </Provider>
  );
}
