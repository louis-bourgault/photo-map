<script lang="ts">
	let {data} = $props();
	import Header from '$lib/components/header.svelte';
</script>
<Header />
<div class="h-[calc(100%-4rem)] flex items-center justify-center">
	<br>
	<div class=" items-center gap-4">
		<h1 class="m-0 text-2xl font-semibold">Photomap</h1>
		<br>
		<p>An application to make photo albums and place them on the map, and then make interactive blog posts with them!</p>
		<br>
		{#if data.signedIn}
		<a href="/dashboard" class="text-primary hover:underline">Dashboard</a>
		{:else}
		<a href="/dashboard/login" class="text-primary hover:underline">Login/Sign Up</a>
		{/if}
	</div>
</div>