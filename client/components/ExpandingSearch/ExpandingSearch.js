import { useState } from "react";
import { AutoComplete } from "antd";
import SearchItem from "../SearchItem/SearchItem";

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
        width: 1000
      }}
      listHeight='1000'
      onSearch={handleSearch}
      placeholder="e.g. Apples"
      size="large"
      autoFocus={true}
    >
      {result.map((email) => (
        <Option key={email} value={<SearchItem productName='34343'></SearchItem>}></Option>
      ))}
    </AutoComplete>
  );
}
