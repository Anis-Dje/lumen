<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Throwable;

/**
 * Social sign-in (Google / GitHub) via Laravel Socialite.
 *
 * Flow:
 *   GET /api/auth/{provider}/redirect  -> 302 to the provider
 *   GET /api/auth/{provider}/callback  -> find/create user, mint a Sanctum
 *                                         token, 302 back to the SPA at
 *                                         {FRONTEND_URL}/auth/callback?token=…
 *
 * The API is stateless, so Socialite runs in stateless() mode.
 */
final class OAuthController extends Controller
{
    private const SUPPORTED = ['google', 'github'];

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::SUPPORTED, true), 404);

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $frontend = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        if (! in_array($provider, self::SUPPORTED, true)) {
            return redirect()->away($frontend . '/auth/callback?error=' . urlencode('Unsupported provider.'));
        }

        try {
            $oauthUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable $e) {
            Log::warning('OAuth callback failed', ['provider' => $provider, 'error' => $e->getMessage()]);

            return redirect()->away($frontend . '/auth/callback?error=' . urlencode('Authentication was cancelled or failed.'));
        }

        $email = $oauthUser->getEmail();

        if (empty($email)) {
            return redirect()->away($frontend . '/auth/callback?error=' . urlencode('Your ' . ucfirst($provider) . ' account did not share an email address.'));
        }

        /** @var User $user */
        $user = User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->fill([
                'name' => $oauthUser->getName() ?: $oauthUser->getNickname() ?: 'Lumen Member',
                'password' => bcrypt(Str::random(40)),
                'role' => UserRole::Customer,
            ]);
            $user->email_verified_at = now();
        }

        $user->oauth_provider = $provider;
        $user->oauth_id = (string) $oauthUser->getId();
        $user->avatar_url = $oauthUser->getAvatar() ?: $user->avatar_url;
        $user->save();

        // Ensure a profile row exists (mirrors the email/password register flow).
        Profile::firstOrCreate(['user_id' => $user->id]);

        $token = $user->createToken('oauth-' . $provider)->plainTextToken;

        return redirect()->away($frontend . '/auth/callback?token=' . urlencode($token));
    }
}
