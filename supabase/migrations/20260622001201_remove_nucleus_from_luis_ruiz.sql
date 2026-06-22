begin;

delete from public.dashboard_decisions
where id = '3bfd2c54-42e4-40ee-837a-b21aa08fdba9';

delete from public.dashboard_system_links
where id = 'dd4fdeff-fe78-4b84-b55a-c969ac487ff0';

delete from public.journal
where id = 55;

drop trigger if exists on_auth_user_created_nucleus on auth.users;

drop table if exists public.nucleus_usage_logs;
drop table if exists public.nucleus_credit_transactions;
drop table if exists public.nucleus_credit_packages;
drop table if exists public.nucleus_model_pricing;
drop table if exists public.nucleus_subscription_plans;
drop table if exists public.nucleus_profiles;

drop function if exists public.handle_new_user_nucleus();
drop function if exists public.deduct_credits(uuid, int);
drop function if exists public.add_credits(uuid, int);

commit;
