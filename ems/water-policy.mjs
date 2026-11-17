// Narrow simulation facade; no native tokens or QA/OT route forwarding.
export const waterRoute=(method,path)=>method==='GET'?/^\/api\/water\/(?:status|operations\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.test(path):method==='POST'&&/^\/api\/water\/(?:claim|heartbeat|commands|stop-all|release)$/.test(path);
export const waterStop=(method,path)=>method==='POST'&&(path==='/api/water/stop-all'||path==='/api/water/release');
