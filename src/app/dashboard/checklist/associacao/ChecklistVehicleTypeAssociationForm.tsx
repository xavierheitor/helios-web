"use client";

import { editChecklistVehicleTypeAssociation } from "@/lib/actions/checklist/associacao/tipoVeiculo/editVehicleAssociacao";
import { newChecklistVehicleTypeAssociation } from "@/lib/actions/checklist/associacao/tipoVeiculo/newVehicleAssociacao";
import { ChecklistVehicleTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/checklistVehicleTypeAssociationWithRelations";
import React, { useEffect } from "react";
import { ActionResult } from "../../../../../types/actions/action-result";
import {
  Alert,
  Button,
  Form,
  FormProps,
  notification,
  Select,
  Input,
} from "antd";
import useSWR from "swr";
import { Checklist, VehicleType } from "@prisma/client";
import { fetchSWRTipoVeiculo } from "@/lib/actions/veiculo/tipoVeiculo/fetchSWRTipoVeiculo";
import { fetchSWRChecklists } from "@/lib/actions/checklist/fetchSWRChecklists";

interface ChecklistVehicleTypeAssociationFormProps {
  association?: ChecklistVehicleTypeAssociationWithRelations | null;
  onSuccess: () => void;
}

interface ChecklistVehicleTypeAssociationFormValues {
  id?: number;
  checklistId: number;
  vehicleTypeId: number;
}

const ChecklistVehicleTypeAssociationForm: React.FC<
  ChecklistVehicleTypeAssociationFormProps
> = ({ association, onSuccess }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form] = Form.useForm<ChecklistVehicleTypeAssociationFormValues>();

  const {
    data: vehicleTypes,
    error: vehicleTypesError,
    isLoading: vehicleTypesLoading,
  } = useSWR<VehicleType[], Error>("vehicleTypes", fetchSWRTipoVeiculo);

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
        vehicleTypeId: association.vehicleTypeId,
      });
    } else {
      form.resetFields();
    }
  }, [association, form]);

  const onFinish: FormProps<ChecklistVehicleTypeAssociationFormValues>["onFinish"] =
    async (values) => {
      setLoading(true);
      setError(null);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        // Assegure-se de que 'value' é uma string ou Blob
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      try {
        const action = association
          ? editChecklistVehicleTypeAssociation
          : newChecklistVehicleTypeAssociation;
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
      name="checklistForm"
      onFinish={onFinish}
      disabled={loading}
    >
      {/* Campo Oculto para 'id' */}
      {association && association.id && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      {/* Campo para 'checklistId' */}
      <Form.Item
        name="checklistId"
        label="Checklist"
        rules={[{ required: true, message: "O checklist é obrigatório!" }]}
      >
        <Select
          placeholder="Selecione o checklist"
          loading={checklistsLoading}
          allowClear
        >
          {checklists?.map((checklist) => (
            <Select.Option key={checklist.id} value={checklist.id}>
              {checklist.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Campo para 'vehicleTypeId' */}
      <Form.Item
        name="vehicleTypeId"
        label="Tipo de Veículo"
        rules={[
          { required: true, message: "O tipo de veículo é obrigatório!" },
        ]}
      >
        <Select
          placeholder="Selecione o tipo de veículo"
          loading={vehicleTypesLoading}
          allowClear
        >
          {vehicleTypes?.map((type) => (
            <Select.Option key={type.id} value={type.id}>
              {type.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Exibição de Erros Gerais */}
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

      {/* Botão de Submissão */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {association ? "Atualizar Associação" : "Adicionar Associação"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChecklistVehicleTypeAssociationForm;
