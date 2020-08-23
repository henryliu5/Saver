import Layout from "../components/Layout/Layout";
import Home from "../components/Home/Home";
import React, { useState, useEffect } from "react";
import Router from "next/router";

export default function Index() {
  const [zip, updateZip] = useState(null);

  useEffect(() => {
    updateZip(localStorage.getItem("zip"));
  });
  console.log(zip);
  if (zip == null) {
    Router.push("/landing");
    return null;
  } else {
    return <Layout content={<Home />} menuHighlight="1"></Layout>;
  }
}
