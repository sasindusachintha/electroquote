-- Migration 002: Seed Sri Lankan electrical categories and starter catalogue
-- Version: 2
-- All prices are DEMO/EXAMPLE prices. Mark is_seed=1 for user notification.

-- =====================================================
-- MATERIAL CATEGORIES
-- =====================================================
INSERT OR IGNORE INTO material_categories (name, default_markup_pct, sort_order) VALUES
  ('Cables & Wires',        20.0,  1),
  ('Conduit & Trunking',    20.0,  2),
  ('Sockets & Switches',    25.0,  3),
  ('Distribution Boards',   20.0,  4),
  ('MCBs & Protection',     25.0,  5),
  ('Lighting',              30.0,  6),
  ('Ceiling Fans',          20.0,  7),
  ('AC & Water Heater',     20.0,  8),
  ('Accessories & Hardware',30.0,  9),
  ('Miscellaneous',         20.0, 10);

-- =====================================================
-- MATERIALS (Sri Lankan electrical — demo prices in LKR)
-- =====================================================

-- CABLES & WIRES
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, wastage_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '1.5mm² Single Core PVC Cable', 'm',  35,  42, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '2.5mm² Single Core PVC Cable', 'm',  55,  66, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '4mm² Single Core PVC Cable',   'm',  90, 108, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '6mm² Single Core PVC Cable',   'm', 140, 168, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '1.5mm² Twin & Earth Flat Cable','m',  75,  90, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '2.5mm² Twin & Earth Flat Cable','m', 110, 132, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '4mm² Twin & Earth Flat Cable',  'm', 175, 210, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '6mm² Twin & Earth Flat Cable',  'm', 275, 330, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '3-Core 1.5mm² Flexible Cable',  'm',  90, 108, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '3-Core 2.5mm² Flexible Cable',  'm', 145, 174, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), '16mm² Armoured Cable (SWA)',    'm', 480, 576, 20, 10, 1),
  ((SELECT id FROM material_categories WHERE name='Cables & Wires'), 'Earth Cable 6mm² Green/Yellow', 'm',  95, 114, 20, 10, 1);

-- CONDUIT & TRUNKING
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, wastage_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '20mm PVC Conduit (3m length)', 'each', 150, 180, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '25mm PVC Conduit (3m length)', 'each', 210, 252, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '32mm PVC Conduit (3m length)', 'each', 290, 348, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '20mm Conduit Coupler',          'each',  25,  30, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '20mm Conduit Elbow',            'each',  30,  36, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '20mm Conduit Saddle',           'each',  10,  12, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '25×16mm PVC Trunking (2m)',     'each', 220, 264, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), '40×25mm PVC Trunking (2m)',     'each', 380, 456, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), 'Flexible Conduit 20mm (per m)', 'm',    180, 216, 20, 5, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), 'Surface Mount Back Box 1-gang', 'each',  95, 114, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), 'Surface Mount Back Box 2-gang', 'each', 140, 168, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), 'Flush Back Box 1-gang 25mm',    'each',  55,  66, 20, 0, 1),
  ((SELECT id FROM material_categories WHERE name='Conduit & Trunking'), 'Flush Back Box 2-gang 35mm',    'each',  75,  90, 20, 0, 1);

-- SOCKETS & SWITCHES
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '13A Single Switched Socket',        'each', 350, 438, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '13A Double Switched Socket',        'each', 580, 725, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '13A Single Socket (Unswitched)',    'each', 280, 350, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '5A 2-pin Round Socket',             'each', 220, 275, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), 'USB Dual Charging Socket (5V/2.4A)','each', 850,1063, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '1-Gang 1-Way Switch',               'each', 180, 225, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '1-Gang 2-Way Switch',               'each', 220, 275, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '2-Gang 1-Way Switch',               'each', 290, 363, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '2-Gang 2-Way Switch',               'each', 350, 438, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), '3-Gang 1-Way Switch',               'each', 420, 525, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), 'Dimmer Switch 1-Gang 250W',         'each',1200,1500, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), 'Weatherproof Socket 13A IP55',      'each', 780, 975, 25, 1),
  ((SELECT id FROM material_categories WHERE name='Sockets & Switches'), 'Shaver Socket 110/240V',            'each', 950,1188, 25, 1);

