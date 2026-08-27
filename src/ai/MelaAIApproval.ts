export type ActionLevel=1|2|3;
export type ApprovalStatus='not_required'|'pending'|'approved'|'rejected'|'human_only';
export type AIAction={id:string;agent:string;action:string;description:string;level:ActionLevel;status:ApprovalStatus;createdAt:string;metadata?:Record<string,unknown>};
const level3=/financial transaction|hire|fire|terminate|delete account|security policy|legal commitment|irreversible|destructive/i;
const level2=/send email|send sms|publish|post|announcement|partnership proposal|change business setting|external communication/i;
export function classifyAction(action:string):ActionLevel{if(level3.test(action))return 3;if(level2.test(action))return 2;return 1}
export function createAIAction(agent:string,action:string,description:string,metadata?:Record<string,unknown>):AIAction{const level=classifyAction(action);return{id:crypto.randomUUID(),agent,action,description,level,status:level===1?'not_required':level===3?'human_only':'pending',createdAt:new Date().toISOString(),metadata}}
export function canAutoExecute(action:AIAction){return action.level===1&&action.status==='not_required'}
export function approveAction(action:AIAction):AIAction{if(action.level===3)throw new Error('Level 3 actions are human-only and require direct human execution');if(action.status!=='pending')throw new Error('Only pending actions can be approved');return{...action,status:'approved'}}
export function rejectAction(action:AIAction):AIAction{if(action.status!=='pending')throw new Error('Only pending actions can be rejected');return{...action,status:'rejected'}}
