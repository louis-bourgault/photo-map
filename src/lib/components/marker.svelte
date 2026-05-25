<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from '$lib/mapbox-gl';
	let { long, lat, thumb, map, alt, onclick } = $props();
	let marker: mapboxgl.Marker | null = null;
	let object: HTMLImageElement | undefined = $state();

	onMount(() => {
		if (map && object) {
			marker = new mapboxgl.Marker(object).setLngLat([Number(long), Number(lat)]).addTo(map);
		}
		object?.addEventListener('click', onclick);
	});

	onDestroy(() => {
		marker?.remove();
	});
</script>

<img
	src={thumb}
	{alt}
	bind:this={object}
	class="aspect-square h-10 w-10 rounded-full border-2 border-background object-cover"
/>
