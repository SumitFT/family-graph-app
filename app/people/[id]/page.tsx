'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PersonForm from '@/components/PersonForm';
import RelationshipEditor from '@/components/RelationshipEditor';

export default function PersonDetail(){
  const params = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [rels, setRels] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from('persons').select('*').eq('id', params.id).single();
    setPerson(data);
    const { data: r1 } = await supabase.from('relationships').select('*').or(`from_person_id.eq.${params.id},to_person_id.eq.${params.id}`);
    setRels(r1 || []);
  };
  useEffect(()=>{ load(); }, [params.id]);

  if (!person) return <div className="card">Loading…</div>;

  return (
    <div className="grid" style={{gap:20}}>
      <div className="card">
        <h2>{person.display_name}</h2>
        <PersonForm person={person} onSaved={()=>load()} />
      </div>

      <RelationshipEditor personId={params.id} />

      <div className="card">
        <div className="section-title">Raw relationships (debug)</div>
        <pre className="hint" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(rels, null, 2)}</pre>
      </div>
    </div>
  );
}
