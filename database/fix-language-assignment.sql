-- ============================================
-- FIX EMAIL TEMPLATE LANGUAGE ASSIGNMENT
-- ============================================
-- This migration fixes the language assignment issue where templates
-- without explicit language values cause filtering problems

-- First, let's see what we have
SELECT 
    language,
    COUNT(*) as template_count,
    STRING_AGG(name, ', ' ORDER BY name) as template_names
FROM email_templates 
WHERE is_active = true
GROUP BY language
ORDER BY language;

-- Fix 1: Set language for templates that are clearly English based on content
-- Templates with English content that don't have language set
UPDATE email_templates 
SET language = 'en'
WHERE language IS NULL 
  AND is_active = true
  AND (
    name LIKE '%Welcome%' 
    OR name LIKE '%Customer Email%'
    OR name LIKE '%Partner Email%'
    OR name LIKE '%Follow%'
    OR name LIKE '%Thank%'
    OR name LIKE '%Training%'
    OR name LIKE '%Business%'
    OR name LIKE '%Product%'
    OR name LIKE '%Personal%'
    OR subject LIKE '%Welcome%'
    OR subject LIKE '%Thank%'
    OR subject LIKE '%Follow%'
    OR body_html LIKE '%Welcome%'
    OR body_html LIKE '%Thank you%'
    OR body_html LIKE '%follow up%'
  );

-- Fix 2: Set language for templates that are clearly Greek based on content
-- Templates with Greek content that don't have language set  
UPDATE email_templates 
SET language = 'gr'
WHERE language IS NULL 
  AND is_active = true
  AND (
    name LIKE '%Καλώς%'
    OR name LIKE '%Πελάτη%'
    OR name LIKE '%Συνεργάτη%'
    OR name LIKE '%Επανάσταση%'
    OR name LIKE '%Ελληνικά%'
    OR name LIKE '%Email Πελάτη%'
    OR name LIKE '%Email Συνεργάτη%'
    OR subject LIKE '%Καλώς%'
    OR subject LIKE '%Ευχαριστώ%'
    OR body_html LIKE '%Καλώς%'
    OR body_html LIKE '%Ευχαριστώ%'
    OR body_html LIKE '%Συνεργάτη%'
    OR body_html LIKE '%Πελάτη%'
  );

-- Fix 3: For any remaining templates without language, check template names/content patterns
-- If they have English words, set to English
UPDATE email_templates 
SET language = 'en'
WHERE language IS NULL 
  AND is_active = true
  AND (
    name ~ '[A-Za-z]'  -- Contains Latin characters
    AND name !~ '[Α-Ωα-ω]'  -- Does not contain Greek characters
  );

-- Fix 4: Any remaining NULL language templates that contain Greek characters
UPDATE email_templates 
SET language = 'gr'
WHERE language IS NULL 
  AND is_active = true
  AND name ~ '[Α-Ωα-ω]';  -- Contains Greek characters

-- Fix 5: Final safety net - any remaining NULL templates default to English
-- This should be very few or none after the above updates
UPDATE email_templates 
SET language = 'en'
WHERE language IS NULL 
  AND is_active = true;

-- Show the results after fixing
SELECT 
    language,
    COUNT(*) as template_count,
    STRING_AGG(name, ', ' ORDER BY name LIMIT 10) as sample_template_names
FROM email_templates 
WHERE is_active = true
GROUP BY language
ORDER BY language;

-- Verify no NULL languages remain
SELECT COUNT(*) as null_language_templates
FROM email_templates 
WHERE language IS NULL AND is_active = true;

SELECT 'Language assignment fix completed successfully!' as status; 