export type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
};

export type Env = { Bindings: Bindings };
