"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/deleteTipoChecklist";
import { fetchSWRTipoChecklist } from "@/lib/actions/checklist/tipoChecklist/fetchSWRTipoChecklist";
import { ChecklistType } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import ChecklistTypeForm from "./TipoChecklistForm";

const { Search } = Input;

const TipoChecklistPage: React.FC = () => {
  const {
    data: tipoChecklists,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<ChecklistType[], Error>("tipoChecklists", fetchSWRTipoChecklist);

  const [searchText, setSearchText] = useState("");
  const [selectedTipoChecklist, setSelectedTipoChecklist] =
    useState<ChecklistType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (tipoChecklist: ChecklistType) => {
    setSelectedTipoChecklist(tipoChecklist);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedTipoChecklist(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTipoChecklist(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteTipoChecklist, reload, {
      title: "Você tem certeza que deseja deletar este tipo de checklist?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const filteredTipoChecklists = tipoChecklists?.filter((tipoChecklist) =>
    tipoChecklist.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<ChecklistType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Descrição",
      dataIndex: "description",
      key: "description",
      render: (_, record) => {
        if (record.description) {
          return record.description.length > 100
            ? `${record.description.slice(0, 100)}...`
            : record.description;
        } else {
          return "Sem descrição";
        }
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (text, record) => (
        <TableActionButton
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  if (error) {
    return <Alert message={error.message} type="error" showIcon />;
  }

  return (
    <Card
      title="Tipos de Checklist"
      extra={
        <CardActions onAdd={() => handleCreate()} onRefresh={() => reload()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Buscar tipo de checklist"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={filteredTipoChecklists}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={
            selectedTipoChecklist
              ? "Editar Tipo de Checklist"
              : "Criar Tipo de Checklist"
          }
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          destroyOnClose
        >
          <ChecklistTypeForm
            checklistType={selectedTipoChecklist}
            onSuccess={handleModalClose}
          />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default TipoChecklistPage;
