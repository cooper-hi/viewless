import React, { useEffect } from "react";

import { appModel } from "./appModel";
import { todoModel } from "./todoModel";
import { TodoService } from "./TodoService";
import { createViewless } from "@/core";
import { Button, Card, Checkbox, Input, Tag } from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";

export const { Provider, useViewless } = createViewless(
  { appModel, todoModel },
  { todoService: TodoService }
);

// ---------------- View部分 ----------------
function Todolist() {
  const { appModel, todoModel, todoService } = useViewless();
  useEffect(() => {
    todoModel.get({});
  }, []);
  return (
    <div className="p-2 pt-4 w-[500px]  ml-auto mr-auto">
      <div>Todos</div>
      <Input
        placeholder="What needs to be done?"
        className=" mt-2"
        value={appModel.input}
        onChange={(e) => {
          appModel.setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            todoService.addTodo(
              (event.target as unknown as { value: string }).value
            );
          }
        }}
      />

      <Card className="mt-2 w-full">
        {todoService.getShowTodoList.map((item) => {
          return (
            <div key={item.id} className="flex items-center mb-1">
              <Checkbox
                checked={item.completed}
                onChange={(v) => {
                  todoModel.update({
                    req: { id: item.id, completed: v.target.checked },
                    item: { id: item.id, completed: v.target.checked },
                  });
                }}
              />
              <input
                placeholder="input task"
                value={item.title}
                onChange={(e) => {
                  todoModel.update({
                    req: { id: item.id, title: e.target.value },
                    item: { ...item, title: e.target.value },
                  });
                }}
                className={`${
                  item.completed ? "line-through " : ""
                }pl-2 leading-[14px] flex-1 text-black bg-transparent border-none outline-none w-full block `}
              />
              <Button
                onClick={() => {
                  todoModel.delete({ id: item.id });
                }}
                size="small"
                shape="circle"
                icon={<CloseOutlined />}
              />
            </div>
          );
        })}

        <div className="flex mt-2 items-center">
          <Tag color="neutral">
            {todoService.getShowTodoList.length} items left
          </Tag>
          <div className="!ml-4">
            <Button
              size="small"
              type={appModel.filterStatus === "all" ? "link" : "text"}
              onClick={() => {
                appModel.setFilterStatus("all");
              }}
            >
              all
            </Button>
            <Button
              size="small"
              type={appModel.filterStatus === "active" ? "link" : "text"}
              className="!ml-2"
              onClick={() => {
                appModel.setFilterStatus("active");
              }}
            >
              active
            </Button>
            <Button
              size="small"
              type={appModel.filterStatus === "completed" ? "link" : "text"}
              className="!ml-2"
              onClick={() => {
                appModel.setFilterStatus("completed");
              }}
            >
              completed
            </Button>
          </div>

          {todoModel.loading && (
            <div className=" flex items-center ml-4 text-gray-500">
              <LoadingOutlined />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function () {
  return (
    <Provider>
      <Todolist />
    </Provider>
  );
}
