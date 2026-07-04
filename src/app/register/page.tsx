'use client';

import { useActionState } from 'react';
import { registerAction } from '@/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h1 className="auth-title">Crear cuenta</h1>
        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nombre</label>
            <input className="form-input" id="name" name="name" type="text" />
          </div>
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
            Crear cuenta
          </button>
        </form>
        <p style={{marginTop: '2rem', color: 'var(--text-secondary)'}}>
          ¿Ya tienes cuenta? <Link href="/login" style={{color: 'white', fontWeight: 600}}>Inicia sesión.</Link>
        </p>
      </div>
    </div>
  );
}
