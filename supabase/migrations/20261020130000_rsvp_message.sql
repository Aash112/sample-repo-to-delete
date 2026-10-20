-- An optional wish/message from the guest, sent with their RSVP (replaces the separate wish wall).
alter table public.wedding_rsvps
  add column if not exists message text
  check (message is null or char_length(message) between 1 and 280);

-- The wish wall is no longer used.
drop table if exists public.wedding_wishes;
