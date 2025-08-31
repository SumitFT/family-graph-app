'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Person = {
  id?: string;
  display_name: string;
  sex?: 'male'|'female'|'nonbinary'|'unknown';
  dob?: string | null;
  birth_city?: string | null;
  birth_country?: string | null;
  current_city?: string | null;
  current_country?: string | null;
  profession?: string | null;
  bio?: string | null;
  deceased?: boolean;
  avatar_url?: string | null;
};

export default function PersonForm({ person, onSaved }: { person?: Person, onSaved?: (id: string)=>void }){
  const [form, setForm] = useState<Person>(person ?? { display_name: '', sex:'unknown', deceased:false });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ if(person) setForm(person); }, [person]);

  const save = async () => {
    setSaving(true);
    let id = form.id;
    if (!id) {
      const { data, error } = await supabase.from('persons').insert({
        display_name: form.display_name,
        sex: form.sex,
        dob: form.dob || null,
        birth_city: form.birth_city || null,
        birth_country: form.birth_country || null,
        current_city: form.current_city || null,
        current_country: form.current_country || null,
        profession: form.profession || null,
        bio: form.bio || null
      }).select('id').single();
      if (error) { alert(error.message); setSaving(false); return; }
      id = data!.id;
    } else {
      const { error } = await supabase.from('persons').update({
        display_name: form.display_name,
        sex: form.sex,
        dob: form.dob || null,
        birth_city: form.birth_city || null,
        birth_country: form.birth_country || null,
        current_city: form.current_city || null,
        current_country: form.current_country || null,
        profession: form.profession || null,
        bio: form.bio || null
      }).eq('id', id);
      if (error) { alert(error.message); setSaving(false); return; }
    }

    if (file && id) {
      const ext = file.name.split('.').pop();
      const path = `person-${id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) { alert(upErr.message); }
      else {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
        await supabase.from('persons').update({ avatar_url: publicUrl }).eq('id', id);
      }
    }

    setSaving(false);
    if (onSaved && id) onSaved(id);
  };

  return (
    <div className="flex-col">
      <div className="grid cols-2">
        <div className="flex-col">
          <label>Display name</label>
          <input value={form.display_name} onChange={e=>setForm({...form, display_name:e.target.value})} />
        </div>
        <div className="flex-col">
          <label>Sex</label>
          <select value={form.sex} onChange={e=>setForm({...form, sex: e.target.value as any})}>
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </div>
        <div className="flex-col">
          <label>Date of birth</label>
          <input type="date" value={form.dob ?? ''} onChange={e=>setForm({...form, dob:e.target.value})} />
        </div>
        <div className="flex-col">
          <label>Birth city</label>
          <input value={form.birth_city ?? ''} onChange={e=>setForm({...form, birth_city:e.target.value})} />
        </div>
        <div className="flex-col">
          <label>Current city</label>
          <input value={form.current_city ?? ''} onChange={e=>setForm({...form, current_city:e.target.value})} />
        </div>
        <div className="flex-col">
          <label>Profession</label>
          <input value={form.profession ?? ''} onChange={e=>setForm({...form, profession:e.target.value})} />
        </div>
        <div className="flex-col" style={{gridColumn:'span 2'}}>
          <label>Bio</label>
          <textarea value={form.bio ?? ''} onChange={e=>setForm({...form, bio:e.target.value})} />
        </div>
        <div className="flex-col">
          <label>Avatar</label>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <div className="flex">
        <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save person'}</button>
      </div>
    </div>
  );
}
