// src/components/ChecklistForm.tsx
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Alert,
  Select,
  notification,
  FormProps,
  Transfer,
  Modal, // Importar Modal para o diálogo de confirmação
} from "antd";
import useSWR from "swr";
import { ActionResult } from "../../../../types/actions/action-result";
import { newChecklist } from "@/lib/actions/checklist/newChecklist";
import { editChecklist } from "@/lib/actions/checklist/editChecklist";
import { ChecklistFormSchema } from "@/lib/utils/formSchemas/checklistFormSchema";
import { fetchSWRTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/fetchSWRTipoChecklist";
import { fetchSWRPerguntas } from "@/lib/actions/checklist/pergunta/fetchSWRPerguntas";
import { z } from "zod";
import type { Key } from "react";
import { ChecklistWithRelations } from "@/lib/utils/prismaTypes/checklistWithRelations";

interface ChecklistFormProps {
  checklist?: ChecklistWithRelations | null;
  onSuccess: () => void;
}

interface ChecklistFormValues {
  id?: number;
  name: string;
  description?: string | null;
  checklistTypeId: number;
  questionsIds?: number[];
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({
  checklist,
  onSuccess,
}) => {
  const [form] = Form.useForm<ChecklistFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Checklist Types
  const { data: checklistTypes } = useSWR(
    "checklistTypes",
    fetchSWRTipoChecklist
  );

  // Fetch Questions
  const { data: questions } = useSWR("questions", fetchSWRPerguntas);

  // State for Transfer
  const [targetKeys, setTargetKeys] = useState<Key[]>([]);

  useEffect(() => {
    if (checklist) {
      form.setFieldsValue({
        id: checklist.id,
        name: checklist.name,
        description: checklist.description,
        checklistTypeId: checklist.checklistTypeId,
      });

      const selectedKeys =
        checklist.associatedQuestions?.map((aq) => aq.questionId.toString()) ||
        [];
      setTargetKeys(selectedKeys);
    } else {
      form.resetFields();
      setTargetKeys([]);
    }
  }, [checklist, form]);

  const onFinish: FormProps<ChecklistFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      values.questionsIds = targetKeys.map((key) => Number(key));

      const validatedFields = ChecklistFormSchema.parse(values);

      const data = new FormData();
      if (validatedFields.id) {
        data.append("id", validatedFields.id.toString());
      }
      data.append("name", validatedFields.name);
      data.append("description", validatedFields.description || "");
      data.append(
        "checklistTypeId",
        validatedFields.checklistTypeId.toString()
      );
      data.append("questionsIds", JSON.stringify(validatedFields.questionsIds));

      const action = checklist ? editChecklist : newChecklist;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!checklist) {
          form.resetFields();
          setTargetKeys([]);
        }
        onSuccess();
      } else {
        if (result.errors) {
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ChecklistFormValues,
              errors: messages || [],
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
            name: name as keyof ChecklistFormValues,
            errors: messages || [],
          }))
        );
      } else {
        console.error("Erro ao salvar o checklist:", err);
        notification.error({
          message: "Ocorreu um erro ao salvar o checklist.",
        });
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Transfer Data Source
  const transferDataSource = (questions || []).map((question) => ({
    key: question.id.toString(),
    title: question.text,
    checklistTypeName: question.checklistType.name,
    checklistTypeId: question.checklistType.id,
  }));

  // Função para lidar com a mudança no Transfer
  const handleTransferChange = (
    nextTargetKeys: Key[],
    direction: "left" | "right",
    moveKeys: Key[]
  ) => {
    const selectedChecklistTypeId = form.getFieldValue("checklistTypeId");

    if (direction === "right") {
      // Verificar se alguma pergunta tem tipo diferente
      const movedItems = transferDataSource.filter((item) =>
        moveKeys.includes(item.key)
      );

      const differentTypeItems = movedItems.filter(
        (item) => item.checklistTypeId !== selectedChecklistTypeId
      );

      if (differentTypeItems.length > 0) {
        Modal.confirm({
          title:
            "Você tem certeza que deseja incluir perguntas de tipos diferentes?",
          content:
            "As perguntas selecionadas incluem tipos diferentes do tipo selecionado para o checklist. Deseja continuar?",
          okText: "Sim",
          cancelText: "Não",
          onOk: () => {
            setTargetKeys(nextTargetKeys);
          },
          onCancel: () => {
            // Remover as perguntas de tipo diferente
            const filteredKeys = moveKeys.filter((key) => {
              const item = transferDataSource.find((i) => i.key === key);
              return item && item.checklistTypeId === selectedChecklistTypeId;
            });
            setTargetKeys((prevKeys) => [...prevKeys, ...filteredKeys]);
          },
        });
      } else {
        setTargetKeys(nextTargetKeys);
      }
    } else {
      // Remoção simples
      setTargetKeys(nextTargetKeys);
    }
  };

  // Handle when checklistTypeId changes
  const handleChecklistTypeChange = (value: number) => {
    form.setFieldsValue({ checklistTypeId: value });
    // Opcionalmente, limpar as perguntas selecionadas se o tipo mudar
    // setTargetKeys([]);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="checklistForm"
      onFinish={onFinish}
      initialValues={{
        id: checklist?.id,
        name: checklist?.name || "",
        description: checklist?.description || "",
        checklistTypeId: checklist?.checklistTypeId,
      }}
      disabled={loading}
    >
      {checklist && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome do Checklist"
        hasFeedback
        rules={[
          { required: true, message: "Preencha o nome do checklist!" },
          {
            max: 100,
            message: "O nome pode ter no máximo 100 caracteres.",
          },
        ]}
      >
        <Input placeholder="Nome do checklist" autoComplete="off" />
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
          placeholder="Descrição do checklist"
          autoComplete="off"
          rows={3}
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
          options={checklistTypes?.map((type) => ({
            label: type.name,
            value: type.id,
          }))}
          onChange={handleChecklistTypeChange}
        />
      </Form.Item>

      <Form.Item label="Perguntas Associadas">
        <Transfer
          dataSource={transferDataSource}
          titles={["Disponíveis", "Selecionadas"]}
          targetKeys={targetKeys}
          onChange={handleTransferChange}
          render={(item) => item.title}
          oneWay
          showSearch
          listStyle={{ width: 250, height: 300 }}
          // Opcional: agrupar por tipo
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
          {checklist ? "Atualizar" : "Adicionar"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChecklistForm;
