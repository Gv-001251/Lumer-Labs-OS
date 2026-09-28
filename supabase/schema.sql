-- ========================================================
-- LUMER OS DATABASE SCHEMA — SUPABASE POSTGRESQL MIGRATION
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_code TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    industry TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'onboarding', 'active', 'paused', 'closed')),
    notes TEXT,
    onboarding_date DATE DEFAULT CURRENT_DATE,
    closed_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    default_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    billing_type TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_type IN ('monthly', 'one_time', 'hourly')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CLIENT SERVICES
CREATE TABLE IF NOT EXISTS public.client_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    agreed_price NUMERIC(12, 2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'awaiting_approval', 'delivered', 'completed')),
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    completed_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PROJECT COSTS
CREATE TABLE IF NOT EXISTS public.project_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    cost_type TEXT NOT NULL CHECK (cost_type IN ('shoot', 'editing', 'gear_rental', 'travel', 'other')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    incurred_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    shoot_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    editing_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRANSACTIONS (CENTRAL FINANCIAL LEDGER)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code TEXT NOT NULL UNIQUE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    category TEXT NOT NULL CHECK (category IN (
        'monthly_subscription', 'website_development', 'social_media_management',
        'video_shoot', 'editing', 'team_wage', 'equipment', 'travel',
        'advertising', 'software', 'external_payment', 'other'
    )),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Bank Transfer', 'Credit Card', 'Cash', 'Check')),
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'cancelled')),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_inbox', 'imported')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WAGE PAYMENTS
CREATE TABLE IF NOT EXISTS public.wage_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    work_type TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'scheduled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RECURRING BILLING
CREATE TABLE IF NOT EXISTS public.recurring_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    client_service_id UUID REFERENCES public.client_services(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    next_due_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SOCIAL ACCOUNTS
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'LinkedIn', 'YouTube')),
    username TEXT NOT NULL,
    account_identifier TEXT,
    connection_status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SOCIAL METRICS
CREATE TABLE IF NOT EXISTS public.social_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    reporting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    followers INT NOT NULL DEFAULT 0,
    reach INT NOT NULL DEFAULT 0,
    impressions INT NOT NULL DEFAULT 0,
    views INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    shares INT NOT NULL DEFAULT 0,
    saves INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AI INBOX
CREATE TABLE IF NOT EXISTS public.ai_inbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_text TEXT NOT NULL,
    attachment_path TEXT,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    processing_status TEXT NOT NULL DEFAULT 'needs_review' CHECK (processing_status IN ('received', 'processing', 'needs_review', 'approved', 'rejected', 'failed')),
    confidence NUMERIC(5, 2),
    matched_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    approved_transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR OPTIMIZED QUERYING
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_social_metrics_date ON public.social_metrics(social_account_id, reporting_date);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform CRUD on all workspace tables
CREATE POLICY "Authenticated users full access on profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on client_services" ON public.client_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on project_costs" ON public.project_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on transactions" ON public.transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on team_members" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on wage_payments" ON public.wage_payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on recurring_billing" ON public.recurring_billing FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on social_accounts" ON public.social_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on social_metrics" ON public.social_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on ai_inbox" ON public.ai_inbox FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on audit_logs" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');

-- ========================================================
-- 15. WHATSAPP CLOUD API INTEGRATION TABLES
-- ========================================================

-- WhatsApp Conversations
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_id TEXT NOT NULL UNIQUE,
    phone_number_id TEXT NOT NULL,
    display_name TEXT,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WhatsApp Messages (Inbound & Outbound)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_message_id TEXT NOT NULL UNIQUE,
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message_type TEXT NOT NULL,
    text_body TEXT,
    media_id TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'received')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WhatsApp Message Status Updates (Sent, Delivered, Read, Failed)
CREATE TABLE IF NOT EXISTS public.whatsapp_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_status_id TEXT NOT NULL UNIQUE,
    wa_message_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipient_id TEXT NOT NULL,
    errors JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for WhatsApp querying
CREATE INDEX IF NOT EXISTS idx_wa_conv_wa_id ON public.whatsapp_conversations(wa_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_wa_msg_id ON public.whatsapp_messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_conv_id ON public.whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_status_wa_msg_id ON public.whatsapp_statuses(wa_message_id);

-- RLS Policies for WhatsApp Tables
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access on whatsapp_conversations" ON public.whatsapp_conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access on whatsapp_statuses" ON public.whatsapp_statuses FOR ALL USING (auth.role() = 'authenticated');

