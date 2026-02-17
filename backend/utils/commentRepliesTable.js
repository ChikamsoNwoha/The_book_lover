const db = require('../db');

const CREATE_COMMENT_REPLIES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS comment_replies (
    id INT NOT NULL AUTO_INCREMENT,
    comment_id INT NOT NULL,
    admin_id INT DEFAULT NULL,
    reply TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_comment_replies_comment (comment_id),
    KEY idx_comment_replies_admin (admin_id),
    CONSTRAINT fk_comment_replies_comment
      FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_replies_admin
      FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
`;

let ensurePromise = null;

const ensureCommentRepliesTable = async () => {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        await db.query('SELECT 1 FROM comment_replies LIMIT 1');
        return;
      } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') {
          throw err;
        }
      }

      await db.query(CREATE_COMMENT_REPLIES_TABLE_SQL);
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }

  await ensurePromise;
};

module.exports = {
  ensureCommentRepliesTable,
};
