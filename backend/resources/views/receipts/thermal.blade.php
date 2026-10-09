<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thermal Receipt {{ $payment->receipt_number }}</title>
    <style>
        body { font-family: "Courier New", monospace; margin: 0; background: #f8fafc; }
        .ticket { width: 80mm; margin: 10px auto; background: #fff; padding: 10px 8px; color: #000; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
        .small { font-size: 11px; }
        @media print {
            body { background: #fff; }
            .ticket { margin: 0; width: 80mm; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="ticket">
        <div class="center">
            <strong>CRYSTALBUBBLE LAUNDRY</strong><br>
            <span class="small">OFFICIAL RECEIPT</span>
        </div>
        <div class="line"></div>
        <div class="row"><span>OR #</span><span>{{ $payment->receipt_number }}</span></div>
        <div class="row"><span>Date</span><span>{{ optional($payment->paid_at)->format('Y-m-d H:i') }}</span></div>
        <div class="row"><span>Order</span><span>{{ $payment->laundryOrder?->order_code }}</span></div>
        <div class="row"><span>Customer</span><span>{{ $payment->customer?->full_name }}</span></div>
        <div class="line"></div>
        <div class="row"><span>Method</span><span>{{ strtoupper($payment->payment_method) }}</span></div>
        <div class="row"><span>Status</span><span>{{ strtoupper($payment->payment_status) }}</span></div>
        <div class="row"><span>Amount</span><span>PHP {{ number_format((float) $payment->amount_paid, 2) }}</span></div>
        <div class="line"></div>
        <p class="center small">Thank you for choosing CrystalBubble!</p>
    </div>
</body>
</html>
