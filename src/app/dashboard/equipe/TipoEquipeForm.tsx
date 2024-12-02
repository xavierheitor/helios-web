import { editTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/editTipoEquipe";
import { newTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/newTipoEquipe";
import { TeamTypeFormSchema } from "@/lib/utils/formSchemas/tipoEquipeFormSchema";
import { TeamType } from "@prisma/client";
import { Alert, Button, Form, Input, notification } from "antd";
import React from "react";
import { z } from "zod";

import { ActionResult } from "../../../../types/actions/action-result";

interface TipoEquipeFormProps {
  tipoEquipe?: TeamType | null;
  onSuccess: () => void;
}

interface TipoEquipeFormValues {
  id?: number;
  name: string;
  description: string | null;
}

const TipoEquipeForm: React.FC<TipoEquipeFormProps> = ({
  tipoEquipe,
  onSuccess,
}) => {
  const [form] = Form.useForm<TipoEquipeFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (tipoEquipe) {
      form.setFieldsValue(tipoEquipe);
    } else {
      form.resetFields();
    }
  }, [tipoEquipe, form]);

  const onFinish = async (values: TipoEquipeFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const validatedData = TeamTypeFormSchema.parse(values);

      const data = new FormData();

      if (tipoEquipe && tipoEquipe.id)
        data.append("id", tipoEquipe.id.toString());

      data.append("name", validatedData.name);
      data.append("description", validatedData.description || "");

      const action = tipoEquipe ? editTipoEquipe : newTipoEquipe;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!tipoEquipe) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof TipoEquipeFormValues,
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
            name: name as keyof TipoEquipeFormValues,
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
        id: tipoEquipe?.id,
        name: tipoEquipe?.name || "",
        description: tipoEquipe?.description || "",
      }}
    >
      {/* Form fields go here */}
      {tipoEquipe && tipoEquipe.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome"
        rules={[
          { required: true, message: "O nome do tipo de equipe obrigatório!" },
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
          placeholder="Descreva o tipo de Equipe (opcional)"
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
          {tipoEquipe ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};
export default TipoEquipeForm;
