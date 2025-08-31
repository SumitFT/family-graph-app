'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

type Person = { id:string, display_name:string, avatar_url:string|null };

export default function TreePage(){
  const [people, setPeople] = useState<Person[]>([]);
  const [rels, setRels] = useState<any[]>([]);
  const [rootId, setRootId] = useState<string>('');

  useEffect(()=>{
    supabase.from('persons').select('id, display_name, avatar_url').then(({data})=> setPeople(data || []));
    supabase.from('relationships').select('*').then(({data})=> setRels(data || []));
  }, []);

  const nodesEdges = useMemo(()=>{
    if (!rootId) return { nodes:[], edges:[] };
    // BFS limited to 3 levels from root
    const maxDepth = 3;
    const adjParent = new Map<string,string[]>(); // child -> parents
    const adjChild = new Map<string,string[]>();  // parent -> children
    const adjSpouse = new Map<string,string[]>(); // person -> spouses
    rels.forEach(r=>{
      if(r.type === 'parent'){
        if(!adjParent.has(r.to_person_id)) adjParent.set(r.to_person_id, []);
        adjParent.get(r.to_person_id)!.push(r.from_person_id);
        if(!adjChild.has(r.from_person_id)) adjChild.set(r.from_person_id, []);
        adjChild.get(r.from_person_id)!.push(r.to_person_id);
      } else if (r.type === 'spouse'){
        if(!adjSpouse.has(r.from_person_id)) adjSpouse.set(r.from_person_id, []);
        if(!adjSpouse.has(r.to_person_id)) adjSpouse.set(r.to_person_id, []);
        adjSpouse.get(r.from_person_id)!.push(r.to_person_id);
        adjSpouse.get(r.to_person_id)!.push(r.from_person_id);
      }
    });
    const seen = new Set<string>();
    const order: Array<{id:string, depth:number}> = [];
    const q: Array<{id:string, depth:number}> = [{id:rootId, depth:0}];
    seen.add(rootId);
    while(q.length){
      const {id, depth} = q.shift()!;
      order.push({id, depth});
      if(depth >= maxDepth) continue;
      (adjParent.get(id)||[]).forEach(n=>{ if(!seen.has(n)){ seen.add(n); q.push({id:n, depth:depth+1}); } });
      (adjChild.get(id)||[]).forEach(n=>{ if(!seen.has(n)){ seen.add(n); q.push({id:n, depth:depth+1}); } });
      (adjSpouse.get(id)||[]).forEach(n=>{ if(!seen.has(n)){ seen.add(n); q.push({id:n, depth:depth}); } }); // same gen
    }
    // layout nodes by depth (simple grid)
    const byDepth = new Map<number,string[]>();
    order.forEach(({id,depth})=>{
      if(!byDepth.has(depth)) byDepth.set(depth, []);
      byDepth.get(depth)!.push(id);
    });
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const personMap = new Map(people.map(p=>[p.id, p]));
    byDepth.forEach((ids, depth)=>{
      ids.forEach((id, idx)=>{
        const p = personMap.get(id);
        nodes.push({
          id,
          position: { x: idx*220, y: depth*160 },
          data: { label: (p?.avatar_url ? '' : '') + (p?.display_name || id) },
          style: { padding: 8, borderRadius: 10, border: '1px solid #233047', background:'#121826', color:'#e2e8f0' }
        });
      });
    });
    rels.forEach(r=>{
      if(seen.has(r.from_person_id) && seen.has(r.to_person_id)){
        edges.push({ id: r.id || (r.from_person_id+'-'+r.to_person_id+'-'+r.type), source: r.from_person_id, target: r.to_person_id, label: r.type === 'parent' ? 'parent' : 'spouse', animated: r.type === 'spouse' });
        if(r.type === 'spouse'){ // add both directions for visibility
          edges.push({ id: r.id+'b', source: r.to_person_id, target: r.from_person_id, label: 'spouse', animated:true });
        }
      }
    });
    return { nodes, edges };
  }, [rootId, rels, people]);

  return (
    <div className="grid" style={{gap:20}}>
      <div className="card">
        <div className="toolbar">
          <select value={rootId} onChange={e=>setRootId(e.target.value)}>
            <option value="">Choose root person…</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
          </select>
          <div className="hint">Pick a person to center the tree. Zoom & pan freely.</div>
        </div>
      </div>
      <div style={{ height: '70vh', background:'#0b0f16', border:'1px solid #233047', borderRadius:12, overflow:'hidden' }}>
        <ReactFlow nodes={nodesEdges.nodes} edges={nodesEdges.edges} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
