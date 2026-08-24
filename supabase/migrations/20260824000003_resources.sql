-- Curated support resources, used as the retrieval corpus for report guidance.
--
-- The guidance model is not permitted to name an organisation, phone number, or URL that
-- is not a row in this table. A model asked for "next steps" will otherwise produce a
-- plausible-looking commission name and a plausible-looking phone number, and telling
-- someone to call a number that does not exist after they have been assaulted is worse
-- than telling them nothing.
--
-- Accuracy rule for anyone adding rows: url and phone are populated ONLY where the value
-- was read off the organisation's own site. Where it could not be confirmed the column is
-- null and the description says how to find the contact instead. A null is correct; a
-- wrong number is the worst outcome this table can produce. Do not pad this table.

create table support_resources (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,

  kind        text check (kind in
                ('police_non_emergency', 'human_rights', 'victim_services', 'legal_clinic',
                 'community_org', 'crisis_line', 'reporting_body')),

  province    text check (province in
                ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),

  scope       text check (scope in ('federal', 'provincial', 'municipal')),

  description text,
  url         text,
  phone       text,

  -- Incident categories this resource suits. Mirrors the incidents.category CHECK.
  applies_to  text[] not null default '{}'
                check (applies_to <@ array['vandalism', 'threat', 'assault', 'harassment',
                                           'intimidation', 'property_damage', 'online_hate',
                                           'other']::text[]),

  created_at  timestamptz not null default now(),

  -- A federal body has no province; anything narrower must name one. Retrieval filters on
  -- province, so a federal row carrying a province would drop out of every other province's
  -- candidate set.
  constraint support_resources_scope_province check (
    (scope = 'federal' and province is null) or (scope <> 'federal' and province is not null)
  )
);

create index support_resources_province_idx on support_resources (province);
create index support_resources_kind_idx on support_resources (kind);
create index support_resources_applies_to_idx on support_resources using gin (applies_to);

alter table support_resources enable row level security;

-- Public-interest reference data with no personal information in it. Read is open to both
-- roles so the frontend can render a resource list without a round trip through the Worker.
-- There is deliberately no INSERT/UPDATE/DELETE policy: this corpus is curated in migrations
-- and edited on the service role, never by a client.
create policy support_resources_select_public on support_resources
  for select to anon, authenticated
  using (true);

insert into support_resources (name, kind, province, scope, description, url, phone, applies_to) values

-- Federal.
('Canadian Human Rights Commission', 'human_rights', null, 'federal',
 'Handles discrimination complaints against federally regulated employers and services -- banks, airlines, telecoms, federal departments. Provincial commissions cover everything else.',
 'https://www.chrc-ccdp.gc.ca', '1-888-214-1090',
 array['harassment', 'intimidation', 'other']),

('Canadian Radio-television and Telecommunications Commission', 'reporting_body', null, 'federal',
 'Takes complaints about hate content carried on Canadian broadcast radio and television.',
 'https://crtc.gc.ca', '1-877-249-2782',
 array['online_hate', 'other']),

('National Council of Canadian Muslims', 'community_org', null, 'federal',
 'National Muslim civil liberties and advocacy organisation. Runs an incident reporting line and can provide legal referrals and case support after an anti-Muslim incident. Contact details are on their report-an-incident page.',
 'https://www.nccm.ca/report-an-incident/', null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'online_hate', 'other']),

('Canadian Race Relations Foundation', 'community_org', null, 'federal',
 'Federal Crown corporation working on racism and race relations. Publishes reporting guidance and community resources.',
 'https://crrf-fcrr.ca', '416-441-1900',
 array['harassment', 'intimidation', 'online_hate', 'other']),

('Canadian Anti-Hate Network', 'community_org', null, 'federal',
 'Non-profit that monitors organised hate activity in Canada. Useful where an incident appears connected to an organised group rather than an individual. Contact form is on their site; no public phone line.',
 'https://www.antihate.ca', null,
 array['threat', 'intimidation', 'online_hate', 'other']),

