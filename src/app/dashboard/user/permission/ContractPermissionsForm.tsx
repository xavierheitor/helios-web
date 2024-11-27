"use client";

import React, { useEffect } from "react";

import { UserContractPermissionWithRelations } from "@/lib/utils/prismaTypes/userContractPermissionWithRelations";
import {
  Alert,
  App,
  Button,
  Checkbox,
  Form,
  FormProps,
  Input,
  Select,
} from "antd";
import useSWR from "swr";
import fetchSWRContratos from "@/lib/actions/contratos/fetchSWRContracts";
import { editContractPermission } from "@/lib/actions/user/permission/editContractPermission";
import { newContractPermission } from "@/lib/actions/user/permission/newContractPermission";
const { Option } = Select;

interface ContractPermissionsFormProps {
  contractPermissions?: UserContractPermissionWithRelations | null;
  onSuccess: () => void;
  userId: number;
}

interface ContractPermissionsFormValues {
  id?: number;
  contractId: number;
  userId: number;
  contrato: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const ContractPermissionsForm: React.FC<ContractPermissionsFormProps> = ({
  contractPermissions,
  onSuccess,
  userId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { notification } = App.useApp();

  const {
    data: contratos,
    error: errorContratos,
    isLoading: loadingContratos,
  } = useSWR("contratos", fetchSWRContratos);

  useEffect(() => {
    if (contractPermissions) {
      form.setFieldsValue({
        id: contractPermissions.id,
        contractId: contractPermissions.contractId,
        userId: userId,
        contrato: contractPermissions.contract?.name,
        canView: contractPermissions.canView,
        canCreate: contractPermissions.canCreate,
        canEdit: contractPermissions.canEdit,
        canDelete: contractPermissions.canDelete,
      });
    }
  }, [contractPermissions, form, userId]);

  const onFinish: FormProps<ContractPermissionsFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      const action = contractPermissions
        ? editContractPermission
        : newContractPermission;

      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("contractId", values.contractId.toString());
      data.append("userId", userId.toString());
      data.append("canView", values.canView.toString());
      data.append("canCreate", values.canCreate.toString());
      data.append("canEdit", values.canEdit.toString());
      data.append("canDelete", values.canDelete.toString());

      const result = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!contractPermissions) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          // Mapear erros para os campos correspondentes
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ContractPermissionsFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o usuário:", err);
      notification.error({ message: "Ocorreu um erro ao salvar o usuário." });
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="userForm"
      onFinish={onFinish}
      initialValues={{
        id: contractPermissions?.id,
        contractId: contractPermissions?.contractId ?? "",
        userId: userId ?? "",
        contrato: contractPermissions?.contract?.name ?? "",
        canView: contractPermissions?.canView ?? true,
        canCreate: contractPermissions?.canCreate ?? false,
        canEdit: contractPermissions?.canEdit ?? false,
        canDelete: contractPermissions?.canDelete ?? false,
      }}
      disabled={loading}
    >
      <Form.Item name="userId" hidden>
        <Input type="hidden" />
      </Form.Item>
      {contractPermissions && (
        <>
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item name="contrato" label="Contrato">
            <Input placeholder="Nome do usuario" disabled />
          </Form.Item>

          <Form.Item name="contractId" hidden>
            <Input type="hidden" />
          </Form.Item>
        </>
      )}

      {!contractPermissions && (
        <Form.Item
          name="contractId"
          label="Contrato"
          rules={[{ required: true, message: "Selecione um contrato!" }]}
        >
          <Select placeholder="Selecione um contrato">
            {contratos &&
              contratos?.map((contrato) => (
                <Option key={contrato.id} value={contrato.id}>
                  {contrato.name}
                </Option>
              ))}
            {loadingContratos && (
              <Option disabled value="erro">
                Carregando...
              </Option>
            )}
            {errorContratos && (
              <Option disabled value="erro">
                Erro ao carregar contratos
              </Option>
            )}
          </Select>
        </Form.Item>
      )}

      <Form.Item name="canView" valuePropName="checked">
        <Checkbox>Pode Visualizar</Checkbox>
      </Form.Item>
      <Form.Item name="canCreate" valuePropName="checked">
        <Checkbox>Pode Criar</Checkbox>
      </Form.Item>
      <Form.Item name="canEdit" valuePropName="checked">
        <Checkbox>Pode Editar</Checkbox>
      </Form.Item>
      <Form.Item name="canDelete" valuePropName="checked">
        <Checkbox>Pode Deletar</Checkbox>
      </Form.Item>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {contractPermissions ? "Atualizar Permissão" : "Adicionar Permissão"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContractPermissionsForm;
