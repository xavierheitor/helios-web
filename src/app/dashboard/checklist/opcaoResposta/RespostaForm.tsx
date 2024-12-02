// src/components/AnswerForm.tsx
import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  Switch,
  notification,
  FormProps,
} from "antd";
import useSWR from "swr";

import { z } from "zod";
import { fetchSWRTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/fetchSWRTipoChecklist";
import { editResposta } from "@/lib/actions/checklist/resposta/editResposta";
import { newResposta } from "@/lib/actions/checklist/resposta/newResposta";
import { AnswerFormSchema } from "@/lib/utils/formSchemas/answerFormSchema";
import { ActionResult } from "../../../../../types/actions/action-result";

interface AnswerFormProps {
  answer?: {
    id?: number;
    text: string;
    checklistTypeId: number;
    pending?: boolean;
  } | null;
  onSuccess: () => void;
}

interface AnswerFormValues {
  id?: number;
  text: string;
  checklistTypeId: number;
  pending: boolean; // **Tornar o campo obrigatório no formulário**
}

const AnswerForm: React.FC<AnswerFormProps> = ({ answer, onSuccess }) => {
  const [form] = Form.useForm<AnswerFormValues>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // SWR para buscar tipos de checklist
  const { data: checklistTypes, error: checklistTypesError } = useSWR(
    "checklistTypes",
    fetchSWRTipoChecklist
  );

  useEffect(() => {
    if (answer) {
      form.setFieldsValue({
        id: answer.id,
        text: answer.text ?? "",
        checklistTypeId: answer.checklistTypeId,
        pending: answer.pending ?? false,
      });
    } else {
      form.setFieldsValue({
        pending: false, // **Garantir que o valor inicial de pending é false**
      });
    }
  }, [answer, form]);

  const onFinish: FormProps<AnswerFormValues>["onFinish"] = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Escolher ação apropriada (novo ou editar)
      const action = answer ? editResposta : newResposta;

      // Validação usando o schema
      const validatedFields = AnswerFormSchema.safeParse(values);

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors;
        form.setFields(
          Object.entries(errors).map(([name, messages]) => ({
            name: name as keyof AnswerFormValues,
            errors: messages || [],
          }))
        );
        setLoading(false);
        return;
      }

      // Preparar dados
      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("text", values.text);
      data.append("checklistTypeId", values.checklistTypeId.toString());
      data.append("pending", values.pending.toString()); // **Adicionar pending ao FormData**

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!answer) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof AnswerFormValues,
              errors: messages || [],
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar a resposta:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar a resposta.",
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
      name="answerForm"
      onFinish={onFinish}
      initialValues={{
        id: answer?.id,
        text: answer?.text ?? "",
        checklistTypeId: answer?.checklistTypeId,
        pending: answer?.pending ?? false, // **Definir valor inicial como false**
      }}
      disabled={loading}
    >
      {answer && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="text"
        label="Texto da Resposta"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o texto da resposta!" },
          {
            max: 255,
            message: "O texto pode ter no máximo 255 caracteres.",
          },
        ]}
      >
        <Input.TextArea
          placeholder="Texto da resposta"
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

      <Form.Item name="pending" label="Gera pendência?" valuePropName="checked">
        <Switch />
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
          {answer ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AnswerForm;
