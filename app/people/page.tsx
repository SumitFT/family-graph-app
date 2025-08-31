'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PersonForm from '@/components/PersonForm';
import Link from 'next/link';

type Person = {
  id: string;
  display_name: string;
  sex: string;
  birth_city: string | null;
  profession: string | null;
  avatar_url: string | null;
};

export default function PeoplePage(){
  const [people, setPeople] = useState<Person[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('persons').select('id, display_name, sex, birth_city, profession, avatar_url').order('display_name');
    if (error) alert(error.message);
    setPeople(data || []);
  };
  useEffect(()=>{ load(); }, []);

  const [filters, setFilters] = useState({ q:'', sex:'', birth_city:'', profession:'', parent_name:'', spouse_name:'' });
  const doSearch = async () => {
    const { data, error } = await supabase.rpc('search_people', {
      q_name: filters.q || null,
      p_sex: filters.sex || null,
      birth_city: filters.birth_city || null,
      spouse_name: filters.spouse_name || null,
      parent_name: filters.parent_name || null,
      profession: filters.profession || null
    });
    if (error) { alert(error.message); return; }
    setPeople(data || []);
  };

  return (
    <div className="grid" style={{gap:20}}>
      <div className="card">
        <div className="toolbar">
          <input placeholder="Search name…" value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} />
          <select value={filters.sex} onChange={e=>setFilters({...filters, sex:e.target.value})}>
            <option value="">Sex: Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>
          <input placeholder="Birth city" value={filters.birth_city} onChange={e=>setFilters({...filters, birth_city:e.target.value})} />
          <input placeholder="Profession" value={filters.profession} onChange={e=>setFilters({...filters, profession:e.target.value})} />
          <input placeholder="Parent name" value={filters.parent_name} onChange={e=>setFilters({...filters, parent_name:e.target.value})} />
          <input placeholder="Spouse name" value={filters.spouse_name} onChange={e=>setFilters({...filters, spouse_name:e.target.value})} />
          <button onClick={doSearch}>Search</button>
          <button onClick={()=>{ setFilters({ q:'', sex:'', birth_city:'', profession:'', parent_name:'', spouse_name:'' }); load(); }}>Reset</button>
          <div style={{flex:1}} />
          <button onClick={()=>setOpenAdd(true)}>+ Add person</button>
        </div>
      </div>

      {openAdd && (
        <div className="card">
          <h3>Add person</h3>
          <PersonForm onSaved={(id)=>{ setOpenAdd(false); load(); }} />
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>Person</th><th>Birth city</th><th>Profession</th></tr></thead>
          <tbody>
            {people.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex" style={{alignItems:'center'}}>
                    {p.avatar_url ? <img src={p.avatar_url} width={32} height={32} style={{borderRadius:8}}/> : <div className="badge">No photo</div>}
                    <Link href={`/people/${p.id}`}>{p.display_name}</Link>
                    <span className="badge">{p.sex}</span>
                  </div>
                </td>
                <td>{p.birth_city || '-'}</td>
                <td>{p.profession || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
