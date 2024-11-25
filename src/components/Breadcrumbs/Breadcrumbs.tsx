"use client";

import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";
import React from "react";
import type { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";

export default function Breadcrumbs({
  style = { margin: "10px 35px" }, // Permite personalizar o estilo
}: {
  style?: React.CSSProperties;
}) {
  const path = usePathname();

  // Define o prefixo do dashboard
  const dashboardPrefix = "/dashboard";

  // Cálculo memoizado dos itens do breadcrumb
  const items: BreadcrumbItemType[] = React.useMemo(() => {
    if (!path) {
      return [];
    }

    const pathWithoutDashboard = path.startsWith(dashboardPrefix)
      ? path.slice(dashboardPrefix.length) || "/"
      : path;

    const pathSegments = pathWithoutDashboard.split("/").filter(Boolean);

    return [
      {
        title: (
          <Link href={dashboardPrefix}>
            <HomeOutlined />
          </Link>
        ),
        key: "dashboard", // Use uma key única
      },
      ...pathSegments.map((segment, index) => {
        const url = `${dashboardPrefix}/${pathSegments
          .slice(0, index + 1)
          .join("/")}`;

        const formattedSegment = decodeURIComponent(segment)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return {
          title: <Link href={url}>{formattedSegment}</Link>,
          key: url, // Chave única por segmento
        };
      }),
    ];
  }, [path]);

  // Retorno condicional movido para fora do hook
  if (!path) {
    return null;
  }

  return <Breadcrumb style={style} items={items} />;
}
