<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $logs = ActivityLog::query()
            ->with('user:id,name')
            ->orderByDesc('id')
            ->paginate(30);

        return Inertia::render('Admin/ActivityLogs', [
            'logs' => $logs,
        ]);
    }
}
