import { editUser } from "@/lib/actions/user/editUser";
import { newUser } from "@/lib/actions/user/newUser";
import { User } from "@prisma/client";
import { Alert, Button, Form, FormProps, Input, notification } from "antd";
import React, { useEffect } from "react";
import { ActionResult } from "../../../../types/actions/action-result";

interface UserFormProps {
  user?: Partial<User> | null;
  onSuccess: () => void;
}

interface UserFormValues {
  id?: number;
  name: string;
  username: string;
  password?: string;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        id: user.id,
        name: user.name ?? "",
        username: user.username ?? "",
      });
    }
  }, [user, form]);

  const onFinish: FormProps<UserFormValues>["onFinish"] = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Executar a ação apropriada (novo ou editar)
      const action = user ? editUser : newUser;

      // Preparar FormData
      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("name", values.name);
      data.append("username", values.username);
      if (values.password) {
        data.append("password", values.password);
      }

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!user) {
          form.resetFields();
        }
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof UserFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o usuário:", err);
      notification.error({ message: "Ocorreu um erro ao salvar o usuário." });
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="userForm"
      onFinish={onFinish}
      initialValues={{
        id: user?.id,
        name: user?.name ?? "",
        username: user?.username ?? "",
      }}
      disabled={loading}
    >
      {user && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome"
        hasFeedback
        rules={[{ required: true, message: "Preencha o nome!" }]}
      >
        <Input placeholder="Nome do usuario" autoComplete="name" />
      </Form.Item>

      <Form.Item
        name="username"
        label="Usuário"
        hasFeedback
        rules={[{ required: true, message: "Preencha o usuário!" }]}
      >
        <Input placeholder="login" autoComplete="username" />
      </Form.Item>

      {/* Campo para senha */}
      <Form.Item
        name="password"
        label="Senha"
        rules={user ? [] : [{ message: "Por favor, insira sua senha!" }]} // Opcional no modo de edição
        hasFeedback
      >
        <Input.Password
          autoComplete="new password"
          placeholder="Digite a senha"
        />
      </Form.Item>

      {/* Campo para confirmar senha */}
      <Form.Item
        name="confirmPassword"
        label="Confirmar Senha"
        dependencies={["password"]}
        hasFeedback
        rules={[
          user ? {} : { message: "Por favor, confirme sua senha!" }, // Opcional no modo de edição
          // Validação de igualdade das senhas
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("As senhas não correspondem!"));
            },
          }),
        ]}
      >
        <Input.Password
          autoComplete="new password"
          placeholder="Confirme a senha"
        />
      </Form.Item>

      {/* Exibir mensagem de erro geral */}
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

      {/* Botão de submissão */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {user ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
