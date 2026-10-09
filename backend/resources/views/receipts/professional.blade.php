<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Official Receipt {{ $payment->receipt_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        .page { border: 1px solid #cbd5e1; padding: 24px; }
        .heading { display: table; width: 100%; margin-bottom: 18px; }
        .left, .right { display: table-cell; vertical-align: top; }
        .right { text-align: right; }
        .title { font-size: 24px; font-weight: 700; margin: 0; }
        .sub { margin: 2px 0; color: #475569; }
        .box { border: 1px solid #e2e8f0; margin-top: 14px; }
        .row { display: table; width: 100%; border-bottom: 1px solid #e2e8f0; }
        .row:last-child { border-bottom: 0; }
        .cell-label, .cell-value { display: table-cell; padding: 10px 12px; }
        .cell-label { width: 35%; color: #475569; }
        .cell-value { font-weight: 600; }
    </style>
</head>
<body>
<div class="page">
    <div class="heading">
        <div class="left">
            <p class="sub">CrystalBubble Laundry</p>
            <h1 class="title">OFFICIAL RECEIPT</h1>
            <p class="sub">For thesis and demo presentation use</p>
        </div>
        <div class="right">
            <p><strong>OR Number:</strong> {{ $payment->receipt_number }}</p>
            <p><strong>Date Issued:</strong> {{ optional($payment->paid_at)->format('M d, Y h:i A') }}</p>
        </div>
    </div>

    <div class="box">
        <div class="row">
            <div class="cell-label">Customer</div>
            <div class="cell-value">{{ $payment->customer?->full_name }}</div>
        </div>
        <div class="row">
            <div class="cell-label">Order Code</div>
            <div class="cell-value">{{ $payment->laundryOrder?->order_code }}</div>
        </div>
        <div class="row">
            <div class="cell-label">Amount Paid</div>
            <div class="cell-value">PHP {{ number_format((float) $payment->amount_paid, 2) }}</div>
        </div>
        <div class="row">
            <div class="cell-label">Payment Method</div>
            <div class="cell-value">{{ strtoupper($payment->payment_method) }}</div>
        </div>
        <div class="row">
            <div class="cell-label">Reference Number</div>
            <div class="cell-value">{{ $payment->reference_number ?: 'N/A' }}</div>
        </div>
        <div class="row">
            <div class="cell-label">Recorded Status</div>
            <div class="cell-value">{{ strtoupper($payment->payment_status) }}</div>
        </div>
    </div>

    <p style="margin-top: 24px; color: #64748b;">
        This certifies that the amount listed above was received by CrystalBubble Laundry.
    </p>
</div>
</body>
</html>
