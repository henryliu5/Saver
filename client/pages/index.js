import Layout from "../components/Layout/Layout";
import Landing from "../components/Landing/Landing";
import Home from "../components/Home/Home";
import React, { useState, useEffect } from "react";

export default function Index() {
  let [zip, setZip] = useState(null);

  useEffect(() => {
    setZip(localStorage.getItem("zip"));
  });

  if (zip == null) {
    return (
      <Landing
        updateFunc={(text) => {
          localStorage.setItem("zip", text);
          setZip(text);
        }}
      />
    );
  } else {
    return <Layout content={<Home />} menuHighlight="1"></Layout>;
  }
}
