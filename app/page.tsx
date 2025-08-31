import Link from 'next/link';

export default function Page() {
  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Welcome</h2>
        <p className="muted">Add your close family, then expand outward. Use the <b>People</b> tab to add/edit, and <b>Tree</b> to explore connections.</p>
        <div className="flex">
          <Link className="badge" href="/people">Go to People</Link>
          <Link className="badge" href="/tree">See Tree</Link>
        </div>
      </div>
      <div className="card">
        <h2>Quick Tips</h2>
        <ul>
          <li>Use Search filters to find people by name, sex, city, profession, or by parent/spouse names.</li>
          <li>Click a person card to edit details and add relationships.</li>
          <li>Upload avatars on the person’s profile. Photos are private by default.</li>
        </ul>
      </div>
    </div>
  );
}
