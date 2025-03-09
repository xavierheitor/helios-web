"use client";

import { editChecklistTeamTypeAssociation } from "@/lib/actions/checklist/associacao/tipoEquipe/editEquipeAssociacao";
import { newChecklistTeamTypeAssociation } from "@/lib/actions/checklist/associacao/tipoEquipe/newEquipeAssociacao";
import { ChecklistTeamTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/ChecklistTeamTypeAssociationWithRelations";
import React, { useEffect } from "react";
import { ActionResult } from "../../../../../types/actions/action-result";
import { Alert, Button, Form, notification, Select } from "antd";
import useSWR from "swr";
import { Checklist, TeamType } from "@prisma/client";
import { fetchSWRTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/fetchSWRTipoEquipe";
import { fetchSWRChecklists } from "@/lib/actions/checklist/fetchSWRChecklists";
import { FormProps } from "antd/lib";

interface ChecklistTeamTypeAssociationFormProps {
  association?: ChecklistTeamTypeAssociationWithRelations | null;
  onSuccess: () => void;
}

interface ChecklistTeamTypeAssociationFormValues {
  id?: number;
  checklistId: number;
  teamTypeId: number;
}

const ChecklistTeamTypeAssociationForm: React.FC<
  ChecklistTeamTypeAssociationFormProps
> = ({ association, onSuccess }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form] = Form.useForm<ChecklistTeamTypeAssociationFormValues>();

  const {
    data: teamTypes,
    error: teamTypesError,
    isLoading: teamTypesLoading,
  } = useSWR<TeamType[], Error>("teamTypes", fetchSWRTipoEquipe);

  const {
    data: checklists,
    error: checklistsError,
    isLoading: checklistsLoading,
  } = useSWR<Checklist[], Error>("checklists", fetchSWRChecklists);

  useEffect(() => {
    if (association) {
      form.setFieldsValue({
        id: association.id,
        checklistId: association.checklistId,
        teamTypeId: association.teamTypeId,
      });
    } else {
      form.resetFields();
    }
  }, [association, form]);

  const onFinish: FormProps<ChecklistTeamTypeAssociationFormValues>["onFinish"] =
    async (values) => {
      setLoading(true);
      setError(null);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value as string | Blob);
      });

      try {
        const action = association
          ? editChecklistTeamTypeAssociation
          : newChecklistTeamTypeAssociation;
        const result: ActionResult = await action({ isValid: true }, formData);

        if (result.success) {
          notification.success({ message: result.message });
          onSuccess();
        } else {
          if (result.errors) {
            // Mapeamento de erros de validação para exibição
            Object.entries(result.errors).forEach(([field, messages]) => {
              messages?.forEach((message) =>
                notification.error({
                  message: `Erro no campo: ${field}`,
                  description: message,
                })
              );
            });
          }
          notification.error({ message: result.message });
        }
      } catch (err) {
        notification.error({
          message: "Ocorreu um erro ao salvar a associação.",
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
      disabled={loading}
      initialValues={
        association
          ? {
              id: association.id,
              checklistId: association.checklistId,
              teamTypeId: association.teamTypeId,
            }
          : {}
      }
    >
      {association && association.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="checklistId"
        label="Checklist ID"
        rules={[
          { required: true, message: "O ID do checklist é obrigatório!" },
        ]}
      >
        <Select placeholder="Selecione o checklist" loading={checklistsLoading}>
          {checklists?.map((checklist) => (
            <Select.Option key={checklist.id} value={checklist.id}>
              {checklist.name} - {checklist.checklistMobileType}
            </Select.Option>
          ))}
        </Select>
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
          {association ? "Atualizar Associação" : "Adicionar Associação"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChecklistTeamTypeAssociationForm;
