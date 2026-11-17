// Reminder text is never used as an authentication or password-reset factor.
export function createPasswordHints({api,form,username,document=globalThis.document,uuid=()=>crypto.randomUUID()}){
 const el=(tag,text,attributes={})=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;for(const[k,v]of Object.entries(attributes))n.setAttribute(k,v);return n;};
 const box=el('section',null,{class:'password-hint-box'}),remember=el('input',null,{type:'checkbox'});
 const rememberLabel=el('label','',{class:'password-hint-option'});rememberLabel.append(remember,el('span','允許此私人瀏覽器在忘記密碼時顯示我的提示'));
 const forgot=el('button','忘記密碼／查看提示',{type:'button',class:'alarm-demo-refresh'}),clearDevice=el('button','清除此瀏覽器的提示授權',{type:'button',class:'alarm-demo-refresh'});
 const note=el('p','提示只限先前登入並勾選授權的瀏覽器；新裝置、清除Cookie、登出、到期或服務重建後，請先登入或聯絡維運。',{role:'status','aria-live':'polite'});
 form.append(rememberLabel);box.append(forgot,clearDevice,note);
 const settings=el('details',null,{class:'password-hint-settings',hidden:''});settings.append(el('summary','帳號與密碼提示'));
 const settingsForm=el('form',null),account=el('p',''),hint=el('input',null,{type:'text',maxlength:'80',autocomplete:'off'}),current=el('input',null,{type:'password',autocomplete:'current-password',maxlength:'256',required:''});
 const hintLabel=el('label','密碼提示（最多80字，留白可清除）'),currentLabel=el('label','確認目前密碼'),authorize=el('input',null,{type:'checkbox'}),authorizeLabel=el('label','',{class:'password-hint-option'});
 hintLabel.append(hint);currentLabel.append(current);authorizeLabel.append(authorize,el('span','同時授權此私人瀏覽器查看提示'));
 const save=el('button','儲存提示',{type:'submit'}),result=el('p','',{role:'status','aria-live':'polite'});
 settingsForm.append(account,hintLabel,currentLabel,authorizeLabel,save,result);settings.append(settingsForm);box.append(settings);
 let revision=0,generation=0,writes=Promise.resolve();
 const defaultNote=note.textContent;
 function invalidate(){generation++;revision=0;hint.value='';current.value='';account.textContent='';result.textContent='';settings.hidden=true;note.textContent=defaultNote;}
 function runAuth(action){const task=writes.then(action,action);writes=task.catch(()=>{});return task;}
 username.addEventListener('input',invalidate);
 async function refreshSelf(){
  invalidate();const ticket=generation;
  try{const data=await api('auth/password-hint');if(ticket!==generation)return;revision=data.revision;hint.value=data.hint||'';account.textContent='帳號：'+data.username;settings.hidden=false;}
  catch{if(ticket===generation)invalidate();}
 }
 forgot.addEventListener('click',async()=>{
  if(forgot.disabled)return;if(!username.value.trim()){note.textContent='請先輸入帳號。';return;}
  invalidate();forgot.disabled=true;const ticket=generation,name=username.value;
  try{const data=await api('auth/password-hint/remind',{username:name});if(ticket!==generation||username.value!==name)return;note.textContent=data.hint?'密碼提示：'+data.hint:data.message||'此瀏覽器沒有可用的提示授權。';}
  catch(error){if(ticket!==generation)return;note.textContent=error.status===429?'提示查詢過於頻繁，請稍後再試。':'目前無法讀取提示，請稍後再試或聯絡維運。';}
  finally{forgot.disabled=false;}
 });
 clearDevice.addEventListener('click',async()=>{
  if(clearDevice.disabled)return;clearDevice.disabled=true;invalidate();
  try{await runAuth(()=>api('auth/password-hint/forget-device',{}));invalidate();remember.checked=false;authorize.checked=false;note.textContent='已清除此瀏覽器的提示授權。';}
  catch{invalidate();note.textContent='清除結果尚未確認，請稍後再試。';}
  finally{clearDevice.disabled=false;}
 });
 settingsForm.addEventListener('submit',async event=>{
  event.preventDefault();if(save.disabled)return;save.disabled=true;
  const body={request_id:uuid(),expected_revision:revision,current_password:current.value,hint:hint.value,authorize_browser:authorize.checked};
  const ticket=generation;current.value='';
  try{const data=await runAuth(()=>api('auth/password-hint',body));if(ticket!==generation)return;revision=data.revision;result.textContent=data.device_authorized?'已儲存，並授權此瀏覽器查看提示。':'已儲存提示；此瀏覽器尚未授權。';}
  catch(error){if(ticket!==generation)return;result.textContent=error.status===401?'目前密碼不正確或登入已失效。':error.status===409?'提示已被變更，請重新連接後再儲存。':error.status===422?'提示不可包含密碼或其連續四字，且限80字。':'儲存結果未確認，請重新連接查看設定；不要自動重送。';}
  finally{save.disabled=false;}
 });
 return {node:box,runAuth,invalidate,remember,forgot,clearDevice,note,settings,settingsForm,hint,current,authorize,refreshSelf};
}
