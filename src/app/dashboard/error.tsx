"use client";

import { Alert, Card } from "antd";

export default function Page() {
  return (
    <Card title="Erro">
      <Alert message="Erro" type="error" showIcon />
    </Card>
  );
}
