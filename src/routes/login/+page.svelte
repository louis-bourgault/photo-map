<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-[70vh] items-center justify-center px-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Login to your account</Card.Title>
			<Card.Description>
				Enter your email below to login to your account
			</Card.Description>
			<Card.Action>
				<Button variant="link" formaction="?/signUpEmail" form="auth-form" type="submit">Sign Up</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<form id="auth-form" method="post" action="?/signInEmail" use:enhance>
				<div class="flex flex-col gap-6">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" placeholder="m@example.com" required />
					</div>
					<div class="grid gap-2">
						<Label for="password">Password</Label>
						<Input id="password" name="password" type="password" required />
					</div>
					<div class="grid gap-2">
						<Label for="name">Name (for registration)</Label>
						<Input id="name" name="name" placeholder="Your name" />
					</div>
					{#if form?.message}
						<p class="text-sm text-destructive">{form.message}</p>
					{/if}
				</div>
				<Card.Footer class="mt-6 flex-col gap-2 px-0 pb-0">
					<Button type="submit" class="w-full">Login</Button>
					<Button type="submit" formaction="?/signUpEmail" variant="outline" class="w-full">
						Register
					</Button>
				</Card.Footer>
			</form>
		</Card.Content>
	</Card.Root>
</div>
