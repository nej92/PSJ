'use client';

import { useActionState } from 'react';
import { registerAction } from '@/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h1 className="auth-title">Sign Up</h1>
        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input className="form-input" id="name" name="name" type="text" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-input" id="email" name="email" type="email" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" id="password" name="password" type="password" required />
          </div>
          {state?.error && <div className="form-error">{state.error}</div>}
          <button className="btn btn-primary" type="submit" style={{width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem'}}>
            Sign Up
          </button>
        </form>
        <p style={{marginTop: '2rem', color: 'var(--text-secondary)'}}>
          Already have an account? <Link href="/login" style={{color: 'white', fontWeight: 600}}>Sign in.</Link>
        </p>
      </div>
    </div>
  );
}
