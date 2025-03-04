import { createCrud } from "@/model/createCrud";
import { TableMockAPI } from "./__apis";

export const tableModel = createCrud({
  get: TableMockAPI.get,
  create: TableMockAPI.create,
  update: TableMockAPI.update,
  delete: TableMockAPI.delete,
});
