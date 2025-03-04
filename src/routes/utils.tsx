import { BarsOutlined, CodeSandboxOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import React from "react";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

export const items: MenuItem[] = [
  getItem("Component", "1", <CodeSandboxOutlined />, [
    getItem("Dialog", "1-1"),
    getItem("Form", "1-2"),
    getItem("Table", "1-3"),
  ]),
  getItem("Scene", "2", <BarsOutlined />, [
    getItem("Chat", "2-1"),
    getItem("Login", "2-2"),
    getItem("ScrollList", "2-3"),
    getItem("TodoList", "2-4"),
  ]),
];

export const defaultSelectedKey = "1-3";
