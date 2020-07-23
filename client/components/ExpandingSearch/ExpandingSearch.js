import { useState } from "react";
import { AutoComplete } from "antd";
import Item from "../Item/Item"

const { Option } = AutoComplete;

export default function Complete() {
  const [result, setResult] = useState([]);

  const handleSearch = (value) => {
    // Do fetch
    let res = [];
    if (!value || value.indexOf("@") >= 0) {
      res = [];
    } else {
      res = ["gmail.com", "test.com", "qq.com"].map(
        (domain) => `${value}@${domain}`
      );
    }

    setResult(res);
  };

  return (
    <AutoComplete
      style={{
        width: 1000
      }}
      onSearch={handleSearch}
      placeholder="input here"
    >
      {result.map((email) => (
        <Option key={email} value={email}>
        </Option>
      ))}
    </AutoComplete>
  );
}
