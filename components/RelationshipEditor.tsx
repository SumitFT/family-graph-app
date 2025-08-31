'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Person = { id: string, display_name: string };

export default function RelationshipEditor({ personId }:{ personId:string }){
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [parentId, setParentId] = useState<string>('');
  const [spouseId, setSpouseId] = useState<string>('');
  const [childId, setChildId] = useState<string>('');

  useEffect(() => {
    supabase.from('persons').select('id, display_name').order('display_name').then(({ data }) => {
      setAllPeople(data || []);
    });
  }, []);

  const addParent = async () => {
    if(!parentId) return;
    await supabase.from('relationships').insert({ type:'parent', from_person_id: parentId, to_person_id: personId });
    setParentId('');
    alert('Parent linked.');
  };

  const addSpouse = async () => {
    if(!spouseId) return;
    await supabase.from('relationships').insert({ type:'spouse', from_person_id: personId, to_person_id: spouseId });
    setSpouseId('');
    alert('Spouse linked.');
  };

  const addChild = async () => {
    if(!childId) return;
    await supabase.from('relationships').insert({ type:'parent', from_person_id: personId, to_person_id: childId });
    setChildId('');
    alert('Child linked.');
  };

  return (
    <div className="card">
      <div className="section-title">Relationships</div>
      <div className="grid cols-3">
        <div>
          <div className="hint">Add Parent</div>
          <select value={parentId} onChange={e=>setParentId(e.target.value)}>
            <option value="">Select person…</option>
            {allPeople.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <button onClick={addParent} style={{marginTop:8}}>Link Parent → This</button>
        </div>
        <div>
          <div className="hint">Add Spouse</div>
          <select value={spouseId} onChange={e=>setSpouseId(e.target.value)}>
            <option value="">Select person…</option>
            {allPeople.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <button onClick={addSpouse} style={{marginTop:8}}>Link Spouse</button>
        </div>
        <div>
          <div className="hint">Add Child</div>
          <select value={childId} onChange={e=>setChildId(e.target.value)}>
            <option value="">Select person…</option>
            {allPeople.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <button onClick={addChild} style={{marginTop:8}}>Link This → Child</button>
        </div>
      </div>
    </div>
  );
}
