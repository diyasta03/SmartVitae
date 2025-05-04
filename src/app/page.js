import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      height: '90vh',
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h1>Selamat datang di SmartVitae-Redistech Devloper Test(beta)</h1>
      <p>Buat CV profesional dengan mudah.</p>
      <Link href="/cv-maker">
        <button style={{
          marginTop: '1rem',
          padding: '1rem 2rem',
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1.2rem'
        }}>
          Buat CV Anda
        </button>
      </Link>
    </main>
  );
}