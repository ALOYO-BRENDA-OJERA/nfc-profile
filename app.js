(function () {
	const nameEl = document.getElementById('name');
	const emailEl = document.getElementById('email');
	const phoneEl = document.getElementById('phone');
	const statusEl = document.getElementById('status');

	const writeBtn = document.getElementById('writeBtn');
	const readBtn = document.getElementById('readBtn');
	const clearBtn = document.getElementById('clearBtn');

	function setStatus(msg) {
		const time = new Date().toLocaleTimeString();
		statusEl.textContent = `[${time}] ${msg}\n` + statusEl.textContent;
	}

	function getProfileFromForm() {
		return {
			name: nameEl.value.trim(),
			email: emailEl.value.trim(),
			phone: phoneEl.value.trim(),
			timestamp: new Date().toISOString()
		};
	}

	function updateFormFromProfile(p) {
		nameEl.value = p.name || '';
		emailEl.value = p.email || '';
		phoneEl.value = p.phone || '';
	}

	function clearForm() {
		nameEl.value = '';
		emailEl.value = '';
		phoneEl.value = '';
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
			const ndef = new NDEFReader();
			setStatus('Touch an NFC tag to write...');
			// Prefer MIME typed JSON record. Some devices accept plain text; attempt MIME then fallback.
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
				// Fallback to text record
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
							// attempt decode anyway
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

	// new: show git commit & push instructions (copy/paste locally)
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
		].join('\n');

		setStatus('To commit & push this project to GitHub:\n' + cmds + '\n\nDeployed at: ' + deployUrl);
		console.log('Git push instructions:\n' + cmds + '\nDeployed at: ' + deployUrl);
	}

	// call once on load so instructions are visible in the UI
	showGitInstructions();
})();