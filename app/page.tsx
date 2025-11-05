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
  imageData?: string | null;
  timestamp?: string;
};

const palette = {
  bg: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
  card: '#fff',
  primary: '#2563eb',
  accent: '#06b6d4',
  muted: '#64748b',
  border: '#e5e7eb',
  shadow: '0 8px 32px 0 rgba(31, 41, 55, 0.12)',
  toast: '#111827',
  toastText: '#f1f5f9'
};

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg"><g><circle fill="%23e0e7ff" cx="48" cy="48" r="48"/><ellipse fill="%23647748b" cx="48" cy="66" rx="28" ry="18"/><circle fill="%23647748b" cx="48" cy="40" r="20"/></g></svg>';

export default function Page() {
  const [status, setStatus] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
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

  function showStatus(msg: string) {
    setStatus(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
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
    showStatus('Form cleared.');
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
      showStatus('Web NFC is not supported on this browser.');
      return;
    }
    const profile = getProfileFromForm();
    if (!profile.name && !profile.email && !profile.phone) {
      showStatus('Profile is empty — fill at least one field (name, email or phone).');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      showStatus('Touch an NFC tag to write...');
      const json = JSON.stringify(profile);
      try {
        await ndef.write({
          records: [{
            recordType: 'mime',
            mediaType: 'application/json',
            data: new TextEncoder().encode(json)
          }]
        });
        showStatus('Successfully wrote profile to tag.');
      } catch (mimeError) {
        try {
          await ndef.write({ records: [{ recordType: 'text', data: json }] });
          showStatus('Wrote profile as text record (fallback).');
        } catch (textError) {
          showStatus('Write failed: ' + (textError && (textError as Error).message || textError));
        }
      }
    } catch (err) {
      showStatus('Error while writing: ' + (err && (err as Error).message || err));
    }
  }

  async function readProfile() {
    if (!('NDEFReader' in window)) {
      showStatus('Web NFC is not supported on this browser.');
      return;
    }

    try {
      // @ts-ignore
      const ndef = new (window as any).NDEFReader();
      showStatus('Ready to scan. Bring an NFC tag close to the device...');
      await ndef.scan();

      ndef.onreadingerror = () => {
        showStatus('Cannot read data from the NFC tag. Try again.');
      };

      ndef.onreading = (event: any) => {
        showStatus('NFC tag detected.');
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
          showStatus('Profile loaded from tag.');
        } else {
          showStatus('No JSON profile found on this tag.');
        }
      };
    } catch (err) {
      showStatus('Failed to start scan: ' + (err && (err as Error).message || err));
    }
  }

  useEffect(() => {
    if (!('NDEFReader' in window)) {
      showStatus('Web NFC API not available. Use Chrome on Android or a supported Chromium build.');
    } else {
      showStatus('Web NFC API available.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: palette.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }}>
      <style>{`
        @media (max-width: 700px) {
          .profile-card { grid-template-columns: 1fr !important; }
          .profile-aside { border-left: none !important; border-top: 1px solid ${palette.border}; padding-left: 0 !important; padding-top: 24px !important; margin-top: 24px }
        }
        .profile-input:focus { border-color: ${palette.primary}; outline: none; box-shadow: 0 0 0 2px #dbeafe; }
        .profile-btn:hover { filter: brightness(0.95); }
        .profile-btn:active { filter: brightness(0.90); }
      `}</style>
      <main style={{
        background: palette.card,
        borderRadius: 18,
        boxShadow: palette.shadow,
        maxWidth: 900,
        width: '100%',
        padding: 0,
        margin: 24
      }}>
        <header style={{
          padding: '32px 32px 0 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 20
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563eb 60%,#06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px #e0e7ff'
          }}>
            <img
              src={preview || defaultAvatar}
              alt="avatar"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #fff'
              }}
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: palette.primary, letterSpacing: '-1px' }}>
              NFC Profile Card
            </h1>
            <div style={{ color: palette.muted, fontSize: 15, marginTop: 4 }}>
              Store and share beautiful digital profiles on NFC tags.
            </div>
          </div>
        </header>
        <form
          onSubmit={e => e.preventDefault()}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 32,
            padding: '32px'
          }}
          className="profile-card"
        >
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Full name</div>
                <input ref={nameRef} className="profile-input" placeholder="Jane Doe" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Title</div>
                <input ref={titleRef} className="profile-input" placeholder="Product Designer" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Company</div>
                <input ref={companyRef} className="profile-input" placeholder="Acme Corp." style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Email</div>
                <input ref={emailRef} className="profile-input" type="email" placeholder="jane@company.com" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Phone</div>
                <input ref={phoneRef} className="profile-input" placeholder="+1 555 5555" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
              <label>
                <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Address</div>
                <input ref={addressRef} className="profile-input" placeholder="City, Country" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
              </label>
            </div>
            <label style={{ display: 'block', marginTop: 16 }}>
              <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Bio</div>
              <textarea ref={bioRef} className="profile-input" placeholder="Short bio" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16, minHeight: 80 }} />
            </label>
            <label style={{ display: 'block', marginTop: 16 }}>
              <div style={{ fontSize: 13, color: palette.muted, marginBottom: 4 }}>Tags (comma separated)</div>
              <input ref={tagsRef} className="profile-input" placeholder="designer, product, mentor" style={{ padding: 12, borderRadius: 8, border: `1.5px solid ${palette.border}`, fontSize: 16 }} />
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={writeProfile} className="profile-btn" style={{ background: palette.primary, color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', padding: '12px 20px', borderRadius: 8, flex: 1 }}>Write to tag</button>
              <button type="button" onClick={readProfile} className="profile-btn" style={{ background: palette.accent, color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', padding: '12px 20px', borderRadius: 8, flex: 1 }}>Read from tag</button>
              <button type="button" onClick={clearForm} className="profile-btn" style={{ background: '#f3f4f6', color: '#111827', fontWeight: 600, fontSize: 16, border: 'none', padding: '12px 20px', borderRadius: 8, flex: 1 }}>Clear</button>
            </div>
          </section>
          <aside className="profile-aside" style={{ borderLeft: `1.5px solid ${palette.border}`, paddingLeft: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <label style={{ width: '100%', textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: palette.muted, marginBottom: 8 }}>Profile image</div>
              <div style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: '#f1f5f9',
                margin: '0 auto 12px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${palette.border}`,
                overflow: 'hidden'
              }}>
                <img
                  src={preview || defaultAvatar}
                  alt="preview"
                  style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageChange(e.target.files?.[0] || undefined)}
                style={{ marginTop: 8, width: '100%' }}
              />
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Images are embedded as base64 in the NFC JSON. <br />Keep images small (recommended &lt; 200KB).</div>
            </label>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 13, color: palette.muted, marginBottom: 6, fontWeight: 500 }}>Live Preview</div>
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                minHeight: 80,
                fontSize: 15,
                color: '#334155',
                boxShadow: '0 1px 3px #e0e7ff'
              }}>
                <div style={{ fontWeight: 600 }}>{nameRef.current?.value || 'Jane Doe'}</div>
                <div>{titleRef.current?.value || 'Title'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{companyRef.current?.value || 'Company'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{emailRef.current?.value || 'Email'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{phoneRef.current?.value || 'Phone'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{addressRef.current?.value || 'Address'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{bioRef.current?.value || 'Short bio'}</div>
                <div style={{ fontSize: 13, color: palette.muted }}>{tagsRef.current?.value || 'Tags'}</div>
              </div>
            </div>
          </aside>
        </form>
      </main>
      {showToast && (
        <div style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          margin: '0 auto',
          maxWidth: 400,
          background: palette.toast,
          color: palette.toastText,
          borderRadius: 12,
          padding: '16px 24px',
          boxShadow: '0 4px 24px #0002',
          fontSize: 16,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          animation: 'toast-in 0.3s'
        }}>
          <span style={{ flex: 1 }}>{status}</span>
          <button onClick={() => setShowToast(false)} style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 20,
            cursor: 'pointer',
            lineHeight: 1
          }} aria-label="Close">&times;</button>
          <style>{`
            @keyframes toast-in { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
