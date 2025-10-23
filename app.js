// Header: switch to dark when scrolled
function setScrollState() {
	if (window.scrollY > 10) document.body.classList.add('scrolled');
	else document.body.classList.remove('scrolled');
}
setScrollState();
window.addEventListener('scroll', setScrollState, {
	passive: true
});
// Mobile menu
const menu = document.getElementById('menu');
const hb = document.getElementById('hamburger');
const closeMenu = document.getElementById('closeMenu');
if (hb && menu) {
	hb.addEventListener('click', () => {
		hb.classList.toggle('open');
		menu.classList.add('open');
	});
}
if (closeMenu && menu) {
	closeMenu.addEventListener('click', () => {
		hb?.classList.remove('open');
		menu.classList.remove('open');
	});
}
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		hb?.classList.remove('open');
		menu?.classList.remove('open');
	}
});


/* app.js — parallax + scroll-reveal */

(function() {
	// ---- Parallax on hero-visual image + HTML cards ----
const heroEl = document.querySelector('.hero-visual');
const cardA  = document.getElementById('hvCardA');
const cardB  = document.getElementById('hvCardB');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroEl && cardA && cardB && !prefersReduced) {
  let ticking = false;

  const onScrollOrResize = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  updateParallax();

  function updateParallax() {
    ticking = false;

    const rect = heroEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // progress around viewport center → clamp to [-1, 1]
    const p = ((rect.top + rect.height / 2) - vh / 2) / (vh / 2);
    const clamped = Math.max(-1, Math.min(1, p));

    // BOTH cards move UP (negative translateY)
    const baseRange = 160;   // px travel at speed=1 (tune)
    const speedA = 0.35;     // larger/faster
    const speedB = 0.25;     // smaller/slower

    const yA = -(clamped * baseRange * speedA);
    const yB = -(clamped * baseRange * speedB);

    cardA.style.transform = `translateY(${yA.toFixed(1)}px)`;
    cardB.style.transform = `translateY(${yB.toFixed(1)}px)`;
  }
}

	// RAF-ticked scroll listener for smoothness
	let ticking = false;

	function onScroll() {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				parallax();
				ticking = false;
			});
			ticking = true;
		}
	}
	window.addEventListener('scroll', onScroll, {
		passive: true
	});
	window.addEventListener('resize', onScroll);
	// initial
	onScroll();
	// ---- Scroll-reveal (Intersection Observer) ----
	const io = new IntersectionObserver((entries) => {
		entries.forEach(e => {
			if (e.isIntersecting) {
				e.target.classList.add('is-visible');
				// optionally unobserve once revealed
				io.unobserve(e.target);
			}
		});
	}, {
		rootMargin: '0px 0px -10% 0px',
		threshold: 0.12
	});
	// Mark anything you want to reveal with .reveal in HTML
	document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
