(function () {
	// Add viewport meta tag for mobile responsiveness
	if (!document.querySelector('meta[name="viewport"]')) {
		const meta = document.createElement('meta');
		meta.name = 'viewport';
		meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
		document.head.appendChild(meta);
	}

	// ensure a basic UI exists if index.html wasn't served / deployed
	function ensureUI() {
		// if UI already present do nothing
		if (document.getElementById('profile-app')) return;

		// improved, colorful and responsive styles
		const css = `
:root{
  --bg-start:#eef2ff;
  --bg-end:#f0fdf4;
  --card:#ffffff;
  --primary:#2563eb;
  --accent:#06b6d4;
  --text-dark:#111827;
  --text-medium:#1f2937;
  --muted:#4b5563;
  --border:#e6eef6;
  --shadow: 0 10px 30px rgba(16,24,40,0.08);
}
*{box-sizing:border-box}
html,body{height:100%;margin:0;padding:0}
body{
  font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial;
  background: linear-gradient(135deg,var(--bg-start) 0%, var(--bg-end) 100%);
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
}
#profile-app{
  max-width:1100px;
  width:100%;
  margin:auto;
  background:var(--card);
  border-radius:18px;
  box-shadow:var(--shadow);
  overflow:hidden;
}
.header{
  display:flex;
  gap:18px;
  align-items:center;
  padding:28px 32px;
  border-bottom:1px solid var(--border);
}
.logo{
  width:56px;
  height:56px;
  border-radius:16px;
  background:linear-gradient(135deg,var(--primary), var(--accent));
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
  box-shadow:0 6px 18px rgba(37,99,235,0.18);
  flex-shrink:0;
}
.header h1{
  margin:0;
  font-size:22px;
  color:var(--text-dark);
  line-height:1.2;
  font-weight:700;
}
.header p{
  margin:4px 0 0;
  color:var(--text-medium);
  font-size:13px;
}

.content{
  display:grid;
  grid-template-columns: 1fr 360px;
  gap:28px;
  padding:24px 32px;
}
.section-left{
  display:flex;
  flex-direction:column;
  gap:16px;
}
.row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}
label{
  display:block;
  font-size:13px;
  color:var(--text-medium);
  font-weight:500;
  margin-bottom:6px;
}
input[type="text"],
input[type="email"],
input[type="tel"],
textarea{
  width:100%;
  padding:12px 16px;
  border-radius:12px;
  border:1.5px solid var(--border);
  font-size:15px;
  color:var(--text-dark);
  transition:all 0.2s;
  background:#fff;
}
input:focus,
textarea:focus{
  outline:none;
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(37,99,235,0.1);
}
textarea{
  min-height:120px;
  resize:vertical;
}

.aside{
  border-left:1px solid var(--border);
  padding-left:28px;
}
.avatar-box{
  width:140px;
  height:140px;
  border-radius:20px;
  overflow:hidden;
  background:#f8fafc;
  display:flex;
  align-items:center;
  justify-content:center;
  border:2px solid var(--border);
  margin:0 auto 16px;
}
.avatar-box img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.file-input{
  width:100%;
  margin:8px 0;
}

.action-buttons{
  display:flex;
  gap:12px;
  margin-top:24px;
}
.btn{
  flex:1;
  min-height:44px;
  padding:0 20px;
  border:none;
  border-radius:12px;
  font-weight:600;
  font-size:15px;
  cursor:pointer;
  transition:all 0.2s;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.btn-primary{
  background:var(--primary);
  color:#fff;
}
.btn-accent{
  background:var(--accent);
  color:#fff;
}
.btn-muted{
  background:#f3f4f6;
  color:#1f2937;
}
.btn:hover{
  transform:translateY(-1px);
  filter:brightness(1.1);
}
.btn:active{
  transform:translateY(1px);
}

.preview-card{
  background:#f8fafc;
  border-radius:16px;
  padding:20px;
  margin-top:24px;
}
.preview-name{
  font-weight:600;
  font-size:18px;
  color:var(--text-dark);
}
.preview-details{
  color:var(--text-medium);
  font-size:14px;
  margin-top:4px;
}

/* Toast for status messages */
.toast{
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  background:var(--text-dark);
  color:#fff;
  padding:12px 24px;
  border-radius:12px;
  font-size:14px;
  z-index:100;
  box-shadow:0 10px 30px rgba(0,0,0,0.2);
  animation:slideUp 0.3s ease;
}

@keyframes slideUp{
  from{transform:translate(-50%, 100px)}
  to{transform:translate(-50%, 0)}
}

/* Mobile responsive adjustments */
@media (max-width: 900px) {
  .content{
    display:flex;
    flex-direction:column;
    padding:20px;
  }
  .aside{
    order:-1;
    border-left:none;
    border-bottom:1px solid var(--border);
    padding:0 0 24px;
    margin-bottom:24px;
  }
  .avatar-box{
    width:120px;
    height:120px;
  }
  .row{
    grid-template-columns:1fr;
    gap:12px;
  }
}

@media (max-width: 600px) {
  body{
    padding:4px;
  }
  #profile-app{
    border-radius:0;
    box-shadow:none;
    min-height:100vh;
    width:100vw;
  }
  .header{
    text-align:center;
    padding:12px;
    flex-direction:column;
    align-items:center;
  }
  .logo{
    width:48px;
    height:48px;
  }
  .aside{
    padding:0 0 20px;
    margin:-8px 0 20px;
  }
  .avatar-box{
    width:90px;
    height:90px;
    border-radius:12px;
  }
  .action-buttons{
    flex-direction:column;
    gap:8px;
    margin-top:16px;
  }
  .btn{
    width:100%;
    height:48px;
    font-size:16px;
  }
  input, textarea{
    font-size:16px;
  }
}
`;

		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);

		// improved markup (keeps same element ids expected by script)
		const container = document.createElement('main');
		container.id = 'profile-app';
		container.innerHTML = `
  <div class="header">
    <div class="logo">N</div>
    <div>
      <h1>NFC Profile — Read & Write</h1>
      <p>Create and store person profiles on NFC tags. Images embedded as base64 in the tag JSON.</p>
    </div>
  </div>

  <div class="content">
    <section class="section-left">
      <div class="row">
        <label>Full name
          <input id="name" type="text" placeholder="Jane Doe" />
        </label>
        <label>Title
          <input id="title" type="text" placeholder="Product Designer" />
        </label>
      </div>

      <div class="row">
        <label>Company
          <input id="company" type="text" placeholder="Acme Corp." />
        </label>
        <label>Email
          <input id="email" type="email" placeholder="jane@company.com" />
        </label>
      </div>

      <div class="row">
        <label>Phone
          <input id="phone" type="text" placeholder="+1 555 5555" />
        </label>
        <label>Address
          <input id="address" type="text" placeholder="City, Country" />
        </label>
      </div>

      <label>Bio
        <textarea id="bio" placeholder="Short bio about the person"></textarea>
      </label>

      <label>Tags (comma separated)
        <input id="tags" type="text" placeholder="designer, mentor, product" />
      </label>

      <div style="display:flex; gap:12px; align-items:center; margin-top:6px;">
        <button id="writeBtn" class="btn btn-primary">Write to tag</button>
        <button id="readBtn" class="btn btn-accent">Read from tag</button>
        <button id="clearBtn" class="btn btn-muted">Clear</button>
      </div>

      <div style="margin-top:12px;">
        <div style="font-size:13px; color:var(--muted); margin-bottom:8px;">Status</div>
        <pre id="status">Ready.</pre>
      </div>
    </section>

    <aside class="aside">
      <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:10px">
        <div class="avatar-box">
          <img id="previewImg" alt="preview" style="display:none" />
          <div id="noImage" style="color:#9ca3af">No image</div>
        </div>

        <div style="width:100%">
          <div style="font-size:13px; color:var(--muted); margin-bottom:8px;">Profile image</div>
          <input id="imageInput" class="file-input" type="file" accept="image/*" />
          <div style="font-size:12px; color:#9ca3af; margin-top:8px;">Images are embedded as base64 in the NFC JSON. Keep images small (recommended &lt; 200KB).</div>
        </div>
      </div>

      <div style="width:100%;">
        <div style="font-size:13px; color:var(--muted); margin-bottom:8px;">Live Preview</div>
        <div class="preview" id="livePreview">
          <div style="font-weight:700; font-size:16px;" id="lp-name">Jane Doe</div>
          <div style="color:var(--muted)" id="lp-title">Product Designer • Acme Corp.</div>
          <div style="margin-top:8px; color:var(--muted)" id="lp-contact">jane@company.com • +1 555 5555</div>
        </div>
      </div>
    </aside>
  </div>
`;

		document.body.innerHTML = '';
		document.body.appendChild(container);
	}

	// create UI if needed before querying elements
	ensureUI();

	const nameEl = document.getElementById('name');
	const titleEl = document.getElementById('title');
	const companyEl = document.getElementById('company');
	const emailEl = document.getElementById('email');
	const phoneEl = document.getElementById('phone');
	const addressEl = document.getElementById('address');
	const bioEl = document.getElementById('bio');
	const tagsEl = document.getElementById('tags');
	const statusEl = document.getElementById('status');

	const writeBtn = document.getElementById('writeBtn');
	const readBtn = document.getElementById('readBtn');
	const clearBtn = document.getElementById('clearBtn');
	const imageInput = document.getElementById('imageInput');
	const previewImg = document.getElementById('previewImg');
	const noImage = document.getElementById('noImage');

	let currentImageData = null;
  let scanActive = false;

  // Only allow one NFC operation at a time (scan or write)
  let nfcBusy = false;
  let ndefWriteInstance = null;
  let ndefScanInstance = null;

	async function writeProfile() {
		if (!('NDEFReader' in window)) {
			setStatus('Web NFC is not supported on this browser.');
			return;
		}
		if (nfcBusy) {
			setStatus('NFC is busy. Please wait for any previous scan or write to finish.');
			return;
		}
		nfcBusy = true;

		// Cancel any previous scan before writing
		if (ndefScanInstance && typeof ndefScanInstance.stop === 'function') {
			try {
				await ndefScanInstance.stop();
			} catch (e) { /* ignore */ }
			ndefScanInstance = null;
		}
		if (ndefWriteInstance && typeof ndefWriteInstance.stop === 'function') {
			try {
				await ndefWriteInstance.stop();
			} catch (e) { /* ignore */ }
			ndefWriteInstance = null;
		}

		const profile = getProfileFromForm();
		if (!profile.name && !profile.email && !profile.phone) {
			setStatus('Profile is empty — fill at least one field.');
			nfcBusy = false;
			return;
		}

		try {
			const ndef = new NDEFReader();
			ndefWriteInstance = ndef;
			setStatus('Touch an NFC tag to write... (Usually 1-3 seconds)');
			const json = JSON.stringify(profile);

			try {
				await ndef.write({
					records: [{
						recordType: 'mime',
						mediaType: 'application/json',
						data: new TextEncoder().encode(json)
					}]
				});
				setStatus('Successfully wrote profile to tag as JSON.');
				nfcBusy = false;
				ndefWriteInstance = null;
				return;
			} catch (mimeError) {
				// Try fallback to text record only
				try {
					await ndef.write({ records: [{ recordType: 'text', data: json }] });
					setStatus('Wrote profile as text record only.');
					nfcBusy = false;
					ndefWriteInstance = null;
					return;
				} catch (textError) {
					// Try fallback to plain text (not JSON string)
					try {
						await ndef.write({ records: [{ recordType: 'text', data: profile.name || profile.email || profile.phone || 'NFC Profile' }] });
						setStatus('Wrote minimal profile as plain text.');
						nfcBusy = false;
						ndefWriteInstance = null;
						return;
					} catch (plainError) {
						setStatus('Write failed: ' + (
							plainError && plainError.message
								? plainError.message
								: JSON.stringify(plainError)
						));
						nfcBusy = false;
						ndefWriteInstance = null;
					}
				}
			}
		} catch (err) {
			setStatus('Failed to write due to IO error: ' + (err && err.message || err));
			nfcBusy = false;
			ndefWriteInstance = null;
		}
	}

	async function readProfile() {
		if (!('NDEFReader' in window)) {
			setStatus('Web NFC is not supported on this browser.');
			return;
		}
		if (nfcBusy) {
			setStatus('NFC is busy. Please wait for any previous scan or write to finish.');
			return;
		}
		nfcBusy = true;

		// Cancel any previous write before scanning
		if (ndefWriteInstance && typeof ndefWriteInstance.stop === 'function') {
			try {
				await ndefWriteInstance.stop();
			} catch (e) { /* ignore */ }
			ndefWriteInstance = null;
		}
		if (ndefScanInstance && typeof ndefScanInstance.stop === 'function') {
			try {
				await ndefScanInstance.stop();
			} catch (e) { /* ignore */ }
			ndefScanInstance = null;
		}

		try {
			const ndef = new NDEFReader();
			ndefScanInstance = ndef;
			setStatus('Ready to scan. Bring an NFC tag close to the device...');
			await ndef.scan();

			ndef.onreadingerror = () => {
				setStatus('Cannot read data from the NFC tag. Try again.');
				nfcBusy = false;
			};

			ndef.onreading = (event) => {
				setStatus('NFC tag detected.');
				nfcBusy = false;
				ndefScanInstance = null;
				const message = event.message;
				let parsed = null;
				let rawText = null;
				let rawDump = [];

				for (const record of message.records) {
					try {
						if (record.recordType === 'mime' && record.mediaType === 'application/json') {
							const textDecoder = new TextDecoder();
							const data = record.data instanceof ArrayBuffer ? textDecoder.decode(record.data) : textDecoder.decode(new Uint8Array(record.data));
							rawDump.push(data);
							parsed = JSON.parse(data);
							break;
						} else if (record.recordType === 'text') {
							const textDecoder = new TextDecoder(record.encoding || 'utf-8');
							const data = textDecoder.decode(record.data);
							rawDump.push(data);
							try {
								parsed = JSON.parse(data);
								break;
							} catch {
								rawText = data;
							}
						} else if (record.recordType === 'unknown' && record.data) {
							const data = new TextDecoder().decode(record.data);
							rawDump.push(data);
							try {
								parsed = JSON.parse(data);
								break;
							} catch {
								rawText = data;
							}
						}
					} catch (e) {
						rawDump.push('[Unreadable record]');
					}
				}

				if (parsed) {
					updateFormFromProfile(parsed);
					setStatus('Profile loaded from tag.');
				} else if (rawText) {
					setStatus('Tag contains text (not JSON):\n' + rawText);
				} else {
					setStatus('No JSON or text profile found on this tag. Raw record dump:\n' +
						rawDump.join('\n') +
						'\nRaw records:\n' +
						JSON.stringify(message.records.map(r => ({
							type: r.recordType,
							mediaType: r.mediaType,
							encoding: r.encoding,
							lang: r.lang
						})), null, 2)
					);
				}
			};
		} catch (err) {
			setStatus('Failed to start scan: ' + (err && err.message || err));
			nfcBusy = false;
			ndefScanInstance = null;
		}
	}

	// wire UI
	writeBtn.addEventListener('click', writeProfile);
	readBtn.addEventListener('click', readProfile);
	clearBtn.addEventListener('click', clearForm);

	// initial support check
	if (!('NDEFReader' in window)) {
		setStatus('Web NFC API not available. Use Chrome on Android or a supported Chromium build.');
	} else {
		setStatus('Web NFC API available.');
	}
})();