-- Demo players so "Find players" and the welcome requests have content out of
-- the box. These have no auth account — they're discoverable and can be the
-- sender/recipient of requests, but never log in. Delete this migration (and
-- the rows) if you want a clean, real-users-only database.

insert into public.profiles (id, name, email, ntrp, area, is_demo) values
  ('00000000-0000-4000-8000-000000000001', 'Maya Okonkwo',  'maya@rally.demo',   '3.5', 'Prospect Heights', true),
  ('00000000-0000-4000-8000-000000000002', 'Daniel Reyes',  'daniel@rally.demo', '4.0', 'Mission Dolores',  true),
  ('00000000-0000-4000-8000-000000000003', 'Priya Nair',    'priya@rally.demo',  '3.0', 'Riverside',        true),
  ('00000000-0000-4000-8000-000000000004', 'Marcus Lee',    'marcus@rally.demo', '4.5', 'Lincoln Park',     true),
  ('00000000-0000-4000-8000-000000000005', 'Sofia Romano',  'sofia@rally.demo',  '3.5', 'Golden Gate',      true),
  ('00000000-0000-4000-8000-000000000006', 'Jordan Blake',  'jordan@rally.demo', '4.0', 'Hyde Park',        true);

insert into public.availability (user_id, slots, note) values
  ('00000000-0000-4000-8000-000000000001', array['Tue|Evening','Thu|Evening','Sat|Morning'],
    'Consistent baseliner, love long rallies. Happy to split court fees.'),
  ('00000000-0000-4000-8000-000000000002', array['Mon|Morning','Wed|Morning','Sat|Midday'],
    'Competitive but friendly. Looking for someone to push me before league season.'),
  ('00000000-0000-4000-8000-000000000003', array['Sun|Morning','Wed|Evening'],
    'Newer player, working on consistency. Patient hitting partners welcome!'),
  ('00000000-0000-4000-8000-000000000004', array['Fri|Evening','Sat|Morning','Sun|Midday'],
    '4.5, used to play college club. Down for sets or drilling.'),
  ('00000000-0000-4000-8000-000000000005', array['Tue|Midday','Thu|Midday','Sun|Morning'],
    'Flexible on weekday middays — work from home. All-court game.'),
  ('00000000-0000-4000-8000-000000000006', array['Mon|Evening','Wed|Evening','Fri|Evening'],
    'Evenings only after work. Strong serve, working on my backhand.');
