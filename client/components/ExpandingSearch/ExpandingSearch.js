import { useState } from "react";
import { AutoComplete } from "antd";
import Item from "../Item/Item";

const { Option } = AutoComplete;

export default function Complete() {
  const [result, setResult] = useState([]);

  const handleSearch = async (value) => {
    // Do fetch
    let res = [];
    // if (!value || value.indexOf("@") >= 0) {
    //   res = [];
    // } else {
    //   res = ["gmail.com", "test.com", "qq.com"].map(
    //     (domain) => `${value}@${domain}`
    //   );
    // }
    let response = await fetch("/api/search");
    res = await response.json();
    res = res.map((obj) => obj.name);
    console.log(res);
    setResult(res);
  };

  return (
    <AutoComplete
      style={{
        textAlign: "left",
        width: 1000,
      }}
      onSearch={handleSearch}
      placeholder=""
      size="large"
    >
      {result.map((email) => (
        <Option key={email} value={email}></Option>
      ))}
    </AutoComplete>
  );
}
