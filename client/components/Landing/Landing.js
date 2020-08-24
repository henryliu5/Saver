import { Button, Space, Input, notification } from "antd";
import { UpOutlined } from "@ant-design/icons";
import styles from "./Landing.module.css";

export default function Landing() {
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Saver</h1>
      <h2 className={styles.subtitle}>Compare local grocers with one search</h2>
      <p className={styles.instruction}>Enter zip to get started</p>
      <Input></Input>
      <Button type="primary" shape="circle" icon={<UpOutlined />} />
    </div>
  );
}
