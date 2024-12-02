"use client";

import { Menu, Spin } from "antd";
import * as Icons from "@ant-design/icons";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MenuKeys } from "@/enums/menus";

interface MenuItemProps {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItemProps[];
}

// Definição estática dos itens do menu com as permissões necessárias
const menuItems: MenuItemProps[] = [
  {
    key: MenuKeys.dashboard,
    icon: <Icons.DashboardOutlined />,
    label: <Link href="/dashboard#">Dashboard</Link>,
  },
  {
    key: MenuKeys.cadastros,
    icon: <Icons.DatabaseOutlined />,
    label: "Cadastros",
    children: [
      {
        key: MenuKeys.cadastros_base,
        label: <Link href="/dashboard/base">Bases</Link>,
      },
      {
        key: MenuKeys.cadastros_contrato,
        label: <Link href="/dashboard/contrato">Contratos</Link>,
      },
      {
        key: MenuKeys.cadastros_contratante,
        label: <Link href="/dashboard/contratante">Contratantes</Link>,
      },
      {
        key: MenuKeys.cadastros_dispositivo,
        label: <Link href="/dashboard/dispositivo">Dispositivos</Link>,
      },
      {
        key: MenuKeys.cadastros_funcionario,
        label: <Link href="/dashboard/funcionario">Funcionários</Link>,
      },
      {
        key: MenuKeys.cadastros_veiculo,
        label: <Link href="/dashboard/veiculo">Veículos</Link>,
      },
      {
        key: MenuKeys.cadastros_equipe,
        label: <Link href="/dashboard/equipe">Equipes</Link>,
      },
    ],
  },
  {
    key: MenuKeys.checklist,
    icon: <Icons.CheckSquareOutlined />,
    label: "Checklist",
    children: [
      {
        key: MenuKeys.cadastros_checklist_tipo,
        label: <Link href="/dashboard/checklist/tipo">Tipo Checklist</Link>,
      },
      {
        key: MenuKeys.cadastros_checklist,
        label: <Link href="/dashboard/checklist#">Checklist</Link>,
      },
      {
        key: MenuKeys.cadastros_checklist_pergunta,
        label: <Link href="/dashboard/checklist/pergunta">Perguntas</Link>,
      },
      {
        key: MenuKeys.cadastros_checklist_opcaoResposta,
        label: <Link href="/dashboard/checklist/opcaoResposta">Respostas</Link>,
      },
    ],
  },
  {
    key: MenuKeys.user,
    icon: <Icons.UserOutlined />,
    label: "Usuários",
    children: [
      {
        key: MenuKeys.usuarios_list,
        label: <Link href="/dashboard/user">Usuários</Link>,
      },
    ],
  },
];

const filterMenuItems = (
  items: MenuItemProps[],
  permissions: Record<string, { canView: boolean; menuKey?: string | null }>
): MenuItemProps[] => {
  return items.reduce<MenuItemProps[]>((acc, item) => {
    const newItem = { ...item };
    const permission = Object.values(permissions).find(
      (perm) => perm.menuKey === newItem.key
    );

    if (newItem.children) {
      newItem.children = filterMenuItems(newItem.children, permissions);
      if (newItem.children.length > 0) {
        acc.push(newItem);
        return acc;
      }
    }

    if (permission?.canView) {
      acc.push(newItem);
    }

    return acc;
  }, []);
};

export default function SideBar() {
  const path = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const userPermissions = session?.user?.modulesPermissions || {};
  const filteredMenuItems = filterMenuItems(menuItems, userPermissions);

  const findActiveKey = (
    items: MenuItemProps[],
    currentPath: string
  ): string | undefined => {
    for (const item of items) {
      if (
        item.label &&
        React.isValidElement(item.label) &&
        typeof item.label.props.href === "string" &&
        (item.label.props.href === currentPath ||
          currentPath.startsWith(`${item.label.props.href}/`))
      ) {
        return item.key?.toString();
      }

      if (item.children) {
        const childKey = findActiveKey(item.children, currentPath);
        if (childKey) return childKey;
      }
    }
    return undefined;
  };

  const activeKey = findActiveKey(filteredMenuItems, path);

  return (
    <Menu
      mode="inline"
      selectedKeys={activeKey ? [activeKey] : []}
      style={{ height: "100%", borderRight: 0 }}
      items={filteredMenuItems}
    />
  );
}
