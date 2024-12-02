// src/pages/RespostaPage.tsx
"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteResposta } from "@/lib/actions/checklist/resposta/deleteResposta";
import { fetchSWRRespostas } from "@/lib/actions/checklist/resposta/fetchSWRRespostas";
import { AnswerWithRelations } from "@/lib/utils/prismaTypes/answerWithRelations";
import { Alert, Card, Input, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { useState } from "react";
import useSWR from "swr";
import AnswerForm from "./RespostaForm";

const { Search } = Input;

const RespostaPage: React.FC = () => {
  const {
    data: respostas,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<AnswerWithRelations[], Error>("respostas", fetchSWRRespostas);

  const [searchText, setSearchText] = useState("");
  const [selectedResposta, setSelectedResposta] =
    useState<AnswerWithRelations | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (resposta: AnswerWithRelations) => {
    setSelectedResposta(resposta);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedResposta(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedResposta(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deleteResposta, reload, {
      title: "Você tem certeza que deseja deletar esta resposta?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredRespostas = respostas?.filter((resposta) => {
    const normalizedSearchText = normalizeText(searchText);
    return (
      normalizeText(resposta.text).includes(normalizedSearchText) ||
      normalizeText(resposta.checklistType.name).includes(normalizedSearchText) ||
      (resposta.pending ? "sim" : "nao").includes(normalizedSearchText)
    );
  });

  const columns: ColumnsType<AnswerWithRelations> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Resposta",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Tipo",
      dataIndex: ["checklistType", "name"],
      key: "checklistType",
    },
    {
      title: "Gera pendência?",
      dataIndex: "pending",
      key: "pending",
      render: (pending: boolean) => (pending ? "Sim" : "Não"),
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
      title="Respostas"
      extra={
        <CardActions onRefresh={() => reload()} onAdd={() => handleCreate()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Search
          placeholder="Buscar resposta"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />

        <Table
          columns={columns}
          dataSource={filteredRespostas}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedResposta ? "Editar Resposta" : "Criar Resposta"}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          destroyOnClose
        >
          <AnswerForm answer={selectedResposta} onSuccess={handleModalClose} />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default RespostaPage;
