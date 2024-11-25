// app/login/page.tsx

"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Alert, Card, Typography } from "antd";

const { Title } = Typography;

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      username: values.username,
      password: values.password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card title={<Title level={3}>Login</Title>} style={{ width: 400 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Usuário"
            name="username"
            rules={[
              { required: true, message: "Por favor, insira seu usuário!" },
            ]}
          >
            <Input autoComplete="username" placeholder="Digite seu usuário" />
          </Form.Item>

          <Form.Item
            label="Senha"
            name="password"
            rules={[
              { required: true, message: "Por favor, insira sua senha!" },
            ]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder="Digite sua senha"
            />
          </Form.Item>

          {error && (
            <Form.Item>
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