// --- Smooth native scrolling (Lenis) ---
// Loads the library once, then initializes with easing. No HTML edits needed.
(function() {
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReduced || window.__lenisInit) return; // respect a11y + avoid re-init
	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = src;
			s.async = true;
			s.onload = resolve;
			s.onerror = reject;
			document.head.appendChild(s);
		});
	}
	loadScript('https://unpkg.com/@studio-freight/lenis@1.0.38/dist/lenis.min.js').then(() => {
		if (!window.Lenis) return; // safety
		window.__lenisInit = true;
		const lenis = new window.Lenis({
			duration: 1.05, // 0.8–1.3 = natural glide
			easing: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
			smoothWheel: true, // mouse/trackpad
			smoothTouch: false, // keep mobile native
			gestureOrientation: 'vertical'
		});

		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}
		requestAnimationFrame(raf);
		// Optional: if you later add in-page #anchor links and want Lenis to handle them:
		document.querySelectorAll('a[href^="#"]').forEach(a => {
			a.addEventListener('click', e => {
				const id = a.getAttribute('href').slice(1);
				const el = id && document.getElementById(id);
				if (!el) return;
				e.preventDefault();
				lenis.scrollTo(el, {
					offset: 72,
					duration: 0.8
				});
				history.pushState(null, '', `#${id}`);
			});
		});
	}).catch(() => {
		/* If CDN fails, silently do nothing (native scroll remains). */
	});
})();
// === Offers carousel controls (snap one full card per step + disable arrows) ===
(function() {
	const viewport = document.querySelector('#offers .offers-viewport');
	const track = document.querySelector('#offers .offers-track');
	if (!viewport || !track) return;
	const prev = document.querySelector('#offers .offer-prev');
	const next = document.querySelector('#offers .offer-next');
	const gap = parseInt(getComputedStyle(track).gap || '16', 10);

	function cardStepPx() {
		const first = track.querySelector('.offer-card');
		if (!first) return 0;
		return Math.round(first.getBoundingClientRect().width + gap);
	}

	function scrollByOne(direction) {
		const step = cardStepPx();
		viewport.scrollBy({
			left: direction * step,
			behavior: 'smooth'
		});
	}
	// --- new: disable arrows at ends ---
	function cardsPerView() {
		// reads your CSS variable --cards-per-view (3 desktop, 1 mobile)
		const root = document.getElementById('offers') || document.querySelector('#offers');
		const v = root ? getComputedStyle(root).getPropertyValue('--cards-per-view').trim() : '';
		const n = parseInt(v, 10);
		return Number.isFinite(n) && n > 0 ? n : 3;
	}

	function currentIndex() {
		const step = cardStepPx();
		if (!step) return 0;
		return Math.round(viewport.scrollLeft / step);
	}

	function lastIndex() {
		const total = track.querySelectorAll('.offer-card').length;
		return Math.max(0, total - cardsPerView());
	}

	function updateArrows() {
		const i = currentIndex();
		const li = lastIndex();
		prev.disabled = (i <= 0);
		next.disabled = (i >= li);
	}
	// --- end new ---
	prev?.addEventListener('click', () => scrollByOne(-1));
	next?.addEventListener('click', () => scrollByOne(+1));
	// Keyboard support when the row is focused
	viewport.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollByOne(+1);
		}
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollByOne(-1);
		}
	});
	// Keep the snap precise on resize/orientation changes
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			const step = cardStepPx();
			if (!step) return;
			const snapped = Math.round(viewport.scrollLeft / step) * step;
			viewport.scrollTo({
				left: snapped
			});
			updateArrows(); // keep buttons in sync after resize
		}, 120);
	}, {
		passive: true
	});
	viewport.addEventListener('scroll', updateArrows, {
		passive: true
	});
	// initial state
	updateArrows();
})();
// Always-scrolling marquee: duplicate content once and set a sensible speed
(function() {
	const track = document.getElementById('logoTrack');
	if (!track) return;
	// Save original single sequence
	const originalHTML = track.innerHTML;

	function initMarquee() {
		// Ensure single sequence first, measure width
		track.innerHTML = originalHTML;
		// Force a reflow so scrollWidth is correct
		// (helps if this runs before images finish decoding)
		const singleWidth = track.scrollWidth;
		// Duplicate for seamless loop
		track.innerHTML = originalHTML + originalHTML;
		// Distance to travel per cycle is the width of ONE sequence
		// Choose a px/sec speed and derive duration so speed feels consistent
		const pxPerSecond = 80; // adjust to taste (60–120 is common)
		const duration = Math.max(16, Math.min(60, Math.round(singleWidth / pxPerSecond)));
		track.style.animationDuration = duration + 's';
	}
	if (document.readyState === 'complete') initMarquee();
	else window.addEventListener('load', initMarquee, {
		once: true
	});
	// Recompute speed on resize (keeps motion natural across breakpoints)
	let t;
	window.addEventListener('resize', () => {
		clearTimeout(t);
		t = setTimeout(initMarquee, 150);
	}, {
		passive: true
	});
})();


// ===== Portfolio Detail Navigation (Prev / Close / Next + keyboard) =====
(function () {
  const root = document.getElementById('detail-root');
  if (!root) return; // not a detail page

  const manifest = (window.PortfolioManifest || []);
  const slug = root.dataset.slug;
  const titleEl = document.getElementById('detailTitle');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnClose = document.getElementById('btnClose');

  // Find current index (by slug first; fallback to matching pathname)
  let index = manifest.findIndex(x => x.slug === slug);
  if (index < 0) {
    const path = location.pathname.toLowerCase();
    index = manifest.findIndex(x => path.endsWith((x.href || "").toLowerCase()));
  }

  function setBtn(el, target) {
    if (!el) return;
    if (!target) {
      el.setAttribute('aria-disabled', 'true');
      el.removeAttribute('href');
    } else {
      el.removeAttribute('aria-disabled');
      el.href = target.href;
      if (target.title) el.title = target.title;
    }
  }

  if (index >= 0) {
    const cur = manifest[index];
    const prev = manifest[index - 1];
    const next = manifest[index + 1];
    if (cur?.title && titleEl) titleEl.textContent = cur.title;
    setBtn(btnPrev, prev);
    setBtn(btnNext, next);
  } else {
    setBtn(btnPrev, null);
    setBtn(btnNext, null);
  }

  // Close: try window.close(); fallback to portfolio.html
  btnClose?.addEventListener('click', function (e) {
    e.preventDefault();
    window.close();
    if (!document.hidden) {
      if (history.length > 1) history.back();
      else window.location.href = this.getAttribute('href') || 'portfolio.html';
    }
  });

  // Keyboard: ← / → / Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && btnPrev && !btnPrev.hasAttribute('aria-disabled')) {
      window.location.href = btnPrev.href;
    }
    if (e.key === 'ArrowRight' && btnNext && !btnNext.hasAttribute('aria-disabled')) {
      window.location.href = btnNext.href;
    }
    if (e.key === 'Escape' && btnClose) btnClose.click();
  });
})();

