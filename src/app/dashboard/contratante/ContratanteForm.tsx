import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  FormProps,
  notification,
  Select,
} from "antd";
import { Contractor } from "@prisma/client";
import { editContratante } from "@/lib/actions/contratante/editContratante";
import { newContratante } from "@/lib/actions/contratante/newContratante";
import { ActionResult } from "../../../../types/actions/action-result";

import { STATE } from "@/enums/states";

interface ContractorFormProps {
  contractor?: Partial<Contractor> | null;
  onSuccess: () => void;
}

interface ContractorFormValues {
  id?: number;
  name: string;
  cnpj: string;
  state: string;
}

const ContractorForm: React.FC<ContractorFormProps> = ({
  contractor,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (contractor) {
      form.setFieldsValue({
        id: contractor.id,
        name: contractor.name ?? "",
        cnpj: contractor.cnpj ?? "",
        state: contractor.state ?? "",
      });
    }
  }, [contractor, form]);

  const onFinish: FormProps<ContractorFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher a ação apropriada (novo ou editar)
      const action = contractor ? editContratante : newContratante;

      // Preparar FormData
      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("name", values.name);
      data.append("cnpj", values.cnpj);
      data.append("state", values.state);

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!contractor) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ContractorFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o contratante:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar o contratante.",
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
      name="contractorForm"
      onFinish={onFinish}
      initialValues={{
        id: contractor?.id,
        name: contractor?.name ?? "",
        cnpj: contractor?.cnpj ?? "",
        state: contractor?.state ?? "",
      }}
      disabled={loading}
    >
      {contractor && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome do Contratante"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o nome do contratante!" },
          { max: 100, message: "O nome pode ter no máximo 100 caracteres." },
        ]}
      >
        <Input placeholder="Nome do contratante" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="cnpj"
        label="CNPJ"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o CNPJ!" },
          {
            pattern: /^\d{14}$/,
            message: "O CNPJ deve conter exatamente 14 números.",
          },
        ]}
      >
        <Input placeholder="CNPJ (somente números)" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="state"
        label="Estado"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o estado!" },
          {
            pattern: /^[A-Z]{2}$/,
            message: "O estado deve conter exatamente 2 letras maiúsculas.",
          },
        ]}
      >
        <Select placeholder="Selecione o estado">
          {Object.entries(STATE).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {key}
            </Select.Option>
          ))}
        </Select>
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
          {contractor ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractorForm;
