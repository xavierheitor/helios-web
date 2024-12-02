"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteContract } from "@/lib/actions/contrato/deleteContract";
import fetchSWRContratos from "@/lib/actions/contrato/fetchSWRContracts";
import { Contract } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import ContractForm from "./ContratoForm";

const { Search } = Input;

const ContratoPage: React.FC = () => {
  const {
    data: contratos,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<Contract[], Error>("contratos", fetchSWRContratos);

  const [searchText, setSearchText] = useState(""); // Estado para o filtro de texto
  const [selectedContrato, setSelectedContrato] = useState<Contract | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (contrato: Contract) => {
    setSelectedContrato(contrato);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedContrato(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedContrato(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteContract, reload, {
      title: "Você tem certeza que deseja deletar este contrato?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const filteredContratos = contratos?.filter((contrato) =>
    contrato.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Contract> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Número",
      dataIndex: "number",
      key: "number",
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
      title="Contratos"
      extra={
        <CardActions onAdd={() => handleCreate()} onRefresh={() => reload()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Buscar contrato"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        {/* Tabela de dados */}
        <Table
          columns={columns}
          dataSource={filteredContratos}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title={selectedContrato ? "Editar Contrato" : "Criar Contrato"}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          <ContractForm
            contract={selectedContrato}
            onSuccess={handleModalClose}
          />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default ContratoPage;
