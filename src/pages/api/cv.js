import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    // Menyimpan CV baru
    const { cv_name, cv_data } = req.body;
    const { data, error } = await supabase
      .from('user_cvs')
      .insert({
        user_id: session.user.id,
        cv_name: cv_name,
        cv_data: cv_data,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } 
  // Anda bisa tambahkan method PUT untuk update nanti
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}