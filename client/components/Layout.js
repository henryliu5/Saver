import Head from "next/head";
import { Layout, Menu, Breadcrumb } from "antd";

const { Header, Content, Footer } = Layout;

export default function PageLayout({ content, menuHighlight }) {
  return (
    <>
      <Head>
        <title>Saver</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout className="layout">
          <div className="logo" />
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={[`${menuHighlight}`]}
          >
            <Menu.Item key="1">
              <a href="/"> Home </a>
            </Menu.Item>
            <Menu.Item key="2">
              <a href="/contact">Contact </a>
            </Menu.Item>
            <Menu.Item key="3" style={{float:'right'}}>Saver</Menu.Item>
          </Menu>
        <Content style={{ padding: "20px 20px" }}>
          <div className="site-layout-content">{content}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </>
  );
}
