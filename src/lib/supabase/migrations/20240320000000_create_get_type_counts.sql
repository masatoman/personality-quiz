-- タイプごとの回答数を取得する関数
create or replace function get_type_counts()
returns table (
  type text,
  count bigint
)
language sql
security definer
as $$
  select type, count(*)
  from results
  group by type;
$$; 