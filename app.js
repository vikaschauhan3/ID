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
	// ---- Parallax on hero SVG groups ----
	const hero = document.querySelector('.hero-visual');
	const card = document.getElementById('courseCard');
	const nodes = document.getElementById('pathNodes');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function parallax() {
		if (!hero || !card || !nodes || reduceMotion) return;
		const rect = hero.getBoundingClientRect();
		// progress: -1 (above) .. 0 (centered) .. +1 (below)
		const progress = ((rect.top + rect.height / 2) - window.innerHeight / 2) / (window.innerHeight / 2);
		// clamp
		const p = Math.max(-1, Math.min(1, progress));
		// opposing subtle moves (adjust multipliers to taste)
		const cardY = p * -12; // slower
		const nodesY = p * 20; // faster
		const nodesR = p * 2; // tiny rotate for life
		card.style.transform = `translate(30px, ${40 + cardY}px)`; // preserve original translate
		nodes.style.transform = `translate(380px, ${80 + nodesY}px) rotate(${nodesR}deg)`;
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
