/*
  # Employee Status Tracking System

  1. New Tables
    - `empStatus`: Tracks employee status with timestamps
      - `id` (serial, primary key)
      - `EmpID` (varchar, required)
      - `EmpName` (varchar, required)
      - `Time` (text, auto-generated current time)
      - `Date` (date, auto-generated current date)

  2. Security
    - Enable RLS on `empStatus` table
    - Add policies for authenticated users
*/

CREATE TABLE "empStatus" (
  id SERIAL PRIMARY KEY,
  EmpID VARCHAR NOT NULL,
  EmpName VARCHAR NOT NULL,
  "Time" TEXT DEFAULT TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'HH12:MI:SS AM'),
  "Date" DATE DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE
);

-- Enable Row Level Security
ALTER TABLE empStatus ENABLE ROW LEVEL SECURITY;

-- Create new policies for public access
CREATE POLICY "Enable read access for all users"
  ON empStatus
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON empStatus
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON empStatus
  FOR DELETE
  TO PUBLIC
  USING (true);