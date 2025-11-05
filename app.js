(function () {
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
  --muted:#64748b;
  --border:#e6eef6;
  --glass: rgba(255,255,255,0.6);
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
  font-size:20px;
  color:var(--primary);
  line-height:1.2;
}
.header p{
  margin:4px 0 0;
  color:var(--muted);
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
  color:var(--muted);
  margin-bottom:4px;
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
  color:#0f172a;
}
.preview-details{
  color:var(--muted);
  font-size:14px;
  margin-top:4px;
}

/* Toast for status messages */
.toast{
  position:fixed;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  background:#1f2937;
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
    grid-template-columns:1fr;
    padding:20px;
  }
  .aside{
    border-left:none;
    border-top:1px solid var(--border);
    padding:20px 0 0;
    margin-top:20px;
  }
  .header{
    padding:20px;
  }
  .row{
    grid-template-columns:1fr;
  }
  body{
    padding:0;
    align-items:flex-start;
  }
  #profile-app{
    border-radius:0;
    min-height:100vh;
  }
  .action-buttons{
    position:sticky;
    bottom:0;
    background:var(--card);
    margin:32px -20px -20px;
    padding:16px 20px;
    border-top:1px solid var(--border);
  }
  .btn{
    min-height:48px;
  }
  #status{
    display:none; /* Status shown in toast instead */
  }
  .toast{
    width:calc(100% - 32px);
    left:16px;
    transform:none;
  }
}

@media (max-width: 480px) {
  .header{
    flex-direction:column;
    align-items:flex-start;
    text-align:left;
  }
  .action-buttons{
    flex-direction:column;
  }
  .btn{
    width:100%;
  }
  .avatar-box{
    width:120px;
    height:120px;
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

	// Add toast functionality to setStatus
	function setStatus(msg) {
		const time = new Date().toLocaleTimeString();
		statusEl.textContent = `[${time}] ${msg}\n` + statusEl.textContent;
		
		// Show toast on mobile
		const toast = document.querySelector('.toast');
		if (toast) toast.remove();
		
		const newToast = document.createElement('div');
		newToast.className = 'toast';
		newToast.textContent = msg;
		document.body.appendChild(newToast);
		
		setTimeout(() => newToast.remove(), 3000);
	}

	function getProfileFromForm() {
		return {
			name: nameEl.value.trim(),
			title: titleEl.value.trim(),
			company: companyEl.value.trim(),
			email: emailEl.value.trim(),
			phone: phoneEl.value.trim(),
			address: addressEl.value.trim(),
			bio: bioEl.value.trim(),
			tags: tagsEl.value.split(',').map(t=>t.trim()).filter(Boolean),
			imageData: currentImageData,
			timestamp: new Date().toISOString()
		};
	}

	function updateFormFromProfile(p) {
		nameEl.value = p.name || '';
		titleEl.value = p.title || '';
		companyEl.value = p.company || '';
		emailEl.value = p.email || '';
		phoneEl.value = p.phone || '';
		addressEl.value = p.address || '';
		bioEl.value = p.bio || '';
		tagsEl.value = (p.tags || []).join(', ');
		if (p.imageData) {
			currentImageData = p.imageData;
			previewImg.src = p.imageData;
			previewImg.style.display = 'block';
			noImage.style.display = 'none';
		} else {
			currentImageData = null;
			previewImg.style.display = 'none';
			noImage.style.display = 'block';
		}
	}

	function clearForm() {
		nameEl.value = '';
		titleEl.value = '';
		companyEl.value = '';
		emailEl.value = '';
		phoneEl.value = '';
		addressEl.value = '';
		bioEl.value = '';
		tagsEl.value = '';
		currentImageData = null;
		previewImg.style.display = 'none';
		noImage.style.display = 'block';
		setStatus('Form cleared.');
	}

	// handle image input
	if (imageInput) {
		imageInput.addEventListener('change', (e) => {
			const f = e.target.files && e.target.files[0];
			if (!f) {
				currentImageData = null;
				previewImg.style.display = 'none';
				noImage.style.display = 'block';
				return;
			}
			const reader = new FileReader();
			reader.onload = () => {
				currentImageData = reader.result;
				previewImg.src = reader.result;
				previewImg.style.display = 'block';
				noImage.style.display = 'none';
			};
			reader.readAsDataURL(f);
		});
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
			const ndef = new NDEFReader();
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
				setStatus('Successfully wrote profile to tag.');
			} catch (mimeError) {
				try {
					await ndef.write({ records: [{ recordType: 'text', data: json }] });
					setStatus('Wrote profile as text record (fallback).');
				} catch (textError) {
					setStatus('Write failed: ' + (textError && textError.message || textError));
				}
			}
		} catch (err) {
			setStatus('Error while writing: ' + (err && err.message || err));
		}
	}

	async function readProfile() {
		if (!('NDEFReader' in window)) {
			setStatus('Web NFC is not supported on this browser.');
			return;
		}

		try {
			const ndef = new NDEFReader();
			setStatus('Ready to scan. Bring an NFC tag close to the device...');
			await ndef.scan();

			ndef.onreadingerror = () => {
				setStatus('Cannot read data from the NFC tag. Try again.');
			};

			ndef.onreading = (event) => {
				setStatus('NFC tag detected.');
				const message = event.message;
				let parsed = null;

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
					setStatus('No JSON profile found on this tag. Raw records:\n' + JSON.stringify(message.records.map(r => ({ recordType: r.recordType, mediaType: r.mediaType || null })), null, 2));
				}
			};
		} catch (err) {
			setStatus('Failed to start scan: ' + (err && err.message || err));
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

	// show git instructions (unchanged)
	function showGitInstructions() {
		const deployUrl = 'https://nfc-profile-one.vercel.app/';
		const cmds = [
			'# initialize repo (if this folder is not yet a git repo)',
			'git init',
			'git add .',
			'git commit -m "Add Web NFC profile app"',
			'git branch -M main',
			'git remote add origin https://github.com/ALOYO-BRENDA-OJERA/nfc-profile.git',
			'git push -u origin main'
		].join('\\n');

		setStatus('To commit & push this project to GitHub:\\n' + cmds + '\\n\\nDeployed at: ' + deployUrl);
		console.log('Git push instructions:\\n' + cmds + '\\nDeployed at: ' + deployUrl);
	}

	showGitInstructions();
})();