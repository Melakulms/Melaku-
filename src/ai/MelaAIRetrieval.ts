export type KnowledgeSource='course'|'material'|'job'|'scholarship'|'policy';
export type RetrievedItem={id:string;source:KnowledgeSource;title:string;snippet:string;verified:boolean;metadata?:Record<string,unknown>};
export type RetrievalContext={query:string;items:RetrievedItem[];generatedAt:string};
export function buildRetrievalContext(query:string,items:RetrievedItem[],maxItems=8):RetrievalContext{return{query,items:items.filter(i=>i.verified).slice(0,maxItems),generatedAt:new Date().toISOString()}}
export function groundingPrompt(context:RetrievalContext){if(!context.items.length)return`No verified MELA data was found for: ${context.query}. Do not invent platform-specific facts.`;return`Use ONLY the following verified MELA context for platform-specific facts. If the answer is not supported, say that the information is unavailable.\n\n${context.items.map((i,n)=>`[${n+1}] ${i.source}: ${i.title}\n${i.snippet}`).join('\n\n')}`}
