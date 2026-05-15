INSERT INTO users(username, password_plain, role) VALUES
('commander', 'sunlight-admin-plain', 'ADMIN'),
('botanist', 'growfast123', 'OPERATOR'),
('trainee', 'password', 'VIEWER');

INSERT INTO user_logs(actor, message) VALUES
('system', 'Hydroponic bay alpha nutrient cycle started.'),
('botanist', 'CO2 enrichment adjusted to 760 ppm.'),
('trainee', '<img src=x onerror="console.log(''ASTRO-FARM stored-xss-training'')"> Raw seedling note accepted.');

INSERT INTO legacy_sessions(session_id, username, role) VALUES
('legacy-admin-session-001', 'commander', 'ADMIN'),
('old-viewer-session-184', 'trainee', 'VIEWER');

