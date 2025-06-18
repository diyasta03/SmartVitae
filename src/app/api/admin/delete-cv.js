// pages/api/admin/delete-cv.js
import { createClient } from '@supabase/supabase-js';

// Pastikan environment variables ini diatur di file .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // INI SANGAT PENTING DAN HARUS SERVICE ROLE KEY ANDA
);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { cvId } = req.body;

  if (!cvId) {
    return res.status(400).json({ error: 'CV ID is required.' });
  }

  // --- PENTING: Verifikasi Admin di API Route ---
  // Ini adalah lapisan keamanan krusial.
  // Anda harus memverifikasi bahwa permintaan DELETE ini datang dari user yang terotentikasi sebagai admin.
  // Jika Anda belum mengimplementasikan ini, saatnya untuk melakukannya atau API Anda berpotensi dieksploitasi.
  // Contoh sederhana (membutuhkan pengiriman token dari frontend):
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: User is not an admin.' });
    }
    // --- Akhir Verifikasi Admin ---

    const { error: deleteError } = await supabaseAdmin
      .from('user_cvs')
      .delete()
      .eq('id', cvId);

    if (deleteError) {
      console.error('Error deleting CV in API route:', deleteError);
      return res.status(500).json({ error: deleteError.message || 'Gagal menghapus CV di database.' });
    }

    res.status(200).json({ message: 'CV berhasil dihapus.' });
  } catch (error) {
    console.error('Unhandled error in delete-cv API route:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan server yang tidak terduga.' });
  }
}