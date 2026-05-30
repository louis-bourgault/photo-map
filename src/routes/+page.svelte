<script lang="ts">
	let {data} = $props();
	import Header from '$lib/components/header.svelte';
</script>
<Header />
<div class="h-[calc(100%-4rem)] flex items-center justify-center">
	<br class='h-10'>
	<div class=" items-center gap-6 pt-5">
		<img src='https://cdn.hackclub.com/019e7834-51d9-756e-8f0b-728cff402e50/Screenshot%202026-05-25%20at%2021.12.42.png' alt='some pins on a map in tokyo'>
		<h1 class="m-0 text-2xl font-semibold pt-5">Photomap</h1>
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