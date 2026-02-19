/**
 * Verifica se o GitHub está configurado (GITHUB_TOKEN presente)
 */
export declare function isGitHubConfigured(): boolean;
/**
 * Lista todos os arquivos .md dentro de apps/web/docs/ no repositório
 */
export declare function listFiles(): Promise<string[]>;
/**
 * Lê o conteúdo de um arquivo .md do repositório
 */
export declare function getFileContent(filePath: string): Promise<{
    content: string;
    sha: string;
}>;
/**
 * Cria ou atualiza um arquivo no repositório via commit
 */
export declare function createOrUpdateFile(filePath: string, content: string, message: string, sha?: string): Promise<string>;
//# sourceMappingURL=github.d.ts.map