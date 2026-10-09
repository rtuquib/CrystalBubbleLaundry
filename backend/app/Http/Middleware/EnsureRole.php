<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  string  ...$roles  Pipe-separated in single arg: "admin|staff"
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(403);
        }

        $allowed = [];
        foreach ($roles as $r) {
            foreach (explode('|', $r) as $part) {
                $allowed[] = trim($part);
            }
        }

        if (! in_array($user->role, $allowed, true)) {
            abort(403, 'Unauthorized for this area.');
        }

        if (in_array($user->role, ['admin', 'staff'], true)) {
            abort_unless($user->store_id && $user->store()->where('status', 'active')->exists(), 403, 'This store is not active.');
        }

        return $next($request);
    }
}
