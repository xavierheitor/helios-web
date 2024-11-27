"use client";

import React from "react";
import { Result, Button } from "antd";
import Link from "next/link";

export default function Custom404() {
  console.log("Custom404");
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Desculpe, a página que você está procurando não existe."
        extra={
          <Link href="/dashboard">
            <Button type="primary">Voltar para o Dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
