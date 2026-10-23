-- Add the college introduction illustration only where no editor cover exists.
update public.pages
set cover_url = 'https://lgbwidraztavhhbnbfhr.supabase.co/storage/v1/object/public/media/generated/2026-10/family-online-quran-study-1200.webp',
    cover_alt = 'Mother helping her son practise an Arabic workbook during an online lesson at home'
where slug = 'about' and coalesce(cover_url, '') = '';
