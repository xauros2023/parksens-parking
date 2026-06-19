(function(){
  const grid = document.getElementById('zonesGrid');
  const detail = document.getElementById('detail');
  const detailCard = document.getElementById('detailCard');
  const detailNum = document.getElementById('detailNum');
  const detailTitle = document.getElementById('detailTitle');
  const detailShort = document.getElementById('detailShort');
  const detailList = document.getElementById('detailList');
  const detailClose = document.getElementById('detailClose');
  const navDetail = document.getElementById('navDetail');
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const zonesEmpty = document.getElementById('zonesEmpty');
  const printBtn = document.getElementById('printBtn');
  const printableBody = document.getElementById('printableBody');

  let lastFocusedEl = null;

  // Build cards
  ZONES.forEach(zone => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'zone-card';
    card.setAttribute('data-id', zone.id);
    card.setAttribute('aria-label', `Voir le détail : ${zone.name}`);
    const searchBlob = normalize(zone.name + ' ' + zone.short + ' ' + zone.items.join(' '));
    card.setAttribute('data-search', searchBlob);
    card.innerHTML = `
      <span class="zone-card__num">${zone.num}</span>
      <span class="zone-card__name">${zone.name}</span>
      <span class="zone-card__short">${zone.short}</span>
      <span class="zone-card__count">${zone.items.length} fonctionnalité${zone.items.length > 1 ? 's' : ''}</span>
    `;
    card.addEventListener('click', (e) => {
      lastFocusedEl = card;
      openDetail(zone.id, true);
    });
    grid.appendChild(card);
  });

  // Map zones -> click opens first matching zone group
  Array.from(document.querySelectorAll('[data-zone]')).forEach(el => {
    el.style.cursor = 'pointer';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const mapKey = el.getAttribute('data-zone');
    const match = ZONES.find(z => z.map === mapKey);
    if (match) {
      el.setAttribute('aria-label', 'Voir les points liés à : ' + match.name);
    }
    const handleActivate = () => {
      if (match) {
        document.getElementById('zones').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => highlightGroup(mapKey), 400);
      }
    };
    el.addEventListener('click', handleActivate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleActivate();
      }
    });
  });

  function highlightGroup(mapKey){
    const ids = ZONES.filter(z => z.map === mapKey).map(z => z.id);
    Array.from(document.querySelectorAll('.zone-card')).forEach(card => {
      const id = card.getAttribute('data-id');
      if (ids.includes(id)){
        card.classList.add('zone-card--pulse');
        setTimeout(() => card.classList.remove('zone-card--pulse'), 1600);
      }
    });
  }

  function openDetail(id, pushHash){
    const zone = ZONES.find(z => z.id === id);
    if (!zone) return;
    detailNum.textContent = zone.num + ' / 19';
    detailTitle.textContent = zone.name;
    detailShort.textContent = zone.short;
    detailList.innerHTML = '';
    zone.items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      detailList.appendChild(li);
    });
    detail.classList.add('is-open');
    navDetail.classList.remove('is-hidden');
    if (pushHash !== false) {
      history.pushState({ zoneId: id }, '', '#' + id);
    }
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    detailClose.focus();
  }

  function closeDetail(returnFocus){
    detail.classList.remove('is-open');
    navDetail.classList.add('is-hidden');
    if (location.hash) {
      history.pushState({}, '', location.pathname + location.search);
    }
    document.getElementById('zones').scrollIntoView({ behavior: 'smooth' });
    if (returnFocus && lastFocusedEl) {
      lastFocusedEl.focus();
    }
  }

  detailClose.addEventListener('click', () => closeDetail(true));

  navDetail.addEventListener('click', (e) => {
    e.preventDefault();
    detail.scrollIntoView({ behavior: 'smooth' });
  });

  // Fermer avec Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detail.classList.contains('is-open')) {
      closeDetail(true);
    }
  });

  // Navigation arrière/avant du navigateur
  window.addEventListener('popstate', () => {
    const id = location.hash.replace('#', '');
    const zone = ZONES.find(z => z.id === id);
    if (zone) {
      openDetail(id, false);
    } else {
      detail.classList.remove('is-open');
      navDetail.classList.add('is-hidden');
    }
  });

  // Ouverture directe via URL partagée (#id-du-point)
  (function openFromHashOnLoad(){
    const id = location.hash.replace('#', '');
    if (id && ZONES.find(z => z.id === id)) {
      openDetail(id, false);
    }
  })();

  // ====================================================
  // Recherche en direct
  // ====================================================
  function normalize(str){
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // retire les accents
  }

  function runSearch(){
    const query = normalize(searchInput.value.trim());
    const cards = Array.from(document.querySelectorAll('.zone-card'));
    let visibleCount = 0;

    cards.forEach(card => {
      const haystack = card.getAttribute('data-search') || '';
      const matches = query === '' || haystack.includes(query);
      card.classList.toggle('is-filtered-out', !matches);
      if (matches) visibleCount++;
    });

    zonesEmpty.classList.toggle('is-hidden', visibleCount > 0);

    if (query === '') {
      searchCount.textContent = '';
    } else {
      searchCount.textContent = visibleCount === 0
        ? 'Aucun résultat'
        : `${visibleCount} résultat${visibleCount > 1 ? 's' : ''} sur 19`;
    }
  }

  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(runSearch, 80);
  });

  // ====================================================
  // Export PDF (impression du cahier complet)
  // ====================================================
  function buildPrintable(){
    printableBody.innerHTML = '';
    ZONES.forEach(zone => {
      const section = document.createElement('div');
      section.className = 'printable__section';

      const head = document.createElement('div');
      head.className = 'printable__section-head';
      head.innerHTML = `
        <span class="printable__num">${zone.num}</span>
        <h3 class="printable__name">${zone.name}</h3>
      `;
      section.appendChild(head);

      const short = document.createElement('p');
      short.className = 'printable__short';
      short.textContent = zone.short;
      section.appendChild(short);

      const list = document.createElement('ol');
      list.className = 'printable__list';
      zone.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      section.appendChild(list);

      printableBody.appendChild(section);
    });
  }

  buildPrintable();

  printBtn.addEventListener('click', () => {
    window.print();
  });
})();

