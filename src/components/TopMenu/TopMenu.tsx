import { Button, Flex } from "antd";

import { NotificationOutlined, SettingOutlined } from "@ant-design/icons";
import LogoutButton from "./LogoutButton/LogoutButton";

export default function TopMenu() {
  return (
    <Flex gap="small" vertical style={{ padding: "10px 10px 10px 10px" }}>
      <Flex wrap gap="small">
        <Button type="text" icon={<NotificationOutlined />} />
        <Button type="text" icon={<SettingOutlined />} />
        <LogoutButton />
      </Flex>
    </Flex>
  );
}
