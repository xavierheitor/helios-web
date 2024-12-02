"use client";

// src/pages/DevicePage.tsx
import CardActions from "@/components/CardActions/CardActions";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteDevice } from "@/lib/actions/dispositivo/deleteDispositivo";
import { DeviceWithPermissions } from "@/lib/utils/prismaTypes/deviceWithRelations";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import React, { useState } from "react";
import useSWR from "swr";
import DeviceForm from "./DispositivoForm";
import { fetchSWRDispositivos } from "@/lib/actions/dispositivo/fetchSWRDispositivos";

const { Search } = Input;

const DevicePage: React.FC = () => {
  // ** Fetch SWR Devices **
  const {
    data: devices,
    error: errorDevices,
    isLoading: isLoadingDevices,
    mutate: reloadDevices,
  } = useSWR<DeviceWithPermissions[], Error>("devices", fetchSWRDispositivos);

  // ** Estados Modais **
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<DeviceWithPermissions | null>(null);

  // ** Handlers Modais **
  const handleOpenModal = (data?: DeviceWithPermissions) => {
    setFormData(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData(null);
  };

  const handleSuccess = () => {
    reloadDevices();
    handleCloseModal();
  };

  const handleDeviceDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteDevice, handleSuccess, {
      title: "Você tem certeza que deseja deletar este dispositivo?",
    });
  };

  // ** Filtrar dispositivos
  const filteredDevices = devices?.filter(
    (device) =>
      device.name.toLowerCase().includes(searchText.toLowerCase()) ||
      device.deviceUniqueId.toLowerCase().includes(searchText.toLowerCase())
  );

  // ** colunas Devices
  const devicesColumns: ColumnsType<DeviceWithPermissions> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Identificador Único",
      dataIndex: "deviceUniqueId",
      key: "deviceUniqueId",
      sorter: (a, b) => a.deviceUniqueId.localeCompare(b.deviceUniqueId),
    },
    {
      title: "Chave",
      dataIndex: "deviceKey",
      key: "deviceKey",
    },
    {
      title: "Ações",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <TableActionButton
          onEdit={() => handleOpenModal(record)}
          onDelete={() => handleDeviceDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <>
      <Card
        title="Dispositivos"
        extra={
          <CardActions
            onAdd={() => handleOpenModal()}
            onRefresh={() => reloadDevices()}
          />
        }
      >
        {errorDevices && (
          <Alert message={errorDevices.message} type="error" showIcon />
        )}

        <Search
          placeholder="Buscar dispositivo por nome"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={devicesColumns}
          dataSource={filteredDevices}
          loading={isLoadingDevices}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={formData ? "Editar Dispositivo" : "Novo Dispositivo"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <DeviceForm device={formData} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
};

export default DevicePage;
