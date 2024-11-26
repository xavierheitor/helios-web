// src/components/ActionButton/ActionButton.tsx

"use client";

import React from "react";
import { Button, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
interface TableActionButtonProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onAdd?: () => void;
  onPermission?: () => void;
  module?: string; // Exemplo: 'base', 'funcionario', etc.
}

const TableActionButton: React.FC<TableActionButtonProps> = ({
  onDelete,
  onEdit,
  onAdd,
  onPermission,
  module,
}) => {
  return (
    <>
      {onPermission && (
        <Tooltip title={`Permissões`}>
          <Button
            type="text"
            onClick={onPermission}
            icon={<UnlockOutlined />}
            aria-label={`Adicionar`}
          />
        </Tooltip>
      )}

      {onAdd && (
        <Tooltip title={`Adicionar`}>
          <Button
            type="link"
            onClick={onAdd}
            icon={<PlusOutlined />}
            aria-label={`Adicionar`}
          />
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title={`Editar`}>
          <Button
            type="link"
            onClick={onEdit}
            icon={<EditOutlined />}
            aria-label={`Editar `}
          />
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title={`Apagar`}>
          <Button
            type="link"
            danger
            onClick={onDelete}
            icon={<DeleteOutlined />}
            aria-label={`Deletar `}
          />
        </Tooltip>
      )}
    </>
  );
};

export default TableActionButton;
