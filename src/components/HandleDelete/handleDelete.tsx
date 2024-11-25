// src/hooks/handleDelete.ts

import { Modal, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { ActionResult } from "../../../types/actions/action-result";

// Define o tipo para a função de deleção
type DeleteFunction = (id: number) => Promise<ActionResult>;

// Define o tipo para a função de recarga
type ReloadFunction = () => void;

// Interface para opções adicionais
interface HandleDeleteOptions {
  title?: string;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  okType?: "default" | "primary" | "dashed" | "link" | "text" | "danger";
}

// Função genérica para lidar com a deleção
export async function handleDeleteConfirmation(
  id: number,
  deleteFn: DeleteFunction,
  reloadFn: ReloadFunction,
  options?: HandleDeleteOptions
): Promise<void> {
  Modal.confirm({
    title: options?.title || "Você tem certeza que deseja deletar este item?",
    icon: options?.title ? undefined : <ExclamationCircleOutlined />,
    content: options?.content || "Esta ação é irreversível.",
    okText: options?.okText || "Sim",
    okType: options?.okType || "danger",
    cancelText: options?.cancelText || "Não",
    onOk: async () => {
      try {
        const result: ActionResult = await deleteFn(id);
        if (result.success) {
          notification.success({
            message: result.message || "Item deletado com sucesso.",
          });
          reloadFn();
        } else {
          notification.error({
            message: result.message || "Ocorreu um erro ao deletar o item.",
            description: result.errors
              ? Object.entries(result.errors)
                  .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
                  .join("\n")
              : undefined,
          });
        }
      } catch (err) {
        console.error("Erro ao deletar item:", err);
        notification.error({
          message: "Ocorreu um erro inesperado ao deletar o item.",
        });
      }
    },
  });
}
