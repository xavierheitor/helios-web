// src/components/SideBar.tsx

"use client";

import { Menu } from "antd";
import * as Icons from "@ant-design/icons";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";

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
        key: MenuKeys.cadastros_cargo,
        label: <Link href="/dashboard/cargo">Cargos</Link>,
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
        key: MenuKeys.cadastros_tipoVeiculo,
        label: <Link href="/dashboard/tipoVeiculo">Tipos de Veículos</Link>,
      },
      {
        key: MenuKeys.cadastros_equipe,
        label: <Link href="/dashboard/equipe">Equipes</Link>,
      },
      {
        key: MenuKeys.cadastros_tipoEquipe,
        label: <Link href="/dashboard/tipoEquipe">Tipos de Equipes</Link>,
      },
      // Terceiro nível dentro de "Cadastros" para "Checklist"
      {
        key: "cadastros_checklist",
        icon: <Icons.CheckSquareOutlined />,
        label: "Checklist",
        children: [
          {
            key: MenuKeys.cadastros_checklist_tipo,
            label: <Link href="/dashboard/tipoChecklist">Tipo Checklist</Link>,
          },
          {
            key: MenuKeys.cadastros_checklist_checklist,
            label: <Link href="/dashboard/checklist">Checklist</Link>,
          },
          {
            key: MenuKeys.cadastros_checklist_pergunta,
            label: <Link href="/dashboard/perguntaChecklist">Perguntas</Link>,
          },
          {
            key: MenuKeys.cadastros_checklist_opcaoResposta,
            label: <Link href="/dashboard/opcaoResposta">Respostas</Link>,
          },
        ],
      },
      // Adicione outros itens de Cadastros conforme necessário
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
  // Adicione outros itens conforme necessário
];

// // Função para filtrar os itens do menu com base nas permissões do usuário
// const filterMenuItems = (
//   items: MenuItem[],
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   permissions: Record<string, any>
// ): MenuItem[] => {
//   return items.reduce<MenuItem[]>((acc, item) => {
//     // Verifica se o usuário tem a permissão necessária para o item
//     if (item.permission && !permissions[item.permission]?.canView) {
//       return acc;
//     }

//     const newItem: MenuItem = { ...item };

//     // Se o item tiver filhos, filtre-os recursivamente
//     if (newItem.children) {
//       newItem.children = filterMenuItems(newItem.children, permissions);
//       // Se após o filtro não houver filhos, não adiciona o item pai
//       if (newItem.children.length === 0) {
//         return acc;
//       }
//     }

//     acc.push(newItem);
//     return acc;
//   }, []);
// };

export default function SideBar() {
  const path = usePathname();
  // const { data: session, status } = useSession();

  // Filtra os itens do menu com base nas permissões do usuário
  // const filteredItems = React.useMemo(() => {
  //   if (!session?.user?.permissions) return [];
  //   return filterMenuItems(menuItems, session.user.permissions);
  // }, [session]);

  // Função para encontrar a chave ativa com base no caminho atual
  const findActiveKey = (
    items: MenuItemProps[],
    currentPath: string
  ): string | undefined => {
    for (const item of items) {
      // Verifica se o item é uma ligação e se o caminho corresponde
      if (
        item.label &&
        React.isValidElement(item.label) &&
        ((typeof item.label.props.href === "string" &&
          (item.label.props.href === currentPath ||
            currentPath.startsWith(`${item.label.props.href}/`))) ||
          (typeof item.label.props.href === "object" &&
            (item.label.props.href === currentPath ||
              currentPath.startsWith(`${item.label.props.href}/`))))
      ) {
        return item.key?.toString();
      }

      // Se o item tiver filhos, verifica recursivamente
      if (item.children) {
        const childKey = findActiveKey(item.children, currentPath);
        if (childKey) return childKey;
      }
    }
    return undefined;
  };

  // Função para encontrar a chave do menu pai com base no caminho atual
  const findParentKey = (
    items: MenuItemProps[],
    currentPath: string
  ): string | undefined => {
    for (const item of items) {
      if (item.children) {
        const childKey = findActiveKey(item.children, currentPath);
        if (childKey) {
          return item.key?.toString();
        }
      }
    }
    return undefined;
  };

  const activeKey = findActiveKey(menuItems, path);
  const openKey = findParentKey(menuItems, path);

  return (
    <Menu
      mode="inline"
      selectedKeys={activeKey ? [activeKey] : []}
      defaultOpenKeys={openKey ? [openKey] : []}
      style={{ height: "100%", borderRight: 0 }}
      items={menuItems}
      // theme="dark"
    />
  );
}
