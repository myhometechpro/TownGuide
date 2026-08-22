-- Clearly fictional development records. Never present these as verified businesses.
insert into public.businesses(name,slug,category,short_description,description,address,phone,website,featured,sponsored) values
('Pine Ridge Coffee — DEMO','pine-ridge-coffee','Coffee','Small-batch coffee and mountain mornings.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0101','#',true,true),
('Rim Country Grill — DEMO','rim-country-grill','Restaurants','High-country comfort food.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0102','#',true,false),
('Mountain Mercantile — DEMO','mountain-mercantile','Shopping','Trail goods and gifts.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0103','#',false,false),
('High Country Cabins — DEMO','high-country-cabins','Lodging','A cozy mountain basecamp.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0104','#',true,false),
('Rimside Outfitters — DEMO','rimside-outfitters','Outdoor & Adventure','Gear up for outside.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0105','#',false,false),
('Juniper Bakery — DEMO','juniper-bakery','Restaurants','Fresh pastries.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0106','#',false,false),
('Ponderosa Realty — DEMO','ponderosa-realty','Real Estate','High-country homes.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0107','#',false,false),
('Blue Sky Market — DEMO','blue-sky-market','Shopping','Everyday essentials.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0108','#',false,false),
('Forest Auto Care — DEMO','forest-auto-care','Automotive','Help for the road.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0109','#',false,false),
('Rim Country Services — DEMO','rim-country-services','Home Services','Mountain home help.','Unverified demonstration listing.','Demo address, Heber-Overgaard, AZ','(928) 555-0110','#',false,false);
insert into public.qr_locations(code,name,location_description) values ('001','Demo Welcome Point 1','DEMO'),('002','Demo Welcome Point 2','DEMO'),('coffee01','Demo Coffee Location','DEMO'),('cabin03','Demo Cabin Location','DEMO'),('shop01','Demo Shop Location','DEMO');
