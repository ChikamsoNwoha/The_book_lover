-- Newsletter tracking migration
-- Date: 2026-02-17

SET @has_verified_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'subscribers'
    AND COLUMN_NAME = 'verified_at'
);

SET @sql_add_verified_at := IF(
  @has_verified_at = 0,
  'ALTER TABLE subscribers ADD COLUMN verified_at TIMESTAMP NULL DEFAULT NULL AFTER verified',
  'SELECT 1'
);

PREPARE stmt_add_verified_at FROM @sql_add_verified_at;
EXECUTE stmt_add_verified_at;
DEALLOCATE PREPARE stmt_add_verified_at;

UPDATE subscribers
SET verified_at = COALESCE(verified_at, subscribed_at)
WHERE verified = TRUE;

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id BIGINT NOT NULL AUTO_INCREMENT,
  trigger_type ENUM('MANUAL', 'AUTO_ARTICLE') NOT NULL DEFAULT 'MANUAL',
  status ENUM('QUEUED', 'SENDING', 'COMPLETED', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'QUEUED',
  subject VARCHAR(255) NOT NULL,
  html_content LONGTEXT NOT NULL,
  article_id INT DEFAULT NULL,
  created_by_admin_id INT DEFAULT NULL,
  total_recipients INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  delivered_count INT NOT NULL DEFAULT 0,
  opened_count INT NOT NULL DEFAULT 0,
  clicked_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  bounced_count INT NOT NULL DEFAULT 0,
  complained_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL DEFAULT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  last_event_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_newsletter_campaigns_status (status),
  KEY idx_newsletter_campaigns_trigger (trigger_type),
  KEY idx_newsletter_campaigns_article (article_id),
  KEY idx_newsletter_campaigns_created_by (created_by_admin_id),
  CONSTRAINT fk_newsletter_campaigns_article
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE SET NULL,
  CONSTRAINT fk_newsletter_campaigns_admin
    FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  campaign_id BIGINT NOT NULL,
  subscriber_id INT DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  unsubscribe_token VARCHAR(64) DEFAULT NULL,
  status ENUM('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED', 'COMPLAINED')
    NOT NULL DEFAULT 'PENDING',
  provider_message_id VARCHAR(255) DEFAULT NULL,
  provider_response_code VARCHAR(100) DEFAULT NULL,
  provider_response_message TEXT,
  sent_at TIMESTAMP NULL DEFAULT NULL,
  delivered_at TIMESTAMP NULL DEFAULT NULL,
  opened_at TIMESTAMP NULL DEFAULT NULL,
  clicked_at TIMESTAMP NULL DEFAULT NULL,
  failed_at TIMESTAMP NULL DEFAULT NULL,
  bounced_at TIMESTAMP NULL DEFAULT NULL,
  complained_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_deliveries_campaign_email (campaign_id, email),
  KEY idx_newsletter_deliveries_status (status),
  KEY idx_newsletter_deliveries_message (provider_message_id),
  KEY idx_newsletter_deliveries_subscriber (subscriber_id),
  CONSTRAINT fk_newsletter_deliveries_campaign
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns (id) ON DELETE CASCADE,
  CONSTRAINT fk_newsletter_deliveries_subscriber
    FOREIGN KEY (subscriber_id) REFERENCES subscribers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS newsletter_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  campaign_id BIGINT DEFAULT NULL,
  delivery_id BIGINT DEFAULT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'resend',
  provider_event_id VARCHAR(255) NOT NULL,
  provider_message_id VARCHAR(255) DEFAULT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_timestamp DATETIME DEFAULT NULL,
  payload_json JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_events_provider_event (provider_event_id),
  KEY idx_newsletter_events_campaign (campaign_id),
  KEY idx_newsletter_events_delivery (delivery_id),
  KEY idx_newsletter_events_message (provider_message_id),
  CONSTRAINT fk_newsletter_events_campaign
    FOREIGN KEY (campaign_id) REFERENCES newsletter_campaigns (id) ON DELETE SET NULL,
  CONSTRAINT fk_newsletter_events_delivery
    FOREIGN KEY (delivery_id) REFERENCES newsletter_deliveries (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