-- DISTRIBUTION BOARDS
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), '4-Way Consumer Unit (surface)',  'each', 2800, 3360, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), '6-Way Consumer Unit (surface)',  'each', 3500, 4200, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), '8-Way Consumer Unit (surface)',  'each', 4200, 5040, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), '12-Way Consumer Unit (surface)', 'each', 5800, 6960, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), '16-Way Consumer Unit (surface)', 'each', 7500, 9000, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'DB Main Isolator 63A 2P',        'each', 1200, 1440, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'DB Main Isolator 100A 2P',       'each', 1800, 2160, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'Busbar Cover (per unit)',         'each',  350,  420, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'Din Rail 1m',                    'each',  280,  336, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'Cable Lug 16mm² (pack 10)',       'pack',  450,  540, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Distribution Boards'), 'Earth Bar 10-way',               'each',  650,  780, 20, 1);

-- MCBs & PROTECTION
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 6A Single Pole (Type B)',     'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 10A Single Pole (Type B)',    'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 16A Single Pole (Type B)',    'each',  450,  563, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 20A Single Pole (Type B)',    'each',  480,  600, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 32A Single Pole (Type B)',    'each',  520,  650, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 40A Single Pole (Type C)',    'each',  580,  725, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 63A Single Pole (Type C)',    'each',  750,  938, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 16A Double Pole',             'each',  980, 1225, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'MCB 32A Double Pole',             'each', 1100, 1375, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'RCCB 40A 30mA 2P',               'each', 2800, 3500, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'RCCB 63A 30mA 2P',               'each', 3500, 4375, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'RCBO 16A 30mA SP',               'each', 2200, 2750, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'RCBO 20A 30mA SP',               'each', 2200, 2750, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'RCBO 32A 30mA SP',               'each', 2400, 3000, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'Surge Protection Device (SPD) 1P','each', 3200, 4000, 25, 1),
  ((SELECT id FROM material_categories WHERE name='MCBs & Protection'), 'Earth Leakage Relay 30mA',        'each', 4500, 5625, 25, 1);

-- LIGHTING
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Bulb 9W E27',                    'each',  220,  286, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Bulb 12W E27',                   'each',  280,  364, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Downlight 9W (Round)',            'each',  650,  845, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Downlight 12W (Round)',           'each',  780,  1014,30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Panel Light 18W 300×300mm',      'each', 1400, 1820, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Batten Light 18W 600mm',         'each',  850, 1105, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'LED Batten Light 36W 1200mm',        'each', 1400, 1820, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Fluorescent Tube 36W T8',            'each',  180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Fluorescent Fitting 2×36W',          'each',  950, 1235, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Batten Lamp Holder (surface)',       'each',  140,  182, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Ceiling Rose (5A)',                  'each',  120,  156, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Pendant Lamp Holder B22',            'each',   95,  124, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Outdoor Bulkhead Light (IP54)',      'each', 1800, 2340, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Emergency Light (Battery Backup)',   'each', 3500, 4550, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Lighting'), 'Exit Sign Light (LED)',              'each', 2800, 3640, 30, 1);

-- CEILING FANS
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan 48" (3-blade)',     'each', 6500,  7800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan 56" (3-blade)',     'each', 8500, 10200, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan 48" with Light Kit','each', 9500, 11400, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan Regulator (5-Speed)','each', 850,  1020, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan Remote Control Kit', 'each',1500,  1800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan Canopy/Mounting Kit','each', 450,   540, 20, 1),
  ((SELECT id FROM material_categories WHERE name='Ceiling Fans'), 'Ceiling Fan Extension Rod 300mm','each', 380,   456, 20, 1);

