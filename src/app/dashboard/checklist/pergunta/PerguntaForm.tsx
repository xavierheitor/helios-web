// src/components/QuestionForm.tsx
import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  notification,
  FormProps,
} from "antd";
import useSWR from "swr";

import { QuestionFormSchema } from "@/lib/utils/formSchemas/questionFormSchema";
import { fetchSWRTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/fetchSWRTipoChecklist";
import { editPergunta } from "@/lib/actions/checklist/pergunta/editPergunta";
import { newPergunta } from "@/lib/actions/checklist/pergunta/newPergunta";
import { ActionResult } from "../../../../../types/actions/action-result";

interface QuestionFormProps {
  question?: {
    id?: number;
    text: string;
    checklistTypeId: number;
  } | null;
  onSuccess: () => void;
}

interface QuestionFormValues {
  id?: number;
  text: string;
  checklistTypeId: number;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSuccess }) => {
  const [form] = Form.useForm<QuestionFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // SWR para buscar tipos de checklist
  const { data: checklistTypes, error: checklistTypesError } = useSWR(
    "checklistTypes",
    fetchSWRTipoChecklist
  );

  useEffect(() => {
    if (question) {
      form.setFieldsValue({
        id: question.id,
        text: question.text ?? "",
        checklistTypeId: question.checklistTypeId,
      });
    } else {
      form.resetFields();
    }
  }, [question, form]);

  const onFinish: FormProps<QuestionFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher ação apropriada (novo ou editar)
      const action = question ? editPergunta : newPergunta;

      // Validação usando o schema
      const validatedFields = QuestionFormSchema.safeParse(values);

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        form.setFields(
          Object.entries(errors).map(([name, messages]) => ({
            name: name as keyof QuestionFormValues,
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
      data.append("text", values.text);
      data.append("checklistTypeId", values.checklistTypeId.toString());

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!question) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof QuestionFormValues,
              errors: messages || [],
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar a pergunta:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar a pergunta.",
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
      name="questionForm"
      onFinish={onFinish}
      initialValues={{
        id: question?.id,
        text: question?.text ?? "",
        checklistTypeId: question?.checklistTypeId,
      }}
      disabled={loading}
    >
      {question && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="text"
        label="Texto da Pergunta"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o texto da pergunta!" },
          {
            max: 255,
            message: "O texto pode ter no máximo 255 caracteres.",
          },
        ]}
      >
        <Input.TextArea
          placeholder="Texto da pergunta"
          autoComplete="off"
          rows={4}
        />
      </Form.Item>

      <Form.Item
        name="checklistTypeId"
        label="Tipo de Checklist"
        hasFeedback
        rules={[{ required: true, message: "Selecione o tipo de checklist!" }]}
      >
        <Select
          placeholder="Selecione o tipo de checklist"
          loading={!checklistTypes && !checklistTypesError}
        >
          {checklistTypes &&
            checklistTypes.map((type: { id: number; name: string }) => (
              <Select.Option key={type.id} value={type.id}>
                {type.name}
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
          {question ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default QuestionForm;
