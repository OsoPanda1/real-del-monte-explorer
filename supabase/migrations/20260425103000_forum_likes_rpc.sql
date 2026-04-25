-- Secure RPC to increment likes without granting broad UPDATE permissions.
create or replace function public.increment_forum_post_likes(post_uuid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_likes integer;
begin
  update public.forum_posts
  set likes = likes + 1,
      updated_at = now()
  where id = post_uuid
    and is_approved = true
  returning likes into updated_likes;

  if updated_likes is null then
    raise exception 'Post not found or not approved';
  end if;

  return updated_likes;
end;
$$;

revoke all on function public.increment_forum_post_likes(uuid) from public;
grant execute on function public.increment_forum_post_likes(uuid) to anon, authenticated;
