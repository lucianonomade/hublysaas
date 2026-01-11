-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    title TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(5,2) DEFAULT 0,
    final_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_terms TEXT,
    delivery_time TEXT,
    observations TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    client_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_lead_id ON public.proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_proposals_share_token ON public.proposals(share_token);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);

-- Trigger
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can create own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can delete own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Public can view proposals with share token" ON public.proposals;
DROP POLICY IF EXISTS "Public can update proposal status" ON public.proposals;

CREATE POLICY "Users can view own proposals" ON public.proposals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own proposals" ON public.proposals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals" ON public.proposals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proposals" ON public.proposals
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view proposals with share token" ON public.proposals
    FOR SELECT USING (share_token IS NOT NULL);

CREATE POLICY "Public can update proposal status" ON public.proposals
    FOR UPDATE USING (share_token IS NOT NULL);
