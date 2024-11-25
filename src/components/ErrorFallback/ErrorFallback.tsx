import { Alert, Card } from "antd";

export default function ErrorFallback() {
  return (
    <Card title="Usuários">
      <Alert message="Erro" type="error" showIcon />
    </Card>
  );
}
