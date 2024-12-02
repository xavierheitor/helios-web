import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { editVeiculo } from "@/lib/actions/veiculo/editVeiculo";
import { newVeiculo } from "@/lib/actions/veiculo/newVeiculo";
import { fetchSWRTipoVeiculo } from "@/lib/actions/veiculo/tipoVeiculo/fetchSWRTipoVeiculo";
import { VehicleFormSchema } from "@/lib/utils/formSchemas/vehicleFormSchema";
import { VehicleWithRelations } from "@/lib/utils/prismaTypes/vehicleWithRelations";
import { Contract, VehicleType } from "@prisma/client";
import { Alert, Button, Form, Input, notification, Select } from "antd";
import React from "react";
import useSWR from "swr";
import { ActionResult } from "../../../../types/actions/action-result";
import { z } from "zod";

interface VeiculoFormProps {
  veiculo?: VehicleWithRelations | null;
  onSuccess: () => void;
}

interface VeiculoFormValues {
  id?: number;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  operationalNumber: string;
  vehicleTypeId: number;
  contractId: number;
}

const VeiculoForm: React.FC<VeiculoFormProps> = ({ veiculo, onSuccess }) => {
  const [form] = Form.useForm<VeiculoFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { data: vehicleTypes, isLoading: vehicleTypesLoading } = useSWR<
    VehicleType[],
    Error
  >("tipoVeiculo", fetchSWRTipoVeiculo);

  const { data: contracts, isLoading: contractsLoading } = useSWR<
    Contract[],
    Error
  >("contrato", fetchSWRContratos);

  React.useEffect(() => {
    if (veiculo) {
      form.setFieldsValue({
        id: veiculo.id,
        plate: veiculo.plate,
        model: veiculo.model,
        brand: veiculo.brand,
        operationalNumber: veiculo.operationalNumber,
        year: veiculo.year,
        color: veiculo.color,
        vehicleTypeId: veiculo.vechicleTypeId, // Corrigido
        contractId: veiculo.contractId,
      });
    } else {
      form.resetFields();
    }
  }, [veiculo, form]);

  const onFinish = async (values: VeiculoFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const validatedData = VehicleFormSchema.parse(values);

      const data = new FormData();

      if (veiculo && veiculo.id) {
        data.append("id", veiculo.id.toString());
      }

      data.append("plate", validatedData.plate);
      data.append("model", validatedData.model);
      data.append("brand", validatedData.brand);
      data.append("year", validatedData.year.toString());
      data.append("color", validatedData.color);
      data.append("operationalNumber", validatedData.operationalNumber);
      data.append("vehicleTypeId", validatedData.vehicleTypeId.toString());
      data.append("contractId", validatedData.contractId.toString());

      const action = veiculo ? editVeiculo : newVeiculo;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!veiculo) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof VeiculoFormValues,
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
            name: name as keyof VeiculoFormValues,
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
        id: veiculo?.id || 0,
        plate: veiculo?.plate || "",
        model: veiculo?.model || "",
        brand: veiculo?.brand || "",
        year: veiculo?.year || "",
        color: veiculo?.color || "",
        vehicleTypeId: veiculo?.vechicleTypeId || "", // Corrigido
        contractId: veiculo?.contractId || "",
      }}
      disabled={loading}
    >
      {veiculo && veiculo.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="plate"
        label="Placa"
        rules={[
          { required: true, message: "A placa do veículo é obrigatória!" },
          { max: 7, message: "A placa deve ter no máximo 7 caracteres!" },
        ]}
      >
        <Input
          placeholder="Digite a placa"
          style={{ textTransform: "uppercase" }}
        />
      </Form.Item>

      <Form.Item
        name="operationalNumber"
        label="Número Operacional"
        rules={[
          {
            required: true,
            message: "O número operacional é obrigatório!",
          },
        ]}
      >
        <Input placeholder="Digite o número operacional" />
      </Form.Item>

      <Form.Item
        name="brand"
        label="Marca"
        rules={[
          { required: true, message: "A marca do veículo é obrigatória!" },
        ]}
      >
        <Input placeholder="Digite a marca" />
      </Form.Item>

      <Form.Item
        name="model"
        label="Modelo"
        rules={[
          { required: true, message: "O modelo do veículo é obrigatório!" },
        ]}
      >
        <Input placeholder="Digite o modelo" />
      </Form.Item>

      <Form.Item
        name="year"
        label="Ano"
        rules={[{ required: true, message: "O ano é obrigatório!" }]}
      >
        <Input placeholder="Digite o ano" type="number" />
      </Form.Item>

      <Form.Item
        name="color"
        label="Cor"
        rules={[{ required: true, message: "A cor do veículo é obrigatória!" }]}
      >
        <Input placeholder="Digite a cor" />
      </Form.Item>

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
        >
          {vehicleTypes?.map((type) => (
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
          {veiculo ? "Atualizar Veículo" : "Adicionar Veículo"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VeiculoForm;
