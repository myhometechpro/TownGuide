alter table public.trails add column if not exists official_url text;

update public.trails set
  official_url = 'https://www.fs.usda.gov/Internet/FSE_DOCUMENTS/stelprdb5380979.pdf',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=Rim+Vista+Trail+Woods+Canyon+Lake+Arizona'
where slug = 'rim-vista-trail';

update public.trails set
  official_url = 'https://www.fs.usda.gov/recarea/asnf/recarea/?recid=45157',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=235+Road+Trail+Forest+Lakes+Arizona'
where slug = '235-road-trail';

update public.trails set
  official_url = 'https://www.fs.usda.gov/recarea/asnf/recarea/?recid=45157',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=237+B+Trailhead+Forest+Lakes+Arizona'
where slug = '237-b-ohv-trail';

update public.trails set
  official_url = 'https://www.fs.usda.gov/recarea/asnf/recarea/?recid=45157',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=99A+OHV+Trail+Forest+Lakes+Arizona'
where slug = '99a-ohv-trail';

update public.trails set
  official_url = 'https://www.fs.usda.gov/Internet/FSE_DOCUMENTS/fsbdev7_012510.pdf',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=Woods+Canyon+Lake+Trail+Arizona'
where slug = 'woods-canyon-lake-trail';

update public.trails set
  name = 'General Crook National Recreation Trail',
  slug = 'general-crook-national-recreation-trail',
  description = 'A historic long-distance route following portions of the Mogollon Rim. Choose and plan a specific segment using the official Forest Service map before setting out.',
  distance = 'Choose a segment',
  difficulty = 'Moderate',
  estimated_duration = 'Varies',
  activity_type = 'Hiking',
  family_friendly = false,
  official_url = 'https://www.fs.usda.gov/Internet/FSE_DOCUMENTS/fseprd1000480.pdf',
  directions_url = 'https://www.google.com/maps/search/?api=1&query=General+Crook+National+Recreation+Trail+Mogollon+Rim+Arizona',
  updated_at = now()
where slug = 'mogollon-rim-trail-corridor';