-- AC & WATER HEATER
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'AC Disconnect Switch 20A (Isolator)', 'each', 1200, 1440, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'AC Disconnect Switch 32A (Isolator)', 'each', 1500, 1800, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'Water Heater Isolator Switch 20A DP', 'each',  950, 1140, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'Flex Outlet Plate (cooker/AC)',        'each',  380,  456, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'Cable Tray 50mm (per metre)',          'm',     350,  420, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'Split AC Copper Pipe Set 3m',         'each', 2800, 3360, 20, 1),
  ((SELECT id FROM material_categories WHERE name='AC & Water Heater'), 'Earth Spike 1.2m Copper Clad',        'each', 1800, 2160, 20, 1);

-- ACCESSORIES & HARDWARE
INSERT OR IGNORE INTO materials (category_id, name, unit, cost_price, sell_price, markup_pct, is_seed)
VALUES
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Junction Box (IP55)',           'each',  180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Wago 2-way Connector (pack 10)', 'pack', 180,  234, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Wago 3-way Connector (pack 10)', 'pack', 220,  286, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Insulation Tape (roll)',         'roll',  85,  111, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Cable Tie Pack (100)',           'pack', 120,  156, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Cable Clip 20mm (pack 50)',      'pack', 110,  143, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Rawl Plug Pack (100)',           'pack',  90,  117, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Screw 3.5×25mm (box 200)',       'box',  150,  195, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Wall Plug & Screw Set (50 pcs)', 'pack', 140,  182, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Blank Plate 1-gang',             'each',  95,  124, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Blank Plate 2-gang',             'each', 130,  169, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Fuse Holder 13A (with fuse)',    'each',  80,  104, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Cord Grip/Strain Relief 20mm',  'each',  45,   59, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Rubber Grommet 20mm (pack 10)', 'pack',  75,   98, 30, 1),
  ((SELECT id FROM material_categories WHERE name='Accessories & Hardware'), 'Earth Terminal Block 10-way',   'each', 280,  364, 30, 1);

-- =====================================================
-- LABOUR ITEMS (typical Sri Lankan electrician rates)
-- =====================================================
INSERT OR IGNORE INTO labour_items (name, description, unit, unit_rate, is_seed) VALUES
  ('Lighting Point Installation',       'Supply and fix light fitting, run cable, connect', 'per point',  800, 1),
  ('Switch Installation',               'Supply and fix switch, run cable, connect',         'per point',  600, 1),
  ('Socket Outlet Installation',        '13A socket, back box, run cable, connect',          'per point',  900, 1),
  ('Fan Point Installation',            'Ceiling fan wiring, switch, rose, run cable',       'per point', 1200, 1),
  ('DB Board Installation',             'Mount board, terminate cables, label circuits',     'per DB',    8000, 1),
  ('DB Board Extension / Upgrade',      'Add circuits to existing board',                    'per DB',    4000, 1),
  ('MCB/RCCB Replacement',              'Remove old, fit new MCB or RCCB',                  'each',       750, 1),
  ('Main Incoming Cable (underground)', 'Pull through, terminate both ends',                 'lump sum',15000, 1),
  ('Conduit Installation',              'Run and fix conduit (surface)',                     'per metre',  250, 1),
  ('Trunking Installation',             'Fix trunking, pull cables',                        'per metre',  350, 1),
  ('Earth Electrode Installation',      'Drive earth spike, connect earth conductor',        'lump sum',  5000, 1),
  ('Ceiling Fan Installation',          'Mount bracket, hang fan, connect, test',            'each',      2500, 1),
  ('AC Wiring & Isolator',             'Run cable, install isolator, connect AC unit',       'each',      4500, 1),
  ('Water Heater Wiring',              'Run cable, install isolator/timer, connect',         'each',      3500, 1),
  ('General Labour (per hour)',         'Miscellaneous electrical work',                     'per hour',  1500, 1),
  ('General Labour (per day)',          'Full day on-site electrical work',                  'per day',  10000, 1),
  ('Cable Draw-in (existing conduit)', 'Pull cable through installed conduit',               'per metre',  150, 1),
  ('Testing & Commissioning',          'Test all circuits, produce test certificate',        'lump sum',  8000, 1),
  ('Fault Finding',                    'Diagnose electrical fault',                          'per hour',  2000, 1);

