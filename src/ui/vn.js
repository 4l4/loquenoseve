/*
 * Capa de novela visual sobre SugarCube 2.
 * Macros: <<bg>> <<char>> <<nochar>> <<fx>> <<say>> <<beat>> <<nextscene>> <<choices>> <<puntos>>
 * Referencia completa: CLAUDE.md
 */
Config.ui.stowBarInitially = true;
Config.history.controls = false;
Config.passages.transitionOut = 300;
Config.passages.nobr = true; /* saltos de línea del código no se muestran; usar <br> o <p> */

setup.img = name => `img/${name}.webp`;

/* ---------- Escenario ---------- */

const $stage = $(`
	<div id="vn-stage" aria-hidden="true">
		<div class="vn-bg" data-layer="a"></div>
		<div class="vn-bg" data-layer="b"></div>
		<div id="vn-chars"></div>
		<div id="vn-fx"></div>
	</div>
	<div id="vn-hud"></div>
	<div id="vn-rotate" role="alert">
		<svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
			<rect x="20" y="6" width="24" height="52" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
			<circle cx="32" cy="51" r="2" fill="currentColor"/>
		</svg>
		<p class="vn-rotate-title">Girá el teléfono</p>
		<p>Este juego se ve mejor en horizontal.</p>
	</div>
`).prependTo(document.body);

/*
 * Hoja (tarjeta de texto) persistente: #vn-sheet envuelve a #passages y a #vn-card en la misma celda de grilla.
 * Al cambiar de pasaje solo se funde el texto; la hoja queda quieta y se oculta solo si no hay nada que leer.
 */
function ensureSheet() {
	if (document.getElementById('vn-sheet')) return;
	const $passages = $('#passages');
	$('<div id="vn-sheet"><div id="vn-card" aria-hidden="true"></div></div>').insertBefore($passages).append($passages);
}

function updateCard(passageEl) {
	const empty = !passageEl || (!passageEl.textContent.trim() && !passageEl.querySelector('img, a, button, input'));
	$('#story').toggleClass('vn-nocard', empty);
}

let currentBg = null;
let bgLayer = 'a';

function setBg(name, transition) {
	if (name === currentBg) return;
	currentBg = name;
	const duration = { cut: 0, fade: 600, slow: 1500 }[transition] ?? 600;
	bgLayer = bgLayer === 'a' ? 'b' : 'a';
	const $in = $stage.find(`.vn-bg[data-layer="${bgLayer}"]`);
	const $out = $stage.find('.vn-bg').not($in);
	$in.css({ backgroundImage: `url("${setup.img(name)}")`, transitionDuration: `${duration}ms`, zIndex: 1 }).addClass('vn-on');
	$out.css({ transitionDuration: `${duration}ms`, zIndex: 0 }).removeClass('vn-on');
}

function charImage(id) {
	const def = setup.chars?.[id];
	return def ? def.img : id;
}

function showChar(id, pos) {
	const $chars = $('#vn-chars');
	let $img = $chars.children(`[data-char="${id}"]`);
	if (pos === 'hide') {
		$img.removeClass('vn-on').delay(400).queue(function () { $(this).remove(); });
		return;
	}
	const src = charImage(id);
	if (!src) return;
	if (!$img.length) {
		$img = $('<img alt="">').attr('data-char', id).appendTo($chars);
		setTimeout(() => $img.addClass('vn-on'), 20);
	} else {
		$img.stop(true).addClass('vn-on'); /* cancela un "hide" pendiente */
	}
	/* pos: left | center | right, o un porcentaje del ancho de pantalla (centro del sprite), p. ej. "72%" */
	const percent = /%$/.test(pos ?? '');
	$img.attr('src', setup.img(src)).attr('data-pos', percent ? 'custom' : pos || 'center').css('left', percent ? pos : '');
}

function clearChars() {
	$('#vn-chars').empty();
}

function playFx(name, ms) {
	const $fx = $('#vn-fx');
	$fx.stop(true).css({ backgroundImage: `url("${setup.img(name)}")`, opacity: 0 })
		.animate({ opacity: 1 }, ms / 2).animate({ opacity: 0 }, ms / 2);
}

function updateHud() {
	const p = State.variables.puntos;
	$('#vn-hud').text(p ? `Puntos porteños: ${p}` : '').toggle(!!p);
}

function preload(text) {
	const re = /<<(bg|char|fx)\s+["']([^"']+)["']/g;
	let m;
	while ((m = re.exec(text))) {
		const name = m[1] === 'char' ? charImage(m[2]) : m[2];
		if (name) new Image().src = setup.img(name);
	}
}

/* ---------- Beats: avance por clic dentro de un pasaje ---------- */

let beats = [];
let beatIdx = 0;
let nextPassage = null;
let collecting = false;
let $beat = null;

function hasMore() {
	if (!$beat) return false;
	if ($beat.find('a, button, input, select, textarea').length) return false;
	return beatIdx < beats.length - 1 || !!nextPassage;
}

function showBeat(i) {
	beatIdx = i;
	$beat.empty().removeClass('vn-in');
	void $beat[0].offsetWidth; /* reinicia la animación */
	$beat.addClass('vn-in').wiki(beats[i]);
	$beat.toggleClass('vn-more', hasMore());
	updateCard($beat.closest('.passage')[0]);
	updateHud();
}

