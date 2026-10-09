<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\ActivityLogger;
use App\Services\OfficialReceiptService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ReceiptController extends Controller
{
    public function __construct(
        private OfficialReceiptService $officialReceiptService
    ) {}

    public function show(Request $request, Payment $payment): InertiaResponse
    {
        $payment->loadMissing(['customer', 'laundryOrder']);
        $canManage = $this->canManageReceiptActions($request->user());
        $this->assertCanViewReceipt($request->user(), $payment);

        return Inertia::render('Payments/ReceiptShow', [
            'payment' => $payment,
            'can_manage_actions' => $canManage,
        ]);
    }

    public function print(Request $request, Payment $payment): Response
    {
        $payment->loadMissing(['customer', 'laundryOrder']);
        abort_unless($this->canManageReceiptActions($request->user()), 403);

        return response()->view('receipts.thermal', [
            'payment' => $payment,
        ]);
    }

    public function downloadPdf(Request $request, Payment $payment): SymfonyResponse
    {
        $payment->loadMissing(['customer', 'laundryOrder']);
        abort_unless($this->canManageReceiptActions($request->user()), 403);

        $pdf = Pdf::loadView('receipts.professional', [
            'payment' => $payment,
        ])->setPaper('a4');

        return $pdf->download(($payment->receipt_number ?? 'pending-receipt').'.pdf');
    }

    public function confirm(Request $request, Payment $payment)
    {
        abort_unless($request->user()?->isStaff(), 403);

        $this->officialReceiptService->generateForPayment($payment);
        $payment->refresh();

        ActivityLogger::log('payment.confirmed', "Payment confirmed {$payment->receipt_number}", $payment, [
            'payment_id' => $payment->id,
        ]);

        return back()->with('success', 'Payment confirmed and OR generated.');
    }

    private function assertCanViewReceipt($user, Payment $payment): void
    {
        if ($this->canManageReceiptActions($user)) {
            return;
        }

        if ($user && $user->role === 'customer' && $payment->customer?->email && $user->email === $payment->customer->email) {
            return;
        }

        abort(403);
    }

    private function canManageReceiptActions($user): bool
    {
        return (bool) $user?->isStaff();
    }

}
