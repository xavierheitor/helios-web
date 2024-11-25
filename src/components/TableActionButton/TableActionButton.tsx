// src/components/ActionButton/ActionButton.tsx

"use client";

import React from "react";
import { Button } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
interface TableActionButtonProps {
  onDelete?: () => void;
  onEdit?: () => void;
  module?: string; // Exemplo: 'base', 'funcionario', etc.
}

const TableActionButton: React.FC<TableActionButtonProps> = ({
  onDelete,
  onEdit,
  module,
}) => {
  return (
    <>
      {onEdit && (
        <Button
          type="link"
          onClick={onEdit}
          icon={<EditOutlined />}
          aria-label={`Editar ${module}`}
        />
      )}

      {onDelete && (
        <Button
          type="link"
          danger
          onClick={onDelete}
          icon={<DeleteOutlined />}
          aria-label={`Deletar ${module}`}
        />
      )}
    </>
  );
};

export default TableActionButton;
