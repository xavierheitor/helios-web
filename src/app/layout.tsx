import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import Providers from "@/components/Providers/Providers";

export const metadata: Metadata = {
  title: "Helios",
  description: "Helios ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <Providers>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#164773", // Cor principal do tema
                  borderRadius: 4,
                },
                components: {
                  Menu: {
                    itemBg: "#1B263B", // Fundo dos itens
                    itemHoverBg: "#243B53", // Fundo ao passar o mouse
                    itemSelectedBg: "#243B53", // Fundo do item selecionado
                    itemColor: "#90AAB4", // Texto dos itens
                    itemHoverColor: "#FFFFFF", // Texto ao passar o mouse
                    itemSelectedColor: "#FFFFFF", // Texto do item selecionado
                    itemActiveBg: "#243B53", // Fundo do item selecionado
                  },
                },
              }}
            >
              <App>{children}</App>
            </ConfigProvider>
          </AntdRegistry>
        </Providers>
      </body>
    </html>
  );
}
