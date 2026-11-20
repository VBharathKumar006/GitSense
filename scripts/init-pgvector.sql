-- ============================================================================
-- GitSense: PostgreSQL + pgvector Initialization Schema
-- Supports managed Postgres instances (Supabase, Neon, AWS RDS, Railway)
-- ============================================================================

-- 1. Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Repositories table
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(255) PRIMARY KEY, -- 'owner/name'
    owner VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    default_branch VARCHAR(50) DEFAULT 'main',
    commit_sha VARCHAR(40),
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    size_kb INTEGER DEFAULT 0,
    primary_language VARCHAR(50),
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repositories_owner_name ON repositories(owner, name);

-- 3. Code Chunks table with 768-dimensional vector embeddings (Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS code_chunks (
    id VARCHAR(255) PRIMARY KEY, -- 'filePath#Lstart-Lend'
    repo_id VARCHAR(255) NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    language VARCHAR(50),
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    content TEXT NOT NULL,
    chunk_type VARCHAR(50) DEFAULT 'function',
    symbol_name VARCHAR(100),
    embedding VECTOR(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_code_chunks_repo ON code_chunks(repo_id);
CREATE INDEX IF NOT EXISTS idx_code_chunks_file_path ON code_chunks(file_path);

-- 4. HNSW Vector Index for ultra-fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_code_chunks_embedding_hnsw 
ON code_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Stored Procedure for Hybrid / Vector Semantic Matching
CREATE OR REPLACE FUNCTION match_code_chunks(
    p_repo_id VARCHAR(255),
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id VARCHAR(255),
    file_path VARCHAR(500),
    file_name VARCHAR(100),
    language VARCHAR(50),
    start_line INT,
    end_line INT,
    content TEXT,
    chunk_type VARCHAR(50),
    symbol_name VARCHAR(100),
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.file_path,
        c.file_name,
        c.language,
        c.start_line,
        c.end_line,
        c.content,
        c.chunk_type,
        c.symbol_name,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM code_chunks c
    WHERE c.repo_id = p_repo_id
      AND c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
