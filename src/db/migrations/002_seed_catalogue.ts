export const MIGRATION_002 = `-- Migration 002: Seed Sri Lankan electrical categories and starter catalogue
-- Version: 2
-- All prices are DEMO/EXAMPLE prices. Mark is_seed=1 for user notification.

-- =====================================================
-- MATERIAL CATEGORIES
-- =====================================================
INSERT OR IGNORE INTO material_categories (name, default_markup_pct, sort_order) VALUES
  ('Cables & Wires (කේබල් සහ වයර්)',        20.0,  1),
  ('Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)',    20.0,  2),
  ('Sockets & Switches (සොකට් සහ ස්විච්)',    25.0,  3),
  ('Distribution Boards (බෙදාහැරීමේ පුවරු)',   20.0,  4),
  ('MCBs & Protection (MCB සහ ආරක්ෂණ)',     25.0,  5),
  ('Lighting (ලයිටිං)',              30.0,  6),
  ('Ceiling Fans (සීලිං ෆෑන්)',          20.0,  7),
  ('AC & Water Heater (AC සහ වතුර හීටර්)',     20.0,  8),
  ('Accessories & Hardware (උපාංග සහ දෘඪාංග)',30.0,  9),
  ('Miscellaneous (විවිධ)',         20.0, 10);

-- =====================================================
-- MATERIALS (Sri Lankan electrical — demo prices in LKR)
-- =====================================================

-- CABLES & WIRES
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, wastage_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '1.5mm² Single Core PVC Cable (1.5mm² තනි කෝර් PVC කේබල්)', 'm',  35,  42, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '2.5mm² Single Core PVC Cable (2.5mm² තනි කෝර් PVC කේබල්)', 'm',  55,  66, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '4mm² Single Core PVC Cable (4mm² තනි කෝර් PVC කේබල්)',   'm',  90, 108, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '6mm² Single Core PVC Cable (6mm² තනි කෝර් PVC කේබල්)',   'm', 140, 168, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '1.5mm² Twin & Earth Flat Cable (1.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)','m',  75,  90, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '2.5mm² Twin & Earth Flat Cable (2.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)','m', 110, 132, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '4mm² Twin & Earth Flat Cable (4mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)',  'm', 175, 210, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '6mm² Twin & Earth Flat Cable (6mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)',  'm', 275, 330, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '3-Core 1.5mm² Flexible Cable (3-කෝර් 1.5mm² නම්‍යශීලී කේබල්)',  'm',  90, 108, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '3-Core 2.5mm² Flexible Cable (3-කෝර් 2.5mm² නම්‍යශීලී කේබල්)',  'm', 145, 174, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), '16mm² Armoured Cable SWA (16mm² අාවරණය කළ කේබල්)',    'm', 480, 576, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires (කේබල් සහ වයර්)'), 'Earth Cable 6mm² Green/Yellow (භූ කේබල් 6mm² කොළ/කහ)', 'm',  95, 114, 20, 10, 1);

-- CONDUIT & TRUNKING
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, wastage_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)', 'each', 150, 180, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '25mm PVC Conduit 3m (25mm PVC කොන්ඩ්‍යූට් 3m)', 'each', 210, 252, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '32mm PVC Conduit 3m (32mm PVC කොන්ඩ්‍යූට් 3m)', 'each', 290, 348, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '20mm Conduit Coupler (20mm කොන්ඩ්‍යූට් සම්බන්ධකය)',          'each',  25,  30, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '20mm Conduit Elbow (20mm කොන්ඩ්‍යූට් කොණ)',            'each',  30,  36, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '20mm Conduit Saddle (20mm කොන්ඩ්‍යූට් සැඩ්ල්)',           'each',  10,  12, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '25x16mm PVC Trunking 2m (25x16mm PVC ට්‍රංකිං 2m)',     'each', 220, 264, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), '40x25mm PVC Trunking 2m (40x25mm PVC ට්‍රංකිං 2m)',     'each', 380, 456, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), 'Flexible Conduit 20mm per m (නම්‍යශීලී කොන්ඩ්‍යූට් 20mm)', 'm',    180, 216, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), 'Surface Mount Back Box 1-gang (මතුපිට 1-ගෑන් පිටු පෙට්ටිය)', 'each',  95, 114, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), 'Surface Mount Back Box 2-gang (මතුපිට 2-ගෑන් පිටු පෙට්ටිය)', 'each', 140, 168, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), 'Flush Back Box 1-gang 25mm (ෆ්ලෂ් 1-ගෑන් පිටු පෙට්ටිය 25mm)',    'each',  55,  66, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)'), 'Flush Back Box 2-gang 35mm (ෆ්ලෂ් 2-ගෑන් පිටු පෙට්ටිය 35mm)',    'each',  75,  90, 20, 0, 1);

-- SOCKETS & SWITCHES
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '13A Single Switched Socket (13A තනි ස්විච් සොකට්)',        'each', 350, 438, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '13A Double Switched Socket (13A ද්විත්ව ස්විච් සොකට්)',        'each', 580, 725, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '13A Single Socket Unswitched (13A ස්විච් රහිත සොකට්)',    'each', 280, 350, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '5A 2-pin Round Socket (5A 2-පින් රවුම් සොකට්)',             'each', 220, 275, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), 'USB Dual Charging Socket 5V/2.4A (USB ද්විත්ව චාජිං සොකට්)','each', 850,1063, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '1-Gang 1-Way Switch (1-ගෑන් 1-පාර ස්විච්)',               'each', 180, 225, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '1-Gang 2-Way Switch (1-ගෑන් 2-පාර ස්විච්)',               'each', 220, 275, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '2-Gang 1-Way Switch (2-ගෑන් 1-පාර ස්විච්)',               'each', 290, 363, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '2-Gang 2-Way Switch (2-ගෑන් 2-පාර ස්විච්)',               'each', 350, 438, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), '3-Gang 1-Way Switch (3-ගෑන් 1-පාර ස්විච්)',               'each', 420, 525, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), 'Dimmer Switch 1-Gang 250W (ඩිමර් ස්විච් 1-ගෑන් 250W)',         'each',1200,1500, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), 'Weatherproof Socket 13A IP55 (කාලගුණ ආරක්ෂිත සොකට් 13A)',      'each', 780, 975, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'), 'Shaver Socket 110/240V (ෂේවර් සොකට් 110/240V)',            'each', 950,1188, 25, 1);

-- DISTRIBUTION BOARDS
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), '4-Way Consumer Unit surface (4-පාර DB පෙට්ටිය)',  'each', 2800, 3360, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), '6-Way Consumer Unit surface (6-පාර DB පෙට්ටිය)',  'each', 3500, 4200, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), '8-Way Consumer Unit surface (8-පාර DB පෙට්ටිය)',  'each', 4200, 5040, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), '12-Way Consumer Unit surface (12-පාර DB පෙට්ටිය)', 'each', 5800, 6960, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), '16-Way Consumer Unit surface (16-පාර DB පෙට්ටිය)', 'each', 7500, 9000, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'DB Main Isolator 63A 2P (ප්‍රධාන අයිසොලේටරය 63A)',        'each', 1200, 1440, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'DB Main Isolator 100A 2P (ප්‍රධාන අයිසොලේටරය 100A)',       'each', 1800, 2160, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'Busbar Cover per unit (බස්බාර් ආවරණය)',         'each',  350,  420, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'Din Rail 1m (ඩින් රේල් 1m)',                    'each',  280,  336, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'Cable Lug 16mm² pack 10 (කේබල් ලග් 16mm² ෂීට් 10)',       'pack',  450,  540, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards (බෙදාහැරීමේ පුවරු)'), 'Earth Bar 10-way (භූ තීරය 10-පාර)',               'each',  650,  780, 20, 1);

-- MCBs & PROTECTION
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 6A Single Pole Type B (MCB 6A තනි පෝල්)',     'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 10A Single Pole Type B (MCB 10A තනි පෝල්)',    'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 16A Single Pole Type B (MCB 16A තනි පෝල්)',    'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 20A Single Pole Type B (MCB 20A තනි පෝල්)',    'each',  480,  600, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 32A Single Pole Type B (MCB 32A තනි පෝල්)',    'each',  520,  650, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 40A Single Pole Type C (MCB 40A තනි පෝල්)',    'each',  580,  725, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 63A Single Pole Type C (MCB 63A තනි පෝල්)',    'each',  750,  938, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 16A Double Pole (MCB 16A ද්විත්ව පෝල්)',             'each',  980, 1225, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'MCB 32A Double Pole (MCB 32A ද්විත්ව පෝල්)',             'each', 1100, 1375, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'RCCB 40A 30mA 2P (RCCB 40A)',               'each', 2800, 3500, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'RCCB 63A 30mA 2P (RCCB 63A)',               'each', 3500, 4375, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'RCBO 16A 30mA SP (RCBO 16A)',               'each', 2200, 2750, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'RCBO 20A 30mA SP (RCBO 20A)',               'each', 2200, 2750, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'RCBO 32A 30mA SP (RCBO 32A)',               'each', 2400, 3000, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'Surge Protection Device SPD 1P (අධික ධාරා ආරක්ෂකය)','each', 3200, 4000, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection (MCB සහ ආරක්ෂණ)'), 'Earth Leakage Relay 30mA (භූ කාන්දු රිලේ 30mA)',        'each', 4500, 5625, 25, 1);

-- LIGHTING
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Bulb 9W E27 (LED බල්බ් 9W)',                    'each',  220,  286, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Bulb 12W E27 (LED බල්බ් 12W)',                   'each',  280,  364, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Downlight 9W Round (LED ඩව්න්ලයිට් 9W)',            'each',  650,  845, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Downlight 12W Round (LED ඩව්න්ලයිට් 12W)',           'each',  780,  1014,30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Panel Light 18W 300x300mm (LED පැනල් ලයිට් 18W)',      'each', 1400, 1820, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Batten Light 18W 600mm (LED බැටන් ලයිට් 18W)',         'each',  850, 1105, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'LED Batten Light 36W 1200mm (LED බැටන් ලයිට් 36W)',        'each', 1400, 1820, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Fluorescent Tube 36W T8 (ෆ්ලෝරෙසන්ට් ටියුබ් 36W)',            'each',  180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Fluorescent Fitting 2x36W (ෆ්ලෝරෙසන්ට් ෆිටිං 2x36W)',          'each',  950, 1235, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Batten Lamp Holder surface (බැටන් ලාම්පු හෝල්ඩරය)',       'each',  140,  182, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Ceiling Rose 5A (සීලිං රෝස් 5A)',                  'each',  120,  156, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Pendant Lamp Holder B22 (පෙන්ඩන්ට් ලාම්පු හෝල්ඩරය)',            'each',   95,  124, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Outdoor Bulkhead Light IP54 (එළිමහන් බල්ක්හෙඩ් ලයිට්)',      'each', 1800, 2340, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Emergency Light Battery Backup (හදිසි ලයිට්)',   'each', 3500, 4550, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'), 'Exit Sign Light LED (පිටවීමේ සංඥා ලයිට්)',              'each', 2800, 3640, 30, 1);

-- CEILING FANS
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan 48" 3-blade (සීලිං ෆෑන් 48")',     'each', 6500,  7800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan 56" 3-blade (සීලිං ෆෑන් 56")',     'each', 8500, 10200, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan 48" with Light Kit (ලයිට් කිට් සහිත සීලිං ෆෑන් 48")','each', 9500, 11400, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan Regulator 5-Speed (සීලිං ෆෑන් රෙගියුලේටරය)','each', 850,  1020, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan Remote Control Kit (රිමෝට් කන්ට්‍රෝල් කිට්)', 'each',1500,  1800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan Canopy Mounting Kit (කැනොපි මවුන්ටිං කිට්)','each', 450,   540, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'), 'Ceiling Fan Extension Rod 300mm (දිගු දණ්ඩ 300mm)','each', 380,   456, 20, 1);

-- AC & WATER HEATER
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'AC Disconnect Switch 20A Isolator (AC ඉවත් කිරීමේ ස්විච් 20A)', 'each', 1200, 1440, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'AC Disconnect Switch 32A Isolator (AC ඉවත් කිරීමේ ස්විච් 32A)', 'each', 1500, 1800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'Water Heater Isolator Switch 20A DP (වතුර හීටර් ස්විච් 20A)', 'each',  950, 1140, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'Flex Outlet Plate cooker/AC (ෆ්ලෙක්ස් අවුට්ලෙට් තහඩු)',        'each',  380,  456, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'Cable Tray 50mm per metre (කේබල් ට්‍රේ 50mm)',          'm',     350,  420, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'Split AC Copper Pipe Set 3m (AC තඹ පයිප්ප කට්ටලය 3m)',         'each', 2800, 3360, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'), 'Earth Spike 1.2m Copper Clad (භූ ගැසීමේ කූරු 1.2m)',        'each', 1800, 2160, 20, 1);

-- ACCESSORIES & HARDWARE
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Junction Box IP55 (ජංක්ෂන් බොක්සිය IP55)',           'each',  180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Wago 2-way Connector pack 10 (Wago 2-පාර සම්බන්ධකය)', 'pack', 180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Wago 3-way Connector pack 10 (Wago 3-පාර සම්බන්ධකය)', 'pack', 220,  286, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Insulation Tape roll (ඉන්සුලේෂන් ටේප් රෝල)',         'roll',  85,  111, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Cable Tie Pack 100 (කේබල් ටයි ඇසුරුම් 100)',           'pack', 120,  156, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Cable Clip 20mm pack 50 (කේබල් ක්ලිප් 20mm)',      'pack', 110,  143, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Rawl Plug Pack 100 (රොල් ප්ලග් ඇසුරුම 100)',           'pack',  90,  117, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Screw 3.5x25mm box 200 (ස්ක්‍රූ 3.5x25mm)',       'box',  150,  195, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Wall Plug & Screw Set 50 pcs (වෝල් ප්ලග් සහ ස්ක්‍රූ කට්ටලය)', 'pack', 140,  182, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Blank Plate 1-gang (හිස් තහඩු 1-ගෑන්)',             'each',  95,  124, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Blank Plate 2-gang (හිස් තහඩු 2-ගෑන්)',             'each', 130,  169, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Fuse Holder 13A with fuse (ෆියුස් හෝල්ඩරය 13A)',    'each',  80,  104, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Cord Grip Strain Relief 20mm (කෝඩ් ග්‍රිප් 20mm)',  'each',  45,   59, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Rubber Grommet 20mm pack 10 (රබර් ග්‍රොමිට් 20mm)', 'pack',  75,   98, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware (උපාංග සහ දෘඪාංග)'), 'Earth Terminal Block 10-way (භූ ටර්මිනල් බ්ලොකය)',   'each', 280,  364, 30, 1);

-- =====================================================
-- LABOUR ITEMS (typical Sri Lankan electrician rates)
-- =====================================================
INSERT OR IGNORE INTO labour_items (name, description, unit, unit_rate, is_seed) VALUES
  ('Lighting Point Installation (ලයිටිං පොයින්ට් ස්ථාපනය)',       'Supply and fix light fitting, run cable, connect', 'per point',  800, 1),
  ('Switch Installation (ස්විච් ස්ථාපනය)',               'Supply and fix switch, run cable, connect',         'per point',  600, 1),
  ('Socket Outlet Installation (සොකට් ස්ථාපනය)',        '13A socket, back box, run cable, connect',          'per point',  900, 1),
  ('Fan Point Installation (ෆෑන් පොයින්ට් ස්ථාපනය)',            'Ceiling fan wiring, switch, rose, run cable',       'per point', 1200, 1),
  ('DB Board Installation (DB ස්ථාපනය)',             'Mount board, terminate cables, label circuits',     'per DB',    8000, 1),
  ('DB Board Extension / Upgrade (DB දිගු කිරීම)',      'Add circuits to existing board',                    'per DB',    4000, 1),
  ('MCB/RCCB Replacement (MCB/RCCB ආදේශනය)',              'Remove old, fit new MCB or RCCB',                  'each',       750, 1),
  ('Main Incoming Cable underground (ප්‍රධාන සම්බන්ධ කේබල්)', 'Pull through, terminate both ends',                 'lump sum',15000, 1),
  ('Conduit Installation (කොන්ඩ්‍යූට් ස්ථාපනය)',              'Run and fix conduit (surface)',                     'per metre',  250, 1),
  ('Trunking Installation (ට්‍රංකිං ස්ථාපනය)',             'Fix trunking, pull cables',                        'per metre',  350, 1),
  ('Earth Electrode Installation (භූ ඉලෙක්ට්‍රෝඩ ස්ථාපනය)',      'Drive earth spike, connect earth conductor',        'lump sum',  5000, 1),
  ('Ceiling Fan Installation (සීලිං ෆෑන් ස්ථාපනය)',          'Mount bracket, hang fan, connect, test',            'each',      2500, 1),
  ('AC Wiring & Isolator (AC රැහැන් සහ අයිසොලේටරය)',             'Run cable, install isolator, connect AC unit',       'each',      4500, 1),
  ('Water Heater Wiring (වතුර හීටර් රැහැන්)',              'Run cable, install isolator/timer, connect',         'each',      3500, 1),
  ('General Labour per hour (පොදු කම්කරු - පැයකට)',         'Miscellaneous electrical work',                     'per hour',  1500, 1),
  ('General Labour per day (පොදු කම්කරු - දිනකට)',          'Full day on-site electrical work',                  'per day',  10000, 1),
  ('Cable Draw-in existing conduit (කේබල් ඇද ගැනීම)', 'Pull cable through installed conduit',               'per metre',  150, 1),
  ('Testing & Commissioning (පරීක්ෂා කිරීම සහ සක්‍රිය කිරීම)',          'Test all circuits, produce test certificate',        'lump sum',  8000, 1),
  ('Fault Finding (දෝෂ සොයා ගැනීම)',                    'Diagnose electrical fault',                          'per hour',  2000, 1);

-- =====================================================
-- STARTER ASSEMBLIES
-- =====================================================

-- 1. Standard Lighting Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)',
  'Complete lighting point: LED downlight, ceiling rose, 1-gang switch, cables and conduit',
  (SELECT id FROM material_categories WHERE name='Lighting (ලයිටිං)'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1.5mm² Twin & Earth Flat Cable (1.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'),
    8, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='LED Downlight 9W Round (LED ඩව්න්ලයිට් 9W)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Rose 5A (සීලිං රෝස් 5A)'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1-Gang 2-Way Switch (1-ගෑන් 2-පාර ස්විච්)'),
    1, 0, 4
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 1-gang 25mm (ෆ්ලෂ් 1-ගෑන් පිටු පෙට්ටිය 25mm)'),
    1, 0, 5
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)'),
    1, 0, 6
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Lighting Point Installation (ලයිටිං පොයින්ට් ස්ථාපනය)'),
  1, 1
);

-- 2. 13A Double Switched Socket Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  '13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)',
  'Complete socket outlet: double socket, back box, 2.5mm² cable, conduit',
  (SELECT id FROM material_categories WHERE name='Sockets & Switches (සොකට් සහ ස්විච්)'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable (2.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'),
    8, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='13A Double Switched Socket (13A ද්විත්ව ස්විච් සොකට්)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 2-gang 35mm (ෆ්ලෂ් 2-ගෑන් පිටු පෙට්ටිය 35mm)'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)'),
    1, 0, 4
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Socket Outlet Installation (සොකට් ස්ථාපනය)'),
  1, 1
);

-- 3. Ceiling Fan Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)',
  'Complete ceiling fan installation: fan, wiring, switch, ceiling rose',
  (SELECT id FROM material_categories WHERE name='Ceiling Fans (සීලිං ෆෑන්)'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1.5mm² Twin & Earth Flat Cable (1.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'),
    10, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Fan 48" 3-blade (සීලිං ෆෑන් 48")'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Fan Regulator 5-Speed (සීලිං ෆෑන් රෙගියුලේටරය)'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Rose 5A (සීලිං රෝස් 5A)'),
    1, 0, 4
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 1-gang 25mm (ෆ්ලෂ් 1-ගෑන් පිටු පෙට්ටිය 25mm)'),
    1, 0, 5
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Fan Point Installation (ෆෑන් පොයින්ට් ස්ථාපනය)'),
  1, 1
);

-- 4. AC Wiring Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)',
  'Air conditioner wiring: 2.5mm² cable, isolator switch',
  (SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'),
  0, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable (2.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'),
    6, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='AC Disconnect Switch 20A Isolator (AC ඉවත් කිරීමේ ස්විච් 20A)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)'),
    2, 0, 3
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='AC Wiring & Isolator (AC රැහැන් සහ අයිසොලේටරය)'),
  1, 1
);

-- 5. Water Heater Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)',
  'Electric water heater wiring: 2.5mm² cable, DP isolator switch',
  (SELECT id FROM material_categories WHERE name='AC & Water Heater (AC සහ වතුර හීටර්)'),
  0, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable (2.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'),
    5, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Water Heater Isolator Switch 20A DP (වතුර හීටර් ස්විච් 20A)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)'),
    2, 0, 3
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Water Heater Wiring (වතුර හීටර් රැහැන්)'),
  1, 1
);
`;
