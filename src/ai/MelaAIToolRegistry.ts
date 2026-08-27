import * as tools from './MelaAITools';
export type ToolName=keyof typeof tools;
export const MELA_AI_TOOL_REGISTRY={
 searchCourses:{name:'search_courses',roles:['student','teacher','parent','admin'],execute:tools.searchCourses},
 searchOpportunities:{name:'search_jobs',roles:['student','teacher','company','admin'],execute:tools.searchOpportunities},
 searchScholarships:{name:'search_scholarships',roles:['student','teacher','parent','admin'],execute:tools.searchScholarships},
 getMyProfile:{name:'get_my_profile',roles:['student','teacher','parent','company','admin'],execute:tools.getMyProfile},
 getMyLearningProgress:{name:'get_student_progress',roles:['student','parent','teacher','admin'],execute:tools.getMyLearningProgress}
} as const;
export function canUseTool(key:keyof typeof MELA_AI_TOOL_REGISTRY,role:string){return (MELA_AI_TOOL_REGISTRY[key].roles as readonly string[]).includes(role.toLowerCase());}
