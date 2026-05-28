<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	let { children } = $props();
	import Header from '$lib/components/header.svelte';
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Header />
{@render children()}
