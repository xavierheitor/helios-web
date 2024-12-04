// src/enums/menus.ts

// Define o array MENUS com grupos
export const MENUS = [
  // ** GERAL
  {
    key: "dashboard",
    href: "/dashboard",
    module: "Dashboard",
    group: "Geral",
  },

  // ** CADASTROS
  {
    key: "cadastros_base",
    href: "/dashboard/base",
    module: "Base",
    group: "Cadastros",
  },
  {
    key: "cadastros_contrato",
    href: "/dashboard/contrato",
    module: "Contrato",
    group: "Cadastros",
  },
  {
    key: "cadastros_contratante",
    href: "/dashboard/contratante",
    module: "Contratante",
    group: "Cadastros",
  },
  {
    key: "cadastros_dispositivo",
    href: "/dashboard/dispositivo",
    module: "Dispositivo",
    group: "Cadastros",
  },
  {
    key: "cadastros_funcionario",
    href: "/dashboard/funcionario",
    module: "Funcionario",
    group: "Cadastros",
  },
  {
    key: "cadastros_veiculo",
    href: "/dashboard/veiculo",
    module: "Veiculo",
    group: "Cadastros",
  },
  {
    key: "cadastros_equipe",
    href: "/dashboard/equipe",
    module: "Equipe",
    group: "Cadastros",
  },
  {
    key: "cadastros_cargo",
    href: "/dashboard/cargo",
    module: "Cargo",
    group: "Cadastros",
  },
  {
    key: "cadastros_tipoVeiculo",
    href: "/dashboard/tipoVeiculo",
    module: "TipoVeiculo",
    group: "Cadastros",
  },
  {
    key: "cadastros_tipoEquipe",
    href: "/dashboard/tipoEquipe",
    module: "TipoEquipe",
    group: "Cadastros",
  },

  // ** CHECKLIST
  {
    key: "cadastros_checklist_tipo",
    href: "/dashboard/checklist/tipoChecklist",
    module: "TipoChecklist",
    group: "Checklist",
  },
  {
    key: "cadastros_checklist",
    href: "/dashboard/checklist",
    module: "Checklist",
    group: "Checklist",
  },
  {
    key: "cadastros_checklist_pergunta",
    href: "/dashboard/checklist/pergunta",
    module: "PerguntaChecklist",
    group: "Checklist",
  },
  {
    key: "cadastros_checklist_opcaoResposta",
    href: "/dashboard/checklist/opcaoResposta",
    module: "OpcaoResposta",
    group: "Checklist",
  },
  {
    key: "cadastros_checklist_associacao",
    href: "/dashboard/checklist/associacao",
    module: "associacao",
    group: "Checklist",
  },

  // ** USUÁRIOS
  {
    key: "usuarios_list",
    href: "/dashboard/user",
    module: "Usuarios",
    group: "Usuários",
  },
  {
    key: "permissoes",
    href: "/dashboard/permissoes",
    module: "Permissoes",
    group: "Usuários",
  },
];

// Criação do Enum para os módulos
export const MODULES = MENUS.reduce((acc, menu) => {
  if (menu.module) {
    acc[menu.module] = menu.module;
  }
  return acc;
}, {} as Record<string, string>);

// Criação de MenuKeys e MenuHrefs
export const MenuKeys = MENUS.reduce((acc, menu) => {
  acc[menu.key] = menu.key; // Define chave e valor como o mesmo
  return acc;
}, {} as Record<string, string>);

export const MenuHrefs = MENUS.reduce((acc, menu) => {
  acc[menu.key] = menu.href; // Mapeia chave para o href
  return acc;
}, {} as Record<string, string>);

// Enum final derivado de MODULES
export const MODULES_ENUM = Object.keys(MODULES).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {} as Record<string, string>);

// Criação de MenuGroups
export const MenuGroups = MENUS.reduce((acc, menu) => {
  const group = menu.group || "Outros"; // Define "Outros" como grupo padrão se não estiver especificado
  if (!acc[group]) {
    acc[group] = [];
  }
  acc[group].push(menu);
  return acc;
}, {} as Record<string, typeof MENUS>);
