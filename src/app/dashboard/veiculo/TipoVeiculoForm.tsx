import { editTipoVeiculo } from "@/lib/actions/veiculo/tipoVeiculo/editTipoVeiculo";
import { newTipoVeiculo } from "@/lib/actions/veiculo/tipoVeiculo/newTipoVeiculo";
import { VehicleTypeFormSchema } from "@/lib/utils/formSchemas/vehicleTypeFormSchema";
import { VehicleType } from "@prisma/client";
import { Alert, Button, Form, Input, notification } from "antd";
import React from "react";
import { ActionResult } from "../../../../types/actions/action-result";
import { z } from "zod";

interface TipoVeiculoFormProps {
  tipoVeiculo?: VehicleType | null;
  onSuccess: () => void;
}

interface TipoVeiculoFormValues {
  id?: number;
  name: string;
  description: string | null;
}

const TipoVeiculoForm: React.FC<TipoVeiculoFormProps> = ({
  tipoVeiculo,
  onSuccess,
}) => {
  const [form] = Form.useForm<TipoVeiculoFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tipoVeiculo) {
      form.setFieldsValue(tipoVeiculo);
    } else {
      form.resetFields();
    }
  }, [tipoVeiculo, form]);

  const onFinish = async (values: TipoVeiculoFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const validatedData = VehicleTypeFormSchema.parse(values);

      const data = new FormData();

      if (tipoVeiculo && tipoVeiculo.id)
        data.append("id", tipoVeiculo.id.toString());

      data.append("name", validatedData.name);
      data.append("description", validatedData.description || "");

      const action = tipoVeiculo ? editTipoVeiculo : newTipoVeiculo;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!tipoVeiculo) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof TipoVeiculoFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Mapear erros do Zod para os campos do formulário
        const zodErrors = err.flatten();
        form.setFields(
          Object.entries(zodErrors.fieldErrors).map(([name, messages]) => ({
            name: name as keyof TipoVeiculoFormValues,
            errors: messages || [],
          }))
        );
      } else {
        console.error("Erro ao salvar o tipo de veiculo:", err);
        notification.error({
          message: "Ocorreu um erro ao salvar o tipo de veiculo.",
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
        id: tipoVeiculo?.id,
        name: tipoVeiculo?.name || "",
        description: tipoVeiculo?.description || "",
      }}
    >
      {/* Form fields go here */}
      {tipoVeiculo && tipoVeiculo.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome"
        rules={[
          { required: true, message: "O nome do funcionário é obrigatório!" },
          { max: 100, message: "O nome não pode exceder 100 caracteres!" },
        ]}
      >
        <Input placeholder="Digite o nome" />
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
          {tipoVeiculo ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TipoVeiculoForm;
