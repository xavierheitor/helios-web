"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { fetchSWRContratantes } from "@/lib/actions/contratantes/fetchSWRContratantes";
import { Contractor } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import ContractorForm from "./ContratanteForm";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import { deleteContratante } from "@/lib/actions/contratantes/deleteContratante";

const { Search } = Input;

const ContratantePage: React.FC = () => {
  const {
    data: contratantes,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<Contractor[], Error>("contratantes", fetchSWRContratantes);

  const [searchText, setSearchText] = useState(""); // Estado para o filtro de texto
  const [selectedContratante, setSelectedContratante] =
    useState<Contractor | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteContratante, reload, {
      title: "Você tem certeza que deseja deletar este Contratante?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };
  const handleEdit = (contratante: Contractor) => {
    setSelectedContratante(contratante);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedContratante(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedContratante(null);
    reload();
  };

  const filteredContratantes = contratantes?.filter((contratante) =>
    contratante.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Contractor> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "CNPJ",
      dataIndex: "cnpj",
      key: "cnpj",
    },
    {
      title: "Estado",
      dataIndex: "state",
      key: "state",
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
      title="Contratantes"
      extra={
        <CardActions onRefresh={() => reload()} onAdd={() => handleCreate()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Filtrar contratantes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />

        {/* Tabela de dados */}
        <Table
          columns={columns}
          dataSource={filteredContratantes}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedContratante ? "Editar" : "Adicionar"}
          open={isModalVisible}
          footer={null}
          onCancel={handleModalClose}
          destroyOnClose
        >
          <ContractorForm
            contractor={selectedContratante}
            onSuccess={handleModalClose}
          />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default ContratantePage;
