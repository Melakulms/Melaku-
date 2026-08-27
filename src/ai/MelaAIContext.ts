export type VerifiedContext={source:string;records:unknown[];verified:true};
export function buildGroundingInstruction(context:VerifiedContext[]){
 if(!context.length)return 'No verified MELA data was retrieved. Do not invent MELA-specific facts; clearly state when information is unavailable.';
 return `Use verified MELA data as authoritative context. Never invent records, grades, jobs, scholarships, deadlines, or private user facts. Distinguish retrieved facts from recommendations.\n\n${context.map(c=>`SOURCE: ${c.source}\nVERIFIED: true\nDATA: ${JSON.stringify(c.records)}`).join('\n\n')}`;
}