('Victim Services Directory (Department of Justice Canada)', 'victim_services', null, 'federal',
 'Searchable national directory of victim services by city and postal code. Use this to find the nearest service if your province is not listed separately here.',
 'https://www.justice.gc.ca/eng/cj-jp/victims-victimes/vsd-rsv/index.html', null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'online_hate', 'other']),

('Crime Stoppers', 'reporting_body', null, 'federal',
 'Anonymous tip line covering every Canadian program. Does not take caller ID. Use where you want the information to reach police without your name attached.',
 'https://www.canadiancrimestoppers.org', '1-800-222-8477',
 array['vandalism', 'threat', 'intimidation', 'property_damage', 'other']),

('Local police non-emergency line', 'police_non_emergency', null, 'federal',
 'Every police service has a non-emergency number for incidents that are over and not in progress. Search your municipality or region plus "police non-emergency", or check the service''s own website. Call 911 instead if anyone is in immediate danger.',
 null, null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

-- Crisis lines, federal.
('9-8-8 Suicide Crisis Helpline', 'crisis_line', null, 'federal',
 'Call or text 988, free, 24/7, English and French. For anyone in distress, not only those thinking about suicide.',
 'https://988.ca', '988',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'online_hate', 'other']),

('Naseeha Mental Health Helpline', 'crisis_line', null, 'federal',
 'Confidential peer support line focused on Muslim youth and young adults. Available in several languages including Arabic, Urdu, Farsi and Somali.',
 'https://www.naseeha.org', '1-866-627-3342',
 array['threat', 'assault', 'harassment', 'intimidation', 'online_hate', 'other']),

('Kids Help Phone', 'crisis_line', null, 'federal',
 'Free 24/7 support for young people. Call, or text CONNECT to 686868.',
 'https://kidshelpphone.ca', '1-800-668-6868',
 array['threat', 'assault', 'harassment', 'intimidation', 'online_hate', 'other']),

('Hope for Wellness Helpline', 'crisis_line', null, 'federal',
 'Free 24/7 counselling and crisis support for Indigenous people across Canada, in English, French, Cree, Ojibway and Inuktitut.',
 'https://www.hopeforwellness.ca', '1-855-242-3310',
 array['threat', 'assault', 'harassment', 'intimidation', 'other']),

-- Provincial and territorial human rights bodies.
('Ontario Human Rights Commission', 'human_rights', 'ON', 'provincial',
 'Provincial human rights policy body. Complaints themselves are filed with the Human Rights Tribunal of Ontario, not here.',
 'https://www.ohrc.on.ca', '1-800-387-9080',
 array['harassment', 'intimidation', 'other']),

('Human Rights Tribunal of Ontario', 'human_rights', 'ON', 'provincial',
 'Where a discrimination application under the Ontario Human Rights Code is actually filed. There is a one-year time limit from the incident.',
 'https://tribunalsontario.ca/hrto/', '1-866-598-0322',
 array['harassment', 'intimidation', 'other']),

('Human Rights Legal Support Centre', 'legal_clinic', 'ON', 'provincial',
 'Free legal advice and representation for people filing a human rights application in Ontario.',
 'https://hrlsc.on.ca', '1-866-625-5179',
 array['harassment', 'intimidation', 'other']),

('British Columbia Human Rights Tribunal', 'human_rights', 'BC', 'provincial',
 'Takes discrimination complaints under the BC Human Rights Code.',
 'https://www.bchrt.bc.ca', '1-888-440-8844',
 array['harassment', 'intimidation', 'other']),

('Alberta Human Rights Commission', 'human_rights', 'AB', 'provincial',
 'Confidential inquiry line for discrimination complaints under the Alberta Human Rights Act. Toll-free within Alberta by dialling 310-0000 first, then this number.',
 'https://albertahumanrights.ab.ca', '780-427-7661',
 array['harassment', 'intimidation', 'other']),