// === Detail banner chevrons (Prev/Next) ===
(function(){
  const body = document.body;
  if (!body.classList.contains('detail-page')) return;

  const manifest = (window.PortfolioManifest || []);
  const slug = body.getAttribute('data-slug');
  const prevEl = document.getElementById('heroPrev');
  const nextEl = document.getElementById('heroNext');

  // Find current index by slug, fallback by pathname
  let idx = manifest.findIndex(x => x.slug === slug);
  if (idx < 0) {
    const path = location.pathname.toLowerCase();
    idx = manifest.findIndex(x => path.endsWith((x.href || '').toLowerCase()));
  }

  function setBtn(el, target){
    if (!el) return;
    if (!target){
      el.setAttribute('aria-disabled','true');
      el.removeAttribute('href');
    } else {
      el.removeAttribute('aria-disabled');
      el.href = target.href;
      el.title = target.title || '';
    }
  }

  if (idx >= 0){
    setBtn(prevEl, manifest[idx - 1]);
    setBtn(nextEl, manifest[idx + 1]);
  } else {
    setBtn(prevEl, null);
    setBtn(nextEl, null);
  }

  // Keyboard arrows still work (optional)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && prevEl && !prevEl.hasAttribute('aria-disabled')) location.href = prevEl.href;
    if (e.key === 'ArrowRight' && nextEl && !nextEl.hasAttribute('aria-disabled')) location.href = nextEl.href;
  });
})();


// === Portfolio filter (tabs) ===
(function () {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.pcard'));
  const tabs = Array.from(document.querySelectorAll('.portfolio-tabs .ptab'));

  function apply(filter) {
    const f = filter.toLowerCase();
    cards.forEach(card => {
      const cats = (card.getAttribute('data-cat') || '').toLowerCase().split(/\s+/);
      const show = (f === 'all') || cats.includes(f);
      card.classList.toggle('hide', !show);
    });
  }
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      apply(btn.dataset.filter || 'all');
    });
  });
  apply('all');
})();


// === Responsive Filters (small screens) ===
(function(){
  const wrap  = document.querySelector('.filters[data-behavior="responsive-filters"]');
  if (!wrap) return;

  const btn   = wrap.querySelector('#filterToggle');
  const panel = wrap.querySelector('#filtersList');
  if (!btn || !panel) return;

  const icon = btn.querySelector('i');

  function toggle(open) {
    const isOpen = (open ?? !wrap.classList.contains('is-open'));
    wrap.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    if (icon){
      icon.classList.toggle('fa-plus',  !isOpen);
      icon.classList.toggle('fa-minus',  isOpen);
    }
  }

  btn.addEventListener('click', () => toggle());

  // Auto-close after picking a filter on phones
  panel.addEventListener('click', (e) => {
    if (e.target?.classList.contains('ptab') &&
        window.matchMedia('(max-width: 780px)').matches) {
      toggle(false);
    }
  });

  // Reset when resizing to desktop
  const mq = window.matchMedia('(min-width: 781px)');
  mq.addEventListener('change', (ev) => {
    if (ev.matches) {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (icon){ icon.classList.add('fa-plus'); icon.classList.remove('fa-minus'); }
    }
  });
})();


(function () {
  const blocks  = Array.from(document.querySelectorAll('.block'));
  const spacers = Array.from(document.querySelectorAll('.spacer'));
  const gap     = spacers[0] ? spacers[0].offsetHeight : 50; // 50px default

  // Read sticky offset from CSS: :root { --header-h: 64px; }
  const headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 0;

  let ticking = false;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function onScroll() {
    if (!blocks.length) { ticking = false; return; }

    const H = blocks[0].offsetHeight || Math.round(window.innerHeight * 0.8);

    for (let i = 0; i < blocks.length - 1; i++) {
      const nextTop = blocks[i + 1].getBoundingClientRect().top;

      // Progress 0→1 as the next block approaches the sticky line UNDER the header
      // (shift the viewport top by headerH)
      const raw = 1 - ((nextTop - headerH) / (H + gap));
      const p   = clamp(raw, 0, 1);

      const scale   = 1 - (0.25 * p);  // up to 8% shrink
      const blurPx  = 10 * p;          // up to 10px blur
      const opacity = 1 - (0.10 * p);  // slight fade

      blocks[i].style.transform = `scale(${scale})`;
      blocks[i].style.filter    = `blur(${blurPx}px)`;
      blocks[i].style.opacity   = `${opacity}`;
    }

    // Keep the top-most active block crisp
    const last = blocks[blocks.length - 1];
    if (last) {
      last.style.transform = 'scale(1)';
      last.style.filter = 'none';
      last.style.opacity = '1';
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);

  // Initialize
  onScroll();
})();