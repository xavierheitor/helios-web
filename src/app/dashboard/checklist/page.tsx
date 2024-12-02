// src/pages/ChecklistPage.tsx
"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteChecklist } from "@/lib/actions/checklist/deleteChecklist";
import { fetchSWRChecklists } from "@/lib/actions/checklist/fetchSWRChecklists";
import { ChecklistWithRelations } from "@/lib/utils/prismaTypes/checklistWithRelations";
import { Alert, Card, Input, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { useState } from "react";
import useSWR from "swr";
import ChecklistForm from "./ChecklistForm";

const { Search } = Input;

const ChecklistPage: React.FC = () => {
  const {
    data: checklists,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<ChecklistWithRelations[], Error>("checklists", fetchSWRChecklists);

  const [searchText, setSearchText] = useState("");
  const [selectedChecklist, setSelectedChecklist] =
    useState<ChecklistWithRelations | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (checklist: ChecklistWithRelations) => {
    setSelectedChecklist(checklist);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedChecklist(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedChecklist(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteChecklist, reload, {
      title: "Você tem certeza que deseja deletar este checklist?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const filteredChecklists = checklists?.filter((checklist) =>
    checklist.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<ChecklistWithRelations> = [
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
      title: "Tipo",
      dataIndex: ["checklistType", "name"],
      key: "checklistType",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
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
      title="Checklists"
      extra={
        <CardActions onRefresh={() => reload()} onAdd={() => handleCreate()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Buscar checklist"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={filteredChecklists}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedChecklist ? "Editar Checklist" : "Criar Checklist"}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          destroyOnClose
          width={800}
        >
          <ChecklistForm
            checklist={selectedChecklist}
            onSuccess={handleModalClose}
          />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default ChecklistPage;