('Saskatchewan Human Rights Commission', 'human_rights', 'SK', 'provincial',
 'Takes discrimination complaints under The Saskatchewan Human Rights Code.',
 'https://saskhrc.ca', '1-800-667-9249',
 array['harassment', 'intimidation', 'other']),

('Manitoba Human Rights Commission', 'human_rights', 'MB', 'provincial',
 'Takes discrimination complaints under The Manitoba Human Rights Code.',
 'https://www.manitobahumanrights.ca', '1-888-884-8681',
 array['harassment', 'intimidation', 'other']),

('Commission des droits de la personne et des droits de la jeunesse', 'human_rights', 'QC', 'provincial',
 'Quebec''s human rights commission. Takes discrimination complaints under the Charter of Human Rights and Freedoms. Service in French and English.',
 'https://www.cdpdj.qc.ca', '1-800-361-6477',
 array['harassment', 'intimidation', 'other']),

('New Brunswick Human Rights Commission', 'human_rights', 'NB', 'provincial',
 'Takes discrimination complaints under the New Brunswick Human Rights Act.',
 'https://www.gnb.ca/en/departments/nbhrc.html', '1-888-471-2233',
 array['harassment', 'intimidation', 'other']),

('Nova Scotia Human Rights Commission', 'human_rights', 'NS', 'provincial',
 'Takes discrimination complaints under the Nova Scotia Human Rights Act.',
 'https://humanrights.novascotia.ca', '1-877-269-7699',
 array['harassment', 'intimidation', 'other']),

('Prince Edward Island Human Rights Commission', 'human_rights', 'PE', 'provincial',
 'Takes discrimination complaints under the PEI Human Rights Act.',
 'https://www.peihumanrights.ca', '902-368-4180',
 array['harassment', 'intimidation', 'other']),

('Newfoundland and Labrador Human Rights Commission', 'human_rights', 'NL', 'provincial',
 'Takes discrimination complaints under the Human Rights Act, 2010.',
 'https://thinkhumanrights.ca', '1-800-563-5808',
 array['harassment', 'intimidation', 'other']),

('Yukon Human Rights Commission', 'human_rights', 'YT', 'provincial',
 'Takes discrimination complaints under the Yukon Human Rights Act.',
 'https://yukonhumanrights.ca', '867-667-6226',
 array['harassment', 'intimidation', 'other']),

('Northwest Territories Human Rights Commission', 'human_rights', 'NT', 'provincial',
 'Takes discrimination complaints under the NWT Human Rights Act.',
 'https://nwthumanrights.ca', '1-888-669-5575',
 array['harassment', 'intimidation', 'other']),

('Nunavut Human Rights Tribunal', 'human_rights', 'NU', 'provincial',
 'Takes discrimination complaints under the Nunavut Human Rights Act.',
 'https://nhrt.ca', '1-866-413-6478',
 array['harassment', 'intimidation', 'other']),

