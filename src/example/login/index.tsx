import { createViewless } from "@/core";
import { createAction } from "@/model/createAction";
import { Button } from "antd";
import React from "react";

const { Provider, useViewless } = createViewless(
  {
    action1: createAction(async (req: { name: string }) => {
      if (!req.name) {
        throw new Error("name is required");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        name: req.name,
        accessToken: Math.random().toString(),
      };
    }),
  },
  {}
);

function Component1() {
  const { action1 } = useViewless();
  return (
    <Button
      type="primary"
      onClick={() => action1.call({ name: "deepseek" })}
      loading={action1.loading}
    >
      Login
    </Button>
  );
}

function Component2() {
  const { action1 } = useViewless();
  return (
    <>
      <div>Search Name: {action1.data?.name}</div>
      <div>Search AccessToken: {action1.data?.accessToken}</div>
      {action1.error ? (
        <div> Error Message: {JSON.stringify(action1.error)}</div>
      ) : null}
    </>
  );
}

export default function Login() {
  return (
    <Provider>
      <div>
        <Component1 />
        <Component2 />
      </div>
    </Provider>
  );
}
