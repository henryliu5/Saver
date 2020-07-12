import { Button, Space, Input, notification } from "antd";

const { Search } = Input;

export default function Home() {
  return (
    <div className="container">
      <h1 className="title">
        Welcome to <a href="https://nextjs.org">Next.js!</a>
      </h1>
      <Space>
        <Button type="primary" onClick= {openNotification}>Primary Button</Button>
        <Button>Default Button</Button>
        <Button type="dashed">Dashed Button</Button>
        <Button type="text">Text Button</Button>
        <Button type="link">Link Button</Button>
      </Space>
      <Input size='large' placeholder="Apples" />
      <Search placeholder="input search loading default" loading />
      <br />
      <br />
      <Search
        placeholder="input search loading with enterButton"
        loading
        enterButton
      />
    </div>
  );
}


const openNotification = () => {
    notification.open({
      message: 'Notification Title',
      description:
        'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  };