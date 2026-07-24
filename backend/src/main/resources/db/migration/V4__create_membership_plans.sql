CREATE TABLE membership_plans (
    id UUID PRIMARY KEY,
    plan VARCHAR(30) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_membership_plan_cycle
ON membership_plans(plan, billing_cycle);