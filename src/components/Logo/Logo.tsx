// src/components/Logo/Logo.tsx

import Image from "next/image";
import logoFull from "./logo-light.png"; // Imagem completa (367x136)
import logoIcon from "./logo-icon-light.png"; // Versão reduzida ou apenas o ícone (por exemplo, 40x40)
import React from "react";
import styles from "./Logo.module.css"; // Importação do CSS module

interface LogoProps {
  collapsed: boolean;
}

export default function Logo({ collapsed }: LogoProps) {
  return (
    <div className={styles.logoContainer}>
      {collapsed ? (
        <Image src={logoIcon} alt="Logo" width={40} priority />
      ) : (
        <Image
          src={logoFull}
          alt="Logo"
          width={160}
          // height={44}
          priority
        />
      )}
    </div>
  );
}
