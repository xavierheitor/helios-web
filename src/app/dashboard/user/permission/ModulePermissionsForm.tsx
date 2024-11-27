"use client";

import React, { useEffect } from "react";
import { UserModulePermission } from "@prisma/client";
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
import { editModulePermission } from "@/lib/actions/user/permission/module/editModulePermission";
import { newModulePermission } from "@/lib/actions/user/permission/module/newModulePermission";
import { MenuGroups } from "@/enums/menus"; // Importar o MenuGroups gerado

const { Option, OptGroup } = Select;

interface ModulePermissionsFormProps {
  modulePermission?: UserModulePermission | null;
  onSuccess: () => void;
  userId: number;
}

interface ModulePermissionsFormValues {
  id?: number;
  userId: number;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const ModulePermissionsForm: React.FC<ModulePermissionsFormProps> = ({
  modulePermission,
  onSuccess,
  userId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { notification } = App.useApp();

  useEffect(() => {
    if (modulePermission) {
      form.setFieldsValue({
        id: modulePermission.id,
        userId: userId,
        module: modulePermission.module,
        canView: modulePermission.canView,
        canCreate: modulePermission.canCreate,
        canEdit: modulePermission.canEdit,
        canDelete: modulePermission.canDelete,
      });
    }
  }, [modulePermission, form, userId]);

  const findMenuDetails = (module: string) => {
    for (const group of Object.values(MenuGroups)) {
      const menu = group.find((item) => item.module === module);
      if (menu) {
        return { href: menu.href, menuKey: menu.key };
      }
    }
    return { href: "", menuKey: "" }; // Retorna valores padrão caso não encontre
  };

  const onFinish: FormProps<ModulePermissionsFormValues>["onFinish"] = async (
    values
  ) => {
    setLoading(true);
    setError(null);

    try {
      const action = modulePermission
        ? editModulePermission
        : newModulePermission;

      const { href, menuKey } = findMenuDetails(values.module);

      const data = new FormData();
      if (values.id) {
        data.append("id", values.id.toString());
      }
      data.append("userId", userId.toString());
      data.append("module", values.module);
      data.append("menuKey", menuKey);
      data.append("href", href);
      data.append("canView", values.canView.toString());
      data.append("canCreate", values.canCreate.toString());
      data.append("canEdit", values.canEdit.toString());
      data.append("canDelete", values.canDelete.toString());

      const result = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!modulePermission) {
          form.resetFields();
        }
        onSuccess();
      } else {
        if (result.errors) {
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof ModulePermissionsFormValues,
              errors: messages,
            }))
          );
        }
        notification.error({ message: result.message });
      }
    } catch (err) {
      console.error("Erro ao salvar o módulo:", err);
      notification.error({
        message: "Ocorreu um erro ao salvar a permissão de módulo.",
      });
      setError("Erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="modulePermissionForm"
      onFinish={onFinish}
      initialValues={{
        id: modulePermission?.id,
        userId: userId ?? "",
        module: modulePermission?.module ?? "",
        canView: modulePermission?.canView ?? true,
        canCreate: modulePermission?.canCreate ?? false,
        canEdit: modulePermission?.canEdit ?? false,
        canDelete: modulePermission?.canDelete ?? false,
      }}
      disabled={loading}
    >
      {modulePermission && (
        <Form.Item name="id" hidden>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item name="userId" hidden>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        name="module"
        label="Módulo"
        rules={[{ required: true, message: "O módulo é obrigatório!" }]}
      >
        <Select placeholder="Selecione um módulo">
          {Object.entries(MenuGroups).map(([group, menus]) => (
            <OptGroup key={group} label={group}>
              {menus.map((menu) => (
                <Option key={menu.module} value={menu.module}>
                  {menu.module}
                </Option>
              ))}
            </OptGroup>
          ))}
        </Select>
      </Form.Item>
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
          {modulePermission ? "Atualizar Permissão" : "Adicionar Permissão"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ModulePermissionsForm;
