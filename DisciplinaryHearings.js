;(function(){
	// data
	function loadHearings(){ try{ const raw = localStorage.getItem('disciplinary'); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
	function saveHearings(d){ localStorage.setItem('disciplinary', JSON.stringify(d)); }

	// ui
	const searchInput = document.getElementById('searchInput');
	const clearSearchBtn = document.getElementById('clearSearch');
	const sortSelect = document.getElementById('sortSelect');
	const addNewBtn = document.getElementById('addNew');
	const hearingModal = document.getElementById('hearingModal');
	const hearingForm = document.getElementById('hearingForm');
	const closeModalBtn = document.getElementById('closeModal');
	const cancelFormBtn = document.getElementById('cancelForm');
	const modalTitle = document.getElementById('modalTitle');

	let currentSearch = '';
	let currentSort = '';
	let editingIndex = -1;

	function applySort(items, sortKey){ if(!sortKey) return items.slice(); var copy = items.slice(); if(sortKey==='name-asc') return copy.sort(function(a,b){ var A=(a.empName||'').toLowerCase(), B=(b.empName||'').toLowerCase(); return A<B?-1:A>B?1:0; }); if(sortKey==='name-desc') return copy.sort(function(a,b){ var A=(a.empName||'').toLowerCase(), B=(b.empName||'').toLowerCase(); return A>B?-1:A<B?1:0; }); if(sortKey==='date-newest') return copy.sort(function(a,b){ var da=a.hearingDate||'', db=b.hearingDate||''; return db < da ? -1 : db > da ? 1 : 0; }); if(sortKey==='date-oldest') return copy.sort(function(a,b){ var da=a.hearingDate||'', db=b.hearingDate||''; return da < db ? -1 : da > db ? 1 : 0; }); return copy; }

	function matches(h){ if(!currentSearch) return true; var s=currentSearch; return (h.empName||'').toLowerCase().includes(s) || (h.username||'').toLowerCase().includes(s); }

	function render(){ var list = document.getElementById('hearingsList'); var empty = document.getElementById('emptyMsg'); var hearings = loadHearings(); var tpl = document.getElementById('hearingItemTemplate'); if(!list||!tpl) return; list.innerHTML=''; var items = applySort(hearings, currentSort); var count=0; items.forEach(function(hearing){ if(!matches(hearing)) return; count++; var clone = tpl.content.cloneNode(true); clone.querySelector('.hearing-title').textContent = 'Hearing - ' + (hearing.empName||'—'); clone.querySelector('.hearing-meta').textContent = 'ID: ' + (hearing.id||'—'); clone.querySelector('.empName').textContent = hearing.empName||'—'; clone.querySelector('.hearingDate').textContent = hearing.hearingDate||'—'; clone.querySelector('.hearingTime').textContent = hearing.hearingTime||'—'; clone.querySelector('.reason').textContent = hearing.reason||'—'; var sb = clone.querySelector('.status'); sb.textContent = hearing.status||'Scheduled'; sb.setAttribute('data-status', hearing.status||'Scheduled'); clone.querySelector('.panelMembers').textContent = hearing.panelMembers||'—'; var vb = clone.querySelector('.btn-small.view'); if(vb) vb.addEventListener('click', function(){ alert('Hearing for: '+(hearing.empName||'—')+'\nDate: '+(hearing.hearingDate||'—')+'\nTime: '+(hearing.hearingTime||'—')+'\nStatus: '+(hearing.status||'—')) }); var eb = clone.querySelector('.btn-small.edit'); if(eb) eb.addEventListener('click', function(){ var idx = loadHearings().findIndex(function(h){ return h.id === hearing.id; }); openModal('Edit Disciplinary Hearing', idx); }); var expb = clone.querySelector('.btn-small.export'); if(expb) expb.addEventListener('click', function(){ downloadText('Disciplinary Hearing\n'+JSON.stringify(hearing,null,2), (hearing.empName||'hearing')+'_hearing.txt'); }); var db = clone.querySelector('.btn-small.delete'); if(db) db.addEventListener('click', function(){ if(confirm('Delete this hearing?')){ var arr = loadHearings(); var ridx = arr.findIndex(function(h){ return h.id === hearing.id; }); if(ridx !== -1){ arr.splice(ridx,1); saveHearings(arr); render(); } } }); list.appendChild(clone); }); if(empty) empty.style.display = count===0 ? 'block' : 'none'; }

	function openModal(title, index){ editingIndex = index; modalTitle.textContent = title; if(index===-1){ hearingForm.reset(); document.getElementById('formUsername').focus(); } else { var arr = loadHearings(); var h = arr[index] || {}; document.getElementById('formUsername').value = h.username||''; document.getElementById('formEmpName').value = h.empName||''; document.getElementById('formHearingDate').value = h.hearingDate||''; document.getElementById('formHearingTime').value = h.hearingTime||''; document.getElementById('formReason').value = h.reason||''; document.getElementById('formPanelMembers').value = h.panelMembers||''; document.getElementById('formStatus').value = h.status||'Scheduled'; document.getElementById('formOutcome').value = h.outcome||''; } hearingModal.classList.add('show'); }

	function closeModal(){ hearingModal.classList.remove('show'); hearingForm.reset(); editingIndex = -1; }

	if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal); if(cancelFormBtn) cancelFormBtn.addEventListener('click', closeModal); if(addNewBtn) addNewBtn.addEventListener('click', function(){ openModal('Schedule Disciplinary Hearing', -1); }); if(searchInput) searchInput.addEventListener('input', function(){ currentSearch = this.value.toLowerCase().trim(); render(); }); if(clearSearchBtn) clearSearchBtn.addEventListener('click', function(){ if(searchInput) searchInput.value=''; currentSearch=''; render(); }); if(sortSelect) sortSelect.addEventListener('change', function(){ currentSort = this.value || ''; render(); });

	if(hearingForm) hearingForm.addEventListener('submit', function(e){ e.preventDefault(); var arr = loadHearings(); var nh = { id: Date.now().toString(), username: document.getElementById('formUsername').value.trim(), empName: document.getElementById('formEmpName').value.trim(), hearingDate: document.getElementById('formHearingDate').value, hearingTime: document.getElementById('formHearingTime').value, reason: document.getElementById('formReason').value.trim(), panelMembers: document.getElementById('formPanelMembers').value.trim(), status: document.getElementById('formStatus').value, outcome: document.getElementById('formOutcome').value.trim() }; if(!nh.username||!nh.empName||!nh.hearingDate||!nh.hearingTime||!nh.reason){ alert('Please fill all required fields'); return; } if(editingIndex===-1){ arr.push(nh); } else { nh.id = arr[editingIndex].id; arr[editingIndex] = nh; } saveHearings(arr); closeModal(); render(); });

	function downloadText(text, filename){ var blob = new Blob([text], { type: 'text/plain' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

	window.addEventListener('click', function(e){ if(e.target === hearingModal) closeModal(); });

	render();
})();
