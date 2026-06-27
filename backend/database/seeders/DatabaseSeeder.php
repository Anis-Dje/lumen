<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Fidelity Tiers ────────────────────────────────────────────────────
        DB::table('fidelity_tiers')->upsert([
            ['id' => '11111111-0000-0000-0000-000000000001', 'name' => 'Bronze', 'slug' => 'bronze', 'min_lifetime_spend' => 0.00,    'points_multiplier' => 1.00, 'perks' => '["Free shipping on orders over $50","Early access to sales"]',           'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '11111111-0000-0000-0000-000000000002', 'name' => 'Silver', 'slug' => 'silver', 'min_lifetime_spend' => 500.00,  'points_multiplier' => 1.25, 'perks' => '["Free shipping on all orders","5% bonus points","Priority support"]',    'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '11111111-0000-0000-0000-000000000003', 'name' => 'Gold',   'slug' => 'gold',   'min_lifetime_spend' => 2000.00, 'points_multiplier' => 1.50, 'perks' => '["Free express shipping","10% bonus points","Dedicated account manager"]', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ], ['id'], ['name', 'slug', 'min_lifetime_spend', 'points_multiplier', 'perks', 'sort_order', 'updated_at']);

        // ── Categories ────────────────────────────────────────────────────────
        DB::table('categories')->upsert([
            ['id' => '22222222-0000-0000-0000-000000000001', 'parent_id' => null, 'name' => 'Laptops',     'slug' => 'laptops',     'description' => 'Powerful laptops for work and play',        'is_active' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '22222222-0000-0000-0000-000000000002', 'parent_id' => null, 'name' => 'Smartphones', 'slug' => 'smartphones', 'description' => 'Latest flagship and mid-range smartphones', 'is_active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '22222222-0000-0000-0000-000000000003', 'parent_id' => null, 'name' => 'Audio',       'slug' => 'audio',       'description' => 'Headphones, earbuds, and speakers',         'is_active' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '22222222-0000-0000-0000-000000000004', 'parent_id' => null, 'name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Cables, chargers, cases, and more',         'is_active' => true, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '22222222-0000-0000-0000-000000000005', 'parent_id' => null, 'name' => 'Tablets',     'slug' => 'tablets',     'description' => 'iPads, Android tablets, and e-readers',     'is_active' => true, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['id' => '22222222-0000-0000-0000-000000000006', 'parent_id' => null, 'name' => 'Monitors',    'slug' => 'monitors',    'description' => '4K, ultrawide, and gaming displays',         'is_active' => true, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
        ], ['id'], ['name', 'slug', 'description', 'is_active', 'sort_order', 'updated_at']);

        // ── Admin User ────────────────────────────────────────────────────────
        DB::table('users')->upsert([
            [
                'id'                => (string) Str::uuid(),
                'name'              => 'Admin',
                'email'             => 'admin@techvault.com',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ], ['email'], ['name', 'role', 'password', 'updated_at']);

        // ── Products ──────────────────────────────────────────────────────────
        $products = [
            // Laptops
            ['id' => '33000001-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000001', 'name' => 'MacBook Pro 14"',           'slug' => 'macbook-pro-14',           'desc' => 'The MacBook Pro 14" with Apple M3 Pro chip delivers exceptional performance for professionals. Featuring a stunning Liquid Retina XDR display, up to 22 hours of battery life, and the fastest Mac chip ever.',         'short' => 'Pro-level performance in a compact 14" form factor.',       'specs' => '{"chip":"Apple M3 Pro","ram":"18GB","storage":"512GB SSD","display":"14.2\" Liquid Retina XDR","battery":"22 hours","weight":"1.61 kg"}',                                                 'img' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
            ['id' => '33000001-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000001', 'name' => 'MacBook Air 15"',           'slug' => 'macbook-air-15',           'desc' => 'The MacBook Air 15" with M3 chip offers all-day battery life in the thinnest and lightest 15" laptop ever made. Perfect for students and everyday professionals.',                                                  'short' => 'Incredibly thin, surprisingly powerful.',                    'specs' => '{"chip":"Apple M3","ram":"8GB","storage":"256GB SSD","display":"15.3\" Liquid Retina","battery":"18 hours","weight":"1.51 kg"}',                                                           'img' => 'https://images.unsplash.com/photo-1611186871525-b4bde5c31abe?w=600'],
            ['id' => '33000001-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000001', 'name' => 'Dell XPS 15',               'slug' => 'dell-xps-15',              'desc' => 'The Dell XPS 15 combines a stunning OLED display with Intel Core Ultra performance and NVIDIA discrete graphics in a premium aluminium chassis.',                                                                    'short' => 'Premium Windows laptop with OLED excellence.',               'specs' => '{"cpu":"Intel Core Ultra 7 155H","gpu":"NVIDIA RTX 4060","ram":"16GB","storage":"512GB NVMe","display":"15.6\" OLED 3.5K","battery":"13 hours"}',                                          'img' => 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],
            ['id' => '33000001-0000-0000-0000-000000000004', 'cat' => '22222222-0000-0000-0000-000000000001', 'name' => 'Lenovo ThinkPad X1 Carbon', 'slug' => 'lenovo-thinkpad-x1-carbon','desc' => 'The legendary ThinkPad X1 Carbon Gen 12 is the ultimate business laptop — MIL-SPEC durable, under 1.1 kg, and packed with enterprise security features.',                                                           'short' => 'The ultimate ultra-light business laptop.',                  'specs' => '{"cpu":"Intel Core Ultra 5 125U","ram":"16GB LPDDR5","storage":"512GB SSD","display":"14\" 2.8K OLED","battery":"15 hours","weight":"1.09 kg"}',                                          'img' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600'],
            ['id' => '33000001-0000-0000-0000-000000000005', 'cat' => '22222222-0000-0000-0000-000000000001', 'name' => 'ASUS ROG Zephyrus G16',     'slug' => 'asus-rog-zephyrus-g16',   'desc' => 'Dominate every game with the ROG Zephyrus G16, featuring AMD Ryzen 9 and NVIDIA RTX 4080 in a surprisingly thin 16" chassis. With a 240Hz QHD display, every frame matters.',                                    'short' => 'Slim gaming powerhouse with RTX 4080.',                     'specs' => '{"cpu":"AMD Ryzen 9 8945HS","gpu":"NVIDIA RTX 4080","ram":"16GB DDR5","storage":"1TB NVMe","display":"16\" QHD 240Hz","battery":"10 hours"}',                                              'img' => 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=600'],
            // Smartphones
            ['id' => '33000002-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000002', 'name' => 'iPhone 15 Pro',              'slug' => 'iphone-15-pro',            'desc' => 'iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',                                                 'short' => 'Titanium. A17 Pro. Pro camera system.',                     'specs' => '{"chip":"A17 Pro","display":"6.1\" Super Retina XDR ProMotion","camera":"48MP main + 12MP ultra-wide + 12MP 3x telephoto","battery":"23h video","os":"iOS 17"}',                           'img' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'],
            ['id' => '33000002-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000002', 'name' => 'Samsung Galaxy S24 Ultra',   'slug' => 'samsung-galaxy-s24-ultra', 'desc' => 'The Galaxy S24 Ultra redefines the smartphone with its titanium frame, built-in S Pen, 200MP camera, and Galaxy AI features.',                                                                                    'short' => '200MP camera, S Pen, Galaxy AI.',                           'specs' => '{"chip":"Snapdragon 8 Gen 3","display":"6.8\" Dynamic AMOLED 2X 120Hz","camera":"200MP main + 12MP ultra-wide + 10MP 3x + 50MP 5x","battery":"5000mAh 45W","os":"Android 14"}',           'img' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
            ['id' => '33000002-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000002', 'name' => 'Google Pixel 8 Pro',         'slug' => 'google-pixel-8-pro',       'desc' => 'The Pixel 8 Pro features Google Tensor G3, the most advanced imaging system on a Pixel, and exclusive Google AI features including 7 years of OS updates.',                                                     'short' => 'Google AI, pure Android, stunning cameras.',                'specs' => '{"chip":"Google Tensor G3","display":"6.7\" LTPO OLED 1-120Hz","camera":"50MP main + 48MP ultra-wide + 48MP 5x telephoto","battery":"5050mAh 30W","os":"Android 14"}',                   'img' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'],
            ['id' => '33000002-0000-0000-0000-000000000004', 'cat' => '22222222-0000-0000-0000-000000000002', 'name' => 'OnePlus 12',                 'slug' => 'oneplus-12',               'desc' => 'The OnePlus 12 brings Snapdragon 8 Gen 3, a Hasselblad-tuned 50MP camera system, and the fastest 100W SUPERVOOC charging to a flagship that punches far above its price.',                                    'short' => 'Flagship killer with 100W fast charging.',                  'specs' => '{"chip":"Snapdragon 8 Gen 3","display":"6.82\" LTPO AMOLED 120Hz","camera":"50MP Hasselblad + 48MP ultra-wide + 64MP 3x telephoto","battery":"5400mAh 100W","os":"OxygenOS 14"}',        'img' => 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600'],
            ['id' => '33000002-0000-0000-0000-000000000005', 'cat' => '22222222-0000-0000-0000-000000000002', 'name' => 'Nothing Phone (2a)',          'slug' => 'nothing-phone-2a',         'desc' => 'The Nothing Phone (2a) brings the iconic Glyph Interface to a mid-range price point, with a clean design, smooth 120Hz display, and a surprisingly capable 50MP dual camera system.',                            'short' => 'Iconic Glyph design meets mid-range value.',                 'specs' => '{"chip":"MediaTek Dimensity 7200 Pro","display":"6.7\" AMOLED 120Hz","camera":"50MP main + 50MP ultra-wide","battery":"5000mAh 45W","os":"Nothing OS 2.5"}',                              'img' => 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600'],
            // Audio
            ['id' => '33000003-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000003', 'name' => 'Sony WH-1000XM5',            'slug' => 'sony-wh-1000xm5',          'desc' => 'The WH-1000XM5 headphones feature industry-leading noise cancelling with two processors controlling eight microphones, crystal clear hands-free calling and up to 30 hours of battery life.',                    'short' => 'Industry-leading ANC, 30hr battery.',                       'specs' => '{"type":"Over-ear","driver":"30mm","anc":"8 microphones, 2 processors","battery":"30 hours","charging":"USB-C 3.5hr","weight":"250g"}',                                                    'img' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
            ['id' => '33000003-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000003', 'name' => 'AirPods Pro (2nd Generation)','slug' => 'airpods-pro-2',            'desc' => 'AirPods Pro feature up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalised Spatial Audio with head tracking.',                                                            'short' => 'Next-level ANC with Adaptive Audio.',                       'specs' => '{"type":"In-ear","chip":"H2","anc":"Active Noise Cancellation + Transparency","battery":"6hrs (30hrs with case)","charging":"USB-C / MagSafe","ipx":"IPX4"}',                             'img' => 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'],
            ['id' => '33000003-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000003', 'name' => 'Bose QuietComfort Ultra',     'slug' => 'bose-qc-ultra',            'desc' => 'The Bose QC Ultra deliver the world\'s best ANC headphones experience with Immersive Audio, Custom Tune personalisation, and unmatched comfort for all-day wear.',                                              'short' => 'World-class ANC with Immersive Audio.',                     'specs' => '{"type":"Over-ear","anc":"CustomTune ANC","battery":"24 hours","charging":"USB-C 2.5hr fast charge","weight":"248g","codec":"aptX Adaptive"}',                                             'img' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'],
            ['id' => '33000003-0000-0000-0000-000000000004', 'cat' => '22222222-0000-0000-0000-000000000003', 'name' => 'Sony WF-1000XM5 Earbuds',    'slug' => 'sony-wf-1000xm5',          'desc' => 'Sony\'s flagship earbuds with the world\'s smallest and lightest ANC earbuds design, featuring the Integrated Processor V2 for superior noise cancellation and LDAC Hi-Res Audio Wireless.',                   'short' => 'World\'s smallest ANC earbuds with Hi-Res Audio.',           'specs' => '{"type":"In-ear","driver":"8.4mm","anc":"Integrated Processor V2","battery":"8hrs (24hrs with case)","charging":"USB-C / Wireless Qi","ipx":"IPX4"}',                                     'img' => 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600'],
            ['id' => '33000003-0000-0000-0000-000000000005', 'cat' => '22222222-0000-0000-0000-000000000003', 'name' => 'JBL Charge 5 Portable Speaker','slug' => 'jbl-charge-5',            'desc' => 'The JBL Charge 5 delivers powerful JBL Pro Sound, a massive 7500 mAh battery that charges your devices, 20 hours of playtime, and complete waterproofing for outdoor adventures.',                              'short' => 'Powerful sound + power bank in one.',                       'specs' => '{"output":"30W RMS","battery":"7500mAh / 20 hours","charging":"USB-C","ipx":"IP67","connection":"Bluetooth 5.1","weight":"960g"}',                                                          'img' => 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
            // Accessories
            ['id' => '33000004-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000004', 'name' => 'Logitech MX Master 3S',       'slug' => 'logitech-mx-master-3s',    'desc' => 'The MX Master 3S is the master of mice — featuring an 8000 DPI sensor that works on glass, whisper-quiet clicks, the MagSpeed electromagnetic scroll wheel, and app-specific customisation.',                   'short' => 'The master of mice. Whisper-quiet. Any surface.',           'specs' => '{"dpi":"200-8000 DPI","buttons":"7 customisable","battery":"USB-C / 70 days","connectivity":"Bluetooth / USB receiver","weight":"141g","compatibility":"Windows, Mac, Linux"}',             'img' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600'],
            ['id' => '33000004-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000004', 'name' => 'Belkin MagSafe 3-in-1',       'slug' => 'belkin-magsafe-3-in-1',    'desc' => 'Charge your iPhone, Apple Watch, and AirPods simultaneously. Delivers 15W fast charging for iPhone 12 and later.',                                                                                               'short' => 'Charge iPhone, Watch, and AirPods at once.',                'specs' => '{"output":"15W MagSafe, 5W Qi","compatibility":"iPhone 12+, Apple Watch, AirPods","connector":"USB-C power supply included"}',                                                               'img' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
            ['id' => '33000004-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000004', 'name' => 'Anker 737 GaN Charger (120W)','slug' => 'anker-737-gan-charger',    'desc' => 'The Anker 737 GaN Charger packs 120W into a compact body using GaN II technology — with 2 USB-C and 1 USB-A port, it can fast-charge your MacBook, iPhone, and earbuds simultaneously.',                       'short' => '120W GaN power. Charge 3 devices at once.',                 'specs' => '{"output":"120W total (USB-C: 100W+20W, USB-A: 12W)","technology":"GaN II","ports":"2x USB-C, 1x USB-A","compatibility":"MacBook, iPhone, Android, iPad"}',                               'img' => 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'],
            ['id' => '33000004-0000-0000-0000-000000000004', 'cat' => '22222222-0000-0000-0000-000000000004', 'name' => 'Keychron K2 Pro',             'slug' => 'keychron-k2-pro',          'desc' => 'The Keychron K2 Pro is a compact 75% layout hot-swappable mechanical keyboard with Bluetooth 5.1, white backlight, and QMK/VIA support for full programmability.',                                              'short' => 'Hot-swappable, QMK/VIA, Bluetooth 5.1.',                   'specs' => '{"layout":"75% (84 keys)","switch":"Hot-swappable","backlight":"White LED","connectivity":"Bluetooth 5.1 / USB-C","battery":"4000mAh","compatibility":"Mac / Windows"}',                   'img' => 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600'],
            // Tablets
            ['id' => '33000005-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000005', 'name' => 'iPad Pro 11" (M4)',           'slug' => 'ipad-pro-11-m4',           'desc' => 'The new iPad Pro 11" is impossibly thin at just 5.3mm — the thinnest Apple product ever — with the M4 chip, a stunning Ultra Retina XDR OLED display, and Apple Pencil Pro support.',                          'short' => 'Thinnest Apple product ever. M4 power.',                   'specs' => '{"chip":"Apple M4","display":"11\" Ultra Retina XDR OLED","camera":"12MP wide + 10MP ultra-wide","battery":"10 hours","connector":"USB-C Thunderbolt 4"}',                                  'img' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
            ['id' => '33000005-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000005', 'name' => 'Samsung Galaxy Tab S9+',      'slug' => 'samsung-galaxy-tab-s9-plus','desc' => 'The Galaxy Tab S9+ features a stunning 12.4" Dynamic AMOLED 2X display, Snapdragon 8 Gen 2, an included S Pen, and IP68 water resistance.',                                                                   'short' => 'Premium Android tablet with S Pen included.',               'specs' => '{"chip":"Snapdragon 8 Gen 2","display":"12.4\" Dynamic AMOLED 2X 120Hz","camera":"13MP + 8MP","battery":"10090mAh 45W","ipx":"IP68","spen":"Included"}',                                   'img' => 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600'],
            ['id' => '33000005-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000005', 'name' => 'Kindle Paperwhite (11th Gen)', 'slug' => 'kindle-paperwhite-11',    'desc' => 'The all-new Kindle Paperwhite features a 6.8" 300 ppi glare-free display, adjustable warm light, up to 10 weeks of battery life, and IPX8 water resistance.',                                                 'short' => '10 weeks battery, IPX8 water resistance.',                  'specs' => '{"display":"6.8\" 300ppi e-ink","storage":"8GB","battery":"10 weeks","ipx":"IPX8","light":"Adjustable warm/cool front light","charging":"USB-C"}',                                         'img' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'],
            // Monitors
            ['id' => '33000006-0000-0000-0000-000000000001', 'cat' => '22222222-0000-0000-0000-000000000006', 'name' => 'LG UltraFine 5K Display',     'slug' => 'lg-ultrafine-5k',          'desc' => 'The LG UltraFine 5K display is designed for Mac with a stunning 5120×2880 P3 wide color display, Thunderbolt 3 with 96W charging, and built-in camera and speakers.',                                          'short' => '5K resolution, made for Mac.',                              'specs' => '{"resolution":"5120x2880 5K","panel":"IPS","coverage":"99% DCI-P3","connector":"Thunderbolt 3","charging":"96W","size":"27\"","refresh":"60Hz"}',                                           'img' => 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600'],
            ['id' => '33000006-0000-0000-0000-000000000002', 'cat' => '22222222-0000-0000-0000-000000000006', 'name' => 'Samsung Odyssey OLED G9',      'slug' => 'samsung-odyssey-oled-g9',  'desc' => 'The Odyssey OLED G9 is a 49" dual QHD curved ultrawide gaming monitor with a blazing 240Hz refresh rate, 0.03ms response time, and vivid OLED colours.',                                                    'short' => '49" ultrawide OLED. 240Hz. Ultimate gaming.',               'specs' => '{"resolution":"5120x1440 DQHD","panel":"QD-OLED","size":"49\"","refresh":"240Hz","response":"0.03ms","curve":"1800R","connector":"DisplayPort 1.4, HDMI 2.1"}',                             'img' => 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600'],
            ['id' => '33000006-0000-0000-0000-000000000003', 'cat' => '22222222-0000-0000-0000-000000000006', 'name' => 'Dell UltraSharp 27" 4K',      'slug' => 'dell-ultrasharp-27-4k',    'desc' => 'The Dell UltraSharp U2723QE delivers stunning 4K IPS Black technology for deeper blacks, covers 100% sRGB and 98% DCI-P3, and powers your laptop with a single 90W USB-C cable.',                              'short' => 'IPS Black 4K with 90W USB-C delivery.',                    'specs' => '{"resolution":"3840x2160 4K","panel":"IPS Black","size":"27\"","coverage":"100% sRGB, 98% DCI-P3","connector":"USB-C 90W, HDMI 2.0, DP 1.4","refresh":"60Hz"}',                           'img' => 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600'],
        ];

        foreach ($products as $p) {
            DB::table('products')->upsert([[
                'id'                => $p['id'],
                'category_id'       => $p['cat'],
                'name'              => $p['name'],
                'slug'              => $p['slug'],
                'description'       => $p['desc'],
                'short_description' => $p['short'],
                'specifications'    => $p['specs'],
                'image_url'         => $p['img'],
                'is_active'         => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]], ['id'], ['name', 'slug', 'description', 'short_description', 'specifications', 'image_url', 'is_active', 'updated_at']);
        }

        // ── Product Variants ──────────────────────────────────────────────────
        $variants = [
            // MacBook Pro 14
            ['44000001-0000-0000-0000-000000000001','33000001-0000-0000-0000-000000000001','MBP14-18-512','18GB / 512GB','{"ram":"18GB","storage":"512GB"}',1999.00,2199.00,15,3],
            ['44000001-0000-0000-0000-000000000002','33000001-0000-0000-0000-000000000001','MBP14-36-1TB','36GB / 1TB',  '{"ram":"36GB","storage":"1TB"}', 2499.00,2699.00, 8,3],
            // MacBook Air 15
            ['44000002-0000-0000-0000-000000000001','33000001-0000-0000-0000-000000000002','MBA15-8-256', '8GB / 256GB', '{"ram":"8GB","storage":"256GB"}', 1299.00,1399.00,20,4],
            ['44000002-0000-0000-0000-000000000002','33000001-0000-0000-0000-000000000002','MBA15-16-512','16GB / 512GB','{"ram":"16GB","storage":"512GB"}',1499.00,1599.00,12,4],
            // Dell XPS 15
            ['44000003-0000-0000-0000-000000000001','33000001-0000-0000-0000-000000000003','XPS15-16-512','16GB / 512GB','{"ram":"16GB","storage":"512GB"}',1799.00,1999.00,10,3],
            ['44000003-0000-0000-0000-000000000002','33000001-0000-0000-0000-000000000003','XPS15-32-1TB','32GB / 1TB',  '{"ram":"32GB","storage":"1TB"}', 2299.00,2499.00, 6,3],
            // ThinkPad X1
            ['44000004-0000-0000-0000-000000000001','33000001-0000-0000-0000-000000000004','X1C-16-512','16GB / 512GB','{"ram":"16GB","storage":"512GB"}',1549.00,1699.00,14,3],
            ['44000004-0000-0000-0000-000000000002','33000001-0000-0000-0000-000000000004','X1C-32-1TB', '32GB / 1TB', '{"ram":"32GB","storage":"1TB"}', 1899.00,2099.00, 7,3],
            // ROG Zephyrus
            ['44000005-0000-0000-0000-000000000001','33000001-0000-0000-0000-000000000005','ROG-G16-16-1TB','16GB / 1TB','{"ram":"16GB","storage":"1TB"}',2199.00,2399.00,9,3],
            ['44000005-0000-0000-0000-000000000002','33000001-0000-0000-0000-000000000005','ROG-G16-32-2TB','32GB / 2TB','{"ram":"32GB","storage":"2TB"}',2699.00,2899.00,4,2],
            // iPhone 15 Pro
            ['44000006-0000-0000-0000-000000000001','33000002-0000-0000-0000-000000000001','IP15P-128','128GB','{"storage":"128GB","color":"Natural Titanium"}', 999.00,1099.00,25,5],
            ['44000006-0000-0000-0000-000000000002','33000002-0000-0000-0000-000000000001','IP15P-256','256GB','{"storage":"256GB","color":"Natural Titanium"}',1099.00,1199.00,18,5],
            ['44000006-0000-0000-0000-000000000003','33000002-0000-0000-0000-000000000001','IP15P-512','512GB','{"storage":"512GB","color":"Natural Titanium"}',1299.00,1399.00,10,3],
            // S24 Ultra
            ['44000007-0000-0000-0000-000000000001','33000002-0000-0000-0000-000000000002','S24U-256','256GB','{"storage":"256GB","color":"Titanium Black"}',1199.00,1299.00,20,4],
            ['44000007-0000-0000-0000-000000000002','33000002-0000-0000-0000-000000000002','S24U-512','512GB','{"storage":"512GB","color":"Titanium Black"}',1399.00,1499.00,12,4],
            // Pixel 8 Pro
            ['44000008-0000-0000-0000-000000000001','33000002-0000-0000-0000-000000000003','P8P-128','128GB','{"storage":"128GB","color":"Obsidian"}', 999.00,1099.00,22,4],
            ['44000008-0000-0000-0000-000000000002','33000002-0000-0000-0000-000000000003','P8P-256','256GB','{"storage":"256GB","color":"Obsidian"}',1099.00,1199.00,14,4],
            // OnePlus 12
            ['44000009-0000-0000-0000-000000000001','33000002-0000-0000-0000-000000000004','OP12-256','256GB / 12GB RAM','{"storage":"256GB","ram":"12GB","color":"Silky Black"}',799.00,899.00,30,5],
            ['44000009-0000-0000-0000-000000000002','33000002-0000-0000-0000-000000000004','OP12-512','512GB / 16GB RAM','{"storage":"512GB","ram":"16GB","color":"Silky Black"}',899.00,999.00,18,5],
            // Nothing Phone
            ['44000010-0000-0000-0000-000000000001','33000002-0000-0000-0000-000000000005','NPH2A-128','128GB','{"storage":"128GB","color":"Black"}',349.00,399.00,40,6],
            ['44000010-0000-0000-0000-000000000002','33000002-0000-0000-0000-000000000005','NPH2A-256','256GB','{"storage":"256GB","color":"Black"}',399.00,449.00,25,5],
            // Sony XM5
            ['44000011-0000-0000-0000-000000000001','33000003-0000-0000-0000-000000000001','XM5-BLK','Black', '{"color":"Black"}', 349.00,399.00,30,5],
            ['44000011-0000-0000-0000-000000000002','33000003-0000-0000-0000-000000000001','XM5-SLV','Silver','{"color":"Silver"}',349.00,399.00,20,5],
            // AirPods Pro 2
            ['44000012-0000-0000-0000-000000000001','33000003-0000-0000-0000-000000000002','APP2-USB','USB-C','{"connector":"USB-C"}',249.00,279.00,35,5],
            // Bose QC Ultra
            ['44000013-0000-0000-0000-000000000001','33000003-0000-0000-0000-000000000003','BQCU-BLK','Black','{"color":"Black"}',379.00,429.00,18,4],
            ['44000013-0000-0000-0000-000000000002','33000003-0000-0000-0000-000000000003','BQCU-WHT','White','{"color":"White"}',379.00,429.00,15,4],
            // Sony WF-1000XM5
            ['44000014-0000-0000-0000-000000000001','33000003-0000-0000-0000-000000000004','WF5-BLK','Black', '{"color":"Black"}', 299.00,349.00,22,4],
            ['44000014-0000-0000-0000-000000000002','33000003-0000-0000-0000-000000000004','WF5-SLV','Silver','{"color":"Silver"}',299.00,349.00,16,4],
            // JBL Charge 5
            ['44000015-0000-0000-0000-000000000001','33000003-0000-0000-0000-000000000005','JBL5-BLK','Black','{"color":"Black"}',179.00,199.00,28,5],
            ['44000015-0000-0000-0000-000000000002','33000003-0000-0000-0000-000000000005','JBL5-BLU','Blue', '{"color":"Blue"}', 179.00,199.00,22,5],
            ['44000015-0000-0000-0000-000000000003','33000003-0000-0000-0000-000000000005','JBL5-RED','Red',  '{"color":"Red"}',  179.00,199.00,18,5],
            // MX Master 3S
            ['44000022-0000-0000-0000-000000000001','33000004-0000-0000-0000-000000000001','MXM3S-GRY','Graphite','{"color":"Graphite"}',99.00,119.00,35,6],
            ['44000022-0000-0000-0000-000000000002','33000004-0000-0000-0000-000000000001','MXM3S-BLK','Black',   '{"color":"Black"}',  99.00,119.00,30,6],
            // Belkin MagSafe
            ['44000023-0000-0000-0000-000000000001','33000004-0000-0000-0000-000000000002','BELK-3IN1-WHT','White','{"color":"White"}',149.00,169.00,25,4],
            // Anker 737
            ['44000024-0000-0000-0000-000000000001','33000004-0000-0000-0000-000000000003','ANK737-120W','120W','{"wattage":"120W"}',75.00,89.00,45,8],
            // Keychron K2 Pro
            ['44000025-0000-0000-0000-000000000001','33000004-0000-0000-0000-000000000004','K2PRO-RED',  'Red Switch (Linear)',   '{"switch":"Gateron Red","layout":"75%"}',  89.00,99.00,30,5],
            ['44000025-0000-0000-0000-000000000002','33000004-0000-0000-0000-000000000004','K2PRO-BROWN','Brown Switch (Tactile)','{"switch":"Gateron Brown","layout":"75%"}', 89.00,99.00,25,5],
            ['44000025-0000-0000-0000-000000000003','33000004-0000-0000-0000-000000000004','K2PRO-BLUE', 'Blue Switch (Clicky)',  '{"switch":"Gateron Blue","layout":"75%"}',  89.00,99.00,20,5],
            // iPad Pro 11 M4
            ['44000016-0000-0000-0000-000000000001','33000005-0000-0000-0000-000000000001','IPPM4-256-WIFI','256GB Wi-Fi',    '{"storage":"256GB","connectivity":"Wi-Fi"}',   999.00,1099.00,15,3],
            ['44000016-0000-0000-0000-000000000002','33000005-0000-0000-0000-000000000001','IPPM4-512-WIFI','512GB Wi-Fi',    '{"storage":"512GB","connectivity":"Wi-Fi"}',  1199.00,1299.00,10,3],
            ['44000016-0000-0000-0000-000000000003','33000005-0000-0000-0000-000000000001','IPPM4-256-CELL','256GB Cellular', '{"storage":"256GB","connectivity":"Cellular"}',1199.00,1299.00, 8,2],
            // Galaxy Tab S9+
            ['44000017-0000-0000-0000-000000000001','33000005-0000-0000-0000-000000000002','TABS9P-256','256GB / 12GB','{"storage":"256GB","ram":"12GB","color":"Graphite"}', 999.00,1099.00,20,4],
            ['44000017-0000-0000-0000-000000000002','33000005-0000-0000-0000-000000000002','TABS9P-512','512GB / 12GB','{"storage":"512GB","ram":"12GB","color":"Graphite"}',1099.00,1199.00,12,3],
            // Kindle Paperwhite
            ['44000018-0000-0000-0000-000000000001','33000005-0000-0000-0000-000000000003','KPW-8-WIFI', '8GB Wi-Fi', '{"storage":"8GB","connectivity":"Wi-Fi"}',  139.00,159.00,50,8],
            ['44000018-0000-0000-0000-000000000002','33000005-0000-0000-0000-000000000003','KPW-32-WIFI','32GB Wi-Fi','{"storage":"32GB","connectivity":"Wi-Fi"}', 159.00,179.00,40,8],
            // LG UltraFine 5K
            ['44000019-0000-0000-0000-000000000001','33000006-0000-0000-0000-000000000001','LGU5K-27','27"','{"size":"27\""}',1299.00,1499.00,10,2],
            // Samsung Odyssey G9
            ['44000020-0000-0000-0000-000000000001','33000006-0000-0000-0000-000000000002','ODOG9-49','49"','{"size":"49\""}',1799.00,1999.00,8,2],
            // Dell UltraSharp
            ['44000021-0000-0000-0000-000000000001','33000006-0000-0000-0000-000000000003','DUSU-27-4K','27" 4K','{"size":"27\""}',699.00,799.00,14,3],
        ];

        foreach ($variants as [$id, $productId, $sku, $name, $attrs, $price, $compareAt, $stock, $lowStock]) {
            DB::table('product_variants')->upsert([[
                'id'                  => $id,
                'product_id'          => $productId,
                'sku'                 => $sku,
                'name'                => $name,
                'attributes'          => $attrs,
                'price'               => $price,
                'compare_at_price'    => $compareAt,
                'stock'               => $stock,
                'low_stock_threshold' => $lowStock,
                'is_active'           => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]], ['id'], ['name', 'attributes', 'price', 'compare_at_price', 'stock', 'low_stock_threshold', 'is_active', 'updated_at']);
        }
    }
}
