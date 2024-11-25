"use client";

import React, { Suspense, useState } from "react";
import { Layout, Button, Space, Spin } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Footer } from "antd/es/layout/layout";
import Logo from "@/components/Logo/Logo";
import SideBar from "@/components/SideBar/SideBar";
import TopMenu from "@/components/TopMenu/TopMenu";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";

const { Header, Content, Sider } = Layout;

export default function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  const siderStyle: React.CSSProperties = {
    overflow: "auto",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#1B263B",
  };

  return (
    <Layout>
      <Sider
        width={240}
        style={siderStyle}
        collapsible
        collapsed={collapsed}
        onCollapse={(collapsed: boolean) => setCollapsed(collapsed)}
        breakpoint="md"
        onBreakpoint={(broken: boolean) => {
          setCollapsed(broken);
        }}
        collapsedWidth={80}
        trigger={null}
      >
        <div style={{ padding: "16px", color: "#fff" }}>
          <Logo collapsed={collapsed} />
        </div>
        <SideBar />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          minHeight: "100vh",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <TopMenu />
        </Header>
        <Breadcrumbs />
        <Content
          style={{
            margin: "10px 40px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 2,
          }}
        >
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense
              fallback={
                <Space>
                  <Spin />
                </Space>
              }
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Helios ©{new Date().getFullYear()} Created by Helix
        </Footer>
      </Layout>
    </Layout>
  );
}
