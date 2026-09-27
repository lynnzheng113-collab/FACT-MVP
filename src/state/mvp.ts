import { mvpCopy as t } from "../constants/copy";

export type Answers = Record<string, string[]>;
export type Role = "admin" | "reviewer" | "reader";
export type FieldSpec = { id: string; name: string; type: "single" | "multi" | "text"; options: string[]; required: boolean; visible: boolean; readOnly: boolean; copyable: boolean };
export type ReviewEvent = { at: string; actor: string; before: Answers; after: Answers };
export type Doc = { id: string; name: string; type: string; source: string; family: string; parent: string; thread: string; similar: string; language: string; date: string; content: string; state: "ready" | "staged" | "failed"; batch: string; duplicate: string; version: number; values: Answers; history: ReviewEvent[]; fixture: boolean };
export type Condition = { field: "source" | "type" | "name" | "reviewed"; op: "contains" | "equals"; value: string };
export type Query = { text: string; folder: string; from: string; to: string; family: boolean; logic: "and" | "or"; conditions: Condition[] };
export type SavedSearch = { id: string; name: string; query: Query };
export type Task = { id: string; kind: keyof typeof t.tasks; at: string; count: number; state: "done" | "error"; detail: string };
export type Package = { id: string; at: string; docs: Doc[]; text: boolean; meta: boolean };
export type Project = { id: string; name: string; client: string; matter: string; adminId: string; form: string; docs: Doc[]; fields: FieldSpec[]; members: { id: string; name: string; email: string; role: Role; active: boolean }[]; searches: SavedSearch[]; tasks: Task[]; audit: { at: string; action: string; actor: string; detail: string }[]; packages: Package[]; indexedAt: string; analysisAt: string };
export type Store = { schema: 1; revision: string; projects: Project[] };
export const storageKey = "fact-mvp-m0m1-v1";
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const stamp = (iso: string) => iso ? new Date(iso).toLocaleString("zh-CN") : t.dash;
export const emptyQuery = (): Query => ({ text: "", folder: "", from: "", to: "", family: true, logic: "and", conditions: [] });
export const defaultFields = (): FieldSpec[] => [
  { id: "responsive", name: t.review.responsive, type: "single", options: [t.answers.relevant, t.answers.irrelevant], required: true, visible: true, readOnly: false, copyable: true },
  { id: "confidential", name: t.review.confidential, type: "single", options: [t.answers.no, t.answers.yes], required: true, visible: true, readOnly: false, copyable: false },
  { id: "issues", name: t.review.issues, type: "multi", options: [...t.seed.issues], required: false, visible: true, readOnly: false, copyable: true },
  { id: "notes", name: t.review.notes, type: "text", options: [], required: false, visible: true, readOnly: false, copyable: false },
];
export function makeProject(name: string, client: string, matter: string): Project {
  const adminId=uid();
  return { id: uid(), name, client, matter, adminId, form: t.seed.form, docs: [], fields: defaultFields(), members: [{ id: adminId, name: t.seed.admin, email: t.seed.email, role: "admin", active: true }, { id: uid(), name: t.seed.reviewer, email: t.seed.reviewerEmail, role: "reviewer", active: true }], searches: [], tasks: [], audit: [], packages: [], indexedAt: "", analysisAt: "" };
}
export function sampleDocs(state: "ready" | "staged" = "staged"): Doc[] {
  return t.seed.docs.map((doc,i) => ({ ...doc, state: i===7 ? "failed" : state, batch: t.import.fixedSource, duplicate: i===6 ? t.seed.docs[1].id : "", version: 1, values: {}, history: [], fixture: true }));
}
export function initialStore(): Store {
  const first=makeProject(t.seed.project,t.seed.client,t.seed.matter);
  first.docs=sampleDocs("ready");first.indexedAt=now();
  return { schema: 1, revision: uid(), projects: [first,makeProject(t.seed.project2,t.seed.client2,t.seed.matter2)] };
}
// Validate every shape used by the UI before replacing existing browser data.
export function validStore(value: unknown): value is Store {
  if (!value || typeof value!=="object") return false;
  const s=value as Store;
  if(s.schema!==1 || typeof s.revision!=="string" || !Array.isArray(s.projects) || !s.projects.length) return false;
  const strings=(obj: object,keys:string[])=>keys.every(k=>typeof (obj as Record<string,unknown>)[k]==="string");
  const answers=(v:unknown)=>!!v && typeof v==="object" && !Array.isArray(v) && Object.values(v).every(x=>Array.isArray(x)&&x.every(y=>typeof y==="string"));
  const validDoc=(d:Doc)=>!!d&&strings(d,["id","name","type","source","family","parent","thread","similar","language","date","content","batch","duplicate"])&&["ready","staged","failed"].includes(d.state)&&Number.isInteger(d.version)&&d.version>0&&typeof d.fixture==="boolean"&&answers(d.values)&&Array.isArray(d.history)&&d.history.every(h=>strings(h,["at","actor"])&&answers(h.before)&&answers(h.after));
  try {
    return new Set(s.projects.map(p=>p.id)).size===s.projects.length&&s.projects.every(p=>strings(p,["id","name","client","matter","adminId","form","indexedAt","analysisAt"])&&
      Array.isArray(p.docs)&&p.docs.every(validDoc)&&new Set(p.docs.map(d=>d.id)).size===p.docs.length&&
      Array.isArray(p.fields)&&p.fields.every(f=>strings(f,["id","name"])&&["single","multi","text"].includes(f.type)&&Array.isArray(f.options)&&f.options.every(o=>typeof o==="string")&&[f.required,f.visible,f.readOnly,f.copyable].every(b=>typeof b==="boolean"))&&new Set(p.fields.map(f=>f.id)).size===p.fields.length&&["responsive","confidential"].every(id=>p.fields.some(f=>f.id===id&&f.required&&f.visible&&!f.readOnly))&&
      Array.isArray(p.members)&&p.members.every(m=>strings(m,["id","name","email"])&&["admin","reviewer","reader"].includes(m.role)&&typeof m.active==="boolean")&&p.members.some(m=>m.id===p.adminId&&m.active&&m.role==="admin")&&
      Array.isArray(p.searches)&&p.searches.every(x=>strings(x,["id","name"])&&strings(x.query,["text","folder","from","to"])&&typeof x.query.family==="boolean"&&["and","or"].includes(x.query.logic)&&Array.isArray(x.query.conditions)&&x.query.conditions.every(c=>strings(c,["value"])&&["name","type","source","reviewed"].includes(c.field)&&["equals","contains"].includes(c.op)))&&
      Array.isArray(p.tasks)&&p.tasks.every(x=>strings(x,["id","at","detail"])&&x.kind in t.tasks&&["done","error"].includes(x.state)&&Number.isFinite(x.count))&&
      Array.isArray(p.audit)&&p.audit.every(x=>strings(x,["at","action","actor","detail"]))&&
      Array.isArray(p.packages)&&p.packages.every(x=>strings(x,["id","at"])&&Array.isArray(x.docs)&&x.docs.every(validDoc)&&typeof x.text==="boolean"&&typeof x.meta==="boolean"));
  } catch { return false; }
}
export function loadStore(): { store: Store; error: boolean } {
  try { const raw=localStorage.getItem(storageKey);if(!raw)return {store:initialStore(),error:false};const parsed=JSON.parse(raw);if(validStore(parsed))return {store:parsed,error:false}; } catch { /* Preserve original data if invalid. */ }
  return {store:initialStore(),error:true};
}
export const isReviewed=(d:Doc)=>!!d.values.responsive?.length&&!!d.values.confidential?.length;
export const requiredMissing=(fields:FieldSpec[],values:Answers)=>fields.some(f=>f.required&&f.visible&&!f.readOnly&&!values[f.id]?.some(v=>v.trim()));
export function log(p:Project,action:string,detail:string) { p.audit.unshift({ at:now(),action,actor:t.seed.admin,detail }); }
export function task(p:Project,kind:Task["kind"],count:number,detail:string,state:Task["state"]="done") { p.tasks.unshift({id:uid(),kind,count,detail,at:now(),state}); }

