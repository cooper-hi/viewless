import { inject, injectable } from "inversify";

import { type TodoItem } from "./__apis";
import { type appModel as IAppModel } from "./appModel";
import { type todoModel as ITodoModel } from "./todoModel";

@injectable()
export class TodoService {
  constructor(
    @inject("todoModel")
    private readonly todoModel: ReturnType<typeof ITodoModel>,
    @inject("appModel") private readonly appModel: ReturnType<typeof IAppModel>
  ) {}
  get getShowTodoList() {
    if (this.appModel.filterStatus === "active") {
      return this.todoModel.data.items.filter((item) => !item.completed);
    }
    if (this.appModel.filterStatus === "completed") {
      return this.todoModel.data.items.filter((item) => item.completed);
    }
    return this.todoModel.data.items;
  }
  async addTodo(title: string) {
    const todo: TodoItem = {
      id: this.createId(),
      title,
      completed: false,
    };
    this.todoModel.create({ req: todo, item: todo });
    this.appModel.setInput("");
  }
  private createId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
