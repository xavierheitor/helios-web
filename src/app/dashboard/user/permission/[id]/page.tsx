"use client";

import { fetchSWRUser } from "@/lib/actions/user/fetchSWRUser";
import { Alert, Card, Modal, Spin, Table } from "antd";
import useSWR, { Fetcher } from "swr";
import { User, UserModulePermission } from "@prisma/client";
import { fetchSWRContractPermissions } from "@/lib/actions/user/permission/fetchSWRContractPermissions";
import CardActions from "@/components/CardActions/CardActions";
import { ColumnsType } from "antd/es/table";
import TableActionButton from "@/components/TableActionButton/TableActionButton";
import { UserContractPermissionWithRelations } from "@/lib/utils/prismaTypes/userContractPermissionWithRelations";
import { fetchSWRModulePermissions } from "@/lib/actions/user/permission/fetchSWRModulePermission";
import { useState } from "react";
import ContractPermissionsForm from "../ContractPermissionsForm";
import ModulePermissionsForm from "../ModulePermissionsForm";
import { handleDeleteConfirmation } from "@/components/HandleDelete/handleDelete";
import { deleteUserContractPermission } from "@/lib/actions/user/permission/deleteContractPermission";

interface PageProps {
  params: {
    id: string;
  };
}
const EditUserPermission: React.FC<PageProps> = ({ params }: PageProps) => {
  // ** FECTHER DADOS SWR
  const fetcher: Fetcher<Partial<User>, string> = (id) => fetchSWRUser(id);
  const contractFecher: Fetcher<
    UserContractPermissionWithRelations[],
    string
  > = (id) => fetchSWRContractPermissions(id);
  const moduleFetcher: Fetcher<UserModulePermission[], string> = (id) =>
    fetchSWRModulePermissions(id);

  // ** USER
  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
    mutate: userReload,
  } = useSWR<Partial<User>, Error>(params.id, fetcher);

  // ** CONTRATO PERMISSÕES
  const {
    data: contractPermissions,
    error: contractError,
    isLoading: contractIsLoading,
    mutate: contractReload,
  } = useSWR<UserContractPermissionWithRelations[], Error>(
    user?.id ? `userContract-${user?.id}` : null,
    contractFecher
  );

  // ** MODULO MPERMISSÕES
  const {
    data: modulePermissions,
    error: moduleError,
    isLoading: moduleIsLoading,
    mutate: moduleReload,
  } = useSWR<UserModulePermission[], Error>(
    user?.id ? `userModule-${user?.id}` : null,
    moduleFetcher
  );

  // ** MODAIS

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"contract" | "module">("contract");
  const [formData, setFormData] = useState<
    UserContractPermissionWithRelations | UserModulePermission | null
  >(null); // Dados para edição

  const handleOpenModal = (type: "contract" | "module", data?: any) => {
    setModalType(type);
    setFormData(data || null);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setFormData(null);
  };

  const handleSuccess = () => {
    // Atualize os dados após sucesso
    contractReload();
    moduleReload();
    handleCloseModal();
  };

  const handleContractDelete = (id: number) => {
    handleDeleteConfirmation(id, deleteUserContractPermission, contractReload, {
      title: "Você tem certeza que deseja deletar esta permissao?",
      content: "Esta ação é irreversível.",
      okText: "Sim",
      cancelText: "Não",
      okType: "danger",
    });
  };

  // ** COLUNAS

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
        render: (_, record) => (
          <TableActionButton
            module="permissions"
            onEdit={() => handleOpenModal("contract", record)}
            onDelete={() => handleContractDelete(record.id)}
          />
        ),
        width: 150,
      },
    ];

  const modulePermissionsColumns: ColumnsType<UserModulePermission> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      width: 70,
    },
    {
      title: "Módulo",
      dataIndex: ["module", "name"],
      key: "name",
      sorter: (a, b) => (a.module || "").localeCompare(b.module || ""),
      render: (_, record) => record.module || "N/A",
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

  // ** RENDER

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
        extra={
          <CardActions
            onRefresh={() => contractReload()}
            onAdd={() => handleOpenModal("contract")}
          />
        }
      >
        {contractError && (
          <Alert
            message="Erro ao buscar permissões de contrato"
            description="Houve um erro ao buscar as permissões de contrato. Por favor, tente novamente."
            type="error"
            showIcon
          />
        )}
        <Table
          dataSource={contractPermissions}
          loading={contractIsLoading || userIsLoading}
          columns={contractPermissionColumns}
          rowKey="id"
        />
      </Card>

      <Card
        title="Permissões de Módulo"
        style={{ marginTop: 20 }}
        extra={
          <CardActions
            onRefresh={() => moduleReload()}
            onAdd={() => handleOpenModal("module")}
          />
        }
      >
        {moduleError && (
          <Alert
            message="Erro ao buscar permissões de módulo"
            description="Houve um erro ao buscar as permissões de módulo. Por favor, tente novamente."
            type="error"
            showIcon
          />
        )}
        <Table
          dataSource={modulePermissions}
          loading={moduleIsLoading || userIsLoading}
          columns={modulePermissionsColumns}
          rowKey="id"
        />
      </Card>

      <Modal
        title={
          modalType === "contract"
            ? "Permissão de Contrato"
            : "Permissão de Módulo"
        }
        open={isModalVisible}
        footer={null}
        onCancel={handleCloseModal}
      >
        {modalType === "contract" ? (
          <ContractPermissionsForm
            contractPermissions={
              formData as UserContractPermissionWithRelations
            }
            onSuccess={handleSuccess}
            userId={user?.id ?? 0}
          />
        ) : (
          <ModulePermissionsForm
            modulePermissions={formData as UserModulePermission}
            onSuccess={handleSuccess}
            userId={user?.id ?? 0}
          />
        )}
      </Modal>
    </>
  );
};
export default EditUserPermission;
