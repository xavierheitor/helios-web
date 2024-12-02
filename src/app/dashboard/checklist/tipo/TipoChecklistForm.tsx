// src/components/ChecklistTypeForm.tsx
import React, { useEffect } from "react";
import { Form, Input, Button, Alert, notification, FormProps } from "antd";

import { editTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/editTipoChecklist";
import { newTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/newTipoChecklist";
import { ChecklistTypeFormSchema } from "@/lib/utils/formSchemas/tipoChecklistFormSchema";
import { ActionResult } from "../../../../../types/actions/action-result";

interface ChecklistTypeFormProps {
  checklistType?: {
    id?: number;
    name: string;
    description?: string | null;
  } | null;
  onSuccess: () => void;
}

interface ChecklistTypeFormValues {
  id?: number;
  name: string;
  description?: string | null;
}

const ChecklistTypeForm: React.FC<ChecklistTypeFormProps> = ({
  checklistType,
  onSuccess,
}) => {
  const [form] = Form.useForm<ChecklistTypeFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (checklistType) {
      form.setFieldsValue({
        id: checklistType.id,
        name: checklistType.name ?? "",
        description: checklistType.description ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [checklistType, form]);

  const onFinish: FormProps<ChecklistTypeFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher ação apropriada (novo ou editar)
      const action = checklistType ? editTipoChecklist : newTipoChecklist;

      // Validação usando o schema
      const validatedFields = ChecklistTypeFormSchema.safeParse(values);

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        form.setFields(
          Object.entries(errors).map(([name, messages]) => ({
            name: name as keyof ChecklistTypeFormValues,
            errors: messages || [],
          }))
        );
        return;
      }

      // Preparar dados
      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("name", values.name);
      if (values.description) {
        data.append("description", values.description);
      }

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!checklistType) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ChecklistTypeFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o tipo de checklist:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar o tipo de checklist.",
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
      name="checklistTypeForm"
      onFinish={onFinish}
      initialValues={{
        id: checklistType?.id,
        name: checklistType?.name ?? "",
        description: checklistType?.description ?? "",
      }}
      disabled={loading}
    >
      {checklistType && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome do Tipo de Checklist"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o nome do tipo de checklist!" },
          {
            max: 100,
            message: "O nome pode ter no máximo 100 caracteres.",
          },
        ]}
      >
        <Input placeholder="Nome do tipo de checklist" autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Descrição"
        hasFeedback
        rules={[
          {
            max: 255,
            message: "A descrição pode ter no máximo 255 caracteres.",
          },
        ]}
      >
        <Input.TextArea
          placeholder="Descrição do tipo de checklist"
          autoComplete="off"
          rows={4}
        />
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
          {checklistType ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChecklistTypeForm;