function advance() {
	if (!$beat || !hasMore()) return;
	if (beatIdx < beats.length - 1) showBeat(beatIdx + 1);
	else Engine.play(nextPassage);
}

$(document).on(':passagestart', () => {
	ensureSheet();
	beats = [];
	beatIdx = 0;
	nextPassage = null;
	$beat = null;
	collecting = true;
	clearChars();
});

$(document).on(':passagerender', ev => {
	collecting = false;
	preload(ev.passage.text);
	if (beats.length) {
		$beat = $('<div class="vn-beat"></div>').appendTo(ev.content);
		showBeat(0);
	} else {
		updateCard(ev.content);
	}
});

$(document).on(':passagedisplay', () => {
	if ($beat) $beat.toggleClass('vn-more', hasMore());
	updateHud();
});

/* ---------- Cartel «En desarrollo» para las otras partes del proyecto (a.vn-ext) ---------- */

const $soon = $(`
	<div id="vn-soon" class="vn-noadvance" role="dialog" aria-modal="true" aria-labelledby="vn-soon-title" hidden>
		<div class="vn-soon-card">
			<button type="button" class="vn-soon-close" aria-label="Cerrar">×</button>
			<p class="vn-soon-part"></p>
			<p id="vn-soon-title" class="vn-soon-title">En desarrollo</p>
			<p>Esta parte del proyecto todavía no está lista. ¡Muy pronto!</p>
		</div>
	</div>
`).appendTo(document.body);

const soonOpen = () => !$soon.prop('hidden');

function showSoon(key) {
	$soon.find('.vn-soon-part').text(setup.ext?.[key] ?? '');
	$soon.prop('hidden', false);
	$soon.find('.vn-soon-close').trigger('focus');
}

function hideSoon() {
	$soon.prop('hidden', true);
}

$(document).on('click', 'a.vn-ext', ev => {
	ev.preventDefault();
	showSoon($(ev.currentTarget).attr('data-ext'));
});

/* Se cierra con un clic/toque en cualquier lugar (también en la ×) */
$soon.on('click', ev => {
	ev.stopPropagation();
	hideSoon();
});

$(document).on('click', ev => {
	if (Dialog.isOpen() || soonOpen()) return;
	if ($(ev.target).closest('a, button, input, select, textarea, label, #ui-bar, #ui-dialog, .vn-noadvance').length) return;
	advance();
});

$(document).on('keydown', ev => {
	if (soonOpen()) {
		if (['Escape', 'Enter', ' '].includes(ev.key)) {
			ev.preventDefault();
			hideSoon();
		}
		return;
	}
	if (Dialog.isOpen() || $(ev.target).is('input, textarea, select')) return;
	if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowRight') {
		ev.preventDefault();
		advance();
	}
});

/* ---------- Macros ---------- */

Macro.add('bg', {
	handler() {
		if (!this.args[0]) return this.error('<<bg>>: falta el nombre del fondo');
		setBg(this.args[0], this.args[1]);
	}
});

Macro.add('char', {
	handler() {
		const [id, pos] = this.args;
		if (!id) return this.error('<<char>>: falta el id del personaje');
		if (pos && !['left', 'center', 'right', 'hide'].includes(pos) && !/^\d+(\.\d+)?%$/.test(pos)) {
			return this.error(`<<char>>: posición inválida "${pos}" (left|center|right|hide|NN%)`);
		}
		showChar(id, pos);
	}
});

Macro.add('nochar', {
	handler() { clearChars(); }
});

Macro.add('fx', {
	handler() {
		if (!this.args[0]) return this.error('<<fx>>: falta el nombre del overlay');
		playFx(this.args[0], Number(this.args[1]) || 1200);
	}
});

Macro.add('say', {
	tags: null,
	handler() {
		const id = this.args[0];
		const def = setup.chars?.[id];
		const $say = $('<div class="vn-say"></div>').attr('data-speaker', id);
		$('<div class="vn-name"></div>').text(def ? def.name : id).css('--vn-char', def?.color ?? '').appendTo($say);
		$('<div class="vn-text"></div>').wiki(this.payload[0].contents).appendTo($say);
		$say.appendTo(this.output);
	}
});

Macro.add('beat', {
	tags: null,
	handler() {
		if (!collecting) return this.error('<<beat>> solo puede ir en el nivel del pasaje (no anidado ni dentro de otro <<beat>>)');
		beats.push(this.payload[0].contents);
	}
});

Macro.add('nextscene', {
	handler() {
		const target = this.args[0];
		if (!target || !Story.has(target)) return this.error(`<<nextscene>>: no existe el pasaje "${target}"`);
		nextPassage = target;
		if ($beat) $beat.toggleClass('vn-more', hasMore());
	}
});

Macro.add('choices', {
	tags: null,
	handler() {
		$('<div class="vn-choices"></div>').wiki(this.payload[0].contents).appendTo(this.output);
	}
});

Macro.add('puntos', {
	handler() {
		State.variables.puntos += Number(this.args[0]) || 0;
		updateHud();
	}
});
