import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { editEquipe } from "@/lib/actions/equipe/editEquipe";
import { newEquipe } from "@/lib/actions/equipe/newEquipe";
import { fetchSWRTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/fetchSWRTipoEquipe";
import { TeamFormSchema } from "@/lib/utils/formSchemas/equipeFormSchema";
import { TeamWithRelations } from "@/lib/utils/prismaTypes/teamWithRelations";
import { Contract, TeamType } from "@prisma/client";
import { Alert, Button, Form, Input, notification, Select } from "antd";
import React from "react";
import useSWR from "swr";
import { z } from "zod";

import { ActionResult } from "../../../../types/actions/action-result";

interface EquipeFormProps {
  equipe?: TeamWithRelations | null;
  onSuccess: () => void;
}

interface EquipeFormValues {
  id?: number;
  name: string;
  contractId: number;
  teamTypeId: number;
}

const EquipeForm: React.FC<EquipeFormProps> = ({ equipe, onSuccess }) => {
  const [form] = Form.useForm<EquipeFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { data: teamTypes, isLoading: teamTypesLoading } = useSWR<TeamType[]>(
    "tipoEquipe",
    fetchSWRTipoEquipe
  );

  const { data: contracts, isLoading: contractsLoading } = useSWR<
    Contract[],
    Error
  >("contrato", fetchSWRContratos);

  React.useEffect(() => {
    if (equipe) {
      form.setFieldsValue({
        id: equipe.id,
        name: equipe.name,
        contractId: equipe.contractId,
        teamTypeId: equipe.teamTypeId,
      });
    } else {
      form.resetFields();
    }
  }, [equipe, form]);

  const onFinish = async (values: EquipeFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const validatedData = TeamFormSchema.parse(values);

      const data = new FormData();

      if (equipe && equipe.id) data.append("id", equipe.id.toString());

      data.append("name", validatedData.name);
      data.append("contractId", validatedData.contractId.toString());
      data.append("teamTypeId", validatedData.teamTypeId.toString());

      const action = equipe ? editEquipe : newEquipe;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!equipe) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof EquipeFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const zodErrors = err.flatten();
        form.setFields(
          Object.entries(zodErrors.fieldErrors).map(([name, messages]) => ({
            name: name as keyof EquipeFormValues,
            errors: messages || [],
          }))
        );

        // Notificações de erros Zod
        Object.entries(zodErrors.fieldErrors).forEach(([field, errors]) => {
          errors?.forEach((error) =>
            notification.error({
              message: `Erro no campo: ${field}`,
              description: error,
            })
          );
        });
      } else {
        notification.error({
          message: "Ocorreu um erro ao salvar o veículo.",
        });
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
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
        id: equipe?.id,
        name: equipe?.name || "",
        contractId: equipe?.contractId,
        teamTypeId: equipe?.teamTypeId,
      }}
      disabled={loading}
    >
      {equipe && equipe.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome"
        rules={[{ required: true, message: "O nome da equipe é obrigatória!" }]}
      >
        <Input
          placeholder="Digite o nome da equipe"
          style={{ textTransform: "uppercase" }}
        />
      </Form.Item>

      <Form.Item
        name="teamTypeId"
        label="Tipo de Equipe"
        rules={[{ required: true, message: "O tipo de equipe é obrigatório!" }]}
      >
        <Select
          placeholder="Selecione o tipo de equipe"
          loading={teamTypesLoading}
        >
          {teamTypes?.map((type) => (
            <Select.Option key={type.id} value={type.id}>
              {type.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="contractId"
        label="Contrato"
        rules={[{ required: true, message: "O contrato é obrigatório!" }]}
      >
        <Select placeholder="Selecione o contrato" loading={contractsLoading}>
          {contracts?.map((contract) => (
            <Select.Option key={contract.id} value={contract.id}>
              {contract.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {error && (
        <Form.Item>
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError(null)}
          />
        </Form.Item>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {equipe ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EquipeForm;
