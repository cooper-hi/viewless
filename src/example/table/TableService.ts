import { inject, injectable } from "inversify";

import { type TableItem } from "./__apis";
import { type tableModel as ITableModel } from "./tableModel";
import { createModal } from "@/model/createModal";
import { message } from "antd";
import type { FormInstance } from "antd/es/form";

type IModal<T> = ReturnType<ReturnType<typeof createModal<T>>>;

@injectable()
export class TableService {
  constructor(
    @inject("tableModel") private tableModel: ReturnType<typeof ITableModel>,

    @inject("addFormModel") private addFormModel: [FormInstance],
    @inject("addFormDialog") private addFormDialog: IModal<TableItem>,

    @inject("editFormModel") private editFormModel: [FormInstance],
    @inject("editFormDialog") private editFormDialog: IModal<TableItem>,

    @inject("detailDialog")
    private detailDialog: IModal<
      {
        label: string;
        content: string;
      }[]
    >
  ) {}

  async submitAdd() {
    const addForm = this.addFormModel[0];
    await addForm.validateFields();

    const hasError = addForm.getFieldsError().some((field) => {
      return field.errors.length > 0;
    });
    if (hasError) {
      return message.error("请填写完整信息");
    }
    const newItem: TableItem = {
      ...addForm.getFieldsValue(),
      id: Date.now().toString(),
      updateTimestamp: Date.now(),
      key: Date.now().toString(),
      status: "success",
    };

    await this.tableModel.create({ req: newItem, position: "before" });

    this.tableModel.get({});
    this.hideAddFormDialog();
  }
  hideAddFormDialog() {
    const [addForm] = this.addFormModel;
    addForm.resetFields();
    this.addFormDialog.hide();
  }

  async openEditFormDialog(ctx: TableItem) {
    this.editFormDialog.show();
    this.editFormDialog.setCtx(ctx);
    const [editForm] = this.editFormModel;
    editForm.setFieldsValue(ctx);
  }

  async submitEdit() {
    const [editForm] = this.editFormModel;
    await editForm.validateFields();
    const hasError = editForm.getFieldsError().some((field) => {
      return field.errors.length > 0;
    });

    if (hasError) {
      return message.error("请填写完整信息");
    }

    await this.tableModel.update({
      req: editForm.getFieldsValue(),
      item: { ...editForm.getFieldsValue(), id: this.editFormDialog.ctx?.id },
    });
    this.hideEditFormDialog();
  }

  hideEditFormDialog() {
    const [editForm] = this.editFormModel;
    editForm.resetFields();
    this.editFormDialog.hide();
  }

  openDetailDialog(ctx: TableItem) {
    const data = Object.entries(ctx).map(([label, content]) => ({
      label,
      content: JSON.stringify(content),
    }));
    this.detailDialog.open(data);
  }
  closeDetailDialog() {
    this.detailDialog.hide();
    this.detailDialog.setCtx([]);
  }
}
