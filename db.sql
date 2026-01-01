CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  url VARCHAR(500),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE articles 
ADD UNIQUE KEY unique_url (url);

ALTER TABLE articles 
ADD published_at DATETIME NULL;

SELECT id, title, url 
FROM articles 
WHERE title IS NULL 
   OR url IS NULL;
   
SELECT * FROM articles
WHERE title IS NULL OR url IS NULL;
DELETE FROM articles
WHERE id = null;
DELETE FROM articles
WHERE id IN (448, 449);

SHOW INDEX FROM articles;

ALTER TABLE articles 
MODIFY title VARCHAR(255) NOT NULL,
MODIFY url VARCHAR(500) NOT NULL;
ALTER TABLE articles 
ADD CONSTRAINT unique_url UNIQUE (url);

SELECT COUNT(*) FROM articles;

SELECT 
  id, 
  title, 
  LENGTH(content) as content_length,
  CASE 
    WHEN content LIKE '%## References%' THEN 'Enhanced'
    ELSE 'Original'
  END as status
FROM articles
ORDER BY published_at DESC
LIMIT 10;
ALTER TABLE articles
ADD COLUMN original_content LONGTEXT NULL,
ADD COLUMN rewritten_content LONGTEXT NULL;
SELECT id, title, SUBSTRING(content, 1, 500) as content_preview
FROM articles 
WHERE content LIKE '%## References%'
LIMIT 1;

SELECT id, title, url, published_at,
       original_content,
       rewritten_content
FROM articles;

SELECT * FROM articles LIMIT 20;