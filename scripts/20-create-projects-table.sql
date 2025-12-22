-- Create Projects Table
-- This table stores projects that can be assigned to journal entry lines

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add project_id column to journal_entry_lines
ALTER TABLE journal_entry_lines 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_project_id ON journal_entry_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Insert default projects
INSERT INTO projects (id, name, description, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Project 1', 'Default project 1', true),
  ('00000000-0000-0000-0000-000000000002', 'Project 2', 'Default project 2', true),
  ('00000000-0000-0000-0000-000000000003', 'Project 3', 'Default project 3', true)
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE projects IS 'Projects that can be assigned to journal entry lines';
COMMENT ON COLUMN journal_entry_lines.project_id IS 'Reference to the project assigned to this journal entry line';

