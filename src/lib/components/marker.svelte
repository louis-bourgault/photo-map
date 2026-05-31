<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from '$lib/mapbox-gl';

	let { long, lat, thumb, map, alt, onclick, visibleRatio = 0 } = $props();

	let marker: mapboxgl.Marker | null = null;
	let el: HTMLImageElement | null = null;

	function applySize(ratio: number) {
		if (!el) return;
		const increaseFactor = 3*((0.6*ratio)**2)
		const size = 2.5 + increaseFactor;
		el.style.width = `${size}rem`;
		el.style.height = `${size}rem`;
		if (marker) {
			const z = 100 + Math.round(ratio * 1000);
			marker.getElement().style.zIndex = String(z);
		}
	}

	onMount(() => {
		el = document.createElement('img');
		el.src = thumb;
		el.alt = alt ?? '';
		el.className = 'aspect-square rounded-2xl border-2 border-background object-cover';
		el.style.transition = 'width 150ms ease, height 150ms ease';
		el.addEventListener('click', onclick);
		applySize(visibleRatio);

		if (map) {
			marker = new mapboxgl.Marker(el).setLngLat([Number(long), Number(lat)]).addTo(map);
		}
	});

	$effect(() => {
		applySize(visibleRatio);
	});

	onDestroy(() => {
		marker?.remove();
		el?.removeEventListener('click', onclick);
	});
</script>
