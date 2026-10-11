const TABLES = [
  'activity_logs',
  'notifications',
  'appointment_cancels',
  'appointment_changes',
  'appointments',
  'slots',
  'patients',
  'doctors',
  'hospital_departments',
  'hospitals',
  'departments',
];

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      open_time TEXT NOT NULL,
      close_time TEXT NOT NULL,
      lunch_start TEXT,
      lunch_end TEXT,
      sat_open INTEGER NOT NULL DEFAULT 0,
      sat_close TEXT,
      description TEXT,
      rating REAL
    );
    CREATE TABLE IF NOT EXISTS hospital_departments (
      hospital_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      PRIMARY KEY (hospital_id, department_id)
    );
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY,
      hospital_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      title TEXT,
      career TEXT,
      years INTEGER,
      work_days TEXT NOT NULL,
      tone INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      birth_year INTEGER,
      gender TEXT
    );
    CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      is_booked INTEGER NOT NULL DEFAULT 0,
      UNIQUE (doctor_id, date, time)
    );
    CREATE INDEX IF NOT EXISTS idx_slots_doctor_date ON slots (doctor_id, date);
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      hospital_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL,
      visit_reason TEXT,
      memo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments (patient_id);
    CREATE TABLE IF NOT EXISTS appointment_changes (
      id INTEGER PRIMARY KEY,
      appointment_id INTEGER NOT NULL,
      old_date TEXT NOT NULL,
      old_time TEXT NOT NULL,
      new_date TEXT NOT NULL,
      new_time TEXT NOT NULL,
      changed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS appointment_cancels (
      id INTEGER PRIMARY KEY,
      appointment_id INTEGER NOT NULL,
      reason TEXT,
      canceled_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY,
      patient_id INTEGER NOT NULL,
      appointment_id INTEGER,
      title TEXT NOT NULL,
      body TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY,
      patient_id INTEGER,
      appointment_id INTEGER,
      action TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

function clearAll(db) {
  for (const t of TABLES) db.exec(`DELETE FROM ${t};`);
}

module.exports = { createSchema, clearAll };

if (require.main === module) {
  const db = require('./connection');
  const { seedAll } = require('./seed');
  createSchema(db);
  clearAll(db);
  seedAll(db);
  console.log('[init] schema created and seeded');
}
