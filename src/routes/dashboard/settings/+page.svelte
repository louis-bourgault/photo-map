<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { authClient } from '$lib/authClient';
    import { goto } from '$app/navigation';
	let deleteConfirm = $state('');
	let changePasswordData = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	async function deleteAccount() {
		if (deleteConfirm === 'DELETE') {
			await authClient.deleteUser();
			goto('/');
		}
	}

	async function changePassword() {
		if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
			alert('New password and confirmation do not match');
			return;
		}
		const { data, error } = await authClient.changePassword({
			newPassword: changePasswordData.newPassword, // required
			currentPassword: changePasswordData.currentPassword, // required
			revokeOtherSessions: true
		});
		if (error) {
			alert('Error changing password: ' + error.message);
		} else {
			alert('Password changed successfully');
			changePasswordData.currentPassword = '';
			changePasswordData.newPassword = '';
			changePasswordData.confirmPassword = '';
		}
	}
</script>

<div class="mx-auto max-w-2xl p-4 sm:p-6">
	<div class="space-y-2">
		<h1 class="font-heading text-3xl tracking-tight">Settings</h1>
		<p class="text-sm text-muted-foreground">
			Update your password or permanently delete your account.
		</p>
	</div>

	<div class="mt-8 space-y-6">
		<section class="rounded-lg border bg-card p-6 shadow-sm">
			<div class="space-y-1">
				<h2 class="text-lg font-medium">Change password</h2>
			</div>

			<form class="mt-5 space-y-4">
				<div class="space-y-2">
					<label for="current-password" class="text-sm font-medium">Current password</label>
					<Input
						id="current-password"
						type="password"
						placeholder="Current password"
						bind:value={changePasswordData.currentPassword}
					/>
				</div>

				<div class="space-y-2">
					<label for="new-password" class="text-sm font-medium">New password</label>
					<Input
						id="new-password"
						type="password"
						placeholder="New password"
						bind:value={changePasswordData.newPassword}
					/>
				</div>

				<div class="space-y-2">
					<label for="confirm-password" class="text-sm font-medium">Confirm new password</label>
					<Input
						id="confirm-password"
						type="password"
						placeholder="Confirm new password"
						bind:value={changePasswordData.confirmPassword}
					/>
				</div>

				<div class="flex items-center gap-3 pt-2">
					<Button variant="outline" type="submit" onclick={changePassword}>Change password</Button>
					<p class="text-sm text-muted-foreground">
						Make it secure, I guess. Or just use <i>password</i>.
					</p>
				</div>
			</form>
		</section>

		<section class="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
			<div class="space-y-1">
				<h2 class="text-lg font-medium text-destructive">Delete account</h2>
				<p class="text-sm text-muted-foreground">
					This permanently removes your profile, uploads, and all related data.
				</p>
			</div>

			<div class="mt-5 space-y-4">
				<div class="space-y-2">
					<label for="delete-confirm" class="text-sm font-medium">Type DELETE to confirm</label>
					<Input id="delete-confirm" placeholder="DELETE" bind:value={deleteConfirm} />
				</div>

				<Button
					variant="destructive"
					type="button"
					disabled={deleteConfirm != 'DELETE'}
					onclick={deleteAccount}>Delete account</Button
				>
			</div>
		</section>
	</div>
</div>
