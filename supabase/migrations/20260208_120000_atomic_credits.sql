-- =============================================================================
-- ATOMIC CREDIT OPERATIONS
-- Prevents race conditions in credit balance modifications by using
-- single-statement updates with conditional checks.
-- =============================================================================

-- Atomically deduct credits. Returns the new balance, or -1 if insufficient.
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount int
)
returns int
language plpgsql
security definer
as $$
declare
  v_new_balance int;
begin
  update public.nucleus_profiles
  set credit_balance = credit_balance - p_amount,
      updated_at = now()
  where id = p_user_id
    and credit_balance >= p_amount
  returning credit_balance into v_new_balance;

  if not found then
    return -1;
  end if;

  return v_new_balance;
end;
$$;

-- Atomically add credits. Returns the new balance.
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount int
)
returns int
language plpgsql
security definer
as $$
declare
  v_new_balance int;
begin
  update public.nucleus_profiles
  set credit_balance = credit_balance + p_amount,
      updated_at = now()
  where id = p_user_id
  returning credit_balance into v_new_balance;

  if not found then
    raise exception 'Profile not found for user %', p_user_id;
  end if;

  return v_new_balance;
end;
$$;
