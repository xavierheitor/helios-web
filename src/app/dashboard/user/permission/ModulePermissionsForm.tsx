import { UserModulePermission } from "@prisma/client";

interface ModulePermissionsFormProps {
  modulePermissions?: UserModulePermission | null;
  onSuccess: () => void;
  userId: number;
}

interface ModulePermissionsFormValues {
  id?: number;
}

const ModulePermissionsForm: React.FC<ModulePermissionsFormProps> = ({
  modulePermissions,
  onSuccess,
  userId,
}) => {
  return <div>ModulePermissionsForm</div>;
};

export default ModulePermissionsForm;
