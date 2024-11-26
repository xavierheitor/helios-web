"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteUser } from "@/lib/actions/user/deleteUser";
import { fetchSWRUsers } from "@/lib/actions/user/fetchSWRUsers";
import { User } from "@prisma/client";
import { Alert, Card, Input, Modal } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useState } from "react";
import useSWR from "swr";
import UserForm from "./UserForm";
import { useRouter } from "next/navigation";

const { Search } = Input;

const UserPage: React.FC = () => {
  const router = useRouter();

  const {
    data: users,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<Partial<User>[], Error>("users", fetchSWRUsers);

  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState(""); // Estado para o filtro de texto

  const handleDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteUser, reload, {
      title: "Você tem certeza que deseja deletar este Usuário?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  const handleEdit = (user: Partial<User>) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
    reload();
  };

  // Função para filtrar os usuários com base no texto de busca
  const filteredUsers = users?.filter((user) =>
    [user.name, user.username, user.id?.toString()]
      .filter(Boolean)
      .some((value) =>
        value?.toLowerCase().includes(searchText.toLowerCase().trim())
      )
  );

  const columns: ColumnsType<Partial<User>> = [
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
      title: "Usuário",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <TableActionButton
          onDelete={() => handleDelete(record.id || 0)}
          onEdit={() => handleEdit(record)}
          onPermission={() =>
            router.push(`/dashboard/user/permission/${record.id}`)
          }
          module="user"
        />
      ),
    },
  ];

  if (error) {
    return <Alert message={error.message} type="error" showIcon />;
  }

  return (
    <Card
      title="Usuários"
      extra={
        <CardActions onRefresh={() => reload()} onAdd={() => handleCreate()} />
      }
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        {/* Campo de texto para filtro */}
        <Search
          placeholder="Filtrar usuários..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          dataSource={filteredUsers} // Dados filtrados
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          title={selectedUser ? "Editar" : "Adicionar"}
          open={isModalVisible}
          footer={null}
          onCancel={handleModalClose}
          destroyOnClose
        >
          <UserForm user={selectedUser} onSuccess={handleModalClose} />
        </Modal>
      </ErrorBoundary>
    </Card>
  );
};

export default UserPage;
