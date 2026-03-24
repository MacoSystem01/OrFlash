<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    /**
     * Set a setting value (upsert).
     */
    public static function setValue(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value]
        );
    }

    /**
     * Return all settings as a nested array matching the frontend SettingsState shape.
     */
    public static function toArray(): array
    {
        $raw = static::all()->pluck('value', 'key');

        $defaults = [
            'general.contactEmail'                => 'support@orflash.com',
            'finances.currency'                   => 'COP',
            'finances.storeCommissionPercentage'  => '15',
            'finances.driverCommissionPercentage' => '10',
            'finances.paymentMethod'              => 'Stripe',
            'regional.timezone'                   => 'America/Bogota',
            'regional.language'                   => 'Español',
            'regional.dateFormat'                 => 'DD/MM/YYYY',
            'notifications.alertEmail'            => 'alerts@orflash.com',
            'notifications.pushEnabled'           => '1',
            'notifications.smsEnabled'            => '0',
        ];

        $result = [];

        foreach ($defaults as $key => $default) {
            [$section, $field] = explode('.', $key, 2);
            $raw_val = $raw[$key] ?? $default;

            // Cast booleans
            if (in_array($field, ['pushEnabled', 'smsEnabled'], true)) {
                $result[$section][$field] = $raw_val === '1';
            } else {
                $result[$section][$field] = $raw_val;
            }
        }

        return $result;
    }
}
