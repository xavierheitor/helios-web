

import React, { useEffect } from "react";
import { Form, Input, Button, Alert, notification, InputNumber } from "antd";
import { ActionResult } from "../../../../types/actions/action-result";
import { Role } from "@prisma/client";
import { editCargo } from "@/lib/actions/funcionario/cargo/editCargo";
import { newCargo } from "@/lib/actions/funcionario/cargo/newCargo";

interface CargoFormProps {
  cargo?: Role | null;
  onSuccess: () => void;
}

interface CargoFormValues {
  id?: number;
  name: string;
  description?: string;
  baseSalary?: number;
}

const CargoForm: React.FC<CargoFormProps> = ({ cargo, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (cargo) {
      form.setFieldsValue(cargo);
    } else {
      form.resetFields();
    }
  }, [cargo, form]);

  const onFinish = async (values: CargoFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const action = cargo ? editCargo : newCargo;

      // preparar os dados
      const data = new FormData();
      if (values.id) data.append("id", values.id.toString());
      data.append("name", values.name);
      data.append("description", values.description || "");
      data.append("baseSalary", values.baseSalary?.toString() || "");

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!cargo) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof CargoFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o cargo:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar o cargo.",
      });
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        id: cargo?.id,
        name: cargo?.name || "",
        description: cargo?.description || "",
        baseSalary: cargo?.baseSalary || undefined,
      }}
    >
      {cargo && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome do Cargo"
        rules={[
          { required: true, message: "O nome do cargo é obrigatório!" },
          { max: 100, message: "O nome pode ter no máximo 100 caracteres." },
        ]}
      >
        <Input placeholder="Digite o nome do cargo" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Descrição"
        rules={[
          {
            max: 255,
            message: "A descrição pode ter no máximo 255 caracteres.",
          },
        ]}
      >
        <Input.TextArea
          placeholder="Descreva o cargo (opcional)"
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
      </Form.Item>

      <Form.Item
        name="baseSalary"
        label="Salário Base"
        rules={[
          {
            type: "number",
            min: 0,
            message: "O salário base deve ser positivo!",
          },
        ]}
      >
        <InputNumber
          placeholder="Digite o salário base (opcional)"
          style={{ width: "100%" }}
          precision={2}
        />
      </Form.Item>

      {error && <Alert type="error" message={error} showIcon closable />}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {cargo ? "Atualizar Cargo" : "Adicionar Cargo"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CargoForm;
