"use client";

import CardActions from "@/components/CardActions/CardActions";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteVeiculo } from "@/lib/actions/veiculo/deleteVeiculo";
import { fetchSWRVeiculos } from "@/lib/actions/veiculo/fetchSWRVeiculos";
import { fetchSWRTipoVeiculo } from "@/lib/actions/veiculo/tipoVeiculo/fetchSWRTipoVeiculo";
import { VehicleWithRelations } from "@/lib/utils/prismaTypes/vehicleWithRelations";
import { VehicleType } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import VeiculoForm from "./VeiculoForm";
import TipoVeiculoForm from "./TipoVeiculoForm";

const { Search } = Input;

const VeiculoPage: React.FC = () => {
  // ** Fetch SWR Veículos **
  const {
    data: veiculos,
    error: errorVeiculos,
    isLoading: isLoadingVeiculos,
    mutate: reloadVeiculos,
  } = useSWR<VehicleWithRelations[], Error>("veiculos", fetchSWRVeiculos);

  // ** Fetch SWR TipoVeiculos **
  const {
    data: tipoVeiculos,
    error: errorTipoVeiculos,
    isLoading: isLoadingTipoVeiculos,
    mutate: reloadTipoVeiculos,
  } = useSWR<VehicleType[], Error>("tipoVeiculos", fetchSWRTipoVeiculo);

  // ** Estados Modais **
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"veiculo" | "tipoVeiculo">(
    "veiculo"
  );
  const [formData, setFormData] = useState<
    VehicleWithRelations | VehicleType | null
  >(null);

  // ** Handlers Modais **
  const handleOpenModal = (type: "veiculo" | "tipoVeiculo", data?: any) => {
    setModalType(type);
    setFormData(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData(null);
  };

  const handleSuccess = () => {
    reloadVeiculos();
    reloadTipoVeiculos();
    handleCloseModal();
  };

  const handleVeiculoDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteVeiculo, handleSuccess, {
      title: "Você tem certeza que deseja deletar este veículo?",
    });
  };

  const handleTipoVeiculoDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteVeiculo, handleSuccess, {
      title: "Você tem certeza que deseja deletar este tipo de veículo?",
    });
  };

  // ** Filtrar veiculos
  const filteredVeiculos = veiculos?.filter((veiculo) =>
    veiculo.plate.toLowerCase().includes(searchText.toLowerCase())
  );

  // ** colum Veiculos
  const veiculosColumns: ColumnsType<VehicleWithRelations> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "Placa",
      dataIndex: "plate",
      key: "plate",
      sorter: (a, b) => (a.plate || "").localeCompare(b.plate || ""),
    },
    {
      title: "Tipo",
      dataIndex: ["vehicleType", "name"],
      key: "name",
      sorter: (a, b) =>
        (a.vehicleType?.name || "").localeCompare(b.vehicleType?.name || ""),
    },
    {
      title: "Contrato",
      dataIndex: ["contract", "name"],
      key: "contract",
      sorter: (a, b) =>
        (a.contract?.name || "").localeCompare(b.contract?.name || ""),
    },
    {
      title: "Ações",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <TableActionButton
          onEdit={() => handleOpenModal("veiculo", record)}
          onDelete={() => handleVeiculoDelete(record.id)}
        />
      ),
    },
  ];

  // ** TipoVeiculo columns
  const tipoVeiculoColumns: ColumnsType<VehicleType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
    },
    {
      title: "Ações",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <TableActionButton
          onEdit={() => handleOpenModal("tipoVeiculo", record)}
          onDelete={() => handleTipoVeiculoDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <>
      <Card
        title="Veículos"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("veiculo")}
            onRefresh={() => reloadVeiculos()}
          />
        }
      >
        {errorVeiculos && (
          <Alert message={errorVeiculos.message} type="error" showIcon />
        )}

        <Search
          placeholder="Buscar veículo por placa"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={veiculosColumns}
          dataSource={filteredVeiculos}
          loading={isLoadingVeiculos}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card
        title="Tipo de Veículos"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("tipoVeiculo")}
            onRefresh={() => reloadTipoVeiculos()}
          />
        }
      >
        {errorTipoVeiculos && (
          <Alert message={errorTipoVeiculos.message} type="error" showIcon />
        )}

        <Table
          columns={tipoVeiculoColumns}
          dataSource={tipoVeiculos}
          loading={isLoadingTipoVeiculos}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          modalType === "veiculo"
            ? "Veículo"
            : modalType === "tipoVeiculo"
            ? "Tipo de Veículo"
            : ""
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {modalType === "veiculo" && (
          <VeiculoForm
            veiculo={formData as VehicleWithRelations}
            onSuccess={handleSuccess}
          />
        )}
        {modalType === "tipoVeiculo" && (
          <TipoVeiculoForm
            tipoVeiculo={formData as VehicleType}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </>
  );
};

export default VeiculoPage;
