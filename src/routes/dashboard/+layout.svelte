<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="w-full border-b p-4">
	<div class='h-16 flex items-center w-full justify-between'>
		<a href='/' class='text-xl font-bold'>PhotoMap</a>
		<nav>
			<a href='/dashboard' class='mr-4'>Dashboard</a>
			<a href='/about'>About</a>
		</nav>
		<ModeSwitch />
	</div>
</header>
{@render children()}
