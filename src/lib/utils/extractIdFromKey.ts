/**
 * Extrai o ID de uma string baseada em um prefixo.
 *
 * @param prefix - O prefixo esperado na string (e.g., "userContract-").
 * @param key - A string da qual o ID será extraído.
 * @returns O ID extraído como número ou null caso a chave seja inválida.
 * @throws Error se o prefixo ou o formato da string não forem válidos.
 */
export function extractIdFromKey(prefix: string, key: string): number | null {
  try {
    if (!key.startsWith(prefix)) {
      throw new Error(
        `A chave não começa com o prefixo esperado: "${prefix}". Chave recebida: "${key}"`
      );
    }

    const idPart = key.slice(prefix.length); // Extrai a parte após o prefixo
    const id = parseInt(idPart, 10);

    if (isNaN(id)) {
      throw new Error(
        `Não foi possível extrair um número válido da chave: "${key}". Parte extraída: "${idPart}"`
      );
    }

    return id;
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error(`Erro ao extrair ID da chave: ${error.message}`);
    return null; // Retorna null em caso de erro para evitar crash na aplicação
  }
}
