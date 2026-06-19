<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\FidelityTier;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ── Fidelity Tiers ────────────────────────────────────────────
        $tiers = [
            ['name' => 'Bronze',   'slug' => 'bronze',   'min_lifetime_spend' => 0,    'points_multiplier' => 1.00, 'sort_order' => 1, 'perks' => ['Standard support']],
            ['name' => 'Silver',   'slug' => 'silver',   'min_lifetime_spend' => 500,  'points_multiplier' => 1.50, 'sort_order' => 2, 'perks' => ['Priority support', 'Free shipping over $50']],
            ['name' => 'Gold',     'slug' => 'gold',     'min_lifetime_spend' => 2000, 'points_multiplier' => 2.00, 'sort_order' => 3, 'perks' => ['Priority support', 'Free shipping', 'Early access']],
            ['name' => 'Platinum', 'slug' => 'platinum', 'min_lifetime_spend' => 5000, 'points_multiplier' => 3.00, 'sort_order' => 4, 'perks' => ['Concierge support', 'Free shipping', 'Early access', 'Exclusive drops']],
        ];

        foreach ($tiers as $tierData) {
            FidelityTier::firstOrCreate(['name' => $tierData['name']], array_merge($tierData, ['id' => Str::uuid()]));
        }

        $bronzeTier = FidelityTier::where('name', 'Bronze')->first();

        // ── Admin user ────────────────────────────────────────────────
        User::firstOrCreate(['email' => 'admin@crm.dev'], [
            'id'               => Str::uuid(),
            'name'             => 'Admin',
            'email'            => 'admin@crm.dev',
            'password'         => Hash::make('password'),
            'role'             => 'admin',
            'fidelity_tier_id' => $bronzeTier?->id,
        ]);

        // ── Demo customer ─────────────────────────────────────────────
        User::firstOrCreate(['email' => 'customer@crm.dev'], [
            'id'               => Str::uuid(),
            'name'             => 'Jane Doe',
            'email'            => 'customer@crm.dev',
            'password'         => Hash::make('password'),
            'role'             => 'customer',
            'fidelity_tier_id' => $bronzeTier?->id,
        ]);

        // ── Categories ────────────────────────────────────────────────
        $catData = [
            ['name' => 'Laptops',       'slug' => 'laptops',       'description' => 'High-performance laptops for every need.'],
            ['name' => 'Smartphones',   'slug' => 'smartphones',   'description' => 'Latest flagship and mid-range smartphones.'],
            ['name' => 'Audio',         'slug' => 'audio',         'description' => 'Headphones, earbuds, and speakers.'],
            ['name' => 'Accessories',   'slug' => 'accessories',   'description' => 'Cables, cases, and peripherals.'],
            ['name' => 'Tablets',       'slug' => 'tablets',       'description' => 'Compact tablets for work and play.'],
            ['name' => 'Gaming',        'slug' => 'gaming',        'description' => 'Controllers, headsets and gaming gear.'],
        ];

        $categories = [];
        foreach ($catData as $c) {
            $categories[$c['slug']] = Category::firstOrCreate(['slug' => $c['slug']], array_merge($c, [
                'id'         => Str::uuid(),
                'is_active'  => true,
                'sort_order' => 0,
            ]));
        }

        // ── Products & Variants ───────────────────────────────────────
        $products = [

            // ── LAPTOPS ──────────────────────────────────────────────
            [
                'category' => 'laptops',
                'name'  => 'ProBook Ultra 15',
                'slug'  => 'probook-ultra-15',
                'description' => 'The ProBook Ultra 15 delivers workstation-class performance in a slim 15.6" chassis. Featuring a stunning 4K OLED display, PCIe Gen 5 SSD, and all-day battery life, it\'s the professional\'s choice.',
                'short_description' => 'Workstation power in an ultra-slim 15.6" laptop.',
                'image_url' => 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
                'specifications' => [
                    'Display'   => '15.6" 4K OLED, 120Hz',
                    'Processor' => 'Intel Core Ultra 9 185H',
                    'Graphics'  => 'NVIDIA RTX 4070 8GB',
                    'Battery'   => '86Wh, up to 12 hours',
                    'Weight'    => '1.85 kg',
                    'OS'        => 'Windows 11 Pro',
                ],
                'variants' => [
                    ['sku' => 'PBU15-16-512',  'name' => '16GB / 512GB',  'price' => 1299.99, 'compare_at_price' => 1499.99, 'stock' => 25, 'attributes' => ['RAM' => '16GB', 'Storage' => '512GB SSD']],
                    ['sku' => 'PBU15-32-1TB',  'name' => '32GB / 1TB',    'price' => 1699.99, 'compare_at_price' => 1899.99, 'stock' => 15, 'attributes' => ['RAM' => '32GB', 'Storage' => '1TB SSD']],
                    ['sku' => 'PBU15-64-2TB',  'name' => '64GB / 2TB',    'price' => 2199.99, 'compare_at_price' => null,     'stock' => 8,  'attributes' => ['RAM' => '64GB', 'Storage' => '2TB SSD']],
                ],
            ],
            [
                'category' => 'laptops',
                'name'  => 'AirSlim 13 Pro',
                'slug'  => 'airslim-13-pro',
                'description' => 'Weighing just 990g, the AirSlim 13 Pro is the lightest ultrabook on the market. With its Snapdragon X Elite chip and fanless design, it runs cool and silent while delivering all-day battery life.',
                'short_description' => 'The lightest 13" ultrabook, redesigned.',
                'image_url' => 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
                'specifications' => [
                    'Display'   => '13.3" 2.8K AMOLED, 90Hz',
                    'Processor' => 'Snapdragon X Elite X1E-80-100',
                    'Graphics'  => 'Adreno GPU (integrated)',
                    'Battery'   => '65Wh, up to 18 hours',
                    'Weight'    => '0.99 kg',
                    'OS'        => 'Windows 11 Home',
                ],
                'variants' => [
                    ['sku' => 'AS13-16-256', 'name' => '16GB / 256GB', 'price' => 999.99,  'compare_at_price' => 1149.99, 'stock' => 30, 'attributes' => ['RAM' => '16GB', 'Storage' => '256GB SSD']],
                    ['sku' => 'AS13-16-512', 'name' => '16GB / 512GB', 'price' => 1149.99, 'compare_at_price' => null,     'stock' => 20, 'attributes' => ['RAM' => '16GB', 'Storage' => '512GB SSD']],
                ],
            ],
            [
                'category' => 'laptops',
                'name'  => 'StudioBook Creator',
                'slug'  => 'studiobook-creator',
                'description' => 'Built for creative professionals, the StudioBook Creator features a Pantone-validated OLED touchscreen, NVIDIA RTX 5080, and 64GB of DDR5 RAM for seamless 3D rendering and video editing.',
                'short_description' => 'The ultimate creative workstation laptop.',
                'image_url' => 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
                'specifications' => [
                    'Display'   => '16" 3.2K OLED Touch, 60Hz',
                    'Processor' => 'AMD Ryzen 9 9950X',
                    'Graphics'  => 'NVIDIA RTX 5080 16GB',
                    'Battery'   => '90Wh, up to 8 hours',
                    'Weight'    => '2.4 kg',
                    'OS'        => 'Windows 11 Pro',
                ],
                'variants' => [
                    ['sku' => 'SBC-64-2TB',  'name' => '64GB / 2TB',  'price' => 2999.99, 'compare_at_price' => 3299.99, 'stock' => 6, 'attributes' => ['RAM' => '64GB', 'Storage' => '2TB SSD']],
                    ['sku' => 'SBC-128-4TB', 'name' => '128GB / 4TB', 'price' => 3999.99, 'compare_at_price' => null,     'stock' => 3, 'attributes' => ['RAM' => '128GB', 'Storage' => '4TB SSD']],
                ],
            ],

            // ── SMARTPHONES ──────────────────────────────────────────
            [
                'category' => 'smartphones',
                'name'  => 'Nova X Pro',
                'slug'  => 'nova-x-pro',
                'description' => 'Nova X Pro pushes the boundaries of mobile photography with a 200MP periscope camera, satellite connectivity, and the blazing-fast Apex 9 Gen 3 chip. The titanium frame and Ceramic Shield glass make it virtually indestructible.',
                'short_description' => 'Flagship smartphone with 200MP camera.',
                'image_url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                'specifications' => [
                    'Display'       => '6.7" Dynamic AMOLED 2X, 2600nits',
                    'Processor'     => 'Apex 9 Gen 3',
                    'Camera'        => '200MP + 50MP + 12MP, 10x Optical Zoom',
                    'Battery'       => '5000mAh, 65W wired, 15W wireless',
                    'Build'         => 'Titanium frame, Ceramic Shield',
                    'Water rating'  => 'IP68',
                ],
                'variants' => [
                    ['sku' => 'NXP-BLK-256', 'name' => 'Black / 256GB',  'price' => 1099.99, 'compare_at_price' => 1199.99, 'stock' => 40, 'attributes' => ['Color' => 'Midnight Black', 'Storage' => '256GB']],
                    ['sku' => 'NXP-WHT-256', 'name' => 'White / 256GB',  'price' => 1099.99, 'compare_at_price' => 1199.99, 'stock' => 35, 'attributes' => ['Color' => 'Porcelain White', 'Storage' => '256GB']],
                    ['sku' => 'NXP-BLK-512', 'name' => 'Black / 512GB',  'price' => 1299.99, 'compare_at_price' => null,     'stock' => 20, 'attributes' => ['Color' => 'Midnight Black', 'Storage' => '512GB']],
                    ['sku' => 'NXP-TIT-512', 'name' => 'Titanium / 512GB','price'=> 1349.99, 'compare_at_price' => null,     'stock' => 4,  'attributes' => ['Color' => 'Natural Titanium', 'Storage' => '512GB']],
                ],
            ],
            [
                'category' => 'smartphones',
                'name'  => 'Pixel Snap 9',
                'slug'  => 'pixel-snap-9',
                'description' => 'Pixel Snap 9 combines Google\'s AI-first approach with stunning computational photography. Features include Live Translate, Real Tone camera, and 7 years of OS updates guaranteed.',
                'short_description' => 'Google AI + brilliant photography in your pocket.',
                'image_url' => 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
                'specifications' => [
                    'Display'   => '6.3" LTPO OLED, 1-120Hz',
                    'Processor' => 'Tensor G4',
                    'Camera'    => '50MP main + 48MP ultrawide + 48MP telephoto',
                    'Battery'   => '4700mAh, 30W wired',
                    'Updates'   => '7 years OS + Security',
                    'Water rating' => 'IP68',
                ],
                'variants' => [
                    ['sku' => 'PS9-OBS-128', 'name' => 'Obsidian / 128GB', 'price' => 799.99, 'compare_at_price' => 899.99, 'stock' => 50, 'attributes' => ['Color' => 'Obsidian', 'Storage' => '128GB']],
                    ['sku' => 'PS9-HAZ-128', 'name' => 'Hazel / 128GB',    'price' => 799.99, 'compare_at_price' => 899.99, 'stock' => 45, 'attributes' => ['Color' => 'Hazel', 'Storage' => '128GB']],
                    ['sku' => 'PS9-OBS-256', 'name' => 'Obsidian / 256GB', 'price' => 899.99, 'compare_at_price' => null,   'stock' => 30, 'attributes' => ['Color' => 'Obsidian', 'Storage' => '256GB']],
                ],
            ],
            [
                'category' => 'smartphones',
                'name'  => 'BudgetPro 5G',
                'slug'  => 'budgetpro-5g',
                'description' => 'Exceptional value without compromise. The BudgetPro 5G brings 5G connectivity, a 6.5" 90Hz display, and a 5000mAh battery to the mid-range market.',
                'short_description' => '5G performance at a budget-friendly price.',
                'image_url' => 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
                'specifications' => [
                    'Display'   => '6.5" IPS LCD, 90Hz',
                    'Processor' => 'MediaTek Dimensity 7300',
                    'Camera'    => '64MP + 8MP + 2MP',
                    'Battery'   => '5000mAh, 33W wired',
                    'Water rating' => 'IP52',
                ],
                'variants' => [
                    ['sku' => 'BP5G-BLU-128', 'name' => 'Blue / 128GB', 'price' => 299.99, 'compare_at_price' => 349.99, 'stock' => 80, 'attributes' => ['Color' => 'Ocean Blue', 'Storage' => '128GB']],
                    ['sku' => 'BP5G-BLK-128', 'name' => 'Black / 128GB','price' => 299.99, 'compare_at_price' => 349.99, 'stock' => 75, 'attributes' => ['Color' => 'Graphite Black', 'Storage' => '128GB']],
                    ['sku' => 'BP5G-BLU-256', 'name' => 'Blue / 256GB', 'price' => 349.99, 'compare_at_price' => null,   'stock' => 40, 'attributes' => ['Color' => 'Ocean Blue', 'Storage' => '256GB']],
                ],
            ],

            // ── AUDIO ─────────────────────────────────────────────────
            [
                'category' => 'audio',
                'name'  => 'SoundPeak ANC Pro',
                'slug'  => 'soundpeak-anc-pro',
                'description' => 'Experience true silence with the SoundPeak ANC Pro. Featuring industry-leading 48dB active noise cancellation, Hi-Res Audio certification, and 40-hour battery life, these are the last headphones you\'ll ever need.',
                'short_description' => 'Best-in-class ANC over-ear headphones.',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                'specifications' => [
                    'Driver'        => '40mm custom dynamic',
                    'ANC'           => '48dB noise cancellation',
                    'Battery'       => '40 hours (ANC on), 60 hours (ANC off)',
                    'Connectivity'  => 'Bluetooth 5.4, multipoint (3 devices)',
                    'Audio'         => 'Hi-Res Audio, LDAC, aptX Adaptive',
                    'Microphones'   => '6-mic array with beamforming',
                ],
                'variants' => [
                    ['sku' => 'SANC-BLK', 'name' => 'Midnight Black', 'price' => 349.99, 'compare_at_price' => 399.99, 'stock' => 60, 'attributes' => ['Color' => 'Midnight Black']],
                    ['sku' => 'SANC-WHT', 'name' => 'Platinum White', 'price' => 349.99, 'compare_at_price' => 399.99, 'stock' => 55, 'attributes' => ['Color' => 'Platinum White']],
                    ['sku' => 'SANC-BRZ', 'name' => 'Champagne Bronze','price'=> 369.99, 'compare_at_price' => null,   'stock' => 3,  'attributes' => ['Color' => 'Champagne Bronze']],
                ],
            ],
            [
                'category' => 'audio',
                'name'  => 'TinyBuds Pro 4',
                'slug'  => 'tinybuds-pro-4',
                'description' => 'TinyBuds Pro 4 redefines what earbuds can do. With a custom 11mm graphene driver, adaptive ANC, personalized sound profiles via AI, and IPX5 water resistance, they\'re perfect for any lifestyle.',
                'short_description' => 'Premium wireless earbuds with AI-personalized sound.',
                'image_url' => 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800',
                'specifications' => [
                    'Driver'        => '11mm graphene dynamic',
                    'ANC'           => 'Adaptive ANC + Transparency mode',
                    'Battery'       => '8h (buds) + 24h (case) = 32h total',
                    'Connectivity'  => 'Bluetooth 5.4, multipoint',
                    'Water rating'  => 'IPX5',
                    'Codec'         => 'AAC, SBC, LDAC',
                ],
                'variants' => [
                    ['sku' => 'TBP4-WHT', 'name' => 'Pearl White',   'price' => 199.99, 'compare_at_price' => 229.99, 'stock' => 90, 'attributes' => ['Color' => 'Pearl White']],
                    ['sku' => 'TBP4-BLK', 'name' => 'Jet Black',     'price' => 199.99, 'compare_at_price' => 229.99, 'stock' => 85, 'attributes' => ['Color' => 'Jet Black']],
                    ['sku' => 'TBP4-LAV', 'name' => 'Lavender Mist', 'price' => 209.99, 'compare_at_price' => null,   'stock' => 4,  'attributes' => ['Color' => 'Lavender Mist']],
                ],
            ],
            [
                'category' => 'audio',
                'name'  => 'BoomBar Portable Speaker',
                'slug'  => 'boombar-portable-speaker',
                'description' => 'Take your music anywhere. BoomBar delivers 360° surround sound with 30W of power, IP67 waterproofing, and up to 20 hours of playtime. Stereo pair two BoomBars for room-filling sound.',
                'short_description' => 'Rugged IP67 waterproof portable speaker, 30W.',
                'image_url' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
                'specifications' => [
                    'Power'         => '30W (2x 15W)',
                    'Battery'       => '20 hours at 50% volume',
                    'Water rating'  => 'IP67 (waterproof + dustproof)',
                    'Connectivity'  => 'Bluetooth 5.3, AUX-in, USB-C',
                    'Weight'        => '780g',
                ],
                'variants' => [
                    ['sku' => 'BBR-BLK', 'name' => 'Stealth Black', 'price' => 129.99, 'compare_at_price' => 149.99, 'stock' => 70, 'attributes' => ['Color' => 'Stealth Black']],
                    ['sku' => 'BBR-GRN', 'name' => 'Olive Green',   'price' => 129.99, 'compare_at_price' => 149.99, 'stock' => 60, 'attributes' => ['Color' => 'Olive Green']],
                    ['sku' => 'BBR-RED', 'name' => 'Canyon Red',    'price' => 139.99, 'compare_at_price' => null,   'stock' => 0,  'attributes' => ['Color' => 'Canyon Red']],
                ],
            ],

            // ── TABLETS ───────────────────────────────────────────────
            [
                'category' => 'tablets',
                'name'  => 'SlateTab Pro 12',
                'slug'  => 'slatetab-pro-12',
                'description' => 'SlateTab Pro 12 blurs the line between tablet and laptop. With its M3 Pro chip, mini-LED display with ProMotion, and optional Magic Keyboard, it\'s a genuine desktop-class computer in tablet form.',
                'short_description' => 'Pro-grade 12" tablet with mini-LED ProMotion display.',
                'image_url' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
                'specifications' => [
                    'Display'   => '12.9" mini-LED, ProMotion 120Hz, 1600nits',
                    'Processor' => 'M3 Pro',
                    'Camera'    => '12MP wide + 10MP ultrawide, LiDAR scanner',
                    'Battery'   => 'Up to 10 hours',
                    'Connectivity' => 'Wi-Fi 6E + optional 5G',
                    'Ports'     => 'Thunderbolt 4, Smart Connector',
                ],
                'variants' => [
                    ['sku' => 'STP12-8-256-WF',  'name' => '8GB / 256GB Wi-Fi',    'price' => 1099.99, 'compare_at_price' => null, 'stock' => 20, 'attributes' => ['RAM' => '8GB', 'Storage' => '256GB', 'Connectivity' => 'Wi-Fi']],
                    ['sku' => 'STP12-16-512-WF', 'name' => '16GB / 512GB Wi-Fi',   'price' => 1399.99, 'compare_at_price' => null, 'stock' => 15, 'attributes' => ['RAM' => '16GB', 'Storage' => '512GB', 'Connectivity' => 'Wi-Fi']],
                    ['sku' => 'STP12-16-512-5G', 'name' => '16GB / 512GB 5G',      'price' => 1599.99, 'compare_at_price' => null, 'stock' => 8,  'attributes' => ['RAM' => '16GB', 'Storage' => '512GB', 'Connectivity' => '5G']],
                ],
            ],
            [
                'category' => 'tablets',
                'name'  => 'DrawTab Artist Edition',
                'slug'  => 'drawtab-artist-edition',
                'description' => 'Designed from the ground up for digital artists. The DrawTab features a 13.3" 2.8K OLED display with 99% DCI-P3 color accuracy, 4096 levels of pressure sensitivity with the included stylus, and fanless silent operation.',
                'short_description' => 'OLED drawing tablet for professional digital artists.',
                'image_url' => 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800',
                'specifications' => [
                    'Display'         => '13.3" 2.8K OLED, 120Hz, 99% DCI-P3',
                    'Processor'       => 'Snapdragon 8 Gen 3',
                    'Stylus'          => 'Included, 4096 pressure levels, 0ms latency',
                    'Battery'         => '10200mAh, 45W fast charge',
                    'Connectivity'    => 'Wi-Fi 6E, Bluetooth 5.3, USB-C',
                ],
                'variants' => [
                    ['sku' => 'DTA-8-256',  'name' => '8GB / 256GB',  'price' => 649.99, 'compare_at_price' => 749.99, 'stock' => 25, 'attributes' => ['RAM' => '8GB', 'Storage' => '256GB']],
                    ['sku' => 'DTA-12-512', 'name' => '12GB / 512GB', 'price' => 849.99, 'compare_at_price' => null,   'stock' => 12, 'attributes' => ['RAM' => '12GB', 'Storage' => '512GB']],
                ],
            ],

            // ── GAMING ────────────────────────────────────────────────
            [
                'category' => 'gaming',
                'name'  => 'ProPad Elite Controller',
                'slug'  => 'propad-elite-controller',
                'description' => 'The ProPad Elite is engineered for competitive play. Featuring Hall Effect joysticks for zero stick drift, programmable rear paddles, adjustable trigger stops, and a textured rubberized grip, every detail is optimized for winning.',
                'short_description' => 'Hall Effect wireless controller for PC & consoles.',
                'image_url' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
                'specifications' => [
                    'Connectivity'  => 'Wireless 2.4GHz + Bluetooth 5.2 + USB-C wired',
                    'Battery'       => '40 hours per charge',
                    'Sticks'        => 'Hall Effect magnetic sensors (no drift)',
                    'Triggers'      => 'Adjustable dual-zone with hair trigger locks',
                    'Paddles'       => '4x mappable rear paddles',
                    'Compatibility' => 'PC, PS5, Xbox, Switch, Android, iOS',
                ],
                'variants' => [
                    ['sku' => 'PPE-BLK', 'name' => 'Phantom Black', 'price' => 89.99, 'compare_at_price' => 109.99, 'stock' => 100, 'attributes' => ['Color' => 'Phantom Black']],
                    ['sku' => 'PPE-WHT', 'name' => 'Arctic White',  'price' => 89.99, 'compare_at_price' => 109.99, 'stock' => 80,  'attributes' => ['Color' => 'Arctic White']],
                    ['sku' => 'PPE-RED', 'name' => 'Crimson Red',   'price' => 94.99, 'compare_at_price' => null,   'stock' => 3,   'attributes' => ['Color' => 'Crimson Red']],
                ],
            ],
            [
                'category' => 'gaming',
                'name'  => 'HyperArc 7.1 Gaming Headset',
                'slug'  => 'hyperarc-71-gaming-headset',
                'description' => 'Hear every footstep. The HyperArc 7.1 delivers positional 3D audio powered by proprietary spatial algorithms, with 53mm neodymium drivers, a detachable noise-cancelling boom mic, and RGB lighting.',
                'short_description' => '7.1 surround sound gaming headset with RGB.',
                'image_url' => 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=800',
                'specifications' => [
                    'Driver'        => '53mm neodymium',
                    'Audio'         => 'Virtual 7.1 surround sound',
                    'Microphone'    => 'Detachable cardioid, noise-cancelling',
                    'Connectivity'  => 'USB-A + 3.5mm combo',
                    'Battery'       => '25h wireless (Bluetooth model)',
                    'RGB'           => 'Per-zone RGB lighting',
                ],
                'variants' => [
                    ['sku' => 'HA71-USB-BLK', 'name' => 'USB / Black',         'price' => 79.99,  'compare_at_price' => 99.99, 'stock' => 60, 'attributes' => ['Connection' => 'USB-A', 'Color' => 'Black']],
                    ['sku' => 'HA71-BT-BLK',  'name' => 'Wireless / Black',    'price' => 119.99, 'compare_at_price' => null,  'stock' => 40, 'attributes' => ['Connection' => 'Wireless', 'Color' => 'Black']],
                    ['sku' => 'HA71-BT-WHT',  'name' => 'Wireless / White',    'price' => 119.99, 'compare_at_price' => null,  'stock' => 4,  'attributes' => ['Connection' => 'Wireless', 'Color' => 'White']],
                ],
            ],

            // ── ACCESSORIES ───────────────────────────────────────────
            [
                'category' => 'accessories',
                'name'  => 'MagCharge 3-in-1 Dock',
                'slug'  => 'magcharge-3in1-dock',
                'description' => 'Charge your entire ecosystem from a single sleek puck. The MagCharge 3-in-1 simultaneously wirelessly charges your phone (15W), earbuds (5W), and smartwatch (5W), with a foldable design for travel.',
                'short_description' => 'Foldable 3-in-1 wireless charging dock.',
                'image_url' => 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
                'specifications' => [
                    'Output'        => '15W phone + 5W earbuds + 5W watch',
                    'Compatibility' => 'Qi2 & MagSafe compatible',
                    'Design'        => 'Foldable, travel-friendly',
                    'Input'         => 'USB-C 45W PD (adapter included)',
                ],
                'variants' => [
                    ['sku' => 'MC3-1-WHT', 'name' => 'White',  'price' => 69.99, 'compare_at_price' => 89.99, 'stock' => 100, 'attributes' => ['Color' => 'White']],
                    ['sku' => 'MC3-1-BLK', 'name' => 'Black',  'price' => 69.99, 'compare_at_price' => 89.99, 'stock' => 90,  'attributes' => ['Color' => 'Black']],
                ],
            ],
            [
                'category' => 'accessories',
                'name'  => 'UltraHub Pro 12-in-1',
                'slug'  => 'ultrahub-pro-12in1',
                'description' => 'Expand your laptop with 12 ports from a single USB-C connection. Includes dual 4K HDMI, 100W PD pass-through, 10Gbps USB-A, SD/microSD slots, Gigabit Ethernet, and a 3.5mm audio jack.',
                'short_description' => 'USB-C hub with 12 ports including dual 4K HDMI.',
                'image_url' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'specifications' => [
                    'Ports'         => '2x HDMI 4K60Hz, 3x USB-A 10Gbps, 2x USB-C, SD, microSD, RJ45, 3.5mm',
                    'Power'         => '100W PD pass-through',
                    'Connection'    => 'USB-C (Thunderbolt 4 compatible)',
                    'Compatibility' => 'Windows, macOS, ChromeOS',
                ],
                'variants' => [
                    ['sku' => 'UHP12-SLV', 'name' => 'Space Silver', 'price' => 79.99, 'compare_at_price' => 99.99, 'stock' => 75, 'attributes' => ['Color' => 'Space Silver']],
                    ['sku' => 'UHP12-GRY', 'name' => 'Slate Gray',   'price' => 79.99, 'compare_at_price' => 99.99, 'stock' => 65, 'attributes' => ['Color' => 'Slate Gray']],
                ],
            ],
        ];

        foreach ($products as $productData) {
            $variantsData = $productData['variants'];
            $catSlug      = $productData['category'];
            unset($productData['variants'], $productData['category']);

            $product = Product::firstOrCreate(['slug' => $productData['slug']], array_merge($productData, [
                'id'          => Str::uuid(),
                'category_id' => $categories[$catSlug]->id,
                'is_active'   => true,
            ]));

            foreach ($variantsData as $variantData) {
                ProductVariant::firstOrCreate(['sku' => $variantData['sku']], array_merge($variantData, [
                    'id'         => Str::uuid(),
                    'product_id' => $product->id,
                    'is_active'  => true,
                    'low_stock_threshold' => 5,
                ]));
            }
        }

        $this->command->info('✅ Seeded: 4 fidelity tiers, 6 categories, ' . count($products) . ' products with variants.');
    }
}
