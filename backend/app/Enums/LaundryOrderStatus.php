<?php

namespace App\Enums;

enum LaundryOrderStatus: string
{
    case Received = 'received';
    case Processing = 'processing';
    case Washing = 'washing';
    case Drying = 'drying';
    case Folding = 'folding';
    case QualityCheck = 'quality_check';
    case ReadyForPickup = 'ready_for_pickup';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Received => 'Received',
            self::Processing => 'Processing',
            self::Washing => 'Washing',
            self::Drying => 'Drying',
            self::Folding => 'Folding',
            self::QualityCheck => 'Quality check',
            self::ReadyForPickup => 'Ready for pickup',
            self::Completed => 'Completed',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
