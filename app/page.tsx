'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [status, setStatusState] = useState<string>('Ready.');
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  function setStatus(msg: string) {
    const time = new Date().toLocaleTimeString();
    setStatusState(prev => `[${time}] ${msg}\n` + prev);
    // also log for debugging
    // eslint-disable-next-line no-console
    console.log(msg);
  }

  function getProfileFromForm() {
    return {
      name: nameRef.current?.value.trim() || '',
      email: emailRef.current?.value.trim() || '',
      phone: phoneRef.current?.value.trim() || '',
      timestamp: new Date().toISOString()
    };
  }

  function updateFormFromProfile(p: any) {
    if (nameRef.current) nameRef.current.value = p.name || '';
    if (emailRef.current) emailRef.current.value = p.email || '';
    if (phoneRef.current) phoneRef.current.value = p.phone || '';
  }

  function clearForm() {
    if (nameRef.current) nameRef.current.value = '';
    if (emailRef.current) emailRef.current.value = '';
    if (phoneRef.current) phoneRef.current.value = '';
    setStatus('Form cleared.');
  }

  async function writeProfile() {
    if (!('NDEFReader' in window)) {
      setStatus('Web NFC is not supported on this browser.');
      return;
    }
    const profile = getProfileFromForm();
    if (!profile.name && !profile.email && !profile.phone) {
      setStatus('Profile is empty — fill at least one field.');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      setStatus('Touch an NFC tag to write...');
      const json = JSON.stringify(profile);
      try {
        await ndef.write({
          records: [{
            recordType: 'mime',
            mediaType: 'application/json',
            data: new TextEncoder().encode(json)
          }]
        });
        setStatus('Successfully wrote JSON profile to tag.');
      } catch (mimeError) {
        try {
          await ndef.write({ records: [{ recordType: 'text', data: json }] });
          setStatus('Wrote profile as text record (fallback).');
        } catch (textError) {
          setStatus('Write failed: ' + (textError && (textError as Error).message || textError));
        }
      }
    } catch (err) {
      setStatus('Error while writing: ' + (err && (err as Error).message || err));
    }
  }

  async function readProfile() {
    if (!('NDEFReader' in window)) {
      setStatus('Web NFC is not supported on this browser.');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      setStatus('Ready to scan. Bring an NFC tag close to the device...');
      await ndef.scan();

      ndef.onreadingerror = () => {
        setStatus('Cannot read data from the NFC tag. Try again.');
      };

      ndef.onreading = (event: any) => {
        setStatus('NFC tag detected.');
        const message = event.message;
        let parsed: any = null;

        for (const record of message.records) {
          try {
            if (record.recordType === 'mime' && record.mediaType === 'application/json') {
              const textDecoder = new TextDecoder();
              const data = record.data instanceof ArrayBuffer ? textDecoder.decode(record.data) : textDecoder.decode(new Uint8Array(record.data));
              parsed = JSON.parse(data);
              break;
            } else if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              const data = textDecoder.decode(record.data);
              parsed = JSON.parse(data);
              break;
            } else if (record.recordType === 'unknown' && record.data) {
              const data = new TextDecoder().decode(record.data);
              try { parsed = JSON.parse(data); break; } catch {}
            }
          } catch (e) {
            // ignore and continue
          }
        }

        if (parsed) {
          updateFormFromProfile(parsed);
          setStatus('Profile loaded from tag.');
        } else {
          setStatus('No JSON profile found on this tag. Raw records: ' + JSON.stringify(message.records.map((r: any) => ({ recordType: r.recordType, mediaType: r.mediaType || null })), null, 2));
        }
      };
    } catch (err) {
      setStatus('Failed to start scan: ' + (err && (err as Error).message || err));
    }
  }

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setStatus('Web NFC API not available. Use Chrome on Android or a supported Chromium build.');
    } else {
      setStatus('Web NFC API available.');
    }
    // show git / deploy instructions once
    const deployUrl = 'https://nfc-profile-one.vercel.app/';
    const repo = 'https://github.com/ALOYO-BRENDA-OJERA/nfc-profile';
    setStatus(`To commit & push this project to GitHub: git add .; git commit -m "update"; git push\nRepo: ${repo}\nDeployed at: ${deployUrl}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial', maxWidth: 720, margin: '24px auto', background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 6px 18px rgba(30,40,50,0.06)' }}>
      <h1 style={{ marginTop: 0 }}>NFC Profile — Read & Write</h1>

      <form onSubmit={e => e.preventDefault()}>
        <label style={{ display: 'block', margin: '10px 0' }}>
          Name
          <input ref={nameRef} id="name" type="text" placeholder="Full name" style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #d0d7de' }} />
        </label>

        <label style={{ display: 'block', margin: '10px 0' }}>
          Email
          <input ref={emailRef} id="email" type="email" placeholder="you@example.com" style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #d0d7de' }} />
        </label>

        <label style={{ display: 'block', margin: '10px 0' }}>
          Phone
          <input ref={phoneRef} id="phone" type="tel" placeholder="+1 555 5555" style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #d0d7de' }} />
        </label>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={writeProfile} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#0366d6', color: '#fff' }}>Write to tag</button>
          <button type="button" onClick={readProfile} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#0366d6', color: '#fff' }}>Read from tag</button>
          <button type="button" onClick={clearForm} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#6a737d', color: '#fff' }}>Clear</button>
        </div>
      </form>

      <section style={{ marginTop: 16 }}>
        <h2>Status</h2>
        <pre style={{ background: '#0f1720', color: '#cbd5e1', padding: 12, borderRadius: 6, maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{status}</pre>
      </section>
    </main>
  );
}
