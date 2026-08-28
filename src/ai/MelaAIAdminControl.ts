import type { AIAction, ApprovalStatus } from './MelaAIApproval';
import type { AITask, TaskStatus } from './MelaAITaskQueue';
export type AgentStatus='enabled'|'disabled'|'degraded';
export type AgentSnapshot={id:string;name:string;status:AgentStatus;requests:number;failures:number;lastActiveAt?:string};
export type AIAdminSnapshot={agents:AgentSnapshot[];tasks:{queued:number;running:number;waitingApproval:number;completed:number;failed:number};approvals:AIAction[];securityAlerts:number;updatedAt:string};
export function buildAdminSnapshot(agents:AgentSnapshot[],tasks:AITask[],approvals:AIAction[],securityAlerts=0):AIAdminSnapshot{const count=(status:TaskStatus)=>tasks.filter(t=>t.status===status).length;return{agents,tasks:{queued:count('queued'),running:count('running'),waitingApproval:count('waiting_approval'),completed:count('completed'),failed:count('failed')},approvals:approvals.filter(a=>a.status==='pending'||a.status==='human_only'),securityAlerts,updatedAt:new Date().toISOString()}}
export function pendingApprovalCount(snapshot:AIAdminSnapshot){return snapshot.approvals.filter(a=>a.status==='pending').length}
export function isApprovalActionAllowed(status:ApprovalStatus){return status==='pending'}
