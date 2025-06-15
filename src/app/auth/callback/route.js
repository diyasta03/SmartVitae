import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Ambil 'code' yang dikirim oleh Google melalui URL
  const { code } = req.query;

  if (code) {
    // Buat client Supabase di sisi server
    const supabase = createPagesServerClient({ req, res });
    try {
      // Tukarkan 'code' tersebut dengan sesi login yang valid
      await supabase.auth.exchangeCodeForSession(String(code));
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      // Jika ada error, arahkan ke halaman error atau halaman utama
      return res.redirect('/login?error=Authentication failed');
    }
  }

  // Setelah berhasil, arahkan pengguna ke halaman dashboard
  res.redirect('/');
}