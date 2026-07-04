'use client';

import { useActionState } from 'react';
import { loginAction } from '@/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h1 className="auth-title">Iniciar sesión</h1>
        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input className="form-input" id="email" name="email" type="email" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input className="form-input" id="password" name="password" type="password" required />
          </div>
          {state?.error && <div className="form-error">{state.error}</div>}
          <button className="btn btn-primary" type="submit" style={{width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem'}}>
            Entrar
          </button>
        </form>
        <p style={{marginTop: '2rem', color: 'var(--text-secondary)'}}>
          ¿No tienes cuenta? <Link href="/register" style={{color: 'white', fontWeight: 600}}>Regístrate ahora.</Link>
        </p>
      </div>
    </div>
  );
}
