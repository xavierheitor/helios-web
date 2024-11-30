"use client";

import CardActions from "@/components/CardActions/CardActions";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteFuncionario } from "@/lib/actions/funcionario/deleteFuncionario";
import { deleteCargo } from "@/lib/actions/cargo/deleteCargo"; // Novo handler para deletar cargos
import { fetchSWRFuncionarios } from "@/lib/actions/funcionario/fetchSWRFuncionarios";
import { fetchSWRCargos } from "@/lib/actions/cargo/fetchSWRCargos"; // Novo fetcher para buscar cargos
import { EmployeeWithRelations } from "@/lib/utils/prismaTypes/employeeWithRelations";
import { Role } from "@prisma/client";
import { Alert, Card, Input, Modal, Spin, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import FuncionarioForm from "./FuncionarioForm"; // Formulário para funcionários
import CargoForm from "./CargoForm";

const { Search } = Input;

const FuncionarioPage: React.FC = () => {
  // ** Fetch SWR Funcionários **
  const {
    data: funcionarios,
    error: errorFuncionarios,
    isLoading: isLoadingFuncionarios,
    mutate: reloadFuncionarios,
  } = useSWR<EmployeeWithRelations[], Error>(
    "funcionarios",
    fetchSWRFuncionarios
  );

  // ** Fetch SWR Cargos **
  const {
    data: cargos,
    error: errorCargos,
    isLoading: isLoadingCargos,
    mutate: reloadCargos,
  } = useSWR<Role[], Error>("cargos", fetchSWRCargos);

  // ** Estados Modais **
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"funcionario" | "cargo">(
    "funcionario"
  );
  const [formData, setFormData] = useState<EmployeeWithRelations | Role | null>(
    null
  );

  // ** Handlers Modais **
  const handleOpenModal = (type: "funcionario" | "cargo", data?: any) => {
    setModalType(type);
    setFormData(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData(null);
  };

  const handleSuccess = () => {
    reloadFuncionarios();
    reloadCargos();
    handleCloseModal();
  };

  const handleFuncionarioDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteFuncionario, reloadFuncionarios, {
      title: "Você tem certeza que deseja deletar este funcionário?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const handleCargoDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteCargo, reloadCargos, {
      title: "Você tem certeza que deseja deletar este cargo?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  // ** Filtrar Funcionários **
  const filteredFuncionarios = funcionarios?.filter((funcionario) =>
    funcionario.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ** Colunas Funcionários **
  const funcionarioColumns: ColumnsType<EmployeeWithRelations> = [
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
      title: "CPF",
      dataIndex: "cpf",
      key: "cpf",
    },
    {
      title: "Cargo",
      dataIndex: ["role", "name"],
      key: "role",
    },
    {
      title: "Contrato",
      dataIndex: ["contract", "name"],
      key: "name",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, funcionario) => (
        <TableActionButton
          onEdit={() => handleOpenModal("funcionario", funcionario)}
          onDelete={() => handleFuncionarioDelete(funcionario.id)}
        />
      ),
    },
  ];

  // ** Colunas Cargos **
  const cargoColumns: ColumnsType<Role> = [
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
      title: "Ações",
      key: "actions",
      render: (_, cargo) => (
        <TableActionButton
          onEdit={() => handleOpenModal("cargo", cargo)}
          onDelete={() => handleCargoDelete(cargo.id)}
        />
      ),
    },
  ];

  return (
    <>
      {/* Card Funcionários */}
      <Card
        title="Funcionários"
        extra={
          <CardActions
            onAdd={() => handleOpenModal("funcionario")}
            onRefresh={() => reloadFuncionarios()}
          />
        }
      >
        {errorFuncionarios && (
          <Alert message="Erro ao buscar funcionários" type="error" showIcon />
        )}
        <Search
          placeholder="Pesquisar funcionários"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={funcionarioColumns}
          dataSource={filteredFuncionarios}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoadingFuncionarios}
        />
      </Card>

      {/* Card Cargos */}
      <Card
        title="Cargos"
        style={{ marginTop: 20 }}
        extra={
          <CardActions
            onAdd={() => handleOpenModal("cargo")}
            onRefresh={() => reloadCargos()}
          />
        }
      >
        {errorCargos && (
          <Alert message="Erro ao buscar cargos" type="error" showIcon />
        )}
        <Table
          columns={cargoColumns}
          dataSource={cargos}
          rowKey="id"
          loading={isLoadingCargos}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          modalType === "funcionario"
            ? "Gerenciar Funcionário"
            : "Gerenciar Cargo"
        }
        open={isModalVisible}
        footer={null}
        onCancel={handleSuccess}
      >
        {modalType === "funcionario" ? (
          <FuncionarioForm
            employee={formData as EmployeeWithRelations}
            onSuccess={handleSuccess}
          />
        ) : (
          <CargoForm cargo={formData as Role} onSuccess={handleSuccess} />
        )}
      </Modal>
    </>
  );
};

export default FuncionarioPage;
