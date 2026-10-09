<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public static function log(string $action, ?string $description = null, ?Model $subject = null, ?array $properties = null): void
    {
        ActivityLog::query()->create([
            'user_id' => Auth::id(),
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'created_at' => now(),
        ]);
    }
}
