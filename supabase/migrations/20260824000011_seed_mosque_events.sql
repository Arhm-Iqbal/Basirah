-- Sample events, so a mosque profile has something on it before that mosque's own listing
-- is connected. These are illustrative, not real listings.
--
-- They carry source 'seed' rather than 'admin' for two reasons: the UI can label them, and
-- clearing them is one statement -- delete from mosque_events where source = 'seed';
--
-- Dates are relative to when this runs, so applying it always yields upcoming events
-- rather than a fixed set that quietly ages out of mosque_upcoming_events().

alter table mosque_events drop constraint if exists mosque_events_source_check;
alter table mosque_events
  add constraint mosque_events_source_check
  check (source in ('ics', 'scraped', 'admin', 'seed'));

insert into mosque_events (mosque_id, title, description, starts_at, ends_at, source, source_ref)
select
  m.id,
  v.title,
  v.description,
  ((current_date + v.in_days) + v.at_time) at time zone 'America/Edmonton',
  ((current_date + v.in_days) + v.at_time) at time zone 'America/Edmonton'
    + (v.hours || ' hours')::interval,
  'seed',
  'seed-' || v.slug
from mosques m
join (
  values
    ('Masjid At-Taqwa', 'Open house and mosque tour',
     'A guided walk-through for neighbours and anyone who has not visited before. Tea afterwards.',
     6, time '18:30', 2, 'taqwa-open-house'),
    ('Masjid At-Taqwa', 'Community safety workshop',
     'What to do after a hate incident, how to document it, and who to contact.',
     13, time '19:00', 2, 'taqwa-safety-workshop'),
    ('Al Rashid Mosque', 'Youth halaqa',
     'Weekly circle for ages 13 to 18. New faces welcome.',
     4, time '18:00', 2, 'rashid-youth-halaqa'),
    ('Al Rashid Mosque', 'Food bank collection',
     'Non-perishable donations collected in the main hall for the local food bank.',
     11, time '10:00', 6, 'rashid-food-bank'),
    ('Al-Salaam Islamic Centre', 'Community potluck dinner',
     'Bring a dish to share. Families welcome.',
     8, time '18:00', 3, 'salaam-potluck'),
    ('Al-Salaam Islamic Centre', 'New Muslim welcome evening',
     'An informal evening for anyone new to the community, with a short talk and Q&A.',
     20, time '19:00', 2, 'salaam-welcome-evening'),
    ('Sahaba Mosque', 'Quran study circle',
     'Tafsir and recitation practice. All levels.',
     3, time '19:30', 1, 'sahaba-quran-circle'),
    ('Sahaba Mosque', 'Neighbourhood clean-up',
     'Meet at the main entrance. Gloves and bags provided.',
     17, time '09:30', 3, 'sahaba-clean-up'),
    ('Masjid Quba', 'Sisters wellness morning',
     'Coffee, a short talk on wellbeing, and time to meet others in the community.',
     9, time '10:00', 3, 'quba-wellness-morning'),
    ('Markaz-Ul-Islam', 'Family game night',
     'Board games, snacks, and space for kids to run around.',
     5, time '18:30', 3, 'markaz-family-night'),
    ('Muslim Community Mosque', 'Volunteer orientation',
     'For anyone wanting to help with weekend programmes and community meals.',
     7, time '19:00', 2, 'mcm-volunteer-orientation'),
    ('Rahma Mosque', 'Winter coat drive',
     'Gently used coats and boots collected for families across the city.',
     12, time '11:00', 5, 'rahma-coat-drive'),
    ('Annoor Islamic Centre', 'Arabic beginners class',
     'First session of an eight-week introduction to reading Arabic.',
     10, time '18:00', 2, 'annoor-arabic-class'),
    ('Masjid Bilal', 'Community breakfast',
     'Open to all. Volunteers arrive an hour earlier to set up.',
     15, time '09:00', 2, 'bilal-community-breakfast')
) as v(mosque_name, title, description, in_days, at_time, hours, slug)
  on m.name = v.mosque_name
where m.city = 'Edmonton'
on conflict (mosque_id, source_ref) do nothing;
