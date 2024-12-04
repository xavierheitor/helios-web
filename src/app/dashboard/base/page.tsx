"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteBase } from "@/lib/actions/base/deleteBase";
import { fetchSWRBases } from "@/lib/actions/base/fetchSWRBases";
import { BaseWithRelations } from "@/lib/utils/prismaTypes/baseWithRelations";
import { Base, Contract } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import BaseForm from "./BaseForm";

const { Search } = Input;

const BasePage: React.FC = () => {
  const {
    data: bases,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<BaseWithRelations[], Error>("bases", fetchSWRBases);

  const [searchText, setSearchText] = useState(""); // Estado para o filtro de texto
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (base: Base) => {
    setSelectedBase(base);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedBase(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedBase(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteBase, reload, {
      title: "Você tem certeza que deseja deletar esta base?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const filteredBases = bases?.filter((base) =>
    base.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<BaseWithRelations> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Contrato",
      dataIndex: ["contract", "name"],
      key: "name",
      sorter: (a, b) => a.contract?.name.localeCompare(b.contract.name),
    },
    {
      title: "Ações",
      key: "actions",
      render: (base: Base) => (
        <TableActionButton
          onEdit={() => handleEdit(base)}
          onDelete={() => handleDelete(base.id)}
        />
      ),
    },
  ];

  if (error) {
    return <Alert message={error.message} type="error" showIcon />;
  }

  return (
    <Card
      title="Bases"
      extra={
        <CardActions onAdd={() => handleCreate()} onRefresh={() => reload()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Pesquisar"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={filteredBases}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedBase ? "Editar Base" : "Criar Base"}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          <BaseForm base={selectedBase} onSuccess={handleModalClose} />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default BasePage;
