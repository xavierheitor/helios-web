"use client";

import { fetchSWRUser } from "@/lib/actions/user/fetchSWRUser";
import { Alert, Card, Spin, Table } from "antd";
import useSWR, { Fetcher } from "swr";
import { User } from "@prisma/client";
import { fetchSWRContractPermissions } from "@/lib/actions/user/permission/fetchSWRContractPermissions";
import CardActions from "@/components/CardActions/CardActions";
import { ColumnsType } from "antd/es/table";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { UserContractPermissionWithRelations } from "@/lib/utils/prismaTypes/userContractPermissionWithRelations";

interface PageProps {
  params: {
    id: string;
  };
}
const EditUserPermission: React.FC<PageProps> = ({ params }: PageProps) => {
  const fetcher: Fetcher<Partial<User>, string> = (id) => fetchSWRUser(id);
  const contractFecher: Fetcher<
    UserContractPermissionWithRelations[],
    string
  > = (id) => fetchSWRContractPermissions(id);

  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
    mutate: userReload,
  } = useSWR<Partial<User>, Error>(params.id, fetcher);

  const {
    data: contractPermissions,
    error: contractError,
    isLoading: contractIsLoading,
    mutate: contractReload,
  } = useSWR<UserContractPermissionWithRelations[], Error>(
    user?.id ? `userContract-${user?.id}` : null,
    contractFecher
  );

  const contractPermissionColumns: ColumnsType<UserContractPermissionWithRelations> =
    [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        sorter: (a, b) => a.id - b.id,
        width: 70,
      },
      {
        title: "Contrato",
        dataIndex: ["contract", "name"],
        key: "name",
        sorter: (a, b) =>
          (a.contract?.name || "").localeCompare(b.contract?.name || ""),
        render: (_, record) => record.contract?.name || "N/A",
      },

      {
        title: "Pode Visualizar",
        dataIndex: "canView",
        key: "canView",
        render: (canView: boolean) => (canView ? "Sim" : "Não"),
        sorter: (a, b) => Number(a.canView) - Number(b.canView),
        width: 120,
      },
      {
        title: "Pode Criar",
        dataIndex: "canCreate",
        key: "canCreate",
        render: (canCreate: boolean) => (canCreate ? "Sim" : "Não"),
        sorter: (a, b) => Number(a.canCreate) - Number(b.canCreate),
        width: 120,
      },
      {
        title: "Pode Editar",
        dataIndex: "canEdit",
        key: "canEdit",
        render: (canEdit: boolean) => (canEdit ? "Sim" : "Não"),
        sorter: (a, b) => Number(a.canEdit) - Number(b.canEdit),
        width: 120,
      },
      {
        title: "Pode Deletar",
        dataIndex: "canDelete",
        key: "canDelete",
        render: (canDelete: boolean) => (canDelete ? "Sim" : "Não"),
        sorter: (a, b) => Number(a.canDelete) - Number(b.canDelete),
        width: 120,
      },
      {
        title: "Ações",
        key: "actions",
        render: (_, record) => <TableActionButton module="permissions" />,
        width: 150,
      },
    ];

  return (
    <>
      <Card
        title="Dados do Usuário"
        extra={
          <CardActions
            onRefresh={() => userReload()}
            backUrl="/dashboard/user"
          />
        }
      >
        {userIsLoading && (
          <Spin size="large" style={{ display: "block", margin: "auto" }} />
        )}
        {userError && (
          <Alert
            message="Erro ao buscar usuário"
            description="Houve um erro ao buscar o usuário. Por favor, tente novamente."
            type="error"
            showIcon
          />
        )}
        {user && (
          <>
            <p>
              <strong>Nome:</strong> {user.name}
            </p>
            <p>
              <strong>Usuário:</strong> {user.username}
            </p>
          </>
        )}
      </Card>

      <Card
        title="Permissões de Contrato"
        style={{ marginTop: 20 }}
        extra={<CardActions onRefresh={() => contractReload()} />}
      >
        {contractIsLoading && (
          <Spin size="large" style={{ display: "block", margin: "auto" }} />
        )}
        {contractError && (
          <Alert
            message="Erro ao buscar permissões de contrato"
            description="Houve um erro ao buscar as permissões de contrato. Por favor, tente novamente."
            type="error"
            showIcon
          />
        )}
        {contractPermissions && (
          <Table
            dataSource={contractPermissions}
            loading={contractIsLoading}
            columns={contractPermissionColumns}
            rowKey="id"
          />
        )}
      </Card>
    </>
  );
};

export default EditUserPermission;
