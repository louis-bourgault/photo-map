export type EmbedPreferences = {
	enabled: boolean;
	background: string;
	foreground: string;
	accent: string;
	muted: string;
	border: string;
	font: string | null;
	fontUrl: string | null;
	headingFont: string | null;
	headingFontUrl: string | null;
};

const defaults = {
	background: '#ffffff',
	foreground: '#22212a',
	accent: '#177f62',
	muted: '#666672',
	border: '#e5e5e8'
};

function color(value: string | null, fallback: string): string {
	return value && /^#[\da-fA-F]{3}(?:[\da-fA-F]{3})?$/.test(value) ? value : fallback;
}

function fontName(value: string | null): string | null {
	const name = value?.trim();
	return name && name.length <= 80 && /^[\p{L}\p{N} -]+$/u.test(name) ? name : null;
}

function fontFile(value: string | null): string | null {
	if (!value || value.length > 2048) return null;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
	} catch {
		return null;
	}
}

export function getEmbedPreferences(params: URLSearchParams, isStory: boolean): EmbedPreferences {
	const enabled = isStory && params.get('embed') === '1';
	return {
		enabled,
		background: color(enabled ? params.get('background') : null, defaults.background),
		foreground: color(enabled ? params.get('foreground') : null, defaults.foreground),
		accent: color(enabled ? params.get('accent') : null, defaults.accent),
		muted: color(enabled ? params.get('muted') : null, defaults.muted),
		border: color(enabled ? params.get('border') : null, defaults.border),
		font: enabled ? fontName(params.get('font')) : null,
		fontUrl: enabled ? fontFile(params.get('fontUrl')) : null,
		headingFont: enabled ? fontName(params.get('headingFont')) : null,
		headingFontUrl: enabled ? fontFile(params.get('headingFontUrl')) : null
	};
}

export function googleFontStylesheet(name: string | null): string | null {
	return name
		? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}&display=swap`
		: null;
}

export function embedStyle(preferences: EmbedPreferences): string {
	const bodyFont = preferences.fontUrl
		? 'Embed Body, sans-serif'
		: preferences.font
			? `"${preferences.font}", sans-serif`
			: '"Inter Variable", sans-serif';
	const headingFont = preferences.headingFontUrl
		? 'Embed Heading, serif'
		: preferences.headingFont
			? `"${preferences.headingFont}", serif`
			: bodyFont;
	return [
		`--embed-background:${preferences.background}`,
		`--embed-foreground:${preferences.foreground}`,
		`--embed-accent:${preferences.accent}`,
		`--embed-muted:${preferences.muted}`,
		`--embed-border:${preferences.border}`,
		`--embed-body-font:${bodyFont}`,
		`--embed-heading-font:${headingFont}`
	].join(';');
}
