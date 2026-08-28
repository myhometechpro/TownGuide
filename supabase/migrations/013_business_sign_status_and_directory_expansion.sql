alter table public.businesses
  add column if not exists displaying_qr_sign boolean not null default false;

comment on column public.businesses.displaying_qr_sign is
  'True when the business has received its tracked TownGuide QR sign and is displaying it.';

insert into public.businesses
  (name,slug,category,short_description,description,address,phone,website,location_type,active)
values
  ('260 Brewery & Distillery · Wild Women Saloon & Grill','260-brewery-wild-women-saloon','Restaurants','Brewery, distillery, saloon, and grill on Highway 260.','A local brewery, distillery, saloon, and grill listed by the Heber-Overgaard Chamber. Confirm current hours and offerings directly.','2279 Hwy 260, Overgaard, AZ 85933','(562) 233-1817','https://heberovergaard.org/member-directory/','physical',true),
  ('Amore Rim Salon','amore-rim-salon','Health & Wellness','Full-service local beauty salon.','A full-service beauty salon serving Heber-Overgaard. Contact the business directly for current services, appointments, and hours.','1900 Hwy 260, Heber, AZ 85928','(928) 535-5422','https://heberovergaard.org/member-directory/','physical',true),
  ('Arizona Building Supply','arizona-building-supply','Home Services','Building materials and supplies in Heber.','A local building-supply business serving residents, property owners, and contractors. Confirm current inventory and hours directly.','2950 Hwy 260, Heber, AZ 85928','(928) 535-5356','https://heberovergaard.org/member-directory/','physical',true),
  ('Bolt Adventures Transport & Containers','bolt-adventures-transport-containers','Professional Services','Transport and container services in Overgaard.','A local transport and container-services business listed by the Heber-Overgaard Chamber. Contact the business for current services and availability.','2849 SR 260, Overgaard, AZ 85933','(480) 400-0995','https://heberovergaard.org/member-directory/','physical',true),
  ('Bryce Computers','bryce-computers','Professional Services','Local computer and technology services.','A local technology-services business serving the Heber-Overgaard community. Contact the business for current support options and hours.','3401 Kimball St, Heber, AZ 85928','(928) 940-6090','https://heberovergaard.org/member-directory/','physical',true),
  ('Canyon Rim Dental Heber','canyon-rim-dental-heber','Health & Wellness','Local dental care focused on health and aesthetics.','A Heber dental practice providing personalized dental care. Contact the office directly for services, appointments, and insurance information.','3387 Sawmill Pointe Rd #369, Heber, AZ 85928','(928) 228-5446','https://heberovergaard.org/member-directory/','physical',true),
  ('Country Club Storage','country-club-storage','Professional Services','Storage services in Overgaard.','A local storage business in Overgaard. Contact the business directly for unit availability, rates, access, and current office hours.','2762 Mogollon Dr, Overgaard, AZ 85933','(928) 240-1700','https://heberovergaard.org/member-directory/','physical',true),
  ('Golden Soul Massage Studio','golden-soul-massage-studio','Health & Wellness','Massage studio at Bison Ranch.','A local massage studio at Bison Ranch. Contact the business directly for current services, appointments, and hours.','2377 Bison Ranch Trail #116, Overgaard, AZ 85933','(480) 283-7191','https://heberovergaard.org/member-directory/','physical',true),
  ('Heber RV Resort','heber-rv-resort','Lodging','RV spaces and high-country stays near Highway 277.','An RV resort serving Heber-Overgaard visitors. Confirm current rates, availability, amenities, and seasonal information directly.','3065 AZ Hwy 277, Overgaard, AZ 85933','(928) 535-4004','https://heberovergaard.org/member-directory/','physical',true),
  ('Lady Nay''s Boutique','lady-nays-boutique','Shopping','Local boutique inside the Big Red Barn marketplace.','A local boutique at the Big Red Barn marketplace. Confirm current merchandise and hours directly.','3402 Kimball St, Heber, AZ 85928','(909) 531-3582','https://heberovergaard.org/member-directory/','physical',true),
  ('Overgaard Market','overgaard-market','Shopping','Neighborhood market on Mogollon Drive.','A neighborhood market serving Overgaard residents and visitors. Confirm current products and hours directly.','2737 Mogollon Dr, Overgaard, AZ 85933','(928) 535-4681','https://heberovergaard.org/member-directory/','physical',true),
  ('Pots Plus','pots-plus','Shopping','Local retail shop on Highway 260.','A local retail business listed by the Heber-Overgaard Chamber. Contact the business directly for current merchandise and hours.','2955 Hwy 260 Ste D, Overgaard, AZ 85933','(928) 240-1638','https://heberovergaard.org/member-directory/','physical',true),
  ('Rim Country Senior Center','rim-country-senior-center','Professional Services','Community senior center in Overgaard.','A local senior center serving the Rim Country community. Contact the center for current programs, meals, events, and hours.','2171 B St, Overgaard, AZ 85933','(928) 535-5525','https://heberovergaard.org/member-directory/','physical',true)
on conflict (slug) do update set
  name=excluded.name,
  category=excluded.category,
  short_description=excluded.short_description,
  description=excluded.description,
  address=excluded.address,
  phone=excluded.phone,
  website=excluded.website,
  location_type=excluded.location_type,
  active=excluded.active,
  updated_at=now();
