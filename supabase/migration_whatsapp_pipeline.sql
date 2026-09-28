-- ========================================================
-- LUMER OS - WHATSAPP AI AUTOMATION PIPELINE MIGRATION
-- ========================================================

-- Ensure client_code column & monthly_handling, amount_due on clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS monthly_handling NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS amount_due NUMERIC(12, 2) DEFAULT 0.00;

-- Ensure whatsapp_message_id on transactions table for audit tracing
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;

-- Ensure source on audit_logs table
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'WhatsApp';

-- Create table for AI Extractions if not exists
CREATE TABLE IF NOT EXISTS public.ai_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_message_id TEXT NOT NULL,
    intent TEXT NOT NULL,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'needs_review', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for AI extractions
CREATE INDEX IF NOT EXISTS idx_ai_extractions_wa_msg ON public.ai_extractions(whatsapp_message_id);

-- Enable RLS for ai_extractions
ALTER TABLE public.ai_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access on ai_extractions" ON public.ai_extractions FOR ALL USING (auth.role() = 'authenticated');
