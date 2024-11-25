import {
  PlusOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";

interface CardActionsProps {
  backUrl?: string;
  addUrl?: string;
  refreshUrl?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
}

const CardActions: React.FC<CardActionsProps> = ({
  backUrl,
  addUrl,
  refreshUrl,
  onAdd,
  onRefresh,
}) => {
  return (
    <Flex gap="small" align="center">
      {backUrl && (
        <Tooltip title="Voltar">
          <Button
            size="small"
            type="text"
            icon={<RollbackOutlined />}
            href={backUrl}
          />
        </Tooltip>
      )}
      {addUrl && (
        <Tooltip title="Adicionar">
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            href={addUrl}
          />
        </Tooltip>
      )}
      {onAdd && (
        <Tooltip title="Adicionar">
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={onAdd}
          />
        </Tooltip>
      )}
      {refreshUrl && (
        <Tooltip title="Atualizar">
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            href={refreshUrl}
          />
        </Tooltip>
      )}

      {onRefresh && (
        <Tooltip title="Atualizar">
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
        </Tooltip>
      )}
    </Flex>
  );
};

export default CardActions;
