import React, { useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Alert,
  Select,
  notification,
  FormProps,
} from "antd";
import useSWR from "swr";
import dayjs from "dayjs";
import { ActionResult } from "../../../../types/actions/action-result";
import { Contract } from "@prisma/client";
import { fetchSWRContratantes } from "@/lib/actions/contratantes/fetchSWRContratantes";
import { editContract } from "@/lib/actions/contratos/editContract";
import { newContract } from "@/lib/actions/contratos/newContract";

interface ContractFormProps {
  contract?: Contract | null;
  onSuccess: () => void;
}

interface ContractFormValues {
  id?: number;
  number: string;
  name: string;
  initialDate: Date;
  finalDate: Date;
  contractorId: number;
}

const ContractForm: React.FC<ContractFormProps> = ({ contract, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // SWR para buscar contratantes
  const { data: contractors, error: contractorsError } = useSWR(
    "contractors",
    fetchSWRContratantes
  );

  useEffect(() => {
    if (contract) {
      form.setFieldsValue({
        id: contract.id,
        number: contract.number ?? "",
        name: contract.name ?? "",
        initialDate: contract.initialDate
          ? dayjs(contract.initialDate)
          : undefined,
        finalDate: contract.finalDate ? dayjs(contract.finalDate) : undefined,
        contractorId: contract.contractorId,
      });
    }
  }, [contract, form]);

  const onFinish: FormProps<ContractFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher ação apropriada (novo ou editar)
      const action = contract ? editContract : newContract;

      // Preparar dados

      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("number", values.number);
      data.append("name", values.name);
      data.append("initialDate", values.initialDate.toISOString());
      data.append("finalDate", values.finalDate.toISOString());
      data.append("contractorId", values.contractorId.toString());

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!contract) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ContractFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o contrato:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar o contrato.",
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
      name="contractForm"
      onFinish={onFinish}
      initialValues={{
        id: contract?.id,
        number: contract?.number ?? "",
        name: contract?.name ?? "",
        initialDate: contract?.initialDate
          ? dayjs(contract.initialDate)
          : undefined,
        finalDate: contract?.finalDate ? dayjs(contract.finalDate) : undefined,
        contractorId: contract?.contractorId,
      }}
      disabled={loading}
    >
      {contract && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="number"
        label="Número do Contrato"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o número do contrato!" },
          { max: 20, message: "O número pode ter no máximo 20 caracteres." },
        ]}
      >
        <Input placeholder="Número do contrato" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="name"
        label="Nome do Contrato"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o nome do contrato!" },
          { max: 100, message: "O nome pode ter no máximo 100 caracteres." },
        ]}
      >
        <Input placeholder="Nome do contrato" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="initialDate"
        label="Data de Início"
        hasFeedback
        rules={[{ required: true, message: "Selecione a data de início!" }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="finalDate"
        label="Data de Término"
        hasFeedback
        rules={[{ required: true, message: "Selecione a data de término!" }]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="contractorId"
        label="Contratante"
        hasFeedback
        rules={[{ required: true, message: "Selecione o contratante!" }]}
      >
        <Select
          placeholder="Selecione o contratante"
          loading={!contractors && !contractorsError}
        >
          {contractors &&
            contractors.map((contractor: { id: number; name: string }) => (
              <Select.Option key={contractor.id} value={contractor.id}>
                {contractor.name}
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
          {contract ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractForm;