-- Provincial victim services.
('Victim Support Line', 'victim_services', 'ON', 'provincial',
 'Ontario''s 24/7 multilingual information and referral line for victims of crime. Connects to local victim services.',
 'https://www.ontario.ca/page/victim-services-ontario', '1-888-579-2888',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('VictimLinkBC', 'victim_services', 'BC', 'provincial',
 'Free 24/7 confidential line for victims of crime in BC, available in about 150 languages. Call or text.',
 'https://www2.gov.bc.ca/gov/content/justice/criminal-justice/victims-of-crime/victimlinkbc', '1-800-563-0808',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Centre d''aide aux victimes d''actes criminels (CAVAC)', 'victim_services', 'QC', 'provincial',
 'Free, confidential support for victims of crime in every region of Quebec, whether or not a police complaint was filed. Call to be routed to your nearest CAVAC.',
 'https://cavac.qc.ca', '1-866-532-2822',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Nova Scotia Victim Services', 'victim_services', 'NS', 'provincial',
 'Provincial support for victims as a case moves through the criminal justice system. Regional offices across the province.',
 'https://novascotia.ca/just/victim_services/', '1-888-470-0773',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Manitoba Victim Services', 'victim_services', 'MB', 'provincial',
 'Provincial support for victims of serious crime, weekdays.',
 'https://www.gov.mb.ca/justice/vs/', '1-866-484-2846',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Newfoundland and Labrador Victim Services', 'victim_services', 'NL', 'provincial',
 'Provincial victim services office, with regional offices across the province.',
 'https://www.gov.nl.ca/victimservices/', '709-729-7970',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Alberta victim serving organisations', 'victim_services', 'AB', 'provincial',
 'Alberta delivers victim services through local organisations rather than one provincial line. Use the directory on this page to find the unit covering your area.',
 'https://www.alberta.ca/victim-services-units.aspx', null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Saskatchewan Victims Services', 'victim_services', 'SK', 'provincial',
 'Provincial victim services, delivered through regional offices and police-based units. Contact details for each office are on this page.',
 'https://www.saskatchewan.ca/victimsservices', null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('New Brunswick Victim Services', 'victim_services', 'NB', 'provincial',
 'Provincial victim services delivered through regional offices. Office contact numbers are listed on this page.',
 'https://www.gnb.ca/en/topic/laws-safety/courts-jails/victim-services.html', null,
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

-- Legal aid.
('Legal Aid Ontario', 'legal_clinic', 'ON', 'provincial',
 'Legal help for financially eligible Ontarians, and referrals to community legal clinics.',
 'https://www.legalaid.on.ca', '1-800-668-8258',
 array['threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Legal Aid BC', 'legal_clinic', 'BC', 'provincial',
 'Free legal information and advice for BC residents, with a call centre and local offices.',
 'https://legalaid.bc.ca', '1-866-577-2525',
 array['threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

-- Municipal police non-emergency lines. Only the largest services, each read off the
-- service's own site. Anywhere else, the generic federal-scope entry above applies.
('Toronto Police Service non-emergency', 'police_non_emergency', 'ON', 'municipal',
 'For incidents that are over and not in progress. Call 911 instead if anyone is in immediate danger.',
 'https://www.tps.ca', '416-808-2222',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Peel Regional Police non-emergency', 'police_non_emergency', 'ON', 'municipal',
 'Covers Mississauga and Brampton. For incidents that are over and not in progress.',
 'https://www.peelpolice.ca', '905-453-3311',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Ottawa Police Service non-emergency', 'police_non_emergency', 'ON', 'municipal',
 'For incidents that are over and not in progress. Online reporting is also available.',
 'https://www.ottawapolice.ca', '613-236-1222',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Vancouver Police Department non-emergency', 'police_non_emergency', 'BC', 'municipal',
 'For incidents that are over and not in progress. Online reporting is also available.',
 'https://vpd.ca', '604-717-3321',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Service de police de la Ville de Montreal non-urgent', 'police_non_emergency', 'QC', 'municipal',
 'For incidents needing police but not urgently, such as vandalism discovered after the fact.',
 'https://spvm.qc.ca', '514-280-2222',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Calgary Police Service non-emergency', 'police_non_emergency', 'AB', 'municipal',
 'For crimes not in progress, including break-ins, graffiti and property damage.',
 'https://www.calgarypolice.ca', '403-266-1234',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']),

('Edmonton Police Service non-emergency', 'police_non_emergency', 'AB', 'municipal',
 'Staffed 24/7 for incidents that do not need an immediate response.',
 'https://www.edmontonpolice.ca', '780-423-4567',
 array['vandalism', 'threat', 'assault', 'harassment', 'intimidation', 'property_damage', 'other']);
