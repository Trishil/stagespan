/* Standalone brochure: no frameworks, authentication, analytics or factory-data services. */
(() => {
  const menuButton = document.querySelector('.tf-menu-toggle');
  const menu = document.getElementById('tf-mobile-navigation');
  function closeMenu() {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
  });

  const story = document.querySelector('.tf-journey');
  const slides = [...document.querySelectorAll('[data-chapter]')];
  const jumps = [...document.querySelectorAll('[data-jump]')];
  const mobile = matchMedia('(max-width:760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  let active = -1, scheduled = 0;
  const cinematic = () => !mobile.matches && !reducedMotion.matches;
  function showChapter(index) {
    if (index === active) return;
    active = index;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(cinematic() && i !== index));
    });
    jumps.forEach((jump, i) => {
      if (i === index) jump.setAttribute('aria-current', 'step');
      else jump.removeAttribute('aria-current');
    });
    document.getElementById('chapter-number').textContent = `0${index + 1}`;
  }
  function updateScroll() {
    scheduled = 0;
    if (!cinematic()) return;
    const rect = story.getBoundingClientRect();
    const viewport = story.querySelector('.tf-story-screen').clientHeight;
    if (rect.top > viewport || rect.bottom < 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, story.offsetHeight - viewport)));
    story.style.setProperty('--journey-progress', String(progress));
    showChapter(Math.min(slides.length - 1, Math.floor(progress * slides.length)));
  }
  function schedule() { if (!scheduled) scheduled = requestAnimationFrame(updateScroll); }
  function updateMode() {
    story.classList.toggle('is-cinematic', cinematic());
    active = -1; showChapter(0); schedule();
    if (reducedMotion.matches) stopFilm();
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  jumps.forEach((jump, index) => jump.addEventListener('click', event => {
    if (!cinematic()) return;
    event.preventDefault();
    const top = story.getBoundingClientRect().top + scrollY;
    const viewport = story.querySelector('.tf-story-screen').clientHeight;
    scrollTo({ top: top + ((index + 0.06) / slides.length) * (story.offsetHeight - viewport), behavior: 'smooth' });
  }));
  // Begin-story links must land at the story rather than a layered article on desktop.
  document.querySelectorAll('a[href="#chapter-1"]').forEach(link => link.addEventListener('click', event => {
    if (cinematic()) { event.preventDefault(); story.scrollIntoView({ behavior: 'smooth' }); }
  }));

  const playButton = document.getElementById('play-film');
  const hero = document.querySelector('.tf-hero');
  let video = null, filmRequested = false, heroVisible = true;
  function stopFilm() {
    filmRequested = false;
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; }
    playButton.textContent = '▷ Play the film';
    playButton.setAttribute('aria-pressed', 'false');
  }
  playButton.addEventListener('click', async () => {
    if (filmRequested) { stopFilm(); return; }
    filmRequested = true;
    video = document.createElement('video');
    video.src = new URL('./assets/hero-craft-loop.mp4', document.baseURI).href;
    video.muted = true; video.loop = true; video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');
    video.addEventListener('error', () => { stopFilm(); playButton.textContent = 'Film unavailable — view the story below'; }, { once: true });
    document.getElementById('hero-media').append(video);
    playButton.textContent = 'Ⅱ Pause the film'; playButton.setAttribute('aria-pressed', 'true');
    try { await video.play(); } catch { stopFilm(); }
  });
  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (!video) return;
    if (heroVisible && filmRequested && !document.hidden) video.play().catch(stopFilm);
    else video.pause();
  }, { threshold: 0.1 });
  observer.observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (!video) return;
    if (document.hidden) video.pause();
    else if (heroVisible && filmRequested) video.play().catch(stopFilm);
  });

  const tabs = [...document.querySelectorAll('[data-workflow]')];
  // The three illustrative examples are tiny local data, loaded only if selected.
  let workflows;
  let latestExampleRequest = 0;
  async function selectWorkflow(index) {
    const requestId = ++latestExampleRequest;
    try {
      if (!workflows) {
        const response = await fetch(new URL('./workflows.json', document.baseURI));
        if (!response.ok) throw new Error('Example unavailable');
        workflows = await response.json();
      }
      if (requestId !== latestExampleRequest) return;
      const example = workflows[index];
      document.getElementById('workflow-title').textContent = example.title;
      document.getElementById('workflow-description').textContent = example.description;
      document.getElementById('workflow-unit').textContent = example.unit;
      document.querySelectorAll('[data-stage-label]').forEach((node, i) => { node.textContent = example.stages[i]; });
      document.getElementById('workflow-example').setAttribute('aria-labelledby', `workflow-tab-${index}`);
      tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    } catch {
      document.getElementById('workflow-description').textContent = 'The sample could not load. You can still create a workspace using the link below.';
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectWorkflow(index));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault(); const next = keys[event.key]; tabs[next].focus(); selectWorkflow(next);
    });
  });
  mobile.addEventListener('change', updateMode); reducedMotion.addEventListener('change', updateMode);
  updateMode();
  window.addEventListener('pagehide', () => { stopFilm(); cancelAnimationFrame(scheduled); scheduled = 0; observer.disconnect(); });
  window.addEventListener('pageshow', () => { observer.observe(hero); updateMode(); });
})();
