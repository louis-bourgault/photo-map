<script lang="ts">
	import ModeSwitch from './mode-switch.svelte';
    import { authClient } from "$lib/authClient";
    const session = authClient.useSession();
</script>

<header class="w-full border-b">
	<div class="flex h-16 w-full items-center justify-between px-4">
		<a href="/" class="text-xl font-bold">PhotoMap</a>
		<nav>
            {#if $session.data?.user}
            	<a href="/dashboard" class="mr-4">Dashboard</a>
            {:else}
                <a href="/dashboard/login" class="mr-4">Login/Sign Up</a>
            {/if}
		</nav>
		<ModeSwitch />
	</div>
</header>