// Explicitly limited grammar: quoted phrases, AND/OR/NOT, implicit AND; OR has lower precedence.
export function compileSearch(text:string):(content:string)=>boolean {
  if(!text.trim())return ()=>true;
  if(/[()]/.test(text))throw new Error(t.search.syntax);
  const parts=text.match(/"[^"]*"|[^\s"]+/g)??[];
  if((text.match(/"/g)?.length??0)%2)throw new Error(t.search.syntax);
  const groups:{term:string;not:boolean}[][]=[[]];let needTerm=true;let negated=false;
  for(const token of parts){
    if(token==="AND"||token==="OR") { if(needTerm)throw new Error(t.search.syntax);if(token==="OR")groups.push([]);needTerm=true;continue; }
    if(token==="NOT") { if(negated)throw new Error(t.search.syntax);negated=true;needTerm=true;continue; }
    const term=token.replace(/^"|"$/g,"").toLocaleLowerCase();if(!term)throw new Error(t.search.syntax);
    groups[groups.length-1].push({term,not:negated});negated=false;needTerm=false;
  }
  if(needTerm)throw new Error(t.search.syntax);
  return content=>groups.some(g=>g.every(q=>content.toLocaleLowerCase().includes(q.term)!==q.not));
}
export function queryDocs(docs:Doc[],q:Query) {
  const predicate=compileSearch(q.text);
  const available=docs.filter(d=>d.state==="ready");
  const direct=available.filter(d=>{
    if(q.folder&&d.source!==q.folder||q.from&&d.date<q.from||q.to&&d.date>q.to)return false;
    if(!predicate(d.content))return false;
    const conditions=q.conditions.filter(c=>c.value.trim()).map(c=>{
      const v=c.field==="reviewed"?(isReviewed(d)?t.search.reviewed:t.search.unreviewed):d[c.field];
      return c.op==="equals"?v.toLocaleLowerCase()===c.value.toLocaleLowerCase():v.toLocaleLowerCase().includes(c.value.toLocaleLowerCase());
    });
    return !conditions.length||(q.logic==="and"?conditions.every(Boolean):conditions.some(Boolean));
  });
  const directIds=new Set(direct.map(d=>d.id));const families=new Set(direct.map(d=>d.family).filter(Boolean));
  return {directIds,docs:available.filter(d=>directIds.has(d.id)||(q.family&&families.has(d.family)))};
}
export function canDeliver(docs:Doc[],fields:FieldSpec[]) {return docs.length>0&&docs.every(d=>d.state==="ready"&&isReviewed(d)&&!requiredMissing(fields,d.values)&&d.values.confidential?.[0]===t.answers.no);}
export function download(name:string,bytes:BlobPart,type="application/octet-stream") {const url=URL.createObjectURL(new Blob([bytes],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const utf8=new TextEncoder();
function crc32(bytes:Uint8Array) {let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
// Small uncompressed UTF-8 ZIP writer. No claim to reproduce original/native files.
export function zipFiles(files:{name:string;content:string}[]):ArrayBuffer {
  const chunks:Uint8Array[]=[];const central:Uint8Array[]=[];let offset=0;
  for(const file of files){const name=utf8.encode(file.name),data=utf8.encode(file.content),crc=crc32(data);const head=new Uint8Array(30+name.length);const h=new DataView(head.buffer);
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);head.set(name,30);
    const dir=new Uint8Array(46+name.length);const d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);
    chunks.push(head,data);central.push(dir);offset+=head.length+data.length;
  }
  const size=central.reduce((n,b)=>n+b.length,0);const end=new Uint8Array(22);const e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);
  const all=new Uint8Array(offset+size+22);let position=0;for(const c of [...chunks,...central,end]){all.set(c,position);position+=c.length;}return all.buffer;
}
export function packageBytes(pkg:Package):ArrayBuffer {
  const files:{name:string;content:string}[]=[];
  if(pkg.text)pkg.docs.forEach(d=>files.push({name:`text/${d.id.replace(/[^a-zA-Z0-9_-]/g,"_")}.txt`,content:d.content}));
  const csv=(x:string)=>'"'+(/^[=+@\-\t\r]/.test(x)?"'":"")+x.replaceAll('"','""')+'"';
  if(pkg.meta)files.push({name:"metadata.csv",content:"\uFEFF"+[[t.id,t.file,t.source,t.review.responsive,t.review.confidential,t.review.notes],...pkg.docs.map(d=>[d.id,d.name,d.source,d.values.responsive?.join("; ")??"",d.values.confidential?.join("; ")??"",d.values.notes?.join("; ")??""])].map(r=>r.map(csv).join(",")).join("\r\n")});
  files.push({name:t.export.manifest,content:JSON.stringify({id:pkg.id,at:pkg.at,note:t.export.formatNote,documents:pkg.docs.map(d=>({id:d.id,version:d.version,parent:d.parent,source:d.source,values:d.values})),files:files.map(f=>({path:f.name,bytes:utf8.encode(f.content).length,crc32:crc32(utf8.encode(f.content)).toString(16)}))},null,2)});
  return zipFiles(files);
}
