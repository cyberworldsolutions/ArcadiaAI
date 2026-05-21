// app/auth/page.tsx
'use client';
import React, { useState } from 'react';
import { browserSupabase } from '../lib/supabase-browser';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const { error } = await browserSupabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Check your email for the login link.');
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 6 }}
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Sending…' : 'Send sign-in link'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.toLowerCase().includes('error') ? 'crimson' : 'green' }}>
          {message}
        </p>
      )}
    </main>
  );
}
