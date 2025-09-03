import supabase from "./supabase_init";

const ensure_user_session = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.setSession(session);
  } else {
    console.warn("No session found, user not signed in");
  }
  if (session?.user) {
    return session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Error creating anonymous user:", error);
    throw error;
  }

  return data.user?.id;
};

const fetch_user_id = async () => {
  return await ensure_user_session();
};

const is_authenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user && !session.user.is_anonymous;
};

export { fetch_user_id, ensure_user_session, is_authenticated };
