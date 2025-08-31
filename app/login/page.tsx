'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const sendMagic = async () => {
    setMsg('Sending magic link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setMsg('Error: ' + error.message);
    else setMsg('Check your inbox for the sign-in link.');
  };

  return (
    <div className="card" style={{maxWidth:480}}>
      <h2>Login / Sign up</h2>
      <p className="hint">Enter your email to receive a magic sign-in link.</p>
      <div className="flex">
        <input placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1}}/>
        <button onClick={sendMagic}>Send Link</button>
      </div>
      {msg && <p className="hint">{msg}</p>}
    </div>
  );
}
