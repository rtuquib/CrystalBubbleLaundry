<?php

namespace App\Services;

class OrderPricingService
{
    public const BASE_PER_KG = 25.0;

    /** @var array<string, float> */
    public const SERVICE_FEES = [
        'wash' => 60.0,
        'dry' => 50.0,
        'fold' => 45.0,
        'iron' => 55.0,
    ];

    /**
     * @param  array{weight: float|int|string, wash?: bool, dry?: bool, fold?: bool, iron?: bool, quantity?: int}  $item
     */
    public function lineTotal(array $item): float
    {
        $qty = max(1, (int) ($item['quantity'] ?? 1));
        $kg = (float) ($item['weight'] ?? 0);
        $base = $kg * self::BASE_PER_KG * $qty;
        $fees = 0.0;
        foreach (['wash', 'dry', 'fold', 'iron'] as $k) {
            if (! empty($item[$k])) {
                $fees += self::SERVICE_FEES[$k];
            }
        }

        return round($base + $fees, 2);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    public function orderTotal(array $items): float
    {
        $sum = 0.0;
        foreach ($items as $item) {
            $sum += $this->lineTotal($item);
        }

        return round($sum, 2);
    }
}
