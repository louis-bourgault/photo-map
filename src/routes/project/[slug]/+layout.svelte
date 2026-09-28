<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import 'mapbox-gl/dist/mapbox-gl.css';
	let { children, data } = $props();
	import {
		setProjectID,
		initStories,
		filteredPhotos,
		lightBox,
		closeLightBox,
		handleMapPhotoClick,
		mapboxBounds
	} from '$lib/mapstore.svelte.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let mapContainer!: HTMLDivElement;
	let map: any = $state();
	let mapboxgl: any;

	let mapWidth = $state();
	let resizeCallback: any;

	$effect(() => {
		if (mapWidth) {
			try {
				clearTimeout(resizeCallback);
			} catch {}
			resizeCallback = setTimeout(() => {
				map?.resize();
			}, 50);
			map?.resize();
		}
	});

	function photoGeoJson() {
		return {
			type: 'FeatureCollection',
			features: filteredPhotos
				.filter(
					(photo) =>
						Number.isFinite(Number(photo.longitude)) && Number.isFinite(Number(photo.latitude))
				)
				.map((photo) => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [Number(photo.longitude), Number(photo.latitude)]
					},
					properties: { id: photo.id, visibleRatio: photo.visibleRatio ?? 0 }
				}))
		};
	}

	function updateMapPhotos(data = photoGeoJson()) {
		const source = map?.getSource('photos');
		if (source) source.setData(data);
	}

	$effect(() => {
		const data = photoGeoJson();
		updateMapPhotos(data);
	});

	$effect(() => {
		if (
			map &&
			mapboxBounds &&
			mapboxBounds.minLat !== null &&
			mapboxBounds.minLng !== null &&
			mapboxBounds.maxLat !== null &&
			mapboxBounds.maxLng !== null
		) {
			map.fitBounds(
				[
					[mapboxBounds.minLng, mapboxBounds.minLat],
					[mapboxBounds.maxLng, mapboxBounds.maxLat]
				],
				{
					padding: 20,
					animate: true
				}
			);
		}
	});

	onMount(async () => {
		setProjectID(data.project.id);
		initStories(data.stories);
		mapboxgl = (await import('mapbox-gl')).default;
		mapboxgl.accessToken = env.PUBLIC_MAPBOX_ACCESS_TOKEN;

		if (
			mapboxBounds.minLng === null ||
			mapboxBounds.minLat === null ||
			mapboxBounds.maxLng === null ||
			mapboxBounds.maxLat === null
		) {
			return;
		}

		map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/satellite-streets-v12',
			bounds: [
				[mapboxBounds?.minLng, mapboxBounds?.minLat],
				[mapboxBounds?.maxLng, mapboxBounds?.maxLat]
			],
			fitBoundsOptions: { padding: 20 }
		});
		map.on('load', () => {
			map.addSource('photos', {
				type: 'geojson',
				data: photoGeoJson(),
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 45
			});
			map.addLayer({
				id: 'photo-clusters',
				type: 'circle',
				source: 'photos',
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': '#177f62',
					'circle-radius': ['step', ['get', 'point_count'], 18, 50, 24, 250, 30],
					'circle-stroke-color': '#fff',
					'circle-stroke-width': 2
				}
			});
			map.addLayer({
				id: 'photo-cluster-count',
				type: 'symbol',
				source: 'photos',
				filter: ['has', 'point_count'],
				layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
				paint: { 'text-color': '#fff' }
			});
			map.addLayer({
				id: 'photo-points',
				type: 'circle',
				source: 'photos',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-color': '#177f62',
					'circle-radius': ['interpolate', ['linear'], ['get', 'visibleRatio'], 0, 8, 1, 18],
					'circle-stroke-color': '#fff',
					'circle-stroke-width': 2
				}
			});

			map.on('click', 'photo-clusters', async (event: any) => {
				const feature = map.queryRenderedFeatures(event.point, { layers: ['photo-clusters'] })[0];
				if (!feature) return;
				const zoom = await map
					.getSource('photos')
					.getClusterExpansionZoom(feature.properties.cluster_id);
				map.easeTo({ center: feature.geometry.coordinates, zoom });
			});
			map.on('click', 'photo-points', (event: any) => {
				const id = Number(event.features?.[0]?.properties?.id);
				const selected = filteredPhotos.find((photo) => photo.id === id);
				if (selected) handleMapPhotoClick(selected);
			});
			for (const layer of ['photo-clusters', 'photo-points']) {
				map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
				map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
			}
		});

		requestAnimationFrame(() => map?.resize());
	});

	onDestroy(() => {
		map?.remove();
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
	<div class="bg-opacity-75 fixed inset-0 z-100000000 flex items-center justify-center bg-black">
		<Button class="absolute top-4 right-4" variant="secondary" onclick={closeLightBox}>Close</Button
		>
		<img
			src={lightBox.selectedPhoto.fullsizeUrl || lightBox.selectedPhoto.thumbnailUrl}
			alt={lightBox.selectedPhoto.filename}
			class="max-h-full max-w-full"
		/>
	</div>
{/if}
