"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deletePergunta } from "@/lib/actions/checklist/pergunta/deletePergunta";
import { fetchSWRPerguntas } from "@/lib/actions/checklist/pergunta/fetchSWRPerguntas";
import { QuestionWithRelations } from "@/lib/utils/prismaTypes/questionWithRelations";
import { Alert, Card, Input, Modal } from "antd";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd/lib";
import { useState } from "react";
import useSWR from "swr";
import QuestionForm from "./PerguntaForm";

const { Search } = Input;

const PerguntaPage: React.FC = () => {
  const {
    data: perguntas,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<QuestionWithRelations[], Error>("perguntas", fetchSWRPerguntas);

  const [searchText, setSearchText] = useState("");
  const [selectedPergunta, setSelectedPergunta] =
    useState<QuestionWithRelations | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleEdit = (pergunta: QuestionWithRelations) => {
    setSelectedPergunta(pergunta);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedPergunta(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPergunta(null);
    reload();
  };

  const handleDelete = async (id: number) => {
    handleDeleteConfirmation(id, deletePergunta, reload, {
      title: "Você tem certeza que deseja deletar esta pergunta?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const filteredPerguntas = perguntas?.filter((pergunta) =>
    pergunta.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<QuestionWithRelations> = [
    {
      title: "Pergunta",
      dataIndex: "text",
      key: "text",
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
      title="Perguntas"
      extra={
        <CardActions onRefresh={() => reload()} onAdd={() => handleCreate()} />
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
          dataSource={filteredPerguntas}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={selectedPergunta ? "Editar Pergunta" : "Criar Pergunta"}
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          destroyOnClose
        >
          <QuestionForm
            question={selectedPergunta}
            onSuccess={handleModalClose}
          />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default PerguntaPage;
