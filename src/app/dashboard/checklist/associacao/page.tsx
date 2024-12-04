"use client";

import CardActions from "@/components/CardActions/CardActions";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteChecklistTeamTypeAssociation } from "@/lib/actions/checklist/associacao/tipoEquipe/deleteEquipeAssociacao";
import { fetchSWRChecklistTeamTypeAssociations } from "@/lib/actions/checklist/associacao/tipoEquipe/fetchSWREquipeAssociacoes";
import { deleteChecklistVehicleTypeAssociation } from "@/lib/actions/checklist/associacao/tipoVeiculo/deleteVehicleAssociacao";
import { fetchSWRChecklistVehicleTypeAssociations } from "@/lib/actions/checklist/associacao/tipoVeiculo/fetchSWRVehicleAssociacoes";
import { ChecklistTeamTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/ChecklistTeamTypeAssociationWithRelations";
import { ChecklistVehicleTypeAssociationWithRelations } from "@/lib/utils/prismaTypes/checklistVehicleTypeAssociationWithRelations";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import ChecklistTeamTypeAssociationForm from "./ChecklistTeamTypeAssociationForm";
import ChecklistVehicleTypeAssociationForm from "./ChecklistVehicleTypeAssociationForm";

const { Search } = Input;

const ChecklistAssociationsPage: React.FC = () => {
  // ** Fetch SWR ChecklistVehicleTypeAssociations **
  const {
    data: vehicleTypeAssociations,
    error: errorVehicleTypeAssociations,
    isLoading: isLoadingVehicleTypeAssociations,
    mutate: reloadVehicleTypeAssociations,
  } = useSWR<ChecklistVehicleTypeAssociationWithRelations[], Error>(
    "checklistVehicleTypeAssociations",
    fetchSWRChecklistVehicleTypeAssociations // Substitua 1 pelo ID do checklist relevante
  );

  // ** Fetch SWR ChecklistTeamTypeAssociations **
  const {
    data: teamTypeAssociations,
    error: errorTeamTypeAssociations,
    isLoading: isLoadingTeamTypeAssociations,
    mutate: reloadTeamTypeAssociations,
  } = useSWR<ChecklistTeamTypeAssociationWithRelations[], Error>(
    "checklistTeamTypeAssociations",
    fetchSWRChecklistTeamTypeAssociations
  );

  // ** Estados Modais **
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"vehicleType" | "teamType">(
    "vehicleType"
  );
  const [currentAssociation, setCurrentAssociation] = useState<
    | ChecklistVehicleTypeAssociationWithRelations
    | ChecklistTeamTypeAssociationWithRelations
    | null
  >(null);

  // ** Handlers Modais **
  const handleOpenModal = (type: "vehicleType" | "teamType", data?: any) => {
    setModalType(type);
    setCurrentAssociation(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentAssociation(null);
  };

  const handleSuccess = () => {
    reloadVehicleTypeAssociations();
    reloadTeamTypeAssociations();
    handleCloseModal();
  };

  // ** Handlers de Delete **
  const handleVehicleTypeDelete = (id: number) => {
    handleDeleteConfirmation(
      id,
      deleteChecklistVehicleTypeAssociation,
      handleSuccess,
      {
        title:
          "Você tem certeza que deseja deletar esta associação de tipo de veículo?",
      }
    );
  };

  const handleTeamTypeDelete = (id: number) => {
    handleDeleteConfirmation(
      id,
      deleteChecklistTeamTypeAssociation,
      handleSuccess,
      {
        title:
          "Você tem certeza que deseja deletar esta associação de tipo de equipe?",
      }
    );
  };

  // ** Columns para VehicleTypeAssociations **
  const vehicleTypeColumns: ColumnsType<ChecklistVehicleTypeAssociationWithRelations> =
    [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: "Checklist",
        dataIndex: ["checklist", "name"],
        key: "checklistId",
      },
      {
        title: "Tipo de Veículo",
        dataIndex: ["vehicleType", "name"],
        key: "vehicleType",
        sorter: (a, b) =>
          (a.vehicleType?.name || "").localeCompare(b.vehicleType?.name || ""),
      },
      {
        title: "Ações",
        key: "actions",
        render: (_, record) => (
          <TableActionButton
            onEdit={() => handleOpenModal("vehicleType", record)}
            onDelete={() => handleVehicleTypeDelete(record.id)}
          />
        ),
      },
    ];

  // ** Columns para TeamTypeAssociations **
  const teamTypeColumns: ColumnsType<ChecklistTeamTypeAssociationWithRelations> =
    [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: "Checklist",
        dataIndex: ["checklist", "name"],
        key: "checklistId",
      },
      {
        title: "Tipo de Equipe",
        dataIndex: ["teamType", "name"],
        key: "teamType",
        sorter: (a, b) =>
          (a.teamType?.name || "").localeCompare(b.teamType?.name || ""),
      },
      {
        title: "Ações",
        key: "actions",
        render: (_, record) => (
          <TableActionButton
            onEdit={() => handleOpenModal("teamType", record)}
            onDelete={() => handleTeamTypeDelete(record.id)}
          />
        ),
      },
    ];

  return (
    <>
      {/* VehicleType Associations Card */}
      <Card
        title="Associações de Tipo de Veículo"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("vehicleType")}
            onRefresh={() => reloadVehicleTypeAssociations()}
          />
        }
        style={{ marginBottom: 24 }}
      >
        {errorVehicleTypeAssociations && (
          <Alert
            message={errorVehicleTypeAssociations.message}
            type="error"
            showIcon
          />
        )}

        <Table
          columns={vehicleTypeColumns}
          dataSource={vehicleTypeAssociations}
          loading={isLoadingVehicleTypeAssociations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* TeamType Associations Card */}
      <Card
        title="Associações de Tipo de Equipe"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("teamType")}
            onRefresh={() => reloadTeamTypeAssociations()}
          />
        }
      >
        {errorTeamTypeAssociations && (
          <Alert
            message={errorTeamTypeAssociations.message}
            type="error"
            showIcon
          />
        )}

        <Table
          columns={teamTypeColumns}
          dataSource={teamTypeAssociations}
          loading={isLoadingTeamTypeAssociations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal para Forms */}
      <Modal
        title={
          modalType === "vehicleType"
            ? "Associar tipo de Veiculo"
            : modalType === "teamType"
            ? "Associar tipo de Equipe"
            : ""
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        {modalType === "vehicleType" && (
          <ChecklistVehicleTypeAssociationForm
            association={
              currentAssociation as ChecklistVehicleTypeAssociationWithRelations
            }
            onSuccess={handleSuccess}
          />
        )}
        {modalType === "teamType" && (
          <ChecklistTeamTypeAssociationForm
            association={
              currentAssociation as ChecklistTeamTypeAssociationWithRelations
            }
            onSuccess={handleSuccess}
          />
        )}
      </Modal>
    </>
  );
};

export default ChecklistAssociationsPage;
