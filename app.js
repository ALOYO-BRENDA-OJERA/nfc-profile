(function () {
	// ensure a basic UI exists if index.html wasn't served / deployed
	function ensureUI() {
		if (document.getElementById('profile-app')) return;

		const css = `
body{font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#f5f7fb; margin:0; padding:24px}
#profile-app{max-width:920px;margin:0 auto;background:#fff;padding:28px;border-radius:12px;box-shadow:0 10px 30px rgba(11,15,30,0.08)}
#profile-app header{display:flex;align-items:center;gap:16px}
#profile-app .grid{display:grid;grid-template-columns:1fr 320px;gap:20px;margin-top:20px}
#profile-app input, #profile-app textarea{width:100%;padding:10px;border-radius:8px;border:1px solid #e6eef6;box-sizing:border-box}
#profile-app .buttons{display:flex;gap:10px;margin-top:16px}
#profile-app button{padding:10px 14px;border-radius:8px;border:none;cursor:pointer}
#profile-app pre{background:#0f1720;color:#cbd5e1;padding:12px;border-radius:8px;max-height:220px;overflow:auto;white-space:pre-wrap}
`;

		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);

		const container = document.createElement('main');
		container.id = 'profile-app';
		container.innerHTML = `
<header><div style="width:56px;height:56px;border-radius:12px;background:#0b5fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">N</div><div><h1 style="margin:0;font-size:20px">NFC Profile — Read & Write</h1><div style="color:#6b7280;font-size:13px">Create and store person profiles on NFC tags. Images embedded as base64 in the tag JSON.</div></div></header>
<div class="grid">
<section>
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
		<label><div style="font-size:12px;color:#6b7280">Full name</div><input id="name" placeholder="Jane Doe"/></label>
		<label><div style="font-size:12px;color:#6b7280">Title</div><input id="title" placeholder="Product Designer"/></label>
	</div>
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
		<label><div style="font-size:12px;color:#6b7280">Company</div><input id="company" placeholder="Acme Corp."/></label>
		<label><div style="font-size:12px;color:#6b7280">Email</div><input id="email" type="email" placeholder="jane@company.com"/></label>
	</div>
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
		<label><div style="font-size:12px;color:#6b7280">Phone</div><input id="phone" placeholder="+1 555 5555"/></label>
		<label><div style="font-size:12px;color:#6b7280">Address</div><input id="address" placeholder="City, Country"/></label>
	</div>
	<label style="display:block;margin-top:12px"><div style="font-size:12px;color:#6b7280">Bio</div><textarea id="bio" style="min-height:100px"></textarea></label>
	<label style="display:block;margin-top:12px"><div style="font-size:12px;color:#6b7280">Tags (comma separated)</div><input id="tags" placeholder="designer, product, mentor"/></label>
	<div class="buttons">
		<button id="writeBtn" style="background:#0b5fff;color:#fff">Write to tag</button>
		<button id="readBtn" style="background:#0aa89e;color:#fff">Read from tag</button>
		<button id="clearBtn" style="background:#f3f4f6;color:#111827">Clear</button>
	</div>
</section>
<aside style="border-left:1px solid #eef2f7;padding-left:18px">
	<div style="display:flex;gap:12px;align-items:center">
		<div style="width:92px;height:92px;border-radius:12px;overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;border:1px solid #e6eef6">
			<img id="previewImg" alt="preview" style="width:100%;height:100%;object-fit:cover;display:none"/>
			<div id="noImage" style="color:#9ca3af">No image</div>
		</div>
		<div style="flex:1">
			<div style="font-size:12px;color:#6b7280">Profile image</div>
			<input id="imageInput" type="file" accept="image/*" style="margin-top:8px"/>
			<div style="font-size:12px;color:#9ca3af;margin-top:8px">Images are embedded as base64 in the NFC JSON. Keep images small (recommended &lt; 200KB).</div>
		</div>
	</div>
	<div style="margin-top:18px">
		<h3 style="margin:0;font-size:14px">Status</h3>
		<pre id="status">Ready.</pre>
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

	function setStatus(msg) {
		const time = new Date().toLocaleTimeString();
		statusEl.textContent = `[${time}] ${msg}\n` + statusEl.textContent;
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