export interface TableItem {
  id: string;
  key: string;
  title: string;
  status: "success" | "error" | "warning" | "info";
  onOff: boolean;
  updateTimestamp: number;
  updateUser: {
    id: string;
    name: string;
  };
}

const initialData: TableItem[] = [
  {
    id: "1",
    key: "1",
    title: "数据可视化面板优化",
    status: "success",
    onOff: true,
    updateTimestamp: 1709529600000,
    updateUser: { id: "u1", name: "张明" },
  },
  {
    id: "2",
    key: "2",
    title: "用户权限系统重构",
    status: "warning",
    onOff: false,
    updateTimestamp: 1709443200000,
    updateUser: { id: "u2", name: "李华" },
  },
];

class MockBackendAPI {
  private static sleep() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
  private static id = 100;
  async get() {
    const res = JSON.parse(
      localStorage.getItem("__viewless_table") || JSON.stringify(initialData)
    ) as TableItem[];
    await MockBackendAPI.sleep();
    return { items: res, hasMore: false, cursor: "" };
  }
  async create(req: TableItem) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_table") || JSON.stringify(initialData)
    ) as TableItem[];
    MockBackendAPI.id += 1;
    const newItem = {
      ...req,
      updateUser: { id: MockBackendAPI.id.toString(), name: "当前用户" },
    };
    // 插入到最前面
    list.unshift(newItem);
    localStorage.setItem("__viewless_table", JSON.stringify(list));
    await MockBackendAPI.sleep();
    return { item: newItem };
  }
  async update(req: Partial<TableItem> & { id: string }) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_table") || JSON.stringify(initialData)
    ) as TableItem[];
    const index = list.findIndex((item) => item.id === req.id);
    if (index !== -1) {
      list[index] = req as TableItem;
    }
    localStorage.setItem("__viewless_table", JSON.stringify(list));
    await MockBackendAPI.sleep();
    return { item: req };
  }
  async delete(req: { id: string }) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_table") || JSON.stringify(initialData)
    ) as TableItem[];
    const index = list.findIndex((item) => item.id === req.id);
    list.splice(index, 1);
    localStorage.setItem("__viewless_table", JSON.stringify(list));
    await MockBackendAPI.sleep();
    return list;
  }
}

export const TableMockAPI = new MockBackendAPI();
