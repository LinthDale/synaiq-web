import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
const source=process.argv[2];
assert.ok(source,'Provide a private directory containing preview.glb and panels.glb');
const input=resolve(source);
const readGlb=async name=>{
 const bytes=await readFile(join(input,`${name}.glb`));
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);
 const length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length).toString());
 assert.equal(bytes.readUInt32LE(24+length),0x004e4942);
 return {json,bin:Buffer.from(bytes.subarray(28+length))};
};
const model=await readGlb('preview'),panels=await readGlb('panels');
const position=panels.json.accessors[panels.json.meshes[0].primitives[0].attributes.POSITION];
const origin=position.min.map((value,index)=>(value+position.max[index])/2);
const records=[];
for(const [name,{json,bin}] of [['site',model],['panels',panels]]){
 assert.equal(json.meshes.length,1);assert.equal(json.meshes[0].primitives.length,1);
 assert.ok(json.nodes.every(n=>!n.matrix&&!n.translation&&!n.rotation&&!n.scale));
 const accessor=json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
 assert.equal(accessor.componentType,5126);assert.equal(accessor.type,'VEC3');
 const view=json.bufferViews[accessor.bufferView];assert.ok(!view.byteStride);
 const offset=(view.byteOffset||0)+(accessor.byteOffset||0),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<accessor.count;i++)for(let axis=0;axis<3;axis++){
  const byte=offset+i*12+axis*4,value=Math.round((bin.readFloatLE(byte)-origin[axis])*1000)/1000;
  bin.writeFloatLE(value,byte);const stored=bin.readFloatLE(byte);min[axis]=Math.min(min[axis],stored);max[axis]=Math.max(max[axis],stored);
 }
 accessor.min=min;accessor.max=max;
 const strip=value=>{if(!value||typeof value!=='object')return;for(const key of ['name','extras','extensions','uri','generator'])delete value[key];for(const child of Object.values(value))strip(child);};
 strip(json);assert.ok(!json.images&&!json.textures&&!json.animations&&!json.cameras);
 json.asset={version:'2.0'};
 const encoded=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(encoded.length/4)*4,0x20);encoded.copy(padded);
 const header=Buffer.alloc(20),binaryHeader=Buffer.alloc(8),total=28+padded.length+bin.length;
 header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(total,8);header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
 binaryHeader.writeUInt32LE(bin.length);binaryHeader.writeUInt32LE(0x004e4942,4);
 const output=Buffer.concat([header,padded,binaryHeader,bin]);
 const file=`docs/design/live-prototype/assets/pvsim-${name}-demo.glb`;await writeFile(file,output);
 records.push({file,bytes:output.length,sha256:createHash('sha256').update(output).digest('hex'),vertices:accessor.count});
}
console.log(JSON.stringify(records,null,2));
