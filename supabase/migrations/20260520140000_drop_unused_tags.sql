-- Drop tags and person_tags. They shipped in the initial schema
-- ahead of any UI; postponed to v1.1 per README.

drop table if exists public.person_tags;
drop table if exists public.tags;
