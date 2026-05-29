<script lang="ts">
	import ModeSwitch from './mode-switch.svelte';
	import { authClient } from '$lib/authClient';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { User } from '@lucide/svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		goto('/');
	}

</script>

<header class="w-full border-b">
	<div class="flex h-16 w-full items-center justify-between px-4">
		<a href="/" class="text-xl font-bold">PhotoMap</a>
		<nav>
			{#if page.data.user}
				<a href="/dashboard" class="mr-4">Dashboard</a>
			{:else}
				<a href="/dashboard/login" class="mr-4">Login/Sign Up</a>
			{/if}
		</nav>
		<div>
			<ModeSwitch />
			{#if page.data.user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger><Button variant="outline" size="icon">
						<User class=' h-4'></User>
					</Button></DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item onclick={signOut}>Sign Out</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a href='/dashboard/settings'>Settings</a>
						</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</div>
</header>
