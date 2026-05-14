/*
  # Create weekly task planner schema

  1. New Tables
    - `weekly_plans` - Stores weekly planner configuration for each user
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `sleep_hours` (numeric) - Default 8 hours
      - `rest_hours` (numeric) - Default 2 hours
      - `day_start_time` (time) - Default 08:00
      - `buffer_minutes` (integer) - Default 15 minutes
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tasks` - Stores individual tasks
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `weekly_plan_id` (uuid, foreign key to weekly_plans)
      - `day_of_week` (integer, 0-6 for Mon-Sun)
      - `task_name` (text)
      - `duration_minutes` (integer)
      - `task_type` (text: 'required', 'additional', 'urgent', 'force_majeure')
      - `position` (integer) - Order in the day
      - `calculated_start_time` (time) - Auto-calculated
      - `calculated_end_time` (time) - Auto-calculated
      - `fitted` (boolean) - Whether task fits in the day
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_hours numeric NOT NULL DEFAULT 8,
  rest_hours numeric NOT NULL DEFAULT 2,
  day_start_time time NOT NULL DEFAULT '08:00',
  buffer_minutes integer NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_plan_id uuid NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  task_name text NOT NULL,
  duration_minutes integer NOT NULL,
  task_type text NOT NULL DEFAULT 'required' CHECK (task_type IN ('required', 'additional', 'urgent', 'force_majeure')),
  position integer NOT NULL DEFAULT 0,
  calculated_start_time time,
  calculated_end_time time,
  fitted boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly plans"
  ON weekly_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly plans"
  ON weekly_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly plans"
  ON weekly_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly plans"
  ON weekly_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tasks_user_id_day_idx ON tasks(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS tasks_weekly_plan_id_idx ON tasks(weekly_plan_id);
CREATE INDEX IF NOT EXISTS weekly_plans_user_id_idx ON weekly_plans(user_id);
