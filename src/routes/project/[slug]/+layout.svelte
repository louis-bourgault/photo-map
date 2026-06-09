<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	import Marker from '$lib/components/marker.svelte';
	import { onDestroy, onMount } from 'svelte';
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
		closeLightBox,

		handleMapPhotoClick,
		mapboxBounds

	} from '$lib/mapstore.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let mapContainer!: HTMLDivElement;
	let map: mapboxgl.Map | undefined = $state();

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

	$effect(() => {
		if (map && mapboxBounds && mapboxBounds.minLat !== null && mapboxBounds.minLng !== null && mapboxBounds.maxLat !== null && mapboxBounds.maxLng !== null) {
			map.fitBounds([
				[mapboxBounds.minLng, mapboxBounds.minLat],
				[mapboxBounds.maxLng, mapboxBounds.maxLat]
			], {
				padding: 20,
				animate: true
			});
		}
	}

	)


	onMount(() => {
		setProjectID(data.project.id);

		mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		initPhotos(data.processedPhotos);
		initStories(data.stories);

		if (!mapboxBounds || !mapboxBounds.minLng || mapboxBounds.minLat === null || mapboxBounds.maxLng === null || mapboxBounds.maxLat === null) {
			return
		}

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/satellite-streets-v12',
			bounds: [
				[mapboxBounds?.minLng, mapboxBounds?.minLat],[mapboxBounds?.maxLng, mapboxBounds?.maxLat]
			],
			fitBoundsOptions: {padding: 20}
		});

		requestAnimationFrame(() => map?.resize());
	});
	
	onDestroy(() => {
		map?.remove();

	})
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
<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-100000000">
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
			handleMapPhotoClick(photo);
		}}
		visibleRatio={photo.visibleRatio}
	/>
{/each}
