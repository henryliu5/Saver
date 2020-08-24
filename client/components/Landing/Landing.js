import { Button, Space, Input, notification } from "antd";
import { UpOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import styles from "./Landing.module.css";

export default function Landing() {
  let [input, setInput] = useState(null);

  // Focus on text box
  useEffect(() => {
    console.log(input)
    if(input != null)
    input.focus();
  }, [input]);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Saver</h1>
      <h2 className={styles.subtitle}>Compare local grocers with one search</h2>
      <p className={styles.instruction}>Enter zip to get started</p>
      <Input
        placeholder="e.g. 75022"
        bordered={true}
        ref={(input) => setInput(input)}
      />
      <Button type="primary" shape="circle" icon={<UpOutlined />} />
    </div>
  );
}
