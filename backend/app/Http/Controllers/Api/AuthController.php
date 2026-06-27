<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

final class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],  // 'hashed' cast applies Hash::make() automatically
            'role'     => UserRole::Customer,
        ]);

        Profile::create(['user_id' => $user->id]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return new JsonResponse([
            'message' => 'Registration successful.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role->value,
            ],
            'token' => $token,
        ], Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Stateless credential check — no session / web guard involved
        /** @var User|null $user */
        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return new JsonResponse(
                ['message' => 'Invalid credentials.'],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Revoke previous tokens to prevent accumulation (optional but clean)
        $user->tokens()->where('name', 'auth-token')->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return new JsonResponse([
            'message' => 'Login successful.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role->value,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->tokens()->delete();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    public function user(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->load(['profile', 'fidelityTier']);

        return new JsonResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'avatar_url' => $user->avatar_url,
                'profile' => $user->profile,
                'fidelity_tier' => $user->fidelityTier,
            ],
        ]);
    }
}
