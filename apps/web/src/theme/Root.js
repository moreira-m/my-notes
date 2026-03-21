import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Componente de Proteção de Acesso Global
 * Implementação separada para gerenciar apenas a autenticação.
 */
function ProtectedContent({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const ACCESS_PASSWORD = siteConfig.customFields.accessPassword;

  // Verifica se já está autenticado no sessionStorage
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthorized');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPassword === ACCESS_PASSWORD) {
      sessionStorage.setItem('isAuthorized', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Estilos básicos Inline para a tela de login (mantém o componente autocontido)
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--ifm-background-color)',
      color: 'var(--ifm-font-color-base)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        backgroundColor: 'var(--ifm-background-surface-color, #fff)',
        border: '1px solid var(--ifm-contents-border-color)'
      }}>
        <h2>Acesso</h2>
        <p>Insira a senha para visualizar o conteúdo.</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Senha de acesso"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            style={{
              padding: '12px',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              marginBottom: '15px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-font-color-base)'
            }}
          />
          <button
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              padding: '12px 24px',
              width: '100%',
              borderRadius: '8px',
              backgroundColor: isHovered ? 'var(--ifm-color-primary-darker)' : 'var(--ifm-color-primary)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            Entrar
          </button>
        </form>
        {error && <p style={{ color: 'var(--ifm-color-danger)', marginTop: '15px' }}>{error}</p>}
      </div>
    </div>
  );
}

// O componente Root do Docusaurus envolve toda a aplicação
export default function Root({ children }) {
  return <ProtectedContent>{children}</ProtectedContent>;
}
