<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = AppNotification::query()
            ->where('recipient_id', $request->user()->id)
            ->with('sender:id,name')
            ->orderByDesc('id')
            ->paginate(20);

        $recipients = $request->user()->isAdmin()
            ? User::query()->where('store_id', $request->user()->store_id)->where('role', User::ROLE_STAFF)->orderBy('name')->get(['id', 'name', 'email'])
            : User::query()->where('store_id', $request->user()->store_id)->where('role', User::ROLE_ADMIN)->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'recipients' => $recipients,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $recipientRule = $request->user()->isAdmin()
            ? ['required', Rule::exists('users', 'id')->where('role', User::ROLE_STAFF)->where('store_id', $request->user()->store_id)]
            : ['required', Rule::exists('users', 'id')->where('role', User::ROLE_ADMIN)->where('store_id', $request->user()->store_id)];

        $data = $request->validate([
            'recipient_id' => $recipientRule,
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['nullable', 'string', 'max:64'],
        ]);

        $n = AppNotification::query()->create([
            'sender_id' => $request->user()->id,
            'recipient_id' => $data['recipient_id'],
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'] ?? 'general',
        ]);

        ActivityLogger::log('notification.sent', $n->title, $n);

        return back()->with('success', 'Notification sent.');
    }

    public function markRead(Request $request, AppNotification $app_notification): RedirectResponse
    {
        if ($app_notification->recipient_id !== $request->user()->id) {
            abort(403);
        }
        $app_notification->markRead();

        return back();
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = AppNotification::query()
            ->where('recipient_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function recipients(Request $request): JsonResponse
    {
        if ($request->user()->isAdmin()) {
            $users = User::query()->where('store_id', $request->user()->store_id)->where('role', User::ROLE_STAFF)->orderBy('name')->get(['id', 'name', 'email']);
        } else {
            $users = User::query()->where('store_id', $request->user()->store_id)->where('role', User::ROLE_ADMIN)->orderBy('name')->get(['id', 'name', 'email']);
        }

        return response()->json($users);
    }
}
