import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your_supabase_url';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Page management helpers
export const createPage = async (pageData: any) => {
  const { data, error } = await supabase
    .from('pages')
    .insert([pageData])
    .select()
    .single();
  return { data, error };
};

export const updatePage = async (pageId: string, updates: any) => {
  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', pageId)
    .select()
    .single();
  return { data, error };
};

export const getPages = async (userId: string) => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getPage = async (pageId: string) => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .single();
  return { data, error };
};

export const deletePage = async (pageId: string) => {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);
  return { error };
};

// Analytics helpers
export const trackEvent = async (pageId: string, event: string, data?: any) => {
  const { error } = await supabase
    .from('analytics')
    .insert([{
      page_id: pageId,
      event,
      data,
      ip_address: '127.0.0.1', // Will be replaced by actual IP
      user_agent: navigator.userAgent
    }]);
  return { error };
};

export const getPageAnalytics = async (pageId: string) => {
  const { data, error } = await supabase
    .rpc('get_page_analytics', { page_uuid: pageId });
  return { data, error };
};

// Template helpers
export const getTemplates = async () => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createTemplate = async (templateData: any) => {
  const { data, error } = await supabase
    .from('templates')
    .insert([templateData])
    .select()
    .single();
  return { data, error };
};
