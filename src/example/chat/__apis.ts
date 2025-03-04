// starling-disable-file
export interface DataType {
  id: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

export const MockAPI = {
  /** mock分页请求 */
  async getList(req: { limit?: number; cursor: string }): Promise<{
    data: DataType[];
    cursor: string;
    hasMore: boolean;
  }> {
    const res = await fetch(
      "https://randomuser.me/api/?results=10&inc=id,name,email,nat,picture&noinfo"
    );
    const res2 = await res.json();
    const data = (res2.results as { id: { value: string } }[])
      .map((item) => ({
        ...item,
        id: item.id?.value,
      }))
      .filter((item) => item.id);
    return {
      data: data as DataType[],
      cursor: data[data.length - 1].id,
      hasMore: data.length !== 0,
    };
  },
};
