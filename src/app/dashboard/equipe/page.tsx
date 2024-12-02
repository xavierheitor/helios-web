"use client";

import CardActions from "@/components/CardActions/CardActions";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteEquipe } from "@/lib/actions/equipe/deleteEquipe";
import { fetchSWREquipes } from "@/lib/actions/equipe/fetchSWREquipes";
import { deleteTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/deleteTipoEquipe";
import { fetchSWRTipoEquipe } from "@/lib/actions/equipe/tipoEquipe/fetchSWRTipoEquipe";
import { TeamWithRelations } from "@/lib/utils/prismaTypes/teamWithRelations";
import { TeamType } from "@prisma/client";
import { Card, Alert, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import Search from "antd/es/transfer/search";
import { useState } from "react";
import useSWR from "swr";
import EquipeForm from "./EquipeForm";
import TipoEquipeForm from "./TipoEquipeForm";

const EquipePage: React.FC = () => {
  // ** Fetch SWR Equipes **
  const {
    data: equipes,
    error: errorEquipes,
    isLoading: isLoadingEquipes,
    mutate: reloadEquipes,
  } = useSWR<TeamWithRelations[], Error>("equipes", fetchSWREquipes);

  // ** Fetch SWR TipoEquipes **
  const {
    data: tipoEquipes,
    error: errorTipoEquipes,
    isLoading: isLoadingTipoEquipes,
    mutate: reloadTipoEquipes,
  } = useSWR<TeamType[], Error>("tipoEquipes", fetchSWRTipoEquipe);

  // ** Estados Modais
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"equipe" | "tipoEquipe">("equipe");
  const [formData, setFormData] = useState<TeamWithRelations | TeamType | null>(
    null
  );

  // ** Handlers Modais **
  const handleOpenModal = (type: "equipe" | "tipoEquipe", data?: any) => {
    setModalType(type);
    setFormData(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData(null);
  };

  const handleSuccess = () => {
    reloadEquipes();
    reloadTipoEquipes();
    handleCloseModal();
  };

  const handleEquipeDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteEquipe, handleSuccess, {
      title: "Deseja realmente deletar esta equipe?",
      content: "Esta ação é irreversível.",
    });
  };

  const handleTipoEquipeDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteTipoEquipe, handleSuccess, {
      title: "Deseja realmente deletar este tipo de equipe?",
      content: "Esta ação é irreversível.",
    });
  };

  // ** Filtrar equipes
  const filteredEquipes = equipes?.filter((equipe) =>
    equipe.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ** column Equipes
  const equipesColumns: ColumnsType = [
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
      title: "Tipo de Equipe",
      dataIndex: ["teamType", "name"],
      key: "teamType",
      sorter: (a, b) => a.teamType.name.localeCompare(b.teamType.name),
    },
    {
      title: "Contrato",
      dataIndex: ["contract", "name"],
      key: "contract",
      sorter: (a, b) => a.contract.name.localeCompare(b.contract.name),
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <TableActionButton
          onEdit={() => handleOpenModal("equipe", record)}
          onDelete={() => handleEquipeDelete(record.id)}
        />
      ),
    },
  ];

  // ** TipoEquipe columns
  const tipoEquipesColumns: ColumnsType<TeamType> = [
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
          onEdit={() => handleOpenModal("tipoEquipe", record)}
          onDelete={() => handleTipoEquipeDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <>
      <Card
        title="Equipes"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("equipe")}
            onRefresh={() => reloadEquipes()}
          />
        }
      >
        {errorEquipes && (
          <Alert message={errorEquipes.message} type="error" showIcon />
        )}

        <Search
          placeholder="Buscar equipe por placa"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          columns={equipesColumns}
          dataSource={filteredEquipes}
          loading={isLoadingEquipes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card
        title="Tipo de Equipes"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("tipoEquipe")}
            onRefresh={() => reloadTipoEquipes()}
          />
        }
      >
        {errorTipoEquipes && (
          <Alert message={errorTipoEquipes.message} type="error" showIcon />
        )}

        <Table
          columns={tipoEquipesColumns}
          dataSource={tipoEquipes}
          loading={isLoadingTipoEquipes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          modalType === "equipe"
            ? "Equipe"
            : modalType === "tipoEquipe"
            ? "Tipo de Equipe"
            : ""
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {modalType === "equipe" && (
          <EquipeForm
            equipe={formData as TeamWithRelations}
            onSuccess={handleSuccess}
          />
        )}
        {modalType === "tipoEquipe" && (
          <TipoEquipeForm
            tipoEquipe={formData as TeamType}
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </>
  );
};

export default EquipePage;
