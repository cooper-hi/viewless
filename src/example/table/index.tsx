import { createViewless } from "@/core";
import { tableModel } from "./tableModel";
import { createHook } from "@/model/createHook";
import { Button, Drawer, Form, Input, Modal, Switch, Table, Tag } from "antd";
import type { FormInstance } from "antd/es/form";
import { createModal } from "@/model/createModal";
import { TableService } from "./TableService";
import { TableItem } from "./__apis";
import { useEffect } from "react";
import dayjs from "dayjs";

export interface DetailsDisplayDataItem {
  label?: React.ReactNode;
  content?: string;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  labelClassName?: string;
  contentClassName?: string;
  span?: number;
}

const { Provider, useHook, useViewless } = createViewless(
  {
    tableModel,
    addFormModel: createHook<[FormInstance<TableItem>], []>(Form.useForm),
    addFormDialog: createModal(),
    editFormModel: createHook<[FormInstance<TableItem>], []>(Form.useForm),
    editFormDialog: createModal(),
    detailDialog: createModal<DetailsDisplayDataItem[]>(),
  },
  { tableService: TableService }
);

function AddForm() {
  const { tableModel, addFormDialog, tableService } = useViewless();
  const [form] = useHook("addFormModel", []);

  return (
    <Modal
      title="新增"
      open={addFormDialog.visible}
      onOk={tableService.submitAdd}
      onCancel={tableService.hideAddFormDialog}
      okButtonProps={{ loading: tableModel.loading }}
    >
      <Form form={form} initialValues={{}}>
        <Form.Item
          required
          label="名称"
          name="title"
          rules={[
            {
              required: true,
              message: "请输入名称",
            },
          ]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item label="启用状态" name="onOff">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function EditForm() {
  const { tableModel, editFormDialog, tableService } = useViewless();
  const [form] = useHook("editFormModel", []);

  return (
    <Modal
      title="编辑"
      open={editFormDialog.visible}
      onOk={() => tableService.submitEdit()}
      onCancel={() => tableService.hideEditFormDialog()}
      okButtonProps={{ loading: tableModel.loading }}
    >
      <Form form={form} initialValues={{}}>
        <Form.Item
          required
          label="名称"
          name="title"
          rules={[
            {
              required: true,
              message: "请输入名称",
            },
          ]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item label="启用状态" name="onOff">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function DetailDialog() {
  const { detailDialog, tableService } = useViewless();
  return (
    <Drawer
      title="详情页面"
      open={detailDialog.visible}
      onClose={tableService.closeDetailDialog}
      width="500px"
    >
      {detailDialog.visible && (
        <div>
          {detailDialog.ctx?.map((item, index) => {
            return (
              <div key={index} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      ...item.labelStyle,
                      fontWeight: "bold",
                    }}
                  >
                    {item.label}:{item.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
}

function TableComponent() {
  const { tableModel, addFormDialog, tableService } = useViewless();
  useEffect(() => {
    tableModel.get({});
  }, []);

  return (
    <>
      <div className="p-2">
        <Button
          type="primary"
          className="!mb-2"
          onClick={() => addFormDialog.show()}
        >
          新增
        </Button>
        <Table
          columns={[
            {
              title: "名称",
              width: 200,
              dataIndex: "title",
              key: "title",
              fixed: "left",
            },
            {
              title: "链接状态",
              dataIndex: "status",
              key: "status",
              render: (status: string) => <Tag color={status}>{status}</Tag>,
            },
            {
              title: "启用状态",
              dataIndex: "onOff",
              key: "onOff",
              render: (onOff: boolean, record: TableItem) => (
                <Switch
                  checked={onOff}
                  onChange={(v) => {
                    const newRecord = { ...record, onOff: v };
                    tableModel.update({ req: newRecord, item: newRecord });
                  }}
                  size="small"
                />
              ),
            },
            {
              title: "更新时间",
              width: 150,
              dataIndex: "updateTimestamp",
              key: "updateTimestamp",
              render: (updateTimestamp: number) =>
                dayjs(updateTimestamp).format("YYYY-MM-DD"),
            },
            {
              title: "更新人",
              dataIndex: "updateUser",
              key: "updateUser",
              render: (updateUser: { id: string; name: string }) =>
                updateUser?.name,
            },
            {
              title: "操作",
              key: "operation",
              fixed: "right",
              width: 180,
              render: (ctx) => (
                <>
                  <div className="flex gap-2">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => tableService.openDetailDialog(ctx)}
                    >
                      详情
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => tableService.openEditFormDialog(ctx)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => tableModel.delete({ id: ctx.id })}
                    >
                      删除
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
          pagination={{
            pageSize: 8,
            total: tableModel.data.total,
          }}
          dataSource={tableModel.data.items}
          loading={tableModel.loading}
          scroll={{
            x: 800,
          }}
        />
      </div>
      <AddForm />
      <EditForm />
      <DetailDialog />
    </>
  );
}

export default function TableWrapper() {
  return (
    <Provider>
      <TableComponent />
    </Provider>
  );
}
