import React, { useState, useRef, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

// ============================================================
// FUNÇÕES DE API
// ============================================================

async function loginRequest(apiUrl, username, password) {
  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Erro HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchPrompts(apiUrl) {
  const response = await fetch(`${apiUrl}/prompts`);
  if (!response.ok) throw new Error('Erro ao carregar prompts');
  const data = await response.json();
  return data.prompts;
}

async function handleDigitalizeRequest(apiUrl, files, token, promptId) {
  const results = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('promptId', promptId);
    const response = await fetch(`${apiUrl}/digitize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Erro HTTP ${response.status}`);
    }
    const data = await response.json();
    results.push(data.answer);
  }
  return results.join('\n\n---\n\n');
}

async function handleSaveRequest(apiUrl, text, destinationPath, mode = 'create', token, title) {
  const response = await fetch(`${apiUrl}/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text, path: destinationPath, mode, title }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Erro HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchExistingFiles(apiUrl) {
  const response = await fetch(`${apiUrl}/docs/files`);
  if (!response.ok) throw new Error('Erro ao listar arquivos');
  const data = await response.json();
  return data.files;
}

// ============================================================
// HELPERS DE AUTH (localStorage)
// ============================================================

function getStoredAuth() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('authUser');
  if (token && username) return { token, username };
  return null;
}

function setStoredAuth(token, username) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', username);
}

function clearStoredAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

// ============================================================
// COMPONENTE DE LOGIN
// ============================================================

function LoginForm({ apiUrl, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest(apiUrl, username, password);
      setStoredAuth(data.token, data.username);
      onLogin({ token: data.token, username: data.username });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.loginHeader}>
        <h2 className={styles.loginTitle}>Login</h2>
        <p className={styles.loginSubtitle}>
          Faça login para acessar a digitalização de cadernos.
        </p>
      </div>

      {error && (
        <div className={`${styles.feedback} ${styles.error}`}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-user">
            Usuário
          </label>
          <input
            id="login-user"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.textInput}
            placeholder="Digite seu usuário"
            required
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-pass">
            Senha
          </label>
          <input
            id="login-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.textInput}
            placeholder="Digite sua senha"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={`button button--primary button--lg ${styles.mainButton}`}
          disabled={loading || !username.trim() || !password.trim()}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const apiUrl = siteConfig.customFields.apiUrl;

  // Auth state
  const [auth, setAuth] = useState(null); // { token, username }

  // Digitization state
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [digitalizedText, setDigitalizedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Modo: 'create' (nova doc) ou 'append' (continuar existente)
  const [saveMode, setSaveMode] = useState('create');
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  // Destination fields para modo create
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [title, setTitle] = useState('');

  // Prompts / Skills
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');

  const fileInputRef = useRef(null);
  const idCounter = useRef(0);

  // Recupera autenticação do localStorage ao montar
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) setAuth(stored);

    // Carrega prompts disponíveis
    fetchPrompts(apiUrl)
      .then((list) => {
        setAvailablePrompts(list);
        if (list.length > 0) setSelectedPromptId(list[0].id);
      })
      .catch((err) => console.error('Erro ao carregar prompts:', err));
  }, [apiUrl]);

  // Carrega lista de arquivos existentes quando logado
  useEffect(() => {
    if (auth) {
      fetchExistingFiles(apiUrl)
        .then((fetchedFiles) => {
          setExistingFiles(fetchedFiles);
          if (fetchedFiles.length > 0 && !selectedFile) setSelectedFile(fetchedFiles[0]);
        })
        .catch((err) => {
          console.error(err);
          setFeedback({ type: 'error', message: 'Erro ao carregar arquivos existentes.' });
        });
    }
  }, [auth, apiUrl]); // Removido dependencia em saveMode

  const existingFolders = useMemo(() => {
    const folders = new Set();
    existingFiles.forEach(file => {
      const parts = file.split('/');
      parts.pop(); // remove file name
      if (parts.length > 0) {
        folders.add(parts.join('/'));
      } else {
        folders.add('/'); // Root
      }
    });
    return Array.from(folders).sort();
  }, [existingFiles]);

  // Seta um valor inicial para pasta selecionada quando as pastas carregam
  useEffect(() => {
    if (existingFolders.length > 0 && !selectedFolder) {
      setSelectedFolder(existingFolders[0]);
    } else if (existingFolders.length === 0 && !selectedFolder) {
      setSelectedFolder('new_folder');
    }
  }, [existingFolders, selectedFolder]);

  // --- AUTH HANDLERS ---

  function handleLogin(authData) {
    setAuth(authData);
    setFeedback(null);
  }

  function handleLogout() {
    clearStoredAuth();
    setAuth(null);
    resetState();
    setFeedback(null);
  }

  // --- FILE HANDLERS ---

  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files).map((file) => ({
      id: idCounter.current++,
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(id) {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  function moveFile(index, direction) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // --- DRAG & DROP ---

  function handleDragStart(e, index) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setFiles((prev) => {
      const next = [...prev];
      const [dragged] = next.splice(draggedIndex, 1);
      next.splice(index, 0, dragged);
      return next;
    });
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  // --- ACTION HANDLERS ---

  const destFolder = selectedFolder === 'new_folder' ? newFolderName.trim() : (selectedFolder === '/' ? '' : selectedFolder);

  async function handleDigitalize() {
    if (files.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione pelo menos uma imagem.' });
      return;
    }
    if (saveMode === 'create' && selectedFolder === 'new_folder' && !newFolderName.trim()) {
      setFeedback({ type: 'error', message: 'Informe o nome da nova pasta.' });
      return;
    }
    if (saveMode === 'append' && !selectedFile) {
      setFeedback({ type: 'error', message: 'Selecione um arquivo existente.' });
      return;
    }

    setFeedback(null);
    setStatus('loading');

    try {
      const rawFiles = files.map((f) => f.file);
      const text = await handleDigitalizeRequest(apiUrl, rawFiles, auth.token, selectedPromptId);
      setDigitalizedText(text);
      setStatus('preview');
    } catch (error) {
      console.error('Erro ao digitalizar:', error);
      // Se token expirou, desloga
      if (error.message.includes('401') || error.message.includes('Token')) {
        handleLogout();
        setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
        return;
      }
      setFeedback({ type: 'error', message: `Erro ao digitalizar: ${error.message}` });
      setStatus('idle');
    }
  }

  async function handleSave() {
    setStatus('saving');
    setFeedback(null);

    try {
      const destPath = saveMode === 'append' ? selectedFile : destFolder;
      const result = await handleSaveRequest(apiUrl, digitalizedText, destPath, saveMode, auth.token, title);

      const msg = saveMode === 'append'
        ? `Texto anexado em docs/${result.filePath}!`
        : `Texto salvo em docs/${result.filePath}!`;

      setFeedback({ type: 'success', message: msg });

      // Atualizar lista de arquivos
      fetchExistingFiles(apiUrl).then(setExistingFiles).catch(console.error);

      resetState();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      if (error.message.includes('401') || error.message.includes('Token')) {
        handleLogout();
        setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
        return;
      }
      setFeedback({ type: 'error', message: `Erro ao salvar: ${error.message}` });
      setStatus('preview');
    }
  }

  function handleEdit() {
    setIsEditing(!isEditing);
  }

  function handleDiscard() {
    resetState();
    setFeedback(null);
  }

  function resetState() {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setTitle('');
    setStatus('idle');
    setDigitalizedText('');
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Caminho de destino exibido na prévia
  let displayPath = '';
  if (saveMode === 'append') {
    displayPath = selectedFile;
  } else {
    displayPath = destFolder ? `${destFolder}/` : '';
    if (title) {
      const cleanTitle = title.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-');
      displayPath += cleanTitle ? `${cleanTitle}.md` : 'anotacao.md';
    } else {
      displayPath += 'anotacao-[data-atual].md';
    }
  }

  // --- RENDER ---

  return (
    <Layout
      title="Digitalizar Cadernos"
      description="Interface para digitalização de cadernos manuscritos usando IA"
    >
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Digitalizar Caderno</h1>
            <p className={styles.subtitle}>
              Fotografe suas anotações e transforme em documentação digital.
            </p>
          </div>

          {/* Barra de usuário logado */}
          {auth && (
            <div className={styles.userBar}>
              <span className={styles.userInfo}>
                Logado como <strong>{auth.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className={`button button--outline button--sm ${styles.logoutBtn}`}
              >
                Sair
              </button>
            </div>
          )}

          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.message}
            </div>
          )}

          {/* Se não autenticado, mostra login */}
          {!auth ? (
            <LoginForm apiUrl={apiUrl} onLogin={handleLogin} />
          ) : (
            <>
              {/* Estado: Idle */}
              {status === 'idle' && (
                <div className={styles.card}>
                  {/* Toggle: Nova doc vs Continuar existente */}
                  <div className={styles.modeToggle}>
                    <button
                      className={`${styles.modeBtn} ${saveMode === 'create' ? styles.modeBtnActive : ''}`}
                      onClick={() => setSaveMode('create')}
                    >
                      Nova documentação
                    </button>
                    <button
                      className={`${styles.modeBtn} ${saveMode === 'append' ? styles.modeBtnActive : ''}`}
                      onClick={() => setSaveMode('append')}
                    >
                      Continuar existente
                    </button>
                  </div>

                  {/* Input de arquivo */}
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="file-input">
                      Fotos das Anotações
                    </label>
                    <input
                      id="file-input"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                  </div>

                  {/* Galeria de thumbnails */}
                  {files.length > 0 && (
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Ordem das imagens ({files.length})
                        <span className={styles.hint}> — arraste ou use as setas para reordenar</span>
                      </label>
                      <div className={styles.imageGrid}>
                        {files.map((item, index) => (
                          <div
                            key={item.id}
                            className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className={styles.imageOrder}>{index + 1}</div>
                            <img src={item.preview} alt={`Página ${index + 1}`} className={styles.thumbnail} />
                            <div className={styles.imageActions}>
                              <button onClick={() => moveFile(index, -1)} disabled={index === 0} className={styles.imageBtn} title="Mover para cima">▲</button>
                              <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1} className={styles.imageBtn} title="Mover para baixo">▼</button>
                              <button onClick={() => removeFile(item.id)} className={`${styles.imageBtn} ${styles.imageBtnDanger}`} title="Remover">✕</button>
                            </div>
                            <div className={styles.imageName}>{item.file.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Destino: caminho novo ou arquivo existente */}
                  {saveMode === 'create' ? (
                    <>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="folder-select">
                          Pasta de Destino
                        </label>
                        <select
                          id="folder-select"
                          value={selectedFolder}
                          onChange={(e) => setSelectedFolder(e.target.value)}
                          className={styles.selectInput}
                        >
                          {existingFolders.map((folder) => (
                            <option key={folder} value={folder}>
                              {folder === '/' ? 'Diretório Raiz (docs/)' : `docs/${folder}`}
                            </option>
                          ))}
                          <option value="new_folder">Criar nova pasta...</option>
                        </select>
                      </div>

                      {selectedFolder === 'new_folder' && (
                        <div className={styles.field}>
                          <label className={styles.label} htmlFor="new-folder-input">
                            Nome da Nova Pasta
                          </label>
                          <input
                            id="new-folder-input"
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Ex: Matematica/Calculo I"
                            className={styles.textInput}
                          />
                        </div>
                      )}

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="title-input">
                          Título da Anotação (Opcional)
                        </label>
                        <input
                          id="title-input"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: Limites e Derivadas"
                          className={styles.textInput}
                        />
                        <span className={styles.hint}>
                          Será salvo em <code>docs/{displayPath}</code>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="file-select">
                        Anexar a qual documentação?
                      </label>
                      {existingFiles.length > 0 ? (
                        <>
                          <select
                            id="file-select"
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            className={styles.selectInput}
                          >
                            {existingFiles.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          <span className={styles.hint}>
                            O texto será anexado ao final de <code>docs/{selectedFile}</code>
                          </span>
                        </>
                      ) : (
                        <p className={styles.hint}>Nenhum arquivo encontrado em docs/. Crie uma documentação primeiro.</p>
                      )}
                    </div>
                  )}

                  {/* Seletor de prompt / skill */}
                  {availablePrompts.length > 0 && (
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="prompt-select">
                        Estilo de Digitalização
                      </label>
                      <select
                        id="prompt-select"
                        value={selectedPromptId}
                        onChange={(e) => setSelectedPromptId(e.target.value)}
                        className={styles.selectInput}
                      >
                        {availablePrompts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <span className={styles.hint}>
                        {availablePrompts.find((p) => p.id === selectedPromptId)?.description}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleDigitalize}
                    className={`button button--primary button--lg ${styles.mainButton}`}
                    disabled={
                      files.length === 0 ||
                      !selectedPromptId ||
                      (saveMode === 'create' && selectedFolder === 'new_folder' && !newFolderName.trim()) ||
                      (saveMode === 'append' && !selectedFile)
                    }
                  >
                    Digitalizar ({files.length} {files.length === 1 ? 'imagem' : 'imagens'})
                  </button>
                </div>
              )}

              {/* Estado: Loading */}
              {status === 'loading' && (
                <div className={styles.card}>
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Digitalizando {files.length} imagem(ns)...</p>
                    <p className={styles.loadingSubtext}>A IA está transcrevendo suas anotações na ordem definida.</p>
                  </div>
                </div>
              )}

              {/* Estado: Preview */}
              {(status === 'preview' || status === 'saving') && (
                <div className={styles.card}>
                  <div className={styles.previewHeader}>
                    <h2 className={styles.previewTitle}>Prévia do Texto</h2>
                    <span className={styles.previewPath}>
                      docs/{displayPath}
                    </span>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={digitalizedText}
                      onChange={(e) => setDigitalizedText(e.target.value)}
                      className={styles.textarea}
                      rows={15}
                    />
                  ) : (
                    <div className={styles.previewContent}>
                      <pre className={styles.previewText}>{digitalizedText}</pre>
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button
                      onClick={handleSave}
                      className={`button button--success button--lg ${styles.actionButton}`}
                      disabled={status === 'saving'}
                    >
                      {status === 'saving'
                        ? 'Salvando...'
                        : saveMode === 'append'
                          ? 'Anexar ao Documento'
                          : 'Subir Texto Digitalizado'}
                    </button>
                    <button
                      onClick={handleEdit}
                      className={`button button--secondary ${styles.actionButton}`}
                      disabled={status === 'saving'}
                    >
                      {isEditing ? 'Visualizar' : 'Editar Texto'}
                    </button>
                    <button
                      onClick={handleDiscard}
                      className={`button button--danger ${styles.actionButton}`}
                      disabled={status === 'saving'}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}
