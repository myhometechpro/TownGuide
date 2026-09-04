-- Verified physical-address coordinates used by the public map.
-- Several listings intentionally share coordinates because they occupy the same property.
update public.businesses as b
set latitude = v.latitude, longitude = v.longitude, updated_at = now()
from (values
  ('red-onion-bar-grill', 34.4207809::numeric, -110.5798145::numeric),
  ('d-m-outfitters', 34.4308948, -110.5984665),
  ('pit-stop-pizza', 34.3896280, -110.5454108),
  ('the-market-at-heber', 34.4299466, -110.5979119),
  ('heber-overgaard-chevron', 34.4182812, -110.5776666),
  ('dairy-queen-heber-overgaard', 34.4182812, -110.5776666),
  ('gustava-betty-soul-food', 34.4230109, -110.5809737),
  ('junk-warehouse', 34.3896280, -110.5454108),
  ('miss-bos-mercantile', 34.3920419, -110.5268472),
  ('mountain-top-fitness', 34.4137321, -110.5709614),
  ('napa-of-overgaard', 34.4043317, -110.5658764),
  ('packers-print-ship', 34.4142720, -110.5714550),
  ('the-cabin-bar-grill', 34.3947953, -110.5566808),
  ('woodchuck-saw-cycle', 34.4315177, -110.5934389),
  ('260-brewery-wild-women-saloon', 34.3901153, -110.5357908),
  ('arizona-building-supply', 34.4107584, -110.5699159),
  ('heber-rv-resort', 34.4267422, -110.5544046),
  ('rim-country-senior-center', 34.3868653, -110.5536686)
) as v(slug, latitude, longitude)
where b.slug = v.slug;
