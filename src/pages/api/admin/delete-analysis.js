// pages/api/admin/delete-analysis.js
import { createClient } from '@supabase/supabase-js';

// Pastikan environment variables ini diatur di file .env.local di ROOT proyek Anda.
// SERVER_SIDE environment variables TIDAK boleh diawali dengan NEXT_PUBLIC_.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // Ini harus diakses dengan NEXT_PUBLIC_
  process.env.SUPABASE_SERVICE_ROLE_KEY // INI SANGAT PENTING DAN HARUS SERVICE ROLE KEY ANDA
);

export default async function handler(req, res) {
  // Hanya izinkan metode DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { analysisId } = req.body; // Mengambil analysisId dari body permintaan

  if (!analysisId) {
    return res.status(400).json({ error: 'Analysis ID is required.' });
  }

  // --- PENTING: Verifikasi Admin di API Route ---
  // Ini adalah lapisan keamanan krusial.
  // Pastikan permintaan DELETE ini datang dari user yang terotentikasi sebagai admin.
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Ambil token dari header "Bearer token_jwt_anda"

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  try {
    // Verifikasi token menggunakan supabaseAdmin client (dengan service_role_key)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Token verification failed in delete-analysis API:", authError?.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Ambil profil user untuk memeriksa role-nya
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      console.warn("Attempted delete by non-admin user:", user.id);
      return res.status(403).json({ error: 'Forbidden: User is not an admin.' });
    }
    // --- Akhir Verifikasi Admin ---

    // Jika verifikasi admin berhasil, lanjutkan penghapusan riwayat analisis
    const { error: deleteError } = await supabaseAdmin
      .from('analysis_history')
      .delete()
      .eq('id', analysisId);

    if (deleteError) {
      console.error('Error deleting analysis in API route:', deleteError);
      return res.status(500).json({ error: deleteError.message || 'Gagal menghapus riwayat analisis di database.' });
    }

    // Berhasil dihapus
    res.status(200).json({ message: 'Riwayat analisis berhasil dihapus.' });
  } catch (error) {
    console.error('Unhandled exception in delete-analysis API route:', error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan server yang tidak terduga.' });
  }
}