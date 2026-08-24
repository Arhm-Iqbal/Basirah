-- Reports filed before contact details moved to the device still carry reporter_name,
-- reporter_email and reporter_phone in incidents.details. Removing them brings existing
-- rows in line with the rule the form now follows: the database holds an account of what
-- happened, not who reported it.
--
-- The report itself is untouched -- only the three contact keys are dropped.
update incidents
set details = details - 'reporter_name' - 'reporter_email' - 'reporter_phone'
where details ?| array['reporter_name', 'reporter_email', 'reporter_phone'];

update tips
set details = details - 'reporter_name' - 'reporter_email' - 'reporter_phone'
where details ?| array['reporter_name', 'reporter_email', 'reporter_phone'];
