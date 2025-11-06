CREATE TABLE IF NOT EXISTS list_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(50) DEFAULT 'edit',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    UNIQUE(list_id, user_id)
);

CREATE INDEX idx_collaborators_list_id ON list_collaborators(list_id);
CREATE INDEX idx_collaborators_user_id ON list_collaborators(user_id);
