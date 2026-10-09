<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PopularServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $metrics = DB::table('order_items')
            ->where('store_id', $request->user()?->store_id ?? 0)
            ->selectRaw('SUM(CASE WHEN wash = 1 AND fold = 1 THEN 1 ELSE 0 END) as wash_fold')
            ->selectRaw('SUM(CASE WHEN wash = 1 AND dry = 1 THEN 1 ELSE 0 END) as wash_dry')
            ->selectRaw('SUM(CASE WHEN iron = 1 THEN 1 ELSE 0 END) as ironing')
            ->selectRaw('SUM(CASE WHEN wash = 1 AND dry = 1 AND fold = 1 AND iron = 1 THEN 1 ELSE 0 END) as full_service')
            ->first();

        $rows = collect([
            [
                'code' => 'wash_fold',
                'usage_count' => (int) ($metrics->wash_fold ?? 0),
                'description' => 'Everyday garments washed and neatly folded.',
            ],
            [
                'code' => 'wash_dry',
                'usage_count' => (int) ($metrics->wash_dry ?? 0),
                'description' => 'Quick wash cycle plus complete machine drying.',
            ],
            [
                'code' => 'ironing',
                'usage_count' => (int) ($metrics->ironing ?? 0),
                'description' => 'Wrinkle-free finishing for uniforms and fabrics.',
            ],
            [
                'code' => 'full_service',
                'usage_count' => (int) ($metrics->full_service ?? 0),
                'description' => 'Complete package: wash, dry, fold, and iron.',
            ],
        ])->sortByDesc('usage_count')->values();

        return response()->json($rows);
    }
}
