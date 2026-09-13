// src/db/migrations/006_sinhala_names.ts
// Adds Sinhala translations in brackets to all existing material category,
// material, labour item, and assembly names.

export const MIGRATION_006 = `
-- =====================================================
-- UPDATE: Add Sinhala names to material categories
-- =====================================================
UPDATE material_categories SET name = 'Cables & Wires (කේබල් සහ වයර්)'           WHERE name = 'Cables & Wires';
UPDATE material_categories SET name = 'Conduit & Trunking (කොන්ඩ්‍යූට් සහ ට්‍රංකිං)' WHERE name = 'Conduit & Trunking';
UPDATE material_categories SET name = 'Sockets & Switches (සොකට් සහ ස්විච්)'     WHERE name = 'Sockets & Switches';
UPDATE material_categories SET name = 'Distribution Boards (බෙදාහැරීමේ පුවරු)'    WHERE name = 'Distribution Boards';
UPDATE material_categories SET name = 'MCBs & Protection (MCB සහ ආරක්ෂණ)'       WHERE name = 'MCBs & Protection';
UPDATE material_categories SET name = 'Lighting (ලයිටිං)'                         WHERE name = 'Lighting';
UPDATE material_categories SET name = 'Ceiling Fans (සීලිං ෆෑන්)'                WHERE name = 'Ceiling Fans';
UPDATE material_categories SET name = 'AC & Water Heater (AC සහ වතුර හීටර්)'     WHERE name = 'AC & Water Heater';
UPDATE material_categories SET name = 'Accessories & Hardware (උපාංග සහ දෘඪාංග)' WHERE name = 'Accessories & Hardware';
UPDATE material_categories SET name = 'Miscellaneous (විවිධ)'                     WHERE name = 'Miscellaneous';

-- =====================================================
-- UPDATE: Add Sinhala names to materials
-- =====================================================

-- Cables & Wires
UPDATE materials SET name = '1.5mm² Single Core PVC Cable (1.5mm² තනි කෝර් PVC කේබල්)'                 WHERE name LIKE '1.5mm_ Single Core PVC Cable';
UPDATE materials SET name = '2.5mm² Single Core PVC Cable (2.5mm² තනි කෝර් PVC කේබල්)'                 WHERE name LIKE '2.5mm_ Single Core PVC Cable';
UPDATE materials SET name = '4mm² Single Core PVC Cable (4mm² තනි කෝර් PVC කේබල්)'                     WHERE name LIKE '4mm_ Single Core PVC Cable';
UPDATE materials SET name = '6mm² Single Core PVC Cable (6mm² තනි කෝර් PVC කේබල්)'                     WHERE name LIKE '6mm_ Single Core PVC Cable';
UPDATE materials SET name = '1.5mm² Twin & Earth Flat Cable (1.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'     WHERE name LIKE '1.5mm_ Twin%Earth Flat Cable';
UPDATE materials SET name = '2.5mm² Twin & Earth Flat Cable (2.5mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'     WHERE name LIKE '2.5mm_ Twin%Earth Flat Cable';
UPDATE materials SET name = '4mm² Twin & Earth Flat Cable (4mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'         WHERE name LIKE '4mm_ Twin%Earth Flat Cable';
UPDATE materials SET name = '6mm² Twin & Earth Flat Cable (6mm² ට්වින් සහ අース ෆ්ලැට් කේබල්)'         WHERE name LIKE '6mm_ Twin%Earth Flat Cable';
UPDATE materials SET name = '3-Core 1.5mm² Flexible Cable (3-කෝර් 1.5mm² නම්‍යශීලී කේබල්)'            WHERE name LIKE '3-Core 1.5mm_ Flexible Cable';
UPDATE materials SET name = '3-Core 2.5mm² Flexible Cable (3-කෝර් 2.5mm² නම්‍යශීලී කේබල්)'            WHERE name LIKE '3-Core 2.5mm_ Flexible Cable';
UPDATE materials SET name = '16mm² Armoured Cable SWA (16mm² අාවරණය කළ කේබල්)'                         WHERE name LIKE '16mm_ Armoured Cable%';
UPDATE materials SET name = 'Earth Cable 6mm² Green/Yellow (භූ කේබල් 6mm² කොළ/කහ)'                    WHERE name LIKE 'Earth Cable 6mm_%';

-- Conduit & Trunking
UPDATE materials SET name = '20mm PVC Conduit 3m (20mm PVC කොන්ඩ්‍යූට් 3m)'                            WHERE name LIKE '20mm PVC Conduit (3m%';
UPDATE materials SET name = '25mm PVC Conduit 3m (25mm PVC කොන්ඩ්‍යූට් 3m)'                            WHERE name LIKE '25mm PVC Conduit (3m%';
UPDATE materials SET name = '32mm PVC Conduit 3m (32mm PVC කොන්ඩ්‍යූට් 3m)'                            WHERE name LIKE '32mm PVC Conduit (3m%';
UPDATE materials SET name = '20mm Conduit Coupler (20mm කොන්ඩ්‍යූට් සම්බන්ධකය)'                        WHERE name = '20mm Conduit Coupler';
UPDATE materials SET name = '20mm Conduit Elbow (20mm කොන්ඩ්‍යූට් කොණ)'                                WHERE name = '20mm Conduit Elbow';
UPDATE materials SET name = '20mm Conduit Saddle (20mm කොන්ඩ්‍යූට් සැඩ්ල්)'                            WHERE name = '20mm Conduit Saddle';
UPDATE materials SET name = '25x16mm PVC Trunking 2m (25x16mm PVC ට්‍රංකිං 2m)'                        WHERE name LIKE '25_16mm PVC Trunking%';
UPDATE materials SET name = '40x25mm PVC Trunking 2m (40x25mm PVC ට්‍රංකිං 2m)'                        WHERE name LIKE '40_25mm PVC Trunking%';
UPDATE materials SET name = 'Flexible Conduit 20mm per m (නම්‍යශීලී කොන්ඩ්‍යූට් 20mm)'                WHERE name LIKE 'Flexible Conduit 20mm%';
UPDATE materials SET name = 'Surface Mount Back Box 1-gang (මතුපිට 1-ගෑන් පිටු පෙට්ටිය)'              WHERE name = 'Surface Mount Back Box 1-gang';
UPDATE materials SET name = 'Surface Mount Back Box 2-gang (මතුපිට 2-ගෑන් පිටු පෙට්ටිය)'              WHERE name = 'Surface Mount Back Box 2-gang';
UPDATE materials SET name = 'Flush Back Box 1-gang 25mm (ෆ්ලෂ් 1-ගෑන් පිටු පෙට්ටිය 25mm)'             WHERE name LIKE 'Flush Back Box 1-gang%';
UPDATE materials SET name = 'Flush Back Box 2-gang 35mm (ෆ්ලෂ් 2-ගෑන් පිටු පෙට්ටිය 35mm)'             WHERE name LIKE 'Flush Back Box 2-gang%';

-- Sockets & Switches
UPDATE materials SET name = '13A Single Switched Socket (13A තනි ස්විච් සොකට්)'                        WHERE name = '13A Single Switched Socket';
UPDATE materials SET name = '13A Double Switched Socket (13A ද්විත්ව ස්විච් සොකට්)'                    WHERE name = '13A Double Switched Socket';
UPDATE materials SET name = '13A Single Socket Unswitched (13A ස්විච් රහිත සොකට්)'                     WHERE name LIKE '13A Single Socket%Unswitched%';
UPDATE materials SET name = '5A 2-pin Round Socket (5A 2-පින් රවුම් සොකට්)'                            WHERE name LIKE '5A 2-pin%';
UPDATE materials SET name = 'USB Dual Charging Socket 5V/2.4A (USB ද්විත්ව චාජිං සොකට්)'               WHERE name LIKE 'USB Dual%';
UPDATE materials SET name = '1-Gang 1-Way Switch (1-ගෑන් 1-පාර ස්විච්)'                                WHERE name = '1-Gang 1-Way Switch';
UPDATE materials SET name = '1-Gang 2-Way Switch (1-ගෑන් 2-පාර ස්විච්)'                                WHERE name = '1-Gang 2-Way Switch';
UPDATE materials SET name = '2-Gang 1-Way Switch (2-ගෑන් 1-පාර ස්විච්)'                                WHERE name = '2-Gang 1-Way Switch';
UPDATE materials SET name = '2-Gang 2-Way Switch (2-ගෑන් 2-පාර ස්විච්)'                                WHERE name = '2-Gang 2-Way Switch';
UPDATE materials SET name = '3-Gang 1-Way Switch (3-ගෑන් 1-පාර ස්විච්)'                                WHERE name = '3-Gang 1-Way Switch';
UPDATE materials SET name = 'Dimmer Switch 1-Gang 250W (ඩිමර් ස්විච් 1-ගෑන් 250W)'                     WHERE name LIKE 'Dimmer Switch%';
UPDATE materials SET name = 'Weatherproof Socket 13A IP55 (කාලගුණ ආරක්ෂිත සොකට් 13A)'                 WHERE name LIKE 'Weatherproof Socket%';
UPDATE materials SET name = 'Shaver Socket 110/240V (ෂේවර් සොකට් 110/240V)'                            WHERE name LIKE 'Shaver Socket%';

-- Distribution Boards
UPDATE materials SET name = '4-Way Consumer Unit surface (4-පාර DB පෙට්ටිය)'                            WHERE name LIKE '4-Way Consumer Unit%';
UPDATE materials SET name = '6-Way Consumer Unit surface (6-පාර DB පෙට්ටිය)'                            WHERE name LIKE '6-Way Consumer Unit%';
UPDATE materials SET name = '8-Way Consumer Unit surface (8-පාර DB පෙට්ටිය)'                            WHERE name LIKE '8-Way Consumer Unit%';
UPDATE materials SET name = '12-Way Consumer Unit surface (12-පාර DB පෙට්ටිය)'                          WHERE name LIKE '12-Way Consumer Unit%';
UPDATE materials SET name = '16-Way Consumer Unit surface (16-පාර DB පෙට්ටිය)'                          WHERE name LIKE '16-Way Consumer Unit%';
UPDATE materials SET name = 'DB Main Isolator 63A 2P (ප්‍රධාන අයිසොලේටරය 63A)'                          WHERE name LIKE 'DB Main Isolator 63A%';
UPDATE materials SET name = 'DB Main Isolator 100A 2P (ප්‍රධාන අයිසොලේටරය 100A)'                        WHERE name LIKE 'DB Main Isolator 100A%';
UPDATE materials SET name = 'Busbar Cover per unit (බස්බාර් ආවරණය)'                                     WHERE name LIKE 'Busbar Cover%';
UPDATE materials SET name = 'Din Rail 1m (ඩින් රේල් 1m)'                                                WHERE name LIKE 'Din Rail%';
UPDATE materials SET name = 'Cable Lug 16mm² pack 10 (කේබල් ලග් 16mm² ෂීට් 10)'                        WHERE name LIKE 'Cable Lug%';
UPDATE materials SET name = 'Earth Bar 10-way (භූ තීරය 10-පාර)'                                         WHERE name LIKE 'Earth Bar%';

-- MCBs & Protection
UPDATE materials SET name = 'MCB 6A Single Pole Type B (MCB 6A තනි පෝල්)'                               WHERE name LIKE 'MCB 6A%';
UPDATE materials SET name = 'MCB 10A Single Pole Type B (MCB 10A තනි පෝල්)'                             WHERE name LIKE 'MCB 10A%';
UPDATE materials SET name = 'MCB 16A Single Pole Type B (MCB 16A තනි පෝල්)'                             WHERE name LIKE 'MCB 16A Single Pole%';
UPDATE materials SET name = 'MCB 20A Single Pole Type B (MCB 20A තනි පෝල්)'                             WHERE name LIKE 'MCB 20A%';
UPDATE materials SET name = 'MCB 32A Single Pole Type B (MCB 32A තනි පෝල්)'                             WHERE name LIKE 'MCB 32A Single Pole%';
UPDATE materials SET name = 'MCB 40A Single Pole Type C (MCB 40A තනි පෝල්)'                             WHERE name LIKE 'MCB 40A%';
UPDATE materials SET name = 'MCB 63A Single Pole Type C (MCB 63A තනි පෝල්)'                             WHERE name LIKE 'MCB 63A%';
UPDATE materials SET name = 'MCB 16A Double Pole (MCB 16A ද්විත්ව පෝල්)'                                WHERE name LIKE 'MCB 16A Double%';
UPDATE materials SET name = 'MCB 32A Double Pole (MCB 32A ද්විත්ව පෝල්)'                                WHERE name LIKE 'MCB 32A Double%';
UPDATE materials SET name = 'RCCB 40A 30mA 2P (RCCB 40A)'                                               WHERE name LIKE 'RCCB 40A%';
UPDATE materials SET name = 'RCCB 63A 30mA 2P (RCCB 63A)'                                               WHERE name LIKE 'RCCB 63A%';
UPDATE materials SET name = 'RCBO 16A 30mA SP (RCBO 16A)'                                               WHERE name LIKE 'RCBO 16A%';
UPDATE materials SET name = 'RCBO 20A 30mA SP (RCBO 20A)'                                               WHERE name LIKE 'RCBO 20A%';
UPDATE materials SET name = 'RCBO 32A 30mA SP (RCBO 32A)'                                               WHERE name LIKE 'RCBO 32A%';
UPDATE materials SET name = 'Surge Protection Device SPD 1P (අධික ධාරා ආරක්ෂකය)'                       WHERE name LIKE 'Surge Protection%';
UPDATE materials SET name = 'Earth Leakage Relay 30mA (භූ කාන්දු රිලේ 30mA)'                           WHERE name LIKE 'Earth Leakage Relay%';

-- Lighting
UPDATE materials SET name = 'LED Bulb 9W E27 (LED බල්බ් 9W)'                                            WHERE name LIKE 'LED Bulb 9W%';
UPDATE materials SET name = 'LED Bulb 12W E27 (LED බල්බ් 12W)'                                          WHERE name LIKE 'LED Bulb 12W%';
UPDATE materials SET name = 'LED Downlight 9W Round (LED ඩව්න්ලයිට් 9W)'                               WHERE name LIKE 'LED Downlight 9W%';
UPDATE materials SET name = 'LED Downlight 12W Round (LED ඩව්න්ලයිට් 12W)'                             WHERE name LIKE 'LED Downlight 12W%';
UPDATE materials SET name = 'LED Panel Light 18W 300x300mm (LED පැනල් ලයිට් 18W)'                       WHERE name LIKE 'LED Panel Light%';
UPDATE materials SET name = 'LED Batten Light 18W 600mm (LED බැටන් ලයිට් 18W)'                         WHERE name LIKE 'LED Batten Light 18W%';
UPDATE materials SET name = 'LED Batten Light 36W 1200mm (LED බැටන් ලයිට් 36W)'                        WHERE name LIKE 'LED Batten Light 36W%';
UPDATE materials SET name = 'Fluorescent Tube 36W T8 (ෆ්ලෝරෙසන්ට් ටියුබ් 36W)'                        WHERE name LIKE 'Fluorescent Tube%';
UPDATE materials SET name = 'Fluorescent Fitting 2x36W (ෆ්ලෝරෙසන්ට් ෆිටිං 2x36W)'                     WHERE name LIKE 'Fluorescent Fitting%';
UPDATE materials SET name = 'Batten Lamp Holder surface (බැටන් ලාම්පු හෝල්ඩරය)'                         WHERE name LIKE 'Batten Lamp Holder%';
UPDATE materials SET name = 'Ceiling Rose 5A (සීලිං රෝස් 5A)'                                           WHERE name LIKE 'Ceiling Rose%';
UPDATE materials SET name = 'Pendant Lamp Holder B22 (පෙන්ඩන්ට් ලාම්පු හෝල්ඩරය)'                       WHERE name LIKE 'Pendant Lamp Holder%';
UPDATE materials SET name = 'Outdoor Bulkhead Light IP54 (එළිමහන් බල්ක්හෙඩ් ලයිට්)'                   WHERE name LIKE 'Outdoor Bulkhead%';
UPDATE materials SET name = 'Emergency Light Battery Backup (හදිසි ලයිට්)'                              WHERE name LIKE 'Emergency Light%';
UPDATE materials SET name = 'Exit Sign Light LED (පිටවීමේ සංඥා ලයිට්)'                                  WHERE name LIKE 'Exit Sign%';

-- Ceiling Fans
UPDATE materials SET name = 'Ceiling Fan 48" 3-blade (සීලිං ෆෑන් 48")'                                 WHERE name LIKE 'Ceiling Fan 48"%3-blade%';
UPDATE materials SET name = 'Ceiling Fan 56" 3-blade (සීලිං ෆෑන් 56")'                                 WHERE name LIKE 'Ceiling Fan 56"%';
UPDATE materials SET name = 'Ceiling Fan 48" with Light Kit (ලයිට් කිට් සහිත සීලිං ෆෑන් 48")'         WHERE name LIKE 'Ceiling Fan 48"%Light Kit%';
UPDATE materials SET name = 'Ceiling Fan Regulator 5-Speed (සීලිං ෆෑන් රෙගියුලේටරය)'                  WHERE name LIKE 'Ceiling Fan Regulator%';
UPDATE materials SET name = 'Ceiling Fan Remote Control Kit (රිමෝට් කන්ට්‍රෝල් කිට්)'                  WHERE name LIKE 'Ceiling Fan Remote%';
UPDATE materials SET name = 'Ceiling Fan Canopy Mounting Kit (කැනොපි මවුන්ටිං කිට්)'                   WHERE name LIKE 'Ceiling Fan Canopy%';
UPDATE materials SET name = 'Ceiling Fan Extension Rod 300mm (දිගු දණ්ඩ 300mm)'                         WHERE name LIKE 'Ceiling Fan Extension%';

-- AC & Water Heater
UPDATE materials SET name = 'AC Disconnect Switch 20A Isolator (AC ඉවත් කිරීමේ ස්විච් 20A)'            WHERE name LIKE 'AC Disconnect Switch 20A%';
UPDATE materials SET name = 'AC Disconnect Switch 32A Isolator (AC ඉවත් කිරීමේ ස්විච් 32A)'            WHERE name LIKE 'AC Disconnect Switch 32A%';
UPDATE materials SET name = 'Water Heater Isolator Switch 20A DP (වතුර හීටර් ස්විච් 20A)'              WHERE name LIKE 'Water Heater Isolator%';
UPDATE materials SET name = 'Flex Outlet Plate cooker/AC (ෆ්ලෙක්ස් අවුට්ලෙට් තහඩු)'                   WHERE name LIKE 'Flex Outlet%';
UPDATE materials SET name = 'Cable Tray 50mm per metre (කේබල් ට්‍රේ 50mm)'                              WHERE name LIKE 'Cable Tray%';
UPDATE materials SET name = 'Split AC Copper Pipe Set 3m (AC තඹ පයිප්ප කට්ටලය 3m)'                     WHERE name LIKE 'Split AC%';
UPDATE materials SET name = 'Earth Spike 1.2m Copper Clad (භූ ගැසීමේ කූරු 1.2m)'                      WHERE name LIKE 'Earth Spike%';

-- Accessories & Hardware
UPDATE materials SET name = 'Junction Box IP55 (ජංක්ෂන් බොක්සිය IP55)'                                 WHERE name LIKE 'Junction Box%';
UPDATE materials SET name = 'Wago 2-way Connector pack 10 (Wago 2-පාර සම්බන්ධකය)'                      WHERE name LIKE 'Wago 2-way%';
UPDATE materials SET name = 'Wago 3-way Connector pack 10 (Wago 3-පාර සම්බන්ධකය)'                      WHERE name LIKE 'Wago 3-way%';
UPDATE materials SET name = 'Insulation Tape roll (ඉන්සුලේෂන් ටේප් රෝල)'                               WHERE name LIKE 'Insulation Tape%';
UPDATE materials SET name = 'Cable Tie Pack 100 (කේබල් ටයි ඇසුරුම් 100)'                               WHERE name LIKE 'Cable Tie%';
UPDATE materials SET name = 'Cable Clip 20mm pack 50 (කේබල් ක්ලිප් 20mm)'                               WHERE name LIKE 'Cable Clip%';
UPDATE materials SET name = 'Rawl Plug Pack 100 (රොල් ප්ලග් ඇසුරුම 100)'                               WHERE name LIKE 'Rawl Plug%';
UPDATE materials SET name = 'Screw 3.5x25mm box 200 (ස්ක්‍රූ 3.5x25mm)'                                WHERE name LIKE 'Screw 3.5%';
UPDATE materials SET name = 'Wall Plug & Screw Set 50 pcs (වෝල් ප්ලග් සහ ස්ක්‍රූ කට්ටලය)'             WHERE name LIKE 'Wall Plug%';
UPDATE materials SET name = 'Blank Plate 1-gang (හිස් තහඩු 1-ගෑන්)'                                    WHERE name = 'Blank Plate 1-gang';
UPDATE materials SET name = 'Blank Plate 2-gang (හිස් තහඩු 2-ගෑන්)'                                    WHERE name = 'Blank Plate 2-gang';
UPDATE materials SET name = 'Fuse Holder 13A with fuse (ෆියුස් හෝල්ඩරය 13A)'                           WHERE name LIKE 'Fuse Holder%';
UPDATE materials SET name = 'Cord Grip Strain Relief 20mm (කෝඩ් ග්‍රිප් 20mm)'                         WHERE name LIKE 'Cord Grip%';
UPDATE materials SET name = 'Rubber Grommet 20mm pack 10 (රබර් ග්‍රොමිට් 20mm)'                        WHERE name LIKE 'Rubber Grommet%';
UPDATE materials SET name = 'Earth Terminal Block 10-way (භූ ටර්මිනල් බ්ලොකය)'                         WHERE name LIKE 'Earth Terminal%';

-- =====================================================
-- UPDATE: Add Sinhala names to labour items
-- =====================================================
UPDATE labour_items SET name = 'Lighting Point Installation (ලයිටිං පොයින්ට් ස්ථාපනය)'   WHERE name = 'Lighting Point Installation';
UPDATE labour_items SET name = 'Switch Installation (ස්විච් ස්ථාපනය)'                     WHERE name = 'Switch Installation';
UPDATE labour_items SET name = 'Socket Outlet Installation (සොකට් ස්ථාපනය)'               WHERE name = 'Socket Outlet Installation';
UPDATE labour_items SET name = 'Fan Point Installation (ෆෑන් පොයින්ට් ස්ථාපනය)'           WHERE name = 'Fan Point Installation';
UPDATE labour_items SET name = 'DB Board Installation (DB ස්ථාපනය)'                        WHERE name = 'DB Board Installation';
UPDATE labour_items SET name = 'DB Board Extension / Upgrade (DB දිගු කිරීම)'              WHERE name = 'DB Board Extension / Upgrade';
UPDATE labour_items SET name = 'MCB/RCCB Replacement (MCB/RCCB ආදේශනය)'                   WHERE name = 'MCB/RCCB Replacement';
UPDATE labour_items SET name = 'Main Incoming Cable underground (ප්‍රධාන සම්බන්ධ කේබල්)'  WHERE name = 'Main Incoming Cable (underground)';
UPDATE labour_items SET name = 'Conduit Installation (කොන්ඩ්‍යූට් ස්ථාපනය)'               WHERE name = 'Conduit Installation';
UPDATE labour_items SET name = 'Trunking Installation (ට්‍රංකිං ස්ථාපනය)'                  WHERE name = 'Trunking Installation';
UPDATE labour_items SET name = 'Earth Electrode Installation (භූ ඉලෙක්ට්‍රෝඩ ස්ථාපනය)'    WHERE name = 'Earth Electrode Installation';
UPDATE labour_items SET name = 'Ceiling Fan Installation (සීලිං ෆෑන් ස්ථාපනය)'            WHERE name = 'Ceiling Fan Installation';
UPDATE labour_items SET name = 'AC Wiring & Isolator (AC රැහැන් සහ අයිසොලේටරය)'          WHERE name LIKE 'AC Wiring%Isolator';
UPDATE labour_items SET name = 'Water Heater Wiring (වතුර හීටර් රැහැන්)'                  WHERE name = 'Water Heater Wiring';
UPDATE labour_items SET name = 'General Labour per hour (පොදු කම්කරු - පැයකට)'            WHERE name = 'General Labour (per hour)';
UPDATE labour_items SET name = 'General Labour per day (පොදු කම්කරු - දිනකට)'             WHERE name = 'General Labour (per day)';
UPDATE labour_items SET name = 'Cable Draw-in existing conduit (කේබල් ඇද ගැනීම)'          WHERE name LIKE 'Cable Draw-in%';
UPDATE labour_items SET name = 'Testing & Commissioning (පරීක්ෂා කිරීම සහ සක්‍රිය කිරීම)' WHERE name LIKE 'Testing%Commissioning';
UPDATE labour_items SET name = 'Fault Finding (දෝෂ සොයා ගැනීම)'                           WHERE name = 'Fault Finding';

-- =====================================================
-- UPDATE: Add Sinhala names to assemblies
-- =====================================================
UPDATE assemblies SET name = 'Standard Lighting Point (සාමාන්‍ය ලයිටිං පොයින්ට්)'             WHERE name = 'Standard Lighting Point';
UPDATE assemblies SET name = '13A Double Socket Point (13A ද්විත්ව සොකට් පොයින්ට්)'            WHERE name = '13A Double Socket Point';
UPDATE assemblies SET name = 'Ceiling Fan Point (සීලිං ෆෑන් පොයින්ට්)'                         WHERE name = 'Ceiling Fan Point';
UPDATE assemblies SET name = 'AC Wiring & Isolator Point (AC රැහැන් සහ අයිසොලේටර් පොයින්ට්)'  WHERE name LIKE 'AC Wiring%Isolator Point';
UPDATE assemblies SET name = 'Water Heater Wiring Point (වතුර හීටර් රැහැන් පොයින්ට්)'          WHERE name = 'Water Heater Wiring Point';
`;
