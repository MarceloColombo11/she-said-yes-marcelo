UPDATE "site_media"
SET
  "static_path" = regexp_replace("static_path", '\.(jpe?g|png)$', '.webp', 'i'),
  "mime" = 'image/webp'
WHERE "source" = 'static'
  AND "static_path" ~* '\.(jpe?g|png)$';
