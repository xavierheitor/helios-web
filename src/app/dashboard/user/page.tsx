"use client";

import CardActions from "@/components/CardActions/CardActions";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorFallback from "@/components/ErrorFallback/ErrorFallback";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { deleteUser } from "@/lib/actions/user/deleteUser";
import { fetchSWRUsers } from "@/lib/actions/user/fetchUsers";
import { User } from "@prisma/client";
import { Alert, Card } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const UserPage: React.FC = () => {
  const {
    data: users,
    error,
    isValidating,
    isLoading,
    mutate: reload,
  } = useSWR("users", fetchSWRUsers);

  const router = useRouter();

  const handleDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteUser, reload, {
      title: "Você tem certeza que deseja deletar este Usuário?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

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
          onEdit={() => router.push(`/dashboard/user/${record.id}`)}
          module="user"
        />
      ),
    },
  ];

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }
  return (
    <Card title="Usuários" extra={<CardActions onRefresh={() => reload()} />}>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </ErrorBoundary>
    </Card>
  );
};

export default UserPage;
