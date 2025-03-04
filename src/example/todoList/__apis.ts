export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

class MockBackendAPI {
  private static sleep() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  async get() {
    const res = JSON.parse(
      localStorage.getItem("__viewless_todolist") || "[]"
    ) as TodoItem[];
    await MockBackendAPI.sleep();
    return { items: res, hasMore: false, cursor: "" };
  }
  async create(req: TodoItem) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_todolist") || "[]"
    ) as TodoItem[];
    list.push(req);
    localStorage.setItem("__viewless_todolist", JSON.stringify(list));
    await MockBackendAPI.sleep();
    return { item: req };
  }
  async update(req: Partial<TodoItem> & { id: string }) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_todolist") || "[]"
    ) as TodoItem[];
    const index = list.findIndex((item) => item.id === req.id);
    if (index !== -1) {
      list[index] = req as TodoItem;
    }
    localStorage.setItem("__viewless_todolist", JSON.stringify(list));
    await MockBackendAPI.sleep();
  }
  async delete(req: { id: string }) {
    const list = JSON.parse(
      localStorage.getItem("__viewless_todolist") || "[]"
    ) as TodoItem[];
    const index = list.findIndex((item) => item.id === req.id);
    list.splice(index, 1);
    localStorage.setItem("__viewless_todolist", JSON.stringify(list));
    await MockBackendAPI.sleep();
  }
}

export const TodoAppAPI = new MockBackendAPI();
