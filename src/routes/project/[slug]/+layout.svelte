<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	import Marker from '$lib/components/marker.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
	import mapboxgl from '$lib/mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	let { children, data } = $props();
	import {
		photos,
		initPhotos,
		setProjectID,
		openLightBox,
		initStories,
		filteredPhotos,
		lightBox,
		closeLightBox
	} from '$lib/mapstore.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let mapContainer!: HTMLDivElement;
	let map: { remove: () => void; resize: () => void } | undefined = $state();

	let mapWidth = $state();
	let resizeCallback: any;

	$effect(() => {
		if (mapWidth) {
			try {
				clearTimeout(resizeCallback);
			} catch (e) {
				console.log('No resize callback to clear');
			}
			resizeCallback = setTimeout(() => {
				map?.resize();
			}, 50);
			map?.resize();
		}
	});

	onMount(() => {
		let active = true;

		if (!active) return;
		setProjectID(data.project.id);

		mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/satellite-streets-v12',
			center: [0, 0],
			zoom: 2
		});

		requestAnimationFrame(() => map?.resize());

		initPhotos(data.processedPhotos);
		initStories(data.stories);

		return () => {
			active = false;
			map?.remove();
		};
	});
</script>

<header class="width-full border-b">
	<div class="flex h-16 items-center justify-between p-4">
		<a class=" text-secondary-foreground" href="/dashboard">← Dashboard</a>
		<p class="text-bold text-lg">{data.project.name}</p>
		<ModeSwitch />
	</div>
</header>

<div class="h-[calc(100vh-4rem)] w-full">
	<Resizable.PaneGroup direction="horizontal" class="h-full w-full">
		<Resizable.Pane minSize={25} defaultSize={50}>{@render children()}</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane minSize={25} defaultSize={50}>
			<div class="map-wrapper h-full w-full" bind:clientWidth={mapWidth}>
				<div bind:this={mapContainer} class="map-container h-full w-full"></div>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>

{#if lightBox.open && lightBox.selectedPhoto}
<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
  <Button class="absolute top-4 right-4" variant="secondary" onclick={closeLightBox}>Close</Button>
  <img src={lightBox.selectedPhoto.fullsizeUrl || lightBox.selectedPhoto.thumbnailUrl} alt={lightBox.selectedPhoto.filename} class="max-w-full max-h-full" />
</div>
{/if}


{#each filteredPhotos as photo (photo.id)}
	<Marker
		long={photo.longitude}
		lat={photo.latitude}
		thumb={photo.thumbnailUrl}
		{map}
		alt={photo.filename}
		onclick={() => {
			openLightBox(photo);
		}}
	/>
{/each}
