import React, { useState, useRef, useEffect } from 'react';

export default function Definicao({ children, texto }) {
  const [visivel, setVisivel] = useState(false);
  const wrapperRef = useRef(null);

  // Fecha o pop-up se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setVisivel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <span
      ref={wrapperRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'help',
        borderBottom: '2px dotted var(--ifm-color-primary)',
        fontWeight: 'bold',
        color: 'var(--ifm-color-primary)',
      }}
      onClick={() => setVisivel(!visivel)}
    >
      {children}
      {visivel && (
        <div
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ifm-background-surface-color, #fff)',
            color: 'var(--ifm-font-color-base)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            minWidth: '500px',
            maxWidth: '300px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: '1px solid var(--ifm-contents-border-color)',
            textAlign: 'left',
            lineHeight: '1.4',
          }}
        >
          {texto}
          {/* Triângulo na base do pop-up */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              marginLeft: '-8px',
              borderWidth: '8px',
              borderStyle: 'solid',
              borderColor: 'var(--ifm-background-surface-color, #fff) transparent transparent transparent',
            }}
          />
        </div>
      )}
    </span>
  );
}
