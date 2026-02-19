import { Octokit } from '@octokit/rest';
// ============================================================
// Configuração do GitHub via variáveis de ambiente
// ============================================================
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'moreira-m';
const GITHUB_REPO = process.env.GITHUB_REPO || 'my-notes';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
// Prefixo do caminho dos docs dentro do repo
const DOCS_PREFIX = 'apps/web/docs';
let octokit = null;
function getOctokit() {
    if (!octokit) {
        if (!GITHUB_TOKEN) {
            throw new Error('GITHUB_TOKEN não configurado. Defina a variável de ambiente.');
        }
        octokit = new Octokit({ auth: GITHUB_TOKEN });
    }
    return octokit;
}
/**
 * Verifica se o GitHub está configurado (GITHUB_TOKEN presente)
 */
export function isGitHubConfigured() {
    return !!GITHUB_TOKEN;
}
/**
 * Lista todos os arquivos .md dentro de apps/web/docs/ no repositório
 */
export async function listFiles() {
    const ok = getOctokit();
    try {
        // Usa a Trees API para listar recursivamente
        const { data: refData } = await ok.git.getRef({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            ref: `heads/${GITHUB_BRANCH}`,
        });
        const { data: treeData } = await ok.git.getTree({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            tree_sha: refData.object.sha,
            recursive: 'true',
        });
        const files = treeData.tree
            .filter((item) => item.type === 'blob' &&
            item.path?.startsWith(DOCS_PREFIX + '/') &&
            item.path?.endsWith('.md'))
            .map((item) => item.path.replace(DOCS_PREFIX + '/', ''))
            .sort();
        return files;
    }
    catch (error) {
        console.error('[GitHub] Erro ao listar arquivos:', error);
        throw error;
    }
}
/**
 * Lê o conteúdo de um arquivo .md do repositório
 */
export async function getFileContent(filePath) {
    const ok = getOctokit();
    const fullPath = `${DOCS_PREFIX}/${filePath}`;
    const { data } = await ok.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: fullPath,
        ref: GITHUB_BRANCH,
    });
    if (Array.isArray(data) || data.type !== 'file') {
        throw new Error(`${fullPath} não é um arquivo`);
    }
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha };
}
/**
 * Cria ou atualiza um arquivo no repositório via commit
 */
export async function createOrUpdateFile(filePath, content, message, sha) {
    const ok = getOctokit();
    const fullPath = `${DOCS_PREFIX}/${filePath}`;
    const params = {
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: fullPath,
        message,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        branch: GITHUB_BRANCH,
    };
    // Se sha é fornecido, é um update (necessário para o GitHub API)
    if (sha) {
        params.sha = sha;
    }
    const { data } = await ok.repos.createOrUpdateFileContents(params);
    console.log(`[GitHub] Arquivo commitado: ${fullPath}`);
    return data.content?.path?.replace(DOCS_PREFIX + '/', '') || filePath;
}
//# sourceMappingURL=github.js.map