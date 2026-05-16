-- Audit / activity log table: records every create / update / delete done
-- through the app so admins can answer "who changed what, and when".

CREATE TABLE IF NOT EXISTS activity_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,
  user_name     TEXT,
  user_email    TEXT,
  user_role     TEXT,
  action        TEXT        NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE')),
  entity_type   TEXT        NOT NULL,
  entity_id     TEXT,
  entity_label  TEXT,
  details       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity     ON activity_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user       ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action     ON activity_logs (action);
