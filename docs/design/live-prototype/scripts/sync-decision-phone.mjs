import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { DECISION_VARIANTS } from '../decision-responsive.js';
import { syncDecisionPortrait } from './sync-decision-portrait.mjs';
const root=new URL('../',import.meta.url),manifestPath=new URL('decision-phone-manifest.json',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function syncDecisionPhone({check=false}={}) {
  const source=await syncDecisionPortrait({check:true}),variant=DECISION_VARIANTS['portrait-phone'];
  const options={width:360,height:640,quality:68,effort:5};
  const manifest=check ? JSON.parse(await readFile(manifestPath)) : {schema:1,sourcePromptId:source.promptId,options,frames:[]};
  assert.deepEqual(manifest.options,options);assert.equal(manifest.sourcePromptId,source.promptId);
  const buffers=[];
  for(const [id,file] of (check ? variant.bundles : DECISION_VARIANTS['portrait-large'].bundles).entries()) {
    assert.equal((await lstat(new URL(file,root))).isSymbolicLink(),false);
    const bundle=JSON.parse(await readFile(new URL(file,root),'utf8'));
    assert.equal(bundle.schema,1);assert.equal(bundle.start,id*32);assert.equal(bundle.frames.length,Math.min(32,243-id*32));
    for(const value of bundle.frames) {assert.match(value,/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/);buffers.push(Buffer.from(value.split(',')[1],'base64'));}
  }
  assert.equal(buffers.length,243);
  for(let index=0;index<243;index++) {
    if(!check) {assert.equal(sha(buffers[index]),source.variants['portrait-large'].frames[index].sha256);buffers[index]=await sharp(buffers[index]).resize(360,640).webp({quality:68,effort:5}).toBuffer();}
    const bytes=buffers[index],metadata=await sharp(bytes).metadata();assert.equal(metadata.width,360);assert.equal(metadata.height,640);
    const record={index,sourceSha256:source.variants['portrait-large'].frames[index].sha256,bytes:bytes.length,sha256:sha(bytes)};
    if(check)assert.deepEqual(record,manifest.frames[index]);else manifest.frames.push(record);
  }
  if(check) {
    assert.equal(manifest.frames.length,243);assert.equal((await lstat(new URL(variant.poster,root))).isSymbolicLink(),false);
    assert.equal(sha(await readFile(new URL(variant.poster,root))),manifest.frames[0].sha256);
  }else {
    for(const [id,file] of variant.bundles.entries()) {
      const bytes=Buffer.from(JSON.stringify({schema:1,start:id*32,frames:buffers.slice(id*32,id*32+32).map(value=>`data:image/webp;base64,${value.toString('base64')}`)})+'\n');assert.ok(bytes.length<600000);
      await mkdir(new URL('./',new URL(file,root)),{recursive:true});await writeFile(new URL(file,root),bytes,{flag:'wx'});
    }
    await mkdir(new URL('./',new URL(variant.poster,root)),{recursive:true});await writeFile(new URL(variant.poster,root),buffers[0],{flag:'wx'});
    await writeFile(manifestPath,JSON.stringify(manifest,null,2),{flag:'wx'});
  }
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 const manifest=await syncDecisionPhone({check:process.argv.includes('--check')});console.log(JSON.stringify({frames:manifest.frames.length,bytes:manifest.frames.reduce((n,frame)=>n+frame.bytes,0)}));
}
