<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'store_id',
        'driver_id',
        'subtotal',
        'delivery_fee',
        'platform_fee',
        'total',
        'store_commission',
        'driver_commission',
        'store_earnings',
        'driver_earnings',
        'status',
        'payment_status',
        'payment_reference',
        'payment_method',
        'delivery_address',
        'delivery_neighborhood',
        'delivery_city',
        'delivery_references',
        'delivery_lat',
        'delivery_lng',
        'confirmed_at',
        'preparing_at',
        'ready_at',
        'picked_up_at',
        'delivered_at',
        'cancelled_at',
    ];

    protected $casts = [
        'subtotal'          => 'integer',
        'delivery_fee'      => 'integer',
        'platform_fee'      => 'integer',
        'total'             => 'integer',
        'store_commission'  => 'integer',
        'driver_commission' => 'integer',
        'store_earnings'    => 'integer',
        'driver_earnings'   => 'integer',
        'delivery_lat'      => 'float',
        'delivery_lng'      => 'float',
        'confirmed_at'      => 'datetime',
        'preparing_at'      => 'datetime',
        'ready_at'          => 'datetime',
        'picked_up_at'      => 'datetime',
        'delivered_at'      => 'datetime',
        'cancelled_at'      => 'datetime',
    ];

    // ─── Comisiones de la plataforma ──────────────────────────────────────────

    const STORE_COMMISSION_RATE  = 0.10; // 10% sobre el subtotal
    const DRIVER_COMMISSION_RATE = 0.10; // 10% sobre el delivery_fee

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForClient($query, int $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForStore($query, int $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    public function scopeForDriver($query, int $driverId)
    {
        return $query->where('driver_id', $driverId);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'picked_up',
            'in_transit',
        ]);
    }

    public function scopeAvailableForDriver($query)
    {
        return $query->where('status', 'ready')
            ->whereNull('driver_id');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'approved');
    }

    // ─── Helpers de estado ────────────────────────────────────────────────────

    public function isPaid(): bool
    {
        return $this->payment_status === 'approved';
    }

    public function isActive(): bool
    {
        return in_array($this->status, [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'picked_up',
            'in_transit',
        ]);
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function canBeAcceptedByDriver(): bool
    {
        return $this->status === 'ready' && is_null($this->driver_id);
    }

    // ─── Avanzar estado ───────────────────────────────────────────────────────

    public function advanceStatus(): bool
    {
        $transitions = [
            'pending'   => ['status' => 'confirmed',  'timestamp' => 'confirmed_at'],
            'confirmed' => ['status' => 'preparing',  'timestamp' => 'preparing_at'],
            'preparing' => ['status' => 'ready',      'timestamp' => 'ready_at'],
            'picked_up' => ['status' => 'in_transit', 'timestamp' => null],
            'in_transit'=> ['status' => 'delivered',  'timestamp' => 'delivered_at'],
        ];

        if (!isset($transitions[$this->status])) {
            return false;
        }

        $next = $transitions[$this->status];
        $data = ['status' => $next['status']];

        if ($next['timestamp']) {
            $data[$next['timestamp']] = now();
        }

        $this->update($data);
        return true;
    }

    // ─── Tarifa de domicilio por distancia ────────────────────────────────────

    /**
     * Calcula la tarifa de domicilio según distancia.
     * Si la tienda tiene tarifa fija configurada, la usa directamente.
     * Zonas: 0-500m=$1500, 0.5-1km=$2500, 1-1.5km=$3500, 1.5-2km=$4500, >2km=no disponible
     */
    public static function calculateDistanceFee(float $distanceM, ?int $storeCustomFee): array
    {
        if ($storeCustomFee !== null) {
            return ['fee' => $storeCustomFee, 'zone' => 'custom', 'available' => true];
        }
        if ($distanceM <= 500)  return ['fee' => 1500, 'zone' => 'cercana', 'available' => true];
        if ($distanceM <= 1000) return ['fee' => 2500, 'zone' => 'media',   'available' => true];
        if ($distanceM <= 1500) return ['fee' => 3500, 'zone' => 'lejana',  'available' => true];
        if ($distanceM <= 2000) return ['fee' => 4500, 'zone' => 'maxima',  'available' => true];
        return                         ['fee' => 0,    'zone' => 'fuera',   'available' => false];
    }

    // ─── Distancia Haversine (metros) ─────────────────────────────────────────

    public static function haversineMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6_371_000; // radio de la Tierra en metros
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    // ─── Calcular comisiones (método estático) ────────────────────────────────

    public static function calculateCommissions(int $subtotal, int $deliveryFee): array
    {
        $storeCommission  = (int) round($subtotal     * self::STORE_COMMISSION_RATE);
        $driverCommission = (int) round($deliveryFee  * self::DRIVER_COMMISSION_RATE);

        return [
            'subtotal'          => $subtotal,
            'delivery_fee'      => $deliveryFee,
            'store_commission'  => $storeCommission,
            'driver_commission' => $driverCommission,
            'store_earnings'    => $subtotal    - $storeCommission,
            'driver_earnings'   => $deliveryFee - $driverCommission,
            'platform_fee'      => $storeCommission + $driverCommission,
            'total'             => $subtotal + $deliveryFee,
        ];
    }
}