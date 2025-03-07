import Login from "@/example/login";
import React, { useCallback, useMemo, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { defaultSelectedKey, items } from "./utils";
import Dialog from "@/example/dialog";
import Form from "@/example/form";
import Table from "@/example/table";
import Chat from "@/example/chat";
import ScrollList from "@/example/scrollList";
import TodoList from "@/example/todoList";

import "./index.css";

const { Header, Content, Footer, Sider } = Layout;

const Index: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState<string>(defaultSelectedKey);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleClick = useCallback(({ key }: { key: string }) => {
    setActiveKey(key);
  }, []);

  const renderContent = useMemo(() => {
    switch (activeKey) {
      case "1-1":
        return <Dialog />;
      case "1-2":
        return <Form />;
      case "1-3":
        return <Table />;
      case "2-1":
        return <Chat />;
      case "2-2":
        return <Login />;
      case "2-3":
        return <ScrollList />;
      case "2-4":
        return <TodoList />;
      default:
        return <div>404</div>;
    }
  }, [activeKey]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div />
        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={["1", "2"]}
          defaultSelectedKeys={[defaultSelectedKey]}
          items={items}
          onClick={handleClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>{renderContent}</Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Index;
