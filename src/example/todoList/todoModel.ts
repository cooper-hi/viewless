import { createCrud } from "@/model/createCrud";
import { TodoAppAPI } from "./__apis";

export const todoModel = createCrud({
  get: TodoAppAPI.get,
  create: TodoAppAPI.create,
  update: TodoAppAPI.update,
  delete: TodoAppAPI.delete,
});
