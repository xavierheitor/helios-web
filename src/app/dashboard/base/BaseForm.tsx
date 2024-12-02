import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Alert,
  notification,
  FormProps,
} from "antd";
import useSWR from "swr";
import { ActionResult } from "../../../../types/actions/action-result";
import { Base } from "@prisma/client";
import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { editBase } from "@/lib/actions/base/editBase";
import { newBase } from "@/lib/actions/base/newBase";

interface BaseFormProps {
  base?: Base | null;
  onSuccess: () => void;
}

interface BaseFormValues {
  id?: number;
  name: string;
  contractId: number;
}

const BaseForm: React.FC<BaseFormProps> = ({ base, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // SWR para buscar contratos
  const { data: contracts, error: contractsError } = useSWR(
    "contracts",
    fetchSWRContratos
  );

  useEffect(() => {
    if (base) {
      form.setFieldsValue({
        id: base.id,
        name: base.name ?? "",
        contractId: base.contractId,
      });
    }
  }, [base, form]);

  const onFinish: FormProps<BaseFormValues>["onFinish"] = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher ação apropriada (novo ou editar)
      const action = base ? editBase : newBase;

      // Preparar dados
      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("name", values.name);
      data.append("contractId", values.contractId.toString());

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!base) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof BaseFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar a base:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar a base.",
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
      name="baseForm"
      onFinish={onFinish}
      initialValues={{
        id: base?.id,
        name: base?.name ?? "",
        contractId: base?.contractId,
      }}
      disabled={loading}
    >
      {base && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome da Base"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o nome da base!" },
          { max: 255, message: "O nome pode ter no máximo 255 caracteres." },
        ]}
      >
        <Input placeholder="Nome da base" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="contractId"
        label="Contrato"
        hasFeedback
        rules={[{ required: true, message: "Selecione o contrato!" }]}
      >
        <Select
          placeholder="Selecione o contrato"
          loading={!contracts && !contractsError}
        >
          {contracts &&
            contracts.map((contract: { id: number; name: string }) => (
              <Select.Option key={contract.id} value={contract.id}>
                {contract.name}
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
          {base ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BaseForm;
