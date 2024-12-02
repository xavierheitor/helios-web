// src/components/DeviceForm.tsx
import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { editDevice } from "@/lib/actions/dispositivo/editDispositivo";
import { newDevice } from "@/lib/actions/dispositivo/newDispositivo";
import { DeviceFormSchema } from "@/lib/utils/formSchemas/deviceFormSchema";
import { DeviceWithPermissions } from "@/lib/utils/prismaTypes/deviceWithRelations";
import { Contract } from "@prisma/client";
import { Alert, Button, Form, Input, notification, Transfer } from "antd";
import type {
  TransferDirection,
  TransferItem,
  TransferProps,
} from "antd/lib/transfer";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { ActionResult } from "../../../../types/actions/action-result";
import type { Key } from "react";

interface DeviceFormProps {
  device?: DeviceWithPermissions | null;
  onSuccess: () => void;
}

interface DeviceFormValues {
  id?: number;
  name: string;
  deviceUniqueId: string;
  contractIds: number[];
}

const DeviceForm: React.FC<DeviceFormProps> = ({ device, onSuccess }) => {
  const [form] = Form.useForm<DeviceFormValues>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ** Fetch Contracts **
  const { data: contracts, isLoading: contractsLoading } = useSWR<Contract[]>(
    "contratos",
    fetchSWRContratos
  );

  // ** State for Transfer Component **
  const [targetKeys, setTargetKeys] = useState<Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  useEffect(() => {
    if (device) {
      form.setFieldsValue({
        id: device.id,
        name: device.name,
        deviceUniqueId: device.deviceUniqueId,
        contractIds: device.DeviceContractPermissions.map(
          (perm) => perm.contractId
        ),
      });
      setTargetKeys(
        device.DeviceContractPermissions.map((perm) => perm.contractId)
      );
    } else {
      form.resetFields();
      setTargetKeys([]);
    }
  }, [device, form]);

  const onFinish = async (values: DeviceFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Adiciona os IDs dos contratos selecionados no Transfer
      values.contractIds = targetKeys.map((key) => Number(key));

      const validatedData = DeviceFormSchema.parse(values);

      const data = new FormData();

      if (device && device.id) data.append("id", device.id.toString());

      data.append("name", validatedData.name);
      data.append("deviceUniqueId", validatedData.deviceUniqueId);
      // Enviar contractIds como JSON
      data.append("contractIds", JSON.stringify(validatedData.contractIds));

      const action = device ? editDevice : newDevice;

      const result: ActionResult = await action({ isValid: true }, data);

      if (result.success) {
        notification.success({ message: result.message });
        if (!device) {
          form.resetFields();
          setTargetKeys([]);
        }
        onSuccess();
      } else {
        if (result.errors) {
          form.setFields(
            Object.entries(result.errors).map(([name, messages]) => ({
              name: name as keyof DeviceFormValues,
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
            name: name as keyof DeviceFormValues,
            errors: messages || [],
          }))
        );
      } else {
        console.error("Erro ao salvar o dispositivo:", err);
        notification.error({
          message: "Ocorreu um erro ao salvar o dispositivo.",
        });
        setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ** Configurações do Transfer **

  // Corrigindo o tipo de onTransferChange
  const onTransferChange: TransferProps<TransferItem>["onChange"] = (
    nextTargetKeys,
    direction,
    moveKeys
  ) => {
    setTargetKeys(nextTargetKeys);
  };

  // Corrigindo o tipo de onSelectChange
  const onSelectChange: TransferProps<TransferItem>["onSelectChange"] = (
    sourceSelectedKeys,
    targetSelectedKeys
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const dataSource: TransferItem[] =
    contracts?.map((contract) => ({
      key: contract.id, // Mantendo como número
      title: contract.name,
      description: contract.name,
    })) || [];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        id: device?.id,
        name: device?.name || "",
        deviceUniqueId: device?.deviceUniqueId || "",
      }}
    >
      {device && device.id && (
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Nome do Dispositivo"
        rules={[
          { required: true, message: "O nome do dispositivo é obrigatório!" },
          {
            max: 100,
            message: "O nome do dispositivo não pode exceder 100 caracteres!",
          },
        ]}
      >
        <Input placeholder="Digite o nome do dispositivo" />
      </Form.Item>

      <Form.Item
        name="deviceUniqueId"
        label="Identificador Único do Dispositivo"
        rules={[
          {
            required: true,
            message: "O identificador único do dispositivo é obrigatório!",
          },
          {
            max: 255,
            message: "O identificador único não pode exceder 255 caracteres!",
          },
        ]}
      >
        <Input placeholder="Digite o identificador único do dispositivo" />
      </Form.Item>

      <Form.Item label="Permissões de Contratos">
        <Transfer
          dataSource={dataSource}
          titles={["Contratos Disponíveis", "Contratos Selecionados"]}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onTransferChange}
          onSelectChange={onSelectChange}
          render={(item) => item.title || ""}
          listStyle={{ width: 220, height: 300 }}
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
          {device ? "Atualizar Dispositivo" : "Adicionar Dispositivo"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DeviceForm;
