-- Run the whole file once in this project's Supabase SQL Editor.
-- Re-running preserves existing posts. The private schema must NOT be exposed
-- in Data API settings. Public RPCs return anonymous display data only.
begin;

create schema if not exists daejin_board;
revoke all on schema daejin_board from public, anon, authenticated;

create table if not exists daejin_board.posts (
  id uuid primary key default gen_random_uuid(),
  board text not null check (board in ('free', 'qna')),
  author_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 30),
  title text not null check (char_length(btrim(title)) between 1 and 150),
  content text not null check (char_length(btrim(content)) between 1 and 10000),
  code_snippet text not null default '' check (char_length(code_snippet) <= 10000),
  tags text[] not null default '{}' check (cardinality(tags) <= 8),
  accepted_comment_id uuid,
  created_at timestamptz not null default now()
);
create table if not exists daejin_board.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references daejin_board.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 3000),
  created_at timestamptz not null default now()
);
create table if not exists daejin_board.likes (
  post_id uuid not null references daejin_board.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);
do $$ begin
  if not exists (select 1 from pg_catalog.pg_constraint where conname = 'posts_accepted_comment_fk' and conrelid = 'daejin_board.posts'::regclass) then
    alter table daejin_board.posts add constraint posts_accepted_comment_fk
      foreign key (accepted_comment_id) references daejin_board.comments(id) on delete set null;
  end if;
end $$;
create index if not exists portal_posts_board_date on daejin_board.posts (board, created_at desc, id desc);
create index if not exists portal_comments_post_date on daejin_board.comments (post_id, created_at, id);
create index if not exists portal_posts_author on daejin_board.posts (author_id);
create index if not exists portal_comments_author on daejin_board.comments (author_id);
create index if not exists portal_likes_user on daejin_board.likes (user_id);
create index if not exists portal_posts_accepted on daejin_board.posts (accepted_comment_id);
alter table daejin_board.posts enable row level security;
alter table daejin_board.comments enable row level security;
alter table daejin_board.likes enable row level security;
revoke all on daejin_board.posts, daejin_board.comments, daejin_board.likes from public, anon, authenticated;

-- Internal helper. Never return author_id, auth metadata, email, or GitHub names.
create or replace function daejin_board.post_json(p_id uuid)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'id', p.id, 'board', p.board, 'category', p.category,
    'title', p.title, 'content', p.content, 'codeSnippet', p.code_snippet,
    'tags', p.tags, 'author', '익명', 'createdAt', p.created_at,
    'status', case when p.accepted_comment_id is null then 'WAITING' else 'SOLVED' end,
    'isOwner', coalesce(p.author_id = auth.uid(), false),
    'likes', (select count(*) from daejin_board.likes l where l.post_id = p.id),
    'liked', exists(select 1 from daejin_board.likes l where l.post_id = p.id and l.user_id = auth.uid()),
    'commentCount', (select count(*) from daejin_board.comments c where c.post_id = p.id)
  ) from daejin_board.posts p where p.id = p_id;
$$;
revoke all on function daejin_board.post_json(uuid) from public, anon, authenticated;

-- RPCs intentionally run as their owner to read private tables. Each write
-- checks auth.uid() and ownership. The search path is empty and all relations
-- are qualified; callers cannot supply an author/user ID or SQL expression.
create or replace function public.portal_list_posts(
  p_board text, p_page integer default 1, p_search text default '', p_status text default 'ALL'
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_total bigint; v_page integer; v_posts jsonb;
begin
  if p_board is null or p_board not in ('free', 'qna') or p_page is null or p_page < 1 or p_page > 999999
    or p_search is null or char_length(p_search) > 100 or p_status is null or p_status not in ('ALL', 'WAITING', 'SOLVED') then
    raise exception 'Invalid query' using errcode = '22023';
  end if;
  select count(*) into v_total from daejin_board.posts p
    where p.board = p_board
    and (p_search = '' or p.title ilike '%' || p_search || '%' or p.content ilike '%' || p_search || '%' or p.category ilike '%' || p_search || '%')
    and (p_status = 'ALL' or (p_status = 'WAITING' and p.accepted_comment_id is null) or (p_status = 'SOLVED' and p.accepted_comment_id is not null));
  v_page := least(p_page, greatest(1, ceil(v_total / 20.0)::integer));
  select coalesce(jsonb_agg(daejin_board.post_json(s.id) order by s.created_at desc, s.id desc), '[]'::jsonb) into v_posts
  from (
    select p.id, p.created_at from daejin_board.posts p
    where p.board = p_board
    and (p_search = '' or p.title ilike '%' || p_search || '%' or p.content ilike '%' || p_search || '%' or p.category ilike '%' || p_search || '%')
    and (p_status = 'ALL' or (p_status = 'WAITING' and p.accepted_comment_id is null) or (p_status = 'SOLVED' and p.accepted_comment_id is not null))
    order by p.created_at desc, p.id desc limit 20 offset (v_page - 1) * 20
  ) s;
  return jsonb_build_object('posts', v_posts, 'total', v_total, 'page', v_page, 'pageSize', 20);
end;
$$;

create or replace function public.portal_get_post(p_board text, p_id uuid, p_comment_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_post daejin_board.posts%rowtype; v_total bigint; v_pages integer; v_page integer; v_comments jsonb;
begin
  if p_board is null or p_board not in ('free', 'qna') or p_comment_page is null or p_comment_page < 1 or p_comment_page > 999999 then
    raise exception 'Invalid query' using errcode = '22023';
  end if;
  select * into v_post from daejin_board.posts where id = p_id and board = p_board;
  if not found then raise exception 'Post missing' using errcode = 'P0002'; end if;
  select count(*) into v_total from daejin_board.comments where post_id = p_id;
  v_pages := greatest(1, ceil(v_total / 50.0)::integer);
  v_page := least(p_comment_page, v_pages);
  with authors as (
    select author_id, min(created_at) as first_at from daejin_board.comments
    where post_id = p_id and author_id <> v_post.author_id group by author_id
  ), labels as (
    select author_id, row_number() over (order by first_at, author_id) as n from authors
  ), selected as (
    select c.*, l.n from daejin_board.comments c left join labels l on l.author_id = c.author_id
    where c.post_id = p_id order by c.created_at desc, c.id desc limit 50 offset (v_page - 1) * 50
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'content', c.content, 'createdAt', c.created_at,
    'author', case when c.author_id = v_post.author_id then '작성자' else '익명 ' || c.n::text end,
    'isOwner', coalesce(c.author_id = auth.uid(), false),
    'isPostAuthor', c.author_id = v_post.author_id,
    'isAccepted', coalesce(v_post.accepted_comment_id = c.id, false)
  ) order by c.created_at, c.id), '[]'::jsonb) into v_comments from selected c;
  return jsonb_build_object('post', daejin_board.post_json(p_id), 'comments', v_comments, 'commentPage', v_page, 'commentPages', v_pages);
