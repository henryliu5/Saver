import { Button, Space, Input, notification } from "antd";
import { UpOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import styles from "./Landing.module.css";

export default function Landing({ updateFunc }) {
  let [input, setInput] = useState(null);
  let [text, setText] = useState("");

  // Focus on text box
  useEffect(() => {
    if (input != null) {
      input.focus();
    }
  }, [input]);

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Saver</h1>
      <h2 className={styles.subtitle}>Compare local grocers with one search</h2>
      <p className={styles.instruction}>Enter zip to get started</p>
      <div className={styles.search}>
        <Input
          onChange={(e) => setText(e.target.value)}
          style={{
            textAlign: "center",
            width: 150,
          }}
          placeholder="e.g. 75022"
          bordered={true}
          ref={(input) => setInput(input)}
        />
      </div>

      <Button
        className={styles.button}
        type="primary"
        disabled={text.length != 5}
        shape="circle"
        icon={<UpOutlined />}
        onClick={()=>(updateFunc(text))}
      />
    </div>
  );
}
