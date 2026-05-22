<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";
	import ModeSwitch from '$lib/components/mode-switch.svelte';
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

<header class="width-full border-b ">
	<div class="container flex h-16 items-center justify-between p-4">
		<h1 class="text-lg font-bold">photo-map</h1>
		<nav>
			<ul class="flex items-center gap-4">
				<li><a href="/">Home</a></li>
				<li><a href="/login">Login</a></li>
			</ul>
		</nav>
		<ModeSwitch />
	</div>
</header>
{@render children()}
