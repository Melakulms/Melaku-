import { callMelaAICore, createAbortController, type MelaAIResponse } from './MelaAIClient';

export type ChatMessage = { id:string; role:'user'|'assistant'|'system'; content:string; createdAt:string; agent?:string };

export class MelaAIChat {
  private messages:ChatMessage[]=[];
  private sessionId?:string;
  constructor(private readonly config:{supabaseUrl:string;accessToken:string}){}
  get history(){return [...this.messages];}
  get session(){return this.sessionId;}
  async send(message:string,agent?:string):Promise<MelaAIResponse>{
    const text=message.trim(); if(!text) throw new Error('Message is required');
    this.messages.push({id:crypto.randomUUID(),role:'user',content:text,createdAt:new Date().toISOString()});
    const{controller,clear}=createAbortController();
    try{
      const result=await callMelaAICore({message:text,session_id:this.sessionId,agent},{...this.config,signal:controller.signal});
      if(result.session_id)this.sessionId=result.session_id;
      this.messages.push({id:result.request_id||crypto.randomUUID(),role:'assistant',content:result.response||result.error||'MELA AI returned no response.',createdAt:new Date().toISOString(),agent:result.agent?.name});
      return result;
    }finally{clear();}
  }
  clear(){this.messages=[];this.sessionId=undefined;}
}