end;
$$;

create or replace function public.portal_create_post(p_board text, p_category text, p_title text, p_content text, p_code text default '', p_tags text[] default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_board is null or p_board not in ('free', 'qna') or p_category is null or char_length(btrim(p_category)) not between 1 and 30
    or p_title is null or char_length(btrim(p_title)) not between 1 and 150
    or p_content is null or char_length(btrim(p_content)) not between 1 and 10000
    or char_length(coalesce(p_code, '')) > 10000 or coalesce(cardinality(p_tags), 0) > 8
    or exists(select 1 from unnest(p_tags) t where t is null or char_length(btrim(t)) not between 1 and 30) then
    raise exception 'Invalid content' using errcode = '22023';
  end if;
  insert into daejin_board.posts(board, author_id, category, title, content, code_snippet, tags)
    values(p_board, v_user, btrim(p_category), btrim(p_title), btrim(p_content), coalesce(p_code, ''), coalesce(p_tags, '{}')) returning id into v_id;
  return daejin_board.post_json(v_id);
end;
$$;

create or replace function public.portal_add_comment(p_board text, p_id uuid, p_content text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_content is null or char_length(btrim(p_content)) not between 1 and 3000 then raise exception 'Invalid comment' using errcode = '22023'; end if;
  if not exists(select 1 from daejin_board.posts where id = p_id and board = p_board) then raise exception 'Post missing' using errcode = 'P0002'; end if;
  insert into daejin_board.comments(post_id, author_id, content) values(p_id, v_user, btrim(p_content)) returning id into v_id;
  return jsonb_build_object('id', v_id);
end;
$$;

create or replace function public.portal_delete_post(p_board text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if not exists(select 1 from daejin_board.posts where id = p_id and board = p_board) then raise exception 'Post missing' using errcode = 'P0002'; end if;
  delete from daejin_board.posts where id = p_id and board = p_board and author_id = auth.uid();
  if not found then raise exception 'Not owner' using errcode = '42501'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.portal_delete_comment(p_board text, p_id uuid, p_comment_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if not exists(select 1 from daejin_board.posts where id = p_id and board = p_board) then raise exception 'Post missing' using errcode = 'P0002'; end if;
  delete from daejin_board.comments where id = p_comment_id and post_id = p_id and author_id = auth.uid();
  if not found then raise exception 'Not owner or comment missing' using errcode = '42501'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.portal_set_like(p_board text, p_id uuid, p_liked boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_liked is null then raise exception 'Invalid like' using errcode = '22023'; end if;
  if not exists(select 1 from daejin_board.posts where id = p_id and board = p_board) then raise exception 'Post missing' using errcode = 'P0002'; end if;
  if p_liked then
    insert into daejin_board.likes(post_id, user_id) values(p_id, v_user) on conflict do nothing;
  else delete from daejin_board.likes where post_id = p_id and user_id = v_user;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.portal_accept_answer(p_id uuid, p_comment_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_post daejin_board.posts%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  select * into v_post from daejin_board.posts where id = p_id and board = 'qna' for update;
  if not found then raise exception 'Question missing' using errcode = 'P0002'; end if;
  if v_post.author_id <> auth.uid() then raise exception 'Not question owner' using errcode = '42501'; end if;
  if p_comment_id is not null and not exists(select 1 from daejin_board.comments where id = p_comment_id and post_id = p_id) then
    raise exception 'Answer missing' using errcode = 'P0002';
  end if;
  update daejin_board.posts set accepted_comment_id = p_comment_id where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.portal_list_posts(text, integer, text, text) from public, anon, authenticated;
revoke all on function public.portal_get_post(text, uuid, integer) from public, anon, authenticated;
revoke all on function public.portal_create_post(text, text, text, text, text, text[]) from public, anon, authenticated;
revoke all on function public.portal_add_comment(text, uuid, text) from public, anon, authenticated;
revoke all on function public.portal_delete_post(text, uuid) from public, anon, authenticated;
revoke all on function public.portal_delete_comment(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.portal_set_like(text, uuid, boolean) from public, anon, authenticated;
revoke all on function public.portal_accept_answer(uuid, uuid) from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant execute on function public.portal_list_posts(text, integer, text, text), public.portal_get_post(text, uuid, integer) to anon, authenticated;
grant execute on function public.portal_create_post(text, text, text, text, text, text[]), public.portal_add_comment(text, uuid, text),
  public.portal_delete_post(text, uuid), public.portal_delete_comment(text, uuid, uuid), public.portal_set_like(text, uuid, boolean),
  public.portal_accept_answer(uuid, uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
