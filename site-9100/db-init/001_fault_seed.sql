CREATE TABLE IF NOT EXISTS intersections (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  district VARCHAR(80) NOT NULL,
  signal_phase VARCHAR(16) NOT NULL,
  cycle_seconds INT NOT NULL,
  vehicle_queue INT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS traffic_event_log (
  id BIGSERIAL PRIMARY KEY,
  intersection_code VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  severity VARCHAR(16) NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intersections_code ON intersections(code);

INSERT INTO intersections(code, district, signal_phase, cycle_seconds, vehicle_queue)
VALUES
  ('JCT-SEOUL-001', 'Gangnam Smart Grid', 'GREEN', 74, 31),
  ('JCT-SEOUL-014', 'Digital Media Spine', 'AMBER', 38, 72),
  ('JCT-SEOUL-027', 'Han River East', 'RED', 92, 118),
  ('JCT-SEOUL-052', 'Metropolis Core', 'GREEN', 66, 44)
ON CONFLICT (code) DO NOTHING;

INSERT INTO traffic_event_log(intersection_code, event_type, severity, payload)
SELECT 'JCT-SEOUL-001', 'UNPARTITIONED_LOG_SCAN', 'WARN', repeat('signal telemetry payload ', 20)
FROM generate_series(1, 1200);
