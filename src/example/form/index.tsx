import { createViewless } from "@/core";
import { createHook } from "@/model/createHook";
import { Button, Form, Input } from "antd";
import type { FormInstance } from "antd/es/form";
import { useState } from "react";

interface IFormItemType {
  username: string;
  password: string;
}

const { Provider, useHook, useViewless } = createViewless(
  {
    form1: createHook<[FormInstance<IFormItemType>], []>(Form.useForm),
  },
  {}
);

function FormComponent() {
  const [form] = useHook("form1", []);

  return (
    <Form form={form} initialValues={{ username: "123", password: "123" }}>
      <Form.Item
        required
        label="用户名"
        name="username"
        rules={[
          {
            required: true,
            message: "请输入用户名",
          },
        ]}
      >
        <Input placeholder="请输入用户名" />
      </Form.Item>
      <Form.Item
        required
        label="密码"
        name="password"
        rules={[
          {
            required: true,
            message: "请输入密码",
          },
        ]}
      >
        <Input.Password placeholder="请输入密码" />
      </Form.Item>
    </Form>
  );
}

function Component2() {
  const { form1 } = useViewless();
  const [form] = form1 ?? [];
  const [formValues, setFormValues] = useState<IFormItemType | undefined>();

  return (
    <div>
      <Button onClick={() => setFormValues(form?.getFieldsValue())}>
        查询表单值:
      </Button>
      <div>{JSON.stringify(formValues)}</div>
    </div>
  );
}

export default function FormIndex() {
  return (
    <Provider>
      <FormComponent />
      <Component2 />
    </Provider>
  );
}
