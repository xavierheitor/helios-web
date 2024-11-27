import { PrismaClient, Prisma } from "@prisma/client";
import { logger, prismaLogger } from "./logger";

// Estender o tipo PrismaClient para incluir _currentUserId e softDelete
class ExtendedPrismaClient extends PrismaClient {
  _currentUserId?: number | null;
}

// Criar a instância de Prisma
const prisma =
  globalThis.prisma ||
  new ExtendedPrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "info", emit: "event" },
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
    ],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
// Adicionando o método softDelete ao prisma
prisma.softDelete = async function <T extends keyof PrismaClient>(
  model: T,
  where: Record<string, any>
): Promise<void> {
  try {
    const delegate = (this as any)[model];
    if (!delegate || typeof delegate.update !== "function") {
      throw new Error(`O modelo ${String(model)} não existe no PrismaClient.`);
    }

    // O argumento `where` é passado diretamente, sem aninhamento
    await delegate.update({
      where,
      data: { deletedAt: new Date() },
    });

    prismaLogger.info(
      `Soft delete realizado no modelo ${String(
        model
      )} para ID ${JSON.stringify(where)}`
    );
  } catch (error) {
    logger.error("Erro ao realizar soft delete:", error);
    throw error;
  }
};

// Configuração de logs do Prisma para arquivos separados
prisma.$on("query" as never, (e: Prisma.QueryEvent) => {
  prismaLogger.info(`Query: ${e.query} - Params: ${e.params}`);
});

prisma.$on("info" as never, (e: Prisma.LogEvent) => {
  prismaLogger.info(`Info: ${e.message}`);
});

prisma.$on("warn" as never, (e: Prisma.LogEvent) => {
  prismaLogger.warn(`Warning: ${e.message}`);
});

prisma.$on("error" as never, (e: Prisma.LogEvent) => {
  prismaLogger.error(`Error: ${e.message}`);
});

// Middleware para interceptar soft delete e exclusão lógica
prisma.$use(async (params, next) => {
  // Interceptar ações de busca para ignorar registros deletados logicamente
  if (["findUnique", "findFirst", "findMany"].includes(params.action)) {
    if (!params.args) {
      params.args = {};
    }
    if (params.args.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null; // Ignorar deletados logicamente
      }
    } else {
      params.args.where = { deletedAt: null }; // Ignorar deletados logicamente
    }
  }

  // Executar a próxima operação no middleware
  const result = await next(params);

  // Middleware para log de ações automáticas
  try {
    const action = params.action.toUpperCase();
    const model = params.model;
    const userId = prisma._currentUserId || null;

    const isLoggableAction = ["CREATE", "UPDATE", "DELETE"].includes(action);

    if (isLoggableAction && model) {
      const targetId =
        action === "DELETE"
          ? params.args.where?.id
          : result?.id || params.args?.data?.id;

      // Compactar os detalhes removendo argumentos desnecessários
      const details = JSON.stringify({
        action,
        model,
        args: {
          where: params.args.where,
          data: params.args.data ? Object.keys(params.args.data) : undefined,
        },
      });

      // Registrar logs no arquivo
      prismaLogger.info(
        `Action: ${action}, Model: ${model}, User: ${userId}, Target ID: ${targetId}, Details: ${details}`
      );
    }
  } catch (error) {
    logger.error("Failed to log action automatically:", error);
  }

  return result;
});

// Função para definir o ID do usuário logado no Prisma
export function setCurrentUserId(userId: number | null) {
  prisma._currentUserId = userId;
}

export default prisma;
