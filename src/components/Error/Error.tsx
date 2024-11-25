// src/components/BaseList/ErrorAlert.tsx

"use client";

import React from "react";
import { Alert } from "antd";

interface ErrorComponentProps {
  message: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ message }) => {
  return (
    <Alert
      message={message}
      type="error"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

export default ErrorComponent;