-- =====================================================
-- STARTER ASSEMBLIES
-- =====================================================

-- 1. Standard Lighting Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Standard Lighting Point',
  'Complete lighting point: LED downlight, ceiling rose, 1-gang switch, cables and conduit',
  (SELECT id FROM material_categories WHERE name='Lighting'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1.5mm² Twin & Earth Flat Cable'),
    8, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='LED Downlight 9W (Round)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Rose (5A)'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1-Gang 2-Way Switch'),
    1, 0, 4
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 1-gang 25mm'),
    1, 0, 5
  ),
  (
    (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit (3m length)'),
    1, 0, 6
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Standard Lighting Point' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Lighting Point Installation'),
  1, 1
);

-- 2. 13A Double Switched Socket Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  '13A Double Socket Point',
  'Complete socket outlet: double socket, back box, 2.5mm² cable, conduit',
  (SELECT id FROM material_categories WHERE name='Sockets & Switches'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable'),
    8, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='13A Double Switched Socket'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 2-gang 35mm'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='13A Double Socket Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit (3m length)'),
    1, 0, 4
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='13A Double Socket Point' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Socket Outlet Installation'),
  1, 1
);

-- 3. Ceiling Fan Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Ceiling Fan Point',
  'Complete ceiling fan installation: fan, wiring, switch, ceiling rose',
  (SELECT id FROM material_categories WHERE name='Ceiling Fans'),
  1, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='1.5mm² Twin & Earth Flat Cable'),
    10, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Fan 48" (3-blade)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Fan Regulator (5-Speed)'),
    1, 0, 3
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Ceiling Rose (5A)'),
    1, 0, 4
  ),
  (
    (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Flush Back Box 1-gang 25mm'),
    1, 0, 5
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Ceiling Fan Point' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Fan Point Installation'),
  1, 1
);

-- 4. AC Wiring Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'AC Wiring & Isolator Point',
  'Air conditioner wiring: 2.5mm² cable, isolator switch',
  (SELECT id FROM material_categories WHERE name='AC & Water Heater'),
  0, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable'),
    6, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='AC Disconnect Switch 20A (Isolator)'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit (3m length)'),
    2, 0, 3
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='AC Wiring & Isolator Point' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='AC Wiring & Isolator'),
  1, 1
);

-- 5. Water Heater Point
INSERT OR IGNORE INTO assemblies (name, description, category_id, is_favourite, is_seed)
VALUES (
  'Water Heater Wiring Point',
  'Electric water heater wiring: 2.5mm² cable, DP isolator switch',
  (SELECT id FROM material_categories WHERE name='AC & Water Heater'),
  0, 1
);

INSERT OR IGNORE INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
VALUES
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='2.5mm² Twin & Earth Flat Cable'),
    5, 1, 1
  ),
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='Water Heater Isolator Switch 20A DP'),
    1, 0, 2
  ),
  (
    (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point' AND is_seed=1),
    (SELECT id FROM materials WHERE name='20mm PVC Conduit (3m length)'),
    2, 0, 3
  );

INSERT OR IGNORE INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
VALUES (
  (SELECT id FROM assemblies WHERE name='Water Heater Wiring Point' AND is_seed=1),
  (SELECT id FROM labour_items WHERE name='Water Heater Wiring'),
  1, 1
);
