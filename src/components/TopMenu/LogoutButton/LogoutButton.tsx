import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button type="text" icon={<LogoutOutlined />} onClick={() => signOut()} />
  );
}
