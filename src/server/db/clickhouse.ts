export const CLICKHOUSE_TIMELINE_DDL = `
CREATE TABLE IF NOT EXISTS homecoming_events (
  case_id String,
  project_id LowCardinality(String),
  event_time DateTime64(3),
  t_offset UInt32,
  event_type LowCardinality(String),
  event_code Nullable(Int32),
  event_message Nullable(String),
  platform LowCardinality(String),
  wallet LowCardinality(String),
  chain_id UInt64,
  target_chain_id UInt64
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_time)
ORDER BY (project_id, event_type, event_time, case_id)
TTL event_time + INTERVAL 90 DAY;
`;
