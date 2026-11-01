-- =========================================================
-- FRANCHISE LEADS
-- =========================================================
--
-- Leads are pre-member prospects owned by a franchise's
-- district allocation.
--
-- Authorization geography is derived server-side from the
-- authenticated franchise user.
--
-- Territory assignment is optional. When present, the
-- composite foreign key guarantees that the territory
-- belongs to the same district allocation as the lead.
-- =========================================================

ALTER TABLE franchise_territories
    ADD CONSTRAINT uq_franchise_territory_allocation_id
        UNIQUE (district_allocation_id, id);


CREATE TABLE franchise_leads (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    district_allocation_id UUID NOT NULL,

    territory_id UUID,

    full_name VARCHAR(150) NOT NULL,

    mobile VARCHAR(30) NOT NULL,

    email VARCHAR(180),

    source VARCHAR(40) NOT NULL,

    status VARCHAR(40) NOT NULL DEFAULT 'NEW',

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_franchise_lead_allocation
        FOREIGN KEY (district_allocation_id)
        REFERENCES franchise_district_allocations(id),


    CONSTRAINT fk_franchise_lead_territory_scope
        FOREIGN KEY (
            district_allocation_id,
            territory_id
        )
        REFERENCES franchise_territories(
            district_allocation_id,
            id
        ),


    CONSTRAINT chk_franchise_lead_source
        CHECK (
            source IN (
                'WALK_IN',
                'PHONE',
                'WHATSAPP',
                'WEBSITE',
                'SOCIAL_MEDIA',
                'REFERRAL',
                'CHURCH',
                'EVENT',
                'OTHER'
            )
        ),


    CONSTRAINT chk_franchise_lead_status
        CHECK (
            status IN (
                'NEW',
                'CONTACTED',
                'FOLLOW_UP',
                'QUALIFIED',
                'CONVERTED',
                'LOST'
            )
        )
);


CREATE INDEX idx_franchise_leads_allocation
    ON franchise_leads(district_allocation_id);


CREATE INDEX idx_franchise_leads_territory
    ON franchise_leads(territory_id);


CREATE INDEX idx_franchise_leads_status
    ON franchise_leads(status);


CREATE INDEX idx_franchise_leads_created_at
    ON franchise_leads(created_at DESC);
