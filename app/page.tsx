'use client';

import React, { useEffect, useRef, useState } from 'react';

type Profile = {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  tags?: string[];
  imageData?: string | null; // base64 data URL
  timestamp?: string;
};

export default function Page() {
  const [status, setStatus] = useState<string>('Ready.');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const bioRef = useRef<HTMLTextAreaElement | null>(null);
  const tagsRef = useRef<HTMLInputElement | null>(null);

  function setStatusMsg(msg: string) {
    const time = new Date().toLocaleTimeString();
    setStatus(prev => `[${time}] ${msg}\n` + prev);
    // eslint-disable-next-line no-console
    console.log(msg);
  }

  function getProfileFromForm(): Profile {
    return {
      name: nameRef.current?.value.trim() || '',
      title: titleRef.current?.value.trim() || '',
      company: companyRef.current?.value.trim() || '',
      email: emailRef.current?.value.trim() || '',
      phone: phoneRef.current?.value.trim() || '',
      address: addressRef.current?.value.trim() || '',
      bio: bioRef.current?.value.trim() || '',
      tags: tagsRef.current?.value.split(',').map(t => t.trim()).filter(Boolean) || [],
      imageData: preview || null,
      timestamp: new Date().toISOString()
    };
  }

  function updateFormFromProfile(p: Profile) {
    if (nameRef.current) nameRef.current.value = p.name || '';
    if (titleRef.current) titleRef.current.value = p.title || '';
    if (companyRef.current) companyRef.current.value = p.company || '';
    if (emailRef.current) emailRef.current.value = p.email || '';
    if (phoneRef.current) phoneRef.current.value = p.phone || '';
    if (addressRef.current) addressRef.current.value = p.address || '';
    if (bioRef.current) bioRef.current.value = p.bio || '';
    if (tagsRef.current) tagsRef.current.value = (p.tags || []).join(', ');
    setPreview(p.imageData || null);
  }

  function clearForm() {
    if (nameRef.current) nameRef.current.value = '';
    if (titleRef.current) titleRef.current.value = '';
    if (companyRef.current) companyRef.current.value = '';
    if (emailRef.current) emailRef.current.value = '';
    if (phoneRef.current) phoneRef.current.value = '';
    if (addressRef.current) addressRef.current.value = '';
    if (bioRef.current) bioRef.current.value = '';
    if (tagsRef.current) tagsRef.current.value = '';
    setImageFile(null);
    setPreview(null);
    setStatusMsg('Form cleared.');
  }

  function handleImageChange(file?: File) {
    if (!file) {
      setImageFile(null);
      setPreview(null);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function writeProfile() {
    if (!('NDEFReader' in window)) {
      setStatusMsg('Web NFC is not supported on this browser.');
      return;
    }
    const profile = getProfileFromForm();
    if (!profile.name && !profile.email && !profile.phone) {
      setStatusMsg('Profile is empty — fill at least one field (name, email or phone).');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      setStatusMsg('Touch an NFC tag to write...');
      const json = JSON.stringify(profile);
      try {
        await ndef.write({
          records: [{
            recordType: 'mime',
            mediaType: 'application/json',
            data: new TextEncoder().encode(json)
          }]
        });
        setStatusMsg('Successfully wrote profile to tag.');
      } catch (mimeError) {
        try {
          await ndef.write({ records: [{ recordType: 'text', data: json }] });
          setStatusMsg('Wrote profile as text record (fallback).');
        } catch (textError) {
          setStatusMsg('Write failed: ' + (textError && (textError as Error).message || textError));
        }
      }
    } catch (err) {
      setStatusMsg('Error while writing: ' + (err && (err as Error).message || err));
    }
  }

  async function readProfile() {
    if (!('NDEFReader' in window)) {
      setStatusMsg('Web NFC is not supported on this browser.');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      setStatusMsg('Ready to scan. Bring an NFC tag close to the device...');
      await ndef.scan();

      ndef.onreadingerror = () => {
        setStatusMsg('Cannot read data from the NFC tag. Try again.');
      };

      ndef.onreading = (event: any) => {
        setStatusMsg('NFC tag detected.');
        const message = event.message;
        let parsed: Profile | null = null;

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
          setStatusMsg('Profile loaded from tag.');
        } else {
          setStatusMsg('No JSON profile found on this tag. Raw records: ' + JSON.stringify(message.records.map((r: any) => ({ recordType: r.recordType, mediaType: r.mediaType || null })), null, 2));
        }
      };
    } catch (err) {
      setStatusMsg('Failed to start scan: ' + (err && (err as Error).message || err));
    }
  }

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      setStatusMsg('Web NFC API not available. Use Chrome on Android or a supported Chromium build.');
    } else {
      setStatusMsg('Web NFC API available.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple professional color palette
  const palette = {
    bg: '#f5f7fb',
    card: '#ffffff',
    primary: '#0b5fff', // deep blue
    accent: '#0aa89e', // teal
    muted: '#6b7280'
  };

  return (
    <main style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial', background: palette.bg, minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 920, margin: '0 auto', background: palette.card, padding: 28, borderRadius: 12, boxShadow: '0 10px 30px rgba(11,15,30,0.08)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: palette.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>N</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>NFC Profile — Read & Write</h1>
            <p style={{ margin: 0, color: palette.muted, fontSize: 13 }}>Create and store person profiles on NFC tags. Images embedded as base64 in the tag JSON.</p>
          </div>
        </header>

        <form onSubmit={e => e.preventDefault()} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 20 }}>
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <div style={{ fontSize: 12, color: palette.muted }}>Full name</div>
                <input ref={nameRef} placeholder="Jane Doe" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>

              <label style={{ display: 'block' }}>
                <div style={{ fontSize: 12, color: palette.muted }}>Title</div>
                <input ref={titleRef} placeholder="Product Designer" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <label>
                <div style={{ fontSize: 12, color: palette.muted }}>Company</div>
                <input ref={companyRef} placeholder="Acme Corp." style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>

              <label>
                <div style={{ fontSize: 12, color: palette.muted }}>Email</div>
                <input ref={emailRef} type="email" placeholder="jane@company.com" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <label>
                <div style={{ fontSize: 12, color: palette.muted }}>Phone</div>
                <input ref={phoneRef} placeholder="+1 555 5555" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>

              <label>
                <div style={{ fontSize: 12, color: palette.muted }}>Address</div>
                <input ref={addressRef} placeholder="City, Country" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
              </label>
            </div>

            <label style={{ display: 'block', marginTop: 12 }}>
              <div style={{ fontSize: 12, color: palette.muted }}>Bio</div>
              <textarea ref={bioRef} placeholder="Short bio" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6', minHeight: 100 }} />
            </label>

            <label style={{ display: 'block', marginTop: 12 }}>
              <div style={{ fontSize: 12, color: palette.muted }}>Tags (comma separated)</div>
              <input ref={tagsRef} placeholder="designer, product, mentor" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={writeProfile} style={{ background: palette.primary, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>Write to tag</button>
              <button type="button" onClick={readProfile} style={{ background: palette.accent, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>Read from tag</button>
              <button type="button" onClick={clearForm} style={{ background: '#f3f4f6', color: '#111827', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' }}>Clear</button>
            </div>
          </section>

          <aside style={{ borderLeft: '1px solid #eef2f7', paddingLeft: 18 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 92, height: 92, borderRadius: 12, overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e6eef6' }}>
                {preview ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: palette.muted }}>No image</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: palette.muted }}>Profile image</div>
                <input type="file" accept="image/*" onChange={e => handleImageChange(e.target.files?.[0] || undefined)} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Images are embedded as base64 in the NFC JSON. Keep images small (recommended &lt; 200KB).</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ margin: 0, fontSize: 14 }}>Status</h3>
              <pre style={{ background: '#0f1720', color: '#cbd5e1', padding: 12, borderRadius: 8, maxHeight: 220, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{status}</pre>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
