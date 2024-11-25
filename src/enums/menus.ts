// Define o array MENUS
export const MENUS = [
  { key: "dashboard", href: "/dashboard#" },
  { key: "cadastros_base", href: "/dashboard/base" },
  { key: "cadastros_contrato", href: "/dashboard/contrato" },
  { key: "cadastros_cargo", href: "/dashboard/cargo" },
  { key: "cadastros_contratante", href: "/dashboard/contratante" },
  { key: "cadastros_dispositivo", href: "/dashboard/dispositivo" },
  { key: "cadastros_funcionario", href: "/dashboard/funcionario" },
  { key: "cadastros_veiculo", href: "/dashboard/veiculo" },
  { key: "cadastros_tipoVeiculo", href: "/dashboard/tipoVeiculo" },
  { key: "cadastros_equipe", href: "/dashboard/equipe" },
  { key: "cadastros_tipoEquipe", href: "/dashboard/tipoEquipe" },
  { key: "cadastros_checklist_tipo", href: "/dashboard/tipoChecklist" },
  { key: "cadastros_checklist_checklist", href: "/dashboard/checklist" },
  { key: "cadastros_checklist_pergunta", href: "/dashboard/perguntaChecklist" },
  {
    key: "cadastros_checklist_opcaoResposta",
    href: "/dashboard/opcaoResposta",
  },
  { key: "outroMenu_item1", href: "/dashboard/outro1" },
  { key: "usuarios_list", href: "/dashboard/user" },
  { key: "permissoes", href: "/dashboard/permissoes" },
];

// Cria o objeto ENUM a partir de MENUS
export const MenuKeys = MENUS.reduce((acc, menu) => {
  acc[menu.key] = menu.key; // Define chave e valor como o mesmo
  return acc;
}, {} as Record<string, string>);

export const MenuHrefs = MENUS.reduce((acc, menu) => {
  acc[menu.key] = menu.href; // Mapeia chave para o href
  return acc;
}, {} as Record<string, string>);
