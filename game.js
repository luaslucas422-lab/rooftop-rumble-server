(()=>{
'use strict';
/* online: NETS = running inside the game server; MYT = which team is "mine" on this phone */
const NETS=!!window.__rrServer;let MYT=0;
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[(Math.random()*a.length)|0];
const dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const REDUCED=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
const OUT='#120f26',BLUE='#46b4ff',RED='#ff5d57',SUNC='#ffc93c',OKC='#6be39a';

/* ---------- Rarities & levels ---------- */
const RARITY={
  common:{name:'Common',col:'#c9cfe0',chromos:0},
  rare:{name:'Rare',col:'#46b4ff',chromos:1500},
  epic:{name:'Epic',col:'#b56cff',chromos:7000},
  mythic:{name:'Mythic',col:'#ff5d8f',chromos:11000},
  legendary:{name:'Legendary',col:'#ffc93c',chromos:15000},
  celestial:{name:'Rumble Pass Exclusive',col:'#ffb86b',chromos:0,passOnly:true},
  ultra:{name:'Amazing',col:'#7df9ff',chromos:30000},
  season:{name:'Starfall',col:'#b48cff',chromos:0,seasonal:true},
  rbox:{name:'Rumbler Box',col:'#ff5e87',chromos:0,seasonal:true,box:true},
  sbox:{name:'Skin Box',col:'#ff9bf0',chromos:0,seasonal:true,box:true},
  pumpkin:{name:'Pumpkin',col:'#ff8a1f',chromos:0,seasonal:true,spooky:true},
  skeleton:{name:'Skeleton',col:'#e8e4d8',chromos:0,seasonal:true,spooky:true},
  zombie:{name:'Zombie',col:'#7ed957',chromos:0,seasonal:true,spooky:true},
};
const CHROMOS_PER_KO=10;
const MAX_LVL=11;
const UP_PP=[20,30,50,80,130,210,340,550,890,1440];
const UP_COIN=[20,35,75,140,290,480,800,1250,1875,2800];
const mulFor=l=>1+(l-1)*.07;

/* ---------- Rumblers (all original) ---------- */
const RUMBLERS=[
 {id:'ember',name:'Ember',rarity:'common',role:'Flame sprayer',rad:20,hp:3800,speed:150,reload:1.0,superNeed:4000,pref:.55,
  atk:{kind:'spread',n:5,arc:.5,range:235,spd:560,dmg:250,r:9,pierce:true},sup:{kind:'nova',radius:150,dmg:1300,kb:320},
  atkName:'Torch Spray',atkDesc:'Sprays five short flames that pass through enemies.',supName:'Inferno Ring',supDesc:'Blasts a ring of fire around Ember and knocks enemies back.',
  look:{body:'#ff7a3d',belly:'#ffd3a6',accent:'#ffd23f',proj:'#ff9b3d',hat:'flame'},sig:{name:'Dragon Hatchling',body:'#33a06c',belly:'#c6f0cf',accent:'#ffcf3d',proj:'#7dff9a',hat:'dragon'}},
 {id:'bolt',name:'Bolt',rarity:'rare',role:'Sharpshooter',rad:19,hp:2800,speed:140,reload:1.4,superNeed:3300,pref:.8,trait:'goggles',
  atk:{kind:'single',range:430,spd:950,dmg:1100,r:7},sup:{kind:'beam',range:560,spd:1400,dmg:2200,r:14},
  atkName:'Long Bolt',atkDesc:'Fires one fast bolt that crosses most of the roof.',supName:'Rail Shot',supDesc:'A piercing shot that hits everyone in its lane.',
  look:{body:'#5aa9e6',belly:'#d3ebff',accent:'#ffd23f',proj:'#a6ecff',hat:'none'},sig:{name:'Sky Pirate',body:'#3c5c9e',belly:'#d9e4ff',accent:'#e6b44a',proj:'#ffe08a',hat:'tricorn'}},
 {id:'spritz',name:'Spritz',rarity:'rare',role:'Bubble medic',rad:19,hp:3300,speed:145,reload:1.1,superNeed:3600,pref:.7,trait:'tank',
  atk:{kind:'spread',n:3,arc:.26,range:330,spd:620,dmg:420,r:9},sup:{kind:'heal',radius:180,heal:2400},
  atkName:'Fizz Shot',atkDesc:'Shoots three bubbles in a tight spread.',supName:'Fizz Burst',supDesc:'Heals Spritz and every teammate nearby.',
  look:{body:'#74d6c4',belly:'#e3fbf5',accent:'#ff8fb1',proj:'#bdf3ff',hat:'none'},sig:{name:'Bubble Tea',body:'#d6ad86',belly:'#f4e2cf',accent:'#3d2a1f',proj:'#3d2a1f',hat:'straw',dots:true}},
 {id:'nix',name:'Nix',rarity:'rare',role:'Frost thrower',rad:19,hp:3000,speed:145,reload:1.1,superNeed:3300,pref:.75,trait:'scarf',
  atk:{kind:'single',range:340,spd:780,dmg:820,r:8,slow:1.4},sup:{kind:'field',range:360,radius:120,dur:3.2,dps:900,flight:.45},
  atkName:'Ice Shard',atkDesc:'A frozen shard that slows whoever it hits.',supName:'Blizzard',supDesc:'Throws a storm cloud that freezes and slows an area.',
  look:{body:'#9fd8ff',belly:'#eef8ff',accent:'#3d7bff',proj:'#c9f0ff',hat:'beanie'},sig:{name:'Yeti Pup',body:'#e6edf7',belly:'#ffffff',accent:'#6aa8ff',proj:'#bfe2ff',hat:'horns',frost:true}},
 {id:'zing',name:'Zing',rarity:'rare',role:'Boomerang ranger',rad:19,hp:3100,speed:155,reload:1.0,superNeed:3400,pref:.7,
  atk:{kind:'boomerang',range:300,spd:620,dmg:520,r:11},sup:{kind:'boomerang3',range:340,spd:680,dmg:620,r:12,n:3,arc:.7},
  atkName:'Rang',atkDesc:'Throws a boomerang that hits on the way out and on the way back.',supName:'Triple Rang',supDesc:'Three boomerangs at once in a wide fan.',
  look:{body:'#ffb347',belly:'#ffe6c2',accent:'#e2543b',proj:'#ffd38a',hat:'bandana'},sig:{name:'Outback Ace',body:'#b8763d',belly:'#f0d3ad',accent:'#2b6e58',proj:'#ffb347',hat:'tricorn'}},
 {id:'boulder',name:'Boulder',rarity:'epic',role:'Heavy tank',rad:24,hp:6400,speed:132,reload:.85,superNeed:3900,pref:0,trait:'rocks',boxy:true,
  atk:{kind:'melee',range:80,arc:1.3,dmg:1250,kb:220},sup:{kind:'dash',range:320,spd:720,dmg:1500,kb:380},
  atkName:'Rock Fist',atkDesc:'A heavy punch that shoves enemies back.',supName:'Landslide',supDesc:'Charges forward and flattens anyone in the way.',
  look:{body:'#8d90a6',belly:'#c4c6d4',accent:'#e9b44c',proj:'#e9b44c',hat:'none'},sig:{name:'Moss Giant',body:'#6d7d5a',belly:'#b9c79a',accent:'#9bd36a',proj:'#9bd36a',hat:'moss'}},
 {id:'pip',name:'Pip',rarity:'epic',role:'Bomb lobber',rad:18,hp:2700,speed:140,reload:1.35,superNeed:3000,pref:.75,
  atk:{kind:'lob',range:370,flight:.65,dmg:1000,splash:70},sup:{kind:'bigbomb',range:420,flight:.85,dmg:2300,splash:140},
  atkName:'Pop Bomb',atkDesc:'Lobs a bomb over walls that splashes on landing.',supName:'Big Boomer',supDesc:'Lobs a huge bomb with a wide blast.',
  look:{body:'#ffcf4a',belly:'#fff1bd',accent:'#e2543b',proj:'#3a2f4f',hat:'propeller'},sig:{name:'Firework Fiend',body:'#d6334a',belly:'#ffc4bd',accent:'#ffd23f',proj:'#ffd23f',hat:'fuse'}},
 {id:'marlo',name:'Marlo',rarity:'epic',role:'Tide caller',rad:21,hp:4300,speed:140,reload:1.2,superNeed:3800,pref:.6,
  atk:{kind:'wave',range:300,spd:400,dmg:900,r:22,pierce:true},sup:{kind:'bigwave',range:380,spd:520,dmg:1500,r:46,kb:340},
  atkName:'Swell',atkDesc:'A wide, slow wave that rolls through every enemy in its path.',supName:'Riptide',supDesc:'A giant wave that slams enemies and washes them back.',
  look:{body:'#3fb6c9',belly:'#d4f6fb',accent:'#ffd23f',proj:'#7fe6ff',hat:'snorkel'},sig:{name:'Deep Diver',body:'#2c3f86',belly:'#9fb6ff',accent:'#ff9f43',proj:'#6ad0ff',hat:'helmet'}},
 {id:'volta',name:'Volta',rarity:'epic',role:'Storm caster',rad:19,hp:3000,speed:150,reload:1.15,superNeed:3500,pref:.75,
  atk:{kind:'chain',range:340,spd:1100,dmg:850,r:7,jumps:2,jumpR:170,falloff:.7},sup:{kind:'chainbig',range:380,spd:1300,dmg:1400,r:10,jumps:5,jumpR:220,falloff:1,stun:.7},
  atkName:'Arc Zap',atkDesc:'A spark that jumps to two more enemies nearby.',supName:'Overload',supDesc:'A huge bolt that chains through five enemies and stuns them.',
  look:{body:'#5b4be0',belly:'#c8c1ff',accent:'#fff26b',proj:'#fff26b',hat:'spikes'},sig:{name:'Neon Coil',body:'#1d1f2e',belly:'#3a3f5c',accent:'#3dfcff',proj:'#3dfcff',hat:'spikes',glow:'#3dfcff',eye:'#3dfcff'}},
 {id:'vex',name:'Vex',rarity:'mythic',role:'Shadow striker',rad:19,hp:3500,speed:172,reload:.65,superNeed:3150,pref:0,trait:'ears',
  atk:{kind:'melee',range:90,arc:1.1,dmg:560,double:true},sup:{kind:'dash',range:380,spd:900,dmg:1200,kb:200},
  atkName:'Twin Slash',atkDesc:'Two quick dagger slashes up close.',supName:'Shadow Step',supDesc:'Dashes through enemies, slicing each one.',
  look:{body:'#6c5bd6',belly:'#bbb2f4',accent:'#ff4d8d',proj:'#ff4d8d',hat:'none'},sig:{name:'Night Moth',body:'#4b3d6e',belly:'#a99cd0',accent:'#f5d76e',proj:'#f5d76e',hat:'antennae'}},
 {id:'bramble',name:'Bramble',rarity:'mythic',role:'Vine warden',rad:20,hp:4700,speed:148,reload:.95,superNeed:3600,pref:.55,
  atk:{kind:'melee',range:150,arc:.5,dmg:1050,pull:150},sup:{kind:'root',radius:170,dmg:900,stun:1.6},
  atkName:'Vine Lash',atkDesc:'A long whip that yanks enemies closer.',supName:'Overgrowth',supDesc:'Roots every enemy nearby in place.',
  look:{body:'#5fb04a',belly:'#d4f0b8',accent:'#ff7ab8',proj:'#7ed957',hat:'flower'},sig:{name:'Autumn Thorn',body:'#c4622d',belly:'#f6d1a8',accent:'#ffd23f',proj:'#ff9f43',hat:'leaf'}},
 {id:'rook',name:'Rook',rarity:'mythic',role:'Turret tinker',rad:20,hp:3400,speed:145,reload:1.25,superNeed:3200,pref:.75,
  atk:{kind:'burst',n:3,gap:.09,range:360,spd:900,dmg:380,r:6},sup:{kind:'turret',hp:3000,dur:12,rate:.5,dmg:300,reach:380},
  atkName:'Rivet Burst',atkDesc:'Three rivets in quick succession.',supName:'Sentry',supDesc:'Builds a turret that shoots nearby enemies for 12 seconds.',
  look:{body:'#e8913c',belly:'#ffe0bd',accent:'#2b3a55',proj:'#ffd38a',hat:'hardhat'},sig:{name:'Chrome Mech',body:'#b8c2d6',belly:'#eef2fa',accent:'#ff4d6d',proj:'#ff9ab0',hat:'antenna',shine:true}},
 {id:'echo',name:'Echo',rarity:'legendary',role:'Sound shaper',rad:19,hp:3600,speed:162,reload:.95,superNeed:3400,pref:.2,
  atk:{kind:'pulse',range:125,dmg:720},sup:{kind:'shockcone',range:280,arc:1.1,dmg:1600,stun:1,kb:260},
  atkName:'Bass Drop',atkDesc:'A sound pulse that hits every enemy close by.',supName:'Shockwave',supDesc:'A blast of sound that stuns everyone in front of Echo.',
  look:{body:'#ff5ea8',belly:'#ffd1e6',accent:'#2b2a4a',proj:'#ff9ccc',hat:'headphones'},sig:{name:'Disco Star',body:'#ffd23f',belly:'#fff4c2',accent:'#7c3aed',proj:'#ffe680',hat:'headphones',sprinkles:true,glow:'#ffd23f'}},
 {id:'woodrow',name:'Woodrow',rarity:'legendary',role:'Dam builder',rad:21,hp:4400,speed:150,reload:1.3,superNeed:3800,pref:.7,trait:'beaver',
  atk:{kind:'log',range:380,spd:650,dmg:1176.5,r:12,split:4,splitDmg:.3,splitRange:160},sup:{kind:'dam',range:260,radius:150,dur:8,heal:.06,speed:.3,dps:300,poison:450,poisonT:4},
  atkName:'Log Toss',atkDesc:'Throws a heavy log in a straight line (2,000 damage at level 11). On a hit it splits into four splinters that fly on and hit for less.',
  supName:'Beaver Dam',supDesc:'Builds a dam pond. Teammates inside slowly heal and move faster. Enemies inside take damage, and stay soaked with slower, harder-hitting poison after they leave.',
  look:{body:'#8a5a3b',belly:'#d9b48f',accent:'#ff8fc7',proj:'#a0673f',hat:'none'},sig:{name:'Lumberjack',body:'#6e4229',belly:'#caa27c',accent:'#e23d3d',proj:'#8a5a3b',hat:'beanie'}},
 {id:'pebble',name:'Pebble',rarity:'rare',role:'Slingshot scout',rad:18,hp:2900,speed:152,reload:1.0,superNeed:3200,pref:.75,weapon:'sling',
  atk:{kind:'burst',n:2,gap:.12,range:370,spd:820,dmg:520,r:7},sup:{kind:'bigbomb',range:400,flight:.7,dmg:1800,splash:120},
  atkName:'Double Flick',atkDesc:'Flicks two stones in quick succession.',supName:'Rockfall',supDesc:'Lobs a boulder that crushes a wide area.',
  look:{body:'#7fc96b',belly:'#e6f7d9',accent:'#e2543b',proj:'#c9c2b6',hat:'cap'},sig:{name:'Street Champ',body:'#2b2a4a',belly:'#6c6aa0',accent:'#ffd23f',proj:'#ffd23f',hat:'cap'}},
 {id:'coco',name:'Coco',rarity:'rare',role:'Coconut bomber',rad:20,hp:3600,speed:148,reload:1.2,superNeed:3500,pref:.7,weapon:'coconut',
  atk:{kind:'lob',range:340,flight:.55,dmg:950,splash:62},sup:{kind:'nova',radius:165,dmg:1200,kb:280},
  atkName:'Coconut Lob',atkDesc:'Lobs a coconut over walls that cracks open on landing.',supName:'Banana Blast',supDesc:'Stomps the roof, blasting everyone nearby back.',
  look:{body:'#a86b3c',belly:'#f2d1a8',accent:'#ffd23f',proj:'#7a4a28',hat:'monkey'},sig:{name:'Temple Guardian',body:'#d4a63a',belly:'#fff0c2',accent:'#3fae58',proj:'#ffd23f',hat:'crown'}},
 {id:'gus',name:'Gus',rarity:'epic',role:'Wrench bruiser',rad:23,hp:6000,speed:135,reload:.9,superNeed:3800,pref:0,trait:'goggles',weapon:'wrench',
  atk:{kind:'melee',range:95,arc:1.2,dmg:1400,kb:160},sup:{kind:'root',radius:150,dmg:1100,stun:1.2},
  atkName:'Wrench Swing',atkDesc:'A big wrench swing that pushes enemies back.',supName:'Ground Shock',supDesc:'Slams the wrench down, stunning everyone close by.',
  look:{body:'#4f86c6',belly:'#cfe3f7',accent:'#ffb347',proj:'#ffb347',hat:'none'},sig:{name:'Rust Bucket',body:'#a5532c',belly:'#e9b38f',accent:'#9fb0c2',proj:'#e9b38f',hat:'antenna'}},
 {id:'luna',name:'Luna',rarity:'epic',role:'Moon witch',rad:19,hp:3200,speed:150,reload:1.05,superNeed:3500,pref:.75,weapon:'moon',
  atk:{kind:'crescent',range:340,spd:560,dmg:520,r:12,curve:2.0},sup:{kind:'heal',radius:200,heal:2800},
  atkName:'Twin Crescents',atkDesc:'Throws two moon crescents that curve in from both sides and cut through enemies.',supName:'Moonlight',supDesc:'Bathes every teammate nearby in healing light.',
  look:{body:'#7c6cf0',belly:'#e0dbff',accent:'#ffe27a',proj:'#fff1b0',hat:'witch'},sig:{name:'Eclipse',body:'#1f1a3a',belly:'#3c335f',accent:'#ff7a1a',proj:'#ff7a1a',hat:'witch',glow:'#ff7a1a',eye:'#ffb347'}},
 {id:'quill',name:'Quill',rarity:'mythic',role:'Spiky skirmisher',rad:20,hp:4000,speed:145,reload:1.1,superNeed:3600,pref:.5,weapon:'quill',
  atk:{kind:'spread',n:7,arc:1.0,range:250,spd:620,dmg:210,r:6},sup:{kind:'nova',radius:200,dmg:1500,kb:240},
  atkName:'Quill Spray',atkDesc:'Fires seven quills in a wide fan.',supName:'Quill Storm',supDesc:'Launches quills in every direction at once.',
  look:{body:'#9a7b5c',belly:'#efe0c9',accent:'#4a3628',proj:'#f5ead8',hat:'quills'},sig:{name:'Punk Spike',body:'#2d2a3e',belly:'#5a5577',accent:'#ff3fa4',proj:'#ff3fa4',hat:'quills'}},
 {id:'fang',name:'Fang',rarity:'mythic',role:'Wolf hunter',rad:19,hp:3700,speed:168,reload:.7,superNeed:3200,pref:.2,trait:'ears',weapon:'claw',
  atk:{kind:'spread',n:3,arc:.7,range:150,spd:700,dmg:420,r:9,pierce:true},sup:{kind:'dash',range:400,spd:950,dmg:1300,kb:220},
  atkName:'Claw Swipe',atkDesc:'Three short claw slashes that cut through enemies.',supName:'Pounce',supDesc:'Leaps forward, tearing through everyone in the way.',
  look:{body:'#8b95a8',belly:'#e4e8f0',accent:'#ff4d6d',proj:'#ffd1dc',hat:'none'},sig:{name:'Midnight Howl',body:'#2b2f4a',belly:'#56607f',accent:'#7fe9fb',proj:'#7fe9fb',hat:'none',glow:'#7fe9fb',eye:'#7fe9fb'}},
 {id:'astra',name:'Astra',rarity:'legendary',role:'Star caller',rad:19,hp:3300,speed:152,reload:1.15,superNeed:3600,pref:.8,weapon:'laser',
  atk:{kind:'single',range:420,spd:1200,dmg:950,r:7,pierce:true},sup:{kind:'field',range:380,radius:140,dur:3,dps:1000,flight:.5,pull:120},
  atkName:'Star Lance',atkDesc:'A piercing laser that hits every enemy in a line.',supName:'Black Hole',supDesc:'Opens a black hole that drags enemies in and damages them.',
  look:{body:'#2e2a6b',belly:'#7f78d6',accent:'#ffe27a',proj:'#fff4b0',hat:'halo',sprinkles:true},sig:{name:'Supernova',body:'#ff7a1a',belly:'#ffd29a',accent:'#ffffff',proj:'#ffd38a',hat:'halo',glow:'#ffb347'}},
 {id:'lilt',name:'Lil T',rarity:'mythic',role:'Bat bruiser',rad:21,hp:5200,speed:155,reload:1.1,superNeed:12000,pref:0,trait:'wood',
  atk:{kind:'melee',range:95,arc:1.4,dmg:3235.3,kb:160,bat:{poison:294.12,dur:5}},sup:{kind:'homebat',seek:700,spd:720,dmg:4117.65,back:4117.65,poison:294.12,dur:5},
  atkName:'Bat Smash',atkDesc:'Swings his bat up close (5,500 damage at level 11). Every bat hit slows the enemy, makes them take 25% more damage and poisons them for 500 a second, all for 5 seconds.',
  supName:'Bat Toss',supDesc:'Throws his bat at the nearest enemy. It chases them until it hits (7,000 damage at level 11), then flies back and hits anyone else in its way for 7,000 too. Thrown bat hits slow, weaken and poison just like his swings.',
  look:{body:'#b07a45',belly:'#e2bf8a',accent:'#2fae66',proj:'#f4f1e6',hat:'sprout'},sig:{name:'Midnight Slugger',body:'#3b2a20',belly:'#7a5a40',accent:'#ff4d6d',proj:'#ffd1dc',hat:'cap'}},
 {id:'zapper',name:'Zapper',rarity:'mythic',role:'Storm caller',rad:19,hp:5200,speed:140,reload:.5,ammo:3,superNeed:9000,pref:.15,trait:'cloud',
  atk:{kind:'cloudzap',zone:150,range:150,dmg:1764.71,jumpR:150,jumps:2},sup:{kind:'thunder',range:0,radius:300,dur:6,clouds:4,dmg:380,rate:.5},
  atkName:'Storm Cloud',atkDesc:'Zapper has no bullets of his own. A storm cloud floats above him, and it only charges up while an enemy is inside his zone. Each charge zaps an enemy in the zone with lightning (3,000 damage at level 11), and the bolt jumps to up to 2 more enemies standing close to them.',
  supName:'Thunderhead',supDesc:'Summons a huge storm zone around him with a ring of thunderclouds that keep zapping every enemy inside for 6 seconds.',
  look:{body:'#4f6bd8',belly:'#d6e2ff',accent:'#ffe14d',proj:'#bfe6ff',hat:'none'},sig:{name:'Red Storm',body:'#7a2340',belly:'#ffc2d4',accent:'#ff5e87',proj:'#ff9bb5',hat:'none'}},
 {id:'fizz',name:'Fizz',rarity:'epic',role:'Soda blaster',rad:19,hp:3500,speed:155,reload:1.3,superNeed:5000,pref:.6,boxy:true,weapon:'bolt',
  atk:{kind:'burst',n:4,gap:.07,range:310,spd:760,dmg:300,r:7},sup:{kind:'field',range:360,radius:130,dur:4,dps:750,flight:.5},
  atkName:'Shaken Up',atkDesc:'Fires four fizzy bubbles in a quick burst.',supName:'Sugar Rush',supDesc:'Lobs a can that bursts into a sticky soda puddle, hurting and slowing enemies in it.',
  look:{body:'#ff5e87',belly:'#ffd1dc',accent:'#ffffff',proj:'#ffd1dc',hat:'straw'},sig:{name:'Lime Zero',body:'#5fd35f',belly:'#e3ffd6',accent:'#1f3a1f',proj:'#c8ff9a',hat:'straw'}},
 {id:'sprocket',name:'Sprocket',rarity:'rare',role:'Gear tosser',rad:19,hp:3300,speed:150,reload:1.0,superNeed:3400,pref:.7,boxy:true,weapon:'wrench',
  atk:{kind:'saw',range:300,spd:600,dmg:560,r:11,sawDps:900},sup:{kind:'sawring',n:8,range:320,spd:640,dmg:700,r:12},
  atkName:'Buzz Saw',atkDesc:'Throws a saw blade that keeps spinning on the ground where it stops.',supName:'Saw Storm',supDesc:'Eight saw blades fly out in a ring around him, cutting through everyone.',
  look:{body:'#ff9a3d',belly:'#ffe2c2',accent:'#3a2d22',proj:'#c9c2b6',hat:'hardhat'},sig:{name:'Chrome',body:'#aeb8cc',belly:'#f2f5fb',accent:'#5ef2ff',proj:'#5ef2ff',hat:'antenna',shine:true}},
 {id:'dotty',name:'Dotty',rarity:'rare',role:'Paint splasher',rad:18,hp:3000,speed:156,reload:.9,superNeed:3300,pref:.7,weapon:'bolt',
  atk:{kind:'paint',n:3,arc:.35,range:330,spd:700,dmg:340,r:7,splat:280},sup:{kind:'rainbow',range:380,dps:700,n:5},
  atkName:'Paint Splat',atkDesc:'Flicks three paint blobs that leave sticky puddles where they land.',supName:'Rainbow Road',supDesc:'Paints a long rainbow stripe that slows and hurts enemies standing on it.',
  look:{body:'#5ec8ff',belly:'#ffffff',accent:'#ff5e87',proj:'#ffd23f',hat:'beanie'},sig:{name:'Graffiti',body:'#2a2238',belly:'#ffd23f',accent:'#6be39a',proj:'#ff3fa4',hat:'cap'}},
 {id:'hopper',name:'Hopper',rarity:'rare',role:'Bouncy frog',rad:18,hp:3200,speed:162,reload:.95,superNeed:3200,pref:.5,trait:'ears',weapon:'claw',
  atk:{kind:'bounce',range:420,spd:780,dmg:820,r:8},sup:{kind:'tongue',range:380,dmg:1300,stun:.6},
  atkName:'Bouncy Blob',atkDesc:'Spits a blob that bounces once off walls.',supName:'Tongue Grab',supDesc:'Shoots out his tongue, grabs the first enemy it touches and yanks them right next to him.',
  look:{body:'#6bcf5a',belly:'#e3ffd6',accent:'#ff7aa8',proj:'#ff7aa8',hat:'none'},sig:{name:'Poison Dart',body:'#3d5aff',belly:'#ffd23f',accent:'#1a1430',proj:'#ffd23f',hat:'none'}},
 {id:'blaze',name:'Blaze',rarity:'epic',role:'Flame dancer',rad:19,hp:3600,speed:158,reload:.8,superNeed:3800,pref:.4,weapon:'bolt',
  atk:{kind:'melee',range:150,arc:.8,dmg:950,kb:40,burn:{dps:250,dur:3}},sup:{kind:'phoenix',range:380,spd:900,dmg:1200,dps:800},
  atkName:'Flame Whip',atkDesc:'Cracks a long fiery whip that sets enemies on fire for 3 seconds.',supName:'Phoenix Dash',supDesc:'Bursts forward as a phoenix, leaving a trail of fire behind.',
  look:{body:'#ff6b2c',belly:'#ffd9a8',accent:'#ffd23f',proj:'#ffb347',hat:'flame'},sig:{name:'Blue Flame',body:'#2b5bff',belly:'#bfe6ff',accent:'#7fe9fb',proj:'#7fe9fb',hat:'flame',glow:'#7fe9fb'}},
 {id:'mossy',name:'Mossy',rarity:'epic',role:'Mushroom healer',rad:20,hp:4200,speed:142,reload:1.2,superNeed:4000,pref:.65,weapon:'moon',
  atk:{kind:'spore',range:330,flight:.55,dmg:600,splash:60,dps:300,heal:.06},sup:{kind:'mushring',radius:200,dur:4,heal:700,dps:500},
  atkName:'Spore Puff',atkDesc:'Lobs a puffball that bursts into a spore cloud: it hurts enemies and heals teammates inside.',supName:'Fairy Ring',supDesc:'Grows a ring of glowing mushrooms that heals teammates and hurts enemies inside for 4 seconds.',
  look:{body:'#e2543b',belly:'#fff6e8',accent:'#ffffff',proj:'#ffe27a',hat:'sprout'},sig:{name:'Glowcap',body:'#2a1458',belly:'#9dff6b',accent:'#5ef2ff',proj:'#9dff6b',hat:'sprout',glow:'#9dff6b'}},
 {id:'rivet',name:'Rivet',rarity:'epic',role:'Nail gunner',rad:21,hp:4600,speed:140,reload:.75,superNeed:4200,pref:.6,boxy:true,weapon:'wrench',
  atk:{kind:'nails',n:3,gap:.09,range:360,spd:840,dmg:300,r:6,boom:260},sup:{kind:'scaffold',hp:3000,life:10},
  atkName:'Sticky Nails',atkDesc:'Fires three nails that stick in enemies and pop a moment later.',supName:'Scaffolding',supDesc:'Builds a wall of three sturdy crates in front of him to hide behind.',
  look:{body:'#4f86c6',belly:'#ffe8a8',accent:'#ffb000',proj:'#c9c2b6',hat:'hardhat'},sig:{name:'Demolition',body:'#2a2238',belly:'#ff9a3d',accent:'#ff3b30',proj:'#ff9a3d',hat:'hardhat'}},
 {id:'nova',name:'Nova',rarity:'mythic',role:'Star knight',rad:20,hp:4400,speed:150,reload:.85,superNeed:3800,pref:.3,weapon:'claw',
  atk:{kind:'starslash',range:130,arc:1.2,dmg:620,shards:3,shardDmg:260},sup:{kind:'starfall',range:400,n:6,dmg:700,splash:70},
  atkName:'Star Slash',atkDesc:'A glowing sword slash that also throws three little star shards.',supName:'Starfall',supDesc:'Calls six stars down around a spot, each one exploding as it lands.',
  look:{body:'#3b3399',belly:'#e0dbff',accent:'#ffd36b',proj:'#ffd36b',hat:'starcrest',glow:'#ffd36b'},sig:{name:'Solar',body:'#ffb000',belly:'#fff3b0',accent:'#ff3b30',proj:'#ff9a3d',hat:'halo',shine:true}},
 {id:'shade',name:'Shade',rarity:'mythic',role:'Shadow sniper',rad:18,hp:2900,speed:152,reload:1.4,superNeed:3300,pref:.9,trait:'goggles',weapon:'bolt',
  atk:{kind:'phase',range:520,spd:1100,dmg:1450,r:7},sup:{kind:'shadowstep',range:450,cloak:2},
  atkName:'Phase Shot',atkDesc:'A long shot that passes straight through walls.',supName:'Shadow Step',supDesc:'Steps through the shadows to appear behind the nearest enemy and turns invisible for 2 seconds.',
  look:{body:'#29253a',belly:'#3e3855',accent:'#b56cff',proj:'#d6c9ff',eye:'#d6c9ff',hat:'hood'},sig:{name:'Phantom',body:'#f1f4ff',belly:'#cfd8ff',accent:'#5ef2ff',proj:'#5ef2ff',hat:'hood',glow:'#5ef2ff'}},
 {id:'dark',name:'Dark',rarity:'legendary',role:'Shadow stalker',rad:20,hp:4400,speed:162,reload:.85,superNeed:3400,pref:.1,trait:'dark',eventOnly:true,
  atk:{kind:'melee',range:112,arc:1.55,dmg:1176.47,kb:60,dark:{dps:294.12,dur:2}},sup:{kind:'darkdive',dur:5,dps:588.24},
  atkName:'Darkness Slash',atkDesc:'His hands sweep together in a dark slash (2,000 damage at level 11) that poisons for 500 a second for 2 seconds. Poisoned enemies leave a black trail behind them that lasts 15 seconds.',
  supName:'Dark Dive',supDesc:'Stand in one of your black trails and dive in: for 5 seconds Dark can\u2019t be hurt, glides through the dark, stretches the trail wherever he goes, and everyone who left a trail takes 1,000 damage a second.',
  look:{body:'#0d0a14',belly:'#0d0a14',accent:'#2a1a3a',proj:'#1a0d2e',eye:'#ffffff',hat:'none',glow:'#5a2a8a'},sig:{name:'Void',body:'#1a0b2e',belly:'#1a0b2e',accent:'#7b2fe0',proj:'#7b2fe0',eye:'#c79bff',hat:'none',glow:'#7b2fe0'}},
 {id:'frostbyte',name:'Frostbyte',rarity:'epic',role:'Ice slinger',rad:19,hp:3700,speed:150,reload:1.15,superNeed:5200,pref:.7,weapon:'nix',
  atk:{kind:'single',range:390,spd:820,dmg:920,r:8,slow:1.2},sup:{kind:'bigwave',range:380,spd:520,dmg:1400,r:46,kb:300},
  atkName:'Snow Sling',atkDesc:'Flings a hard snowball that slows whoever it hits.',supName:'Avalanche',supDesc:'Sends a huge wave of snow rolling forward that pushes enemies back.',
  look:{body:'#2b3a55',belly:'#f4fbff',accent:'#ffb000',proj:'#bfefff',hat:'beanie'},sig:{name:'Emperor',body:'#1a1a2e',belly:'#fff3d6',accent:'#ffd23f',proj:'#fff3b0',hat:'crown'}},
 {id:'clank',name:'Clank',rarity:'epic',role:'Junk bot',rad:20,hp:4600,speed:145,reload:1.0,superNeed:5600,pref:.15,boxy:true,weapon:'rook',
  atk:{kind:'pulse',range:130,dmg:820},sup:{kind:'magnet',radius:300,dmg:1200,stun:.8},
  atkName:'Scrap Shock',atkDesc:'Sends out a short shock pulse around him.',supName:'Scrap Magnet',supDesc:'Switches on a huge magnet that yanks every nearby enemy in close, zaps them and stuns them for a moment.',
  look:{body:'#8a96ab',belly:'#d7dde8',accent:'#ff9a3d',proj:'#ffcf8a',hat:'antenna'},sig:{name:'Rust Bucket',body:'#a0552b',belly:'#e6b98f',accent:'#3a2d22',proj:'#ffb36b',hat:'antenna'}},
 {id:'perk',name:'Perk',rarity:'legendary',role:'Healer',rad:18,hp:3700,speed:160,reload:1.0,superNeed:4500,pref:.1,trait:'cat',
  atk:{kind:'melee',range:82,arc:2.1,dmg:620,double:true,healAlly:520},sup:{kind:'leap',zone:420,dmg:1500,radius:120,T:.45,allies:true,heal:2600},
  atkName:'Double Scratch',atkDesc:'Scratches with both paws at everyone close by. Enemies get hurt, and teammates in reach get healed instead.',
  supName:'Pounce',supDesc:'Pounces onto the nearest enemy or teammate in his zone. Aim to pick who. Landing hurts enemies close by and heals every teammate close by, Perk included.',
  look:{body:'#f2a65a',belly:'#fff1dc',accent:'#ff7aa8',proj:'#ffd1dc',hat:'none'},sig:{name:'Midnight Kitty',body:'#3a3355',belly:'#8a7fb0',accent:'#ffd23f',proj:'#ffe9a6',hat:'none'}},
 {id:'trick',name:'Trick',rarity:'legendary',role:'Wild card',rad:19,hp:4200,speed:155,reload:1.2,superNeed:5000,pref:.5,trait:'trick',random:true,
  atk:{kind:'single',range:400,spd:900,dmg:900,r:8},sup:{kind:'nova',radius:150,dmg:1300,kb:320},
  atkName:'Anything Goes',atkDesc:'Every shot is a random attack borrowed from another rumbler, never the same one twice in a row. Levels 1-4 roll Common to Epic rumblers, levels 5-10 add Mythic and Legendary, and level 11 can roll anything, even Amazing. Borrowed moves hit as hard as Trick\u2019s own level, not the original rumbler\u2019s.',
  supName:'Wild Card',supDesc:'Every super is a random super from another rumbler. His gadget changes every time he uses it, and he spawns with a random star power and new moves every time.',
  look:{body:'#7a52ff',belly:'#e3dbff',accent:'#ffd23f',proj:'#ff9bf0',hat:'party'},sig:{name:'Joker Flip',body:'#1f1a2e',belly:'#ff5e87',accent:'#5ef2ff',proj:'#5ef2ff',hat:'party'}},
 {id:'edray',name:'Ed Ray',rarity:'mythic',role:'Combo brawler',rad:19,hp:4400,speed:175,reload:1.25,ammo:2,superNeed:5200,pref:.05,trait:'ray',
  atk:{kind:'fist',range:130,spd:900,r:10,dmg:900,kb:110,strongDmg:1650,strongKb:380,far:.3,strongFar:.6},sup:{kind:'leap',zone:380,dmg:2000,radius:110,T:.5},
  atkName:'One-Two',atkDesc:'Up close, fires a short spring-loaded fist that pushes enemies back a little. Land it and his next fist comes back fast and turns gold: a power punch with much more damage and knockback. Fists hit harder the farther they fly.',
  supName:'Thunder Hop',supDesc:'Leaps onto the nearest enemy inside his hop zone and lands with an electric blast. If nobody is in the zone, the super stays gray and he can\u2019t jump.',
  look:{body:'#3fb6c9',belly:'#d8f6ff',accent:'#ffe14d',proj:'#9fe8ff',hat:'none'},sig:{name:'Storm Ray',body:'#2b2f6b',belly:'#8fa2ff',accent:'#7df9ff',proj:'#7df9ff',hat:'none'}},
 {id:'juggler',name:'Juggler',rarity:'mythic',role:'Tank brawler',rad:24,hp:6800,speed:145,reload:2.2,ammo:1,superNeed:9000,pref:0,trait:'strongman',
  atk:{kind:'melee',range:88,arc:1.25,dmg:3529.41,kb:520,punch:true},sup:{kind:'grabthrow',grab:210,dist:600,spd:950,dmg:3529.41,min:.25},
  atkName:'Haymaker',atkDesc:'Throws one huge punch that knocks enemies back (6,000 damage at level 11). He only has one punch loaded, and it takes a while to come back.',
  supName:'Big Toss',supDesc:'Grabs the nearest enemy and hurls them across the roof. The farther they fly, the more it hurts, up to 6,000 damage at level 11. Walls stop them early, so aim for open space.',
  look:{body:'#c0563a',belly:'#f1c9a8',accent:'#2f3a66',proj:'#ffd23f',hat:'none'},sig:{name:'Iron Titan',body:'#5d6b80',belly:'#aab6c8',accent:'#ffb000',proj:'#ffd23f',hat:'hardhat'}},
 {id:'orion',name:'Orion',rarity:'celestial',role:'Star weaver',rad:20,hp:4000,speed:152,reload:1.15,superNeed:9000,pref:.75,trait:'constellation',
  atk:{kind:'star',range:380,spd:820,dmg:1764.71,r:11,spread:2,spreadR:170,slow:2},sup:{kind:'starzone',range:400,radius:140,flight:.55,dur:6,dps:352.94,poison:176.47,poisonT:3},
  atkName:'Shooting Star',atkDesc:'Throws a star for 3,000 damage at level 11 that slows. When it hits, it splits into stars that fly at up to 2 more enemies standing close to the target, each also hitting for 3,000.',
  supName:'Star Well',supDesc:'Throws a black hole that opens a star zone for 6 seconds. Enemies inside are slowed, hit by falling stars (600 a second) and poisoned (300 a second for 3 seconds after). Teammates inside deal 15% more damage and move 10% faster, and Orion reloads twice as fast.',
  look:{body:'#232057',belly:'#3d3590',accent:'#ffd36b',proj:'#ffe48a',eye:'#ffe9a6',hat:'starcrest'},sig:{name:'Solar Flare',body:'#ff7a3d',belly:'#ffd29a',accent:'#fff3a6',proj:'#ffb347',hat:'starcrest',glow:'#ffb347'}},
 {id:'zenith',name:'Meteorite',rarity:'ultra',role:'Solar system controller',rad:21,hp:4200,speed:150,reload:1.2,superNeed:4200,pref:.75,trait:'cosmic',
  atk:{kind:'orbs',range:360,flight:.65,dmg:1176.47,splash:60},sup:{kind:'meteor',range:420,radius:115,flight:1.1},
  atkName:'Sun & Moon',atkDesc:'Lobs a sun and a moon that land side by side (2,000 damage each at level 11, 4,000 together). Every rumbler Meteorite knocks out adds their attack to his volley, up to 15 different attacks and 100,000 total damage. Getting knocked out loses every absorbed attack.',
  supName:'Meteor Fall',supDesc:'Calls down a meteor that knocks out anything it lands on. Up to 3 shadows of rumblers Meteorite has absorbed rise from the crater, wearing their skins, and fight for him at half strength.',
  look:{body:'#ffb347',belly:'#2a2766',accent:'#fff3a6',proj:'#ffd36b',hat:'none'},sig:{name:'Black Sun',body:'#ff3d6e',belly:'#140b2e',accent:'#ff9a3d',proj:'#ff7a5c',hat:'none',glow:'#ff3d6e'}},
];
const BY_ID={};RUMBLERS.forEach(b=>BY_ID[b.id]=b);
const STARTER='ember';

/* Gadgets (3 uses per match) and star powers (always on). Bought in the rumbler sheet once the rumbler is high enough level. */
const GADGET_LVL=5,STAR_LVL=7,GADGET_COST=1000,STAR_COST=2000;
const G=(id,name,type,val,desc)=>({id,name,type,val,desc});
const GEAR={
 ember:{g:[G('ember-g1','Fire Starter','blast',900,'Bursts into flame, hitting enemies close by.'),G('ember-g2','Hot Feet','speed',.4,'Moves 40% faster for 3 seconds.')],
        s:[G('ember-s1','Wildfire','dmg',.1,'Flames deal 10% more damage.'),G('ember-s2','Ember Heart','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 bolt:{g:[G('bolt-g1','Quick Load','reload',0,'Instantly refills all ammo.'),G('bolt-g2','Roll Out','dash',220,'Rolls a short distance.')],
       s:[G('bolt-s1','Long Sight','range',.12,'Attack range is 12% longer.'),G('bolt-s2','Steady Hands','charge',.2,'Super charges 20% faster.')]},
 spritz:{g:[G('spritz-g1','Fizz Pop','heal',.35,'Heals 35% of max health.'),G('spritz-g2','Bubble Wall','shield',.5,'Takes half damage for 2.5 seconds.')],
         s:[G('spritz-s1','Extra Fizz','regen',1.5,'Starts healing 1.5 seconds sooner.'),G('spritz-s2','Sugar Rush','speed',.08,'Moves 8% faster.')]},
 nix:{g:[G('nix-g1','Cold Snap','slowfield',140,'Freezes the air around Nix, slowing nearby enemies.'),G('nix-g2','Ice Skates','speed',.4,'Moves 40% faster for 3 seconds.')],
      s:[G('nix-s1','Deep Freeze','slowplus',1,'Slows last twice as long.'),G('nix-s2','Thick Coat','hp',.12,'12% more health.')]},
 zing:{g:[G('zing-g1','Spin Out','dash',220,'Spins a short distance.'),G('zing-g2','Lucky Catch','reload',0,'Instantly refills all ammo.')],
       s:[G('zing-s1','Sharp Edge','dmg',.1,'Boomerangs deal 10% more damage.'),G('zing-s2','Light Feet','speed',.08,'Moves 8% faster.')]},
 boulder:{g:[G('boulder-g1','Rock Armor','shield',.5,'Takes half damage for 2.5 seconds.'),G('boulder-g2','Ground Pound','blast',1100,'Slams the ground, hitting enemies close by.')],
          s:[G('boulder-s1','Bedrock','hp',.12,'12% more health.'),G('boulder-s2','Avalanche','charge',.2,'Super charges 20% faster.')]},
 pip:{g:[G('pip-g1','Spare Bombs','reload',0,'Instantly refills all ammo.'),G('pip-g2','Smoke Hop','dash',230,'Hops a short distance.')],
      s:[G('pip-s1','Bigger Bang','splash',.25,'Bomb blasts are 25% wider.'),G('pip-s2','Short Fuse','reloadspd',.15,'Reloads 15% faster.')]},
 marlo:{g:[G('marlo-g1','High Tide','heal',.3,'Heals 30% of max health.'),G('marlo-g2','Undertow','pull',220,'Drags nearby enemies toward Marlo.')],
        s:[G('marlo-s1','Tsunami','dmg',.1,'Waves deal 10% more damage.'),G('marlo-s2','Sea Legs','speed',.08,'Moves 8% faster.')]},
 volta:{g:[G('volta-g1','Static Shield','shield',.5,'Takes half damage for 2.5 seconds.'),G('volta-g2','Short Circuit','blast',900,'Discharges, hitting enemies close by.')],
        s:[G('volta-s1','Conductor','chainplus',1,'Sparks jump to one more enemy.'),G('volta-s2','Battery Pack','charge',.2,'Super charges 20% faster.')]},
 vex:{g:[G('vex-g1','Smoke Step','dash',240,'Blinks a short distance.'),G('vex-g2','Second Wind','heal',.3,'Heals 30% of max health.')],
      s:[G('vex-s1','Shadow Blade','dmg',.1,'Slashes deal 10% more damage.'),G('vex-s2','Drain','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 bramble:{g:[G('bramble-g1','Thorn Snare','pull',220,'Drags nearby enemies toward Bramble.'),G('bramble-g2','Bark Skin','shield',.5,'Takes half damage for 2.5 seconds.')],
          s:[G('bramble-s1','Deep Roots','hp',.12,'12% more health.'),G('bramble-s2','Sap','regen',1.5,'Starts healing 1.5 seconds sooner.')]},
 rook:{g:[G('rook-g1','Patch Kit','heal',.3,'Heals 30% of max health.'),G('rook-g2','Overclock','reload',0,'Instantly refills all ammo.')],
       s:[G('rook-s1','Reinforced','turretplus',.4,'Sentries have 40% more health and damage.'),G('rook-s2','Quick Build','charge',.2,'Super charges 20% faster.')]},
 echo:{g:[G('echo-g1','Feedback','blast',1000,'A burst of noise that hits enemies close by.'),G('echo-g2','Encore','reload',0,'Instantly refills all ammo.')],
       s:[G('echo-s1','Subwoofer','range',.15,'Pulses reach 15% farther.'),G('echo-s2','Groove','speed',.08,'Moves 8% faster.')]},
 woodrow:{g:[G('woodrow-g1','Super Find','reveal',6,'Puts a red X on every opponent, wherever they are. Marked enemies can\'t hide in bushes and take 15% more damage for 6 seconds.'),
             G('woodrow-g2','Hunter\'s Shotgun','shotgun',2,'Whips out the shotgun he found near the dam and blasts the nearest enemy with auto-aim, stunning them for 2 seconds.')],
          s:[G('woodrow-s1','Splinter Storm','split6',6,'Logs split into six splinters instead of four.'),G('woodrow-s2','Cozy Lodge','lodge',1,'Dams last 3 seconds longer and heal twice as fast.')]},
 lilt:{g:[G('lilt-g1','Big Swing','blast',1300,'Swings his bat in a full circle, smacking enemies close by.'),G('lilt-g2','Stolen Base','speed',.4,'Moves 40% faster for 3 seconds.')],
       s:[G('lilt-s1','Long Reach','range',.12,'Bat swings reach 12% farther.'),G('lilt-s2','Clutch Hitter','charge',.2,'Bat Toss charges 20% faster.')]},
 zapper:{g:[G('zapper-g1','Static Charge','reload',0,'Instantly fills the storm cloud.'),G('zapper-g2','Lightning Rod','blast',1100,'Calls a lightning strike on enemies close by.')],
         s:[G('zapper-s1','Wide Front','range',.15,'His zone reaches 15% farther.'),G('zapper-s2','Overcharge','dmg',.12,'Lightning hits 12% harder.')]},
 dark:{g:[G('dark-g1','Virus','darkvirus',588.24,'Only during Dark Dive: everyone close to Dark catches the virus and takes 1,000 a second for 5 seconds.'),G('dark-g2','Marked in Shadow','darkreveal',6,'Only during Dark Dive: poisoned enemies are revealed even in bushes, with a dark X over their heads.')],
  s:[G('dark-s1','Deep Venom','darkvenom',1,'Dark Dive poison hits 1,750 a second, but Darkness Slash hits a bit softer and its poison is weaker.'),G('dark-s2','Kind Shadows','darkheal',205.88,'Darkness Slash also touches teammates, healing them 350 a second for 2 seconds.')]},
 sprocket:{g:[G('spr-g1','Oil Slick','speed',.4,'Moves 40% faster for 3 seconds.'),G('spr-g2','Spring Trap','blast',900,'Pops a spring that blasts enemies close by.')],s:[G('spr-s1','Sharp Teeth','dmg',.1,'Gears hit 10% harder.'),G('spr-s2','Quick Hands','reloadspd',.2,'Reloads 20% faster.')]},
 dotty:{g:[G('dot-g1','Fresh Coat','speed',.4,'Moves 40% faster for 3 seconds.'),G('dot-g2','Splash Zone','blast',900,'Splashes paint on everyone close by.')],s:[G('dot-s1','Thick Paint','dmg',.1,'Paint hits 10% harder.'),G('dot-s2','Fast Brush','reloadspd',.2,'Reloads 20% faster.')]},
 hopper:{g:[G('hop-g1','Leap Frog','speed',.5,'Moves 50% faster for 3 seconds.'),G('hop-g2','Croak','blast',900,'A loud croak that blasts enemies close by.')],s:[G('hop-s1','Sticky Tongue','dmg',.12,'Hits 12% harder.'),G('hop-s2','Lily Pad','reloadspd',.2,'Reloads 20% faster.')]},
 blaze:{g:[G('blz-g1','Hot Feet','speed',.4,'Moves 40% faster for 3 seconds.'),G('blz-g2','Flare','blast',1100,'A flare of fire hits enemies close by.')],s:[G('blz-s1','Hotter','dmg',.1,'Flames hit 10% harder.'),G('blz-s2','Quick Spark','reloadspd',.2,'Reloads 20% faster.')]},
 mossy:{g:[G('mos-g1','Spore Cloud','blast',900,'Puffs spores that hurt enemies close by.'),G('mos-g2','Speedy Spores','speed',.4,'Moves 40% faster for 3 seconds.')],s:[G('mos-s1','Big Puffs','dmg',.1,'Puffballs hit 10% harder.'),G('mos-s2','Regrow','reloadspd',.2,'Reloads 20% faster.')]},
 rivet:{g:[G('riv-g1','Hard Hat','speed',.35,'Moves 35% faster for 3 seconds.'),G('riv-g2','Nail Ring','blast',1000,'Sprays nails all around.')],s:[G('riv-s1','Steel Nails','dmg',.1,'Nails hit 10% harder.'),G('riv-s2','Auto Feed','reloadspd',.2,'Reloads 20% faster.')]},
 nova:{g:[G('nov-g1','Starstep','speed',.5,'Moves 50% faster for 3 seconds.'),G('nov-g2','Supernova','blast',1300,'Explodes in starlight around her.')],s:[G('nov-s1','Bright Blade','dmg',.12,'Slashes hit 12% harder.'),G('nov-s2','Stardust','reloadspd',.2,'Reloads 20% faster.')]},
 shade:{g:[G('shd-g1','Fade','speed',.5,'Moves 50% faster for 3 seconds.'),G('shd-g2','Dark Pulse','blast',1000,'A pulse of shadow hits enemies close by.')],s:[G('shd-s1','Steady Aim','dmg',.12,'Shots hit 12% harder.'),G('shd-s2','Night Reload','reloadspd',.2,'Reloads 20% faster.')]},
 fizz:{g:[G('fizz-g1','Sugar High','speed',.4,'Moves 40% faster for 3 seconds.'),G('fizz-g2','Pop Top','blast',1000,'Pops his lid, blasting enemies close by.')],
       s:[G('fizz-s1','Extra Fizz','dmg',.1,'Bubbles hit 10% harder.'),G('fizz-s2','Quick Shake','reloadspd',.2,'Reloads 20% faster.')]},
 frostbyte:{g:[G('frostbyte-g1','Ice Slide','dash',240,'Belly-slides a short distance.'),G('frostbyte-g2','Snow Globe','slowfield',150,'Freezes the ground around him, slowing enemies.')],
            s:[G('frostbyte-s1','Deep Freeze','slowplus',1,'Slows last twice as long.'),G('frostbyte-s2','Thick Coat','hp',.12,'12% more health.')]},
 clank:{g:[G('clank-g1','Patch Up','heal',.3,'Heals 30% of max health.'),G('clank-g2','Overclock','reload',0,'Instantly refills all ammo.')],
        s:[G('clank-s1','Bolted Down','hp',.12,'12% more health.'),G('clank-s2','Spare Parts','turretplus',1,'Junk Turret has more health and lasts longer.')]},
 perk:{g:[G('perk-g1','Ultra Heal','healzone',420,'Drops a healing circle where Perk is standing. Teammates inside heal for 4 seconds.'),G('perk-g2','Quick Paws','reloadzone',2,'Drops a circle where Perk is standing. Teammates inside reload twice as fast for 4 seconds.')],
       s:[G('perk-s1','Selfish Claws','selfish',1,'Scratching a teammate hurts them instead, and Perk heals by the same amount.'),G('perk-s2','Big Heart','kind',1,'Heals teammates 50% more, but every heal costs Perk some of his own health.')]},
 trick:{g:[G('trick-g1','Mystery Gadget','mystery',0,'A random gadget from any rumbler. It changes every time he uses it.'),G('trick-g2','Pick a Rarity','pickrarity',0,'Choose a rarity and his next attack is guaranteed to come from a rumbler of that rarity. Which rarities you can pick depends on his level.')],
        s:[G('trick-s1','Mystery Star','mystery',0,'A random star power from any rumbler, new every time he spawns.')]},
 edray:{g:[G('edray-g1','Spring Hop','dash',240,'Bounces a short distance.'),G('edray-g2','Static Shock','blast',1000,'Zaps enemies close by.')],
        s:[G('edray-s1','Hard Knuckles','dmg',.12,'Fists deal 12% more damage.'),G('edray-s2','Quick Recoil','reloadspd',.25,'Fists come back 25% faster.')]},
 juggler:{g:[G('juggler-g1','Come Here','pull',220,'Yanks nearby enemies right up to Juggler.'),G('juggler-g2','Iron Skin','shield',.5,'Tenses up and takes half damage for 2.5 seconds.')],
          s:[G('juggler-s1','Quick Hands','reloadspd',.35,'His punch comes back 35% faster.'),G('juggler-s2','Long Toss','tossplus',.3,'Big Toss throws enemies 30% farther.')]},
 orion:{g:[G('orion-g1','Stardust','slowfield',150,'Sprinkles stardust that slows enemies close by.'),G('orion-g2','Starlight','heal',.3,'Heals 30% of max health.')],
        s:[G('orion-s1','Supercluster','chainplus',1,'Stars split to one more nearby enemy.'),G('orion-s2','Event Horizon','zoneplus',2,'Star Well lasts 2 seconds longer.')]},
 zenith:{g:[G('zenith-g1','Solar Flare','blast',1400,'Flares like a sun, burning enemies close by.'),G('zenith-g2','Lunar Shield','shield',.5,'Moonlight wraps Meteorite, halving damage for 2.5 seconds.')],
         s:[G('zenith-s1','Infinite Orbit','maxsteal',20,'Meteorite can hold up to 20 absorbed attacks instead of 15.'),G('zenith-s2','Lasting Shadows','shadowlife',4,'Shadows stay for 12 seconds instead of 8.')]},
 pebble:{g:[G('pebble-g1','Pocket Refill','reload',0,'Instantly refills all ammo.'),G('pebble-g2','Slide','dash',220,'Slides a short distance.')],
         s:[G('pebble-s1','Lucky Stone','dmg',.1,'Stones deal 10% more damage.'),G('pebble-s2','Quick Hands','reloadspd',.15,'Reloads 15% faster.')]},
 coco:{g:[G('coco-g1','Banana Snack','heal',.35,'Heals 35% of max health.'),G('coco-g2','Monkey Hop','dash',230,'Hops a short distance.')],
       s:[G('coco-s1','Big Coconut','splash',.25,'Coconut splashes are 25% wider.'),G('coco-s2','Thick Fur','hp',.12,'12% more health.')]},
 gus:{g:[G('gus-g1','Tune Up','shield',.5,'Takes half damage for 2.5 seconds.'),G('gus-g2','Pipe Burst','blast',1100,'Bursts a pipe, hitting enemies close by.')],
      s:[G('gus-s1','Steel Toes','hp',.12,'12% more health.'),G('gus-s2','Torque','charge',.2,'Super charges 20% faster.')]},
 luna:{g:[G('luna-g1','Moon Dust','slowfield',140,'Sprinkles dust that slows nearby enemies.'),G('luna-g2','Lunar Step','dash',230,'Glides a short distance.')],
       s:[G('luna-s1','Full Moon','dmg',.1,'Moon discs deal 10% more damage.'),G('luna-s2','Night Glow','lifesteal',.15,'Heals for 15% of damage dealt.')]},
 quill:{g:[G('quill-g1','Prickle','blast',1000,'Puffs up, hitting enemies close by.'),G('quill-g2','Curl Up','shield',.5,'Takes half damage for 2.5 seconds.')],
        s:[G('quill-s1','Sharp Quills','dmg',.1,'Quills deal 10% more damage.'),G('quill-s2','Spiky Hide','regen',1.5,'Starts healing 1.5 seconds sooner.')]},
 fang:{g:[G('fang-g1','Howl','speed',.4,'Moves 40% faster for 3 seconds.'),G('fang-g2','Lunge','dash',260,'Lunges a short distance.')],
       s:[G('fang-s1','Bloodhound','lifesteal',.15,'Heals for 15% of damage dealt.'),G('fang-s2','Pack Leader','speed',.08,'Moves 8% faster.')]},
 astra:{g:[G('astra-g1','Gravity Well','pull',240,'Drags nearby enemies toward Astra.'),G('astra-g2','Warp','dash',260,'Warps a short distance.')],
        s:[G('astra-s1','Event Horizon','range',.12,'Lasers reach 12% farther.'),G('astra-s2','Stardust','charge',.2,'Super charges 20% faster.')]},
};
const gearOf=b=>GEAR[b.id];
function gearById(id){for(const k in GEAR){for(const x of GEAR[k].g)if(x.id===id)return x;for(const x of GEAR[k].s)if(x.id===id)return x;}return null;}

const THEMES=[
 {id:'cardboard',name:'Cardboard Bot',tier:1,body:'#c99c63',belly:'#e0bd8b',accent:'#5d4026',proj:'#c99c63',hat:'antenna',boxy:true,tape:true},
 {id:'jungle',name:'Jungle Scout',tier:1,body:'#4f8f3c',belly:'#94c870',accent:'#f2d36b',proj:'#94c870',hat:'leaf',stripes:true},
 {id:'candy',name:'Candy Pop',tier:1,body:'#ff8fc7',belly:'#ffd6eb',accent:'#6fe0d0',proj:'#ff8fc7',hat:'swirl',sprinkles:true},
 {id:'pumpkin',name:'Pumpkin Patch',tier:1,body:'#ff8a1f',belly:'#ffc07a',accent:'#3f7d2c',proj:'#ff8a1f',hat:'stem',grin:true},
 {id:'frost',name:'Frostbite',tier:1,body:'#bfe6ff',belly:'#f1faff',accent:'#3d9bff',proj:'#d4f1ff',hat:'icecrown',frost:true},
 {id:'space',name:'Space Cadet',tier:1,body:'#e9edf6',belly:'#ffffff',accent:'#ff6b4a',proj:'#ff6b4a',hat:'helmet'},
 {id:'neon',name:'Neon Night',tier:2,body:'#231d55',belly:'#3b3090',accent:'#29e3ff',proj:'#29e3ff',eye:'#29e3ff',glow:'#29e3ff',hat:'visor'},
 {id:'lava',name:'Lava Core',tier:2,body:'#3a1d16',belly:'#6e2a14',accent:'#ff7a1a',proj:'#ff7a1a',hat:'horns',cracks:true},
 {id:'shadow',name:'Shadow Mode',tier:2,body:'#29253a',belly:'#3e3855',accent:'#a78bfa',proj:'#a78bfa',eye:'#d6c9ff',hat:'hood'},
 {id:'arcade',name:'Arcade Glitch',tier:2,body:'#2bd4a4',belly:'#a8f5df',accent:'#ff3fa4',proj:'#ff3fa4',hat:'pixel',scan:true},
 {id:'ninja',name:'Shadow Ninja',tier:2,body:'#2a2238',belly:'#4a3d66',accent:'#ff3b5c',proj:'#ff3b5c',hat:'bandana'},
 {id:'pirate',name:'Sea Dog',tier:1,body:'#c0563a',belly:'#f1c9a8',accent:'#ffd23f',proj:'#ffd23f',hat:'tricorn'},
 {id:'witchy',name:'Hex Witch',tier:2,body:'#6b4bd8',belly:'#cdb8ff',accent:'#7ed957',proj:'#9dff6b',hat:'witch',glow:'#9dff6b'},
 {id:'zombie',name:'Zombie',tier:2,body:'#7fb069',belly:'#c8e6a0',accent:'#5a2d2d',proj:'#a6d86a',hat:'none',stripes:true},
 {id:'vampire',name:'Night Fang',tier:3,body:'#3a1d3a',belly:'#e6d0e6',accent:'#ff3b5c',proj:'#ff3b5c',hat:'horns',glow:'#ff3b5c'},
 {id:'beach',name:'Beach Day',tier:1,body:'#5ec8ff',belly:'#fff3c4',accent:'#ff9a3d',proj:'#7fd3ff',hat:'snorkel'},
 {id:'flowery',name:'Flower Power',tier:1,body:'#ff9bc0',belly:'#fff0f6',accent:'#6be39a',proj:'#ff9bc0',hat:'flower'},
 {id:'builder',name:'Builder',tier:1,body:'#ffb000',belly:'#ffe8a8',accent:'#3a2d22',proj:'#ffd23f',hat:'hardhat'},
 {id:'dj',name:'DJ Drop',tier:2,body:'#1f1a2e',belly:'#3a2d6b',accent:'#5ef2ff',proj:'#5ef2ff',hat:'headphones',glow:'#5ef2ff'},
 {id:'cosmo',name:'Cosmonaut',tier:3,body:'#e9edf6',belly:'#ffffff',accent:'#ff3b30',proj:'#ff9a3d',hat:'helmet',shine:true},
 {id:'heli',name:'Propeller Kid',tier:1,body:'#6be39a',belly:'#e3ffef',accent:'#ff5e87',proj:'#6be39a',hat:'propeller'},
 {id:'knight',name:'Iron Knight',tier:3,body:'#9aa6bd',belly:'#e3e8f2',accent:'#ffd23f',proj:'#ffe98a',hat:'helmet',shine:true},
 {id:'galaxy2',name:'Galaxy Brain',tier:3,body:'#1d1b52',belly:'#3b3399',accent:'#ff9bf0',proj:'#ff9bf0',hat:'halo',starry:true,glow:'#ff9bf0'},
 {id:'sushi',name:'Sushi Chef',tier:1,body:'#ffffff',belly:'#ff8a80',accent:'#1a1430',proj:'#ff8a80',hat:'bandana'},
 {id:'robo',name:'Robo Rumbler',tier:2,body:'#9aa6bd',belly:'#e3e8f2',accent:'#5ef2ff',proj:'#5ef2ff',hat:'antenna',boxy:true,scan:true},
 {id:'lavaqueen',name:'Magma Royal',tier:3,body:'#3a1d16',belly:'#ff7a1a',accent:'#ffd23f',proj:'#ff7a1a',hat:'crown',cracks:true,glow:'#ff7a1a'},
 {id:'snowday',name:'Snow Day',tier:1,body:'#f1faff',belly:'#bfe6ff',accent:'#ff3b5c',proj:'#ffffff',hat:'beanie'},
 {id:'bubblegum',name:'Bubblegum',tier:2,body:'#ff9bc0',belly:'#ffffff',accent:'#5ec8ff',proj:'#ff9bc0',hat:'swirl',sprinkles:true},
 {id:'jungleking',name:'Jungle King',tier:3,body:'#ffb000',belly:'#fff0b0',accent:'#3f7d2c',proj:'#ffd23f',hat:'leaf',stripes:true,shine:true},
 {id:'cyber',name:'Cyber Punk',tier:2,body:'#1f1a2e',belly:'#ff3fa4',accent:'#5ef2ff',proj:'#ff3fa4',hat:'visor',glow:'#ff3fa4',scan:true},
 {id:'gold',name:'Golden',tier:'golden',body:'#f0b429',belly:'#ffe08a',accent:'#fff6cf',proj:'#ffd84d',hat:'crown',shine:true,glow:'#ffd23f'},
];
/* Season 1 Rumble Pass exclusive skins: only from the pass, never sold */
const PASS_SKIN_IDS=['ember','bolt','pip','woodrow','zenith'];
const STARFALL={id:'starfall',name:'Starfall',tier:'pass',body:'#1d1b52',belly:'#3b3399',accent:'#ffd36b',proj:'#ffd36b',eye:'#ffe9a6',hat:'halo',starry:true,glow:'#ffd36b'};
const MASTER_SKIN={id:'master',name:'Grandmaster',tier:'master',body:'#1b1430',belly:'#4a2f7a',accent:'#ffd23f',proj:'#ffd23f',eye:'#ffd23f',hat:'crown',glow:'#ff5e87',shine:true};
/* Rank sets: the first time you reach a rank you get a rank skin (Ember for Grandmaster, a random rumbler for the rest) and an "I reached …" pin of Ember holding a sign.
   idx is the ladder step that unlocks it (0 = your first ranked match). Master's set is the Grandmaster skin + Master pin. */
const RANK_SETS=[
 {key:'bronze',name:'Bronze',idx:0,pin:'rk_bronze',pal:['#ffd2a8','#c77a43'],ink:'#8a4a24',skin:{id:'rk_bronze',name:'Bronze Rank',tier:'rank',body:'#c47a45',belly:'#f2cfa6',accent:'#ffb47a',proj:'#e7a36b',hat:'flame'}},
 {key:'silver',name:'Silver',idx:3,pin:'rk_silver',pal:['#ffffff','#8d97ae'],ink:'#4f5a74',skin:{id:'rk_silver',name:'Silver Rank',tier:'rank',body:'#aeb8cc',belly:'#f2f5fb',accent:'#ffffff',proj:'#dfe6f5',hat:'flame',shine:true}},
 {key:'gold',name:'Gold',idx:6,pin:'rk_gold',pal:['#fff1a0','#d9951a'],ink:'#9a5f00',skin:{id:'rk_gold',name:'Gold Rank',tier:'rank',body:'#f0b429',belly:'#fff0b0',accent:'#fff6cf',proj:'#ffd84d',hat:'flame',shine:true,glow:'#ffd23f'}},
 {key:'diamond',name:'Diamond',idx:9,pin:'rk_diamond',pal:['#e6fdff','#2fa9d8'],ink:'#13719e',skin:{id:'rk_diamond',name:'Diamond Rank',tier:'rank',body:'#56cfee',belly:'#e3fbff',accent:'#ffffff',proj:'#9ff0ff',hat:'icecrown',frost:true,shine:true,glow:'#7fe9fb'}},
 {key:'mythic',name:'Mythic',idx:12,pin:'rk_mythic',pal:['#f0dcff','#8a4ff0'],ink:'#5a2cc0',skin:{id:'rk_mythic',name:'Mythic Rank',tier:'rank',body:'#8a5cf5',belly:'#e3d4ff',accent:'#ff9bf0',proj:'#c79bff',hat:'horns',glow:'#c79bff'}},
 {key:'legendary',name:'Legendary',idx:15,pin:'rk_legendary',pal:['#ffd1dc','#e83a6a'],ink:'#b81f4f',skin:{id:'rk_legendary',name:'Legendary Rank',tier:'rank',body:'#ff4f7e',belly:'#ffd1dc',accent:'#ffd23f',proj:'#ff9bb5',hat:'starcrest',glow:'#ff7aa8',shine:true}},
 {key:'ultra',name:'Ultra',idx:18,pin:'rk_ultra',pal:['#e6fdff','#7df9ff'],ink:'#1a6a8a',skin:{id:'rk_ultra',name:'Ultra Rank',tier:'rank',body:'#141a4a',belly:'#7df9ff',accent:'#ff9bf0',proj:'#7df9ff',eye:'#e6fdff',hat:'starcrest',glow:'#7df9ff',shine:true,starry:true,ultraFx:true}},
 {key:'master',name:'Masters',idx:18,pin:'master',pal:['#ffd23f','#9d7bff'],ink:'#b8336a',skin:MASTER_SKIN},
];
/* Ghost Lantern set: a Juggler skin that comes with its own pin */
const LANTERN_SKIN={id:'lantern',name:'Ghost Lantern',tier:2,set:'lantern',body:'#6fd9bd',belly:'#e2fff5',accent:'#3a2d6b',proj:'#a8ffe0',eye:'#2b2450',hat:'flame',glow:'#7fffd4'};
/* Close-range rumblers have a zone: while an enemy is inside it their super slowly charges. Stronger attacks get a smaller zone. */
function closeZone(b){if(b.random)return 0;if(b._zone!=null)return b._zone;if(b.atk.kind==='cloudzap')return(b._zone=b.atk.zone);const a=b.atk,close=a.kind==='melee'||a.kind==='fist'||(a.kind==='spread'&&a.range<=240);
  return(b._zone=close?Math.round(clamp(330-a.dmg*(a.n||1)/b.reload/12,170,300)):0);}
const ZONE_CHARGE=.04;
const WILDCARD_SKIN={id:'wildcard',name:'Wild Card',tier:3,set:'wildcard',body:'#ff5e87',belly:'#fff6e8',accent:'#1f1a2e',proj:'#ffd23f',eye:'#1f1a2e',hat:'party',wildcard:true,glow:'#ffffff'};
const MAID_SKIN={id:'maid',name:'Maid Outfit',tier:3,maid:true,body:'#2b2238',belly:'#ffffff',accent:'#ffffff',proj:'#ff9bc0',hat:'none'};
const SET_PINS=[['lantern','Ghost Lantern'],['wildcard','Wild Card']];
/* Voice lines: s = spawn, k = takedown, u = super, d = knocked out, w = win. Some rumblers never talk. */
const VOICE_SILENT=['clank','zenith','orion','frostbyte'];
const VOICE_GENERIC={s:['Let\u2019s rumble!','Rooftop time!'],k:['Got one!','Too easy!','Next!'],u:['Here it comes!','Super time!'],d:['Ouch!','I\u2019ll be back!'],w:['We win!','GG!']};
const VOICE={ember:{k:['Burned!','Too hot to handle!'],u:['Inferno!']},bolt:{k:['Bullseye!'],u:['Rail shot!']},spritz:{k:['Splash!'],u:['Heal up, team!']},nix:{k:['Chill out.'],u:['Freeze zone!']},zing:{k:['Zing!'],u:['Triple toss!']},
 boulder:{k:['Rock solid!'],u:['Rolling through!']},pip:{k:['Kaboom!'],u:['Big bomb!']},marlo:{k:['Washed out!'],u:['Surf\u2019s up!']},volta:{k:['Shocking!'],u:['Chain reaction!']},vex:{k:['Vexed!'],u:['Dash!']},
 bramble:{k:['Tangled!'],u:['Roots!']},rook:{k:['Calculated.'],u:['Turret up!']},echo:{k:['Hear that?'],u:['Sound wave!']},woodrow:{k:['Timber!'],u:['Dam it up!']},pebble:{k:['Pebbled!'],u:['Bombs away!']},
 coco:{k:['Cracked!'],u:['Coconut storm!']},gus:{k:['Blown away!'],u:['Gust!']},luna:{k:['Moonstruck!'],u:['Moonlight!']},quill:{k:['Pricked!'],u:['Needles!']},fang:{k:['Chomp!'],u:['Pounce!']},
 astra:{k:['Stargazed!'],u:['Black hole!']},lilt:{k:['Home run!','Batter up!'],u:['Bat toss!']},perk:{s:['Meow!'],k:['Hiss!','Meow!'],u:['Pounce!'],d:['Mrrow!']},trick:{k:['Ta-da!'],u:['Pick a card!'],s:['Abracadabra!']},
 edray:{k:['One-two!'],u:['Thunder hop!']},juggler:{k:['Too strong!'],u:['Big toss!'],s:['Who wants a hug?']},zapper:{k:['Zapped!'],u:['Storm\u2019s coming!']},fizz:{k:['Pop!'],u:['Sugar rush!']},blaze:{k:['Toasted!'],u:['Firestorm!']},dark:{s:['...'],k:['Into the dark.'],u:['Dive.'],d:['I fade...']},mossy:{k:['Spored!'],u:['Grow, team!']},nova:{k:['Starstruck!'],u:['Comet charge!']},shade:{k:['From the dark.'],u:['Shadow chain!']},hopper:{s:['Ribbit!'],k:['Ribbit!']},dotty:{k:['Splat!'],u:['Paint bomb!']},sprocket:{k:['Clank clank!'],u:['Bot online!']},rivet:{k:['Nailed it!'],u:['Toolbox!']}};
/* Prestige: 1 per win, max 250. Rewards every 50. Bronze under 150, Silver from 150, Gold at 250. */
const PRESTIGE_MAX=250;
const PRESTIGE_SKINS=[
 {id:'pr_bronze',name:'Bronze',tier:'prestige',prestige:50,body:'#c47a45',belly:'#f2cfa6',accent:'#8a4a24',proj:'#e7a36b'},
 {id:'pr_charged',name:'Charged',tier:'prestige',prestige:150,charged:true,glow:'#5ef2ff',accent:'#5ef2ff',proj:'#5ef2ff',eye:'#bdfbff'},
 {id:'pr_super',name:'Supercharged',tier:'prestige',prestige:250,supercharged:true,glow:'#ffd23f',accent:'#ffd23f',proj:'#ffe98a',eye:'#fff3b0',shine:true}];
const PRESTIGE_REWARDS={50:{coins:500,pp:250,drops:[{r:'epic',n:1}],skin:'pr_bronze',pin:'bronze'},100:{coins:1000,pp:500,drops:[{r:'mythic',n:1}]},
 150:{coins:1500,pp:750,drops:[{r:'mythic',n:2}],skin:'pr_charged',pin:'silver'},200:{coins:2000,pp:1000,drops:[{r:'legendary',n:1}]},250:{coins:3000,pp:1500,drops:[{r:'legendary',n:2}],skin:'pr_super',pin:'gold'}};
const prestigeTier=n=>n>=250?{name:'Gold',col:'#ffd23f'}:n>=150?{name:'Silver',col:'#d6dbe8'}:{name:'Bronze',col:'#e7a36b'};
const isPrestigePin=id=>/^pr:[a-z]+:(bronze|silver|gold)$/.test(id)&&!!BY_ID[id.split(':')[1]];
/* Troll skins: silly animated skins for every rumbler */
const TROLL_SKINS=[{id:'disco',name:'Disco Fever',tier:'troll',troll:'disco',body:'#ff5e87',belly:'#fff3f8',accent:'#ffd23f',proj:'#ff9bf0',hat:'party',glow:'#ff9bf0'},
 {id:'glitch',name:'Glitched',tier:'troll',troll:'glitch',body:'#2bd4a4',belly:'#1a1430',accent:'#ff3fa4',proj:'#5ef2ff',eye:'#5ef2ff',scan:true},
 {id:'honk',name:'Honk Honk',tier:'troll',troll:'clown',body:'#f7f4ff',belly:'#ffd1dc',accent:'#ff3b5c',proj:'#ff3b5c',hat:'none'},
 {id:'ducky',name:'Rubber Ducky',tier:'troll',troll:'duck',body:'#ffd23f',belly:'#fff3b0',accent:'#ff9a3d',proj:'#ffe98a',hat:'none'}];
/* Every buyable skin comes with a matching skin pin: sk:<rumbler>:<skin> */
/* Every skin better than the basic ones comes with a 3-pin set (happy, angry, sad) */
const skinPinFaces=sk=>sk.tier!==0?['happy','angry','sad','cool','love']:null;
const isSkinPin=id=>{const m=/^sk:([a-z]+):([a-z_0-9]+)(?::(happy|angry|sad|cool|love))?$/.exec(id);return!!(m&&BY_ID[m[1]]&&skinsOf(BY_ID[m[1]]).some(k=>k.id===m[2]));};
const skinHasPin=sk=>sk.tier!==0&&sk.tier!=='master';
/* How flashy a skin's takedown and spawn effects are: 0 none, 1 small, 2 medium, 3 big */
const skinFx=sk=>sk.ultraFx?4:sk.tier==='halloween'?3:sk.supercharged?0:sk.tier==='power'?4:sk.tier==='golden'?3:sk.tier==='troll'?2:sk.charged||sk.tier===3||sk.tier==='sig'||sk.tier==='pass'||sk.tier==='master'?3:sk.tier===2||sk.tier==='rank'?2:sk.tier===1||sk.tier==='prestige'?1:0;
/* skins you can only earn, never buy */
const earnOnly=sk=>sk.tier==='halloween'||sk.tier==='pass'||sk.tier==='master'||sk.tier==='rank'||sk.tier==='prestige';
const SKIN_PRICE={1:{gems:30,coins:1500,pp:600},2:{gems:60,coins:3000,pp:1200},3:{gems:120,coins:6000,pp:2400},sig:{gems:90,coins:4500,pp:1800}};
SKIN_PRICE.troll={gems:80,coins:4000,pp:1600};
/* Golden skins: coins only, always for sale. Power skins: the best rarity, power points only, always for sale. */
SKIN_PRICE.golden={coins:20000};SKIN_PRICE.power={pp:10000};
const POWER_SKIN={id:'power',name:'Power Surge',tier:'power',body:'#2a1458',belly:'#6b3fd8',accent:'#c79bff',proj:'#d9b8ff',eye:'#f0e6ff',glow:'#9d7bff',powered:true,shine:true};
const ALWAYS_SKIN=sk=>sk.tier==='golden'||sk.tier==='power';
/* ---------- Halloween event ---------- */
/* Quick chat: set phrases only (no free typing with strangers). Under 7: pins only. */
const QUICK_CHAT=['Nice shot!','Thanks!','Good game!','Follow me!','Help me!','Attack!','Defend!','Wait!','Oops, sorry!','Well played!','Let\u2019s go!','So close!','Good luck!','Great team!'];
const canQuickChat=()=>S.ageBand&&S.ageBand!=='u7';
/* Profile icons: rumbler faces you own, trophy milestones, special skins, and rare icons from Rumbler Boxes */
const TROPHY_ICONS=[250,500,1000,1500,2000,2500,3000,3500,4000,4500,5000];
const SPECIAL_ICONS=[['crown','\ud83d\udc51','#ffd23f'],['skull','\ud83d\udc80','#c9cfe0'],['star','\u2b50','#ffb547'],['flame','\ud83d\udd25','#ff7a1a'],['heart','\ud83d\udc96','#ff7aa8'],['ghost','\ud83d\udc7b','#b48cff'],['bolt','\u26a1','#5ec8ff'],['moon','\ud83c\udf19','#3b3399'],['dino','\ud83e\udd96','#6be39a'],['alien','\ud83d\udc7d','#7ed957'],['gem','\ud83d\udc8e','#7df9ff'],['cool','\ud83d\ude0e','#ffd23f']];
const ICON_SKIN_TIERS=['golden','power','halloween','rank','master'];
const SPOOKY=['pumpkin','skeleton','zombie'],BOXES=['rbox','sbox'],isSpecialDrop=r=>r==='season'||SPOOKY.includes(r)||BOXES.includes(r),KNOCK_EVERY=5;
const dropName=r=>RARITY[r]?(RARITY[r].box?RARITY[r].name:RARITY[r].name+' Drop'):'Drop';
const BOX_PRICE={rbox:70,sbox:60};
const eventLocked=b=>!!(b&&b.eventOnly&&halloweenOn());
const halloweenOn=d=>{d=d||new Date();const m=d.getMonth();return m===9||(m===10&&d.getDate()<=7);};
const HALLOWEEN_SKINS=[
 {id:'hw_jack',name:'Jack-o’-Lantern',tier:'halloween',body:'#ff8a1f',belly:'#ffc07a',accent:'#3f7d2c',proj:'#ffb347',eye:'#ffe27a',hat:'stem',grin:true,glow:'#ffb347'},
 {id:'hw_skelly',name:'Skelly Bones',tier:'halloween',body:'#f1f4ff',belly:'#2a2238',accent:'#1a1430',proj:'#f1f4ff',eye:'#ff3b30',hat:'none',stripes:true},
 {id:'hw_mummy',name:'Mummy Wrap',tier:'halloween',body:'#e8dcc0',belly:'#f6eedb',accent:'#7a6a50',proj:'#e8dcc0',eye:'#7fffd4',hat:'none',tape:true,glow:'#7fffd4'},
 {id:'hw_ghost',name:'Ghostly',tier:'halloween',body:'#e9f0ff',belly:'#ffffff',accent:'#9d7bff',proj:'#cfe0ff',eye:'#3a2d6b',hat:'none',glow:'#cfe0ff'},
 {id:'hw_count',name:'Count Fangula',tier:'halloween',body:'#2a1430',belly:'#ff3b5c',accent:'#ffd23f',proj:'#ff3b5c',eye:'#ff3b5c',hat:'horns',glow:'#ff3b5c',shine:true},
 {id:'hw_frank',name:'Franken-Rumbler',tier:'halloween',body:'#7fb069',belly:'#c8e6a0',accent:'#3a2d22',proj:'#b9f27c',hat:'antennae',stripes:true},
 {id:'hw_corn',name:'Candy Corn',tier:'halloween',body:'#ffb000',belly:'#fff6e8',accent:'#ff6b2c',proj:'#ffd23f',hat:'swirl',sprinkles:true},
 {id:'hw_wolf',name:'Werewolf',tier:'halloween',body:'#5a4a3a',belly:'#a8927a',accent:'#ffd23f',proj:'#ffd23f',eye:'#ffd23f',hat:'quills'},
 {id:'hw_spider',name:'Spider Queen',tier:'halloween',body:'#1a1430',belly:'#7b2fe0',accent:'#ff3fa4',proj:'#b56cff',eye:'#ff3fa4',hat:'crown',glow:'#b56cff'},
 {id:'hw_witch',name:'Midnight Witch',tier:'halloween',body:'#3b1f6b',belly:'#7ed957',accent:'#ff8a1f',proj:'#ff8a1f',hat:'witch',glow:'#ff8a1f',starry:true}];
const SPOOKY_LOOT=[['hskin',24],['skin',10],['hpin',16],['pp',16,[300,700]],['pass',14,[80,200]],['coins',12,[500,1200]],['gems',8,[20,60]]];
const KNOCK_LOOT=[['skin',13],['drop',18],['gdrop',12],['hskin',14],['hpin',12],['spooky',10],['coins',7],['pp',7],['trick',20]];
const DARK_DROPS=15;
function skinsOf(b){
  if(b._skins)return b._skins;
  const base={...b.look,boxy:!!b.boxy};
  const list=[{...base,id:'classic',name:'Classic',tier:0}];
  THEMES.forEach(t=>list.push({...base,...t,boxy:!!(b.boxy||t.boxy)}));
  list.push({...base,...STARFALL,boxy:!!b.boxy});
  for(const ps of PRESTIGE_SKINS)list.push({...base,...ps,boxy:!!b.boxy});
  for(const hs of HALLOWEEN_SKINS)list.push({...base,...hs,boxy:!!b.boxy});
  if(b.id==='juggler')list.push({...base,...LANTERN_SKIN,boxy:!!b.boxy});
  if(b.id==='trick')list.push({...base,...WILDCARD_SKIN,boxy:!!b.boxy});
  for(const rs of RANK_SETS)list.push({...base,...rs.skin,boxy:!!b.boxy});
  for(const ts of TROLL_SKINS)list.push({...base,...ts,boxy:!!b.boxy});
  list.push({...base,...POWER_SKIN,boxy:!!b.boxy});
  if(b.id==='juggler')list.push({...base,...MAID_SKIN,boxy:!!b.boxy});
  list.push({...base,...b.sig,id:'sig',tier:'sig'});
  return(b._skins=list);
}
function getSkin(b,id){const l=skinsOf(b);return l.find(s=>s.id===id)||l[0];}
const skinPrice=sk=>sk.tier===0||earnOnly(sk)?null:SKIN_PRICE[sk.tier];
const SKIN_TOTAL=RUMBLERS.reduce((n,b)=>n+skinsOf(b).length,0);

/* ---------- Modes & maps ---------- */
const MODES=[
 {id:'ring',name:'Ring Rumble',desc:'Hold the center ring to score. Takedowns are worth 5. First team to 100 wins.',map:'yard',goal:100,time:150,ranked:true,col:'#ffc93c'},
 {id:'battery',name:'Battery Run',desc:'Grab batteries from the middle and drop them at your charger. First team to 12 wins.',map:'vents',goal:12,time:150,ranked:true,col:'#5ce1a0'},
 {id:'core',name:'Core Breaker',desc:'Smash the enemy core before they smash yours.',map:'lanes',goal:1,time:150,ranked:true,col:'#ff5d57'},
 {id:'crown',name:'Crown Carrier',desc:'Carry the crown to score. Knock out the carrier to steal it. First team to 60 wins.',map:'vents',goal:60,time:150,ranked:true,col:'#c792ff'},
 {id:'stand',name:'Last Stand',desc:'No respawns, and a storm closes in. The last team standing wins.',map:'pit',goal:0,time:120,ranked:true,col:'#ff5e87'},
 {id:'bounty',name:'Star Hunt',desc:'Every takedown earns your team a star. First team to 20 stars wins.',map:'yard',goal:20,time:150,ranked:true,col:'#ffd23f'},
 {id:'boss',name:'Giant Brawl',desc:'Your team of 3 takes on one giant rumbler with 10\u00d7 health. Take it down before time runs out.',map:'pit',goal:1,time:150,ranked:false,col:'#ff7a1a',tag:'3 vs Giant'},
 {id:'chaos',name:'Super Rush',desc:'Supers charge 4\u00d7 faster, everyone starts with a super and respawns fast. First team to 20 takedowns wins.',map:'vents',goal:20,time:150,ranked:false,col:'#ff5e87'},
 {id:'duel',name:'Duel',desc:'Just you and one opponent. First to 5 takedowns wins.',map:'pit',goal:5,time:120,ranked:false,col:'#9fe8ff',tag:'1 vs 1'},
 {id:'rush',name:'Takedown Rush',desc:'Pure 3v3 brawling. First team to 15 takedowns wins.',map:'yard',goal:15,time:150,ranked:false,col:'#46b4ff'},
 {id:'knockout',name:'Knockout',desc:'Best of 3 rounds with no respawns. Knock out the whole enemy team to win a round. Drag a round out and a storm closes in.',map:'yard',goal:2,time:300,ranked:true,col:'#ff7a5c',tag:'3 vs 3 \u00b7 best of 3'},
 {id:'hunt',name:'Bounty',desc:'Everyone has a bounty over their head: it starts at 2 stars and grows with every takedown. Knock someone out to take their whole bounty. First team to 25 stars wins.',map:'yard',goal:25,time:150,ranked:true,col:'#ffb547'},
 {id:'showdown',name:'Solo Showdown',desc:'Every rumbler for themselves with no respawns. Break boxes for energy cubes and be the last one standing. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:8,size:1,teams:8,sd:true,group:'sd',col:'#46d0ff'},
 {id:'duo',name:'Duo Showdown',desc:'Teams of 2. Knocked out? You come back next to your teammate 10 seconds later with no cubes, as long as they\u2019re still standing. When either of you grabs a cube, you both get one. Your team is out when you\u2019re both down at once. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:10,size:2,teams:5,sd:true,group:'sd',col:'#46d0ff'},
 {id:'trio',name:'Trio Showdown',desc:'Teams of 3. Knocked-out rumblers come back next to a standing teammate 10 seconds later with no cubes. Every cube a teammate grabs goes to everyone on the team who\u2019s standing. Your team is out when all three of you are down at once. Finish in the top 3 and it counts as a win.',map:'grove',goal:0,time:150,ranked:false,ffa:true,players:12,size:3,teams:4,sd:true,group:'sd',col:'#46d0ff'},
 {id:'frenzy',name:'Frenzy',desc:'Six rumblers, every one for themselves. First to 8 takedowns wins.',map:'pit',goal:8,time:120,ranked:false,ffa:true,col:'#ff9f43'},
 {id:'try',name:'Training',desc:'Try any rumbler at max level against practice bots. No rewards, no risk.',map:'yard',goal:0,time:120,ranked:false,hidden:true,col:'#6be39a'},
];
const MODE_BY={};MODES.forEach(m=>MODE_BY[m.id]=m);
const MI=(inner,bg)=>'<svg viewBox="0 0 48 48" class="mi">'+inner+'</svg>';
const SPIN=(d,cx,cy,rev)=>'<animateTransform attributeName="transform" type="rotate" from="'+(rev?360:0)+' '+cx+' '+cy+'" to="'+(rev?0:360)+' '+cx+' '+cy+'" dur="'+d+'s" repeatCount="indefinite"/>';
const BOB=(d,dy)=>'<animateTransform attributeName="transform" type="translate" values="0 0;0 '+(-dy)+';0 0" dur="'+d+'s" repeatCount="indefinite"/>';
const PULSE=(a,b,d)=>'<animate attributeName="opacity" values="'+a+';'+b+';'+a+'" dur="'+d+'s" repeatCount="indefinite"/>';
const O='stroke="#120f26" stroke-width="3" stroke-linejoin="round"';
/* Fresh animated mode icons */
const MODE_ICON={
 ring:MI('<circle cx="24" cy="24" r="18" fill="none" stroke="#120f26" stroke-width="4" stroke-dasharray="7 5"><animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="6s" repeatCount="indefinite"/></circle><circle cx="24" cy="24" r="11" fill="#fff" '+O+'/><circle cx="24" cy="24" r="5" fill="#120f26"><animate attributeName="r" values="4;6;4" dur="1.2s" repeatCount="indefinite"/></circle>'),
 battery:MI('<rect x="13" y="9" width="22" height="33" rx="5" fill="#fff" '+O+'/><rect x="19" y="4" width="10" height="6" rx="2" fill="#120f26"/><rect x="17" y="30" width="14" height="8" rx="2" fill="#5ce1a0"><animate attributeName="y" values="30;14;30" dur="2.4s" repeatCount="indefinite"/><animate attributeName="height" values="8;24;8" dur="2.4s" repeatCount="indefinite"/></rect><path d="M26 15l-6 9h5l-3 8 7-10h-5z" fill="#120f26"/>'),
 core:MI('<g>'+SPIN(10,24,24)+'<path d="M24 3l17 10v22L24 45 7 35V13z" fill="#fff" '+O+'/></g><circle cx="24" cy="24" r="9" fill="#ff5d57" '+O+'>'+PULSE(1,.5,1)+'</circle><path d="M24 15v18M15 24h18" stroke="#120f26" stroke-width="2.5"/>'),
 crown:MI('<g>'+BOB(1.6,3)+'<path d="M7 36l-2-22 10 9 9-16 9 16 10-9-2 22z" fill="#ffd23f" '+O+'/><rect x="7" y="37" width="34" height="6" rx="2" fill="#ffd23f" '+O+'/><circle cx="24" cy="26" r="3.5" fill="#ff4d6d"/></g><path d="M40 6l1.5 3.5L45 11l-3.5 1.5L40 16l-1.5-3.5L35 11l3.5-1.5z" fill="#fff">'+PULSE(1,.2,1.1)+'</path>'),
 stand:MI('<path d="M24 4l17 6v12c0 11-8 18-17 22C15 40 7 33 7 22V10z" fill="#fff" '+O+'/><path d="M24 12v20M16 22h16" stroke="#120f26" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="24" r="21" fill="none" stroke="#120f26" stroke-width="2" stroke-dasharray="3 4">'+SPIN(5,24,24,1)+'</circle>'),
 bounty:MI('<g>'+SPIN(4,24,24)+'<path d="M24 4l5.5 12 13 1.2-9.8 8.6 2.9 12.8L24 31.9l-11.6 6.7 2.9-12.8-9.8-8.6 13-1.2z" fill="#fff" '+O+'/></g><circle cx="24" cy="24" r="4" fill="#120f26"/>'),
 hunt:MI('<rect x="8" y="5" width="32" height="38" rx="3" fill="#f6e2b0" '+O+'/><text x="24" y="16" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="8" fill="#120f26">WANTED</text><g>'+BOB(1.2,2)+'<path d="M24 20l3 6.5 7 .7-5.3 4.7 1.6 7L24 35.2l-6.3 3.7 1.6-7-5.3-4.7 7-.7z" fill="#ffb000" stroke="#120f26" stroke-width="2"/></g>'),
 boss:MI('<g>'+BOB(1,1.5)+'<circle cx="24" cy="27" r="17" fill="#fff" '+O+'/><path d="M10 15l-3-11 10 7M38 15l3-11-10 7" fill="#ff7a1a" '+O+'/><path d="M14 23l7 3M34 23l-7 3" stroke="#120f26" stroke-width="3" stroke-linecap="round"/><path d="M15 35q9-7 18 0" fill="none" stroke="#120f26" stroke-width="3"/></g>'),
 chaos:MI('<path d="M27 3L9 27h12l-3 18 21-26H26z" fill="#ffd23f" '+O+'>'+PULSE(1,.45,.5)+'</path><circle cx="38" cy="9" r="3" fill="#fff">'+PULSE(.2,1,.7)+'</circle><circle cx="9" cy="40" r="2.5" fill="#fff">'+PULSE(1,.2,.9)+'</circle>'),
 duel:MI('<g><animateTransform attributeName="transform" type="rotate" values="-6 24 24;6 24 24;-6 24 24" dur="1s" repeatCount="indefinite"/><path d="M8 6l20 20-4 4L4 10V6zM40 6v4L20 30l-4-4L36 6z" fill="#fff" '+O+'/><path d="M10 34l6-6 4 4-6 6zM38 34l-6-6-4 4 6 6z" fill="#120f26"/></g>'),
 rush:MI('<g>'+BOB(.6,2)+'<path d="M6 30h22l-4 10 18-18H20l4-10z" fill="#fff" '+O+'/></g><path d="M4 18h10M2 24h8M6 12h8" stroke="#120f26" stroke-width="3" stroke-linecap="round">'+PULSE(1,.3,.6)+'</path>'),
 knockout:MI('<g><animateTransform attributeName="transform" type="translate" values="-3 0;4 0;-3 0" dur=".7s" repeatCount="indefinite"/><path d="M10 16c0-6 5-10 11-10h8c7 0 12 5 12 12v8c0 6-5 10-11 10H19l-4 6H9l2-8c-1-2-1-4-1-6z" fill="#ff5d57" '+O+'/><path d="M22 6v10c0 3 2 5 5 5h6" fill="none" stroke="#120f26" stroke-width="3"/></g><path d="M3 22h4M2 28h5" stroke="#120f26" stroke-width="3" stroke-linecap="round"/>'),
 showdown:MI('<g>'+SPIN(8,24,24)+'<path d="M24 4l18 10v20L24 44 6 34V14z" fill="#fff" '+O+'/></g><path d="M24 12l10 6-10 6-10-6z" fill="#46d0ff" stroke="#120f26" stroke-width="2.5"><animate attributeName="fill" values="#46d0ff;#9ff0ff;#46d0ff" dur="1.4s" repeatCount="indefinite"/></path><path d="M14 18v12l10 6V24zM34 18v12l-10 6V24z" fill="#1f8fb5" stroke="#120f26" stroke-width="2.5"/>'),
 frenzy:MI('<path d="M24 4c3 8 12 10 12 22a12 12 0 0 1-24 0c0-6 3-9 5-12 1 4 3 5 4 5-1-6 1-11 3-15z" fill="#ff9f43" '+O+'><animateTransform attributeName="transform" type="scale" values="1 1;1.04 .96;1 1" dur=".5s" repeatCount="indefinite" additive="sum"/></path><path d="M24 22c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" fill="#ffd23f">'+PULSE(1,.6,.4)+'</path>'),
 try:MI('<circle cx="24" cy="24" r="18" fill="#fff" '+O+'/><circle cx="24" cy="24" r="11" fill="#6be39a" '+O+'/><circle cx="24" cy="24" r="4" fill="#120f26">'+PULSE(1,.3,.8)+'</circle>')
};

/* Maps: top half of a 20x32 tile grid; the bottom half is the top rotated 180°. */
const MAPS={
 yard:{name:'Crate Yard',top:['....................','....................','..##............##..','..##....bbbb....##..','........bbbb........','bb..#..........#..bb','bb..#....##....#..bb','....#....##....#....','....................','..###..........###..','......bb....bb......','......bb....bb......','...#............#...','...#....#..#....#...','bb......#..#......bb','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 vents:{name:'Vent Alley',top:['....................','....................','.##..............##.','.##.....####.....##.','....................','....bb........bb....','....bb..#..#..bb....','........#..#........','.###............###.','....................','......bbb..bbb......','.##..............##.','.##....#....#....##.','.......#....#.......','....................','....................'],
  spawns:[[[330,1530],[500,1555],[670,1530]],[[670,70],[500,45],[330,70]]],pads:[[500,1505],[500,95]]},
 lanes:{name:'Twin Lanes',top:['....................','....................','....................','......##....##......','.......#....#.......','..bb............bb..','..bb...######...bb..','....................','#..#............#..#','#..#....bbbb....#..#','........bbbb........','....##........##....','....##........##....','.bb..............bb.','.bb.....#..#.....bb.','....................'],
  spawns:[[[300,1540],[500,1562],[700,1540]],[[700,60],[500,38],[300,60]]],cores:[[500,1460],[500,140]]},
 grove:{name:'Storm Grove',top:['....................', '.bb..............bb.', '.bb...##....##...bb.', '......#......#......', '..##....bbbb....##..', '..#.....bbbb.....#..', '.....##......##.....', 'bbb..............bbb', 'bbb...#......#...bbb', '......#..bb..#......', '..##.....bb.....##..', '..##............##..', '.......##..##.......', '.bb..............bb.', '.bb....#....#....bb.', '....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],
  ffa:[[75,75],[500,75],[925,75],[75,800],[925,800],[75,1525],[500,1525],[925,1525]],
  boxes:[[175,175],[825,175],[475,325],[75,525],[925,525],[325,575],[675,575],[825,1425],[175,1425],[525,1275],[925,1075],[75,1075],[675,1025],[325,1025]]},
 pit:{name:'The Pit',top:['....................','....................','...##..........##...','........bbbb........','.bb......##......bb.','.bb..............bb.','......#......#......','...#..#......#..#...','...#............#...','.......bb..bb.......','.##....bb..bb....##.','....................','.....##......##.....','..b..............b..','..b.....#..#.....b..','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],
  ffa:[[75,75],[925,75],[75,800],[925,800],[75,1525],[925,1525]]},
 rooftops:{name:'Sky Rooftops',top:['....................','....................','.##..............##.','.##....b....b....##.','.......b....b.......','...###........###...','..........bb........','bb.....#....#.....bb','bb.....#....#.....bb','....#..........#....','....#...bbbb...#....','........bbbb........','..##............##..','..##....#..#....##..','........#..#........','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 garden:{name:'Hedge Garden',top:['....................','....................','..bbb..........bbb..','..bbb...####...bbb..','....................','.##...bb....bb...##.','.##...bb....bb...##.','.........##.........','bbb..............bbb','bbb.....#..#.....bbb','........#..#........','...##..........##...','...##...bbbb...##...','........bbbb........','.bb..............bb.','.bb..............bb.'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 harbor:{name:'Harbor Docks',top:['....................','....................','....#..........#....','....#..........#....','....####....####....','..........bb........','bb........bb......bb','bb..###......###..bb','....................','......bb....bb......','......bb....bb......','.##......##......##.','.##......##......##.','....................','....bb........bb....','....bb........bb....'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]]},
 hollow:{name:'Haunted Hollow',top:['....................','....................','.##......bb......##.','.#.......bb.......#.','....##........##....','....#..........#....','.bb..............bb.','.bb...###..###...bb.','....................','..##....bbbb....##..','..#.....bbbb.....#..','....................','.....##......##.....','.bb..............bb.','.bb....#....#....bb.','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],ffa:[[75,75],[500,75],[925,75],[75,800],[925,800],[75,1525],[500,1525],[925,1525]],boxes:[[175,175],[825,175],[475,325],[75,525],[925,525],[325,575],[675,575],[825,1425],[175,1425],[525,1275],[925,1075],[75,1075],[675,1025],[325,1025]]},
 arena:{name:'Spooky Arena',top:['....................','....................','...##....bb....##...','...#.....bb.....#...','.........##.........','.bb..............bb.','.bb...##....##...bb.','......#......#......','....................','...###...bb...###...','.........bb.........','....................','..bb....#..#....bb..','..bb....#..#....bb..','....................','....................'],
  spawns:[[[350,1525],[500,1545],[650,1525]],[[650,75],[500,55],[350,75]]],ffa:[[75,75],[925,75],[75,800],[925,800],[75,1525],[925,1525]]},
};
/* Maps rotate every day. Each mode picks from the maps that fit it. */
const MAP_POOLS={team:['yard','vents','lanes','pit','rooftops','garden','harbor'],core:['lanes','yard','rooftops','harbor','pit'],sd:['grove','hollow'],ffa:['pit','arena','grove','hollow']};
function mapPool(m){m=MODE_BY[m]||m;return m.id==='core'?MAP_POOLS.core:m.sd?MAP_POOLS.sd:m.ffa?MAP_POOLS.ffa:MAP_POOLS.team;}
function dailyMap(modeId,day){const pool=mapPool(modeId);let h=2166136261;for(const ch of (day||todayKey())+modeId)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return pool[h%pool.length];}

/* Ranked ladder */
const TIERS=[['Bronze','#e7a36b'],['Silver','#d6dbe8'],['Gold','#ffd23f'],['Diamond','#7fe9fb'],['Mythic','#c79bff'],['Legendary','#ff7aa8'],['Ultra','#7df9ff']];
const DIVS=['I','II','III'];
const RANK_STEPS=TIERS.length*3+1;
function rankInfo(rp){
  const i=Math.min(RANK_STEPS-1,Math.floor(Math.max(0,rp)/100));
  if(i===RANK_STEPS-1)return{i,name:'Master',col:'#ff5e87',tier:TIERS.length,div:'',into:Math.max(0,rp)-i*100,need:0};
  const t=Math.floor(i/3);return{i,name:TIERS[t][0]+' '+DIVS[i%3],col:TIERS[t][1],tier:t,div:DIVS[i%3],into:rp-i*100,need:100};
}
/* Ranked rewards: every division gives a bundle with guaranteed drops; Master gives a huge one */
const RR_DROP=['rare','epic','mythic','legendary','legendary','legendary','legendary'];
const MASTER_REWARD={master:true,chromos:15000,gems:500,coins:10000,pp:5000,drops:[{r:'ultra',n:3},{r:'legendary',n:5}]};
function rankReward(i){if(i>=RANK_STEPS-1)return MASTER_REWARD;const t=Math.floor(i/3);
  if(t===6){const d=i%3;return{chromos:[3000,4500,5000][d],gems:[80,90,100][d],coins:200+i*120,pp:100+i*60,drops:d<2?[{r:'legendary',n:d+1}]:[{r:'legendary',n:3},{r:'ultra',n:1}]};}return{chromos:250+i*150,gems:10+i*4,coins:200+i*120,pp:100+i*60,drops:[{r:RR_DROP[t],n:i%3===0?2:1}]};}
RANK_SETS[RANK_SETS.length-1].idx=RANK_STEPS-1;
/* Which rumbler a player's rank set is for: Grandmaster is always Ember, every lower rank is a random rumbler picked per player (never repeats) */
function rankSetRumbler(k,seed){if(k>=RANK_SETS.length-1)return STARTER;const pool=RUMBLERS.filter(b=>b.id!==STARTER&&!b.random&&!b.eventOnly).map(b=>b.id),used=[STARTER];let h=((seed>>>0)||1)^0x5bd1e995;
  for(let j=0;j<=k;j++){h=Math.imul(h^(h>>>13),2654435761)>>>0;const free=pool.filter(x=>!used.includes(x));const pick=free[h%free.length];used.push(pick);if(j===k)return pick;}return STARTER;}
/* Ranked season maxed rumblers: 3 per month, usable by everyone in ranked at max level with gadget + star power */
const SEASON_MAX_FIXED={'2026-10':['zapper','juggler','perk']};
function seasonMaxed(d){d=d||new Date();const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');if(SEASON_MAX_FIXED[k])return SEASON_MAX_FIXED[k];
  let h=0;for(const ch of k)h=Math.imul(h^ch.charCodeAt(0),2654435761)>>>0;const pool=RUMBLERS.filter(b=>!b.random&&b.rarity!=='common').map(b=>b.id),out=[];
  while(out.length<3&&pool.length){h=Math.imul(h^(h>>>13),2246822519)>>>0;out.push(pool.splice(h%pool.length,1)[0]);}return out;}
const rankSeed=o=>(((o&&o.seed)>>>0)+((o&&o.rankCycle)|0)*7919)>>>0;
const RANK_PINS=RANK_SETS.map(rs=>[rs.pin,'I reached '+rs.name]);

/* ---------- Rumble Pass: Season 1 · Starfall ---------- */
const PASS_TIERS=45,PASS_STEP=100,PASS_GEMS=150,PASS_BONUS_STEP=100,PASS_WIN_EVERY=5;
const PASS_FREE=[{coins:100},{drop:'rare'},{pp:50},{chromos:200},{drop:'rare'},{gems:10},{coins:150},{drop:'rare'},{pp:80},{drop:'epic'},
 {coins:200},{chromos:400},{pp:100},{gems:15},{drop:'season'},{chromos:500},{coins:250},{drop:'rare'},{pp:120},{drop:'season'},
 {chromos:600},{drop:'epic'},{coins:300},{pp:150},{drop:'mythic'},{chromos:800},{gems:25},{drop:'season'},{pp:200},{drop:'season'},
 {coins:300},{drop:'season'},{pp:200},{chromos:900},{gems:15},{drop:'season'},{coins:400},{drop:'season'},{pp:250},{chromos:1100},{drop:'mythic'},{gems:20},{drop:'season'},{coins:500},{drop:'legendary',n:3}];
const PASS_PREM=[{skin:'ember'},{gems:10},{drop:'season'},{coins:300},{pin:'comet'},{pp:150},{chromos:600},{skin:'bolt'},{drop:'mythic'},{gems:20},
 {coins:400},{drop:'season'},{pp:200},{chromos:800},{skin:'pip'},{drop:'season',n:2},{gems:25},{pin:'galaxy'},{coins:500},{drop:'legendary'},
 {pp:250},{skin:'woodrow'},{chromos:1000},{drop:'mythic'},{drop:'season'},{coins:600},{drop:'legendary'},{skin:'zenith'},{drop:'ultra'},{drop:'season',n:2},
 {drop:'season'},{gems:30},{pin:'nebula'},{chromos:1200},{drop:'season'},{coins:700},{drop:'legendary'},{pin:'meteorshower'},{drop:'season',n:2},{pp:400},{gems:40},{drop:'ultra'},{pin:'supernova'},{drop:'season',n:3},{rumbler:'orion'}];
const passTier=xp=>Math.min(PASS_TIERS,Math.floor(xp/PASS_STEP));
const bonusAvail=xp=>Math.max(0,Math.floor((xp-PASS_TIERS*PASS_STEP)/PASS_BONUS_STEP));

/* ---------- Rumble Drops ---------- */
const DROP_RAR=['rare','epic','mythic','legendary','ultra'];
/* A drop starts at Rare (or the pass's guaranteed rarity). Each tap has this chance to upgrade one step. */
const DROP_UP=[.55,.35,.12,.05];
const DROP_ODDS=[45,35.75,16.94,2.19,.12]; // final rarity odds for a drop that starts at Rare
const DROP_LOOT={
 rare:[['coins',45,[40,80]],['pp',35,[20,40]],['chromos',19,[50,100]],['gems',1,[3,5]]],
 epic:[['coins',38,[150,250]],['pp',32,[80,140]],['chromos',26,[250,400]],['gems',2,[5,10]],['rumbler',2,['rare']]],
 mythic:[['coins',32,[400,650]],['pp',28,[200,320]],['chromos',30,[800,1200]],['gems',3,[10,20]],['skin',4],['rumbler',3,['rare','epic']]],
 legendary:[['coins',22,[900,1400]],['pp',20,[450,700]],['chromos',38,[2000,3000]],['gems',5,[25,40]],['skin',7],['rumbler',8,['epic','mythic']]],
 ultra:[['chromos',50,[6000,8000]],['coins',20,[2500,3500]],['gems',8,[60,80]],['skin',10],['rumbler',12,['mythic','legendary','ultra']]],
};
const WIN_DROPS_PER_DAY=5;
/* Lucky win drops: sometimes a daily win drop comes with a guaranteed rarity (chance in %) */
const WIN_DROP_LUCKY=[['season',.1],['ultra',.2],['legendary',1],['mythic',3],['epic',8]];

const ORD=['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'];

/* Daily rumbler offer: 50% off in chromos, or a set price in gems, coins or power points */
const OFFER_GEMS={rare:30,epic:60,mythic:100,legendary:150,ultra:250};
function offerPrices(b){const ch=RARITY[b.rarity].chromos;return[['chromos',Math.round(ch*.5)],['gems',OFFER_GEMS[b.rarity]],['coins',ch],['pp',Math.round(ch*.8)]];}
MODE_ICON.duo=MODE_ICON.showdown.replace('</svg>','<circle cx="38" cy="38" r="9" fill="#ff5e87" stroke="#120f26" stroke-width="2.5"/><text x="38" y="42.5" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="12" fill="#fff">2</text></svg>');
MODE_ICON.trio=MODE_ICON.showdown.replace('</svg>','<circle cx="38" cy="38" r="9" fill="#ffc93c" stroke="#120f26" stroke-width="2.5"/><text x="38" y="42.5" text-anchor="middle" font-family="Bungee,Impact,sans-serif" font-size="12" fill="#120f26">3</text></svg>');
/* Team showdown spawn spots: indexes into the map's free-for-all points */
const SD_WIN_PLACES=3,STAR_PLAYER_TROPHIES=5;
const SD_ANCHORS={5:[0,2,3,4,6],4:[0,2,5,7]};

/* ---------- Drawing helpers ---------- */
function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);}
function rrect(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function star(c,x,y,r1,r2,n){c.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,r=i%2?r2:r1;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();}
function bodyPath(c,R,boxy){if(boxy)rrect(c,-R,-R*.98,R*2,R*1.98,R*.42);else{c.beginPath();c.arc(0,0,R,0,TAU);}}
const glowCache=new Map();
function glowSprite(col){
  let s=glowCache.get(col);if(s)return s;
  s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,col);gr.addColorStop(.25,col);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);glowCache.set(col,s);return s;
}
function glow(c,x,y,r,col,a){if(a<=0||r<=0)return;const p=c.globalAlpha;c.globalAlpha=p*Math.min(1,a);c.drawImage(glowSprite(col),x-r,y-r,r*2,r*2);c.globalAlpha=p;}

/* Dark: a floating, legless shadow with spiky head and two small white eyes */
function drawDark(c,R,sk,ax,ay,t,o,lw){const bob=o.still?0:Math.sin(t*2.6+(o.phase||0))*R*.08;c.translate(0,-R*.12+bob);
  if(!o.flat){c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*1.7,sk.glow||'#5a2a8a',.32+.08*Math.sin(t*3));c.restore();}
  const body=sk.body,rim='#3a2a55';c.strokeStyle=rim;c.lineWidth=lw;
  const sp=[[-.78,-.42,.3,-.5],[-.5,-.82,.34,-.2],[-.08,-1.0,.4,.1],[.36,-.88,.32,.35],[.72,-.5,.28,.6]];
  c.fillStyle=body;for(const[x,y,h,tilt]of sp){const a=Math.atan2(y,x)+tilt*.3,bx=x*R,by=y*R;c.beginPath();c.moveTo(bx+Math.cos(a+1.6)*R*.18,by+Math.sin(a+1.6)*R*.18);c.lineTo(bx+Math.cos(a)*R*h*1.4,by+Math.sin(a)*R*h*1.4);c.lineTo(bx+Math.cos(a-1.6)*R*.18,by+Math.sin(a-1.6)*R*.18);c.closePath();c.fill();c.stroke();}
  const w1=Math.sin(t*5)*R*.1,w2=Math.cos(t*4.3)*R*.1;
  c.beginPath();c.arc(0,-R*.1,R*.95,Math.PI,0);c.quadraticCurveTo(R*1.0,R*.55,R*.55,R*.78);c.quadraticCurveTo(R*.35,R*1.2+w1,R*.08,R*.88);c.quadraticCurveTo(-R*.15,R*1.25+w2,-R*.42,R*.85);c.quadraticCurveTo(-R*1.0,R*.6,-R*.95,-R*.1);c.closePath();
  c.fillStyle=body;c.fill();c.stroke();
  for(const s of[-1,1]){const hx=s*R*1.05+ax*R*.25,hy=R*.25+ay*R*.2+Math.sin(t*4+s)*R*.05;c.fillStyle=body;ell(c,hx,hy,R*.2,R*.16);c.fill();c.stroke();}
  const ex=ax*R*.18,ey=-R*.18+ay*R*.08;c.fillStyle=sk.eye||'#ffffff';const bl=(t*.7%4)<.12?.2:1;
  ell(c,ex-R*.3,ey,R*.13,R*.13*bl);c.fill();ell(c,ex+R*.3,ey,R*.13,R*.13*bl);c.fill();
  if(o.mood==='angry'){c.strokeStyle=sk.eye||'#fff';c.lineWidth=lw*.6;c.beginPath();c.moveTo(ex-R*.48,ey-R*.25);c.lineTo(ex-R*.18,ey-R*.14);c.moveTo(ex+R*.48,ey-R*.25);c.lineTo(ex+R*.18,ey-R*.14);c.stroke();}
  if(o.flash>0){c.globalAlpha=Math.min(1,o.flash)*.6;c.fillStyle='#fff';c.beginPath();c.arc(0,0,R,0,TAU);c.fill();}}
function drawFighter(c,x,y,R,b,sk,aim,t,o){
  o=o||{};
  if(sk.troll==='disco'){const h=(t*240)%360;sk={...sk,body:'hsl('+h+',85%,62%)',glow:'hsl('+((h+120)%360)+',95%,65%)',proj:'hsl('+((h+60)%360)+',95%,65%)'};}
  if(sk.troll==='duck')y+=Math.sin(t*6+(o.phase||0))*R*.07;
  if(sk.troll==='glitch'&&!o.flat&&!o.ghostCopy&&(t*7%1)<.22){const j=R*.18;drawFighter(c,x-j,y,R,b,{...sk,troll:null,body:'#ff3b5c',belly:'#ff3b5c'},aim,t,{...o,alpha:.45,noShadow:true,ghostCopy:true,still:true});drawFighter(c,x+j,y,R,b,{...sk,troll:null,body:'#5ef2ff',belly:'#5ef2ff'},aim,t,{...o,alpha:.45,noShadow:true,ghostCopy:true,still:true});x+=(Math.random()-.5)*R*.2;}
  if(sk.wildcard){const h=(t*70)%360;sk={...sk,body:'hsl('+h+',80%,62%)',proj:'hsl('+((h+60)%360)+',90%,65%)',glow:'hsl('+h+',90%,70%)'};}
  c.save();c.translate(x,y);
  if(o.alpha!=null)c.globalAlpha=o.alpha;
  if(!o.noShadow){c.fillStyle='rgba(8,6,22,.38)';ell(c,0,R*.92,R*.95,R*.32);c.fill();}
  if(o.squash){c.scale(1+o.squash*.25,1-o.squash*.2);}
  if(!o.still){const k=o.moving?Math.abs(Math.sin(t*14+(o.phase||0)))*-R*.12:Math.sin(t*3.5+(o.phase||0))*R*.04;c.translate(0,k);}
  const ax=Math.cos(aim),ay=Math.sin(aim),lw=Math.max(1.5,R*.13);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=lw;
  const behind=ay<-.15;
  if(b.trait==='dark'){drawDark(c,R,sk,ax,ay,t,o,lw);c.restore();return;}
  if(behind)drawWeapon(c,b,sk,R,aim,lw,t);
  if(b.trait==='ears')drawEars(c,sk,R,lw);
  if(b.trait==='tank')drawTank(c,sk,R,lw,t);
  if(b.trait==='beaver')drawBeaverBack(c,sk,R,lw,t);
  if(b.trait==='cosmic')drawOrbit(c,sk,R,t,false);
  if(sk.troll==='disco'&&!o.flat){for(let k=0;k<5;k++){const a=t*3+k*TAU/5;c.fillStyle='hsl('+((t*300+k*72)%360)+',95%,65%)';star(c,Math.cos(a)*R*1.35,Math.sin(a)*R*.8-R*.1,R*.14,R*.06,4);c.fill();}}
  if(sk.troll==='clown'&&!o.flat){const cols=['#ff3b5c','#ffd23f','#5ec8ff','#6be39a'];for(const sx of[-1,1])for(let k=0;k<3;k++){c.fillStyle=cols[(k+(sx>0?2:0))%4];c.beginPath();c.arc(sx*R*(.85+k*.1),-R*(.55-k*.25),R*.26,0,TAU);c.fill();c.lineWidth=R*.06;c.strokeStyle=OUT;c.stroke();}}
  if(sk.wildcard&&!o.flat){const su=['\u2660','\u2665','\u2666','\u2663'];c.save();c.font='900 '+(R*.42)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
    for(let k=0;k<4;k++){const a=t*1.8+k*TAU/4,px=Math.cos(a)*R*1.45,py=Math.sin(a)*R*.7-R*.2;c.save();c.translate(px,py);rrect(c,-R*.22,-R*.3,R*.44,R*.6,R*.08);c.fillStyle='#ffffff';c.fill();c.lineWidth=R*.05;c.strokeStyle=OUT;c.stroke();c.fillStyle=k%3===0?'#1f1a2e':'#ff3b5c';c.fillText(su[k],0,R*.02);c.restore();}c.restore();}
  if(b.trait==='cloud'){c.fillStyle=sk.accent;c.beginPath();c.moveTo(-R*.15,-R*1.25);c.lineTo(R*.15,-R*.95);c.lineTo(-R*.02,-R*.92);c.lineTo(R*.12,-R*.62);c.lineTo(-R*.25,-R*.98);c.lineTo(-R*.05,-R*1.0);c.closePath();c.fill();c.stroke();}
  if(b.trait==='cat'){c.beginPath();c.moveTo(R*.6,R*.7);c.quadraticCurveTo(R*1.5,R*.9,R*1.3,R*.1);c.lineWidth=lw*2.2;c.strokeStyle=OUT;c.stroke();c.lineWidth=lw*1.2;c.strokeStyle=sk.body;c.stroke();c.lineWidth=lw;c.strokeStyle=OUT;
    for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.25,-R*.85);c.lineTo(s*R*.62,-R*1.32);c.lineTo(s*R*.85,-R*.55);c.closePath();c.fillStyle=sk.body;c.fill();c.stroke();c.beginPath();c.moveTo(s*R*.38,-R*.85);c.lineTo(s*R*.6,-R*1.15);c.lineTo(s*R*.72,-R*.72);c.closePath();c.fillStyle=sk.accent;c.fill();}}
  if(b.trait==='trick'){c.fillStyle=sk.accent;c.font='900 '+(R*.5)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('?',-R*1.05,-R*.55+Math.sin(t*4)*R*.08);c.fillText('?',R*1.1,-R*.2+Math.cos(t*4)*R*.08);}
  if(b.trait==='ray'){c.fillStyle=sk.body;for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.6,-R*.4);c.quadraticCurveTo(s*R*1.5,-R*.1,s*R*1.42,R*.3);c.lineTo(s*R*.7,R*.45);c.closePath();c.fill();c.stroke();}
    c.beginPath();c.moveTo(R*.2,R*.85);c.quadraticCurveTo(R*.5,R*1.35,R*1.05,R*1.2);c.stroke();c.fillStyle=sk.accent;c.beginPath();c.moveTo(R*1.0,R*1.05);c.lineTo(R*1.22,R*1.15);c.lineTo(R*1.02,R*1.32);c.closePath();c.fill();c.stroke();}
  if(sk.supercharged&&!o.flat){c.save();c.globalCompositeOperation='lighter';for(let k=0;k<3;k++){c.strokeStyle=['rgba(255,210,63,.55)','rgba(255,122,168,.45)','rgba(94,242,255,.45)'][k];c.lineWidth=R*.12;c.beginPath();c.arc(0,0,R*(1.25+k*.14+Math.sin(t*3+k)*.04),t*(2+k)+k*2,t*(2+k)+k*2+2.6);c.stroke();}
    for(let k=0;k<6;k++){const a=t*2.4+k*TAU/6;glow(c,Math.cos(a)*R*1.35,Math.sin(a)*R*1.35*.7,R*.22,'#fff3b0',.9);}c.restore();}
  if(sk.powered&&!o.flat){c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*1.7,'#9d7bff',.45+.15*Math.sin(t*5));c.restore();c.save();c.strokeStyle='rgba(217,184,255,.9)';c.lineWidth=R*.08;for(let k=0;k<4;k++){const a=t*6+k*1.6+Math.sin(t*11+k);c.beginPath();let px=Math.cos(a)*R*1.05,py=Math.sin(a)*R*1.05;c.moveTo(px,py);for(let j=1;j<5;j++){const aa=a+j*.25,rr=R*(1.08+((j+Math.floor(t*14))%2?.25:0));c.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);}c.stroke();}
    c.fillStyle='#e6d9ff';for(let k=0;k<5;k++){const f=(t*.9+k*.2)%1;c.globalAlpha=1-f;ell(c,Math.cos(k*1.3)*R*.8,R*.6-f*R*2,R*.07,R*.07);c.fill();}c.restore();}
  if(sk.charged&&!o.flat){c.save();c.strokeStyle='rgba(94,242,255,.85)';c.lineWidth=R*.07;for(let k=0;k<3;k++){const a=t*5+k*2.1+Math.sin(t*13+k);c.beginPath();let px=Math.cos(a)*R*1.1,py=Math.sin(a)*R*1.1;c.moveTo(px,py);for(let j=1;j<5;j++){const aa=a+j*.22;const rr=R*(1.1+((j+Math.floor(t*12))%2?.18:0));c.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);}c.stroke();}c.restore();}
  if(sk.ultraFx&&!o.flat){c.save();c.globalCompositeOperation='lighter';const h=(t*90)%360;c.strokeStyle='hsla('+h+',95%,65%,.8)';c.lineWidth=R*.09;c.beginPath();c.arc(0,0,R*1.28,t*2,t*2+Math.PI*1.3);c.stroke();c.strokeStyle='hsla('+((h+180)%360)+',95%,65%,.7)';c.beginPath();c.arc(0,0,R*1.42,-t*1.6,-t*1.6+Math.PI);c.stroke();
    for(let k=0;k<3;k++){const a=t*2.2+k*TAU/3,px=Math.cos(a)*R*1.35,py=Math.sin(a)*R*.95;c.fillStyle='hsl('+((h+k*120)%360)+',95%,70%)';c.beginPath();c.moveTo(px,py-R*.18);c.lineTo(px+R*.11,py);c.lineTo(px,py+R*.18);c.lineTo(px-R*.11,py);c.closePath();c.fill();}c.restore();}
  if(sk.glow&&!o.flat){c.shadowColor=sk.glow;c.shadowBlur=R*(sk.supercharged?1.4:.8);}
  bodyPath(c,R,sk.boxy);c.fillStyle=sk.body;c.fill();
  c.shadowBlur=0;c.shadowColor='transparent';
  c.save();bodyPath(c,R,sk.boxy);c.clip();
  if(b.trait==='cosmic'){c.fillStyle=sk.belly;c.beginPath();c.moveTo(R*.12,-R*1.2);c.quadraticCurveTo(-R*.25,0,R*.12,R*1.2);c.lineTo(R*1.3,R*1.2);c.lineTo(R*1.3,-R*1.2);c.closePath();c.fill();
    c.fillStyle='#fff';for(const[px,py,s]of[[.45,-.55,.05],[.7,-.15,.035],[.35,.35,.04],[.75,.45,.03],[.55,.05,.025]]){ell(c,px*R,py*R,s*R,s*R);c.fill();}
    c.save();c.globalCompositeOperation='lighter';glow(c,-R*.55,-R*.35,R*.7,'#fff1a6',.35);c.restore();}
  else{c.fillStyle=sk.belly;ell(c,0,R*.62,R*.78,R*.55);c.fill();}
  c.fillStyle='rgba(255,255,255,.18)';ell(c,-R*.38,-R*.52,R*.32,R*.2);c.fill();
  if(b.trait==='constellation'){const pts=[[-.55,-.45],[-.2,-.62],[.15,-.4],[.5,-.55],[.62,-.05],[.3,.2]];c.strokeStyle='rgba(255,233,166,.45)';c.lineWidth=R*.04;c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x*R,y*R):c.moveTo(x*R,y*R));c.stroke();
    c.fillStyle='#fff6d0';for(const[x,y]of pts){ell(c,x*R,y*R,R*.06,R*.06);c.fill();}}
  if(b.trait==='wood'){c.strokeStyle='rgba(70,38,16,.35)';c.lineWidth=R*.07;for(const k of[-.55,-.15,.25]){c.beginPath();c.moveTo(-R*1.1,R*k);c.bezierCurveTo(-R*.4,R*(k-.18),R*.3,R*(k+.18),R*1.1,R*(k-.05));c.stroke();}
    c.fillStyle='rgba(70,38,16,.35)';ell(c,R*.55,R*.45,R*.13,R*.09);c.fill();ell(c,-R*.6,-R*.6,R*.09,R*.06);c.fill();}
  if(b.trait==='ray'){c.fillStyle='rgba(255,255,255,.28)';for(const[x,y,r]of[[-.55,-.2,.09],[.6,-.3,.07],[.45,.1,.06],[-.4,.15,.05]]){ell(c,x*R,y*R,r*R,r*R);c.fill();}
    c.fillStyle=sk.accent;c.beginPath();c.moveTo(-R*.05,-R*.95);c.lineTo(R*.12,-R*.72);c.lineTo(-R*.02,-R*.7);c.lineTo(R*.1,-R*.5);c.lineTo(-R*.14,-R*.74);c.lineTo(0,-R*.76);c.closePath();c.fill();}
  if(b.trait==='strongman'&&sk.maid){c.fillStyle='#ffffff';c.beginPath();c.moveTo(-R*.62,R*.2);c.quadraticCurveTo(0,R*.32,R*.62,R*.2);c.lineTo(R*.7,R*1.1);c.lineTo(-R*.7,R*1.1);c.closePath();c.fill();c.strokeStyle='rgba(255,155,192,.9)';c.lineWidth=R*.06;for(let k=0;k<7;k++){c.beginPath();c.arc(-R*.6+k*R*.2,R*.95,R*.1,0,Math.PI);c.stroke();}c.fillStyle='#ffd1e3';rrect(c,-R*.2,R*.42,R*.4,R*.22,R*.06);c.fill();}
  else if(b.trait==='strongman'){c.fillStyle=sk.accent;c.beginPath();c.moveTo(-R*1.1,R*.18);c.quadraticCurveTo(0,R*.36,R*1.1,R*.18);c.lineTo(R*1.1,R*1.2);c.lineTo(-R*1.1,R*1.2);c.closePath();c.fill();
    c.fillStyle='rgba(255,255,255,.85)';for(const y of[.5,.78])c.fillRect(-R*1.1,R*y,R*2.2,R*.1);
    c.fillStyle=sk.accent;for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.62,-R*1.05);c.lineTo(s*R*.86,-R*1.05);c.lineTo(s*R*.82,R*.3);c.lineTo(s*R*.58,R*.3);c.closePath();c.fill();}}
  drawPatterns(c,sk,R);
  if(o.tint){c.fillStyle=o.tint;c.fillRect(-R*1.3,-R*1.3,R*2.6,R*2.6);}
  if(o.flash>0){c.fillStyle='rgba(255,255,255,'+(Math.min(1,o.flash)*.85)+')';c.fillRect(-R*1.3,-R*1.3,R*2.6,R*2.6);}
  c.restore();
  c.strokeStyle=OUT;c.lineWidth=lw;bodyPath(c,R,sk.boxy);c.stroke();
  if(b.trait==='rocks')drawRocks(c,sk,R,lw);
  if(b.trait==='scarf')drawScarf(c,sk,R,lw);
  if(b.trait==='goggles'){c.fillStyle='#2b2238';rrect(c,-R*.98,-R*.19,R*1.96,R*.17,R*.08);c.fill();}
  drawFace(c,sk,R,ax,ay,o,lw);
  if(sk.maid){c.fillStyle='#ffffff';c.strokeStyle=OUT;c.lineWidth=lw*.7;c.beginPath();c.moveTo(-R*.62,-R*.68);for(let k=0;k<=6;k++){const x2=-R*.62+k*R*.207;c.quadraticCurveTo(x2-R*.1,-R*1.02,x2,-R*.78);}c.lineTo(R*.62,-R*.62);c.quadraticCurveTo(0,-R*.82,-R*.62,-R*.68);c.fill();c.stroke();
    c.fillStyle='#ff9bc0';for(const sx of[-1,1]){c.beginPath();c.moveTo(R*.62,-R*.7);c.lineTo(R*.92,-R*.7+sx*R*.16);c.lineTo(R*.92,-R*.7-sx*R*.02);c.closePath();c.fill();c.stroke();}c.lineWidth=lw;}
  if(sk.troll==='clown'){const k=1+Math.sin(t*6)*.15;c.fillStyle='#ff3b5c';ell(c,0,R*.12,R*.15*k,R*.15*k);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.6)';ell(c,-R*.04,R*.07,R*.04,R*.03);c.fill();}
  if(sk.troll==='duck'){c.fillStyle='#ff9a3d';c.beginPath();c.ellipse(0,R*.28,R*.3,R*.12,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(-R*.28,R*.28);c.lineTo(R*.28,R*.28);c.stroke();}
  if(b.trait==='cat'){c.strokeStyle=OUT;c.lineWidth=lw*.45;for(const s of[-1,1])for(const k of[-.08,.08]){c.beginPath();c.moveTo(s*R*.45,R*(.18+k));c.lineTo(s*R*.95,R*(.12+k*2.2));c.stroke();}c.fillStyle=sk.accent;c.beginPath();c.moveTo(-R*.08,R*.1);c.lineTo(R*.08,R*.1);c.lineTo(0,R*.2);c.closePath();c.fill();c.lineWidth=lw;}
  if(b.trait==='trick'){c.fillStyle='rgba(255,255,255,.22)';for(const[x,y]of[[-.5,.35],[.45,.45],[0,.62]]){star(c,x*R,y*R,R*.12,R*.05,4);c.fill();}}
  if(b.trait==='strongman'){c.fillStyle='#2a1a12';for(const s of[-1,1]){c.beginPath();c.moveTo(0,R*.2);c.quadraticCurveTo(s*R*.3,R*.1,s*R*.52,R*.24);c.quadraticCurveTo(s*R*.66,R*.34,s*R*.62,R*.12);c.quadraticCurveTo(s*R*.42,R*.38,0,R*.32);c.closePath();c.fill();}}
  if(b.trait==='beaver')drawBeaverFront(c,sk,R,lw);
  if(b.trait==='goggles'){for(const s of[-1,1]){c.beginPath();c.arc(s*R*.34,-R*.1,R*.31,0,TAU);c.lineWidth=lw*.95;c.strokeStyle=sk.accent;c.stroke();c.lineWidth=lw*.4;c.strokeStyle=OUT;c.stroke();}}
  c.strokeStyle=OUT;c.lineWidth=lw;
  drawHat(c,sk,R,lw,t);
  if(b.trait==='cosmic')drawOrbit(c,sk,R,t,true);
  if(!behind)drawWeapon(c,b,sk,R,aim,lw,t);
  c.restore();
}

function drawPatterns(c,sk,R){
  if(sk.starry){for(const[px,py,s]of[[-.6,-.5,.13],[.52,-.62,.1],[.7,.08,.11],[-.74,.14,.08],[.16,-.84,.08],[-.25,-.22,.06],[.36,-.28,.05]]){star(c,px*R,py*R,s*R,s*R*.42,4);c.fillStyle='#fff3c4';c.fill();}}
  if(sk.stripes){c.fillStyle='rgba(20,45,12,.35)';for(const s of[-1,1])for(const y of[-.5,-.1,.3]){c.beginPath();c.moveTo(s*R*1.05,y*R);c.lineTo(s*R*.55,(y+.08)*R);c.lineTo(s*R*1.05,(y+.2)*R);c.closePath();c.fill();}}
  if(sk.scan){c.fillStyle='rgba(255,255,255,.16)';for(let y=-R;y<R;y+=R*.2)c.fillRect(-R*1.1,y,R*2.2,R*.07);}
  if(sk.cracks){c.save();c.strokeStyle=sk.accent;c.shadowColor=sk.accent;c.shadowBlur=R*.4;c.lineWidth=R*.08;
    for(const p of[[[-.75,-.25],[-.45,-.05],[-.55,.3]],[[.3,-.7],[.5,-.4],[.8,-.42]],[[.15,.45],[.4,.6],[.32,.95]]]){c.beginPath();p.forEach(([px,py],i)=>i?c.lineTo(px*R,py*R):c.moveTo(px*R,py*R));c.stroke();}c.restore();}
  if(sk.frost){c.fillStyle='rgba(255,255,255,.9)';for(const[px,py]of[[-.6,-.5],[.55,-.6],[.7,.1],[-.75,.15],[.2,-.8]]){ell(c,px*R,py*R,R*.06,R*.06);c.fill();}}
  if(sk.shine){c.fillStyle='rgba(255,255,255,.42)';c.beginPath();c.moveTo(-R*.95,-R*.15);c.lineTo(-R*.25,-R);c.lineTo(R*.02,-R*.92);c.lineTo(-R*.78,R*.08);c.closePath();c.fill();}
  if(sk.tape){c.fillStyle='rgba(240,214,160,.85)';c.fillRect(-R*1.1,R*.12,R*2.2,R*.22);c.fillStyle='rgba(93,64,38,.5)';c.fillRect(-R*1.1,R*.12,R*2.2,R*.03);c.fillRect(-R*1.1,R*.31,R*2.2,R*.03);}
  if(sk.sprinkles){const cols=['#ffffff','#6fe0d0','#ffd23f','#8c7cf5'];[[-.6,-.55,.4],[.5,-.65,-.6],[.75,0,1.1],[-.8,.05,-.3],[.15,-.85,.9],[-.3,-.75,-1.2]].forEach(([px,py,a],i)=>{c.save();c.translate(px*R,py*R);c.rotate(a);c.fillStyle=cols[i%4];c.fillRect(-R*.1,-R*.035,R*.2,R*.07);c.restore();});}
  if(sk.dots){c.fillStyle='#2a1c14';for(const[px,py]of[[-.35,.75],[-.05,.85],[.25,.78],[.5,.62],[-.6,.55],[.05,.6]]){ell(c,px*R,py*R,R*.09,R*.09);c.fill();}}
}

function drawFace(c,sk,R,ax,ay,o,lw){
  const ex=R*.34,ey=-R*.1,ew=R*.21,eh=R*.27;
  if(o.mood==='sleep'){c.strokeStyle=OUT;c.lineWidth=lw*.7;for(const s of[-1,1]){c.beginPath();c.arc(s*ex,ey,ew*.8,Math.PI*.1,Math.PI*.9);c.stroke();}c.fillStyle='#3a1630';ell(c,0,R*.34,R*.07,R*.08);c.fill();return;}
  for(const s of[-1,1]){
    c.fillStyle='#fff';ell(c,s*ex,ey,ew,eh);c.fill();c.lineWidth=lw*.55;c.strokeStyle=OUT;c.stroke();
    if(o.mood==='laugh'){c.fillStyle=sk.belly;ell(c,s*ex,ey,ew*1.02,eh*1.02);c.fill();c.beginPath();c.arc(s*ex,ey+eh*.2,ew*.6,Math.PI*1.1,Math.PI*1.9);c.stroke();continue;}
    if(o.ko){c.beginPath();c.moveTo(s*ex-ew*.5,ey-eh*.4);c.lineTo(s*ex+ew*.5,ey+eh*.4);c.moveTo(s*ex+ew*.5,ey-eh*.4);c.lineTo(s*ex-ew*.5,ey+eh*.4);c.stroke();continue;}
    const px=s*ex+ax*ew*.38,py=ey+ay*eh*.32;
    c.fillStyle=sk.eye||'#1a1430';ell(c,px,py,ew*.56,eh*.56);c.fill();
    c.fillStyle='rgba(255,255,255,.9)';ell(c,px-ew*.18,py-eh*.22,ew*.16,eh*.14);c.fill();
  }
  c.strokeStyle=OUT;c.lineWidth=lw*.6;
  if(o.mood==='angry'||o.mood==='sad'){const a=o.mood==='angry'?1:-1;c.lineWidth=lw*.7;for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.55,ey-eh*1.15-a*R*.08);c.lineTo(s*R*.14,ey-eh*1.15+a*R*.1);c.stroke();}c.lineWidth=lw*.6;}
  if(o.mood==='wow'){ell(c,0,R*.36,R*.11,R*.14);c.fillStyle='#3a1630';c.fill();c.stroke();return;}
  if(o.mood==='laugh'){c.beginPath();c.arc(0,R*.14,R*.24,Math.PI*.05,Math.PI*.95);c.closePath();c.fillStyle='#3a1630';c.fill();c.stroke();return;}
  if(o.mood==='angry'){c.beginPath();c.moveTo(-R*.18,R*.36);c.quadraticCurveTo(0,R*.26,R*.18,R*.36);c.stroke();return;}
  if(o.mood==='sad'){c.beginPath();c.arc(0,R*.46,R*.15,Math.PI*1.15,Math.PI*1.85);c.stroke();c.fillStyle='#7fd3ff';ell(c,R*.36,R*.14,R*.06,R*.1);c.fill();return;}
  if(sk.grin){c.beginPath();c.moveTo(-R*.38,R*.2);c.lineTo(-R*.2,R*.3);c.lineTo(-R*.08,R*.22);c.lineTo(R*.06,R*.32);c.lineTo(R*.2,R*.22);c.lineTo(R*.38,R*.2);c.quadraticCurveTo(0,R*.6,-R*.38,R*.2);c.closePath();c.fillStyle='#3a1606';c.fill();c.lineWidth=lw*.5;c.stroke();}
  else if(o.hurt||o.ko){c.beginPath();c.arc(0,R*.44,R*.14,Math.PI*1.15,Math.PI*1.85);c.stroke();}
  else if(o.happy){c.beginPath();c.arc(0,R*.16,R*.2,Math.PI*.1,Math.PI*.9);c.closePath();c.fillStyle='#3a1630';c.fill();c.stroke();}
  else{c.beginPath();c.arc(0,R*.2,R*.15,Math.PI*.15,Math.PI*.85);c.stroke();}
}

function drawWeapon(c,b,sk,R,aim,lw,t){
  c.save();c.rotate(aim);c.translate(R*.78,0);c.lineWidth=lw*.8;c.strokeStyle=OUT;
  switch(b.weapon||b.id){
    case 'ember':rrect(c,-R*.15,-R*.2,R*.62,R*.4,R*.12);c.fillStyle=sk.accent;c.fill();c.stroke();rrect(c,R*.4,-R*.13,R*.22,R*.26,R*.06);c.fillStyle='#3a3350';c.fill();c.stroke();break;
    case 'bolt':rrect(c,-R*.15,-R*.13,R,R*.26,R*.08);c.fillStyle='#3a3350';c.fill();c.stroke();c.fillStyle=sk.accent;c.fillRect(R*.1,-R*.05,R*.45,R*.1);break;
    case 'boulder':ell(c,R*.18,0,R*.34,R*.3);c.fillStyle=sk.body;c.fill();c.fillStyle='rgba(0,0,0,.18)';c.fill();c.stroke();break;
    case 'spritz':c.beginPath();c.moveTo(-R*.1,0);c.lineTo(R*.45,0);c.lineWidth=lw;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.45;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.8;ell(c,R*.66,0,R*.22,R*.22);c.fillStyle='rgba(255,255,255,.35)';c.fill();c.stroke();break;
    case 'vex':c.beginPath();c.moveTo(R*.05,-R*.14);c.lineTo(R*.85,0);c.lineTo(R*.05,R*.14);c.closePath();c.fillStyle='#e9ebf8';c.fill();c.stroke();rrect(c,-R*.18,-R*.1,R*.26,R*.2,R*.05);c.fillStyle=sk.accent;c.fill();c.stroke();break;
    case 'pip':ell(c,R*.2,0,R*.3,R*.3);c.fillStyle='#2c2340';c.fill();c.stroke();c.beginPath();c.moveTo(R*.36,-R*.22);c.quadraticCurveTo(R*.6,-R*.45,R*.5,-R*.55);c.lineWidth=lw*.5;c.stroke();c.fillStyle=sk.accent;ell(c,R*.5,-R*.58,R*.1,R*.1);c.fill();break;
    case 'nix':c.beginPath();c.moveTo(-R*.1,0);c.lineTo(R*.45,0);c.lineWidth=lw*1.1;c.stroke();c.strokeStyle='#8a6a4a';c.lineWidth=lw*.5;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.8;
      c.beginPath();c.moveTo(R*.42,0);c.lineTo(R*.62,-R*.2);c.lineTo(R*.92,0);c.lineTo(R*.62,R*.2);c.closePath();c.fillStyle=sk.proj;c.fill();c.stroke();break;
    case 'zing':c.beginPath();c.moveTo(-R*.05,-R*.38);c.quadraticCurveTo(R*.5,-R*.1,R*.62,0);c.quadraticCurveTo(R*.5,R*.1,-R*.05,R*.38);c.lineTo(R*.12,R*.34);c.quadraticCurveTo(R*.4,R*.05,R*.4,0);c.quadraticCurveTo(R*.4,-R*.05,R*.12,-R*.34);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();break;
    case 'marlo':c.beginPath();c.moveTo(-R*.2,0);c.lineTo(R*.7,0);c.lineWidth=lw*1.1;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.5;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.75;
      c.beginPath();c.moveTo(R*.62,-R*.26);c.lineTo(R*.62,R*.26);c.moveTo(R*.62,-R*.26);c.lineTo(R*.9,-R*.26);c.moveTo(R*.62,R*.26);c.lineTo(R*.9,R*.26);c.moveTo(R*.62,0);c.lineTo(R*.98,0);c.stroke();break;
    case 'volta':rrect(c,-R*.1,-R*.08,R*.7,R*.16,R*.06);c.fillStyle='#3a3350';c.fill();c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.5;for(const x of[.15,.3,.45]){c.beginPath();c.ellipse(R*x,0,R*.05,R*.16,0,0,TAU);c.stroke();}
      c.strokeStyle=OUT;c.lineWidth=lw*.8;ell(c,R*.7,0,R*.15,R*.15);c.fillStyle=sk.accent;c.fill();c.stroke();if(t!=null){c.save();c.globalCompositeOperation='lighter';glow(c,R*.7,0,R*.45,sk.proj,.6+.3*Math.sin(t*20));c.restore();}break;
    case 'bramble':c.beginPath();c.moveTo(-R*.1,0);c.bezierCurveTo(R*.2,-R*.3,R*.4,R*.3,R*.7,-R*.05);c.lineWidth=lw*1.3;c.stroke();c.strokeStyle='#4f9a3b';c.lineWidth=lw*.7;c.stroke();c.fillStyle=sk.accent;c.strokeStyle=OUT;c.lineWidth=lw*.5;ell(c,R*.74,-R*.06,R*.12,R*.12);c.fill();c.stroke();break;
    case 'rook':rrect(c,-R*.15,-R*.2,R*.6,R*.4,R*.08);c.fillStyle=sk.accent;c.fill();c.stroke();rrect(c,R*.4,-R*.09,R*.42,R*.18,R*.05);c.fillStyle='#3a3350';c.fill();c.stroke();c.fillStyle='#ffd23f';c.fillRect(-R*.05,-R*.06,R*.3,R*.12);break;
    case 'zenith':{c.save();c.globalCompositeOperation='lighter';glow(c,R*.3,0,R*.75,sk.proj,.7);c.restore();c.strokeStyle=sk.accent;c.lineWidth=lw*.5;for(let i=0;i<8;i++){const a=i/8*TAU+(t||0)*1.5;c.beginPath();c.moveTo(R*.3+Math.cos(a)*R*.24,Math.sin(a)*R*.24);c.lineTo(R*.3+Math.cos(a)*R*.38,Math.sin(a)*R*.38);c.stroke();}
      c.strokeStyle=OUT;c.lineWidth=lw*.7;ell(c,R*.3,0,R*.2,R*.2);c.fillStyle=sk.proj;c.fill();c.stroke();break;}
    case 'orion':c.beginPath();c.moveTo(-R*.1,0);c.lineTo(R*.7,0);c.lineWidth=lw*1.1;c.stroke();c.strokeStyle='#c9b5ff';c.lineWidth=lw*.5;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.7;
      c.save();c.globalCompositeOperation='lighter';glow(c,R*.82,0,R*.55,sk.proj,.75);c.restore();star(c,R*.82,0,R*.26,R*.11,5);c.fillStyle=sk.proj;c.fill();c.stroke();break;
    case 'perk':for(const dy of[-.18,.18]){ell(c,R*.32,dy*R,R*.2,R*.18);c.fillStyle=sk.body;c.fill();c.stroke();c.fillStyle=sk.accent;ell(c,R*.38,dy*R,R*.07,R*.07);c.fill();}break;
    case 'trick':c.rotate(-.3);rrect(c,-R*.05,-R*.06,R*.7,R*.12,R*.06);c.fillStyle='#1f1a2e';c.fill();c.stroke();rrect(c,R*.5,-R*.07,R*.2,R*.14,R*.05);c.fillStyle='#fff';c.fill();c.stroke();c.fillStyle=sk.accent;star(c,R*.85,0,R*.16,R*.07,5);c.fill();break;
    case 'edray':c.beginPath();c.moveTo(-R*.1,0);for(let k=0;k<5;k++)c.lineTo(k*R*.1,(k%2?1:-1)*R*.14);c.lineTo(R*.45,0);c.stroke();ell(c,R*.62,0,R*.26,R*.24);c.fillStyle=sk.accent;c.fill();c.stroke();break;
    case 'juggler':rrect(c,-R*.22,-R*.25,R*.26,R*.5,R*.08);c.fillStyle='#f4f1e6';c.fill();c.stroke();ell(c,R*.34,0,R*.42,R*.38);c.fillStyle='#e8433a';c.fill();c.stroke();ell(c,R*.2,-R*.32,R*.17,R*.12);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';ell(c,R*.36,-R*.14,R*.15,R*.08);c.fill();break;
    case 'lilt':c.save();c.rotate(-.5);rrect(c,-R*.25,-R*.11,R*1.5,R*.22,R*.11);c.fillStyle='#8a5a2e';c.fill();c.stroke();
      c.beginPath();c.moveTo(R*.4,-R*.11);c.quadraticCurveTo(R*.9,-R*.26,R*1.45,-R*.2);c.quadraticCurveTo(R*1.62,0,R*1.45,R*.2);c.quadraticCurveTo(R*.9,R*.26,R*.4,R*.11);c.closePath();c.fillStyle='#c98f55';c.fill();c.stroke();
      c.fillStyle='#ff4d6d';c.fillRect(-R*.2,-R*.1,R*.36,R*.2);c.strokeStyle='rgba(18,15,38,.5)';c.lineWidth=lw*.35;for(const x of[-.12,0,.12]){c.beginPath();c.moveTo(R*x,-R*.1);c.lineTo(R*(x+.06),R*.1);c.stroke();}c.restore();break;
    case 'woodrow':c.save();c.rotate(Math.PI/2);rrect(c,-R*.22,-R*.55,R*.44,R*1.1,R*.2);c.fillStyle='#a0673f';c.fill();c.stroke();c.fillStyle='#e8c79a';ell(c,0,-R*.55,R*.2,R*.1);c.fill();c.lineWidth=lw*.5;c.stroke();
      c.strokeStyle='rgba(60,30,15,.6)';c.beginPath();c.moveTo(-R*.12,-R*.2);c.lineTo(-R*.12,R*.3);c.moveTo(R*.1,-R*.1);c.lineTo(R*.1,R*.4);c.stroke();c.restore();break;
    case 'sling':c.beginPath();c.moveTo(-R*.1,0);c.lineTo(R*.35,0);c.moveTo(R*.35,0);c.lineTo(R*.65,-R*.28);c.moveTo(R*.35,0);c.lineTo(R*.65,R*.28);c.lineWidth=lw*1.2;c.stroke();c.strokeStyle='#8a5a3b';c.lineWidth=lw*.6;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.4;c.beginPath();c.moveTo(R*.65,-R*.28);c.quadraticCurveTo(R*.4,0,R*.65,R*.28);c.stroke();break;
    case 'coconut':ell(c,R*.22,0,R*.3,R*.28);c.fillStyle='#6b4226';c.fill();c.stroke();c.fillStyle='#3a2416';ell(c,R*.14,-R*.06,R*.05,R*.05);c.fill();ell(c,R*.28,-R*.06,R*.05,R*.05);c.fill();ell(c,R*.21,R*.08,R*.05,R*.05);c.fill();break;
    case 'wrench':c.beginPath();c.moveTo(-R*.15,0);c.lineTo(R*.6,0);c.lineWidth=lw*1.5;c.stroke();c.strokeStyle='#c7cedb';c.lineWidth=lw*.9;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.8;c.beginPath();c.arc(R*.72,0,R*.22,Math.PI*.3,Math.PI*1.7);c.fillStyle='#c7cedb';c.fill();c.stroke();c.fillStyle=sk.accent;c.fillRect(-R*.1,-R*.06,R*.3,R*.12);break;
    case 'moon':c.beginPath();c.arc(R*.25,0,R*.36,Math.PI*.35,Math.PI*1.65);c.arc(R*.38,0,R*.26,Math.PI*1.55,Math.PI*.45,true);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();if(t!=null){c.save();c.globalCompositeOperation='lighter';glow(c,R*.25,0,R*.6,sk.proj,.35);c.restore();}break;
    case 'quill':for(const a of[-.35,0,.35]){c.save();c.rotate(a);c.beginPath();c.moveTo(0,-R*.05);c.lineTo(R*.6,0);c.lineTo(0,R*.05);c.closePath();c.fillStyle=sk.proj;c.fill();c.lineWidth=lw*.45;c.stroke();c.restore();}break;
    case 'claw':for(const y of[-.16,0,.16]){c.beginPath();c.moveTo(0,R*y);c.quadraticCurveTo(R*.35,R*(y-.12),R*.55,R*y);c.lineWidth=lw*.9;c.stroke();c.strokeStyle='#f2f4fa';c.lineWidth=lw*.45;c.stroke();c.strokeStyle=OUT;}ell(c,-R*.02,0,R*.18,R*.22);c.fillStyle=sk.body;c.fill();c.lineWidth=lw*.7;c.stroke();break;
    case 'laser':rrect(c,-R*.15,-R*.16,R*.75,R*.32,R*.1);c.fillStyle='#e9edf6';c.fill();c.stroke();rrect(c,R*.55,-R*.07,R*.3,R*.14,R*.05);c.fillStyle=sk.accent;c.fill();c.stroke();if(t!=null){c.save();c.globalCompositeOperation='lighter';glow(c,R*.85,0,R*.35,sk.proj,.5);c.restore();}break;
    case 'echo':rrect(c,-R*.12,-R*.26,R*.62,R*.52,R*.12);c.fillStyle=sk.accent;c.fill();c.stroke();c.fillStyle='#3a3350';ell(c,R*.22,0,R*.17,R*.17);c.fill();c.fillStyle=sk.proj;ell(c,R*.22,0,R*.07,R*.07);c.fill();break;
  }
  c.restore();
}
function drawEars(c,sk,R,lw){for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.25,-R*.8);c.lineTo(s*R*.85,-R*1.3);c.lineTo(s*R*.8,-R*.45);c.closePath();c.fillStyle=sk.body;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();c.beginPath();c.moveTo(s*R*.42,-R*.78);c.lineTo(s*R*.76,-R*1.08);c.lineTo(s*R*.72,-R*.6);c.closePath();c.fillStyle=sk.accent;c.fill();}}
function drawTank(c,sk,R,lw,t){rrect(c,-R*1.25,-R*.55,R*.55,R*1.05,R*.25);c.fillStyle=sk.proj;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();c.fillStyle='rgba(255,255,255,.75)';ell(c,-R*1.0,-R*.2+Math.sin(t*3)*R*.1,R*.08,R*.08);c.fill();ell(c,-R*.92,R*.22,R*.06,R*.06);c.fill();}
function drawRocks(c,sk,R,lw){for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.55,-R*.85);c.lineTo(s*R*.95,-R*.98);c.lineTo(s*R*1.15,-R*.55);c.lineTo(s*R*.85,-R*.35);c.closePath();c.fillStyle=sk.body;c.fill();c.fillStyle='rgba(0,0,0,.2)';c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();}}
function drawScarf(c,sk,R,lw){c.beginPath();c.moveTo(-R*.92,R*.12);c.quadraticCurveTo(0,R*.46,R*.92,R*.12);c.lineTo(R*.86,R*.36);c.quadraticCurveTo(0,R*.7,-R*.86,R*.36);c.closePath();c.fillStyle=sk.accent;c.fill();c.lineWidth=lw*.8;c.strokeStyle=OUT;c.stroke();
  rrect(c,R*.45,R*.38,R*.24,R*.5,R*.08);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-R*.5,R*.36,R*.2,R*.08);c.fillRect(R*.1,R*.4,R*.2,R*.08);}

function drawHat(c,sk,R,lw,t){
  const h=sk.hat;if(!h||h==='none')return;
  c.lineWidth=lw;c.strokeStyle=OUT;
  switch(h){
  case 'flame':{const f=(x,y,s,ph)=>{const k=1+Math.sin(t*12+ph)*.1;c.beginPath();c.moveTo(x-s*.55,y);c.quadraticCurveTo(x-s*.6,y-s*.9*k,x,y-s*1.6*k);c.quadraticCurveTo(x+s*.6,y-s*.9*k,x+s*.55,y);c.closePath();};
    c.fillStyle=sk.accent;f(-R*.32,-R*.78,R*.28,1);c.fill();c.stroke();f(R*.32,-R*.78,R*.28,2);c.fill();c.stroke();f(0,-R*.82,R*.4,0);c.fill();c.stroke();f(0,-R*.86,R*.2,0);c.fillStyle='#fff6d0';c.fill();break;}
  case 'propeller':{c.beginPath();c.arc(0,-R*.78,R*.42,Math.PI,0);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();c.beginPath();c.moveTo(0,-R*1.2);c.lineTo(0,-R*1.42);c.stroke();const w=Math.abs(Math.cos(t*18))*R*.62;ell(c,0,-R*1.45,w+R*.05,R*.11);c.fillStyle='#fff';c.fill();c.stroke();break;}
  case 'visor':{c.save();c.shadowColor=sk.accent;c.shadowBlur=R*.6;c.globalAlpha*=.85;rrect(c,-R*.82,-R*.36,R*1.64,R*.46,R*.2);c.fillStyle=sk.accent;c.fill();c.restore();rrect(c,-R*.82,-R*.36,R*1.64,R*.46,R*.2);c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-R*.6,-R*.28,R*.5,R*.07);break;}
  case 'horns':for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.25,-R*.82);c.quadraticCurveTo(s*R*.7,-R,s*R*.78,-R*1.45);c.quadraticCurveTo(s*R*.95,-R*.95,s*R*.62,-R*.62);c.closePath();c.fillStyle='#2a1712';c.fill();c.stroke();}break;
  case 'icecrown':{const p=[[-.62,-.72],[-.5,-1.25],[-.3,-.86],[-.12,-1.42],[.06,-.88],[.26,-1.3],[.42,-.86],[.6,-1.18],[.66,-.7]];c.beginPath();p.forEach(([px,py],i)=>i?c.lineTo(px*R,py*R):c.moveTo(px*R,py*R));c.quadraticCurveTo(0,-R*.6,-.62*R,-.72*R);c.closePath();c.fillStyle='#e8f7ff';c.fill();c.stroke();break;}
  case 'crown':c.beginPath();c.moveTo(-R*.55,-R*.72);c.lineTo(-R*.6,-R*1.3);c.lineTo(-R*.25,-R);c.lineTo(0,-R*1.42);c.lineTo(R*.25,-R);c.lineTo(R*.6,-R*1.3);c.lineTo(R*.55,-R*.72);c.closePath();c.fillStyle='#ffd23f';c.fill();c.stroke();c.fillStyle='#ff4d6d';ell(c,0,-R*.9,R*.1,R*.1);c.fill();c.lineWidth=lw*.5;c.stroke();break;
  case 'antenna':c.beginPath();c.moveTo(0,-R*.95);c.lineTo(R*.22,-R*1.45);c.stroke();c.fillStyle=sk.accent;ell(c,R*.24,-R*1.5,R*.14,R*.14);c.fill();c.stroke();break;
  case 'hood':c.beginPath();c.moveTo(-R*1.06,0);c.quadraticCurveTo(-R*1.15,-R*1.35,0,-R*1.38);c.quadraticCurveTo(R*1.15,-R*1.35,R*1.06,0);c.quadraticCurveTo(R*.75,-R*.72,0,-R*.74);c.quadraticCurveTo(-R*.75,-R*.72,-R*1.06,0);c.closePath();c.fillStyle='#17131f';c.fill();c.stroke();c.beginPath();c.moveTo(-R*.92,-R*.12);c.quadraticCurveTo(-R*.68,-R*.66,0,-R*.7);c.quadraticCurveTo(R*.68,-R*.66,R*.92,-R*.12);c.strokeStyle=sk.accent;c.lineWidth=lw*.55;c.stroke();break;
  case 'swirl':{c.beginPath();c.moveTo(R*.3,-R*.82);c.lineTo(R*.48,-R*1.25);c.lineWidth=lw*1.4;c.stroke();c.lineWidth=lw*.7;c.strokeStyle='#fff';c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;ell(c,R*.52,-R*1.45,R*.3,R*.3);c.fillStyle=sk.accent;c.fill();c.stroke();c.beginPath();for(let a=0;a<TAU*1.6;a+=.3){const r=R*.04+a*R*.026;c.lineTo(R*.52+Math.cos(a)*r,-R*1.45+Math.sin(a)*r);}c.strokeStyle='#fff';c.lineWidth=lw*.5;c.stroke();break;}
  case 'helmet':c.beginPath();c.arc(0,-R*.05,R*1.28,0,TAU);c.fillStyle='rgba(200,230,255,.16)';c.fill();c.lineWidth=lw*.8;c.strokeStyle='rgba(255,255,255,.75)';c.stroke();c.beginPath();c.arc(0,-R*.05,R*1.05,Math.PI*1.15,Math.PI*1.45);c.lineWidth=lw*.6;c.stroke();c.fillStyle=sk.accent;ell(c,R*.9,-R*1.05,R*.13,R*.13);c.fill();c.strokeStyle=OUT;c.lineWidth=lw*.5;c.stroke();break;
  case 'leaf':c.save();c.translate(R*.1,-R*1.05);c.rotate(-.5);ell(c,0,0,R*.22,R*.45);c.fillStyle='#3fae58';c.fill();c.stroke();c.beginPath();c.moveTo(0,R*.4);c.lineTo(0,-R*.3);c.lineWidth=lw*.5;c.stroke();c.restore();break;
  case 'dragon':for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.22,-R*.88);c.lineTo(s*R*.45,-R*1.38);c.lineTo(s*R*.6,-R*.78);c.closePath();c.fillStyle='#fff2c6';c.fill();c.stroke();}c.beginPath();c.moveTo(-R*.18,-R*.95);c.lineTo(0,-R*1.22);c.lineTo(R*.18,-R*.95);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();break;
  case 'tricorn':c.beginPath();c.moveTo(-R*1.05,-R*.7);c.quadraticCurveTo(0,-R*.95,R*1.05,-R*.7);c.quadraticCurveTo(R*.6,-R*1.45,0,-R*1.25);c.quadraticCurveTo(-R*.6,-R*1.45,-R*1.05,-R*.7);c.closePath();c.fillStyle='#2b2238';c.fill();c.stroke();c.beginPath();c.moveTo(-R*.8,-R*.78);c.quadraticCurveTo(0,-R,R*.8,-R*.78);c.strokeStyle=sk.accent;c.lineWidth=lw*.6;c.stroke();c.fillStyle='#fff';ell(c,0,-R*1.08,R*.09,R*.08);c.fill();break;
  case 'moss':{c.fillStyle='#5aa543';for(const[px,py,r]of[[-.48,-.82,.26],[-.12,-.98,.3],[.28,-.9,.28],[.6,-.7,.2]]){ell(c,px*R,py*R,r*R,r*R*.85);c.fill();c.stroke();}c.fillStyle='#ff8fc7';ell(c,R*.28,-R*1.12,R*.1,R*.1);c.fill();c.lineWidth=lw*.5;c.stroke();break;}
  case 'straw':c.beginPath();c.moveTo(-R*.75,-R*.66);c.quadraticCurveTo(0,-R*.95,R*.75,-R*.66);c.lineWidth=lw*.9;c.stroke();rrect(c,R*.05,-R*1.62,R*.24,R*.9,R*.08);c.fillStyle='#ff6f91';c.fill();c.lineWidth=lw;c.stroke();c.fillStyle='rgba(255,255,255,.75)';c.fillRect(R*.09,-R*1.45,R*.16,R*.1);c.fillRect(R*.09,-R*1.2,R*.16,R*.1);break;
  case 'antennae':for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.22,-R*.85);c.quadraticCurveTo(s*R*.3,-R*1.4,s*R*.7,-R*1.45);c.lineWidth=lw*.8;c.strokeStyle=OUT;c.stroke();c.fillStyle=sk.accent;ell(c,s*R*.72,-R*1.45,R*.12,R*.12);c.fill();c.lineWidth=lw*.5;c.stroke();}break;
  case 'fuse':{c.beginPath();c.moveTo(0,-R*.92);c.quadraticCurveTo(R*.3,-R*1.2,R*.08,-R*1.45);c.lineWidth=lw*.8;c.stroke();const fs=R*(.2+.06*Math.sin(t*30));star(c,R*.08,-R*1.5,fs,fs*.45,6);c.fillStyle='#ffd23f';c.fill();c.fillStyle='#fff';ell(c,R*.08,-R*1.5,fs*.3,fs*.3);c.fill();break;}
  case 'stem':rrect(c,-R*.1,-R*1.32,R*.22,R*.55,R*.07);c.fillStyle='#6b4a2b';c.fill();c.stroke();c.save();c.translate(R*.32,-R*1.1);c.rotate(.5);ell(c,0,0,R*.26,R*.13);c.fillStyle=sk.accent;c.fill();c.lineWidth=lw*.8;c.stroke();c.restore();break;
  case 'pixel':{const s=R*.22,y0=-R*.8-s;c.fillStyle=sk.accent;c.lineWidth=lw*.6;const cells=[];for(let i=0;i<6;i++)cells.push([i,0]);cells.push([0,-1],[0,-2],[2,-1],[3,-1],[5,-1],[5,-2]);for(const[i,j]of cells){const x=(i-3)*s;c.fillRect(x,y0+j*s,s,s);c.strokeRect(x,y0+j*s,s,s);}break;}
  case 'beanie':c.beginPath();c.arc(0,-R*.5,R*.82,Math.PI*1.02,Math.PI*1.98);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();rrect(c,-R*.88,-R*.66,R*1.76,R*.26,R*.12);c.fillStyle='#ffffff';c.fill();c.stroke();ell(c,0,-R*1.38,R*.18,R*.18);c.fill();c.stroke();break;
  case 'bandana':c.beginPath();c.moveTo(-R*.98,-R*.36);c.quadraticCurveTo(0,-R*.82,R*.98,-R*.36);c.lineTo(R*.92,-R*.12);c.quadraticCurveTo(0,-R*.56,-R*.92,-R*.12);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();
    c.beginPath();c.moveTo(R*.9,-R*.28);c.lineTo(R*1.3,-R*.5);c.lineTo(R*1.22,-R*.2);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';ell(c,-R*.3,-R*.46,R*.05,R*.05);c.fill();ell(c,R*.25,-R*.48,R*.05,R*.05);c.fill();break;
  case 'snorkel':rrect(c,-R*.74,-R*.44,R*1.48,R*.64,R*.26);c.fillStyle='rgba(190,240,255,.38)';c.fill();c.lineWidth=lw*.9;c.strokeStyle=sk.accent;c.stroke();c.lineWidth=lw*.4;c.strokeStyle=OUT;c.stroke();
    c.beginPath();c.moveTo(R*.78,-R*.05);c.quadraticCurveTo(R*1.0,-R*.3,R*.92,-R*1.2);c.lineWidth=lw*1.5;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.8;c.stroke();break;
  case 'spikes':{c.beginPath();const p=[[-.72,-.62],[-.7,-1.2],[-.42,-.95],[-.25,-1.5],[0,-1.0],[.22,-1.45],[.4,-.95],[.72,-1.25],[.72,-.62]];p.forEach(([px,py],i)=>i?c.lineTo(px*R,py*R):c.moveTo(px*R,py*R));c.quadraticCurveTo(0,-R*.8,-.72*R,-.62*R);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();break;}
  case 'flower':{c.save();c.translate(R*.42,-R*.88);for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5+t*.5);ell(c,0,-R*.22,R*.15,R*.22);c.fillStyle=sk.accent;c.fill();c.lineWidth=lw*.6;c.stroke();c.restore();}ell(c,0,0,R*.13,R*.13);c.fillStyle='#ffd23f';c.fill();c.stroke();c.restore();break;}
  case 'hardhat':c.beginPath();c.arc(0,-R*.5,R*.78,Math.PI,0);c.closePath();c.fillStyle='#ffd23f';c.fill();c.stroke();rrect(c,-R*1.0,-R*.58,R*2.0,R*.18,R*.08);c.fill();c.stroke();rrect(c,-R*.1,-R*1.25,R*.2,R*.66,R*.06);c.fillStyle='#f0b429';c.fill();c.lineWidth=lw*.5;c.stroke();break;
  case 'starcrest':{c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*1.15,R*.85,sk.accent,.55);c.restore();c.save();c.translate(0,-R*1.08);c.rotate(Math.sin((t||0)*2)*.12);star(c,0,0,R*.5,R*.22,5);c.fillStyle=sk.accent;c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.6)';star(c,-R*.05,-R*.06,R*.2,R*.09,5);c.fill();c.restore();break;}
  case 'sprout':c.beginPath();c.moveTo(0,-R*.9);c.quadraticCurveTo(R*.05,-R*1.15,-R*.05,-R*1.3);c.lineWidth=lw*.9;c.strokeStyle='#5a3a1e';c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.8;
    for(const sx of[-1,1]){c.save();c.translate(-R*.04,-R*1.22);c.rotate(sx*.9);ell(c,sx*R*.2,0,R*.22,R*.11);c.fillStyle=sk.accent;c.fill();c.stroke();c.restore();}break;
  case 'cap':c.beginPath();c.arc(0,-R*.52,R*.78,Math.PI,0);c.closePath();c.fillStyle=sk.accent;c.fill();c.stroke();c.beginPath();c.moveTo(R*.2,-R*.6);c.quadraticCurveTo(R*1.1,-R*.68,R*1.2,-R*.48);c.lineTo(R*.3,-R*.46);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';ell(c,0,-R*1.28,R*.08,R*.06);c.fill();break;
  case 'monkey':for(const s of[-1,1]){ell(c,s*R*.98,-R*.12,R*.3,R*.3);c.fillStyle=sk.body;c.fill();c.stroke();ell(c,s*R*.98,-R*.12,R*.16,R*.16);c.fillStyle=sk.belly;c.fill();}c.beginPath();c.moveTo(-R*.15,-R*.95);c.quadraticCurveTo(0,-R*1.35,R*.2,-R*1.1);c.lineWidth=lw*.8;c.stroke();break;
  case 'witch':c.beginPath();c.moveTo(-R*1.05,-R*.62);c.quadraticCurveTo(0,-R*.82,R*1.05,-R*.62);c.lineTo(R*.5,-R*.8);c.quadraticCurveTo(R*.3,-R*1.5,R*.75,-R*1.85);c.quadraticCurveTo(-R*.2,-R*1.6,-R*.5,-R*.8);c.closePath();c.fillStyle='#2a2150';c.fill();c.stroke();c.fillStyle=sk.accent;star(c,R*.05,-R*1.0,R*.16,R*.07,5);c.fill();break;
  case 'quills':for(let i=0;i<7;i++){const a=Math.PI*(1.1+i*.13);c.save();c.rotate(a+Math.PI/2);c.beginPath();c.moveTo(-R*.12,-R*.7);c.lineTo(0,-R*1.42);c.lineTo(R*.12,-R*.7);c.closePath();c.fillStyle=i%2?sk.proj:sk.accent;c.fill();c.lineWidth=lw*.6;c.stroke();c.restore();}break;
  case 'halo':{c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*1.3,R*.9,sk.accent,.5);c.restore();c.beginPath();c.ellipse(0,-R*1.3,R*.6,R*.18,0,0,TAU);c.lineWidth=lw*1.4;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.8;c.stroke();break;}
  case 'headphones':c.beginPath();c.arc(0,-R*.15,R*1.05,Math.PI*1.08,Math.PI*1.92);c.lineWidth=lw*1.6;c.stroke();c.strokeStyle=sk.accent;c.lineWidth=lw*.8;c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;
    for(const s of[-1,1]){rrect(c,s*R*1.0-R*.2,-R*.42,R*.4,R*.56,R*.16);c.fillStyle=sk.accent;c.fill();c.stroke();c.fillStyle=sk.proj;ell(c,s*R*1.0,-R*.14,R*.09,R*.15);c.fill();}break;
  }
}

function iconCanvas(id,size){if(/^k:\d$/.test(id||'')){const t=+id[2],el=document.createElement('span');el.className='icon-emb';el.style.width=el.style.height=size+'px';el.innerHTML=emblem(t>=7?RANK_STEPS-1:t*3,Math.round(size*.92),true);return el;}
  const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=Math.round(size*d);cv.style.width=cv.style.height=size+'px';cv.setAttribute('aria-hidden','true');const c=cv.getContext('2d');c.scale(d,d);drawProfileIcon(c,id||'r:ember',size);return cv;}
function drawProfileIcon(c,id,s){const p=String(id).split(':'),R=s*.18;let col='#3a3380',col2='#1b1546';
  if(p[0]==='t'){col='#ffb000';col2='#c4366f';}else if(p[0]==='x'){const sp=SPECIAL_ICONS.find(x=>x[0]===p[1]);col=sp?sp[2]:'#9d7bff';col2='#1b1546';}else if(p[0]==='s'){col='#9d7bff';col2='#2a1458';}else{const b=BY_ID[p[1]];if(b)col=RARITY[b.rarity].col;}
  const g=c.createLinearGradient(0,0,s,s);g.addColorStop(0,col);g.addColorStop(1,col2);rrect(c,s*.04,s*.04,s*.92,s*.92,R);c.fillStyle=g;c.fill();c.lineWidth=Math.max(2,s*.05);c.strokeStyle=OUT;c.stroke();
  c.save();rrect(c,s*.04,s*.04,s*.92,s*.92,R);c.clip();c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(s*.3,s*.18,s*.4,s*.16,-.4,0,TAU);c.fill();
  if(p[0]==='r'||p[0]==='s'){const b=BY_ID[p[1]]||BY_ID[STARTER];drawFighter(c,s/2,s*.62,s*.36,b,getSkin(b,p[0]==='s'?p[2]:'classic'),Math.PI/2,0,{still:true,noShadow:true,happy:true});}
  else if(p[0]==='t'){c.fillStyle='#fff6c2';c.strokeStyle=OUT;c.lineWidth=Math.max(1.5,s*.035);c.beginPath();c.moveTo(s*.3,s*.2);c.lineTo(s*.7,s*.2);c.lineTo(s*.66,s*.46);c.quadraticCurveTo(s*.5,s*.6,s*.34,s*.46);c.closePath();c.fill();c.stroke();c.fillRect(s*.45,s*.52,s*.1,s*.1);c.strokeRect(s*.45,s*.52,s*.1,s*.1);
    c.fillStyle='#120f26';c.font='900 '+(s*.22)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';const t=+p[1]>=1000?(+p[1]/1000)+'K':p[1];c.fillText(t,s/2,s*.78);}
  else{const sp=SPECIAL_ICONS.find(x=>x[0]===p[1]);c.font=(s*.55)+'px system-ui, "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji", sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(sp?sp[1]:'?',s/2,s*.55);}
  c.restore();}
function thumb(b,sk,size,o){
  const cv=document.createElement('canvas');const d=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(size*d);cv.height=Math.round(size*d);cv.style.width=size+'px';cv.style.height=size+'px';cv.setAttribute('aria-hidden','true');
  const c=cv.getContext('2d');c.scale(d,d);
  c.fillStyle='rgba(20,15,50,.45)';ell(c,size/2,size*.82,size*.34,size*.09);c.fill();
  drawFighter(c,size/2,size*.56,size*.28,b,sk,.55,0,Object.assign({still:true,noShadow:true},o||{}));
  return cv;
}
function drawBeaverBack(c,sk,R,lw,t){
  c.save();c.rotate(Math.sin(t*3)*.08);
  rrect(c,R*.35,R*.2,R*.75,R*1.1,R*.35);c.fillStyle='#4a2f22';c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();
  c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=lw*.4;c.beginPath();for(let i=1;i<4;i++){c.moveTo(R*.45,R*.2+i*R*.27);c.lineTo(R*1.0,R*.2+i*R*.27);}c.stroke();c.restore();
  for(const s of[-1,1]){ell(c,s*R*.62,-R*.78,R*.24,R*.22);c.fillStyle=sk.body;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();ell(c,s*R*.62,-R*.78,R*.11,R*.1);c.fillStyle='rgba(0,0,0,.25)';c.fill();}
}
function drawBeaverFront(c,sk,R,lw){
  ell(c,0,R*.2,R*.42,R*.28);c.fillStyle=sk.belly;c.fill();c.lineWidth=lw*.5;c.strokeStyle=OUT;c.stroke();
  ell(c,0,R*.06,R*.13,R*.09);c.fillStyle='#2a1a14';c.fill();
  rrect(c,-R*.16,R*.27,R*.15,R*.24,R*.04);c.fillStyle='#fffaf0';c.fill();c.lineWidth=lw*.5;c.stroke();
  rrect(c,R*.01,R*.27,R*.15,R*.24,R*.04);c.fill();c.stroke();
  c.save();c.rotate(-.12);rrect(c,-R*.72,R*.3,R*1.44,R*.13,R*.06);c.fillStyle='#ff8fc7';c.fill();c.lineWidth=lw*.55;c.stroke();
  c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-R*.6,R*.32,R*.35,R*.035);c.fillStyle='#e86aa6';ell(c,-R*.72,R*.365,R*.05,R*.065);c.fill();ell(c,R*.72,R*.365,R*.05,R*.065);c.fill();c.restore();
}

/* ---------- Pins (emotes) ---------- */
const BASIC_PINS=[['happy','Happy'],['laugh','Laugh'],['wow','Wow'],['angry','Angry'],['sad','Sad'],['thumb','Nice'],['gg','GG'],['heart','Love']];
const PIN_FACES=[['happy','Happy'],['angry','Angry'],['sad','Sad']];
const PREMIUM_PINS=[['cool','Too Cool'],['cry','Waterworks'],['fire','On Fire'],['think','Hmm?'],['party','Party Time'],['skull','Wrecked'],['sleepy','Zzz'],['stars','Starstruck']];
const PIN_PRICE={gems:15,coins:1000};
const PASS_PINS=[['comet','Comet'],['galaxy','Galaxy']];
const HALLOWEEN_PINS=[['hpumpkin','Pumpkin King'],['hskull','Spooky Skull'],['hbat','Bat Flap'],['hcandy','Trick or Treat'],['hspider','Itsy Spider'],['hcauldron','Cauldron'],['htomb','R.I.P.'],['hboo','Boo Ghost'],['hmummy','Mummy'],['hmoon','Full Moon'],
 ['hcandle','Spooky Candle'],['hwhat','Witch Hat'],['hcat','Black Cat'],['hcrow','Crow'],['heye','Eyeball'],['hbroom','Broom Ride'],['hpotion','Potion'],['hhouse','Haunted House'],['hfangs','Fangs'],['hfrank','Franky'],['hscare','Scarecrow'],['hhand','Bony Hand'],['hpie','Pumpkin Pie'],['hweb','Spider Web'],['hzomb','Zombie Groan']];
const TOXIC_PINS=[['ez','EZ'],['L','Big L'],['clown','Clown'],['skill','Skill Issue'],['bye','Bye Bye'],['crylaugh','Cry Laughing'],['who','Who?'],['thumbdown','Thumbs Down'],['t_ezclap','EZ Clap'],['t_crymore','Cry More'],['t_tooeasy','Too Easy'],['t_yawn','So Bored'],['t_nope','Nope'],['emsuck','Ember: I suck']];
const FRIENDLY_PINS=[['f_niceshot','Nice Shot!'],['f_thanks','Thanks!'],['f_glhf','GL HF'],['f_wp','Well Played'],['f_sorry','Sorry!'],['f_hug','Hug'],['f_highfive','High Five'],['f_letsgo','Let’s Go!'],['perksleep','Sleepy Perk'],['woodchop','Woodrow Chomp'],['emgood','Ember: I’m good']];
const PIN_PACK_GEMS=20;
/* Extra pins that only show up in the daily pin shop */
const DAILY_ONLY_PINS=[['lovestruck','Lovestruck'],['shock','Shook'],['nerd','Nerd'],['rage','Steaming'],['ghosty','Boo!'],['sweat','Sweating'],['mindblown','Mind Blown'],['cheeky','Cheeky'],
 ['shush','Shush'],['takel','Take the L'],['facepalm','Facepalm'],['eyeroll','Eye Roll'],['pleading','Pleading'],['money','Money Eyes'],['cold','Freezing'],['sus','Sus'],['heartbreak','Heartbroken'],['wink','Wink'],['dizzy','Dizzy'],['hundred','100'],
 ['clap','Clap Clap'],['popcorn','Popcorn'],['angel','Angel'],['devil','Devilish'],['alien','Alien'],['robot','Beep Boop'],['sick','Queasy'],['micdrop','Mic Drop'],['rocket','To the Moon'],['bomb','Fuse Lit'],['trophy','Champion'],['rainbow','Rainbow'],
 ['wave','Hi!'],['peace','Peace'],['flex','Flex'],['yawn','Yawn'],['blush','Blush'],['smug','Smug'],['zany','Zany'],['nervous','Nervous'],['pizza','Pizza Time'],['icecream','Ice Cream'],['cookie','Cookie'],['dice','Lucky Roll'],['gamepad','Gamer'],['sunny','Sunny'],['snowman','Snowman'],['jacko','Jack-o'],
 ['jugthumb','Awkward Juggler'],['metshush','Meteorite Shush'],['emberpick','Ember Nose Pick'],
 ['salute','Salute'],['grimace','Grimace'],['pout','Pout'],['scream','Scream'],['cowboy','Yeehaw'],['ninjaface','Ninja'],['king','King'],['frog','Ribbit'],['kitty','Kitty'],['puppy','Puppy'],['panda','Panda'],['octo','Octo']];
/* 150 extra animated pins, mixed and matched from faces, moods and props */
const GEN_ADJ=['Happy','Grumpy','Sleepy','Silly','Spicy','Cosmic','Frosty','Sunny','Lucky','Sneaky','Bouncy','Shiny','Spooky','Cozy','Hyper'],GEN_NOUN=['Blob','Bean','Puff','Gummy','Bubble','Spark','Pebble','Muffin','Noodle','Nugget'];
const GEN_PINS=Array.from({length:150},(_,i)=>['g'+(i+1),GEN_ADJ[i%15]+' '+GEN_NOUN[Math.floor(i/15)]]);
const SECRET_PINS=[['secretking','Secret King']];
const SECRET_IMG=(()=>{if(typeof Image==='undefined')return null;const i=new Image();i.src='data:image/png;base64,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';return i;})();
const SEASON_PINS=[['meteorshower','Meteor Shower'],['nebula','Nebula'],['supernova','Supernova']];
const TROLL_PINS=[['noob','Noob'],['ratio','Ratio'],['lol','LOL'],['cope','Cope'],['bozo','Bozo'],['bruh','Bruh']];
const SHOP_PINS=()=>PREMIUM_PINS.concat(TOXIC_PINS,DAILY_ONLY_PINS,TROLL_PINS,GEN_PINS,FRIENDLY_PINS);
const pinName=id=>{if(id==='secretking'||id==='b:secretking')return'Secret King';if(/^sk:/.test(id)){const[,b,k,f]=id.split(':');return BY_ID[b]?getSkin(BY_ID[b],k).name+' '+BY_ID[b].name+(f?' ('+f+')':''):id;}const p=SHOP_PINS().concat(HALLOWEEN_PINS,BASIC_PINS,PASS_PINS,RANK_PINS,SET_PINS,SEASON_PINS).find(x=>x[0]===id);if(p)return p[1];if(/^pr:/.test(id)){const[,b,t]=id.split(':');return(BY_ID[b]?BY_ID[b].name:'')+' '+t[0].toUpperCase()+t.slice(1)+' prestige';}return id;};
/* "I reached …" rank pins: that rank set's rumbler's skin holding up a sign */
/* Prestige pins: the rumbler in its prestige skin, with a tier ribbon and number badge */
function drawPrestigePin(c,R,lw,b,tier){const T={bronze:['#ffd2a8','#a8582a','#e7a36b','#6e3412','BRONZE','50','pr_bronze'],silver:['#ffffff','#7f8aa3','#d6dbe8','#3d4660','SILVER','150','pr_charged'],gold:['#fff6b0','#e07a12','#ffd23f','#7a4300','GOLD','250','pr_super']}[tier]||[];
  const now=performance.now()/1000,g=c.createRadialGradient(0,-R*.2,R*.1,0,0,R);g.addColorStop(0,T[0]);g.addColorStop(1,T[1]);
  c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=g;c.fill();c.stroke();
  c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();
  c.fillStyle='rgba(255,255,255,'+(tier==='gold'?.35:.2)+')';const n=tier==='gold'?12:8;for(let k=0;k<n;k++){const a=k*TAU/n+(tier==='gold'?now*.4:0);c.beginPath();c.moveTo(0,-R*.15);c.arc(0,-R*.15,R*1.3,a,a+TAU/n/2);c.closePath();c.fill();}
  if(tier!=='bronze'){c.strokeStyle=tier==='gold'?'rgba(255,255,255,.7)':'rgba(94,242,255,.8)';c.lineWidth=R*.05;for(let k=0;k<3;k++){const a=now*3+k*2.1;c.beginPath();c.arc(0,-R*.12,R*.62,a,a+.9);c.stroke();}}
  drawFighter(c,0,-R*.12,R*.46,b,getSkin(b,T[6]),Math.PI/2,now,{still:true,noShadow:true,happy:true});c.restore();
  c.lineWidth=lw*.7;c.beginPath();c.moveTo(-R*.82,R*.36);c.lineTo(R*.82,R*.36);c.lineTo(R*.72,R*.52);c.lineTo(R*.82,R*.68);c.lineTo(-R*.82,R*.68);c.lineTo(-R*.72,R*.52);c.closePath();c.fillStyle=T[2];c.fill();c.stroke();
  c.fillStyle=T[3];c.textAlign='center';c.textBaseline='middle';let fs=R*.24;c.font='400 '+fs+'px Bungee, Impact, sans-serif';const w=c.measureText(T[4]).width;if(w>R*1.2){fs*=R*1.2/w;c.font='400 '+fs+'px Bungee, Impact, sans-serif';}c.fillText(T[4],0,R*.53);
  c.fillStyle=T[2];star(c,R*.62,-R*.62,R*.3,R*.15,5);c.fill();c.stroke();c.fillStyle=T[3];c.font='900 '+(R*.17)+'px system-ui, sans-serif';c.fillText(T[5],R*.62,-R*.6);c.lineWidth=lw;}
function drawRankPin(c,R,lw,rs){
  const m=rs.key==='master',g=c.createLinearGradient(-R,-R,R,R);
  if(m){g.addColorStop(0,'#ffd23f');g.addColorStop(.5,'#ff7aa8');g.addColorStop(1,'#9d7bff');}else{g.addColorStop(0,rs.pal[0]);g.addColorStop(1,rs.pal[1]);}
  c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=g;c.fill();c.stroke();
  const eb=BY_ID[rankSetRumbler(RANK_SETS.indexOf(rs),rankSeed(S))]||BY_ID[STARTER],esk=m?getSkin(eb,'master'):getSkin(eb,rs.skin.id);
  c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();
  c.fillStyle='rgba(255,255,255,.3)';for(let k=0;k<8;k++){const a=k*TAU/8;c.beginPath();c.moveTo(0,-R*.2);c.arc(0,-R*.2,R*1.2,a,a+.22);c.closePath();c.fill();}
  drawFighter(c,0,-R*.12,R*.46,eb,esk,Math.PI/2,0,{still:true,noShadow:true,happy:true});c.restore();
  c.lineWidth=lw*.8;c.save();c.rotate(-.05);rrect(c,-R*.74,R*.04,R*1.48,R*.58,R*.1);c.fillStyle='#fff6dc';c.fill();c.stroke();
  const fit=(txt,max,size)=>{c.font='400 '+size+'px Bungee, Impact, sans-serif';const w=c.measureText(txt).width;if(w>max)c.font='400 '+(size*max/w)+'px Bungee, Impact, sans-serif';};
  const word=rs.name.toUpperCase();
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=OUT;fit('I REACHED',R*1.08,R*.2);c.fillText('I REACHED',0,R*.19);
  c.fillStyle=rs.ink;fit(word,R*1.22,R*.3);c.fillText(word,0,R*.44);c.restore();
  c.fillStyle=esk.body;c.lineWidth=lw*.7;for(const sx of[-1,1]){ell(c,sx*R*.74,R*.28,R*.11,R*.12);c.fill();c.stroke();}
  c.lineWidth=lw;
}
function drawPin(c,id,x,y,s){
  c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';
  const T=performance.now()/1000,PH=(id.length*7+id.charCodeAt(id.length-1))%10;
  {c.save();c.fillStyle='rgba(8,6,22,.28)';ell(c,0,s*.06,s*.47,s*.45);c.fill();c.restore();}
  if(!/^b:(pr:|rk_|master)/.test(id)){c.rotate(Math.sin(T*2.2+PH)*.07);const k=1+Math.sin(T*3.1+PH)*.03;c.scale(k,k);}
  const R=s/2,lw=Math.max(1.5,s*.07);c.strokeStyle=OUT;c.lineWidth=lw;
  const face=(col)=>{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=col;c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';ell(c,-R*.35,-R*.45,R*.28,R*.16);c.fill();};
  const eyes=(sq)=>{c.fillStyle=OUT;for(const sx of[-1,1]){if(sq){c.beginPath();c.moveTo(sx*R*.5,-R*.15);c.quadraticCurveTo(sx*R*.32,-R*.38,sx*R*.14,-R*.15);c.stroke();}else{ell(c,sx*R*.32,-R*.18,R*.11,R*.15);c.fill();}}};
  const p=id.split(':');
  if(p[0]==='r'){const b=BY_ID[p[1]];if(b){const sk=getSkin(b,'classic');c.beginPath();c.arc(0,0,R*.98,0,TAU);c.fillStyle=p[2]==='angry'?'#ff8a80':p[2]==='sad'?'#8ec5ff':'#ffe27a';c.fill();c.stroke();
      c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();drawFighter(c,0,R*.18,R*.62,b,sk,Math.PI/2,0,{still:true,noShadow:true,happy:p[2]==='happy',mood:p[2]==='happy'?null:p[2]});c.restore();}
    c.restore();return;}
  if(p[1]==='sk'&&BY_ID[p[2]]){const b=BY_ID[p[2]],sk=getSkin(b,p[3]),face=p[4],col=sk.tier==='halloween'?'#ff8a1f':sk.tier==='power'?'#9d7bff':sk.tier==='golden'?'#ffd23f':sk.tier==='sig'?'#ffb000':sk.tier===3?'#ffd23f':sk.tier===2?'#b56cff':sk.tier==='pass'?'#ffd36b':'#46b4ff';
    const g=c.createRadialGradient(0,-R*.2,R*.1,0,0,R);g.addColorStop(0,'#ffffff');g.addColorStop(1,col);c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=g;c.fill();c.stroke();
    c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();drawFighter(c,0,R*.12,R*.6,b,sk,Math.PI/2,T,{still:true,noShadow:true,happy:!face||face==='happy'||face==='cool'||face==='love',mood:face==='angry'||face==='sad'?face:null});c.restore();
    if(face==='cool'){c.fillStyle='#1a1430';rrect(c,-R*.5,-R*.2,R*.42,R*.22,R*.07);c.fill();rrect(c,R*.08,-R*.2,R*.42,R*.22,R*.07);c.fill();c.fillRect(-R*.1,-R*.15,R*.2,R*.05);c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-R*.45+((T*.7)%1)*R*.85,-R*.18,R*.05,R*.18);}
    if(face==='love'){c.fillStyle='#ff4d6d';for(let k=0;k<3;k++){const yy=(T*.5+k/3)%1,hx=R*(-.5+k*.5),hy=R*.5-yy*R*1.1,hs=R*.13;c.globalAlpha=1-yy;c.beginPath();c.moveTo(hx,hy+hs);c.bezierCurveTo(hx-hs*1.6,hy-hs*.2,hx-hs*.6,hy-hs*1.4,hx,hy-hs*.4);c.bezierCurveTo(hx+hs*.6,hy-hs*1.4,hx+hs*1.6,hy-hs*.2,hx,hy+hs);c.fill();}c.globalAlpha=1;}
    c.lineWidth=lw*.6;c.fillStyle=col;star(c,R*.62,-R*.62,R*.2,R*.09,5);c.fill();c.stroke();c.lineWidth=lw;c.restore();return;}
  if(p[1]==='pr'&&BY_ID[p[2]]){drawPrestigePin(c,R,lw,BY_ID[p[2]],p[3]);c.restore();return;}
  {const rsP=RANK_SETS.find(x=>x.pin===p[1]);if(rsP){drawRankPin(c,R,lw,rsP);c.restore();return;}}
  {const gm=/^g(\d+)$/.exec(p[1]);if(gm){const n=+gm[1]-1,a=n%15,f=Math.floor(n/15),COL=['#ffd23f','#ff8a80','#8ec5ff','#b9f27c','#ff9bf0','#c79bff','#7fe9fb','#ffb347','#f1f4ff','#6be39a'];
    face(COL[f]);const bob=Math.sin(T*3+n)*R*.04;c.save();c.translate(0,bob);c.fillStyle=OUT;
    const ey=a%5;for(const sx of[-1,1]){if(ey===0){ell(c,sx*R*.3,-R*.18,R*.09,R*.13);c.fill();}else if(ey===1){c.beginPath();c.moveTo(sx*R*.45,-R*.15);c.quadraticCurveTo(sx*R*.3,-R*.35,sx*R*.15,-R*.15);c.stroke();}
      else if(ey===2){c.beginPath();c.moveTo(sx*R*.45,-R*.2);c.lineTo(sx*R*.15,-R*.2);c.stroke();}else if(ey===3){c.fillStyle='#fff';ell(c,sx*R*.3,-R*.18,R*.17,R*.17);c.fill();c.stroke();c.fillStyle=OUT;ell(c,sx*R*.3+Math.sin(T*2)*R*.06,-R*.16,R*.07,R*.07);c.fill();}
      else{c.fillStyle='#ff4d6d';c.save();c.translate(sx*R*.3,-R*.18);c.scale(1+Math.sin(T*6)*.12,1+Math.sin(T*6)*.12);c.beginPath();c.moveTo(0,R*.12);c.bezierCurveTo(-R*.2,-R*.02,-R*.08,-R*.18,0,-R*.05);c.bezierCurveTo(R*.08,-R*.18,R*.2,-R*.02,0,R*.12);c.fill();c.restore();c.fillStyle=OUT;}}
    const mo=Math.floor(a/3)%5;c.beginPath();if(mo===0)c.arc(0,R*.12,R*.3,Math.PI*.15,Math.PI*.85);else if(mo===1)c.arc(0,R*.5,R*.25,Math.PI*1.2,Math.PI*1.8);else if(mo===2){ell(c,0,R*.3,R*.12,R*.14+Math.abs(Math.sin(T*4))*R*.06);c.fillStyle='#7a1f3a';c.fill();}else if(mo===3){c.moveTo(-R*.25,R*.3);for(let k=1;k<=4;k++)c.lineTo(-R*.25+k*R*.125,R*.3+(k%2?-1:1)*R*.06);}else{c.moveTo(-R*.3,R*.25);c.quadraticCurveTo(0,R*.55,R*.3,R*.25);c.closePath();c.fillStyle='#7a1f3a';c.fill();}c.stroke();
    c.restore();const pr=(n*7)%10;c.lineWidth=lw*.7;
    if(pr===1){c.fillStyle='#ffd23f';c.save();c.translate(0,-R*.82+Math.sin(T*3)*R*.04);c.beginPath();c.moveTo(-R*.32,R*.12);c.lineTo(-R*.36,-R*.18);c.lineTo(-R*.15,0);c.lineTo(0,-R*.25);c.lineTo(R*.15,0);c.lineTo(R*.36,-R*.18);c.lineTo(R*.32,R*.12);c.closePath();c.fill();c.stroke();c.restore();}
    else if(pr===2){c.fillStyle='#1a1430';rrect(c,-R*.55,-R*.32,R*.48,R*.26,R*.08);c.fill();rrect(c,R*.07,-R*.32,R*.48,R*.26,R*.08);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(-R*.5+((T*.8)%1)*R*.9,-R*.3,R*.06,R*.22);}
    else if(pr===3){c.fillStyle='#fff6b0';for(let k=0;k<3;k++){const an=T*2+k*TAU/3;star(c,Math.cos(an)*R*.85,Math.sin(an)*R*.85,R*.12,R*.05,4);c.fill();}}
    else if(pr===4){c.fillStyle='#ff4d6d';for(let k=0;k<3;k++){const yy=((T*.5+k/3)%1);c.globalAlpha=1-yy;ell(c,R*(.5-k*.35),-R*.6-yy*R*.5,R*.08,R*.08);c.fill();}c.globalAlpha=1;}
    else if(pr===5){c.fillStyle='#7fd3ff';ell(c,R*.62,-R*.4+Math.abs(Math.sin(T*2))*R*.2,R*.08,R*.13);c.fill();c.stroke();}
    else if(pr===6){c.strokeStyle='#ffd23f';c.lineWidth=lw;ell(c,0,-R*.95+Math.sin(T*3)*R*.04,R*.35,R*.09);c.stroke();}
    else if(pr===7){c.fillStyle='#ff3b5c';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.3,-R*.78);c.lineTo(sx*R*.55,-R*1.05);c.lineTo(sx*R*.6,-R*.6);c.closePath();c.fill();c.stroke();}}
    else if(pr===8){c.fillStyle='rgba(255,90,140,.45)';ell(c,-R*.52,R*.1,R*.14,R*.08);c.fill();ell(c,R*.52,R*.1,R*.14,R*.08);c.fill();}
    else if(pr===9){c.fillStyle='#fff';c.globalAlpha=.6+.4*Math.sin(T*4);c.font='900 '+(R*.3)+'px system-ui, sans-serif';c.textAlign='center';c.fillText('z',R*.62,-R*.55);c.globalAlpha=1;}
    c.restore();return;}}
  /* rumbler pins: Perk asleep, Woodrow chomping a log, Ember holding signs */
  if(p[1]==='perksleep'||p[1]==='woodchop'||p[1]==='emsuck'||p[1]==='emgood'){const k=p[1],bid=k==='perksleep'?'perk':k==='woodchop'?'woodrow':'ember',b=BY_ID[bid];
    const bg=c.createRadialGradient(0,-R*.2,R*.1,0,0,R);bg.addColorStop(0,k==='perksleep'?'#3a3380':k==='emsuck'?'#ffd1dc':'#fff6c2');bg.addColorStop(1,k==='perksleep'?'#140f3a':k==='emsuck'?'#8ec5ff':k==='woodchop'?'#7fc96b':'#ffb000');c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=bg;c.fill();c.stroke();
    c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();
    if(k==='perksleep'){c.translate(0,Math.sin(T*1.5)*R*.02);drawFighter(c,0,R*.12,R*.55,b,getSkin(b,'classic'),Math.PI/2,0,{still:true,noShadow:true,mood:'sleep'});c.fillStyle='#fff';c.textAlign='center';for(let i=0;i<3;i++){const f=(T*.5+i/3)%1;c.globalAlpha=1-f;c.font='900 '+(R*(.16+i*.05))+'px system-ui, sans-serif';c.fillText('z',R*(.35+f*.25),-R*(.3+f*.45));}c.globalAlpha=1;
      c.fillStyle='#ffd23f';c.beginPath();c.arc(-R*.62,-R*.6,R*.16,0,TAU);c.fill();c.fillStyle='#3a3380';c.beginPath();c.arc(-R*.55,-R*.66,R*.14,0,TAU);c.fill();}
    else if(k==='woodchop'){drawFighter(c,-R*.18,R*.05,R*.5,b,getSkin(b,'classic'),0,0,{still:true,noShadow:true,happy:true});const ch=Math.abs(Math.sin(T*8));c.save();c.translate(R*.42,R*.3);c.rotate(-.3);rrect(c,-R*.32,-R*.13,R*.64,R*.26,R*.12);c.fillStyle='#a0673f';c.fill();c.stroke();c.fillStyle='#e0bd8b';ell(c,R*.32,0,R*.1,R*.13);c.fill();c.stroke();c.restore();
      c.fillStyle='#e0bd8b';for(let i=0;i<4;i++){const f=(T*1.5+i/4)%1;c.globalAlpha=1-f;c.fillRect(R*.2+Math.cos(i*1.7)*f*R*.5,R*.1-f*R*.5+Math.sin(i)*R*.1,R*.07,R*.05);}c.globalAlpha=1;c.translate(0,ch*R*.02);}
    else{const sad=k==='emsuck';drawFighter(c,0,-R*.14,R*.44,b,getSkin(b,'classic'),Math.PI/2,0,{still:true,noShadow:true,happy:!sad,mood:sad?'sad':null});}
    c.restore();
    if(k==='emsuck'||k==='emgood'){const sad=k==='emsuck';c.lineWidth=lw*.8;c.save();c.rotate((sad?.06:-.05)+Math.sin(T*2)*.03);rrect(c,-R*.78,R*.06,R*1.56,R*.56,R*.1);c.fillStyle='#fff6dc';c.fill();c.stroke();c.textAlign='center';c.textBaseline='middle';
      const fit=(txt,max,size)=>{c.font='900 '+size+'px system-ui, sans-serif';const w=c.measureText(txt).width;if(w>max)c.font='900 '+(size*max/w)+'px system-ui, sans-serif';};
      if(sad){c.fillStyle='#e8243c';fit('I SUCK :(',R*1.36,R*.32);c.fillText('I SUCK :(',0,R*.34);}else{c.fillStyle='#1f7a3a';fit('I’M GOOD AT',R*1.36,R*.2);c.fillText('I’M GOOD AT',0,R*.22);fit('THE GAME :)',R*1.36,R*.2);c.fillText('THE GAME :)',0,R*.46);}c.restore();c.lineWidth=lw;}
    c.restore();return;}
  /* text pins: a face with a speech banner */
  {const TX={t_ezclap:['EZ CLAP','#ff5e87','smug'],t_crymore:['CRY MORE','#5ec8ff','laugh'],t_tooeasy:['TOO EASY','#ffd23f','smug'],t_yawn:['SO BORED','#c79bff','yawn'],t_nope:['NOPE','#ff3b30','angry'],
      f_niceshot:['NICE SHOT!','#6be39a','happy'],f_thanks:['THANKS!','#ffb547','happy'],f_glhf:['GL HF','#5ec8ff','happy'],f_wp:['WELL PLAYED','#ffd23f','happy'],f_sorry:['SORRY!','#ff9bc0','sad'],f_hug:['HUG','#ff7aa8','love'],f_highfive:['HIGH FIVE','#46b4ff','happy'],f_letsgo:['LET’S GO!','#ff9a3d','happy']}[p[1]];
   if(TX){const[txt,col,mood]=TX;face(col);const bob=Math.sin(T*3)*R*.03;c.save();c.translate(0,bob-R*.12);c.fillStyle=OUT;c.strokeStyle=OUT;c.lineWidth=lw*.7;
     if(mood==='happy'||mood==='love'){for(const s of[-1,1]){if(mood==='love'){c.fillStyle='#ff3b5c';c.beginPath();const hx=s*R*.3,hy=-R*.15,hs=R*.12;c.moveTo(hx,hy+hs);c.bezierCurveTo(hx-hs*1.6,hy-hs*.2,hx-hs*.6,hy-hs*1.4,hx,hy-hs*.4);c.bezierCurveTo(hx+hs*.6,hy-hs*1.4,hx+hs*1.6,hy-hs*.2,hx,hy+hs);c.fill();}else{c.beginPath();c.arc(s*R*.3,-R*.1,R*.12,Math.PI*1.1,Math.PI*1.9);c.stroke();}}c.beginPath();c.arc(0,R*.05,R*.25,Math.PI*.15,Math.PI*.85);c.stroke();}
     else if(mood==='sad'){for(const s of[-1,1]){ell(c,s*R*.3,-R*.12,R*.07,R*.1);c.fill();}c.beginPath();c.arc(0,R*.3,R*.2,Math.PI*1.2,Math.PI*1.8);c.stroke();c.fillStyle='#7fd3ff';ell(c,R*.36,R*.02+((T*.8)%1)*R*.2,R*.05,R*.08);c.fill();}
     else if(mood==='angry'){for(const s of[-1,1]){ell(c,s*R*.3,-R*.08,R*.07,R*.09);c.fill();c.beginPath();c.moveTo(s*R*.5,-R*.3);c.lineTo(s*R*.15,-R*.2);c.stroke();}c.beginPath();c.moveTo(-R*.2,R*.22);c.lineTo(R*.2,R*.22);c.stroke();}
     else if(mood==='yawn'){for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.45,-R*.12);c.lineTo(s*R*.15,-R*.12);c.stroke();}ell(c,0,R*.22,R*.12,R*.12+Math.abs(Math.sin(T*1.5))*R*.08);c.fillStyle='#3a1630';c.fill();}
     else{for(const s of[-1,1]){c.beginPath();c.moveTo(s*R*.45,-R*.1);c.quadraticCurveTo(s*R*.3,-R*.22,s*R*.15,-R*.1);c.stroke();}c.beginPath();c.moveTo(-R*.25,R*.12);c.quadraticCurveTo(R*.05,R*.3,R*.28,R*.05);c.stroke();}
     c.restore();c.save();c.translate(0,R*.52);c.rotate(Math.sin(T*2.4)*.05);c.lineWidth=lw*.7;rrect(c,-R*.82,-R*.17,R*1.64,R*.34,R*.12);c.fillStyle='#ffffff';c.fill();c.stroke();
     c.font='900 '+(R*.22)+'px system-ui, sans-serif';const w=c.measureText(txt).width;if(w>R*1.5)c.font='900 '+(R*.22*R*1.5/w)+'px system-ui, sans-serif';c.fillStyle=col==='#ffd23f'?'#9a5f00':col;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,0,R*.01);c.restore();c.restore();return;}}
  if(p[1]==='secretking'){c.beginPath();c.arc(0,0,R*.92,0,TAU);const sg=c.createRadialGradient(0,-R*.2,R*.1,0,0,R);sg.addColorStop(0,'#8a5cf5');sg.addColorStop(1,'#2a1458');c.fillStyle=sg;c.fill();c.stroke();
    if(SECRET_IMG&&SECRET_IMG.complete&&SECRET_IMG.naturalWidth){c.save();c.translate(0,Math.sin(T*3)*R*.03);c.rotate(Math.sin(T*2)*.06);c.drawImage(SECRET_IMG,-R*.8,-R*.84,R*1.6,R*1.6);c.restore();}
    c.fillStyle='#fff';for(let k=0;k<4;k++){const an=T*1.5+k*TAU/4;c.globalAlpha=.4+.6*Math.abs(Math.sin(T*3+k));star(c,Math.cos(an)*R*.8,Math.sin(an)*R*.8,R*.1,R*.04,4);c.fill();}c.globalAlpha=1;c.restore();return;}
  switch(p[1]){
    case 'happy':face('#ffd23f');eyes(false);c.beginPath();c.arc(0,R*.08,R*.42,Math.PI*.15,Math.PI*.85);c.stroke();break;
    case 'laugh':face('#ffd23f');eyes(true);c.beginPath();c.moveTo(-R*.45,R*.12);c.quadraticCurveTo(0,R*.85,R*.45,R*.12);c.closePath();c.fillStyle='#7a1f3a';c.fill();c.stroke();c.fillStyle='#7fd3ff';ell(c,-R*.72,-R*.02,R*.1,R*.16);c.fill();ell(c,R*.72,-R*.02,R*.1,R*.16);c.fill();break;
    case 'wow':face('#ffd23f');eyes(false);ell(c,0,R*.4,R*.16,R*.2);c.fillStyle='#7a1f3a';c.fill();c.stroke();break;
    case 'angry':face('#ff6b5b');eyes(false);c.beginPath();c.moveTo(-R*.55,-R*.48);c.lineTo(-R*.15,-R*.3);c.moveTo(R*.55,-R*.48);c.lineTo(R*.15,-R*.3);c.stroke();c.beginPath();c.arc(0,R*.58,R*.3,Math.PI*1.15,Math.PI*1.85);c.stroke();break;
    case 'sad':face('#7fb8ff');eyes(false);c.beginPath();c.arc(0,R*.6,R*.3,Math.PI*1.15,Math.PI*1.85);c.stroke();c.fillStyle='#d8f3ff';c.beginPath();c.moveTo(R*.32,-R*.02);c.quadraticCurveTo(R*.46,R*.25,R*.32,R*.3);c.quadraticCurveTo(R*.18,R*.25,R*.32,-R*.02);c.fill();c.lineWidth=lw*.5;c.stroke();break;
    case 'thumb':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#5ce1a0';c.fill();c.stroke();rrect(c,-R*.5,-R*.05,R*.28,R*.55,R*.06);c.fillStyle='#fff';c.fill();c.stroke();
      c.beginPath();c.moveTo(-R*.18,-R*.02);c.lineTo(-R*.02,-R*.55);c.quadraticCurveTo(R*.14,-R*.62,R*.12,-R*.35);c.lineTo(R*.06,-R*.12);c.lineTo(R*.46,-R*.12);c.quadraticCurveTo(R*.6,-R*.05,R*.5,R*.08);c.lineTo(R*.42,R*.45);c.quadraticCurveTo(R*.38,R*.52,R*.28,R*.52);c.lineTo(-R*.18,R*.52);c.closePath();c.fill();c.stroke();break;
    case 'gg':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#c792ff';c.fill();c.stroke();c.font='400 '+(R*.85)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=lw*1.2;c.strokeText('GG',0,R*.06);c.fillStyle='#fff';c.fillText('GG',0,R*.06);break;
    case 'jugthumb':case 'metshush':case 'emberpick':{const bid=p[1]==='jugthumb'?'juggler':p[1]==='metshush'?'zenith':'ember',b=BY_ID[bid],bg=p[1]==='jugthumb'?'#ffd9a8':p[1]==='metshush'?'#2a1f5c':'#ffe27a';
      c.beginPath();c.arc(0,0,R*.98,0,TAU);c.fillStyle=bg;c.fill();c.stroke();const rr=R*.6,cy=R*.16;
      c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();drawFighter(c,0,cy,rr,b,getSkin(b,'classic'),-Math.PI/2,T,{still:true,noShadow:true,happy:p[1]==='jugthumb'});c.restore();
      const skinC=p[1]==='metshush'?'#ffd36b':b.look.body;c.lineWidth=lw*.5;
      if(p[1]==='jugthumb'){const bob=Math.sin(T*5)*R*.05;c.save();c.translate(R*.62,R*.38+bob);c.rotate(-.2);c.fillStyle='#e8433a';ell(c,0,0,R*.22,R*.2);c.fill();c.stroke();c.fillStyle='#e8433a';rrect(c,-R*.06,-R*.42,R*.13,R*.3,R*.06);c.fill();c.stroke();c.restore();
        const sw=(T*1.3)%1;c.fillStyle='rgba(127,211,255,'+(1-sw)+')';c.beginPath();c.moveTo(-R*.55,-R*.32+sw*R*.25);c.quadraticCurveTo(-R*.42,-R*.1+sw*R*.25,-R*.55,-R*.06+sw*R*.25);c.quadraticCurveTo(-R*.68,-R*.1+sw*R*.25,-R*.55,-R*.32+sw*R*.25);c.fill();
        c.strokeStyle=OUT;c.lineWidth=lw*.7;c.beginPath();c.moveTo(-R*.32,-R*.2);c.lineTo(-R*.08,-R*.26);c.stroke();}
      else if(p[1]==='metshush'){const up=Math.max(0,Math.sin(T*3))*R*.05;c.fillStyle=skinC;rrect(c,-R*.08,cy+rr*.1-up,R*.16,R*.5,R*.08);c.fill();c.stroke();rrect(c,-R*.2,cy+rr*.6-up,R*.4,R*.3,R*.12);c.fill();c.stroke();
        c.fillStyle='rgba(255,255,255,.9)';c.font='900 '+(R*.22)+'px system-ui, sans-serif';c.textAlign='center';c.fillText('sh',R*.62,-R*.1+Math.sin(T*3)*R*.05);}
      else{const dig=Math.sin(T*5)*R*.05;c.fillStyle=skinC;c.save();c.translate(R*.1,cy+rr*.1+dig);c.rotate(-.35);rrect(c,-R*.08,-R*.06,R*.16,R*.44,R*.08);c.fill();c.stroke();ell(c,R*.04,R*.46,R*.2,R*.16);c.fill();c.stroke();c.restore();
        c.fillStyle='rgba(255,255,255,.95)';c.font='900 '+(R*.2)+'px system-ui, sans-serif';c.textAlign='center';c.globalAlpha=.5+.5*Math.sin(T*2);c.fillText('?',-R*.6,-R*.45);c.globalAlpha=1;}
      c.lineWidth=lw;break;}
    case 'salute':face('#ffd23f');c.fillStyle=OUT;ell(c,-R*.3,-R*.15,R*.1,R*.14);c.fill();c.beginPath();c.moveTo(R*.15,-R*.15);c.lineTo(R*.45,-R*.15);c.stroke();c.beginPath();c.moveTo(-R*.25,R*.32);c.lineTo(R*.25,R*.32);c.stroke();{const k=Math.sin(T*3)*.08;c.save();c.translate(R*.42,-R*.52);c.rotate(-.6+k);c.fillStyle='#ffd9a8';rrect(c,-R*.12,-R*.08,R*.5,R*.18,R*.08);c.fill();c.stroke();c.restore();}break;
    case 'grimace':face('#ffd23f');eyes(false);c.beginPath();c.moveTo(-R*.5,-R*.42);c.lineTo(-R*.15,-R*.36);c.moveTo(R*.5,-R*.42);c.lineTo(R*.15,-R*.36);c.stroke();rrect(c,-R*.38,R*.2,R*.76,R*.24,R*.08);c.fillStyle='#fff';c.fill();c.stroke();c.lineWidth=lw*.4;for(let k=1;k<6;k++){c.beginPath();c.moveTo(-R*.38+k*R*.127,R*.2);c.lineTo(-R*.38+k*R*.127,R*.44);c.stroke();}c.beginPath();c.moveTo(-R*.38,R*.32);c.lineTo(R*.38,R*.32);c.stroke();c.lineWidth=lw;break;
    case 'pout':face('#ffd23f');eyes(false);c.beginPath();c.moveTo(-R*.5,-R*.45);c.lineTo(-R*.15,-R*.4);c.moveTo(R*.5,-R*.45);c.lineTo(R*.15,-R*.4);c.stroke();{const k=1+Math.sin(T*4)*.1;ell(c,0,R*.38,R*.13*k,R*.1*k);c.fillStyle='#ff7aa8';c.fill();c.stroke();}c.fillStyle='rgba(255,90,140,.4)';ell(c,-R*.52,R*.12,R*.13,R*.08);c.fill();ell(c,R*.52,R*.12,R*.13,R*.08);c.fill();break;
    case 'scream':c.save();c.translate(Math.sin(T*30)*R*.02,0);face('#cfe6ff');c.fillStyle=OUT;ell(c,-R*.25,-R*.25,R*.1,R*.16);c.fill();ell(c,R*.25,-R*.25,R*.1,R*.16);c.fill();ell(c,0,R*.35,R*.18,R*.3);c.fillStyle='#3a1020';c.fill();c.stroke();c.fillStyle='#ffd9a8';for(const sx of[-1,1]){ell(c,sx*R*.68,R*.15,R*.16,R*.26);c.fill();c.stroke();}c.restore();break;
    case 'cowboy':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.12,R*.34,Math.PI*.12,Math.PI*.88);c.stroke();{const tilt=Math.sin(T*2.5)*.12;c.save();c.translate(0,-R*.55);c.rotate(tilt);c.fillStyle='#a0552b';c.beginPath();c.ellipse(0,R*.08,R*.95,R*.14,0,0,TAU);c.fill();c.stroke();rrect(c,-R*.42,-R*.4,R*.84,R*.48,R*.18);c.fill();c.stroke();c.fillStyle='#3a2d22';c.fillRect(-R*.42,-R*.02,R*.84,R*.08);c.restore();}break;
    case 'ninjaface':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a2238';c.fill();c.stroke();rrect(c,-R*.7,-R*.32,R*1.4,R*.34,R*.12);c.fillStyle='#ffd9a8';c.fill();c.stroke();c.fillStyle=OUT;const sh=Math.sin(T*1.5)>0?R*.06:-R*.06;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.42+sh,-R*.18);c.lineTo(sx*R*.12+sh,-R*.12);c.lineTo(sx*R*.4+sh,-R*.08);c.closePath();c.fill();}
      c.fillStyle='#ff3b5c';c.save();c.translate(R*.7,-R*.32);c.rotate(Math.sin(T*6)*.3);c.fillRect(0,-R*.04,R*.35,R*.08);c.restore();break;}
    case 'king':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.15,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();{c.save();c.translate(0,-R*.72+Math.sin(T*3)*R*.03);c.fillStyle='#ffd23f';c.beginPath();c.moveTo(-R*.45,R*.18);c.lineTo(-R*.5,-R*.22);c.lineTo(-R*.22,0);c.lineTo(0,-R*.32);c.lineTo(R*.22,0);c.lineTo(R*.5,-R*.22);c.lineTo(R*.45,R*.18);c.closePath();c.fill();c.stroke();c.fillStyle='#ff3b5c';ell(c,0,R*.02,R*.06,R*.06);c.fill();c.restore();}break;
    case 'frog':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#bfefff';c.fill();c.stroke();ell(c,0,R*.15,R*.62,R*.48);c.fillStyle='#6bcf5a';c.fill();c.stroke();for(const sx of[-1,1]){ell(c,sx*R*.3,-R*.32,R*.18,R*.18);c.fill();c.stroke();c.fillStyle='#fff';ell(c,sx*R*.3,-R*.32,R*.11,R*.11);c.fill();c.fillStyle=OUT;ell(c,sx*R*.3,-R*.3,R*.05,R*.06);c.fill();c.fillStyle='#6bcf5a';}
      c.beginPath();c.arc(0,R*.15,R*.32,Math.PI*.15,Math.PI*.85);c.stroke();const tg=Math.max(0,Math.sin(T*3))*R*.4;if(tg>R*.05){c.strokeStyle='#ff7aa8';c.lineWidth=R*.08;c.beginPath();c.moveTo(0,R*.45);c.lineTo(tg*.5,R*.45+tg);c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;}break;}
    case 'kitty':case 'puppy':case 'panda':{const P2={kitty:['#ffb07a','#fff1dc'],puppy:['#c99c63','#f3e0c2'],panda:['#ffffff','#ffffff']}[p[1]];c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=p[1]==='panda'?'#8fe08a':'#ffe6f0';c.fill();c.stroke();
      if(p[1]==='kitty'){c.fillStyle=P2[0];for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.2,-R*.42);c.lineTo(sx*R*.5,-R*.82);c.lineTo(sx*R*.62,-R*.25);c.closePath();c.fill();c.stroke();}}
      else if(p[1]==='puppy'){c.fillStyle='#8a5a2e';for(const sx of[-1,1]){c.save();c.translate(sx*R*.55,-R*.15);c.rotate(sx*(.3+Math.sin(T*4)*.15));ell(c,0,R*.12,R*.16,R*.32);c.fill();c.stroke();c.restore();}}
      else{c.fillStyle='#1a1430';for(const sx of[-1,1]){ell(c,sx*R*.45,-R*.48,R*.17,R*.17);c.fill();}}
      ell(c,0,R*.05,R*.58,R*.52);c.fillStyle=P2[0];c.fill();c.stroke();ell(c,0,R*.25,R*.3,R*.22);c.fillStyle=P2[1];c.fill();
      if(p[1]==='panda'){c.fillStyle='#1a1430';for(const sx of[-1,1]){c.save();c.translate(sx*R*.24,-R*.05);c.rotate(sx*.4);ell(c,0,0,R*.14,R*.18);c.fill();c.restore();}c.fillStyle='#fff';}else c.fillStyle=OUT;
      const bl=(T*1.1+PH)%3<.15;for(const sx of[-1,1]){if(bl){c.strokeStyle=p[1]==='panda'?'#fff':OUT;c.beginPath();c.moveTo(sx*R*.32,-R*.05);c.lineTo(sx*R*.16,-R*.05);c.stroke();c.strokeStyle=OUT;}else{ell(c,sx*R*.24,-R*.05,R*.06,R*.08);c.fill();}}
      c.fillStyle=p[1]==='kitty'?'#ff7aa8':'#1a1430';ell(c,0,R*.17,R*.07,R*.05);c.fill();c.beginPath();c.moveTo(0,R*.22);c.lineTo(0,R*.3);c.moveTo(-R*.12,R*.34);c.quadraticCurveTo(0,R*.4,0,R*.3);c.quadraticCurveTo(0,R*.4,R*.12,R*.34);c.lineWidth=lw*.6;c.stroke();c.lineWidth=lw;break;}
    case 'octo':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a6bd8';c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<4;k++){const f=(T*.6+k*.25)%1;ell(c,-R*.5+k*R*.35,R*.7-f*R*1.4,R*.05,R*.05);c.fill();}c.fillStyle='#ff7aa8';
      for(let k=0;k<5;k++){const x=-R*.48+k*R*.24,w2=Math.sin(T*4+k)*R*.07;c.beginPath();c.moveTo(x-R*.08,R*.1);c.quadraticCurveTo(x+w2,R*.45,x+w2*1.5,R*.62);c.quadraticCurveTo(x+R*.08+w2,R*.4,x+R*.08,R*.1);c.closePath();c.fill();c.stroke();}
      ell(c,0,-R*.12,R*.48,R*.42);c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.17,-R*.12,R*.07,R*.09);c.fill();ell(c,R*.17,-R*.12,R*.07,R*.09);c.fill();c.beginPath();c.arc(0,R*.02,R*.12,Math.PI*.2,Math.PI*.8);c.stroke();break;}
    case 'wave':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.12,R*.32,Math.PI*.15,Math.PI*.85);c.stroke();{c.save();c.translate(R*.62,R*.3);c.rotate(Math.sin(T*8)*.5-.3);c.fillStyle='#ffd9a8';rrect(c,-R*.14,-R*.42,R*.28,R*.48,R*.12);c.fill();c.stroke();c.restore();}break;
    case 'peace':face('#ffd23f');eyes(false);c.beginPath();c.arc(0,R*.18,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();{c.save();c.translate(R*.6,R*.35);c.rotate(Math.sin(T*3)*.15);c.fillStyle='#ffd9a8';for(const a of[-.25,.25]){c.save();c.rotate(a);rrect(c,-R*.06,-R*.5,R*.12,R*.45,R*.06);c.fill();c.stroke();c.restore();}ell(c,0,0,R*.16,R*.14);c.fill();c.stroke();c.restore();}break;
    case 'flex':face('#ffd23f');eyes(true);c.beginPath();c.moveTo(-R*.3,R*.25);c.quadraticCurveTo(0,R*.5,R*.3,R*.25);c.stroke();{const k=1+Math.abs(Math.sin(T*4))*.18;c.save();c.translate(R*.62,R*.15);c.fillStyle='#ffd9a8';rrect(c,-R*.1,0,R*.2,R*.42,R*.08);c.fill();c.stroke();c.scale(k,k);ell(c,0,-R*.08,R*.2,R*.16);c.fill();c.stroke();c.restore();}break;
    case 'yawn':face('#ffd23f');eyes(true);{const o=.6+.4*Math.abs(Math.sin(T*1.5));ell(c,0,R*.38,R*.2,R*.24*o);c.fillStyle='#7a1f3a';c.fill();c.stroke();}c.fillStyle='#fff';c.font='900 '+(R*.22)+'px system-ui, sans-serif';c.globalAlpha=.6+.4*Math.sin(T*3);c.fillText('z',R*.6,-R*.55);c.globalAlpha=1;break;
    case 'blush':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.15,R*.25,Math.PI*.2,Math.PI*.8);c.stroke();c.fillStyle='rgba(255,90,140,'+(.45+.25*Math.sin(T*3))+')';ell(c,-R*.5,R*.12,R*.16,R*.1);c.fill();ell(c,R*.5,R*.12,R*.16,R*.1);c.fill();break;
    case 'smug':face('#ffd23f');c.fillStyle=OUT;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.52,-R*.12);c.quadraticCurveTo(sx*R*.32,-R*.24,sx*R*.12,-R*.12);c.lineTo(sx*R*.32,-R*.06);c.closePath();c.fill();}c.beginPath();c.moveTo(-R*.3,R*.32);c.quadraticCurveTo(R*.1,R*.42,R*.35,R*.18+Math.sin(T*3)*R*.03);c.stroke();break;
    case 'zany':face('#ffd23f');c.fillStyle=OUT;ell(c,-R*.32,-R*.25,R*.13,R*.17);c.fill();ell(c,R*.32,-R*.12,R*.07,R*.09);c.fill();c.beginPath();c.arc(0,R*.12,R*.36,Math.PI*.1,Math.PI*.9);c.stroke();{const w=Math.sin(T*6)*R*.05;c.fillStyle='#ff7aa8';rrect(c,-R*.12+w,R*.42,R*.24,R*.3,R*.12);c.fill();c.stroke();}break;
    case 'nervous':c.save();c.translate(Math.sin(T*25)*R*.02,0);face('#ffe27a');c.fillStyle='#fff';for(const sx of[-1,1]){ell(c,sx*R*.3,-R*.18,R*.15,R*.18);c.fill();c.stroke();}c.fillStyle=OUT;for(const sx of[-1,1]){ell(c,sx*R*.3+R*.05,-R*.16,R*.05,R*.05);c.fill();}c.beginPath();c.moveTo(-R*.3,R*.38);for(let k=1;k<=6;k++)c.lineTo(-R*.3+k*R*.1,R*.38+(k%2?-1:1)*R*.05);c.stroke();c.restore();break;
    case 'pizza':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ffe6c2';c.fill();c.stroke();c.save();c.rotate(Math.sin(T*2)*.15);c.beginPath();c.moveTo(0,R*.65);c.lineTo(-R*.5,-R*.45);c.quadraticCurveTo(0,-R*.65,R*.5,-R*.45);c.closePath();c.fillStyle='#ffc93c';c.fill();c.stroke();c.fillStyle='#e8433a';for(const[px,py]of[[0,-.25],[-.18,0],[.15,.05],[0,.3]]){ell(c,px*R,py*R,R*.08,R*.08);c.fill();}c.restore();break;}
    case 'icecream':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#d6f3ff';c.fill();c.stroke();c.fillStyle='#e0a050';c.beginPath();c.moveTo(-R*.28,R*.0);c.lineTo(R*.28,R*.0);c.lineTo(0,R*.72);c.closePath();c.fill();c.stroke();const d=((T*.8)%1)*R*.3;c.fillStyle='#ff9bc0';ell(c,0,-R*.18,R*.34,R*.3);c.fill();c.stroke();ell(c,R*.18,R*.05+d,R*.05,R*.08);c.fill();c.fillStyle='#ff3b5c';ell(c,0,-R*.5,R*.08,R*.08);c.fill();c.stroke();break;}
    case 'cookie':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#7a4e2a';c.fill();c.stroke();c.save();c.rotate(T*.8);ell(c,0,0,R*.6,R*.6);c.fillStyle='#d9a066';c.fill();c.stroke();c.fillStyle='#4a2a14';for(const[px,py]of[[-.25,-.2],[.2,-.25],[.05,.1],[-.2,.25],[.3,.2]]){ell(c,px*R,py*R,R*.07,R*.06);c.fill();}c.restore();break;}
    case 'dice':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a6b3f';c.fill();c.stroke();c.save();c.rotate(Math.sin(T*3)*.4);rrect(c,-R*.42,-R*.42,R*.84,R*.84,R*.14);c.fillStyle='#fff';c.fill();c.stroke();c.fillStyle='#e8433a';const n=1+Math.floor(T*1.5)%6,pos={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[n];for(const[a,b2]of pos){ell(c,a*R*.22,b2*R*.22,R*.08,R*.08);c.fill();}c.restore();break;}
    case 'gamepad':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#3a2d6b';c.fill();c.stroke();c.save();c.translate(0,Math.sin(T*4)*R*.04);rrect(c,-R*.62,-R*.28,R*1.24,R*.56,R*.26);c.fillStyle='#e9edf6';c.fill();c.stroke();c.fillStyle=OUT;c.fillRect(-R*.42,-R*.04,R*.24,R*.08);c.fillRect(-R*.34,-R*.12,R*.08,R*.24);
      const on=(T*3%1)<.5;c.fillStyle=on?'#ff3b5c':'#6be39a';ell(c,R*.3,-R*.06,R*.07,R*.07);c.fill();c.fillStyle=on?'#5ec8ff':'#ffd23f';ell(c,R*.44,R*.06,R*.07,R*.07);c.fill();c.restore();break;}
    case 'sunny':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#8fd3ff';c.fill();c.stroke();c.save();c.rotate(T*.8);c.fillStyle='#ffb000';for(let k=0;k<10;k++){c.save();c.rotate(k*TAU/10);c.beginPath();c.moveTo(-R*.08,-R*.45);c.lineTo(0,-R*.68);c.lineTo(R*.08,-R*.45);c.closePath();c.fill();c.restore();}c.restore();ell(c,0,0,R*.42,R*.42);c.fillStyle='#ffd23f';c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.14,-R*.06,R*.05,R*.06);c.fill();ell(c,R*.14,-R*.06,R*.05,R*.06);c.fill();c.beginPath();c.arc(0,R*.06,R*.16,Math.PI*.2,Math.PI*.8);c.stroke();break;}
    case 'snowman':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a3a6b';c.fill();c.stroke();c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();c.fillStyle='#fff';for(let k=0;k<8;k++){ell(c,-R*.8+((k*53)%100)/100*R*1.6,((T*.4+k*.13)%1)*R*2-R,R*.04,R*.04);c.fill();}c.restore();ell(c,0,R*.35,R*.36,R*.32);c.fillStyle='#fff';c.fill();c.stroke();ell(c,0,-R*.18,R*.26,R*.24);c.fill();c.stroke();
      c.fillStyle=OUT;ell(c,-R*.09,-R*.22,R*.04,R*.04);c.fill();ell(c,R*.09,-R*.22,R*.04,R*.04);c.fill();c.fillStyle='#ff9a3d';c.beginPath();c.moveTo(0,-R*.14);c.lineTo(R*.2,-R*.1);c.lineTo(0,-R*.08);c.closePath();c.fill();c.fillStyle='#e8433a';c.fillRect(-R*.24,R*.0,R*.48,R*.07);break;}
    case 'hpumpkin':case 'hskull':case 'hbat':case 'hcandy':case 'hspider':case 'hcauldron':case 'htomb':case 'hboo':case 'hmummy':case 'hmoon':
    case 'hcandle':case 'hwhat':case 'hcat':case 'hcrow':case 'heye':case 'hbroom':case 'hpotion':case 'hhouse':case 'hfangs':case 'hfrank':case 'hscare':case 'hhand':case 'hpie':case 'hweb':case 'hzomb':{const k=p[1];
      c.beginPath();c.arc(0,0,R*.92,0,TAU);const bg=c.createLinearGradient(0,-R,0,R);bg.addColorStop(0,'#2a1458');bg.addColorStop(1,'#ff6b2c');c.fillStyle=bg;c.fill();c.stroke();
      c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<5;i++){c.globalAlpha=.3+.7*Math.abs(Math.sin(T*2+i));ell(c,-R*.7+i*R*.35,-R*.65+(i%2)*R*.15,R*.03,R*.03);c.fill();}c.globalAlpha=1;
      const fl=.75+.25*Math.sin(T*9)*Math.sin(T*5.3);
      if(k==='hpumpkin'){c.translate(0,Math.sin(T*3)*R*.04);c.fillStyle='#ff8a1f';ell(c,0,R*.12,R*.68,R*.55);c.fill();c.stroke();c.lineWidth=lw*.6;for(const sx of[-.35,0,.35]){ell(c,R*sx,R*.12,R*.18,R*.54);c.stroke();}c.lineWidth=lw;c.fillStyle='#3f7d2c';rrect(c,-R*.07,-R*.56,R*.14,R*.18,R*.04);c.fill();c.stroke();
        c.fillStyle='rgba(255,226,122,'+fl+')';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.36,-R*.05);c.lineTo(sx*R*.14,-R*.05);c.lineTo(sx*R*.25,-R*.24);c.closePath();c.fill();}c.beginPath();c.moveTo(-R*.4,R*.2);c.lineTo(-R*.2,R*.3);c.lineTo(0,R*.2);c.lineTo(R*.2,R*.3);c.lineTo(R*.4,R*.2);c.lineTo(R*.3,R*.42);c.lineTo(-R*.3,R*.42);c.closePath();c.fill();
        c.fillStyle='#ffd23f';ell(c,0,-R*.88+Math.sin(T*3)*R*.03,R*.3,R*.06);}
      else if(k==='hskull'){const j=Math.abs(Math.sin(T*6))*R*.06;c.fillStyle='#f1f4ff';ell(c,0,-R*.1,R*.55,R*.5);c.fill();c.stroke();rrect(c,-R*.3,R*.25+j,R*.6,R*.28,R*.08);c.fill();c.stroke();c.fillStyle='#1a1430';ell(c,-R*.22,-R*.1,R*.15,R*.17);c.fill();ell(c,R*.22,-R*.1,R*.15,R*.17);c.fill();c.fillStyle='#ff3b30';c.globalAlpha=fl;ell(c,-R*.22,-R*.1,R*.05,R*.05);c.fill();ell(c,R*.22,-R*.1,R*.05,R*.05);c.fill();c.globalAlpha=1;c.lineWidth=lw*.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*R*.1,R*.25+j);c.lineTo(i*R*.1,R*.53+j);c.stroke();}}
      else if(k==='hbat'){const f=Math.sin(T*12)*.5;c.fillStyle='#1a1430';c.translate(0,Math.sin(T*3)*R*.08);for(const sx of[-1,1]){c.save();c.scale(sx,1);c.rotate(f*.4);c.beginPath();c.moveTo(R*.1,0);c.quadraticCurveTo(R*.5,-R*.5,R*.85,-R*.1);c.quadraticCurveTo(R*.65,0,R*.6,R*.15);c.quadraticCurveTo(R*.45,0,R*.3,R*.2);c.quadraticCurveTo(R*.2,R*.05,R*.1,R*.12);c.closePath();c.fill();c.restore();}ell(c,0,0,R*.2,R*.24);c.fill();c.fillStyle='#ffd23f';ell(c,-R*.08,-R*.04,R*.04,R*.04);c.fill();ell(c,R*.08,-R*.04,R*.04,R*.04);c.fill();}
      else if(k==='hcandy'){c.rotate(Math.sin(T*2)*.25);c.fillStyle='#ff3fa4';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.3,0);c.lineTo(sx*R*.75,-R*.25);c.lineTo(sx*R*.75,R*.25);c.closePath();c.fill();c.stroke();}c.fillStyle='#ffd23f';ell(c,0,0,R*.38,R*.3);c.fill();c.stroke();c.strokeStyle='#ff6b2c';c.lineWidth=lw*.7;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*R*.15-R*.08,-R*.26);c.lineTo(i*R*.15+R*.08,R*.26);c.stroke();}}
      else if(k==='hspider'){const y=-R*.2+Math.sin(T*2)*R*.25;c.strokeStyle='#fff';c.lineWidth=lw*.4;c.beginPath();c.moveTo(0,-R);c.lineTo(0,y);c.stroke();c.strokeStyle=OUT;c.lineWidth=lw*.7;for(let i=0;i<4;i++)for(const sx of[-1,1]){const w=Math.sin(T*8+i)*R*.04;c.beginPath();c.moveTo(0,y+R*.1);c.quadraticCurveTo(sx*R*.35,y-R*.1+i*R*.1+w,sx*R*.5,y+R*.1+i*R*.12);c.stroke();}c.lineWidth=lw;c.fillStyle='#1a1430';ell(c,0,y+R*.12,R*.24,R*.22);c.fill();c.fillStyle='#fff';ell(c,-R*.08,y+R*.08,R*.06,R*.07);c.fill();ell(c,R*.08,y+R*.08,R*.06,R*.07);c.fill();}
      else if(k==='hcauldron'){c.fillStyle='#7ed957';for(let i=0;i<4;i++){const f=(T*.7+i/4)%1;c.globalAlpha=1-f;ell(c,-R*.25+i*R*.17,R*-.05-f*R*.7,R*.07+f*R*.05,R*.07+f*R*.05);c.fill();}c.globalAlpha=1;c.fillStyle='#2a2238';ell(c,0,R*.3,R*.58,R*.42);c.fill();c.stroke();c.fillStyle='#7ed957';ell(c,0,-R*.02,R*.55,R*.13);c.fill();c.stroke();}
      else if(k==='htomb'){c.fillStyle='#8d97ae';c.beginPath();c.moveTo(-R*.42,R*.6);c.lineTo(-R*.42,-R*.15);c.arc(0,-R*.15,R*.42,Math.PI,0);c.lineTo(R*.42,R*.6);c.closePath();c.fill();c.stroke();c.fillStyle='#1a1430';c.font='900 '+(R*.26)+'px system-ui, sans-serif';c.textAlign='center';c.fillText('RIP',0,R*.05);
        c.fillStyle='#6bcf5a';c.save();c.translate(R*.25,R*.6-Math.max(0,Math.sin(T*1.5))*R*.3);ell(c,0,0,R*.1,R*.12);c.fill();c.stroke();c.restore();c.fillStyle='#3a2d22';c.fillRect(-R*.9,R*.6,R*1.8,R*.4);}
      else if(k==='hboo'){c.translate(Math.sin(T*1.5)*R*.12,Math.sin(T*3)*R*.06);c.globalAlpha=.92;c.fillStyle='#ffffff';c.beginPath();c.moveTo(-R*.45,R*.5);c.lineTo(-R*.45,-R*.1);c.arc(0,-R*.1,R*.45,Math.PI,0);c.lineTo(R*.45,R*.5);for(let i=0;i<4;i++){c.quadraticCurveTo(R*.45-R*(i*.225+.11),R*(.35+.15*Math.sin(T*6+i)),R*.45-R*(i+1)*.225,R*.5);}c.closePath();c.fill();c.stroke();c.globalAlpha=1;c.fillStyle=OUT;ell(c,-R*.15,-R*.12,R*.07,R*.1);c.fill();ell(c,R*.15,-R*.12,R*.07,R*.1);c.fill();ell(c,0,R*.12,R*.08,R*.1+Math.abs(Math.sin(T*3))*R*.05);c.fill();}
      else if(k==='hmummy'){c.fillStyle='#e8dcc0';ell(c,0,R*.05,R*.55,R*.6);c.fill();c.stroke();c.strokeStyle='#a8927a';c.lineWidth=lw*.5;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-R*.55,-R*.4+i*R*.18);c.lineTo(R*.55,-R*.3+i*R*.18);c.stroke();}c.strokeStyle=OUT;c.lineWidth=lw;c.fillStyle='#fff';const bl=Math.sin(T*1.3)>.95?.2:1;ell(c,-R*.18,-R*.05,R*.12,R*.12*bl);c.fill();c.stroke();ell(c,R*.2,-R*.02,R*.09,R*.09*bl);c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.18,-R*.05,R*.05,R*.05*bl);c.fill();ell(c,R*.2,-R*.02,R*.04,R*.04*bl);c.fill();}
      else if(k==='hcandle'){c.fillStyle='#f6eedb';rrect(c,-R*.2,-R*.1,R*.4,R*.75,R*.06);c.fill();c.stroke();c.fillStyle='#e8dcc0';ell(c,R*.12,R*.05,R*.06,R*.12);c.fill();c.save();c.translate(0,-R*.22);c.scale(1+Math.sin(T*9)*.12,1+Math.sin(T*7)*.15);c.fillStyle='#ffb000';c.beginPath();c.moveTo(0,-R*.32);c.quadraticCurveTo(R*.18,-R*.05,0,R*.08);c.quadraticCurveTo(-R*.18,-R*.05,0,-R*.32);c.fill();c.fillStyle='#fff3b0';ell(c,0,-R*.04,R*.05,R*.09);c.fill();c.restore();c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*.3,R*.6,'#ffb000',.4+.15*Math.sin(T*9));c.restore();}
      else if(k==='hwhat'){c.translate(0,Math.sin(T*2)*R*.05);c.rotate(Math.sin(T*1.5)*.12);c.fillStyle='#3b1f6b';c.beginPath();c.ellipse(0,R*.35,R*.75,R*.16,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(-R*.4,R*.3);c.quadraticCurveTo(-R*.1,-R*.2,R*.25,-R*.75);c.quadraticCurveTo(R*.1,-R*.2,R*.4,R*.3);c.closePath();c.fill();c.stroke();c.fillStyle='#ff8a1f';c.fillRect(-R*.38,R*.12,R*.76,R*.12);c.fillStyle='#ffd23f';rrect(c,-R*.08,R*.1,R*.16,R*.16,R*.03);c.fill();}
      else if(k==='hcat'){c.fillStyle='#120a20';ell(c,0,R*.3,R*.4,R*.32);c.fill();ell(c,0,-R*.15,R*.3,R*.27);c.fill();for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.08,-R*.38);c.lineTo(sx*R*.28,-R*.6);c.lineTo(sx*R*.3,-R*.25);c.closePath();c.fill();}c.strokeStyle='#120a20';c.lineWidth=R*.1;c.beginPath();c.moveTo(R*.35,R*.45);c.quadraticCurveTo(R*.75,R*.3+Math.sin(T*4)*R*.15,R*.6,-R*.1);c.stroke();const bl=Math.sin(T*1.4)>.93?.15:1;c.fillStyle='#ffd23f';ell(c,-R*.1,-R*.15,R*.06,R*.08*bl);c.fill();ell(c,R*.1,-R*.15,R*.06,R*.08*bl);c.fill();}
      else if(k==='hcrow'){const f=Math.sin(T*10)*.6;c.fillStyle='#120a20';c.translate(0,Math.sin(T*3)*R*.05);ell(c,0,0,R*.32,R*.22);c.fill();ell(c,R*.28,-R*.12,R*.15,R*.14);c.fill();c.fillStyle='#ffb000';c.beginPath();c.moveTo(R*.4,-R*.14);c.lineTo(R*.6,-R*.08);c.lineTo(R*.4,-R*.04);c.closePath();c.fill();c.fillStyle='#fff';ell(c,R*.31,-R*.15,R*.04,R*.04);c.fill();c.fillStyle='#120a20';c.save();c.rotate(-f*.6);c.beginPath();c.moveTo(-R*.05,-R*.05);c.quadraticCurveTo(-R*.3,-R*.6,-R*.6,-R*.35);c.quadraticCurveTo(-R*.35,-R*.15,-R*.05,0);c.fill();c.restore();}
      else if(k==='heye'){c.translate(0,Math.sin(T*2)*R*.04);c.fillStyle='#fff';ell(c,0,0,R*.5,R*.5);c.fill();c.stroke();c.strokeStyle='#ff3b5c';c.lineWidth=lw*.4;for(let i=0;i<6;i++){const a=i*1.05;c.beginPath();c.moveTo(Math.cos(a)*R*.48,Math.sin(a)*R*.48);c.quadraticCurveTo(Math.cos(a+.2)*R*.38,Math.sin(a+.2)*R*.38,Math.cos(a)*R*.3,Math.sin(a)*R*.3);c.stroke();}c.strokeStyle=OUT;c.lineWidth=lw;const lx=Math.cos(T*1.3)*R*.14,ly=Math.sin(T*2.1)*R*.1;c.fillStyle='#46b4ff';ell(c,lx,ly,R*.2,R*.2);c.fill();c.fillStyle='#120a20';ell(c,lx,ly,R*.1,R*.1);c.fill();c.fillStyle='#fff';ell(c,lx-R*.05,ly-R*.05,R*.04,R*.04);c.fill();}
      else if(k==='hbroom'){c.translate(Math.sin(T*1.6)*R*.2,Math.sin(T*3.2)*R*.08);c.rotate(-.25);c.strokeStyle='#8a5a2e';c.lineWidth=R*.1;c.beginPath();c.moveTo(-R*.7,0);c.lineTo(R*.45,0);c.stroke();c.fillStyle='#ffb000';c.strokeStyle=OUT;c.lineWidth=lw*.6;c.beginPath();c.moveTo(R*.4,-R*.08);c.lineTo(R*.8,-R*.25);c.lineTo(R*.82,R*.25);c.lineTo(R*.4,R*.08);c.closePath();c.fill();c.stroke();c.fillStyle='#3b1f6b';c.beginPath();c.moveTo(-R*.25,-R*.05);c.lineTo(-R*.05,-R*.65);c.lineTo(R*.12,-R*.05);c.closePath();c.fill();c.stroke();c.lineWidth=lw;}
      else if(k==='hpotion'){c.fillStyle='rgba(255,255,255,.35)';ell(c,0,R*.25,R*.45,R*.42);c.fill();c.stroke();c.save();c.beginPath();c.arc(0,R*.25,R*.42,0,TAU);c.clip();c.fillStyle='#7ed957';c.fillRect(-R*.5,R*.05+Math.sin(T*3)*R*.04,R,R*.7);c.restore();rrect(c,-R*.12,-R*.35,R*.24,R*.22,R*.04);c.fillStyle='#c79bff';c.fill();c.stroke();c.fillStyle='#8a5a2e';rrect(c,-R*.14,-R*.48,R*.28,R*.14,R*.04);c.fill();c.stroke();c.fillStyle='#d9ffd0';for(let i=0;i<3;i++){const f=(T*.8+i/3)%1;c.globalAlpha=1-f;ell(c,-R*.15+i*R*.15,R*.35-f*R*.4,R*.05,R*.05);c.fill();}c.globalAlpha=1;}
      else if(k==='hhouse'){c.fillStyle='#2a1438';c.fillRect(-R*.5,-R*.1,R,R*.7);c.strokeRect(-R*.5,-R*.1,R,R*.7);c.beginPath();c.moveTo(-R*.62,-R*.1);c.lineTo(0,-R*.65);c.lineTo(R*.62,-R*.1);c.closePath();c.fill();c.stroke();const fl=.6+.4*Math.sin(T*7)*Math.sin(T*3);c.fillStyle='rgba(255,210,63,'+fl+')';c.fillRect(-R*.35,R*.02,R*.2,R*.18);c.fillRect(R*.15,R*.02,R*.2,R*.18);c.fillStyle='#120a20';c.fillRect(-R*.1,R*.3,R*.2,R*.3);c.fillStyle='rgba(255,255,255,.7)';const gy=(T*.4)%1;c.globalAlpha=1-gy;ell(c,R*.4,-R*.5-gy*R*.3,R*.1,R*.12);c.fill();c.globalAlpha=1;}
      else if(k==='hfangs'){c.fillStyle='#7a1f3a';c.beginPath();c.moveTo(-R*.55,-R*.1);c.quadraticCurveTo(0,R*.55,R*.55,-R*.1);c.quadraticCurveTo(0,R*.15,-R*.55,-R*.1);c.fill();c.stroke();c.fillStyle='#fff';const j=Math.abs(Math.sin(T*3))*R*.05;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.32,-R*.02);c.lineTo(sx*R*.2,-R*.02);c.lineTo(sx*R*.26,R*.28+j);c.closePath();c.fill();c.stroke();}c.fillStyle='#ff3b5c';const d=((T*.7)%1);c.globalAlpha=1-d;ell(c,R*.26,R*.35+d*R*.3,R*.04,R*.06);c.fill();c.globalAlpha=1;}
      else if(k==='hfrank'){c.fillStyle='#7fb069';rrect(c,-R*.42,-R*.45,R*.84,R*.9,R*.12);c.fill();c.stroke();c.fillStyle='#120a20';c.fillRect(-R*.42,-R*.45,R*.84,R*.22);c.fillStyle='#8d97ae';for(const sx of[-1,1]){c.fillRect(sx*R*.42+(sx>0?0:-R*.14),R*.05,R*.14,R*.12);}c.fillStyle='#120a20';ell(c,-R*.17,-R*.03,R*.06,R*.06);c.fill();ell(c,R*.17,-R*.03,R*.06,R*.06);c.fill();c.lineWidth=lw*.6;c.beginPath();c.moveTo(-R*.2,R*.25);c.lineTo(R*.2,R*.25);c.stroke();for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*R*.1,R*.19);c.lineTo(i*R*.1,R*.31);c.stroke();}c.lineWidth=lw;if(Math.sin(T*4)>.6){c.strokeStyle='#ffd23f';c.beginPath();c.moveTo(R*.6,R*.1);c.lineTo(R*.72,0);c.lineTo(R*.66,R*.08);c.lineTo(R*.8,-R*.04);c.stroke();c.strokeStyle=OUT;}}
      else if(k==='hscare'){c.translate(0,Math.sin(T*1.8)*R*.03);c.rotate(Math.sin(T*1.2)*.06);c.strokeStyle='#8a5a2e';c.lineWidth=R*.1;c.beginPath();c.moveTo(-R*.7,R*.15);c.lineTo(R*.7,R*.15);c.moveTo(0,R*.1);c.lineTo(0,R*.8);c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;c.fillStyle='#f2d36b';ell(c,0,-R*.2,R*.28,R*.3);c.fill();c.stroke();c.fillStyle='#a0552b';c.beginPath();c.ellipse(0,-R*.45,R*.45,R*.08,0,0,TAU);c.fill();c.stroke();rrect(c,-R*.2,-R*.72,R*.4,R*.28,R*.06);c.fill();c.stroke();c.fillStyle='#120a20';ell(c,-R*.1,-R*.22,R*.04,R*.04);c.fill();ell(c,R*.1,-R*.22,R*.04,R*.04);c.fill();c.beginPath();c.moveTo(-R*.12,-R*.05);c.lineTo(R*.12,-R*.05);c.stroke();}
      else if(k==='hhand'){const up=Math.max(0,Math.sin(T*2))*R*.3;c.fillStyle='#3a2d22';c.fillRect(-R*.9,R*.4,R*1.8,R*.6);c.save();c.translate(0,R*.4-up);c.fillStyle='#f1f4ff';rrect(c,-R*.18,-R*.1,R*.36,R*.5,R*.08);c.fill();c.stroke();for(let i=0;i<4;i++){const fx=-R*.15+i*R*.1,wig=Math.sin(T*8+i)*R*.03;rrect(c,fx-R*.035,-R*.48+wig,R*.07,R*.4,R*.03);c.fill();c.stroke();}c.restore();c.fillStyle='#3a2d22';c.fillRect(-R*.9,R*.4,R*1.8,R*.1);}
      else if(k==='hpie'){c.fillStyle='#c98a3c';c.beginPath();c.ellipse(0,R*.2,R*.6,R*.3,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ff8a1f';c.beginPath();c.ellipse(0,R*.12,R*.5,R*.2,0,0,TAU);c.fill();c.fillStyle='#fff';ell(c,0,R*.02-Math.abs(Math.sin(T*3))*R*.05,R*.16,R*.08);c.fill();c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<3;i++){const f=(T*.6+i/3)%1;c.globalAlpha=1-f;c.beginPath();c.arc(-R*.2+i*R*.2,-R*.15-f*R*.45,R*.04,0,TAU);c.fill();}c.globalAlpha=1;}
      else if(k==='hweb'){c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=lw*.35;for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*R*.85,Math.sin(a)*R*.85);c.stroke();}for(let r2=.25;r2<.9;r2+=.2){c.beginPath();for(let i=0;i<=8;i++){const a=i*TAU/8;const px=Math.cos(a)*R*r2,py=Math.sin(a)*R*r2;i?c.quadraticCurveTo(Math.cos(a-.4)*R*r2*.85,Math.sin(a-.4)*R*r2*.85,px,py):c.moveTo(px,py);}c.stroke();}c.strokeStyle=OUT;c.lineWidth=lw;const sy=-R*.2+Math.sin(T*2)*R*.25;c.fillStyle='#120a20';ell(c,R*.25,sy,R*.1,R*.1);c.fill();}
      else if(k==='hzomb'){c.translate(Math.sin(T*2)*R*.05,0);c.fillStyle='#7fb069';ell(c,0,0,R*.55,R*.55);c.fill();c.stroke();c.fillStyle='#fff';ell(c,-R*.2,-R*.12,R*.15,R*.15);c.fill();c.stroke();ell(c,R*.2,-R*.1,R*.1,R*.1);c.fill();c.stroke();c.fillStyle='#120a20';ell(c,-R*.2+Math.sin(T*3)*R*.05,-R*.1,R*.06,R*.06);c.fill();ell(c,R*.2,-R*.1,R*.04,R*.04);c.fill();c.fillStyle='#5a2d2d';ell(c,0,R*.25,R*.2,R*.1+Math.abs(Math.sin(T*2))*R*.06);c.fill();c.stroke();c.fillStyle='#fff';c.font='900 '+(R*.22)+'px system-ui, sans-serif';c.textAlign='center';c.globalAlpha=.5+.5*Math.sin(T*2);c.fillText('uhhh',0,-R*.62);c.globalAlpha=1;}
      else{c.fillStyle='#fff3b0';c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*.05,R*.9,'#ffd23f',.5+.2*Math.sin(T*3));c.restore();ell(c,0,-R*.05,R*.5,R*.5);c.fill();c.stroke();c.fillStyle='rgba(200,170,90,.5)';ell(c,-R*.15,-R*.15,R*.1,R*.1);c.fill();ell(c,R*.18,R*.1,R*.08,R*.08);c.fill();
        c.fillStyle='#1a1430';c.save();c.translate(-R*.9+((T*.25)%1)*R*1.8,-R*.2);c.scale(1,.6+.4*Math.abs(Math.sin(T*10)));c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-R*.1,-R*.1,-R*.2,0);c.quadraticCurveTo(-R*.1,-R*.03,0,R*.03);c.quadraticCurveTo(R*.1,-R*.03,R*.2,0);c.quadraticCurveTo(R*.1,-R*.1,0,0);c.fill();c.restore();}
      c.restore();break;}
    case 'jacko':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#1a1430';c.fill();c.stroke();ell(c,0,R*.08,R*.62,R*.52);c.fillStyle='#ff8a1f';c.fill();c.stroke();c.fillStyle='#3f7d2c';rrect(c,-R*.06,-R*.6,R*.12,R*.18,R*.04);c.fill();c.stroke();
      const fl=.7+.3*Math.sin(T*9);c.fillStyle='rgba(255,230,120,'+fl+')';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.32,-R*.12);c.lineTo(sx*R*.12,R*.06);c.lineTo(sx*R*.42,R*.06);c.closePath();c.fill();}c.beginPath();c.moveTo(-R*.35,R*.22);for(let k=0;k<=6;k++)c.lineTo(-R*.35+k*R*.117,R*.22+(k%2?R*.1:0));c.lineTo(R*.3,R*.38);c.lineTo(-R*.3,R*.38);c.closePath();c.fill();break;}
    case 'noob':case 'ratio':case 'lol':case 'cope':case 'bozo':case 'bruh':{const P2={noob:['#7ed957','NOOB','#1a3a12'],ratio:['#5ec8ff','RATIO','#0f2a44'],lol:['#ffd23f','LOL','#5a3a00'],cope:['#c9b5ff','COPE','#2a1458'],bozo:['#ff9a3d','BOZO','#4a1e00'],bruh:['#ff5e87','BRUH','#4a0a1e']}[p[1]];
      c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=P2[0];c.fill();c.stroke();const k=1+Math.abs(Math.sin(T*4))*.12;c.save();c.rotate(Math.sin(T*3)*.12);c.scale(k,k);c.fillStyle='#fff';rrect(c,-R*.72,-R*.28,R*1.44,R*.56,R*.14);c.fill();c.stroke();
      c.fillStyle=P2[2];c.textAlign='center';c.textBaseline='middle';let fs=R*.42;c.font='900 '+fs+'px Impact, system-ui, sans-serif';const w=c.measureText(P2[1]).width;if(w>R*1.25){fs*=R*1.25/w;c.font='900 '+fs+'px Impact, system-ui, sans-serif';}c.fillText(P2[1],0,R*.02);c.restore();
      if(p[1]==='ratio'){c.fillStyle='#fff';c.beginPath();c.moveTo(R*.45,-R*.5);c.lineTo(R*.7,-R*.75);c.lineTo(R*.75,-R*.45);c.closePath();c.fill();c.stroke();}if(p[1]==='lol'){c.fillStyle='#7fd3ff';ell(c,-R*.6,-R*.45+((T*2)%1)*R*.3,R*.07,R*.1);c.fill();ell(c,R*.6,-R*.45+((T*2+.5)%1)*R*.3,R*.07,R*.1);c.fill();}break;}
    case 'meteorshower':case 'nebula':case 'supernova':{const g=c.createRadialGradient(0,0,R*.1,0,0,R);g.addColorStop(0,p[1]==='supernova'?'#fff3c4':'#6b4bd8');g.addColorStop(1,'#120f3a');c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle=g;c.fill();c.stroke();
      c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();c.fillStyle='#fff';for(let k=0;k<10;k++){const tw=.5+.5*Math.sin(T*4+k*1.7);c.globalAlpha=tw;ell(c,Math.cos(k*2.39)*R*(.2+((k*37)%60)/100),Math.sin(k*2.39)*R*(.2+((k*53)%60)/100),R*.035,R*.035);c.fill();}c.globalAlpha=1;
      if(p[1]==='meteorshower'){for(let k=0;k<3;k++){const f=((T*.7+k*.33)%1),x=-R*.8+f*R*1.6,y=-R*.7+f*R*1.2+k*R*.25;c.strokeStyle='rgba(255,210,120,.8)';c.lineWidth=R*.08;c.beginPath();c.moveTo(x-R*.3,y-R*.22);c.lineTo(x,y);c.stroke();c.fillStyle='#ffd36b';ell(c,x,y,R*.08,R*.08);c.fill();}}
      else if(p[1]==='nebula'){for(let k=0;k<3;k++){c.fillStyle=['rgba(255,122,168,.35)','rgba(94,242,255,.3)','rgba(199,155,255,.4)'][k];ell(c,Math.cos(T*.5+k*2)*R*.25,Math.sin(T*.5+k*2)*R*.2,R*.5,R*.3);c.fill();}}
      else{const pr=(T*.8)%1;c.strokeStyle='rgba(255,243,196,'+(1-pr)+')';c.lineWidth=R*.12;c.beginPath();c.arc(0,0,R*(.2+pr*.8),0,TAU);c.stroke();c.fillStyle='#fff';star(c,0,0,R*.32,R*.12,8);c.fill();}
      c.restore();c.lineWidth=lw;c.strokeStyle=OUT;break;}
    case 'clap':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.05,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();{const g=Math.abs(Math.sin(T*8))*R*.18;c.fillStyle='#ffd9a8';for(const sx of[-1,1]){c.save();c.translate(sx*(R*.08+g),R*.52);c.rotate(sx*.3);rrect(c,-R*.13,-R*.22,R*.26,R*.4,R*.12);c.fill();c.stroke();c.restore();}if(g<R*.04){c.strokeStyle='#ffd23f';c.lineWidth=lw*.6;for(const a of[-2.4,-1.57,-.7]){c.beginPath();c.moveTo(Math.cos(a)*R*.4,R*.4+Math.sin(a)*R*.4);c.lineTo(Math.cos(a)*R*.6,R*.4+Math.sin(a)*R*.6);c.stroke();}c.strokeStyle=OUT;c.lineWidth=lw;}}break;
    case 'popcorn':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a2158';c.fill();c.stroke();c.beginPath();c.moveTo(-R*.45,-R*.05);c.lineTo(R*.45,-R*.05);c.lineTo(R*.32,R*.7);c.lineTo(-R*.32,R*.7);c.closePath();c.fillStyle='#fff';c.fill();c.stroke();c.fillStyle='#ff3b5c';for(const x of[-.3,0,.3]){c.beginPath();c.moveTo(x*R-R*.06,-R*.05);c.lineTo(x*R+R*.06,-R*.05);c.lineTo(x*R*.75+R*.05,R*.7);c.lineTo(x*R*.75-R*.05,R*.7);c.closePath();c.fill();}
      c.fillStyle='#fff3c4';for(let k=0;k<7;k++){const px=(-.4+k*.13)*R,py=-R*.15-((k*37)%3)*R*.08-Math.max(0,Math.sin(T*4+k))*R*.18;ell(c,px,py,R*.11,R*.1);c.fill();c.lineWidth=lw*.4;c.stroke();}c.lineWidth=lw;break;}
    case 'angel':face('#fff3c4');eyes(true);c.beginPath();c.arc(0,R*.1,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();{const hy=-R*.95+Math.sin(T*3)*R*.05;c.strokeStyle='#ffd23f';c.lineWidth=lw*1.1;c.beginPath();c.ellipse(0,hy,R*.42,R*.12,0,0,TAU);c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;}break;
    case 'devil':face('#c93a5a');c.fillStyle='#c93a5a';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.35,-R*.72);c.lineTo(sx*R*.62,-R*1.05-Math.sin(T*4)*R*.04);c.lineTo(sx*R*.68,-R*.55);c.closePath();c.fill();c.stroke();}c.fillStyle=OUT;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.5,-R*.32);c.lineTo(sx*R*.14,-R*.18);c.lineTo(sx*R*.42,-R*.08);c.closePath();c.fill();}
      c.beginPath();c.moveTo(-R*.4,R*.2);c.quadraticCurveTo(0,R*.6,R*.4,R*.2);c.stroke();break;
    case 'alien':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#1d1b52';c.fill();c.stroke();c.save();c.translate(0,Math.sin(T*2.5)*R*.05);c.beginPath();c.moveTo(0,R*.7);c.bezierCurveTo(-R*.8,R*.1,-R*.75,-R*.75,0,-R*.75);c.bezierCurveTo(R*.75,-R*.75,R*.8,R*.1,0,R*.7);c.fillStyle='#8ff07a';c.fill();c.stroke();
      c.fillStyle=OUT;for(const sx of[-1,1]){c.save();c.translate(sx*R*.28,-R*.12);c.rotate(sx*.5);ell(c,0,0,R*.22,R*.12);c.fill();c.restore();}c.fillStyle='#fff';ell(c,-R*.22,-R*.16,R*.04,R*.03);c.fill();ell(c,R*.32,-R*.16,R*.04,R*.03);c.fill();c.restore();break;}
    case 'robot':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a3a55';c.fill();c.stroke();rrect(c,-R*.55,-R*.5,R*1.1,R*.95,R*.15);c.fillStyle='#b8c4d8';c.fill();c.stroke();c.beginPath();c.moveTo(0,-R*.5);c.lineTo(0,-R*.72);c.stroke();ell(c,0,-R*.78,R*.08,R*.08);c.fillStyle=(T*2%1)<.5?'#ff3b30':'#ffd23f';c.fill();c.stroke();
      const bl=(T*1.3%2)<.15;c.fillStyle='#5ef2ff';for(const sx of[-1,1]){if(bl)c.fillRect(sx*R*.24-R*.12,-R*.2,R*.24,R*.04);else{rrect(c,sx*R*.24-R*.12,-R*.3,R*.24,R*.2,R*.04);c.fill();}}c.fillStyle='#2a3a55';for(let k=0;k<4;k++)c.fillRect(-R*.3+k*R*.16,R*.15,R*.1,R*.12);break;}
    case 'sick':face('#a6d86a');eyes(true);c.save();c.translate(0,Math.sin(T*3)*R*.03);c.beginPath();c.moveTo(-R*.3,R*.3);c.quadraticCurveTo(-R*.15,R*.18,0,R*.3);c.quadraticCurveTo(R*.15,R*.42,R*.3,R*.3);c.stroke();c.restore();c.fillStyle='rgba(60,120,30,.35)';ell(c,-R*.5,R*.08,R*.13,R*.08);c.fill();ell(c,R*.5,R*.08,R*.13,R*.08);c.fill();break;
    case 'micdrop':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a2158';c.fill();c.stroke();const k=(T*.8)%1.6,y=-R*.55+Math.min(1,k)*R*.95;c.save();c.translate(R*.05,y);c.rotate(.5+Math.min(1,k)*1.2);rrect(c,-R*.08,0,R*.16,R*.55,R*.06);c.fillStyle='#1a1430';c.fill();c.stroke();ell(c,0,-R*.08,R*.18,R*.18);c.fillStyle='#b8c4d8';c.fill();c.stroke();c.restore();
      if(k>1&&k<1.3){c.strokeStyle='#ffd23f';c.lineWidth=lw*.6;for(const a of[-2.6,-1.57,-.5]){c.beginPath();c.moveTo(Math.cos(a)*R*.25,R*.45+Math.sin(a)*R*.25);c.lineTo(Math.cos(a)*R*.45,R*.45+Math.sin(a)*R*.45);c.stroke();}c.strokeStyle=OUT;c.lineWidth=lw;}break;}
    case 'rocket':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#1d1b52';c.fill();c.stroke();c.fillStyle='#fff';for(const[px,py]of[[-.5,-.4],[.55,-.2],[-.3,.5],[.4,.55]]){ell(c,px*R,((py*R+T*R*.6)%(R*1.6))-R*.6,R*.04,R*.04);c.fill();}
      c.save();c.rotate(.6);c.translate(0,Math.sin(T*10)*R*.03);c.fillStyle='#ff9a3d';c.beginPath();c.moveTo(-R*.12,R*.4);c.lineTo(0,R*.4+R*(.2+Math.random()*.15));c.lineTo(R*.12,R*.4);c.closePath();c.fill();c.beginPath();c.moveTo(0,-R*.6);c.quadraticCurveTo(R*.28,-R*.3,R*.22,R*.4);c.lineTo(-R*.22,R*.4);c.quadraticCurveTo(-R*.28,-R*.3,0,-R*.6);c.fillStyle='#f4f1e6';c.fill();c.stroke();ell(c,0,-R*.12,R*.1,R*.1);c.fillStyle='#5ec8ff';c.fill();c.stroke();c.restore();break;}
    case 'bomb':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ffd1a8';c.fill();c.stroke();const sh=Math.sin(T*30)*R*.015;ell(c,sh,R*.1,R*.48,R*.48);c.fillStyle='#2a2238';c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.3)';ell(c,-R*.15+sh,-R*.08,R*.12,R*.08);c.fill();rrect(c,-R*.1,-R*.48,R*.2,R*.14,R*.03);c.fillStyle='#5a5470';c.fill();c.stroke();
      c.beginPath();c.moveTo(0,-R*.48);c.quadraticCurveTo(R*.2,-R*.7,R*.32,-R*.6);c.stroke();const f=1+Math.random()*.4;c.fillStyle='#ffd23f';star(c,R*.35,-R*.62,R*.14*f,R*.06,6);c.fill();break;}
    case 'trophy':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#4a3478';c.fill();c.stroke();c.fillStyle='#ffd23f';c.beginPath();c.moveTo(-R*.38,-R*.5);c.lineTo(R*.38,-R*.5);c.quadraticCurveTo(R*.36,R*.1,0,R*.18);c.quadraticCurveTo(-R*.36,R*.1,-R*.38,-R*.5);c.fill();c.stroke();
      c.lineWidth=lw*.8;for(const sx of[-1,1]){c.beginPath();c.arc(sx*R*.42,-R*.3,R*.15,sx>0?-1.6:1.6-Math.PI,sx>0?1.6:Math.PI+1.6-Math.PI*2,sx<0);c.stroke();}c.lineWidth=lw;rrect(c,-R*.08,R*.18,R*.16,R*.2,R*.03);c.fill();c.stroke();rrect(c,-R*.3,R*.38,R*.6,R*.14,R*.04);c.fill();c.stroke();
      const sp=(T*1.5)%1;c.fillStyle='rgba(255,255,255,'+(1-sp)+')';star(c,-R*.18+sp*R*.1,-R*.32,R*.12*(1-sp*.5),R*.04,4);c.fill();break;}
    case 'rainbow':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#bfe9ff';c.fill();c.stroke();c.save();c.beginPath();c.arc(0,0,R*.9,0,TAU);c.clip();const cols=['#ff3b5c','#ff9a3d','#ffd23f','#6be39a','#5ec8ff','#9d7bff'];c.lineWidth=R*.1;
      cols.forEach((col,k)=>{c.strokeStyle=col;c.beginPath();c.arc(0,R*.35,R*(.72-k*.1),Math.PI,Math.PI+Math.PI*Math.min(1,(T*.6)%1.4));c.stroke();});c.restore();c.strokeStyle=OUT;c.lineWidth=lw;c.fillStyle='#fff';for(const sx of[-1,1]){ell(c,sx*R*.55,R*.38,R*.2,R*.12);c.fill();}break;}
    case 'shush':face('#ffd23f');c.fillStyle=OUT;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.5,-R*.15);c.quadraticCurveTo(sx*R*.32,-R*.32,sx*R*.14,-R*.15);c.stroke();}ell(c,0,R*.38,R*.12,R*.1);c.fillStyle='#7a1f3a';c.fill();
      {const up=Math.max(0,Math.sin(T*3))*R*.06;c.fillStyle='#ffd9a8';rrect(c,-R*.09,R*.05-up,R*.18,R*.6,R*.09);c.fill();c.stroke();c.fillStyle='#ffc38a';rrect(c,-R*.22,R*.48-up,R*.44,R*.36,R*.14);c.fill();c.stroke();}
      c.fillStyle='rgba(255,255,255,.9)';c.font='900 '+(R*.24)+'px system-ui, sans-serif';c.textAlign='center';c.fillText('sh',R*.62,R*.08+Math.sin(T*3)*R*.05);break;
    case 'takel':{const pool=RUMBLERS.filter(x=>!x.random),b=pool[Math.floor(T/1.6+PH)%pool.length];c.beginPath();c.arc(0,0,R*.98,0,TAU);c.fillStyle='#9fe2ff';c.fill();c.stroke();
      c.save();c.beginPath();c.arc(0,0,R*.92,0,TAU);c.clip();drawFighter(c,0,R*.18,R*.62,b,getSkin(b,'classic'),Math.PI/2,0,{still:true,noShadow:true,mood:'sad'});c.restore();
      c.save();c.translate(-R*.05,-R*.55);c.rotate(-.15);c.fillStyle='#7ed957';c.lineWidth=lw*.8;c.beginPath();c.moveTo(-R*.12,-R*.42);c.lineTo(R*.06,-R*.42);c.lineTo(R*.06,R*.04);c.lineTo(R*.36,R*.04);c.lineTo(R*.36,R*.2);c.lineTo(-R*.12,R*.2);c.closePath();c.fill();c.stroke();c.restore();break;}
    case 'facepalm':face('#ffd23f');c.beginPath();c.arc(0,R*.4,R*.22,Math.PI*1.15,Math.PI*1.85);c.stroke();{const sl=Math.sin(T*2)*R*.04;c.fillStyle='#ffd9a8';c.save();c.translate(sl,-R*.18);c.rotate(-.2);rrect(c,-R*.55,-R*.22,R*1.1,R*.44,R*.18);c.fill();c.stroke();c.lineWidth=lw*.5;for(const fx of[-.25,0,.25]){c.beginPath();c.moveTo(fx*R,-R*.22);c.lineTo(fx*R,R*.05);c.stroke();}c.restore();c.lineWidth=lw;}break;
    case 'eyeroll':face('#ffd23f');c.fillStyle='#fff';for(const sx of[-1,1]){ell(c,sx*R*.32,-R*.18,R*.18,R*.2);c.fill();c.stroke();}c.fillStyle=OUT;{const a=T*2;for(const sx of[-1,1]){ell(c,sx*R*.32+Math.cos(a)*R*.07,-R*.24+Math.sin(a)*R*.05-R*.04,R*.07,R*.07);c.fill();}}c.beginPath();c.moveTo(-R*.25,R*.38);c.lineTo(R*.25,R*.32);c.stroke();break;
    case 'pleading':face('#ffd23f');for(const sx of[-1,1]){c.fillStyle='#fff';ell(c,sx*R*.32,-R*.12,R*.24,R*.27);c.fill();c.stroke();c.fillStyle=OUT;ell(c,sx*R*.32,-R*.08,R*.17,R*.2);c.fill();c.fillStyle='#fff';ell(c,sx*R*.37,-R*.17,R*.06,R*.06);c.fill();ell(c,sx*R*.27,-R*.01,R*.03,R*.03);c.fill();
      c.fillStyle='rgba(127,211,255,.85)';ell(c,sx*R*.32,R*.12+((T*1.5+(sx>0?.5:0))%1)*R*.25,R*.06,R*.08);c.fill();}c.beginPath();c.arc(0,R*.55,R*.14,Math.PI*1.2,Math.PI*1.8);c.stroke();break;
    case 'money':face('#ffd23f');c.fillStyle='#2f9e44';c.font='900 '+(R*.5)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';{const k=1+Math.sin(T*6)*.12;for(const sx of[-1,1]){c.save();c.translate(sx*R*.32,-R*.18);c.scale(k,k);c.fillText('$',0,0);c.restore();}}
      c.beginPath();c.moveTo(-R*.42,R*.14);c.quadraticCurveTo(0,R*.75,R*.42,R*.14);c.closePath();c.fillStyle='#7a1f3a';c.fill();c.stroke();break;
    case 'cold':c.save();c.translate(Math.sin(T*40)*R*.025,0);face('#a8dcff');eyes(true);c.fillStyle='#fff';rrect(c,-R*.3,R*.25,R*.6,R*.16,R*.05);c.fill();c.stroke();c.lineWidth=lw*.4;for(let k=1;k<4;k++){c.beginPath();c.moveTo(-R*.3+k*R*.15,R*.25);c.lineTo(-R*.3+k*R*.15,R*.41);c.stroke();}c.lineWidth=lw;
      c.fillStyle='#e8f8ff';for(const[px,len]of[[-.5,.22],[-.2,.3],[.25,.18],[.55,.26]]){c.beginPath();c.moveTo(px*R-R*.07,-R*.86+R*.1);c.lineTo(px*R+R*.07,-R*.86+R*.1);c.lineTo(px*R,-R*.86+R*.1+len*R);c.closePath();c.fill();}c.restore();break;
    case 'sus':face('#ffd23f');c.fillStyle='#fff';for(const sx of[-1,1]){ell(c,sx*R*.32,-R*.15,R*.18,R*.12);c.fill();c.stroke();}c.fillStyle=OUT;{const look=(Math.sin(T*1.5)>0?1:-1)*R*.08;for(const sx of[-1,1]){ell(c,sx*R*.32+look,-R*.15,R*.06,R*.06);c.fill();}}
      c.beginPath();c.moveTo(R*.12,-R*.42);c.lineTo(R*.55,-R*.5);c.stroke();c.beginPath();c.moveTo(-R*.25,R*.38);c.lineTo(R*.25,R*.3);c.stroke();break;
    case 'heartbreak':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ffd1dc';c.fill();c.stroke();const sp=Math.max(0,Math.sin(T*2))*R*.12;
      for(const sx of[-1,1]){c.save();c.translate(sx*sp,0);c.rotate(sx*sp/R*.8);c.beginPath();c.moveTo(0,R*.5);if(sx<0){c.bezierCurveTo(-R*.85,-R*.05,-R*.45,-R*.75,0,-R*.3);c.lineTo(-R*.08,-R*.05);c.lineTo(R*.06,R*.12);c.lineTo(-R*.04,R*.3);}else{c.bezierCurveTo(R*.85,-R*.05,R*.45,-R*.75,0,-R*.3);c.lineTo(-R*.08,-R*.05);c.lineTo(R*.06,R*.12);c.lineTo(-R*.04,R*.3);}c.closePath();c.fillStyle='#ff4d6d';c.fill();c.stroke();c.restore();}break;}
    case 'wink':face('#ffd23f');c.fillStyle=OUT;ell(c,-R*.32,-R*.18,R*.11,R*.15);c.fill();{const blink=(T*1.2+PH)%2.4<.25;if(blink){c.beginPath();c.moveTo(R*.2,-R*.18);c.lineTo(R*.45,-R*.18);c.stroke();}else{c.beginPath();c.moveTo(R*.5,-R*.12);c.quadraticCurveTo(R*.32,-R*.32,R*.14,-R*.12);c.stroke();}}
      c.beginPath();c.arc(0,R*.12,R*.38,Math.PI*.15,Math.PI*.85);c.stroke();break;
    case 'dizzy':face('#c9b5ff');c.lineWidth=lw*.6;for(const sx of[-1,1]){c.save();c.translate(sx*R*.32,-R*.18);c.rotate(T*6*sx);c.beginPath();for(let a=0;a<12;a+=.3){const r=a*R*.017;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.stroke();c.restore();}c.lineWidth=lw;
      c.beginPath();c.moveTo(-R*.3,R*.38);for(let k=1;k<=6;k++)c.lineTo(-R*.3+k*R*.1,R*.38+(k%2?-1:1)*R*.06);c.stroke();for(let k=0;k<3;k++){const a=T*3+k*TAU/3;c.fillStyle='#ffd23f';star(c,Math.cos(a)*R*.6,-R*.7+Math.sin(a)*R*.12,R*.12,R*.05,5);c.fill();}break;
    case 'hundred':{c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#fff6e8';c.fill();c.stroke();const k=1+Math.sin(T*5)*.08;c.save();c.scale(k,k);c.rotate(-.12);c.fillStyle='#ff3b30';c.font='900 '+(R*.78)+'px Impact, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('100',0,-R*.05);
      c.strokeStyle='#ff3b30';c.lineWidth=R*.1;c.beginPath();c.moveTo(-R*.62,R*.38);c.lineTo(R*.62,R*.36);c.stroke();c.beginPath();c.moveTo(-R*.55,R*.55);c.lineTo(R*.55,R*.53);c.stroke();c.restore();break;}
    case 'lovestruck':face('#ffb3c7');for(const sx of[-1,1]){c.save();c.translate(sx*R*.32,-R*.18);c.beginPath();c.moveTo(0,R*.14);c.bezierCurveTo(-R*.3,-R*.04,-R*.14,-R*.26,0,-R*.1);c.bezierCurveTo(R*.14,-R*.26,R*.3,-R*.04,0,R*.14);c.fillStyle='#ff3b5c';c.fill();c.restore();}c.beginPath();c.arc(0,R*.18,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();break;
    case 'shock':face('#ffe27a');c.fillStyle='#fff';for(const sx of[-1,1]){ell(c,sx*R*.32,-R*.2,R*.2,R*.24);c.fill();c.stroke();}c.fillStyle=OUT;for(const sx of[-1,1]){ell(c,sx*R*.32,-R*.2,R*.06,R*.06);c.fill();}ell(c,0,R*.42,R*.18,R*.22);c.fillStyle='#7a1f3a';c.fill();c.stroke();break;
    case 'nerd':face('#ffd23f');c.lineWidth=lw*.8;for(const sx of[-1,1]){c.beginPath();c.arc(sx*R*.32,-R*.15,R*.22,0,TAU);c.fillStyle='rgba(200,235,255,.6)';c.fill();c.stroke();}c.beginPath();c.moveTo(-R*.1,-R*.15);c.lineTo(R*.1,-R*.15);c.stroke();c.fillStyle=OUT;for(const sx of[-1,1]){ell(c,sx*R*.32,-R*.15,R*.06,R*.08);c.fill();}
      c.beginPath();c.arc(0,R*.25,R*.25,Math.PI*.15,Math.PI*.85);c.stroke();c.fillStyle='#fff';rrect(c,-R*.1,R*.43,R*.09,R*.12,R*.02);c.fill();rrect(c,R*.01,R*.43,R*.09,R*.12,R*.02);c.fill();c.lineWidth=lw;break;
    case 'rage':face('#ff5b4a');eyes(false);c.beginPath();c.moveTo(-R*.55,-R*.5);c.lineTo(-R*.12,-R*.3);c.moveTo(R*.55,-R*.5);c.lineTo(R*.12,-R*.3);c.stroke();rrect(c,-R*.3,R*.3,R*.6,R*.16,R*.06);c.fillStyle='#fff';c.fill();c.stroke();
      c.fillStyle='rgba(255,255,255,.85)';for(const sx of[-1,1]){ell(c,sx*R*.72,-R*.72,R*.14,R*.1);c.fill();ell(c,sx*R*.86,-R*.86,R*.09,R*.07);c.fill();}break;
    case 'ghosty':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a2158';c.fill();c.stroke();c.beginPath();c.moveTo(-R*.5,R*.55);c.lineTo(-R*.5,-R*.1);c.quadraticCurveTo(-R*.5,-R*.62,0,-R*.62);c.quadraticCurveTo(R*.5,-R*.62,R*.5,-R*.1);c.lineTo(R*.5,R*.55);
      for(let k=0;k<4;k++){const x=R*.5-k*R*.25;c.lineTo(x-R*.125,R*.42);c.lineTo(x-R*.25,R*.55);}c.closePath();c.fillStyle='#f4f1ff';c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.18,-R*.15,R*.08,R*.12);c.fill();ell(c,R*.18,-R*.15,R*.08,R*.12);c.fill();ell(c,0,R*.16,R*.1,R*.12);c.fill();break;
    case 'sweat':face('#ffd23f');eyes(false);c.beginPath();c.arc(0,R*.45,R*.25,Math.PI*1.15,Math.PI*1.85);c.stroke();c.fillStyle='#7fd3ff';c.beginPath();c.moveTo(R*.62,-R*.6);c.quadraticCurveTo(R*.85,-R*.2,R*.62,-R*.15);c.quadraticCurveTo(R*.4,-R*.2,R*.62,-R*.6);c.fill();c.lineWidth=lw*.5;c.stroke();c.lineWidth=lw;break;
    case 'mindblown':face('#ffd23f');eyes(true);ell(c,0,R*.4,R*.14,R*.16);c.fillStyle='#7a1f3a';c.fill();c.stroke();c.fillStyle='#ff9a3d';c.beginPath();for(let k=0;k<9;k++){const a=Math.PI+k*Math.PI/8,r=k%2?R*.55:R*.9;c.lineTo(Math.cos(a)*r,Math.sin(a)*r-R*.25);}c.closePath();c.fill();c.stroke();c.fillStyle='#fff3c4';ell(c,0,-R*.62,R*.18,R*.12);c.fill();break;
    case 'cheeky':face('#ffd23f');c.fillStyle=OUT;ell(c,-R*.32,-R*.18,R*.11,R*.15);c.fill();c.beginPath();c.moveTo(R*.5,-R*.15);c.quadraticCurveTo(R*.32,-R*.32,R*.14,-R*.15);c.stroke();c.beginPath();c.arc(0,R*.14,R*.36,Math.PI*.12,Math.PI*.88);c.stroke();c.fillStyle='#ff7aa8';rrect(c,R*.02,R*.42,R*.22,R*.26,R*.1);c.fill();c.stroke();break;
    case 'cool':face('#ffd23f');c.beginPath();c.arc(0,R*.12,R*.38,Math.PI*.2,Math.PI*.8);c.stroke();c.fillStyle='#1a1430';rrect(c,-R*.72,-R*.42,R*.62,R*.34,R*.12);c.fill();rrect(c,R*.1,-R*.42,R*.62,R*.34,R*.12);c.fill();c.fillRect(-R*.2,-R*.36,R*.4,R*.08);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-R*.6,-R*.36,R*.18,R*.06);c.fillRect(R*.22,-R*.36,R*.18,R*.06);break;
    case 'cry':face('#7fb8ff');eyes(true);c.beginPath();c.moveTo(-R*.4,R*.45);c.quadraticCurveTo(0,R*.15,R*.4,R*.45);c.stroke();c.fillStyle='#d8f3ff';for(const sx of[-1,1]){rrect(c,sx*R*.32-R*.09,-R*.08,R*.18,R*.8,R*.09);c.fill();}break;
    case 'fire':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#3a1630';c.fill();c.stroke();for(const[s,col]of[[1,'#ff6b2c'],[.7,'#ffb347'],[.4,'#fff1a6']]){c.beginPath();c.moveTo(-R*.55*s,R*.55);c.quadraticCurveTo(-R*.7*s,-R*.1,-R*.2*s,-R*.3);c.quadraticCurveTo(-R*.15*s,-R*.6,0,-R*.82*s);c.quadraticCurveTo(R*.2*s,-R*.5,R*.25*s,-R*.25);c.quadraticCurveTo(R*.7*s,-R*.05,R*.55*s,R*.55);c.closePath();c.fillStyle=col;c.fill();}break;
    case 'think':face('#ffd23f');eyes(false);c.beginPath();c.moveTo(-R*.25,R*.42);c.lineTo(R*.25,R*.36);c.stroke();c.font='400 '+(R*.9)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=lw*1.1;c.strokeText('?',R*.62,-R*.62);c.fillStyle='#fff';c.fillText('?',R*.62,-R*.62);break;
    case 'party':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.12,R*.36,Math.PI*.1,Math.PI*.9);c.closePath();c.fillStyle='#7a1f3a';c.fill();c.stroke();c.beginPath();c.moveTo(-R*.15,-R*.78);c.lineTo(R*.25,-R*1.45);c.lineTo(R*.55,-R*.62);c.closePath();c.fillStyle='#ff5e87';c.fill();c.stroke();
      for(const[px,py,col]of[[-.8,-.6,'#46b4ff'],[.85,-.2,'#6be39a'],[-.75,.55,'#c792ff'],[.7,.7,'#ff5e87']]){c.fillStyle=col;c.fillRect(px*R-R*.06,py*R-R*.06,R*.12,R*.12);}break;
    case 'skull':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#3a3354';c.fill();c.stroke();c.beginPath();c.arc(0,-R*.12,R*.58,0,TAU);c.fillStyle='#f4f1ff';c.fill();c.stroke();rrect(c,-R*.3,R*.25,R*.6,R*.38,R*.08);c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.24,-R*.12,R*.15,R*.17);c.fill();ell(c,R*.24,-R*.12,R*.15,R*.17);c.fill();c.fillRect(-R*.04,R*.3,R*.08,R*.28);break;
    case 'sleepy':face('#c9b5ff');c.beginPath();c.moveTo(-R*.5,-R*.15);c.lineTo(-R*.14,-R*.15);c.moveTo(R*.14,-R*.15);c.lineTo(R*.5,-R*.15);c.stroke();ell(c,0,R*.38,R*.1,R*.12);c.fillStyle='#3a1630';c.fill();c.font='400 '+(R*.42)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.fillStyle='#fff';c.lineWidth=lw*.7;c.strokeText('Z',R*.55,-R*.55);c.fillText('Z',R*.55,-R*.55);c.strokeText('z',R*.82,-R*.85);c.fillText('z',R*.82,-R*.85);break;
    case 'stars':face('#ffd23f');for(const sx of[-1,1]){star(c,sx*R*.33,-R*.16,R*.22,R*.1,5);c.fillStyle='#ff5e87';c.fill();c.lineWidth=lw*.5;c.stroke();}c.lineWidth=lw;c.beginPath();c.arc(0,R*.14,R*.32,Math.PI*.1,Math.PI*.9);c.closePath();c.fillStyle='#7a1f3a';c.fill();c.stroke();break;
    case 'ez':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#6be39a';c.fill();c.stroke();c.font='400 '+(R*.9)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=lw*1.4;c.strokeText('EZ',0,R*.08);c.fillStyle='#fff';c.fillText('EZ',0,R*.08);break;
    case 'L':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ff4d6d';c.fill();c.stroke();c.font='400 '+(R*1.3)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=lw*1.4;c.strokeText('L',0,R*.12);c.fillStyle='#fff';c.fillText('L',0,R*.12);break;
    case 'clown':for(const sx of[-1,1]){c.fillStyle=sx<0?'#46b4ff':'#6be39a';ell(c,sx*R*.74,-R*.42,R*.3,R*.3);c.fill();c.stroke();}
      c.beginPath();c.arc(0,0,R*.86,0,TAU);c.fillStyle='#fff6f0';c.fill();c.stroke();
      for(const sx of[-1,1]){c.fillStyle='#46b4ff';c.beginPath();c.moveTo(sx*R*.32,-R*.46);c.lineTo(sx*R*.46,-R*.22);c.lineTo(sx*R*.32,R*.02);c.lineTo(sx*R*.18,-R*.22);c.closePath();c.fill();c.fillStyle=OUT;ell(c,sx*R*.32,-R*.22,R*.06,R*.08);c.fill();}
      c.beginPath();c.arc(0,R*.12,R*.46,Math.PI*.12,Math.PI*.88);c.lineWidth=lw*1.8;c.strokeStyle='#ff2b3a';c.stroke();c.strokeStyle=OUT;c.lineWidth=lw;
      ell(c,0,R*.04,R*.16,R*.16);c.fillStyle='#ff2b3a';c.fill();c.stroke();break;
    case 'skill':face('#ffd23f');for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.52,-R*.24);c.lineTo(sx*R*.12,-R*.24);c.stroke();c.fillStyle=OUT;ell(c,sx*R*.31,-R*.16,R*.08,R*.06);c.fill();}
      c.beginPath();c.moveTo(-R*.22,R*.14);c.quadraticCurveTo(R*.14,R*.28,R*.38,R*.04);c.stroke();
      rrect(c,-R*.96,R*.4,R*1.92,R*.42,R*.12);c.fillStyle='#ff4d6d';c.fill();c.stroke();c.font='400 '+(R*.22)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.fillText('SKILL ISSUE',0,R*.62);break;
    case 'bye':face('#ffd23f');eyes(true);c.beginPath();c.arc(0,R*.1,R*.3,Math.PI*.15,Math.PI*.85);c.stroke();
      c.save();c.translate(R*.6,-R*.52);c.rotate(.35);c.fillStyle='#ffe0a8';rrect(c,-R*.2,-R*.16,R*.4,R*.4,R*.14);c.fill();c.stroke();for(let k=0;k<3;k++){rrect(c,-R*.19+k*R*.13,-R*.42,R*.11,R*.3,R*.05);c.fill();c.stroke();}c.restore();
      c.beginPath();c.arc(R*.62,-R*.5,R*.55,-2.4,-1.9);c.stroke();break;
    case 'crylaugh':face('#ffd23f');eyes(true);c.beginPath();c.moveTo(-R*.48,R*.06);c.quadraticCurveTo(0,R*.82,R*.48,R*.06);c.closePath();c.fillStyle='#7a1f3a';c.fill();c.stroke();
      c.fillStyle='#7fd3ff';c.lineWidth=lw*.5;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.55,-R*.12);c.quadraticCurveTo(sx*R*1.0,R*.1,sx*R*.88,R*.42);c.quadraticCurveTo(sx*R*.62,R*.26,sx*R*.55,-R*.12);c.fill();c.stroke();}c.lineWidth=lw;break;
    case 'who':face('#c9b5ff');for(const sx of[-1,1]){c.fillStyle=OUT;ell(c,sx*R*.3,-R*.2,R*.07,R*.07);c.fill();}c.beginPath();c.moveTo(-R*.6,-R*.46);c.lineTo(-R*.14,-R*.38);c.stroke();c.beginPath();c.moveTo(-R*.2,R*.16);c.lineTo(R*.2,R*.1);c.stroke();
      rrect(c,-R*.66,R*.34,R*1.32,R*.44,R*.12);c.fillStyle='#fff';c.fill();c.stroke();c.font='400 '+(R*.3)+'px Bungee, Impact, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=OUT;c.fillText('WHO?',0,R*.57);break;
    case 'thumbdown':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ff6b5b';c.fill();c.stroke();c.rotate(Math.PI);rrect(c,-R*.5,-R*.05,R*.28,R*.55,R*.06);c.fillStyle='#fff';c.fill();c.stroke();
      c.beginPath();c.moveTo(-R*.18,-R*.02);c.lineTo(-R*.02,-R*.55);c.quadraticCurveTo(R*.14,-R*.62,R*.12,-R*.35);c.lineTo(R*.06,-R*.12);c.lineTo(R*.46,-R*.12);c.quadraticCurveTo(R*.6,-R*.05,R*.5,R*.08);c.lineTo(R*.42,R*.45);c.quadraticCurveTo(R*.38,R*.52,R*.28,R*.52);c.lineTo(-R*.18,R*.52);c.closePath();c.fill();c.stroke();break;
    case 'wildcard':{c.beginPath();c.arc(0,0,R*.92,0,TAU);const g=c.createLinearGradient(-R,-R,R,R);['#ff5e87','#ffd23f','#5ef2ff','#9d7bff'].forEach((col,k)=>g.addColorStop(k/3,col));c.fillStyle=g;c.fill();c.stroke();
      c.save();c.rotate(-.25);rrect(c,-R*.42,-R*.6,R*.84,R*1.2,R*.12);c.fillStyle='#fff';c.fill();c.stroke();c.fillStyle='#ff3b5c';c.font='900 '+(R*.62)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('\u2665',0,R*.05);
      c.fillStyle='#1f1a2e';c.font='900 '+(R*.22)+'px system-ui, sans-serif';c.fillText('W',-R*.26,-R*.42);c.restore();
      c.fillStyle='#fff';star(c,R*.58,-R*.55,R*.16,R*.07,4);c.fill();star(c,-R*.6,R*.5,R*.12,R*.05,4);c.fill();break;}
    case 'lantern':{c.beginPath();c.arc(0,0,R*.92,0,TAU);const g=c.createRadialGradient(0,-R*.1,R*.1,0,0,R);g.addColorStop(0,'#3a2d6b');g.addColorStop(1,'#1a1438');c.fillStyle=g;c.fill();c.stroke();
      c.save();c.shadowColor='#7fffd4';c.shadowBlur=R*.5;c.beginPath();c.moveTo(-R*.5,-R*.1);c.quadraticCurveTo(-R*.5,-R*.62,0,-R*.62);c.quadraticCurveTo(R*.5,-R*.62,R*.5,-R*.1);c.lineTo(R*.5,R*.42);
      for(let k=0;k<4;k++){const x=R*.5-k*R*.25;c.lineTo(x-R*.125,R*.62);c.lineTo(x-R*.25,R*.42);}c.closePath();c.fillStyle='#6fd9bd';c.fill();c.restore();c.stroke();
      c.fillStyle='#3a2d6b';rrect(c,-R*.3,-R*.78,R*.6,R*.18,R*.06);c.fill();c.stroke();c.fillStyle='#ffb347';c.beginPath();c.moveTo(0,-R*.98);c.quadraticCurveTo(R*.12,-R*.84,0,-R*.78);c.quadraticCurveTo(-R*.12,-R*.84,0,-R*.98);c.fill();
      c.fillStyle='#2b2450';ell(c,-R*.2,-R*.18,R*.09,R*.12);c.fill();ell(c,R*.2,-R*.18,R*.09,R*.12);c.fill();c.fillStyle='#fff';ell(c,-R*.17,-R*.22,R*.03,R*.03);c.fill();ell(c,R*.23,-R*.22,R*.03,R*.03);c.fill();
      c.lineWidth=lw*.6;c.beginPath();c.moveTo(-R*.22,R*.08);c.lineTo(-R*.11,R*.16);c.lineTo(0,R*.08);c.lineTo(R*.11,R*.16);c.lineTo(R*.22,R*.08);c.stroke();c.lineWidth=lw;break;}
    case 'comet':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#1d1b52';c.fill();c.stroke();
      c.fillStyle='rgba(255,154,61,.6)';c.beginPath();c.moveTo(-R*.74,-R*.5);c.lineTo(R*.34,R*.04);c.lineTo(R*.04,R*.34);c.closePath();c.fill();
      c.fillStyle='rgba(255,243,166,.85)';c.beginPath();c.moveTo(-R*.46,-R*.62);c.lineTo(R*.3,R*.06);c.lineTo(R*.06,R*.26);c.closePath();c.fill();
      ell(c,R*.22,R*.22,R*.27,R*.27);c.fillStyle='#ffd36b';c.fill();c.stroke();c.fillStyle='#fff';for(const[px,py]of[[.6,-.5],[-.58,.5],[.68,.56],[-.15,-.72]]){ell(c,px*R,py*R,R*.045,R*.045);c.fill();}break;
    case 'galaxy':c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#2a1f5c';c.fill();c.stroke();c.lineWidth=lw*.95;c.lineCap='round';
      for(const[col,off]of[['#9d7bff',0],['#ff7aa8',Math.PI]]){c.strokeStyle=col;c.beginPath();for(let a=0;a<4.4;a+=.15){const r=R*.06+a*R*.15;c.lineTo(Math.cos(a+off)*r,Math.sin(a+off)*r*.8);}c.stroke();}
      c.fillStyle='#fff';for(const[px,py]of[[.55,-.55],[-.6,.45],[.1,.7],[-.4,-.6]]){ell(c,px*R,py*R,R*.04,R*.04);c.fill();}
      ell(c,0,0,R*.15,R*.15);c.fillStyle='#fff3c4';c.fill();c.strokeStyle=OUT;c.lineWidth=lw*.5;c.stroke();break;
    case 'heart':{const k=1+Math.max(0,Math.sin(T*6))*.12;c.scale(k,k);}c.beginPath();c.arc(0,0,R*.92,0,TAU);c.fillStyle='#ffd1e6';c.fill();c.stroke();c.beginPath();c.moveTo(0,R*.5);c.bezierCurveTo(-R*.85,-R*.05,-R*.45,-R*.75,0,-R*.3);c.bezierCurveTo(R*.45,-R*.75,R*.85,-R*.05,0,R*.5);c.fillStyle='#ff4d6d';c.fill();c.stroke();break;
  }
  {c.save();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=Math.max(1,s*.025);c.beginPath();c.arc(0,0,s/2*.83,Math.PI*1.1,Math.PI*1.55);c.stroke();c.restore();}
  /* little extra motion on top of older pins */
  {const k=p[1];c.save();
   if(k==='cry'||k==='crylaugh'||k==='sad'){c.fillStyle='rgba(127,211,255,.9)';for(const sx of[-1,1]){const f=(T*1.6+(sx>0?.5:0))%1;ell(c,sx*R*.42,-R*.02+f*R*.55,R*.06,R*.08);c.fill();}}
   else if(k==='sleepy'){c.fillStyle='#fff';c.font='900 '+(R*.28)+'px system-ui, sans-serif';for(let i=0;i<2;i++){const f=(T*.6+i*.5)%1;c.globalAlpha=1-f;c.fillText('z',R*.45+f*R*.25,-R*.4-f*R*.5);}}
   else if(k==='stars'||k==='cool'||k==='skill'){c.fillStyle='#fff';for(let i=0;i<3;i++){const f=(T*1.2+i*.33)%1,a=i*2.1;c.globalAlpha=Math.sin(f*Math.PI);star(c,Math.cos(a)*R*.7,Math.sin(a)*R*.7,R*.13,R*.05,4);c.fill();}}
   else if(k==='party'||k==='gg'){const cols=['#ff5e87','#5ec8ff','#ffd23f','#6be39a'];for(let i=0;i<6;i++){const f=(T*.8+i*.17)%1;c.fillStyle=cols[i%4];c.save();c.translate(-R*.7+i*R*.28,-R*.9+f*R*1.6);c.rotate(T*5+i);c.fillRect(-R*.05,-R*.03,R*.1,R*.06);c.restore();}}
   else if(k==='fire'){c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const f=(T*2+i*.33)%1;c.fillStyle='rgba(255,170,60,'+(1-f)*.7+')';ell(c,(i-1)*R*.3,R*.3-f*R*.9,R*.12*(1-f),R*.16*(1-f));c.fill();}}
   else if(k==='think'){c.fillStyle='#fff';for(let i=0;i<3;i++){c.globalAlpha=.4+.6*Math.max(0,Math.sin(T*4-i));ell(c,R*.45+i*R*.17,-R*.62-i*R*.08,R*.06,R*.06);c.fill();}}
   else if(k==='angry'||k==='rage'){c.fillStyle='rgba(255,255,255,.8)';for(const sx of[-1,1]){const f=(T*1.5+(sx>0?.5:0))%1;c.globalAlpha=1-f;ell(c,sx*R*(.6+f*.2),-R*(.7+f*.3),R*(.08+f*.08),R*(.06+f*.06));c.fill();}}
   else if(k==='laugh'||k==='crylaugh'||k==='clown'||k==='L'||k==='ez'){}
   c.restore();}
  c.restore();
}
const ANIM_PINS=[];
function pinCanvas(id,size){const cv=document.createElement('canvas');const d=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=Math.round(size*d);cv.style.width=cv.style.height=size+'px';cv.setAttribute('aria-hidden','true');const c=cv.getContext('2d');c.scale(d,d);drawPin(c,id,size/2,size/2,size*.92);
  if(ANIM_PINS.length>300)ANIM_PINS.splice(0,ANIM_PINS.length-300);ANIM_PINS.push({cv,c,id,size,d});return cv;}
/* Redraws pins that are on screen so they stay animated */
function animPins(){for(let i=ANIM_PINS.length-1;i>=0;i--){const a=ANIM_PINS[i];if(!a.cv.isConnected){if(a.seen)ANIM_PINS.splice(i,1);continue;}a.seen=true;
  if(a.cv.offsetParent===null)continue;a.c.setTransform(a.d,0,0,a.d,0,0);a.c.clearRect(0,0,a.size,a.size);if(a.drop)drawDropPod(a.c,a.size/2,a.size*.46,a.size*.3,RARITY[a.drop].col,performance.now()/1000,0);else drawPin(a.c,a.id,a.size/2,a.size/2,a.size*.92);}}

function drawOrbit(c,sk,R,t,front){
  const rx=R*1.5,ry=R*.42,cy=-R*.15,tilt=-.22;
  c.save();c.rotate(tilt);
  c.strokeStyle='rgba(255,243,166,.55)';c.lineWidth=Math.max(1,R*.06);c.beginPath();c.ellipse(0,cy,rx,ry,0,front?0:Math.PI,front?Math.PI:TAU);c.stroke();
  const planets=[['#ffd36b',.15,1.1],['#7fd3ff',.11,.75],['#ff7aa8',.1,1.6]];
  planets.forEach(([col,s,sp],i)=>{const a=(t||0)*sp+i*2.1,px=Math.cos(a)*rx,py=cy+Math.sin(a)*ry;if((Math.sin(a)>0)!==front)return;
    ell(c,px,py,R*s,R*s);c.fillStyle=col;c.fill();c.lineWidth=Math.max(1,R*.05);c.strokeStyle=OUT;c.stroke();
    if(i===0){c.save();c.globalCompositeOperation='lighter';glow(c,px,py,R*s*3,col,.5);c.restore();}});
  c.restore();
}

/* ---------- Rumble Drop pod ---------- */
function podHalf(c,R,col,top,kind,t){
  c.save();c.beginPath();c.rect(-R*1.3,top?-R*1.3:0,R*2.6,R*1.3);c.clip();
  if(kind==='galaxy'){c.save();ell(c,0,0,R*.76,R);c.clip();const g=c.createRadialGradient(-R*.2,-R*.2,R*.1,0,0,R*1.1);g.addColorStop(0,'#4b2fb0');g.addColorStop(.6,'#1d1458');g.addColorStop(1,'#0b0828');c.fillStyle=g;c.fillRect(-R,-R*1.1,R*2,R*2.2);
    for(let k=0;k<3;k++){c.fillStyle=['rgba(255,122,168,.45)','rgba(94,242,255,.35)','rgba(199,155,255,.5)'][k];ell(c,Math.cos(t*.4+k*2.1)*R*.3,Math.sin(t*.5+k*2.1)*R*.45,R*.45,R*.25);c.fill();}
    c.fillStyle='#fff';for(let k=0;k<16;k++){c.globalAlpha=.4+.6*Math.abs(Math.sin(t*3+k*1.3));ell(c,Math.cos(k*2.39)*R*.6*((k%5+1)/5),Math.sin(k*2.39)*R*.85*((k%4+1)/4),R*.03,R*.03);c.fill();}c.globalAlpha=1;
    c.fillStyle='#ffd36b';star(c,R*.25,(top?-1:1)*R*.45,R*.09,R*.035,4);c.fill();c.restore();}
  else if(kind==='rainbow'){c.save();ell(c,0,0,R*.76,R);c.clip();const g=c.createLinearGradient(-R,-R,R,R);for(let k=0;k<=6;k++)g.addColorStop(k/6,'hsl('+((t*120+k*60)%360)+',95%,62%)');c.fillStyle=g;c.fillRect(-R,-R*1.1,R*2,R*2.2);c.restore();}
  else{ell(c,0,0,R*.76,R);c.fillStyle=col;c.fill();}
  c.fillStyle='rgba(255,255,255,.3)';ell(c,-R*.26,-R*.5,R*.2,R*.36);c.fill();
  c.fillStyle='rgba(0,0,0,.2)';ell(c,R*.22,R*.56,R*.42,R*.34);c.fill();
  ell(c,0,0,R*.76,R);c.stroke();c.beginPath();c.moveTo(-R*.76,0);c.lineTo(R*.76,0);c.stroke();c.restore();
}
function drawSpookyPod(c,x,y,R,kind,t,open){
  const C={pumpkin:['#ff8a1f','#3f7d2c','#ffe27a'],skeleton:['#f1f4ff','#8d97ae','#ff3b30'],zombie:['#7ed957','#5a2d2d','#fff3b0']}[kind];
  c.save();c.translate(x,y);c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=Math.max(2,R*.09);
  c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*(2.4+open*2.5),'#ff6b2c',.45+.15*Math.sin(t*4)+open*.4);glow(c,0,0,R*1.9,'#7b2fe0',.4);c.restore();
  c.fillStyle='rgba(8,6,22,.4)';ell(c,0,R*1.1,R*.72,R*.18);c.fill();
  c.fillStyle='#1a1430';for(let k=0;k<3;k++){const a=t*1.4+k*TAU/3,bx=Math.cos(a)*R*1.35,by=Math.sin(a)*R*.55-R*.5,fl=.5+.5*Math.abs(Math.sin(t*12+k));c.save();c.translate(bx,by);c.scale(1,fl);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-R*.12,-R*.12,-R*.26,0);c.quadraticCurveTo(-R*.12,-R*.04,0,R*.04);c.quadraticCurveTo(R*.12,-R*.04,R*.26,0);c.quadraticCurveTo(R*.12,-R*.12,0,0);c.fill();c.restore();}
  c.rotate(Math.sin(t*2.5)*.05*(1-open));
  const half=top=>{c.save();c.beginPath();if(top)c.rect(-R*1.2,-R*1.3,R*2.4,R*1.3);else c.rect(-R*1.2,0,R*2.4,R*1.3);c.clip();ell(c,0,0,R*.86,R*.95);c.fillStyle=C[0];c.fill();
    if(kind==='pumpkin'){c.lineWidth=R*.05;for(const sx of[-.45,0,.45]){ell(c,R*sx,0,R*.24,R*.95);c.stroke();}}
    if(kind==='zombie'){c.lineWidth=R*.04;c.beginPath();c.moveTo(-R*.6,R*.35);c.lineTo(-R*.15,R*.5);for(let i=0;i<4;i++){c.moveTo(-R*(.55-i*.12),R*.28);c.lineTo(-R*(.5-i*.12),R*.55);}c.stroke();}
    c.fillStyle='rgba(255,255,255,.25)';ell(c,-R*.3,-R*.5,R*.2,R*.3);c.fill();c.restore();c.lineWidth=Math.max(2,R*.09);c.save();c.beginPath();if(top)c.rect(-R*1.2,-R*1.3,R*2.4,R*1.3);else c.rect(-R*1.2,0,R*2.4,R*1.3);c.clip();ell(c,0,0,R*.86,R*.95);c.stroke();c.restore();};
  half(false);c.save();c.translate(open*R*.4,-open*R*1.2);c.rotate(-open*.8);half(true);
  if(kind==='pumpkin'){c.fillStyle=C[1];rrect(c,-R*.1,-R*1.15,R*.2,R*.28,R*.06);c.fill();c.stroke();}
  if(kind==='skeleton'){c.fillStyle='#f1f4ff';for(const sx of[-1,1]){c.save();c.translate(sx*R*.45,-R*.95);c.rotate(sx*.6);rrect(c,-R*.05,-R*.25,R*.1,R*.4,R*.05);c.fill();c.stroke();ell(c,-R*.06,-R*.27,R*.07,R*.07);c.fill();c.stroke();ell(c,R*.06,-R*.27,R*.07,R*.07);c.fill();c.stroke();c.restore();}}
  if(kind==='zombie'){c.fillStyle='#5a8f4a';for(let i=0;i<3;i++){ell(c,-R*.3+i*R*.3,-R*.9,R*.1,R*.14);c.fill();c.stroke();}}
  const fl=.7+.3*Math.sin(t*9)*Math.sin(t*5.3);
  if(open<.05){if(kind==='pumpkin'){c.fillStyle='rgba(255,226,122,'+fl+')';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*R*.5,-R*.2);c.lineTo(sx*R*.15,-R*.2);c.lineTo(sx*R*.32,-R*.5);c.closePath();c.fill();c.stroke();}}
    else if(kind==='skeleton'){c.fillStyle='#1a1430';ell(c,-R*.3,-R*.35,R*.2,R*.22);c.fill();ell(c,R*.3,-R*.35,R*.2,R*.22);c.fill();c.fillStyle=C[2];c.globalAlpha=fl;ell(c,-R*.3,-R*.33,R*.07,R*.07);c.fill();ell(c,R*.3,-R*.33,R*.07,R*.07);c.fill();c.globalAlpha=1;}
    else{c.fillStyle='#fff';ell(c,-R*.3,-R*.35,R*.2,R*.2);c.fill();c.stroke();ell(c,R*.3,-R*.32,R*.13,R*.13);c.fill();c.stroke();c.fillStyle=OUT;ell(c,-R*.3+Math.sin(t*2)*R*.07,-R*.33,R*.08,R*.08);c.fill();ell(c,R*.3,-R*.3,R*.05,R*.05);c.fill();}}
  c.restore();
  if(open<.05){if(kind==='pumpkin'){c.fillStyle='rgba(255,226,122,'+fl+')';c.beginPath();c.moveTo(-R*.55,R*.15);c.lineTo(-R*.3,R*.3);c.lineTo(-R*.1,R*.15);c.lineTo(R*.1,R*.3);c.lineTo(R*.3,R*.15);c.lineTo(R*.55,R*.15);c.lineTo(R*.35,R*.55);c.lineTo(-R*.35,R*.55);c.closePath();c.fill();c.stroke();}
    else if(kind==='skeleton'){const j=Math.abs(Math.sin(t*5))*R*.05;c.fillStyle='#fff';rrect(c,-R*.4,R*.15+j,R*.8,R*.3,R*.06);c.fill();c.stroke();c.lineWidth=R*.04;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*R*.1,R*.15+j);c.lineTo(i*R*.1,R*.45+j);c.stroke();}}
    else{c.fillStyle='#5a2d2d';c.beginPath();c.moveTo(-R*.4,R*.2);c.quadraticCurveTo(0,R*.55,R*.4,R*.25);c.closePath();c.fill();c.stroke();c.fillStyle='#bfefff';const dr=((t*.8)%1);c.globalAlpha=1-dr;ell(c,R*.2,R*.4+dr*R*.4,R*.05,R*.08);c.fill();c.globalAlpha=1;}}
  else{c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*.1,R*1.4*open,'#ffffff',open);c.restore();}
  c.restore();}
/* Boxes: chunky treasure chests. Rumbler Box = big red chest with a gold lock; Skin Box = purple chest with a gold hanger emblem */
function drawBoxPod(c,x,y,R,kind,t,open){const sk=kind==='sbox',C=sk?{a:'#9b5cf5',b:'#5a1fb0',lid:'#b07bff',lidb:'#6b2fd0',glow:'#ff9bf0'}:{a:'#ff3b4e',b:'#a8122a',lid:'#ff5a6a',lidb:'#c21a34',glow:'#ffd23f'};
  const gold='#ffd23f',goldD='#c98a00';c.save();c.translate(x,y);c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=Math.max(2,R*.08);
  const shake=open<.05?Math.sin(t*18)*Math.max(0,Math.sin(t*1.7))*R*.03:0;c.translate(shake,0);
  c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*(2.4+open*2.6),C.glow,.4+.15*Math.sin(t*4)+open*.45);c.restore();
  c.fillStyle='rgba(8,6,22,.45)';ell(c,0,R*1.12,R*1.05,R*.2);c.fill();
  /* chest body */
  const bw=R*2.0,bh=R*1.15,by=-R*.08;let g=c.createLinearGradient(0,by,0,by+bh);g.addColorStop(0,C.a);g.addColorStop(1,C.b);
  rrect(c,-bw/2,by,bw,bh,R*.16);c.fillStyle=g;c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.18)';rrect(c,-bw/2+R*.12,by+R*.1,bw*.35,R*.12,R*.06);c.fill();
  /* gold corner caps and band */
  c.fillStyle=gold;for(const sx of[-1,1])for(const sy of[0,1]){c.beginPath();const cx2=sx*(bw/2),cy2=by+sy*bh;c.moveTo(cx2,cy2-(sy?R*.34:-R*.34));c.lineTo(cx2,cy2);c.lineTo(cx2-sx*R*.34,cy2);c.closePath();c.fill();c.stroke();}
  rrect(c,-bw/2,by+bh*.5-R*.1,bw,R*.2,R*.04);c.fillStyle=goldD;c.fill();c.stroke();
  /* lid (opens upward) */
  c.save();c.translate(0,by);c.rotate(-open*.9);c.translate(-open*R*.3,-open*R*.7);
  g=c.createLinearGradient(0,-R*.75,0,0);g.addColorStop(0,C.lid);g.addColorStop(1,C.lidb);
  c.beginPath();c.moveTo(-bw/2-R*.06,0);c.lineTo(-bw/2-R*.06,-R*.38);c.quadraticCurveTo(0,-R*.95,bw/2+R*.06,-R*.38);c.lineTo(bw/2+R*.06,0);c.closePath();c.fillStyle=g;c.fill();c.stroke();
  c.fillStyle=gold;rrect(c,-bw/2-R*.1,-R*.12,bw+R*.2,R*.16,R*.05);c.fill();c.stroke();
  for(const sx of[-.55,.55]){c.beginPath();c.moveTo(sx*R-R*.1,-R*.08);c.lineTo(sx*R-R*.1,-R*.66+Math.abs(sx)*R*.12);c.lineTo(sx*R+R*.1,-R*.68+Math.abs(sx)*R*.12);c.lineTo(sx*R+R*.1,-R*.08);c.closePath();c.fill();c.stroke();}
  c.restore();
  /* light leaking from the seam */
  if(open<.05){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.5+.4*Math.sin(t*6);c.fillStyle=C.glow;c.fillRect(-bw/2+R*.2,by-R*.03,bw-R*.4,R*.06);c.restore();}
  /* emblem: gold lock with a star (rumbler) or a hanger (skins) */
  c.save();c.translate(0,by+bh*.5);const pul=1+Math.sin(t*4)*.04;c.scale(pul,pul);
  if(!sk){c.strokeStyle=OUT;c.lineWidth=Math.max(2,R*.07);c.beginPath();c.arc(0,-R*.2,R*.17,Math.PI,0);c.lineWidth=R*.1;c.strokeStyle=goldD;c.stroke();c.lineWidth=Math.max(2,R*.07);c.strokeStyle=OUT;
    rrect(c,-R*.3,-R*.22,R*.6,R*.5,R*.1);c.fillStyle=gold;c.fill();c.stroke();c.fillStyle='#fff6c2';star(c,0,R*.03,R*.16,R*.07,5);c.fill();c.lineWidth=Math.max(1.5,R*.04);c.stroke();}
  else{ell(c,0,0,R*.36,R*.32);c.fillStyle=gold;c.fill();c.stroke();c.strokeStyle='#5a1fb0';c.lineWidth=Math.max(2,R*.06);c.beginPath();c.arc(0,-R*.12,R*.06,Math.PI*1.1,Math.PI*2.2);c.moveTo(R*.02,-R*.06);c.lineTo(R*.22,R*.1);c.lineTo(-R*.22,R*.1);c.closePath();c.stroke();}
  c.restore();
  if(open<.05){c.fillStyle='#fff';for(let k=0;k<4;k++){const an=t*1.4+k*TAU/4;c.globalAlpha=.4+.6*Math.abs(Math.sin(t*3+k));star(c,Math.cos(an)*R*1.35,Math.sin(an)*R*.8,R*.1,R*.04,4);c.fill();}c.globalAlpha=1;}
  else{c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*.3,R*1.5*open,'#ffffff',open);c.restore();}
  c.restore();}
function drawDropPod(c,x,y,R,col,t,open){
  {const bx=BOXES.find(k=>RARITY[k].col===col);if(bx){drawBoxPod(c,x,y,R,bx,t||performance.now()/1000,open||0);return;}}
  {const sp=SPOOKY.find(k=>RARITY[k].col===col);if(sp){drawSpookyPod(c,x,y,R,sp,t||performance.now()/1000,open||0);return;}}
  open=open||0;const rb=col===RARITY.ultra.col,gx=col===RARITY.season.col;t=t||performance.now()/1000;
  if(rb){const h=(t*120)%360;col='hsl('+h+',95%,62%)';c.save();c.translate(x,y);c.globalCompositeOperation='lighter';for(let k=0;k<3;k++)glow(c,0,0,R*(2.1+k*.3),'hsl('+((h+k*120)%360)+',95%,60%)',.35);c.restore();}
  if(gx){c.save();c.translate(x,y);c.globalCompositeOperation='lighter';glow(c,0,0,R*2.6,'#7b4bff',.6);glow(c,0,0,R*1.8,'#ff7aa8',.35);c.restore();}c.save();c.translate(x,y);c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=Math.max(2,R*.09);
  c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*(2.3+open*2.5),col,.5+.15*Math.sin(t*5)+open*.4);c.restore();
  c.fillStyle='rgba(8,6,22,.4)';ell(c,0,R*1.1,R*.72,R*.18);c.fill();
  const pk=gx?'galaxy':rb?'rainbow':null;podHalf(c,R,col,false,pk,t);
  c.save();c.translate(open*R*.4,-open*R*1.2);c.rotate(-open*.8);podHalf(c,R,col,true,pk,t);c.restore();
  if(gx){c.save();c.fillStyle='#fff';for(let k=0;k<12;k++){const a=k*2.39+t*.6,rr=R*(.4+((k*37)%60)/80);c.globalAlpha=.5+.5*Math.sin(t*4+k);ell(c,Math.cos(a)*rr,Math.sin(a)*rr*.8,R*.05,R*.05);c.fill();}c.restore();}
  if(open<.05){rrect(c,-R*.82,-R*.14,R*1.64,R*.28,R*.13);c.fillStyle='#2a2560';c.fill();c.stroke();
    c.save();c.globalCompositeOperation='lighter';glow(c,0,0,R*.55,'#ffffff',.55+.3*Math.sin(t*8));c.restore();
    star(c,0,0,R*.27,R*.11,5);c.fillStyle='#fff';c.fill();c.lineWidth=Math.max(1.5,R*.05);c.stroke();}
  else{c.save();c.globalCompositeOperation='lighter';glow(c,0,-R*.1,R*1.4*open,'#ffffff',open);c.restore();}
  c.restore();
}
function dropCanvas(r,size){const cv=document.createElement('canvas');const d=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=Math.round(size*d);cv.style.width=cv.style.height=size+'px';cv.setAttribute('aria-hidden','true');
  const c=cv.getContext('2d');c.scale(d,d);drawDropPod(c,size/2,size*.46,size*.3,RARITY[r].col,0,0);if(r==='ultra'||isSpecialDrop(r))ANIM_PINS.push({cv,c,id:null,drop:r,size,d});return cv;}

function drawCube(c,x,y,s){c.save();c.translate(x,y);c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=Math.max(1.2,s*.18);
  c.beginPath();c.moveTo(0,-s);c.lineTo(s*.9,-s*.5);c.lineTo(0,0);c.lineTo(-s*.9,-s*.5);c.closePath();c.fillStyle='#bfeaff';c.fill();c.stroke();
  c.beginPath();c.moveTo(-s*.9,-s*.5);c.lineTo(0,0);c.lineTo(0,s);c.lineTo(-s*.9,s*.5);c.closePath();c.fillStyle='#46b4ff';c.fill();c.stroke();
  c.beginPath();c.moveTo(s*.9,-s*.5);c.lineTo(0,0);c.lineTo(0,s);c.lineTo(s*.9,s*.5);c.closePath();c.fillStyle='#2a7fd0';c.fill();c.stroke();c.restore();}
const SET_PIN_OWNER={lantern:'juggler',wildcard:'trick'};
/* skin, prestige and set pins belong to one rumbler: they go in that rumbler's own 3 pin slots */
const pinPersonal=pid=>/^(sk|pr):/.test(pid)||!!SET_PIN_OWNER[pid];
function pinAllowedFor(pid,id){if(/^(sk|pr):/.test(pid))return pid.split(':')[1]===id;if(SET_PIN_OWNER[pid])return SET_PIN_OWNER[pid]===id;return true;}

/* ---------- Numbers ---------- */
function fmt(v){v=Number(v)||0;if(v<10000)return Math.floor(v).toLocaleString('en-US');if(v<1e6)return(Math.floor(v/100)/10)+'K';return(Math.floor(v/1e5)/10)+'M';}
const fmtFull=v=>Math.floor(Number(v)||0).toLocaleString('en-US');

/* ---------- Save ---------- */
const KEY='rooftop-rumble-v2';
function newRumbler(){return{pinSlots:[null,null],facePins:[null,null,null],lvl:1,skins:['classic'],skin:'classic',prestige:0,gadgets:[],stars:[],gadget:null,star:null};}
function defaultSave(){return{hw:{wins:0,used:0,spent:0,knocks:0,opened:0,doors:null},party:[],name:'You',trophies:0,best:0,coins:150,gems:30,pp:0,chromos:0,packs:[],pins:[],onboarded:false,nameChanges:0,nameLockUntil:0,pass:{xp:0,premium:false,cf:[],cp:[],bonus:0,wins:0},drops:[],dropDay:{date:'',n:0},pendingSkins:[],owned:{[STARTER]:newRumbler()},selected:STARTER,mode:'ring',rp:0,rpBest:0,rankClaimed:0,road:0,streak:0,daily:{date:'',claimed:false,dealSkins:[],bought:[]},sound:true,music:true,voice:true,shake:true,matches:0,wins:0};}
function loadSave(given){
  const d=defaultSave();let s=null;
  if(given)s=given;else try{const raw=localStorage.getItem(KEY);if(raw)s=JSON.parse(raw);}catch(e){}
  if(!s||typeof s!=='object')return d;
  const o={...d,...s};
  for(const k of['trophies','best','coins','gems','pp','chromos','rp','rpBest','rankClaimed','road','streak','matches','wins','nameChanges','nameLockUntil']){const n=Number(s[k]);o[k]=isFinite(n)&&n>=0?Math.floor(n):d[k];}
  if(!s.rankV){o.rankV=2;if(o.rp>=1800)o.rp+=300;if(o.rpBest>=1800)o.rpBest+=300;if(o.rankClaimed>=18)o.rankClaimed+=3;}else o.rankV=2;
  o.rankPeak=Math.max(o.rankClaimed|0,Number.isFinite(+s.rankPeak)?+s.rankPeak|0:0,rankInfo(o.rp).i);o.rankCycle=Math.max(0,s.rankCycle|0);o.masterAll=!!s.masterAll;
  o.owned={};
  if(halloweenOn()&&!o.hwDef){o.hwDef=1;o.musicTrack='spooky';o.theme='halloween';}if(o.theme!=='halloween'&&o.theme!=='default')o.theme=halloweenOn()?'halloween':'default';
  o.hw={wins:0,used:0,spent:null,knocks:0,opened:0,doors:null,...(s.hw&&typeof s.hw==='object'?s.hw:{})};o.hw.wins=Math.max(0,o.hw.wins|0);o.hw.used=Math.max(0,Math.min(o.hw.used|0,Math.floor(o.hw.wins/KNOCK_EVERY)));if(o.hw.spent==null)o.hw.spent=o.hw.used;o.hw.spent=Math.max(0,o.hw.spent|0);o.hw.knocks=Math.max(0,o.hw.knocks|0);o.hw.opened=Math.max(0,o.hw.opened|0);if(!Array.isArray(o.hw.doors)||o.hw.doors.length!==6||!o.hw.doors.every(id=>BY_ID[id]))o.hw.doors=null;
  o.party=Array.isArray(s.party)?s.party.filter(f=>f&&typeof f.id==='string'&&BY_ID[f.rumbler]).slice(0,2).map(f=>({id:f.id.slice(0,40),name:String(f.name||'Friend').slice(0,20),rumbler:f.rumbler,skin:typeof f.skin==='string'?f.skin:'classic'})):[];o.netUrl=typeof s.netUrl==='string'?s.netUrl.slice(0,200):'';o.invitesOn=s.invitesOn!==false;o.rankTop=Math.max(0,Math.min(7,s.rankTop|0));o.orient=['auto','portrait','landscape'].includes(s.orient)?s.orient:'auto';o.findByName=!!s.findByName;o.icon=typeof s.icon==='string'?s.icon.slice(0,40):'';o.icons=Array.isArray(s.icons)?s.icons.filter(x=>SPECIAL_ICONS.some(y=>y[0]===x)):[];
  const src=(s.owned&&typeof s.owned==='object')?s.owned:{};
  for(const id in src){if(!BY_ID[id])continue;const r={...newRumbler(),...src[id]};r.lvl=clamp(Math.round(+r.lvl||1),1,MAX_LVL);r.prestige=Math.min(PRESTIGE_MAX,Math.max(0,Math.round(+r.prestige||0)));r.prClaim=Math.max(0,Math.round(+r.prClaim||0));r.pinSlots=Array.isArray(r.pinSlots)?[r.pinSlots[0]||null,r.pinSlots[1]||null]:[null,null];const gr=GEAR[id];r.gadgets=Array.isArray(r.gadgets)?r.gadgets.filter(x=>gr.g.some(g=>g.id===x)):[];r.stars=Array.isArray(r.stars)?r.stars.filter(x=>gr.s.some(g=>g.id===x)):[];if(!r.gadgets.includes(r.gadget))r.gadget=r.gadgets[0]||null;if(!r.stars.includes(r.star))r.star=r.stars[0]||null;
    r.skins=Array.isArray(r.skins)?r.skins.filter(x=>skinsOf(BY_ID[id]).some(k=>k.id===x)):['classic'];if(!r.skins.includes('classic'))r.skins.unshift('classic');if(!r.skins.includes(r.skin))r.skin='classic';o.owned[id]=r;}
  if(!o.owned[STARTER])o.owned[STARTER]=newRumbler();
  if(!o.owned[o.selected])o.selected=STARTER;
  if(!MODE_BY[o.mode])o.mode='ring';
  if(typeof o.name!=='string'||!o.name.trim())o.name='You';
  o.daily={...d.daily,...(s.daily||{})};if(!Array.isArray(o.daily.dealSkins))o.daily.dealSkins=[];if(!Array.isArray(o.daily.bought))o.daily.bought=[];
  o.packs=Array.isArray(s.packs)?s.packs.filter(x=>BY_ID[x]):[];o.pins=Array.isArray(s.pins)?s.pins.filter(x=>PREMIUM_PINS.concat(PASS_PINS,TOXIC_PINS,RANK_PINS,SET_PINS,DAILY_ONLY_PINS,SEASON_PINS,TROLL_PINS,GEN_PINS,HALLOWEEN_PINS,SECRET_PINS,FRIENDLY_PINS).some(p=>p[0]===x)||isPrestigePin(x)||isSkinPin(x)):[];
  const ps=s.pass||{},ints=a=>Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=0&&n<PASS_TIERS):[];
  o.pass={xp:Math.max(0,Math.floor(+ps.xp||0)),premium:!!ps.premium,cf:ints(ps.cf),cp:ints(ps.cp),bonus:Math.max(0,Math.floor(+ps.bonus||0)),wins:Math.max(0,Math.floor(+ps.wins||0))};
  o.drops=Array.isArray(s.drops)?s.drops.filter(d=>d&&(d.r==null||DROP_RAR.includes(d.r)||isSpecialDrop(d.r))).map(d=>({r:d.r||null,min:DROP_RAR.includes(d.min)?d.min:null,g:d.g?1:0})).slice(0,300):[];
  o.dropDay={date:'',n:0,...(s.dropDay||{})};
  o.pendingSkins=Array.isArray(s.pendingSkins)?s.pendingSkins.filter(x=>{if(typeof x!=='string')return false;const[i,k]=x.split(':');return!!BY_ID[i]&&skinsOf(BY_ID[i]).some(q=>q.id===k);}):[];
  for(const id in o.owned){const me=o.owned[id];for(const m of[50,100,150,200,250])if(me.prestige>=m&&(me.prClaim||0)<m){const rw=PRESTIGE_REWARDS[m];me.prClaim=m;if(rw.skin&&!me.skins.includes(rw.skin))me.skins.push(rw.skin);if(rw.pin&&!o.pins.includes('pr:'+id+':'+rw.pin))o.pins.push('pr:'+id+':'+rw.pin);}}
  for(const id in o.owned)for(const sid of o.owned[id].skins){const sk=skinsOf(BY_ID[id]).find(k=>k.id===sid);if(sk&&skinHasPin(sk)){for(const pid of skinPinIds(id,sk))if(!o.pins.includes(pid))o.pins.push(pid);if(skinPinFaces(sk)){const old='sk:'+id+':'+sid,i=o.pins.indexOf(old);if(i>=0)o.pins.splice(i,1);const me=o.owned[id];if(Array.isArray(me.pinSlots))me.pinSlots=me.pinSlots.map(p=>p===old?old+':happy':p);}}}
  {const ok=p=>typeof p==='string'&&(o.pins.includes(p)||BASIC_PINS.some(q=>q[0]===p));
   if(!Array.isArray(s.customPins)){const sel=o.owned[o.selected]||Object.values(o.owned)[0];o.customPins=[null,null];if(sel&&Array.isArray(sel.pinSlots)){let k=0;for(const p of sel.pinSlots)if(p&&!pinPersonal(p)&&k<2)o.customPins[k++]=p;}}
   else o.customPins=[0,1].map(k=>ok(s.customPins[k])&&!pinPersonal(s.customPins[k])?s.customPins[k]:null);
   for(const id in o.owned){const me=o.owned[id];me.facePins=Array.isArray(me.facePins)?[0,1,2].map(k=>ok(me.facePins[k])&&pinAllowedFor(me.facePins[k],id)?me.facePins[k]:null):[null,null,null];
     if(Array.isArray(me.pinSlots))for(const p of me.pinSlots)if(p&&pinPersonal(p)&&pinAllowedFor(p,id)&&!me.facePins.includes(p)){const k=me.facePins.indexOf(null);if(k>=0)me.facePins[k]=p;}}}
  if(!Number.isInteger(o.seed)||o.seed<=0)o.seed=1+Math.floor(Math.random()*2e9);
  /* Only Grandmaster stays on Ember: lower rank skins move off Ember onto that rank's random rumbler */
  {const lowRk=RANK_SETS.slice(0,-1).map(rs=>rs.skin.id),em=o.owned[STARTER];
   if(em){em.skins=em.skins.filter(x=>!lowRk.includes(x));if(lowRk.includes(em.skin))em.skin='classic';if(Array.isArray(em.pinSlots))em.pinSlots=em.pinSlots.map(p=>p&&lowRk.some(r=>p.startsWith('sk:'+STARTER+':'+r))?null:p);}
   o.pins=o.pins.filter(p=>!lowRk.some(r=>p===('sk:'+STARTER+':'+r)||p.startsWith('sk:'+STARTER+':'+r+':')));
   o.pendingSkins=o.pendingSkins.filter(x=>!lowRk.some(r=>x===STARTER+':'+r));}
  for(const[k,rs]of RANK_SETS.entries()){const got=rs.idx===0?(o.rpBest>0||o.rankClaimed>0):o.rankClaimed>=rs.idx;if(got){if(!o.pins.includes(rs.pin))o.pins.push(rs.pin);const rid=rankSetRumbler(k,rankSeed(o)),e=o.owned[rid];if(e){if(!e.skins.includes(rs.skin.id))e.skins.push(rs.skin.id);}else if(!o.pendingSkins.includes(rid+':'+rs.skin.id))o.pendingSkins.push(rid+':'+rs.skin.id);}}o.onboarded=!!s.onboarded;o.sound=s.sound!==false;o.music=s.music!==false;o.voice=s.voice!==false;o.shake=s.shake!==false;
  return o;
}
let S=loadSave();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
/* Daily deal skins come from every rumbler, not just the ones you own */
/* Daily skins price: the first one is the featured deal (50% off), the rest are full price */
function dailySkinMult(id,sid){const i=(S.daily.dealSkins||[]).findIndex(([r,s])=>r===id&&s===sid);return i<0?null:i===0?.5:1;}
function hasSkin(id,sid){return S.owned[id]?S.owned[id].skins.includes(sid):S.pendingSkins.includes(id+':'+sid);}
function dailySkinPicks(h){const pool=[];for(const b of RUMBLERS)for(const sk of skinsOf(b))if(sk.tier!==0&&!earnOnly(sk)&&!ALWAYS_SKIN(sk)&&!hasSkin(b.id,sk.id))pool.push([b.id,sk.id]);
  const picks=[],used=new Set();let x=h;const mineP=pool.filter(([id])=>S.owned[id]);for(let i=0;i<2&&mineP.length;i++){x=Math.imul(x^(x>>>13),2654435761)>>>0;const pk=mineP.splice(x%mineP.length,1)[0];if(used.has(pk[0]))continue;used.add(pk[0]);picks.push(pk);pool.splice(pool.findIndex(q=>q[0]===pk[0]&&q[1]===pk[1]),1);}
  for(let i=0;i<80&&picks.length<11&&pool.length;i++){x=Math.imul(x^(x>>>13),2654435761)>>>0;const j=x%pool.length,[rid]=pool[j];if(used.has(rid))continue;used.add(rid);picks.push(pool.splice(j,1)[0]);}return picks;}
/* Daily pin shop: one free pin from anywhere (not skin-set or ranked pins), plus 6 pins to buy. All of it changes every day. */
function dailyPinPicks(h){let x=h;const rnd=n=>{x=Math.imul(x^(x>>>15),2246822519)>>>0;return x%n;};
  const freePool=SHOP_PINS().concat(PASS_PINS).map(p=>p[0]).filter(id=>!S.pins.includes(id));const free=freePool.length?freePool[rnd(freePool.length)]:null;
  const pool=SHOP_PINS().map(p=>p[0]).filter(id=>!S.pins.includes(id)&&id!==free),out=[];while(out.length<15&&pool.length)out.push(pool.splice(rnd(pool.length),1)[0]);return{v:3,free,pins:out};}
function ensureDaily(){
  const k=todayKey();
  /* one-time fix: older versions could keep showing the same rumbler, so swap today's unbought offer for a fresh one */
  if(!S.offerV){S.offerV=2;if(S.daily.date===k&&S.daily.offer&&!S.daily.offer.bought){S.daily.offer=pickOffer(k,S.daily.offer.id);persist();}}
  if(S.daily.date===k&&(!S.daily.pinShop||S.daily.pinShop.v!==3)){S.daily.pinShop=dailyPinPicks(hashStr(k+'pins'));persist();}
  if(S.daily.date===k){if((S.dealV||0)<4){S.dealV=4;S.daily.dealSkins=dailySkinPicks(hashStr(k+'deals'));persist();}return;}
  S.dealV=4;
  const prevOffer=S.daily.offer?S.daily.offer.id:null;
  const h=hashStr(k+S.name.length);
  const picks=dailySkinPicks(h);
  S.daily={date:k,claimed:false,dealSkins:picks,bought:[],gift:h%3,offer:pickOffer(k,prevOffer),pinShop:dailyPinPicks(hashStr(k+'pins'))};
  persist();
}

/* sight: how far they notice you · focus: how hard they go for weak targets · strafe: side-stepping in fights
   sup / gad: how quickly they use a ready super or gadget (checks per second) */
const SKILL={
  easy:{aimErr:.32,react:.6,dodge:.12,lead:.15,fire:[.7,1.2],retreat:.15,sight:520,focus:.4,strafe:.6,sup:1,gad:1},
  normal:{aimErr:.17,react:.38,dodge:.35,lead:.55,fire:[.45,.85],retreat:.25,sight:620,focus:.8,strafe:.85,sup:3,gad:2},
  hard:{aimErr:.08,react:.22,dodge:.65,lead:.9,fire:[.28,.55],retreat:.32,sight:680,focus:1,strafe:1,sup:8,gad:2.5},
  insane:{aimErr:.035,react:.12,dodge:.88,lead:1,fire:[.18,.35],retreat:.35,sight:740,focus:1.2,strafe:1,sup:20,gad:3},
};
/* Opponent skill in normal matches follows your trophies. Each tier creeps a little toward the next one as you climb it. */
const OPP_TIERS=[
  {at:0,name:'Rookie',col:'#8be28b',note:'Miss a lot, barely dodge and are slow to use supers.',
   sk:{aimErr:.42,react:.8,dodge:.04,lead:.05,fire:[.9,1.5],retreat:.1,sight:440,focus:.2,strafe:.3,sup:.5,gad:.4}},
  {at:300,name:'Skilled',col:'#5ec8ff',note:'Aim better, start dodging and use their supers.',
   sk:{aimErr:.28,react:.55,dodge:.2,lead:.32,fire:[.65,1.1],retreat:.18,sight:520,focus:.45,strafe:.55,sup:1.2,gad:.9}},
  {at:500,name:'Expert',col:'#ffb547',note:'Lead their shots, dodge often and use supers and gadgets well.',
   sk:{aimErr:.11,react:.27,dodge:.58,lead:.82,fire:[.34,.64],retreat:.3,sight:680,focus:1,strafe:.95,sup:5,gad:2.2}},
  {at:1000,name:'Pro',col:'#ff5e87',note:'Genuinely good, like strong real players: sharp aim, constant dodging, focus fire and smart retreats.',
   sk:{aimErr:.042,react:.13,dodge:.86,lead:1,fire:[.2,.38],retreat:.36,sight:760,focus:1.4,strafe:1,sup:14,gad:3}},
  {at:5000,name:'Hell',col:'#ff2a2a',note:'Every game is hell: perfect-aim opponents with 35% more health and 20% more damage.',
   sk:{aimErr:.012,react:.06,dodge:.97,lead:1,fire:[.12,.24],retreat:.4,sight:850,focus:1.6,strafe:1,sup:40,gad:5}},
];
function oppTier(t){let i=0;for(let k=0;k<OPP_TIERS.length;k++)if(t>=OPP_TIERS[k].at)i=k;return i;}
function oppSkill(t){
  const i=oppTier(t),a=OPP_TIERS[i].sk,n=OPP_TIERS[i+1];if(!n)return{...a,fire:a.fire.slice()};
  const f=.35*clamp((t-OPP_TIERS[i].at)/(n.at-OPP_TIERS[i].at),0,1),b=n.sk,o={};
  for(const k in a)o[k]=Array.isArray(a[k])?a[k].map((v,j)=>v+(b[k][j]-v)*f):a[k]+(b[k]-a[k])*f;
  return o;
}
/* Ranked: each rank tier is harder. Master is meant to be brutal. */
const SKILL_GODLIKE={aimErr:.025,react:.09,dodge:.93,lead:1,fire:[.15,.3],retreat:.38,sight:800,focus:1.5,strafe:1,sup:25,gad:4};
const SKILL_HELL={aimErr:.012,react:.06,dodge:.97,lead:1,fire:[.12,.24],retreat:.4,sight:850,focus:1.6,strafe:1,sup:40,gad:5};
const SKILL_ULTRA={aimErr:.018,react:.075,dodge:.95,lead:1,fire:[.13,.27],retreat:.39,sight:820,focus:1.55,strafe:1,sup:32,gad:4.5};
const RANK_FOES=()=>[OPP_TIERS[0].sk,OPP_TIERS[1].sk,OPP_TIERS[2].sk,OPP_TIERS[3].sk,SKILL.insane,SKILL_GODLIKE,SKILL_ULTRA,SKILL_HELL];
const RANK_FOE_NAMES=['Easy','Easy-ish','Kind of hard','Hard','Pretty hard','Really hard','Complete hell'];
/* small per-bot differences so a lobby doesn't feel like clones */
function varySkill(sk){const m=rand(.88,1.12);return{...sk,aimErr:sk.aimErr*m,react:sk.react*rand(.9,1.1),dodge:clamp(sk.dodge*(2-m),0,.95),fire:sk.fire.slice()};}

/* ---------- Map system ---------- */
const TILE=50,COLS=20,ROWS=32,MW=COLS*TILE,MH=ROWS*TILE,ZX=MW/2,ZY=MH/2;
const WALL=new Uint8Array(COLS*ROWS),BUSH=new Uint8Array(COLS*ROWS);
let MAP=null;
const fieldCache=new Map();
function loadMap(id){
  MAP=MAPS[id];const top=MAP.top,grid=top.concat(top.slice().reverse().map(r=>r.split('').reverse().join('')));
  WALL.fill(0);BUSH.fill(0);
  grid.forEach((row,r)=>{for(let c=0;c<COLS;c++){if(row[c]==='#')WALL[r*COLS+c]=1;else if(row[c]==='b')BUSH[r*COLS+c]=1;}});
  fieldCache.clear();
}
loadMap('yard');
function isWall(x,y){const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||r<0||c>=COLS||r>=ROWS)return true;return WALL[r*COLS+c]===1;}
function inBush(x,y){const c=Math.floor(x/TILE),r=Math.floor(y/TILE);if(c<0||r<0||c>=COLS||r>=ROWS)return false;return BUSH[r*COLS+c]===1;}
function hitsWall(x,y,r){
  if(x-r<0||y-r<0||x+r>MW||y+r>MH)return true;
  const c0=Math.floor((x-r)/TILE),c1=Math.floor((x+r)/TILE),r0=Math.floor((y-r)/TILE),r1=Math.floor((y+r)/TILE);
  for(let rr=r0;rr<=r1;rr++)for(let cc=c0;cc<=c1;cc++){if(rr<0||cc<0||rr>=ROWS||cc>=COLS)continue;if(WALL[rr*COLS+cc]){const nx=clamp(x,cc*TILE,cc*TILE+TILE),ny=clamp(y,rr*TILE,rr*TILE+TILE);if((x-nx)**2+(y-ny)**2<r*r)return true;}}
  return false;
}
function los(x1,y1,x2,y2){const d=dist(x1,y1,x2,y2),n=Math.ceil(d/12);for(let i=1;i<n;i++){const t=i/n;if(isWall(x1+(x2-x1)*t,y1+(y2-y1)*t))return false;}return true;}
function losWide(x1,y1,x2,y2,r){const d=dist(x1,y1,x2,y2)||1,nx=-(y2-y1)/d*r,ny=(x2-x1)/d*r;return los(x1,y1,x2,y2)&&los(x1+nx,y1+ny,x2+nx,y2+ny)&&los(x1-nx,y1-ny,x2-nx,y2-ny);}
function rayLen(x,y,a,max){const cx=Math.cos(a),sy=Math.sin(a);for(let d=10;d<=max;d+=8)if(isWall(x+cx*d,y+sy*d))return d;return max;}
function openPoint(cx,cy,r0,r1){for(let i=0;i<16;i++){const a=rand(0,TAU),r=rand(r0,r1),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(!hitsWall(x,y,26))return[x,y];}return[cx,cy];}
function tileIdx(x,y){return clamp(Math.floor(y/TILE),0,ROWS-1)*COLS+clamp(Math.floor(x/TILE),0,COLS-1);}
function nearestOpen(i){if(!WALL[i])return i;const c=i%COLS,r=(i/COLS)|0;for(let d=1;d<6;d++)for(let dr=-d;dr<=d;dr++)for(let dc=-d;dc<=d;dc++){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(!WALL[ni])return ni;}return i;}
function field(gi){
  let f=fieldCache.get(gi);if(f)return f;
  f=new Int16Array(COLS*ROWS).fill(-1);const q=new Int16Array(COLS*ROWS);let h=0,t=0;f[gi]=0;q[t++]=gi;
  while(h<t){const i=q[h++],c=i%COLS,r=(i/COLS)|0;
    for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(WALL[ni]||f[ni]>=0)continue;f[ni]=f[i]+1;q[t++]=ni;}}
  fieldCache.set(gi,f);return f;
}
function steer(u,gx,gy){
  const d0=dist(u.x,u.y,gx,gy);if(d0<6)return[0,0];
  if(losWide(u.x,u.y,gx,gy,u.rad*.9))return[(gx-u.x)/d0,(gy-u.y)/d0];
  const f=field(nearestOpen(tileIdx(gx,gy))),si=tileIdx(u.x,u.y),c=si%COLS,r=(si/COLS)|0;
  let best=-1,bv=f[si]>=0?f[si]:9999;
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    if(!dr&&!dc)continue;const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=COLS||nr>=ROWS)continue;const ni=nr*COLS+nc;if(WALL[ni])continue;
    if(dr&&dc&&(WALL[r*COLS+nc]||WALL[nr*COLS+c]))continue;const v=f[ni];if(v>=0&&v<bv){bv=v;best=ni;}}
  if(best<0)return[(gx-u.x)/d0,(gy-u.y)/d0];
  const tx=(best%COLS)*TILE+TILE/2,ty=((best/COLS)|0)*TILE+TILE/2,d=dist(u.x,u.y,tx,ty)||1;
  return[(tx-u.x)/d,(ty-u.y)/d];
}

/* ---------- Granting & Rumble Drops ---------- */
function ownedIcons(){const out=[];for(const id in S.owned)out.push('r:'+id);for(const n of TROPHY_ICONS)if((S.best|0)>=n)out.push('t:'+n);
  for(const id in S.owned)for(const sid of S.owned[id].skins){const sk=skinsOf(BY_ID[id]).find(k=>k.id===sid);if(sk&&(ICON_SKIN_TIERS.includes(sk.tier)||sk.ultraFx))out.push('s:'+id+':'+sid);}
  S.rankTop=Math.max(S.rankTop|0,rankInfo(S.rp|0).tier,rankInfo(S.rankPeak|0).tier);for(let t=0;t<=Math.min(7,S.rankTop);t++)out.push('k:'+t);
  for(const x of S.icons||[])out.push('x:'+x);return out;}
function playerCode(){const pid=myPid();let h=2166136261;for(const ch of pid)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<6;i++){o+=A[h%A.length];h=((Math.floor(h/A.length)^Math.imul(h,2654435761))>>>0);}return o;}
function grantRumbler(id){
  if(S.owned[id])return false;S.owned[id]=newRumbler();if(S.masterAll&&!S.owned[id].skins.includes('master'))S.owned[id].skins.push('master');const keep=[];
  for(const k of S.pendingSkins){const[rid,skid]=k.split(':');if(rid===id){if(!S.owned[id].skins.includes(skid))S.owned[id].skins.push(skid);}else keep.push(k);}
  S.pendingSkins=keep;return true;
}
/* Save codes: your whole save as text you can paste into any new version of the game */
function saveCode(){const b64=btoa(unescape(encodeURIComponent(JSON.stringify(S))));return 'RR1.'+b64+'.'+hashStr(b64).toString(36);}
function readCode(code){const m=String(code||'').replace(/\s+/g,'').match(/^RR1\.([A-Za-z0-9+/=]+)\.([a-z0-9]+)$/);if(!m)return{err:'That doesn\u2019t look like a save code. It should start with RR1.'};
  if(hashStr(m[1]).toString(36)!==m[2])return{err:'That code is damaged or cut off. Copy the whole code and try again.'};
  try{const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));if(!o||typeof o!=='object'||!o.owned)throw 0;return{save:loadSave(o)};}catch(e){return{err:'That code couldn\u2019t be read.'};}}
function grantPrestige(id,m,r){const rw=PRESTIGE_REWARDS[m],me=S.owned[id];if(!rw||!me)return;me.prClaim=Math.max(me.prClaim||0,m);
  if(rw.skin&&!me.skins.includes(rw.skin))me.skins.push(rw.skin);if(rw.pin){const pid='pr:'+id+':'+rw.pin;if(!S.pins.includes(pid))S.pins.push(pid);}
  if(r){S.coins+=rw.coins;S.pp+=rw.pp;for(const d of rw.drops)for(let k=0;k<d.n;k++)S.drops.push({r:d.r,min:null});r.prestigeReward={id,m,...rw};}}
/* Skin and prestige pins only work for their own rumbler; set pins only for the rumbler whose skin they came with */
function grantRankSet(k){const rs=RANK_SETS[k];grantSkin(rankSetRumbler(k,rankSeed(S)),rs.skin.id);if(!S.pins.includes(rs.pin))S.pins.push(rs.pin);}
function skinPinIds(id,sk){const f=skinPinFaces(sk);return f?f.map(x=>'sk:'+id+':'+sk.id+':'+x):['sk:'+id+':'+sk.id];}
function grantSkinPin(id,skid){const sk=getSkin(BY_ID[id],skid);if(sk&&sk.id===skid&&skinHasPin(sk))for(const pid of skinPinIds(id,sk))if(!S.pins.includes(pid))S.pins.push(pid);}
function grantSkin(id,skid){grantSkinPin(id,skid);const me=S.owned[id];if(me){if(!me.skins.includes(skid))me.skins.push(skid);}else if(!S.pendingSkins.includes(id+':'+skid))S.pendingSkins.push(id+':'+skid);}
function rollDropRarity(start){let i=Math.max(0,DROP_RAR.indexOf(start||'rare'));while(i<DROP_RAR.length-1&&Math.random()<DROP_UP[i])i++;return DROP_RAR[i];}
function winDropPlan(){const k=todayKey();if(S.dropDay.date!==k)S.dropDay={date:k,n:0};const D=S.dropDay;
  if(!Array.isArray(D.plan)||D.plan.length!==WIN_DROPS_PER_DAY){D.plan=Array.from({length:WIN_DROPS_PER_DAY},()=>rollWinDrop()||'rare');D.pv=0;}
  /* every day: one guaranteed Starfall drop and one Rumbler Box among the 5 win drops */
  if(D.pv!==2){D.pv=2;const open=[];for(let i=(D.n|0);i<WIN_DROPS_PER_DAY;i++)open.push(i);shuffle(open);
    const take=v=>{if(D.plan.includes(v))return;const i=open.findIndex(j=>D.plan[j]!=='season'&&D.plan[j]!=='rbox');if(i>=0){D.plan[open[i]]=v;open.splice(i,1);}};take('season');take('rbox');}
  persist();return D.plan;}
function rollWinDrop(){if(halloweenOn()&&Math.random()<.08)return pick(SPOOKY);let x=Math.random()*100;for(const[r,p]of WIN_DROP_LUCKY){if(x<p)return r;x-=p;}return null;}
function pickWeighted(list){const tot=list.reduce((n,e)=>n+e[1],0);let x=Math.random()*tot;for(const e of list){x-=e[1];if(x<0)return e;}return list[list.length-1];}
/* Starfall (seasonal) drops: better than Amazing. Starfall skins and pins, currencies and pass tokens. Never rumblers. */
const SEASON_LOOT=[['skin',24],['pin',14],['coins',16,[800,2000]],['gems',12,[40,100]],['pp',14,[500,1100]],['chromos',12,[1200,3000]],['pass',12,[120,280]]];
function openSeasonDrop(){const e=pickWeighted(SEASON_LOOT),res={rar:'season',start:'season',kind:e[0]};
  if(e[0]==='skin'){const ids=RUMBLERS.map(b=>b.id).filter(id=>!hasSkin(id,'starfall'));const mine=ids.filter(id=>S.owned[id]);const pool=mine.length?mine:ids;
    if(pool.length){const id=pick(pool);grantSkin(id,'starfall');res.id=id;res.skid='starfall';}else{res.kind='gems';res.n=60;res.note='You own every Starfall skin, so it became gems';}}
  else if(e[0]==='pin'){const pool=PASS_PINS.concat(SEASON_PINS).map(x=>x[0]).filter(x=>!S.pins.includes(x));if(pool.length){res.pin=pick(pool);S.pins.push(res.pin);}else{res.kind='gems';res.n=40;res.note='You own every Starfall pin, so it became gems';}}
  else{res.n=randi(e[2][0],e[2][1]);res.n=Math.round(res.n/5)*5;if(e[0]==='pass'){S.pass.xp+=res.n;}else S[e[0]]+=res.n;}
  if(res.kind==='gems'&&res.note)S.gems+=res.n;persist();return res;}
/* Halloween drops: Halloween skins and pins, other skins, power points, pass tokens, coins, gems */
function grantHwSkin(res){const pairs=[];for(const b of RUMBLERS)for(const hs of HALLOWEEN_SKINS)if(!hasSkin(b.id,hs.id))pairs.push([b.id,hs.id]);const mine=pairs.filter(p=>S.owned[p[0]]),pool=mine.length?mine:pairs;
  if(!pool.length)return false;const[id,sk]=pick(pool);grantSkin(id,sk);res.kind='skin';res.id=id;res.skid=sk;return true;}
function grantAnySkin(res){const pool=[];for(const id in S.owned)for(const sk of skinsOf(BY_ID[id]))if(sk.tier!==0&&!earnOnly(sk)&&!ALWAYS_SKIN(sk)&&!hasSkin(id,sk.id))pool.push([id,sk.id]);if(!pool.length)return false;const[id,sk]=pick(pool);grantSkin(id,sk);res.kind='skin';res.id=id;res.skid=sk;return true;}
function grantHwPin(res){const pool=HALLOWEEN_PINS.map(x=>x[0]).filter(x=>!S.pins.includes(x));if(!pool.length)return false;res.kind='pin';res.pin=pick(pool);S.pins.push(res.pin);return true;}
function openSpookyDrop(r){if(halloweenOn())S.hw.opened=(S.hw.opened|0)+1;const e=pickWeighted(SPOOKY_LOOT),res={rar:r,start:r,kind:e[0]};
  const ok=e[0]==='hskin'?grantHwSkin(res):e[0]==='skin'?grantAnySkin(res):e[0]==='hpin'?grantHwPin(res):null;
  if(ok===false){res.kind='pp';res.n=500;S.pp+=500;res.note='Nothing new left there, so it became power points';}
  else if(ok===null){res.n=Math.round(randi(e[2][0],e[2][1])/5)*5;if(e[0]==='pass')S.pass.xp+=res.n;else S[e[0]]+=res.n;}
  persist();return res;}
function knocksLeft(){return S.hw.knocks|0;}
function tokensLeft(){return Math.max(0,Math.floor((S.hw.wins|0)/KNOCK_EVERY)-(S.hw.spent|0));}
function spendToken(choice){if(tokensLeft()<=0)return null;S.hw.spent++;if(choice==='knock'){S.hw.knocks++;persist();return{kind:'knock'};}const r=pick(SPOOKY);S.drops.push({r,min:null});persist();return{kind:'spooky',r};}
function hwDoors(){if(!S.hw.doors){S.hw.doors=shuffle(RUMBLERS.filter(b=>!b.random).map(b=>b.id)).slice(0,6);persist();}return S.hw.doors;}
/* Knock on a door: a skin, a drop, a guaranteed drop, a Halloween skin or pin, or a Halloween drop */
function knockDoor(i){if(knocksLeft()<=0)return null;S.hw.knocks--;S.hw.used++;const who=hwDoors()[i],e=pickWeighted(KNOCK_LOOT),res={who,kind:e[0]};
  if(e[0]==='skin'&&!grantAnySkin(res))e[0]='hskin';
  if(e[0]==='hskin'&&!grantHwSkin(res))e[0]='hpin';
  if(e[0]==='hpin'&&!grantHwPin(res))e[0]='spooky';
  if(e[0]==='drop'){S.drops.push({r:null,min:null});res.kind='drop';}
  else if(e[0]==='gdrop'){const r=pickWeighted([['epic',5],['mythic',4],['legendary',2]])[0];S.drops.push({r,min:null,g:1});res.kind='gdrop';res.r=r;}
  else if(e[0]==='spooky'){const r=pick(SPOOKY);S.drops.push({r,min:null});res.kind='spooky';res.r=r;}
  else if(e[0]==='coins'||e[0]==='pp'){res.kind=e[0];res.n=e[0]==='coins'?Math.round(randi(400,1200)/10)*10:Math.round(randi(250,700)/10)*10;S[e[0]]+=res.n;}
  else if(e[0]==='trick'){res.kind='trick';}
  const pool=RUMBLERS.filter(b=>!b.random&&!S.hw.doors.includes(b.id));S.hw.doors[i]=pick(pool).id;persist();return res;}
function claimDark(){if(S.owned.dark||(S.hw.opened|0)<DARK_DROPS)return false;grantRumbler('dark');S.hw.darkClaimed=1;persist();return true;}
/* Rumbler Box: a guaranteed rumbler (mostly Rare/Epic/Mythic, Legendary is rare) plus resources.
   Skin Box: two guaranteed skins plus resources. Both show a reward counter while you open them. */
function grantBoxRumbler(){const w=[['rare',35],['epic',35],['mythic',22],['legendary',7],['ultra',1]],free=b=>!S.owned[b.id]&&!eventLocked(b);
  const avail=w.filter(([r])=>RUMBLERS.some(b=>b.rarity===r&&free(b)));
  if(!avail.length){const n=Math.round(randi(2000,6000)/50)*50;S.chromos+=n;return{kind:'chromos',n,note:'You own every rumbler, so it became chromos'};}
  const r=pickWeighted(avail)[0],b=pick(RUMBLERS.filter(x=>x.rarity===r&&free(x)));grantRumbler(b.id);return{kind:'rumbler',id:b.id};}
function openBox(kind){const items=[],R=[['coins',[300,900]],['pp',[200,600]],['gems',[10,30]],['chromos',[500,1500]]];
  /* Rumbler Box: 7 rewards guaranteed, and each lucky roll adds one more (up to 10). Skin Box: 4 rewards. */
  let extra=kind==='rbox'?6:2;if(kind==='rbox')while(extra<9&&Math.random()<.35)extra++;
  for(let i=0;i<extra;i++){const[k,[a,b]]=R[Math.floor(Math.random()*R.length)];let n=randi(a,b);if(n>=50)n=Math.round(n/10)*10;S[k]+=n;items.push({kind:k,n});}
  if(kind==='rbox'&&Math.random()<.3){const it={};if(grantAnySkin(it))items.push(it);}
  if(kind==='rbox'&&Math.random()<.25){const left=SPECIAL_ICONS.map(x=>x[0]).filter(x=>!(S.icons||[]).includes(x));if(left.length){const ic=pick(left);(S.icons||(S.icons=[])).push(ic);items.push({kind:'icon',icon:ic});}}
  if(kind==='rbox')items.push(grantBoxRumbler());
  else for(let i=0;i<2;i++){const it={};if(grantAnySkin(it))items.push(it);else{S.gems+=40;items.push({kind:'gems',n:40,note:'You own every skin, so it became gems'});}}
  persist();return{rar:kind,start:kind,kind:'box',items,idx:0};}
function openDrop(d){
  if(d&&BOXES.includes(d.r))return openBox(d.r);
  if(d&&SPOOKY.includes(d.r))return openSpookyDrop(d.r);
  if(d&&d.r==='season')return openSeasonDrop();
  const start=d.r||d.min||'rare',rar=rollDropRarity(start),e=pickWeighted(DROP_LOOT[rar]),res={rar,start,kind:e[0]};
  if(e[0]==='rumbler'){const pool=RUMBLERS.filter(b=>!S.owned[b.id]&&e[2].includes(b.rarity)&&!eventLocked(b));
    if(pool.length){const b=pick(pool);grantRumbler(b.id);res.id=b.id;}
    else{res.kind='chromos';res.n=Math.round(RARITY[e[2][e[2].length-1]].chromos*.25);res.note='You already own every '+e[2].map(x=>RARITY[x].name).join(' and ')+' rumbler, so it became chromos';}}
  else if(e[0]==='skin'){const pool=[];for(const id in S.owned)for(const sk of skinsOf(BY_ID[id]))if(sk.tier!==0&&!earnOnly(sk)&&!S.owned[id].skins.includes(sk.id))pool.push([id,sk.id]);
    if(pool.length){const[id,skid]=pick(pool);grantSkin(id,skid);res.id=id;res.skid=skid;}else{res.kind='gems';res.n=30;res.note='You own every skin, so it became gems';}}
  else{const v=randi(e[2][0],e[2][1]);res.n=e[2][0]>=50?Math.round(v/5)*5:v;}
  if(res.kind!=='rumbler'&&res.kind!=='skin')S[res.kind]+=res.n;
  persist();return res;
}
/* A new rumbler every day, picked from the date, never the same one two days in a row */
function pickOffer(k,prev){
  let el=RUMBLERS.filter(b=>!S.owned[b.id]&&!RARITY[b.rarity].passOnly&&b.rarity!=='common'&&!eventLocked(b));if(!el.length)return null;
  if(prev&&el.length>1)el=el.filter(b=>b.id!==prev);
  return{id:el[hashStr(k+'|offer')%el.length].id,bought:false};
}

/* ---------- Match state ---------- */
let M=null,P=null,paused=false,uid=0;
const BOT_BASE=['Kestrel','Mopsy','Zap','Dottie','Grit','Bix','Tumble','Rue','Ozzy','Pell','Juno','Hazel','Fen','Wobble','Pix','Tilly','Brook','Milo','Ziggy','Pepper','Nacho','Biscuit','Waffle','Pickle','Noodle','Mango','Toast','Bean','Sunny','Rocket','Blip','Dash','Echo','Fizzy','Gizmo','Hopper','Jinx','Kiwi','Lumen','Maple','Nugget','Orbit','Pogo','Quinn','Rascal','Scout','Taco','Ufo','Vortex','Wren','Yoyo','Zest','Ash','Bolt','Cleo','Duke','Ember','Frost','Gus','Indie'];
const BOT_ADJ=['Sneaky','Mega','Tiny','Turbo','Lucky','Spicy','Shadow','Cosmic','Super','Silent','Hyper','Crazy','Royal','Pixel','Icy','Blazing','Golden','Wild','Epic','Fluffy','Rapid','Dark','Neon','Toxic','Sly'];
const BOT_NOUN=['Ninja','Gamer','Panda','Wolf','Tiger','Fox','Dragon','Shark','Knight','Wizard','Pirate','Robot','Viking','Ghost','Falcon','Bandit','Raccoon','Penguin','Llama','Goblin','Comet','Storm','Racer','Hero','King','Queen','Boss','Pro','Beast','Cat'];
function botName(){const r=Math.random(),n=pick(BOT_BASE),a=pick(BOT_ADJ),o=pick(BOT_NOUN),d=randi(1,99),y=randi(10,99),x=pick(['x','_','']);
  if(r<.18)return n;if(r<.34)return a+o;if(r<.46)return n+d;if(r<.56)return a+'_'+n;if(r<.66)return x+o+y+x;if(r<.74)return 'The'+a+o;if(r<.82)return n.toLowerCase()+'.'+o.toLowerCase();if(r<.9)return o+'Lord'+d;return a+o+y;}
const BOT_NAMES={slice(){const s=new Set();while(s.size<12)s.add(botName().slice(0,14));return[...s];}};
function unitMods(star){const m={hp:0,dmg:0,speed:0,reloadspd:0,charge:0,regen:0,lifesteal:0,range:0,tossplus:0,selfish:0,kind:0,splash:0,slowplus:0,chainplus:0,turretplus:0,split6:0,lodge:0,maxsteal:0,shadows:0,shadowlife:0,zoneplus:0,darkvenom:0,darkheal:0};const g=star&&gearById(star);if(g&&g.type in m)m[g.type]=g.val;return m;}
/* Trick: everything random, never the same pick twice in a row */
const pickNew=(list,prev)=>{const l=list.length>1?list.filter(x=>x!==prev):list;return l[Math.floor(Math.random()*l.length)];};
/* What Trick can roll depends on his level: 1-4 common to epic, 5-10 adds mythic and legendary, 11 is everything (Amazing and Pass rumblers too) */
function trickRarities(lvl){return lvl>=11?null:lvl>=5?['common','rare','epic','mythic','legendary']:['common','rare','epic'];}
const trickOk=(u,b)=>{const r=trickRarities(u.lvl);return!b.random&&(!r||r.includes(b.rarity));};
const TRICK_SRC=u=>RUMBLERS.filter(x=>trickOk(u,x));
function trickRarList(u){const l=[];for(const b of TRICK_SRC(u))if(!l.includes(b.rarity))l.push(b.rarity);return ORDER_RAR.filter(r=>l.includes(r));}
const ORDER_RAR=['common','rare','epic','mythic','legendary','ultra','celestial'];
function forceTrickAtk(u,r){const pool=TRICK_SRC(u).filter(b=>b.rarity===r);if(!pool.length)return;const b=pickNew(pool,u.trickAtk);u.trickAtk=b;u.b.atk=b.atk;u.rerollA=0;
  textFx(u.x,u.y-u.rad-40,RARITY[r].name+': '+b.atkName,RARITY[r].col,13);ringFx(u.x,u.y,u.rad,u.rad*3,.4,RARITY[r].col,6);}
function trickAtk(u){const b=pickNew(TRICK_SRC(u),u.trickAtk);u.trickAtk=b;u.b.atk=b.atk;}
function trickSup(u){const b=pickNew(TRICK_SRC(u),u.trickSup);u.trickSup=b;u.b.sup=b.sup;}
function trickGadget(u){const all=[];for(const k in GEAR)if(BY_ID[k]&&trickOk(u,BY_ID[k]))all.push(...GEAR[k].g);u.gadget=pickNew(all,u.gadget);}
function trickStar(u){const all=[];for(const k in GEAR)if(BY_ID[k]&&trickOk(u,BY_ID[k]))all.push(...GEAR[k].s);u.star=pickNew(all,u.star);u.mods=unitMods(u.star.id);u.baseDmg=u.mul*(1+u.mods.dmg);u.dmgMul=u.baseDmg*(1+(u.cubes||0)*.1);}
function trickReroll(u){trickAtk(u);trickSup(u);if(!u.trickPick)trickGadget(u);trickStar(u);u.gUses=3;if(u===P&&M)textFx(u.x,u.y-u.rad-40,u.trickAtk.atkName+' · '+u.trickSup.supName,'#ff9bf0',12);}
/* Bots mostly wear normal skins; earned skins (ranked, charged, supercharged, master) are rare sightings */
function botSkinWeight(sk){if(sk.supercharged)return .12;if(sk.charged)return .35;if(sk.tier==='master')return .15;if(sk.tier==='rank')return .5;if(sk.tier==='prestige')return 1;if(sk.tier==='pass')return 1.5;if(sk.tier==='troll')return 2;if(sk.tier==='power')return .25;if(sk.tier==='golden')return .6;
  return sk.tier===0?30:sk.tier===1?10:sk.tier===2?6:sk.tier===3?3:sk.tier==='sig'?5:4;}
function botSkin(b){const l=skinsOf(b).map(sk=>[sk.id,botSkinWeight(sk)]);return pickWeighted(l)[0];}
function makeUnit(b,skinId,team,o){
  const mods=unitMods(o.star),lvl=o.lvl||1,mul=mulFor(lvl);
  const u={id:++uid,b,sk:getSkin(b,skinId),team,name:o.name,isPlayer:!!o.player,lvl,mul,dmgMul:mul*(1+mods.dmg),mods,rad:b.rad,
    maxHp:Math.round(b.hp*mul*(1+mods.hp)),hp:0,x:o.spawn[0],y:o.spawn[1],vx:0,vy:0,aim:o.spawn[1]>MH/2?-Math.PI/2:Math.PI/2,
    ammo:3,atkCd:0,super:0,dead:false,respawn:0,shield:1.5,flash:0,lastHurt:-9,lastAttack:-9,dash:null,kb:null,pending:[],hidden:false,moving:false,
    kills:0,deaths:0,dmgDone:0,spawn:o.spawn,phase:Math.random()*6,slowT:0,stunT:0,markT:0,guardT:0,boostT:0,poisonT:0,poisonTick:0,poisonDmg:0,poisonSrc:null,
    damT:0,damSpeed:0,carry:0,hasCrown:false,gadget:o.gadget?gearById(o.gadget):null,gUses:3,gCd:0,pin:null,pinT:0,pinCd:0,stepT:0,afterT:0,ghosts:[],squash:0,stolen:[],shadow:false,shadowOf:null,lifeT:0,vulnT:0,zoneT:0,zoneBoss:false,ai:null};
  if(b.random){u.b=Object.create(b);u.trickAtk=null;u.trickSup=null;u.star=null;trickAtk(u);trickSup(u);if(o.gadget==='trick-g2'){u.trickPick=true;u.gadget=gearById('trick-g2');}else trickGadget(u);trickStar(u);}
  u.maxAmmo=b.ammo||3;u.ammo=b.atk.kind==='cloudzap'?0:u.maxAmmo;u.thrown=null;u.hp=u.maxHp;u.cubes=0;u.baseHp=u.maxHp;u.baseDmg=u.dmgMul;
  if(!u.isPlayer)u.ai={skill:o.skill&&typeof o.skill==='object'?o.skill:(SKILL[o.skill]||SKILL.normal),mode:'objective',target:null,t:Math.random()*.3,strafeT:1,strafeDir:Math.random()<.5?1:-1,fireCd:.6,dodgeT:0,dvx:0,dvy:0,zp:null,stuckT:0,unstickT:0,ux:0,uy:0,lx:u.x,ly:u.y,pinCd:rand(4,10)};
  return u;
}
function makeStruct(kind,team,x,y,o){const s={id:++uid,isStruct:true,kind,team,x,y,vx:0,vy:0,rad:o.rad,hp:o.hp,maxHp:o.hp,dead:false,hidden:false,flash:0,name:o.name,owner:o.owner||null,t:o.t||0,cd:0,aim:0,dmg:o.dmg||0,reach:o.reach||0,rate:o.rate||1,lastHurt:-9};M.structs.push(s);M.ents.push(s);return s;}

function botLoadout(b,lvl){const gr=GEAR[b.id];return{gadget:lvl>=GADGET_LVL?pick(gr.g).id:null,star:lvl>=STAR_LVL?pick(gr.s).id:null};}
/* Low trophies = mostly beginner rumblers; rare ones only show up as you climb */
function botRarW(r,t){const f=Math.pow(clamp(t/1200,0,1),1.3),L={common:6,rare:5,epic:.6,mythic:.08,legendary:.01,celestial:0,ultra:0}[r];return L==null?1:L+(1-L)*f;}
function botPick(excl,t,n){let pool=RUMBLERS.filter(b=>!excl.includes(b));const out=[];n=n||pool.length;
  while(out.length<n&&pool.length){const b=pickWeighted(pool.map(x=>[x,botRarW(x.rarity,t)+1e-6]))[0];out.push(b);pool=pool.filter(x=>x!==b);}return out;}
function newMatch(opts){
  const mode=MODE_BY[opts.mode],mapId=opts.map&&MAPS[opts.map]?opts.map:opts.ranked?pick(mapPool(mode)):dailyMap(mode.id);loadMap(mapId);uid=0;
  M={mode,ranked:!!opts.ranked,units:[],structs:[],ents:[],shots:[],fields:[],items:[],cubes:[],boxes:[],elim:{},fx:[],decals:[],texts:[],score:[],time:mode.time,now:0,state:'countdown',cd:3.6,
     tick:0,zone:'empty',endT:0,result:null,place:0,reward:null,shown:false,nTeams:mode.teams||(mode.ffa?(mode.players||6):2),crown:null,storm:null,shake:0,battT:2,embers:[]};
  M.score=new Array(M.nTeams).fill(0);M.trails=[];M.mapId=mapId;
  const dr=opts.draft&&BY_ID[opts.draft.id]?opts.draft:null;
  const trial=opts.trial?BY_ID[opts.trial]:null,pb=trial||(dr?BY_ID[dr.id]:BY_ID[S.selected]),own0=S.owned[pb.id];M.draft=dr;
  const me=dr&&(dr.maxed||!own0)?(dr.maxed?{lvl:MAX_LVL,skin:own0?own0.skin:'classic',gadget:GEAR[pb.id].g[0].id,star:GEAR[pb.id].s[0].id}:(()=>{const l=S.owned[S.selected].lvl;return{lvl:l,skin:'classic',gadget:l>=GADGET_LVL?GEAR[pb.id].g[0].id:null,star:l>=STAR_LVL?GEAR[pb.id].s[0].id:null};})()):dr?own0:trial?{lvl:MAX_LVL,skin:opts.trialSkin||(own0?own0.skin:'classic'),gadget:GEAR[pb.id].g[0].id,star:GEAR[pb.id].s[0].id}:S.owned[S.selected];
  if(dr)M.maxed=!!dr.maxed;
  const plvl=me.lvl,names=shuffle(BOT_NAMES.slice());M.trial=!!trial;
  let eskill,elvl,mskill='hard';M.opp=null;
  if(M.ranked){const ri=rankInfo(S.rp).i,rt=ri>=RANK_STEPS-1?TIERS.length:Math.floor(ri/3);M.rankTier=rt;eskill=RANK_FOES()[rt];if(rt>=3)mskill=OPP_TIERS[3].sk;M.hell=rt===TIERS.length;
    elvl=()=>clamp(plvl+randi(-1,1),1,MAX_LVL);}
  else{const t=Math.max(0,S.trophies|0);eskill=oppSkill(t);M.opp=oppTier(t);if(t>=OPP_TIERS[3].at)mskill=oppSkill(t);if(t>=HELL_AT&&!opts.netHumans&&!trial){eskill=SKILL_HELL;mskill=OPP_TIERS[3].sk;M.hell=true;}
    elvl=()=>randi(1,MAX_LVL);}
  const bot=(b,team,spawn,skill,lvl)=>{const lo=botLoadout(b,lvl);return makeUnit(b,botSkin(b),team,{name:names.pop()||'Bot',skill:typeof skill==='object'?varySkill(skill):skill,lvl,spawn,gadget:lo.gadget,star:lo.star});};
  if(M.trial){
    const sp=MAP.spawns;P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp[0][1],gadget:me.gadget,star:me.star});M.units.push(P);P.super=1;
    shuffle(RUMBLERS.filter(b=>b!==pb)).slice(0,3).forEach((b,i)=>M.units.push(bot(b,1,sp[1][i],'easy',7)));
  }else if(mode.sd&&mode.size>1){
    const anc=shuffle(SD_ANCHORS[mode.teams].map(i=>MAP.ffa[i])),pool=M.ranked?shuffle(RUMBLERS.filter(b=>b!==pb)):botPick([pb],S.trophies|0);let pi=0;
    for(let k=0;k<mode.teams;k++){const a=anc[k];for(let j=0;j<mode.size;j++){const sp=j?openPoint(a[0],a[1],40,80):a;
      if(!k&&!j){P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp,gadget:me.gadget,star:me.star});M.units.push(P);}
      else M.units.push(bot(pool[pi++],k,sp,k?eskill:mskill,elvl()));}}
  }else if(mode.ffa){
    const pts=shuffle(MAP.ffa.slice());
    P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:pts[0],gadget:me.gadget,star:me.star});M.units.push(P);
    const pool=botPick([pb],S.trophies|0);
    for(let i=1;i<(mode.players||6);i++)M.units.push(bot(pool[i-1],i,pts[i],eskill,elvl()));
  }else{
    const sp=MAP.spawns;
    P=makeUnit(pb,me.skin,0,{player:true,name:S.name,lvl:plvl,spawn:sp[0][1],gadget:me.gadget,star:me.star});M.units.push(P);
    const party=(S.party||[]).filter(f=>f&&BY_ID[f.rumbler]).slice(0,2),mates=dr?dr.mates.map(id=>BY_ID[id]):party.map(f=>BY_ID[f.rumbler]).concat(botPick([pb],S.trophies|0,4)).slice(0,2),foes=dr?dr.foes.map(id=>BY_ID[id]):botPick([],S.trophies|0,3);
    mates.forEach((b,i)=>{const f=party[i],ml=elvl();if(f&&!M.trial){const lo=botLoadout(b,ml);M.units.push(makeUnit(b,f.skin||'classic',0,{name:f.name,skill:typeof mskill==='object'?varySkill(mskill):mskill,lvl:ml,spawn:sp[0][i?2:0],gadget:lo.gadget,star:lo.star}));}else M.units.push(bot(b,0,sp[0][i?2:0],mskill,ml));});
    foes.forEach((b,i)=>M.units.push(bot(b,1,sp[1][i],eskill,elvl())));
  }
  if(M.hell)for(const u of M.units)if(u.team!==0){u.maxHp=Math.round(u.maxHp*1.35);u.hp=u.maxHp;u.baseHp=u.maxHp;u.dmgMul*=1.2;u.baseDmg=u.dmgMul;}
  M.ents=M.units.slice();
  for(const u of M.units)if(u.sk.supercharged)superSpawnFx(u);else skinSpawnFx(u);
  if(opts.netHumans)netConvert(opts.netHumans);
  if(P&&!M.trial&&!NETS)setTimeout(()=>{if(M&&P)say(P,'s',true);},1200);
  modeSetup();
  for(let i=0;i<40;i++)M.embers.push({x:rand(0,MW),y:rand(0,MH),s:rand(1,2.6),v:rand(8,26),ph:rand(0,TAU)});
}

/* ---------- Effects ---------- */
function addFx(o){if(M.fx.length<900)M.fx.push(o);}
function sparks(x,y,col,n,sp,s){sp=sp||200;s=s||3;for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(sp*.3,sp);addFx({k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,T:rand(.2,.45),s:rand(s*.6,s*1.3),col});}}
function smoke(x,y,n,s,col){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(10,60);addFx({k:'smoke',x:x+rand(-8,8),y:y+rand(-8,8),vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,t:0,T:rand(.6,1.1),s:rand(s*.6,s),col:col||'#3a3354'});}}
function debris(x,y,col,n){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(60,230);addFx({k:'debris',x,y,z:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rand(120,320),t:0,T:rand(.6,1),s:rand(3,6),col,rot:rand(0,TAU),vr:rand(-12,12)});}}
function ringFx(x,y,r0,r1,T,col,w){addFx({k:'ring',x,y,r0,r1,t:0,T,col,w:w||5});}
function flashFx(x,y,r,col,T){addFx({k:'flash',x,y,r,t:0,T:T||.18,col});}
function decal(x,y,r,col,T){M.decals.push({x,y,r,col,t:0,T:T||6,rot:rand(0,TAU)});if(M.decals.length>70)M.decals.shift();}
function boltFx(x1,y1,x2,y2,col){const pts=[[x1,y1]];for(let i=1;i<6;i++){const t=i/6;pts.push([x1+(x2-x1)*t+rand(-14,14),y1+(y2-y1)*t+rand(-14,14)]);}pts.push([x2,y2]);addFx({k:'bolt',pts,t:0,T:.24,col});}
function textFx(x,y,txt,col,size){M.texts.push({x:x+rand(-8,8),y,txt:String(txt),col,t:0,T:.85,size:size||13});if(M.texts.length>60)M.texts.shift();}
function shakeAt(x,y,amt){if(!P||!S.shake||REDUCED)return;const d=dist(P.x,P.y,x,y);if(d<520)M.shake=Math.min(16,M.shake+amt*(1-d/520));}
function hitFx(x,y,col){sparks(x,y,col,7,220,2.6);flashFx(x,y,18,col,.1);}
function muzzle(u,ang,col,big){const mx=u.x+Math.cos(ang)*u.rad*1.3,my=u.y+Math.sin(ang)*u.rad*1.3;flashFx(mx,my,big?30:16,col,big?.14:.08);sparks(mx,my,col,big?10:3,big?300:160,2);}
function boom(x,y,r,col,big){flashFx(x,y,r*1.4,'#fff4c2',.16);flashFx(x,y,r*1.1,col,.3);ringFx(x,y,10,r,.35,'#ffffff',big?9:6);ringFx(x,y,10,r*1.25,.5,col,big?6:4);smoke(x,y,big?9:5,big?34:22);debris(x,y,'#3a3049',big?10:5);sparks(x,y,'#ffb347',big?22:12,big?380:260,3.5);decal(x,y,r*.75,'rgba(15,10,25,.45)');shakeAt(x,y,big?10:5);sfx(big?'bigboom':'boom');}
function swipeFx(u,ang,a,second){addFx({k:'swipe',x:u.x,y:u.y,ang:ang+(second?.25:-.1),arc:a.arc,r:a.range+8,t:0,T:a.dark?.3:.2,col:u.sk.proj,dark:!!a.dark});const ex=u.x+Math.cos(ang)*a.range*.8,ey=u.y+Math.sin(ang)*a.range*.8;sparks(ex,ey,u.sk.proj,4,160,2);}
function superFx(u){addFx({k:'lines',x:u.x,y:u.y,t:0,T:.45,col:u.sk.proj,seed:Math.random()*10});flashFx(u.x,u.y,80,u.sk.proj,.3);ringFx(u.x,u.y,u.rad,u.rad*3.2,.4,'#ffffff',5);if(u===P)shakeAt(u.x,u.y,4);sfx('super');}
function deathFx(t){flashFx(t.x,t.y,64,'#ffffff',.18);ringFx(t.x,t.y,10,84,.45,t.sk.body,8);debris(t.x,t.y,t.sk.body,12);debris(t.x,t.y,t.sk.belly,6);sparks(t.x,t.y,t.sk.accent,16,320,3);smoke(t.x,t.y,5,24);addFx({k:'ghost',x:t.x,y:t.y,b:t.b,sk:t.sk,t:0,T:1.3});decal(t.x,t.y,26,'rgba(15,10,25,.35)');}

/* ---------- Combat ---------- */
const credit=src=>!src?src:src.isStruct?src.owner:src.shadow?src.shadowOf:src;
function hurt(t,dmg,src,raw){
  if(!t||t.dead)return 0;
  if(!t.isStruct&&t.shield>0){if(Math.random()<.3)textFx(t.x,t.y-t.rad-10,'Shield','#bff3ff',12);return 0;}
  if(t.guardT>0)dmg*=.5;if(!raw){if(t.markT>0)dmg*=1.15;if(t.vulnT>0)dmg*=1.25;if(src&&!src.isStruct&&src.zoneT>0)dmg*=1.15;}
  dmg=Math.max(1,Math.round(dmg));t.hp-=dmg;t.flash=1;t.lastHurt=M.now;if(!t.isStruct)t.squash=.6;
  const c=credit(src),mine=c===P,onMe=t===P;
  textFx(t.x,t.y-t.rad-12,dmg,onMe?'#ff8a80':mine?'#fff1a6':'#ffffff',mine?(dmg>=1500?20:16):13);
  if(c&&c!==t&&!c.dead&&!c.isStruct){
    if(c.super<1){const b4=c.super;c.super=Math.min(1,c.super+(M.mode.id==='chaos'?4:1)*dmg/(c.b.superNeed*c.mul)*(1+c.mods.charge)*(t.isStruct?.5:1));if(b4<1&&c.super>=1&&c===P){ringFx(c.x,c.y,c.rad,c.rad*3,.5,SUNC,6);sfx('ready');}}
    if(c.mods.lifesteal&&!t.isStruct)heal(c,dmg*c.mods.lifesteal,true);
    c.dmgDone+=dmg;
  }
  if(onMe)shakeAt(t.x,t.y,3);
  if(t.hp<=0){if(t.isStruct)breakStruct(t,c);else kill(t,c);}
  return dmg;
}
function heal(a,amt,quiet){if(a.dead)return;const h=Math.round(Math.min(a.maxHp-a.hp,amt));if(h<=0)return;a.hp+=h;if(!quiet||h>=250)textFx(a.x,a.y-a.rad-12,'+'+h,'#6be39a',13);if(Math.random()<.5)addFx({k:'plus',x:a.x+rand(-14,14),y:a.y-rand(0,10),t:0,T:.8});}
/* Supercharged skins: golden takedown burst and a lightning entrance */
const SC_COLS=['#ffd23f','#ff7aa8','#5ef2ff','#fff3b0'];
function superKillFx(x,y){for(let k=0;k<4;k++)ringFx(x,y,10+k*6,90+k*35,.45+k*.12,SC_COLS[k],8-k);flashFx(x,y,130,'#ffd23f',.3);for(const c of SC_COLS)sparks(x,y,c,12,420,4);
  for(let k=0;k<8;k++)addFx({k:'star',x:x+Math.cos(k*TAU/8)*40,y:y+Math.sin(k*TAU/8)*40,t:0,T:.9,a:k});textFx(x,y-58,'SUPERCHARGED!','#ffd23f',16);shakeAt(x,y,7);sfx('super');}
function superSpawnFx(u){addFx({k:'beam',x:u.x,y:u.y,t:0,T:.9,col:'#ffd23f'});addFx({k:'beam',x:u.x,y:u.y,t:0,T:.7,col:'#5ef2ff'});
  for(let k=0;k<3;k++)ringFx(u.x,u.y,6,60+k*40,.5+k*.15,SC_COLS[k],6);flashFx(u.x,u.y,100,'#fff3b0',.25);for(const c of SC_COLS)sparks(u.x,u.y,c,10,300,3.5);shakeAt(u.x,u.y,4);sfx('ready');}
function voiceLine(id,ev){const v=VOICE[id]||{},l=(v[ev]&&v[ev].length?v[ev]:VOICE_GENERIC[ev])||[];return l.length?pick(l):null;}
function speakLine(txt,b){if(!S.sound||!S.voice)return;const pitch=clamp(1.55-(b.rad-17)*.12,.6,1.9);
  try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){const u=new SpeechSynthesisUtterance(txt);u.pitch=pitch;u.rate=1.15;u.volume=.9;speechSynthesis.cancel();speechSynthesis.speak(u);return;}}catch(e){}
  const a=audio();if(!a)return;const n=Math.min(8,txt.replace(/[^a-z]/gi,'').length/2|0)||2;for(let i=0;i<n;i++)tone('square',220*pitch*(1+Math.random()*.4),200*pitch,.06,.035,i*.07);}
function say(u,ev,force){if(!M||!u||u.isStruct||u.shadow||!S.voice)return;const id=u.b.id;if(VOICE_SILENT.includes(id))return;if((u.sayCd||0)>M.now&&!force)return;
  if(u!==P&&Math.random()>.35)return;const txt=voiceLine(id,ev);if(!txt)return;u.say={txt,at:M.now};u.sayCd=M.now+4;if(u===P)speakLine(txt,u.b);}
function skinKillFx(x,y,sk){const L=skinFx(sk),col=sk.proj||'#ffffff';if(!L)return;sparks(x,y,col,8+L*6,240+L*80,2.5+L*.6);ringFx(x,y,8,40+L*25,.35,col,4+L);
  if(L>=2){flashFx(x,y,50+L*20,col,.2);ringFx(x,y,6,30+L*20,.3,'#ffffff',3);}if(L>=4){for(let k=0;k<3;k++)ringFx(x,y,10,80+k*30,.45+k*.1,['#9d7bff','#d9b8ff','#ffffff'][k],6);for(let k=0;k<5;k++){const a=k*TAU/5;boltFx(x,y,x+Math.cos(a)*90,y+Math.sin(a)*90,'#d9b8ff');}}
  if(L>=3){for(let k=0;k<6;k++)addFx({k:'star',x:x+Math.cos(k*TAU/6)*30,y:y+Math.sin(k*TAU/6)*30,t:0,T:.7,a:k});textFx(x,y-48,sk.name+'!',col,13);shakeAt(x,y,4);}}
function skinSpawnFx(u){const L=skinFx(u.sk),col=u.sk.proj||'#ffffff';if(L<2)return;addFx({k:'beam',x:u.x,y:u.y,t:0,T:.6,col});ringFx(u.x,u.y,6,50+L*15,.45,col,5);if(L>=3)sparks(u.x,u.y,col,16,260,3);}
function botEmote(u,good){if(!u||!u.ai||u.dead||M.trial||Math.random()>.45)return;const g=['happy','laugh','cool','gg','flex','hundred','smug','clap','fire','king','money'],b=['sad','cry','angry','rage','facepalm','sweat','heartbreak','scream','grimace','pout'];
  const pool=(good?g:b).filter(id=>BASIC_PINS.concat(PREMIUM_PINS,DAILY_ONLY_PINS,TROLL_PINS).some(p=>p[0]===id));if(pool.length)sendPin(u,'b:'+pick(pool));}
function kill(t,c){setTimeout(()=>{if(M){botEmote(c,true);botEmote(t,false);}},300);
  if(c&&!t.shadow&&c.sk&&!c.sk.supercharged)skinKillFx(t.x,t.y,c.sk);
  if(c&&!c.isStruct&&!c.shadow&&c!==t)say(c,'k');if(!t.isStruct&&!t.shadow)say(t,'d');
  if(c&&!t.shadow&&c.sk&&c.sk.supercharged)superKillFx(t.x,t.y);
  if(t.shadow){t.dead=true;t.gone=true;t.respawn=Infinity;smoke(t.x,t.y,5,22,'#3a2266');sparks(t.x,t.y,'#b48cff',12,240,2.5);ringFx(t.x,t.y,8,50,.35,'#b48cff',5);return;}
  if(t.stolen.length){const n=t.stolen.length;t.stolen.length=0;textFx(t.x,t.y-t.rad-34,'Lost '+n+' absorbed attack'+(n>1?'s':''),'#d9c2ff',14);sparks(t.x,t.y,'#b48cff',22,300,3);ringFx(t.x,t.y,t.rad*3,t.rad,.45,'#b48cff',6);}
  if(c&&c!==t&&c.b.atk.kind==='orbs'&&t.b.id!==c.b.id){const cap=c.mods.maxsteal||15;
    if(!c.stolen.includes(t.b.id)&&c.stolen.length<cap){c.stolen.push(t.b.id);(c.stolenSk||(c.stolenSk={}))[t.b.id]=t.sk.id;textFx(c.x,c.y-c.rad-44,'+'+t.b.name+"'s attack",'#d9c2ff',15);ringFx(c.x,c.y,c.rad,c.rad*3.2,.5,'#b48cff',7);addFx({k:'lines',x:c.x,y:c.y,t:0,T:.45,col:'#b48cff',seed:Math.random()*10});if(c===P)sfx('unlock');}}
  t.dead=true;t.hp=0;t.respawn=M.mode.id==='stand'||M.mode.id==='knockout'||t.boss?Infinity:M.mode.id==='chaos'?1.5:M.mode.id==='duel'?2:M.mode.sd?sdRespawn(t):(M.mode.ffa?2.5:3.5);
  t.dash=null;t.kb=null;t.thrown=null;t.leap=null;t.strongFist=false;t.pending.length=0;t.deaths++;t.slowT=t.stunT=t.poisonT=t.markT=t.vulnT=0;
  modeOnDeath(t);deathFx(t);
  if(c&&c!==t){c.kills++;modeOnKill(t,c);if(c.ai&&Math.random()<.35)sendPin(c,pick(['b:laugh','b:gg','b:happy','b:thumb','b:ez','b:clown','b:L']));}
  if(t.ai&&Math.random()<.3)sendPin(t,pick(['b:sad','b:angry']));
  onKillFeed(c,t);
  if(t===P){shakeAt(t.x,t.y,12);sfx('ko');}else sfx('pop');
}
function breakStruct(s){s.dead=true;s.hp=0;
  if(s.kind==='box'){debris(s.x,s.y,'#2f5f9e',10);debris(s.x,s.y,'#c98f55',6);smoke(s.x,s.y,3,18);flashFx(s.x,s.y,40,'#7fd3ff',.15);ringFx(s.x,s.y,6,44,.35,'#7fd3ff',5);dropCube(s.x,s.y,0);sfx('crack');return;}
  const core=s.kind==='core';boom(s.x,s.y,core?170:70,core?(s.team===0?BLUE:RED):'#ffb347',core);if(core)debris(s.x,s.y,'#8c8fb0',20);}
function punchFx(u,ang,a){const ex=u.x+Math.cos(ang)*a.range*.75,ey=u.y+Math.sin(ang)*a.range*.75;ringFx(ex,ey,8,46,.22,u.sk.proj,7);flashFx(ex,ey,40,'#ffffff',.12);sparks(ex,ey,u.sk.proj,10,260,3);shakeAt(u.x,u.y,3);sfx('bass');}
/* Juggler's Big Toss: grab the nearest enemy, then throw them; damage grows with how far they fly */
function grabTarget(u){const s=u.b.sup;let best=null,bd=s.grab;for(const e of M.units){if(e.team===u.team||e.dead||e.thrown||(e.hidden&&e.markT<=0))continue;const d=dist(u.x,u.y,e.x,e.y)-e.rad;if(d<bd&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}return best;}
function leapTarget(u,ang){const s=u.b.sup;let best=null,bd=s.zone;const foe=e=>e.team!==u.team;
  const cands=M.units.filter(e=>e!==u&&!e.dead&&(foe(e)?!(e.hidden&&e.markT<=0):s.allies)&&dist(u.x,u.y,e.x,e.y)<s.zone);if(!cands.length)return null;
  if(!s.allies){for(const e of cands){const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best;}
  if(ang!=null){let sc=1e9;for(const e of cands){const v=Math.abs(angDiff(ang,Math.atan2(e.y-u.y,e.x-u.x)))*300+dist(u.x,u.y,e.x,e.y)*.3;if(v<sc){sc=v;best=e;}}return best;}
  const hurtAlly=cands.filter(e=>!foe(e)&&e.hp/e.maxHp<.6).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(hurtAlly)return hurtAlly;
  const foes=cands.filter(foe);return(foes.length?foes:cands).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];}
function zapTarget(u,ang){const a=u.b.atk,z=a.zone*(1+u.mods.range);let best=null,sc=1e9;for(const e of M.ents){if(e.team===u.team||e.dead||(e.hidden&&e.markT<=0&&dist(u.x,u.y,e.x,e.y)>80))continue;const d=dist(u.x,u.y,e.x,e.y);if(d>z+e.rad)continue;const v=d+(ang==null?0:Math.abs(angDiff(ang,Math.atan2(e.y-u.y,e.x-u.x)))*160)+(e.isStruct?200:0);if(v<sc){sc=v;best=e;}}return best;}
function tossDist(u){return u.b.sup.dist*(1+u.mods.tossplus);}
function bestThrowAngle(u){const e=grabTarget(u),max=tossDist(u),base=e?Math.atan2(e.y-u.y,e.x-u.x):u.aim;let best=base,bl=-1;
  for(let k=0;k<16;k++){const a=base+k*TAU/16,l=rayLen(u.x,u.y,a,max+u.rad*2)-Math.abs(angDiff(a,base))*20;if(l>bl){bl=l;best=a;}}return best;}
function landThrow(e){const th=e.thrown;e.thrown=null;if(e.dead)return;const f=clamp(th.trav/th.max,0,1),dmg=th.dmg*(th.min+(1-th.min)*f);
  hurt(e,dmg,th.src);ringFx(e.x,e.y,e.rad,e.rad*3.4,.4,'#ffd23f',8);smoke(e.x,e.y,8,22);shakeAt(e.x,e.y,8+f*6);stun(e,.45);sfx('bass');
  if(th.src===P||e===P)textFx(e.x,e.y-e.rad-40,Math.round(f*100)+'% toss',f>.8?'#ffd23f':'#ffffff',14);}
function knock(e,a,f){if(!e.dead&&!e.isStruct&&f)e.kb={vx:Math.cos(a)*f,vy:Math.sin(a)*f,t:.16};}
function stun(e,t){if(!e.isStruct&&!e.dead){e.stunT=Math.max(e.stunT,t);e.dash=null;}}
function slowE(e,t,src){if(!e.isStruct&&!e.dead)e.slowT=Math.max(e.slowT,t*(src&&src.mods&&src.mods.slowplus?2:1));}
const foesOf=team=>M.ents.filter(e=>e.team!==team&&!e.dead);
/* Dark: poisoned enemies leave black trails that Dark can dive into */
function darkPoison(src,e,dps,dur){if(!e||e.dead||e.isStruct)return;e.poisonT=dur;e.poisonDmg=dps;e.poisonSrc=src;e.poisonTick=1;e.darkT=Math.max(e.darkT||0,dur);e.darkSrc=src;ringFx(e.x,e.y,6,36,.3,'#5a2a8a',4);}
function addTrail(owner,victim,x,y){if(!M.trails)M.trails=[];if(M.trails.length>700)M.trails.shift();M.trails.push({x,y,t:0,T:15,owner,victim});}
const onTrail=u=>!!M.trails&&M.trails.some(p=>p.owner===u&&(p.x-u.x)**2+(p.y-u.y)**2<55*55);
function meleeHit(u,ang,a,R){
  const range=a.range*R,dmg=a.dmg*u.dmgMul*(a.dark&&u.mods.darkvenom?.8:1);
  for(const e of M.ents){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;if(!los(u.x,u.y,e.x,e.y))continue;
    hurt(e,dmg,u);hitFx(e.x,e.y,u.sk.proj);if(a.bat&&!e.isStruct){batEffects(u,e,a.bat.poison*u.dmgMul,a.bat.dur);sfx('crack');}if(a.burn&&!e.isStruct){e.poisonT=a.burn.dur;e.poisonDmg=a.burn.dps*u.dmgMul;e.poisonSrc=u;e.poisonTick=1;e.burnT=a.burn.dur;}if(a.dark&&!e.isStruct)darkPoison(u,e,a.dark.dps*u.dmgMul*(u.mods.darkvenom?.7:1),a.dark.dur);if(a.kb)knock(e,an,a.kb);if(a.pull)knock(e,an+Math.PI,a.pull);}
  if(a.dark&&u.mods.darkheal)for(const e of M.units){if(e===u||e.team!==u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;e.hot={t:2,amt:u.mods.darkheal*u.mul,tick:0};ringFx(e.x,e.y,6,36,.3,'#6be39a',4);}
  if(a.healAlly){const amt=a.healAlly*u.mul*(u.mods.kind?1.5:1);
    for(const e of M.units){if(e===u||e.team!==u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>range+e.rad)continue;const an=Math.atan2(e.y-u.y,e.x-u.x);if(Math.abs(angDiff(ang,an))>a.arc/2&&d>e.rad+u.rad)continue;
      if(u.mods.selfish){const dm=Math.min(amt,e.hp-1);if(dm>0){e.hp-=dm;e.flash=1;textFx(e.x,e.y-e.rad-12,'-'+Math.round(dm),'#ff8a80',12);heal(u,dm);}}
      else{heal(e,amt);if(u.mods.kind){const c=Math.min(amt*.3,u.hp-1);if(c>0){u.hp-=c;textFx(u.x,u.y-u.rad-12,'-'+Math.round(c),'#ff8a80',11);}}}}}
}
function pulseHit(u,range,dmg){ringFx(u.x,u.y,u.rad,range,.3,u.sk.proj,8);ringFx(u.x,u.y,u.rad,range*.7,.22,'#ffffff',4);flashFx(u.x,u.y,range*.6,u.sk.proj,.15);
  for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<range+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,dmg,u);hitFx(e.x,e.y,u.sk.proj);}}sfx('bass');}
function spawnShot(u,ang,o){
  const cx=Math.cos(ang),sy=Math.sin(ang),x=o.x!=null?o.x:u.x+cx*u.rad*.8,y=o.y!=null?o.y:u.y+sy*u.rad*.8;
  const s={team:u.team,owner:u,x,y,vx:cx*o.spd,vy:sy*o.spd,spd:o.spd,left:o.range,range:o.range,dmg:o.dmg,r:o.r,pierce:!!o.pierce,style:o.style||'orb',hit:new Set(o.hit||[]),
    color:o.color||u.sk.proj,slow:o.slow||0,chain:o.chain||null,kb:o.kb||0,stun:o.stun||0,rang:o.rang?{back:false,life:0}:null,split:o.split||0,splitDmg:o.splitDmg||0,splitRange:o.splitRange||0,trail:[],seen:null,big:!!o.big,age:0,spin:0,spread:o.spread||null,seek:o.seek||null,ghost:!!o.ghost,curve:o.curve||0,bounce:o.bounce||0,sawDps:o.sawDps||0,splat:o.splat||0,boom:o.boom||0};
  M.shots.push(s);return s;
}
function spawnLob(u,tx,ty,o){M.shots.push({lob:true,team:u.team,owner:u,sx:u.x,sy:u.y,x:u.x,y:u.y,h:0,tx,ty,t:0,T:o.flight,dmg:o.dmg,splash:o.splash||0,big:!!o.big,r:o.big?13:9,color:o.color||u.sk.proj,onLand:o.onLand||null,after:o.after||null,seen:null,style:o.style||u.b.id});}
function explode(s){
  if(s.onLand&&s.onLand.kind==='meteor'){meteorImpact(s);return;}
  if(s.onLand){createField(s.owner,s.tx,s.ty,s.onLand);return;}
  boom(s.tx,s.ty,s.splash,s.color==='#3a2f4f'?'#ffb347':s.color,s.big);
  for(const e of M.ents){if(e.team===s.team||e.dead)continue;if(dist(s.tx,s.ty,e.x,e.y)<s.splash+e.rad)hurt(e,s.dmg,s.owner);}
  if(s.after&&s.owner)createField(s.owner,s.tx,s.ty,s.after);
}
function createField(u,x,y,f){
  const fl={team:u.team,owner:u,x,y,r:f.radius,t:0,dur:f.dur,dps:f.dps||0,slow:!!f.slow,pull:f.pull||0,kind:f.kind,tick:0,heal:f.heal||0,speed:f.speed||0,poison:f.poison||0,poisonT:f.poisonT||0};
  M.fields.push(fl);
  if(f.kind==='dam'){ringFx(x,y,20,f.radius,.5,'#7fd3ff',8);debris(x,y,'#8a5a3b',14);smoke(x,y,4,26,'#6aa9c9');sfx('build');}
  else if(f.kind==='starzone'){flashFx(x,y,f.radius*1.2,'#9d7bff',.35);ringFx(x,y,10,f.radius,.5,'#ffd36b',8);sparks(x,y,'#ffe48a',22,f.radius*2.2,3);shakeAt(x,y,5);sfx('zap');}
  else if(f.kind==='hole'){flashFx(x,y,f.radius,'#9d7bff',.4);ringFx(x,y,f.radius*1.3,10,.5,'#c9b5ff',6);sfx('zap');}
  else{ringFx(x,y,10,f.radius,.4,'#c9f0ff',6);sparks(x,y,'#e6f8ff',18,260,3);sfx('freeze');}
}
function splitLog(s,t){
  const n=s.split,base=Math.atan2(s.vy,s.vx);
  for(let i=0;i<n;i++){const a=base+(-.95+1.9*i/(n-1));spawnShot(s.owner,a,{x:t.x,y:t.y,spd:540,range:s.splitRange,dmg:s.dmg*s.splitDmg,r:7,style:'splinter',hit:[t.id],color:'#c48a5a'});}
  debris(t.x,t.y,'#a0673f',8);sparks(t.x,t.y,'#ffd9a8',8,240,2.5);sfx('crack');
}
function doChain(s,first){
  let from=first,dmg=s.dmg;const hit=new Set([first.id]);
  for(let j=0;j<s.chain.jumps;j++){
    let best=null,bd=s.chain.jumpR;
    for(const e of M.ents){if(e.team===s.team||e.dead||hit.has(e.id)||e.kind==='core')continue;const d=dist(from.x,from.y,e.x,e.y);if(d<bd&&los(from.x,from.y,e.x,e.y)){bd=d;best=e;}}
    if(!best)break;dmg*=s.chain.falloff;boltFx(from.x,from.y,best.x,best.y,s.color);hurt(best,dmg,s.owner);if(s.chain.stun)stun(best,s.chain.stun);hitFx(best.x,best.y,s.color);hit.add(best.id);from=best;
  }
}

function volleyDmg(a){return a.kind==='spread'||a.kind==='burst'||a.kind==='paint'||a.kind==='nails'?a.n*a.dmg:a.kind==='crescent'?a.dmg*2:a.kind==='starslash'?a.dmg+a.shards*a.shardDmg:a.kind==='orbs'?a.dmg*2:a.double?a.dmg*2:a.kind==='boomerang'?a.dmg*2:a.dmg;}
function doAttackSpec(u,a,id,ang,dh,m,R,col){
  switch(a.kind){
    case 'spread':for(let i=0;i<a.n;i++){const off=a.n===1?0:-a.arc/2+a.arc*i/(a.n-1);spawnShot(u,ang+off+rand(-.03,.03),{spd:a.spd,range:a.range*R*rand(.94,1),dmg:a.dmg*m,r:a.r,pierce:a.pierce,color:col,style:id==='ember'?'flame':id==='quill'?'needle':id==='fang'?'claw':'orb'});}muzzle(u,ang,col||u.sk.proj);sfx(id==='ember'?'flame':'shoot');break;
    case 'cloudzap':{const e=zapTarget(u,ang);if(!e)break;const cx=u.x,cy=u.y-u.rad*2.4;boltFx(cx,cy,e.x,e.y,'#fff3a0');boltFx(cx,cy,e.x,e.y,'#8fd3ff');hurt(e,a.dmg*m,u);hitFx(e.x,e.y,'#fff3a0');flashFx(e.x,e.y,30,'#bfe6ff',.12);sfx('zap');
      {const hit=new Set([e.id]);let from=e;for(let j=0;j<(a.jumps||0);j++){let nx=null,nd=a.jumpR||150;for(const o of M.ents){if(o.team===u.team||o.dead||hit.has(o.id))continue;const d=dist(from.x,from.y,o.x,o.y);if(d<nd){nd=d;nx=o;}}if(!nx)break;hit.add(nx.id);boltFx(from.x,from.y,nx.x,nx.y,'#fff3a0');hurt(nx,a.dmg*m,u);hitFx(nx.x,nx.y,'#fff3a0');from=nx;}}break;}
    case 'fist':{const st=!!u.strongFist;u.strongFist=false;const col=st?'#ffd23f':u.sk.proj;const sh=spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:(st?a.strongDmg:a.dmg)*m,r:st?a.r*1.35:a.r,kb:st?a.strongKb:a.kb,style:'fist',color:col,big:st});sh.fist={strong:st,far:st?a.strongFar:a.far};muzzle(u,ang,col);sfx(st?'bass':'swish');break;}
    case 'crescent':for(const sd of[-1,1]){spawnShot(u,ang-sd*.45,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,curve:sd*a.curve,color:col,style:'moon'});}sfx('swish');break;
    case 'saw':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,sawDps:a.sawDps*m,color:col||'#c9c2b6',style:'rang'});sfx('swish');break;
    case 'bounce':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,bounce:1,color:col,style:'orb'});muzzle(u,ang,col||u.sk.proj);sfx('pew');break;
    case 'paint':for(let i=0;i<a.n;i++){const off=-a.arc/2+a.arc*i/(a.n-1);spawnShot(u,ang+off,{spd:a.spd,range:a.range*R*rand(.9,1),dmg:a.dmg*m,r:a.r,splat:a.splat*m,color:col||['#ff5e87','#ffd23f','#5ec8ff'][i%3],style:'orb'});}sfx('pew');break;
    case 'spore':{const d=clamp(dh==null?a.range:dh,40,a.range*R);spawnLob(u,u.x+Math.cos(ang)*d,u.y+Math.sin(ang)*d,{flight:a.flight,dmg:a.dmg*m,splash:a.splash,color:col||'#b9f27c',style:'mossy',after:{radius:70,dur:2,dps:a.dps*m,heal:a.heal,kind:'spore'}});sfx('lob');break;}
    case 'nails':for(let i=0;i<a.n;i++){const fire=()=>{if(u.dead)return;spawnShot(u,ang+rand(-.05,.05),{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,boom:a.boom*m,color:col,style:'rivet'});muzzle(u,ang,col||u.sk.proj);sfx('tick');};if(i===0)fire();else u.pending.push({t:a.gap*i,fn:fire});}break;
    case 'starslash':{meleeHit(u,ang,{...a,kind:'melee',dmg:a.dmg*m/u.dmgMul},R);swipeFx(u,ang,a);for(let i=0;i<a.shards;i++)spawnShot(u,ang-.3+.3*i,{spd:700,range:220*R,dmg:a.shardDmg*m,r:6,color:col||'#ffd36b',style:'orb'});sfx('swish');break;}
    case 'phase':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,ghost:true,color:col||'#b56cff',style:'laser'});muzzle(u,ang,col||'#b56cff');sfx('laser');break;
    case 'single':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:a.pierce,slow:a.slow,color:col,style:a.style||(a.slow?'shard':a.pierce?'laser':'bolt')});muzzle(u,ang,col||u.sk.proj);if(a.style==='ball'){swipeFx(u,ang,{arc:1.5,range:34});sfx('crack');}else sfx(a.pierce?'laser':'shoot');break;
    case 'burst':for(let i=0;i<a.n;i++){const fire=()=>{if(u.dead)return;spawnShot(u,ang+rand(-.04,.04),{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:id==='pebble'?'stone':'rivet'});muzzle(u,ang,col||u.sk.proj);sfx('tick');};if(i===0)fire();else u.pending.push({t:a.gap*i,fn:fire});}break;
    case 'melee':{const sp={...a,dmg:a.dmg*m/u.dmgMul};meleeHit(u,ang,sp,R);if(a.punch)punchFx(u,ang,a);else swipeFx(u,ang,a);if(a.double)u.pending.push({t:.14,fn:()=>{meleeHit(u,ang,sp,R);swipeFx(u,ang,a,true);}});sfx('swish');break;}
    case 'lob':{const d=clamp(dh==null?a.range:dh,40,a.range*R);spawnLob(u,u.x+Math.cos(ang)*d,u.y+Math.sin(ang)*d,{flight:a.flight,dmg:a.dmg*m,splash:a.splash*(1+u.mods.splash),color:col,style:id});sfx('lob');break;}
    case 'orbs':{const d=clamp(dh==null?a.range:dh,40,a.range*R),tx=u.x+Math.cos(ang)*d,ty=u.y+Math.sin(ang)*d,px=-Math.sin(ang)*26,py=Math.cos(ang)*26,sp=a.splash*(1+u.mods.splash);
      spawnLob(u,tx+px,ty+py,{flight:a.flight,dmg:a.dmg*m,splash:sp,color:'#ffd36b',style:'sun'});spawnLob(u,tx-px,ty-py,{flight:a.flight*1.08,dmg:a.dmg*m,splash:sp,color:'#cfe3ff',style:'moon2'});sfx('lob');break;}
    case 'boomerang':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,rang:true,color:col,style:id==='luna'?'moon':'rang'});sfx('swish');break;
    case 'wave':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,pierce:true,color:col,style:'wave'});sfx('splash');break;
    case 'chain':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:'spark',chain:{jumps:a.jumps+u.mods.chainplus,jumpR:a.jumpR,falloff:a.falloff,stun:0}});muzzle(u,ang,col||u.sk.proj);sfx('zap');break;
    case 'pulse':pulseHit(u,a.range*R,a.dmg*m);break;
    case 'star':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,slow:a.slow,color:col,style:'star',spread:{n:a.spread+u.mods.chainplus,r:a.spreadR}});muzzle(u,ang,col||u.sk.proj);sfx('laser');break;
    case 'log':spawnShot(u,ang,{spd:a.spd,range:a.range*R,dmg:a.dmg*m,r:a.r,color:col,style:'log',split:u.mods.split6?6:a.split,splitDmg:a.splitDmg,splitRange:a.splitRange});sfx('lob');break;
  }
}
function tryAttack(u,ang,dh){
  if(NETC&&u===P){netAct('atk',ang,dh);return true;}
  if(!M||u.dead||u.dash||u.stunT>0||u.ammo<1||u.atkCd>0||M.state!=='play')return false;
  if(u.b.atk.kind==='cloudzap'&&!zapTarget(u,ang))return false;
  SFXU=u;u.ammo-=1;u.atkCd=.28;u.lastAttack=M.now;u.shield=0;u.aim=ang;u.squash=.35;
  const a=u.b.atk,m=u.dmgMul,R=1+u.mods.range;
  if(u.stolen.length){
    /* Meteorite: base sun & moon plus every absorbed attack, capped at 100,000 total damage per volley */
    let total=volleyDmg(a)*m;for(const id of u.stolen)total+=volleyDmg(BY_ID[id].atk)*m;
    const k=Math.min(1,100000/total);
    doAttackSpec(u,a,u.b.id,ang,dh,m*k,R,null);
    for(const id of u.stolen){const sa=BY_ID[id].atk;doAttackSpec(u,sa,id,ang,dh,m*k,1,'#b48cff');}
    addFx({k:'ring',x:u.x,y:u.y,r0:u.rad,r1:u.rad*2.2,t:0,T:.25,col:'#b48cff',w:4});
  }else doAttackSpec(u,a,u.trickAtk?u.trickAtk.id:u.b.id,ang,dh,m,R,null);
  if(u.b.random)u.rerollA=.25;
  return true;
}
function spawnShadow(owner,bid,x,y){
  const b=BY_ID[bid];if(!b)return;const p=openPoint(x,y,10,60);
  const sk=(owner.stolenSk&&owner.stolenSk[bid])||'classic',u=makeUnit(b,skinsOf(b).some(k=>k.id===sk)?sk:'classic',owner.team,{name:'Shadow '+b.name,skill:'hard',lvl:owner.lvl,spawn:p});
  u.shadow=true;u.shadowOf=owner;u.lifeT=8+(owner.mods.shadowlife||0);u.maxHp=Math.round(u.maxHp*.5);u.hp=u.maxHp;u.dmgMul*=.5;u.shield=0;u.super=0;
  M.units.push(u);smoke(p[0],p[1],4,20,'#3a2266');ringFx(p[0],p[1],8,46,.4,'#b48cff',5);sparks(p[0],p[1],'#b48cff',10,200,2.5);
}
function meteorImpact(s){
  const c=s.owner,r=s.onLand.radius;
  boom(s.tx,s.ty,r*1.3,'#ff7a1a',true);flashFx(s.tx,s.ty,r*2.2,'#fff1a6',.3);ringFx(s.tx,s.ty,10,r*1.8,.7,'#ffb347',12);debris(s.tx,s.ty,'#5a3a2a',16);decal(s.tx,s.ty,r*.9,'rgba(20,8,10,.6)',10);shakeAt(s.tx,s.ty,16);
  for(const e of M.ents){if(e.team===s.team||e.dead)continue;if(dist(s.tx,s.ty,e.x,e.y)>r+e.rad)continue;
    if(e.kind==='core')hurt(e,e.maxHp*.25,c);else{e.guardT=0;hurt(e,e.hp+1,c);}}
  {const ids=c.stolen.slice(-3);ids.forEach(id=>spawnShadow(c,id,s.tx,s.ty));}
}
function trySuper(u,ang,dh){
  if(NETC&&u===P){netAct('sup',ang,dh);return true;}
  if(!M||u.super<1||u.dead||u.dash||u.stunT>0||M.state!=='play')return false;
  if(u.b.sup.kind==='leap'&&!leapTarget(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'Nobody in your hop zone','#ffd1dc',12);return false;}
  if(u.b.sup.kind==='darkdive'&&!onTrail(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'Stand in one of your black trails first','#d9c2ff',12);return false;}
  if(u.b.sup.kind==='grabthrow'&&!grabTarget(u)){if(u===P)textFx(u.x,u.y-u.rad-36,'No one close enough to grab','#ffd1dc',12);return false;}
  SFXU=u;u.super=0;u.lastAttack=M.now;u.shield=0;u.aim=ang;superFx(u);say(u,'u',true);if(u.b.random)u.rerollS=3;
  const s=u.b.sup,m=u.dmgMul,ca=Math.cos(ang),sa=Math.sin(ang);
  switch(s.kind){
    case 'nova':ringFx(u.x,u.y,u.rad,s.radius,.45,u.sk.proj,12);ringFx(u.x,u.y,u.rad,s.radius*1.12,.6,'#ffffff',4);sparks(u.x,u.y,u.sk.proj,30,s.radius*2.4,3.5);decal(u.x,u.y,s.radius*.6,'rgba(15,10,25,.3)');shakeAt(u.x,u.y,7);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<s.radius+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);knock(e,Math.atan2(e.y-u.y,e.x-u.x),s.kb);}}break;
    case 'magnet':{ringFx(u.x,u.y,s.radius,u.rad,.45,'#ff9a3d',10);sparks(u.x,u.y,'#ffcf8a',24,s.radius*2,3);shakeAt(u.x,u.y,6);
      for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<s.radius+e.rad){const a2=Math.atan2(u.y-e.y,u.x-e.x);e.kb={vx:Math.cos(a2)*Math.min(900,d*3.2),vy:Math.sin(a2)*Math.min(900,d*3.2),t:.25};hurt(e,s.dmg*m,u);e.stunT=Math.max(e.stunT,s.stun);boltFx(u.x,u.y,e.x,e.y,'#ffcf8a');}}break;}
    case 'sawring':for(let i=0;i<s.n;i++)spawnShot(u,ang+i*TAU/s.n,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,color:'#e8e8f0',style:'rang',big:true});sfx('swish');break;
    case 'tongue':{let best=null,bd=s.range;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y),an=Math.atan2(e.y-u.y,e.x-u.x);if(d<bd&&Math.abs(angDiff(ang,an))<.35&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}
      const ex=best?best.x:u.x+ca*s.range,ey=best?best.y:u.y+sa*s.range;addFx({k:'beam',x:u.x,y:u.y,tx:ex,ty:ey,t:0,T:.25,col:'#ff7aa8'});boltFx(u.x,u.y,ex,ey,'#ff7aa8');
      if(best){const a2=Math.atan2(u.y-best.y,u.x-best.x),d=dist(u.x,u.y,best.x,best.y)-u.rad-best.rad-6;best.kb={vx:Math.cos(a2)*d/.2,vy:Math.sin(a2)*d/.2,t:.2};hurt(best,s.dmg*m,u);best.stunT=Math.max(best.stunT,s.stun);hitFx(best.x,best.y,'#ff7aa8');}sfx('swish');break;}
    case 'rainbow':{const cols=['#ff5e87','#ffd23f','#6be39a','#5ec8ff','#b48cff'];for(let i=0;i<s.n;i++){const d=60+i*(s.range-60)/(s.n-1),x=u.x+ca*d,y=u.y+sa*d;if(isWall(x,y))break;createField(u,x,y,{radius:48,dur:5,dps:s.dps*m,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=cols[i%5];}sfx('lob');break;}
    case 'phoenix':u.dash={vx:ca*s.spd,vy:sa*s.spd,t:s.range/s.spd,dmg:s.dmg*m,kb:180,hit:new Set(),fire:{dps:s.dps*m,last:0}};addFx({k:'flash',x:u.x,y:u.y,r:60,t:0,T:.2,col:'#ff7a1a'});break;
    case 'mushring':createField(u,u.x,u.y,{radius:s.radius,dur:s.dur,dps:s.dps*m,heal:s.heal*u.mul,kind:'mush'});ringFx(u.x,u.y,u.rad,s.radius,.5,'#9dff6b',9);break;
    case 'scaffold':{const px=-sa,py=ca;for(let i=-1;i<=1;i++){const x=u.x+ca*95+px*i*48,y=u.y+sa*95+py*i*48;if(isWall(x,y))continue;const b=makeStruct('box',u.team,x,y,{rad:22,hp:s.hp,name:'Crate',owner:u});b.lifeT=s.life;b.crate=true;M.boxes.push(b);smoke(x,y,3,16);}sfx('thud');break;}
    case 'starfall':{const d=clamp(dh==null?s.range:dh,60,s.range),tx=u.x+ca*d,ty=u.y+sa*d;for(let i=0;i<s.n;i++){const fire=()=>{if(!M)return;const a2=rand(0,TAU),r2=rand(0,90);spawnLob(u,tx+Math.cos(a2)*r2,ty+Math.sin(a2)*r2,{flight:.5,dmg:s.dmg*m,splash:s.splash,color:'#ffd36b',style:'star'});};if(i===0)fire();else u.pending.push({t:i*.15,fn:fire});}break;}
    case 'shadowstep':{let best=null,bd=s.range;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}
      smoke(u.x,u.y,6,22,'#2a2238');if(best){const a2=Math.atan2(best.y-u.y,best.x-u.x),nx=best.x+Math.cos(a2)*(best.rad+u.rad+10),ny=best.y+Math.sin(a2)*(best.rad+u.rad+10);if(!hitsWall(nx,ny,u.rad)){u.x=nx;u.y=ny;}u.aim=a2+Math.PI;}
      u.cloakT=s.cloak;smoke(u.x,u.y,6,22,'#2a2238');break;}
    case 'darkdive':{u.dive={t:s.dur,tr:0};u.shield=s.dur;ringFx(u.x,u.y,u.rad,120,.5,'#5a2a8a',10);smoke(u.x,u.y,6,24,'#140a24');
      const vs=new Set();for(const p of M.trails)if(p.owner===u&&p.victim&&!p.victim.dead&&p.victim.team!==u.team)vs.add(p.victim);
      for(const v of vs){darkPoison(u,v,(u.mods.darkvenom?1029.41:s.dps)*u.dmgMul,s.dur);textFx(v.x,v.y-v.rad-30,'Darkness!','#c79bff',13);}break;}
    case 'beam':spawnShot(u,ang,{spd:s.spd,range:s.range*(1+u.mods.range),dmg:s.dmg*m,r:s.r,pierce:true,big:true,style:'beam'});muzzle(u,ang,u.sk.proj,true);break;
    case 'dash':u.dash={vx:ca*s.spd,vy:sa*s.spd,t:s.range/s.spd,dmg:s.dmg*m,kb:s.kb,hit:new Set()};break;
    case 'heal':ringFx(u.x,u.y,u.rad,s.radius,.5,'#6be39a',10);sparks(u.x,u.y,'#b6ffd2',24,s.radius*2,3);
      for(const a of M.units)if(a.team===u.team&&!a.dead&&dist(u.x,u.y,a.x,a.y)<s.radius+a.rad){heal(a,s.heal*m);for(let i=0;i<4;i++)addFx({k:'plus',x:a.x+rand(-18,18),y:a.y-rand(0,14),t:-i*.08,T:.9});}break;
    case 'bigbomb':{const d=clamp(dh==null?s.range:dh,60,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:s.dmg*m,splash:s.splash*(1+u.mods.splash),big:true});break;}
    case 'field':{const d=clamp(dh==null?s.range:dh,40,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:0,onLand:{radius:s.radius,dur:s.dur,dps:s.dps*m,slow:!s.pull,pull:s.pull||0,kind:s.pull?'hole':'storm'}});break;}
    case 'boomerang3':for(let i=0;i<s.n;i++){const off=-s.arc/2+s.arc*i/(s.n-1);spawnShot(u,ang+off,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,rang:true,big:true,style:'rang'});}break;
    case 'bigwave':spawnShot(u,ang,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,pierce:true,kb:s.kb,style:'wave',big:true});shakeAt(u.x,u.y,5);break;
    case 'chainbig':spawnShot(u,ang,{spd:s.spd,range:s.range,dmg:s.dmg*m,r:s.r,style:'spark',big:true,stun:s.stun,chain:{jumps:s.jumps+u.mods.chainplus,jumpR:s.jumpR,falloff:s.falloff,stun:s.stun}});muzzle(u,ang,u.sk.proj,true);break;
    case 'root':ringFx(u.x,u.y,u.rad,s.radius,.5,'#7ed957',10);for(let i=0;i<14;i++){const a2=i/14*TAU;addFx({k:'vine',x:u.x+Math.cos(a2)*s.radius*rand(.4,.95),y:u.y+Math.sin(a2)*s.radius*rand(.4,.95),t:0,T:1.4,rot:rand(0,TAU)});}shakeAt(u.x,u.y,6);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<s.radius+e.rad&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);stun(e,s.stun);}}break;
    case 'turret':{for(const t of M.structs)if(t.kind==='turret'&&t.owner===u&&!t.dead){t.dead=true;smoke(t.x,t.y,3,18);}
      let tx=u.x+ca*44,ty=u.y+sa*44;if(hitsWall(tx,ty,16)){tx=u.x;ty=u.y;}
      const k=1+u.mods.turretplus;makeStruct('turret',u.team,tx,ty,{rad:16,hp:Math.round(s.hp*m*k),t:s.dur,dmg:s.dmg*m*k,reach:s.reach,rate:s.rate,owner:u,name:'Sentry'});
      ringFx(tx,ty,8,60,.4,u.sk.proj,6);debris(tx,ty,'#c7cedb',6);sfx('build');break;}
    case 'shockcone':addFx({k:'cone',x:u.x,y:u.y,ang,arc:s.arc,r:s.range,t:0,T:.35,col:u.sk.proj});for(let i=0;i<3;i++)addFx({k:'cone',x:u.x,y:u.y,ang,arc:s.arc,r:s.range*(.4+i*.3),t:-i*.06,T:.3,col:'#ffffff'});shakeAt(u.x,u.y,8);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y),an=Math.atan2(e.y-u.y,e.x-u.x);if(d<s.range+e.rad&&Math.abs(angDiff(ang,an))<s.arc/2&&los(u.x,u.y,e.x,e.y)){hurt(e,s.dmg*m,u);stun(e,s.stun);knock(e,an,s.kb);}}break;
    case 'starzone':{const d=clamp(dh==null?s.range:dh,40,s.range);spawnLob(u,u.x+ca*d,u.y+sa*d,{flight:s.flight,dmg:0,onLand:{kind:'starzone',radius:s.radius,dur:s.dur+u.mods.zoneplus,dps:s.dps*m,poison:s.poison*m,poisonT:s.poisonT}});break;}
    case 'leap':{const e=leapTarget(u,ang),a2=Math.atan2(u.y-e.y,u.x-e.x);let tx=e.x+Math.cos(a2)*(e.rad+u.rad*.6),ty=e.y+Math.sin(a2)*(e.rad+u.rad*.6);if(hitsWall(tx,ty,u.rad)){tx=e.x;ty=e.y;}
      u.dash=null;u.kb=null;u.leap={x0:u.x,y0:u.y,tx,ty,t:0,T:s.T,h:0,dmg:s.dmg*m,radius:s.radius,heal:(s.heal||0)*u.mul*(u.mods.kind?1.5:1)};sfx('swish');break;}
    case 'thunder':{createField(u,u.x,u.y,{radius:s.radius,dur:s.dur,kind:'thunder',dps:s.dmg*m});const f=M.fields[M.fields.length-1];f.clouds=s.clouds;f.rate=s.rate;f.zt=.2;ringFx(u.x,u.y,20,s.radius,.6,'#8fd3ff',10);flashFx(u.x,u.y,s.radius,'#bfe6ff',.25);shakeAt(u.x,u.y,8);sfx('bigboom');break;}
    case 'grabthrow':{const e=grabTarget(u);stun(e,1.4);e.kb=null;e.thrown={phase:'grab',t:0,src:u,ang,vx:ca*s.spd,vy:sa*s.spd,spd:s.spd,max:tossDist(u),trav:0,h:0,dmg:s.dmg*m,min:s.min};
      ringFx(e.x,e.y,e.rad*2,e.rad,.25,'#ffd23f',6);textFx(u.x,u.y-u.rad-36,'Big Toss!','#ffd23f',15);sfx('swish');break;}
    case 'homebat':{let tgt=null,bd=s.seek;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden&&e.markT<=0)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;tgt=e;}}
      const a0=tgt?Math.atan2(tgt.y-u.y,tgt.x-u.x):ang;const sh=spawnShot(u,a0,{spd:s.spd,range:99999,dmg:s.dmg*m,r:15,pierce:true,big:true,style:'bat',color:'#c98f55'});
      sh.home={tgt,phase:'out',t:0,free:.55};sh.dmgBack=s.back*m;sh.poison=s.poison*m;sh.batDur=s.dur;u.aim=a0;sfx('swish');break;}
    case 'meteor':{const d=clamp(dh==null?s.range*.7:dh,0,s.range);const tx=clamp(u.x+ca*d,30,MW-30),ty=clamp(u.y+sa*d,30,MH-30);
      M.shots.push({lob:true,team:u.team,owner:u,sx:tx,sy:ty,x:tx,y:ty,h:700,tx,ty,t:0,T:s.flight,dmg:0,splash:s.radius,big:true,r:22,color:'#ff7a1a',onLand:{kind:'meteor',radius:s.radius},seen:null,style:'meteor'});sfx('super');break;}
    case 'dam':{const d=clamp(dh==null?140:dh,0,s.range);let x=u.x+ca*d,y=u.y+sa*d;x=clamp(x,40,MW-40);y=clamp(y,40,MH-40);const lodge=u.mods.lodge;
      createField(u,x,y,{radius:s.radius,dur:s.dur+(lodge?3:0),kind:'dam',heal:s.heal*(lodge?2:1),speed:s.speed,dps:s.dps*m,poison:s.poison*m,poisonT:s.poisonT});break;}
  }
  return true;
}

/* ---------- Gadgets & pins ---------- */
function useGadget(u,dir){
  if(NETC&&u===P){netAct('gad',dir);return;}
  if(!M||M.state!=='play'||u.dead||!u.gadget||u.gUses<=0||u.gCd>0||u.stunT>0)return false;
  SFXU=u;const g=u.gadget;u.gUses--;u.gCd=5;
  ringFx(u.x,u.y,u.rad,u.rad*2.6,.35,'#6be39a',5);sparks(u.x,u.y,'#b6ffd2',10,200,2.5);textFx(u.x,u.y-u.rad-34,g.name,'#9ff5bf',12);sfx('gadget');
  if((g.type==='darkvirus'||g.type==='darkreveal')&&!u.dive){u.gUses++;u.gCd=0;textFx(u.x,u.y-u.rad-50,'Use it during Dark Dive','#d9c2ff',12);return false;}
  switch(g.type){
    case 'darkvirus':for(const e of M.units){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<230)darkPoison(u,e,g.val*u.mul,5);}ringFx(u.x,u.y,u.rad,230,.5,'#5a2a8a',9);break;
    case 'darkreveal':for(const e of M.units){if(e.team===u.team||e.dead)continue;if(e.darkT>0||e.poisonT>0){e.markT=Math.max(e.markT,g.val);e.darkX=g.val;}}break;
    case 'heal':heal(u,u.maxHp*g.val);break;
    case 'shield':u.guardT=2.5;break;
    case 'speed':u.boostT=3;break;
    case 'reload':u.ammo=u.maxAmmo;break;
    case 'pickrarity':{const l=trickRarList(u);if(u===P&&typeof openRarPick==='function')openRarPick(l);else forceTrickAtk(u,l[l.length-1]);break;}
    case 'healzone':createField(u,u.x,u.y,{radius:130,dur:4,kind:'healzone',heal:g.val*u.mul});ringFx(u.x,u.y,20,130,.5,'#6be39a',8);break;
    case 'reloadzone':createField(u,u.x,u.y,{radius:130,dur:4,kind:'reloadzone',speed:g.val});ringFx(u.x,u.y,20,130,.5,'#ffd23f',8);break;
    case 'dash':{let a=dir;if(a==null)a=u.moving?Math.atan2(u.vy,u.vx):u.aim;u.dash={vx:Math.cos(a)*900,vy:Math.sin(a)*900,t:g.val/900,dmg:0,kb:0,hit:new Set()};break;}
    case 'blast':ringFx(u.x,u.y,u.rad,140,.35,u.sk.proj,9);flashFx(u.x,u.y,120,u.sk.proj,.2);shakeAt(u.x,u.y,5);
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<140+e.rad){hurt(e,g.val*u.mul,u);knock(e,Math.atan2(e.y-u.y,e.x-u.x),200);}}break;
    case 'slowfield':createField(u,u.x,u.y,{radius:g.val,dur:3,dps:0,slow:true,kind:'storm'});break;
    case 'pull':ringFx(u.x,u.y,g.val,u.rad,.4,'#c9b5ff',6);for(const e of M.units){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<g.val)knock(e,Math.atan2(u.y-e.y,u.x-e.x),420);}break;
    case 'reveal':for(const e of M.units){if(e.team===u.team||e.dead)continue;e.markT=g.val;addFx({k:'mark',x:e.x,y:e.y,t:0,T:.6});}sfx('mark');break;
    case 'shotgun':{let best=null,bd=380;for(const e of foesOf(u.team)){if(e.isStruct)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd&&los(u.x,u.y,e.x,e.y)){bd=d;best=e;}}
      const a=best?Math.atan2(best.y-u.y,best.x-u.x):u.aim;u.aim=a;
      for(let i=0;i<6;i++)spawnShot(u,a+(-.3+.6*i/5)+rand(-.03,.03),{spd:900,range:340,dmg:320*u.mul,r:6,style:'pellet',stun:g.val,color:'#ffe08a'});
      muzzle(u,a,'#ffe08a',true);smoke(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,3,16,'#8a8299');shakeAt(u.x,u.y,7);sfx('shotgun');break;}
  }
  if(u.b.random&&!u.trickPick)trickGadget(u);
  return true;
}
function sendPin(u,id){if(NETC&&u===P){netAct('pin',null,null,id);return;}if(!M||u.pinCd>0||u.dead)return;u.pin=id;u.pinT=2.6;u.pinCd=3;if(u===P)sfx('pin');}

/* Lil T's bat: slow, +25% damage taken, and poison, all for the bat's duration */
function batHit(s,e,dmg){
  hurt(e,dmg,s.owner);batEffects(s.owner,e,s.poison,s.batDur);
  hitFx(e.x,e.y,'#ffd36b');ringFx(e.x,e.y,8,60,.35,'#9be35a',6);sparks(e.x,e.y,'#c98f55',10,260,3);textFx(e.x,e.y-e.rad-30,'BONK!','#ffd36b',18);shakeAt(e.x,e.y,6);sfx('crack');
}
function nearestFoeUnit(team,x,y,max){let best=null,bd=max;for(const e of M.units){if(e.team===team||e.dead||e.hidden&&e.markT<=0)continue;const d=dist(x,y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best;}
function batEffects(owner,e,poison,dur){if(e.dead)return;slowE(e,dur,owner);e.vulnT=Math.max(e.vulnT,dur);e.poisonT=dur;e.poisonDmg=poison;e.poisonSrc=owner;e.poisonTick=1;ringFx(e.x,e.y,6,40,.3,'#9be35a',4);}
/* Orion's star splits toward up to n enemies standing near the one it hit */
function spreadStar(s,t){
  const near=M.ents.filter(e=>e.team!==s.team&&!e.dead&&e!==t&&e.kind!=='core'&&!s.hit.has(e.id)&&dist(t.x,t.y,e.x,e.y)<s.spread.r).sort((a,b)=>dist(t.x,t.y,a.x,a.y)-dist(t.x,t.y,b.x,b.y)).slice(0,s.spread.n);
  for(const e of near){const d=dist(t.x,t.y,e.x,e.y);spawnShot(s.owner,Math.atan2(e.y-t.y,e.x-t.x),{x:t.x,y:t.y,spd:900,range:d*1.8+90,dmg:s.dmg,r:8,slow:s.slow,color:s.color,style:'star',hit:[t.id],seek:e,ghost:true});}
  if(near.length){ringFx(t.x,t.y,8,s.spread.r,.35,s.color,4);sparks(t.x,t.y,s.color,10,240,2.5);}
}
/* Solo Showdown energy cubes: each one adds 10% damage and 10% max health */
function dropCube(x,y,spd){const a=rand(0,TAU),v=spd?rand(spd*.5,spd):0;M.cubes.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,cd:.35,t:0,ph:rand(0,6)});}
function addCube(u,shared){if(u.dead)return;u.cubes++;const old=u.maxHp;u.maxHp=Math.round(u.baseHp*(1+.1*u.cubes));u.hp=Math.min(u.maxHp,u.hp+(u.maxHp-old));u.dmgMul=u.baseDmg*(1+.1*u.cubes);
  textFx(u.x,u.y-u.rad-42,shared?'+1 team cube':'+1 cube','#7fd3ff',14);sparks(u.x,u.y,'#7fd3ff',10,200,2.5);ringFx(u.x,u.y,u.rad,u.rad*2.4,.35,'#7fd3ff',4);if(u===P)sfx('pickup');}
/* In Duo and Trio, one pickup gives every teammate who's standing a cube too */
function teamCube(u){addCube(u);if(M.mode.size>1)for(const m of M.units)if(m!==u&&m.team===u.team&&!m.shadow)addCube(m,true);}
/* Showdown teams: a knocked-out rumbler comes back while a teammate stands; the team is out when all are down at once */
function sdTeamsLeft(){let n=0;for(let k=0;k<M.nTeams;k++)if(!M.elim[k])n++;return n;}
function sdRespawn(t){const mates=M.units.filter(u=>u.team===t.team&&!u.shadow);
  if(mates.every(u=>u.dead)){for(const u of mates)u.respawn=Infinity;M.elim[t.team]=true;if(t.team===0&&!M.place)M.place=sdTeamsLeft()+1;
    if(M.mode.size>1&&t.team!==0&&M.state==='play')textFx(t.x,t.y-50,'Team out!','#ffa6a2',16);return Infinity;}
  return 10;}

/* ---------- Modes ---------- */
const ZR=115,PAD_R=62;
const inZone=u=>dist(u.x,u.y,ZX,ZY)<ZR;
function modeSetup(){
  const id=M.mode.id;
  if(id==='core'){M.cores=[0,1].map(t=>makeStruct('core',t,(MAP.cores||[[500,1460],[500,140]])[t][0],(MAP.cores||[[500,1460],[500,140]])[t][1],{rad:36,hp:45000,name:'Core'}));
    for(const t of[0,1]){const bots=M.units.filter(u=>u.team===t&&u.ai);if(bots[0])bots[0].ai.role='def';}}
  if(id==='crown')M.crown={x:ZX,y:ZY,carrier:null,cd:0,live:false};
  if(id==='stand'||id==='knockout')M.storm={r:1000};
  if(id==='knockout'){M.round=1;M.roundT=0;}
  if(id==='hunt')for(const u of M.units)u.bounty=2;
  if(id==='boss'||id==='duel'){const foes=M.units.filter(u=>u.team===1),mates=M.units.filter(u=>u.team===0&&u!==P);const keep=foes[0];
    const drop=id==='boss'?foes.slice(1):foes.slice(1).concat(mates);M.units=M.units.filter(u=>!drop.includes(u));M.ents=M.ents.filter(u=>!drop.includes(u));
    if(id==='boss'&&keep){keep.boss=true;keep.maxHp=Math.round(keep.maxHp*10);keep.hp=keep.maxHp;keep.baseHp=keep.maxHp;keep.rad=Math.round(keep.rad*1.7);keep.dmgMul*=1.4;keep.baseDmg=keep.dmgMul;keep.name='Giant '+keep.b.name;keep.lvl=MAX_LVL;if(keep.ai)keep.ai.skill=SKILL.insane;}}
  if(id==='chaos')for(const u of M.units)u.super=1;
  if(id==='bounty')for(const u of M.units)u.streak=0;
  if(M.mode.sd){M.storm={r:960,fill:'rgba(40,150,70,.42)',edge:'rgba(150,255,170,.85)',fog:'#2f9a4f'};M.boxes=MAP.boxes.map(b=>makeStruct('box',99,b[0],b[1],{rad:22,hp:1000,name:'Box'}));}
}
function own(team,arr){return arr[team===0?0:1];}
function modeOnKill(t,c){const id=M.mode.id;if(M.state!=='play')return;
  if(id==='ring')M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+5);
  else if(id==='rush'||id==='frenzy'||id==='try'||id==='chaos'||id==='duel')M.score[c.team]++;
  else if(id==='hunt'){const v=t.bounty||2;M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+v);if(!c.shadow&&!c.isStruct)c.bounty=Math.min(7,(c.bounty||2)+1);t.bounty=2;textFx(t.x,t.y-t.rad-40,'+'+v+'\u2605',c.team===MYT?'#8fd3ff':'#ffa6a2',16);}
  else if(id==='bounty'){const v=1;M.score[c.team]=Math.min(M.mode.goal,M.score[c.team]+v);c.streak=(c.streak||0)+1;t.streak=0;if(c===P||t===P)textFx(t.x,t.y-t.rad-40,'+'+v+'\u2605',c.team===0?'#8fd3ff':'#ffa6a2',16);}
}
function modeOnDeath(t){
  if(M.mode.sd&&!t.shadow){const n=Math.max(1,Math.ceil(t.cubes/2));for(let i=0;i<n;i++)dropCube(t.x,t.y,150);t.cubes=0;t.maxHp=Math.round(t.baseHp*(1+.1*t.cubes));t.dmgMul=t.baseDmg*(1+.1*t.cubes);}
  if(t.carry>0){for(let i=0;i<t.carry;i++){const a=rand(0,TAU),v=rand(60,160);M.items.push({x:t.x,y:t.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,cd:.5,t:0,ph:rand(0,6)});}t.carry=0;}
  if(M.crown&&M.crown.carrier===t){M.crown.carrier=null;M.crown.x=t.x;M.crown.y=t.y;M.crown.cd=.6;ringFx(t.x,t.y,10,60,.4,'#ffd23f',5);}
}
/* Knockout: everyone comes back at their spawn for the next round */
function nextRound(w){M.round=(M.round||1)+1;M.roundT=0;M.storm.r=1000;M.units=M.units.filter(u=>!u.shadow);M.shots.length=0;M.fields.length=0;if(M.trails)M.trails.length=0;
  for(const u of M.units){respawnUnit(u);u.shield=2.5;u.super=Math.min(1,u.super);}
  textFx(ZX,ZY-60,w==null?'Draw! Round '+M.round:(w===MYT?'Round won!':'Round lost')+' \u00b7 Round '+M.round,'#ffd23f',26);sfx('go');}
function alive(team){return M.units.filter(u=>u.team===team&&!u.dead&&!u.shadow).length;}
function endIf(){
  const m=M.mode,id=m.id,s=M.score,out=M.time<=0;
  if(id==='try'){if(out)return endMatch(-1);return;}
  if(M.mode.sd){
    if(M.elim[0]&&!NETS)return endMatch(null);
    const left=[];for(let k=0;k<M.nTeams;k++)if(!M.elim[k])left.push(k);
    if(left.length<=1){M.place=1;return endMatch(null);}
    if(out){const tc=k=>M.units.filter(u=>u.team===k&&!u.shadow).reduce((n,u)=>n+u.cubes,0),mine=tc(0);M.place=1+left.filter(k=>k!==0&&tc(k)>mine).length;return endMatch(null);}return;}
  if(m.ffa){const top=Math.max(...s);if(top>=m.goal||out)return endMatch(null);return;}
  if(id==='core'){const d0=M.cores[0].dead,d1=M.cores[1].dead;if(d0||d1)return endMatch(d0&&d1?-1:d1?0:1);
    if(out){const a=M.cores[0].hp/M.cores[0].maxHp,b=M.cores[1].hp/M.cores[1].maxHp;return endMatch(Math.abs(a-b)<.01?-1:a>b?0:1);}return;}
  if(id==='boss'){const g=M.units.find(u=>u.boss);if(!g||g.dead)return endMatch(0);if(out)return endMatch(1);return;}
  if(id==='knockout'){const a=alive(0),b=alive(1);
    if(!a||!b){if(a)s[0]++;else if(b)s[1]++;if(s[0]>=m.goal||s[1]>=m.goal)return endMatch(s[0]>s[1]?0:1);if(out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);return nextRound(!a&&!b?null:a?0:1);}
    if(out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:a>b?0:b>a?1:-1);return;}
  if(id==='hunt'){if(s[0]>=m.goal||s[1]>=m.goal||out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);return;}
  if(id==='stand'){const a=alive(0),b=alive(1);if(!a||!b)return endMatch(!a&&!b?-1:a?0:1);
    if(out){if(a!==b)return endMatch(a>b?0:1);const h=t=>M.units.filter(u=>u.team===t&&!u.dead).reduce((n,u)=>n+u.hp/u.maxHp,0);const ha=h(0),hb=h(1);return endMatch(Math.abs(ha-hb)<.05?-1:ha>hb?0:1);}return;}
  if(s[0]>=m.goal||s[1]>=m.goal||out)return endMatch(s[0]>s[1]?0:s[1]>s[0]?1:-1);
}
function modeTick(dt){
  const id=M.mode.id;
  if(id==='ring'){M.tick+=dt;while(M.tick>=.5){M.tick-=.5;const c=[0,0];for(const u of M.units)if(!u.dead&&!u.shadow&&inZone(u))c[u.team]++;
    if(c[0]&&c[1])M.zone='contested';else if(c[0]){M.zone='blue';M.score[0]=Math.min(100,M.score[0]+1);}else if(c[1]){M.zone='red';M.score[1]=Math.min(100,M.score[1]+1);}else M.zone='empty';}}
  else if(id==='battery'){
    M.battT-=dt;if(M.battT<=0&&M.items.length<8){const[x,y]=openPoint(ZX,ZY,0,70);M.items.push({x,y,vx:0,vy:0,cd:.3,t:0,ph:rand(0,6)});ringFx(x,y,4,30,.35,'#5ce1a0',4);M.battT=3;}
    for(let i=M.items.length-1;i>=0;i--){const it=M.items[i];it.t+=dt;it.cd-=dt;if(it.vx||it.vy){const nx=it.x+it.vx*dt,ny=it.y+it.vy*dt;if(!hitsWall(nx,ny,8)){it.x=nx;it.y=ny;}it.vx*=1-Math.min(1,dt*4);it.vy*=1-Math.min(1,dt*4);}
      if(it.cd>0)continue;for(const u of M.units){if(u.dead||u.shadow)continue;if(dist(u.x,u.y,it.x,it.y)<u.rad+16){u.carry++;M.items.splice(i,1);sparks(it.x,it.y,'#5ce1a0',8,180,2.5);if(u===P)sfx('pickup');break;}}}
    for(const u of M.units){if(u.dead||!u.carry)continue;const pd=own(u.team,(MAP.pads||[[500,1505],[500,95]]));if(dist(u.x,u.y,pd[0],pd[1])<PAD_R){M.score[u.team]=Math.min(M.mode.goal,M.score[u.team]+u.carry);textFx(pd[0],pd[1]-40,'+'+u.carry,u.team===0?'#8fd3ff':'#ffa6a2',20);ringFx(pd[0],pd[1],10,PAD_R*1.4,.5,'#5ce1a0',6);sparks(pd[0],pd[1],'#5ce1a0',18,260,3);u.carry=0;sfx('score');}}
  }
  else if(id==='crown'){const cr=M.crown;if(!cr.live){cr.live=true;ringFx(ZX,ZY,10,90,.6,'#ffd23f',8);}
    cr.cd-=dt;if(cr.carrier){cr.x=cr.carrier.x;cr.y=cr.carrier.y;}
    else if(cr.cd<=0){let best=null,bd=28;for(const u of M.units){if(u.dead||u.shadow)continue;const d=dist(u.x,u.y,cr.x,cr.y);if(d<u.rad+bd){bd=d;best=u;}}if(best){cr.carrier=best;best.hasCrown=true;ringFx(best.x,best.y,10,70,.45,'#ffd23f',6);sfx('pickup');}}
    M.units.forEach(u=>{u.hasCrown=cr.carrier===u;});
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;if(cr.carrier)M.score[cr.carrier.team]=Math.min(M.mode.goal,M.score[cr.carrier.team]+1);}}
  else if(M.mode.sd){const el=M.mode.time-M.time;M.storm.r=el<5?960:Math.max(0,960*(1-(el-5)/130));
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;for(const u of M.units){if(u.dead)continue;if(dist(u.x,u.y,ZX,ZY)>M.storm.r){hurt(u,500,null,true);addFx({k:'smoke',x:u.x+rand(-10,10),y:u.y,vx:0,vy:-30,t:0,T:.6,s:14,col:'#3fbf6a'});}}}
    for(let i=M.cubes.length-1;i>=0;i--){const c=M.cubes[i];c.t+=dt;c.cd-=dt;if(c.vx||c.vy){const nx=c.x+c.vx*dt,ny=c.y+c.vy*dt;if(!hitsWall(nx,ny,8)){c.x=nx;c.y=ny;}c.vx*=1-Math.min(1,dt*4);c.vy*=1-Math.min(1,dt*4);}
      if(c.cd>0)continue;for(const u of M.units){if(u.dead||u.shadow)continue;if(dist(u.x,u.y,c.x,c.y)<u.rad+16){teamCube(u);M.cubes.splice(i,1);break;}}}}
  else if(id==='stand'||id==='knockout'){if(id==='knockout')M.roundT=(M.roundT||0)+dt;const el=id==='knockout'?M.roundT:M.mode.time-M.time;M.storm.r=el<(id==='knockout'?30:40)?1000:Math.max(150,1000-(el-(id==='knockout'?30:40))/(id==='knockout'?45:70)*850);
    M.tick+=dt;while(M.tick>=.5){M.tick-=.5;for(const u of M.units){if(u.dead)continue;if(dist(u.x,u.y,ZX,ZY)>M.storm.r){hurt(u,u.maxHp*.07,null);addFx({k:'smoke',x:u.x+rand(-10,10),y:u.y,vx:0,vy:-30,t:0,T:.6,s:14,col:'#7a3fbf'});}}}}
  endIf();
}
function modeObjective(u){
  const id=M.mode.id,ai=u.ai;
  if(id==='ring'){if(!ai.zp||Math.random()<.002)ai.zp=openPoint(ZX,ZY,0,78);return ai.zp;}
  if(id==='boss'){const g=M.units.find(x=>x.boss&&!x.dead);if(u.boss){let best=null,bd=900;for(const e of M.units){if(e.team===u.team||e.dead)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}return best?[best.x,best.y]:[ZX,ZY];}if(g)return[g.x,g.y];}
  if(id==='duel'||id==='chaos'||id==='bounty'||id==='hunt'||id==='rush'){let best=null,bd=900;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}if(best&&id==='duel')return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,260);return ai.zp;}
  if(id==='rush'||id==='try'){if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,260);return ai.zp;}
  if(id==='frenzy'){let best=null,bd=750;for(const e of M.units){if(e===u||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<bd){bd=d;best=e;}}if(best)return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,300);return ai.zp;}
  if(M.mode.sd){
    let best=null,bd=420;for(const c of M.cubes){if(dist(c.x,c.y,ZX,ZY)>M.storm.r-30)continue;const d=dist(u.x,u.y,c.x,c.y);if(d<bd){bd=d;best=c;}}if(best)return[best.x,best.y];
    let bx=null,bb=750;for(const b of M.boxes){if(b.dead||dist(b.x,b.y,ZX,ZY)>M.storm.r-40)continue;const d=dist(u.x,u.y,b.x,b.y);if(d<bb){bb=d;bx=b;}}
    if(bx){const a=Math.atan2(u.y-bx.y,u.x-bx.x),R=Math.max(55,Math.min(rangeOf(u)*.7,220));return[bx.x+Math.cos(a)*R,bx.y+Math.sin(a)*R];}
    const lim=Math.max(90,M.storm.r*.55);if(!ai.zp||dist(ai.zp[0],ai.zp[1],ZX,ZY)>lim||Math.random()<.003)ai.zp=openPoint(ZX,ZY,0,lim);return ai.zp;}
  if(id==='stand'||id==='knockout'){const lim=Math.min(260,M.storm.r*.55);if(!ai.zp||dist(ai.zp[0],ai.zp[1],ZX,ZY)>lim||Math.random()<.003)ai.zp=openPoint(ZX,ZY,0,lim);return ai.zp;}
  if(id==='battery'){const pd=own(u.team,(MAP.pads||[[500,1505],[500,95]]));
    if(u.carry>=3||(u.carry>0&&(M.score[u.team]+u.carry>=M.mode.goal||u.hp/u.maxHp<.45)))return pd;
    let best=null,bd=1e9;for(const it of M.items){const d=dist(u.x,u.y,it.x,it.y);if(d<bd){bd=d;best=it;}}
    if(best)return[best.x,best.y];if(!ai.zp||Math.random()<.004)ai.zp=openPoint(ZX,ZY,0,110);return ai.zp;}
  if(id==='crown'){const cr=M.crown;if(cr.carrier===u)return u.spawn;if(cr.carrier&&cr.carrier.team===u.team)return[cr.carrier.x+Math.cos(u.phase)*70,cr.carrier.y+Math.sin(u.phase)*70];return[cr.x,cr.y];}
  if(id==='core'){const mine=own(u.team,M.cores),theirs=own(1-u.team,M.cores);
    const threat=M.units.some(e=>e.team!==u.team&&!e.dead&&dist(e.x,e.y,mine.x,mine.y)<380);
    if(ai.role==='def'||threat&&dist(u.x,u.y,mine.x,mine.y)<500){if(!ai.dp||Math.random()<.004)ai.dp=openPoint(mine.x,mine.y+(u.team===0?-110:110),0,70);return ai.dp;}
    const R=rangeOf(u)*.8,a=Math.atan2(u.y-theirs.y,u.x-theirs.x);return[theirs.x+Math.cos(a)*R,theirs.y+Math.sin(a)*R];}
  return[ZX,ZY];
}
function modeHud(){
  const m=M.mode,id=m.id,s0=M.score,s=MYT===1&&!m.ffa&&!m.sd?[s0[1],s0[0]]:s0;
  if(M.mode.sd){const alive=M.units.filter(u=>!u.dead&&!u.shadow).length,el=m.time-M.time,cb=P?P.cubes:0,tl=sdTeamsLeft(),team=m.size>1;
    return{l:team?tl/m.teams:alive/(m.players||8),r:Math.min(1,cb/10),lt:team?tl+' teams left':alive+' left',rt:'Cubes '+cb,msg:el<5?'Storm in '+Math.ceil(5-el)+'s · break boxes for energy cubes':M.storm.r>0?'The green storm is closing in':'The storm covers everything!'};}
  if(m.ffa){const mine=s[MYT],others=s.filter((_,i)=>i!==MYT),top=Math.max(...others),place=1+others.filter(v=>v>mine).length;
    return{l:mine/m.goal,r:top/m.goal,lt:'You '+mine,rt:'Leader '+top,msg:'You are '+ORD[place-1]+' of 6'};}
  if(id==='try')return{l:Math.min(1,s[0]/10),r:0,lt:'Takedowns '+s[0],rt:'Training',msg:'Trying '+P.b.name+' at level '+MAX_LVL+' · no rewards'};
  if(id==='core'){const a=M.cores[MYT],b=M.cores[1-MYT],pa=Math.max(0,a.hp/a.maxHp),pb=Math.max(0,b.hp/b.maxHp);return{l:pa,r:pb,lt:'Core '+Math.ceil(pa*100)+'%',rt:Math.ceil(pb*100)+'% Core',msg:'Smash the red core'};}
  if(id==='boss'){const g=M.units.find(u=>u.boss),pg=g?Math.max(0,g.hp/g.maxHp):0;return{l:alive(MYT)/3,r:pg,lt:alive(MYT)+' standing',rt:'Giant '+Math.ceil(pg*100)+'%',msg:'Take down the '+(g?g.name:'giant')+'!'};}
  if(id==='duel')return{l:s[0]/m.goal,r:s[1]/m.goal,lt:'You '+s[0],rt:s[1]+' Them',msg:'First to '+m.goal+' takedowns'};
  if(id==='knockout'){const a=alive(MYT),b=alive(1-MYT);return{l:s[0]/m.goal,r:s[1]/m.goal,lt:'Rounds '+s[0],rt:s[1]+' Rounds',msg:'Round '+(M.round||1)+' \u00b7 '+a+' vs '+b+' left'+((M.roundT||0)>25?' \u00b7 storm!':'')};}
  if(id==='hunt')return{l:s[0]/m.goal,r:s[1]/m.goal,lt:s[0]+' / '+m.goal+' \u2605',rt:s[1]+' / '+m.goal+' \u2605',msg:'First to '+m.goal+' stars \u00b7 bigger bounties are worth more'};
  if(id==='stand'){const a=alive(MYT),b=alive(1-MYT),el=m.time-M.time;return{l:a/3,r:b/3,lt:a+' left',rt:b+' left',msg:el<40?'Storm in '+Math.ceil(40-el)+'s':'The storm is closing in'};}
  const g=m.goal,base={l:s[0]/g,r:s[1]/g,lt:String(s[0]),rt:String(s[1])};
  if(id==='ring')base.msg={blue:'Your team holds the ring',red:'Enemies hold the ring',contested:'Ring contested',empty:'Grab the ring'}[MYT&&M.zone==='blue'?'red':MYT&&M.zone==='red'?'blue':M.zone];
  else if(id==='bounty')base.msg='Stars '+s[0]+' / '+g+' \u00b7 every takedown is a star';
  else if(id==='chaos')base.msg='Supers charge 4\u00d7 faster!';
  else if(id==='battery'){base.lt=s[0]+' / '+g;base.rt=s[1]+' / '+g;base.msg=P&&P.carry?'You carry '+P.carry+' — bring them to your charger':'Grab batteries from the middle';}
  else if(id==='crown'){const c=M.crown.carrier;base.msg=!c?'The crown is free':c===P?'You have the crown!':c.team===MYT?c.name+' has the crown':'Enemy '+c.name+' has the crown';}
  else if(id==='rush')base.msg='First to '+g+' takedowns';
  return base;
}

/* ---------- Bot AI ---------- */
function rangeOf(u){const a=u.b.atk;return(a.kind==='melee'||a.kind==='pulse'||a.kind==='starslash'?a.range+20:a.range)*(1+u.mods.range);}
function aimAt(u,t,spec,sk){
  let px=t.x,py=t.y;const d=dist(u.x,u.y,t.x,t.y);
  if(spec.spd){const tt=d/spec.spd;px+=t.vx*tt*sk.lead;py+=t.vy*tt*sk.lead;}else if(spec.flight){px+=t.vx*spec.flight*sk.lead;py+=t.vy*spec.flight*sk.lead;}
  return[Math.atan2(py-u.y,px-u.x)+(Math.random()*2-1)*sk.aimErr,dist(u.x,u.y,px,py)];
}
function autoAim(u,kind){
  if(kind==='sup'&&u.b.sup.kind==='leap'){const e=leapTarget(u);return[e?Math.atan2(e.y-u.y,e.x-u.x):u.aim,0];}
  if(kind==='sup'&&u.b.sup.kind==='grabthrow')return[bestThrowAngle(u),0];
  const spec=kind==='atk'?u.b.atk:u.b.sup,range=(spec.range||spec.radius||300)*(1+u.mods.range);
  const noLos=['lob','orbs','meteor','bigbomb','nova','heal','field','root','pulse','dam'].includes(spec.kind);
  let best=null,bd=1e9;
  for(const e of foesOf(u.team)){if(e.hidden||e.kind==='core'&&M.units.some(x=>x.team!==u.team&&!x.dead&&dist(u.x,u.y,x.x,x.y)<range))continue;const d=dist(u.x,u.y,e.x,e.y),sc=d+(e.isStruct&&e.kind!=='core'?150:0);if(d<range*1.25&&sc<bd&&(noLos||los(u.x,u.y,e.x,e.y))){bd=sc;best=e;}}
  if(!best)return[u.aim,spec.kind==='dam'?140:range*.8];
  return aimAt(u,best,spec,{lead:.75,aimErr:0});
}
function setMode(u,m){u.ai.mode=m;}
function think(u){
  const ai=u.ai,sk=ai.skill,lob=u.b.atk.kind==='lob'||u.b.atk.kind==='orbs',id=M.mode.id;
  let best=null,bs=1e9;
  const nearUnit=M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<260);
  for(const e of foesOf(u.team)){
    if(e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d>(sk.sight||680))continue;
    let s=d;
    if(e.isStruct){if(e.kind==='core'){if(nearUnit||d>rangeOf(u)+160)continue;s+=120;}else s+=110;}
    else{s-=(1-e.hp/e.maxHp)*160*(sk.focus??1);if(M.units.some(m=>m!==u&&m.ai&&m.team===u.team&&m.ai.target===e))s-=90*(sk.focus??1);if(e.super>=1&&d<400)s-=40;if(e.hasCrown)s-=220;s-=e.carry*45;if(id==='ring'&&inZone(e))s-=60;}
    if(!(lob||los(u.x,u.y,e.x,e.y)))s+=220;
    if(s<bs){bs=s;best=e;}
  }
  ai.target=best;
  const hpR=u.hp/u.maxHp,near=M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<460);
  if(ai.mode==='retreat'){if(hpR>.85||(!near&&hpR>.6))setMode(u,'objective');return;}
  if(hpR<sk.retreat&&near&&u.super<1&&id!=='stand'&&!M.mode.sd){setMode(u,'retreat');return;}
  if(id==='battery'&&u.carry>=3&&!(best&&!best.isStruct&&dist(u.x,u.y,best.x,best.y)<190)){setMode(u,'objective');return;}
  if(id==='crown'&&M.crown.carrier===u&&!(best&&dist(u.x,u.y,best.x,best.y)<rangeOf(u))){setMode(u,'objective');return;}
  if(best){const d=dist(u.x,u.y,best.x,best.y),reach=rangeOf(u)+(ai.mode==='fight'?260:180);setMode(u,d<reach?'fight':'objective');}else setMode(u,'objective');
}
function scanDodge(u){
  const ai=u.ai;if(ai.dodgeT>0)return;
  for(const s of M.shots){
    if(s.team===u.team||(s.seen&&s.seen.has(u.id)))continue;
    if(s.lob){if(dist(s.tx,s.ty,u.x,u.y)<s.splash+u.rad+10&&s.T-s.t<.6){(s.seen||(s.seen=new Set())).add(u.id);if(Math.random()<ai.skill.dodge){const a=Math.atan2(u.y-s.ty,u.x-s.tx);ai.dvx=Math.cos(a)*1.4;ai.dvy=Math.sin(a)*1.4;ai.dodgeT=.45;return;}}continue;}
    const dx=u.x-s.x,dy=u.y-s.y;if(dx*dx+dy*dy>240*240)continue;
    const sp=Math.hypot(s.vx,s.vy)||1;if((dx*s.vx+dy*s.vy)/sp<=0)continue;
    const cross=dx*s.vy-dy*s.vx;if(Math.abs(cross)/sp>u.rad+s.r+12)continue;
    (s.seen||(s.seen=new Set())).add(u.id);
    if(Math.random()<ai.skill.dodge){const side=Math.sign(cross)||(Math.random()<.5?1:-1);ai.dvx=s.vy/sp*side*1.5;ai.dvy=-s.vx/sp*side*1.5;ai.dodgeT=.35;return;}
  }
}
function aiSuper(u,tgt,sk){
  const s=u.b.sup,foes=foesOf(u.team).filter(e=>!e.hidden),d=tgt?dist(u.x,u.y,tgt.x,tgt.y):1e9,see=tgt&&los(u.x,u.y,tgt.x,tgt.y);
  switch(s.kind){
    case 'nova':case 'root':if(foes.some(e=>dist(u.x,u.y,e.x,e.y)<s.radius*.8))trySuper(u,u.aim,0);break;
    case 'heal':{const mates=M.units.filter(a=>a.team===u.team&&!a.dead&&dist(u.x,u.y,a.x,a.y)<s.radius),low=mates.filter(a=>a.hp/a.maxHp<.55);if(low.length&&(low.length>=2||u.hp/u.maxHp<.45||mates.some(a=>a!==u&&a.hp/a.maxHp<.4)))trySuper(u,u.aim,0);break;}
    case 'dam':if(tgt&&d<320||u.hp/u.maxHp<.5&&tgt){const[a]=tgt?aimAt(u,tgt,{},sk):[u.aim];trySuper(u,a,Math.min(d*.6,s.range));}break;
    case 'starzone':if(tgt&&!tgt.isStruct&&d<s.range*.92){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'leap':{const e=leapTarget(u);if(e)trySuper(u,Math.atan2(e.y-u.y,e.x-u.x),0);break;}
    case 'thunder':if(foes.filter(e=>!e.isStruct&&dist(u.x,u.y,e.x,e.y)<s.radius*.75).length)trySuper(u,u.aim,0);break;
    case 'grabthrow':if(grabTarget(u))trySuper(u,bestThrowAngle(u),0);break;
    case 'homebat':if(M.units.some(e=>e.team!==u.team&&!e.dead&&!e.hidden&&dist(u.x,u.y,e.x,e.y)<s.seek*.85))trySuper(u,u.aim,0);break;
    case 'meteor':if(tgt&&!tgt.isStruct&&d<s.range*.9){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'turret':if(tgt&&d<s.reach)trySuper(u,u.aim,0);break;
    case 'shockcone':if(tgt&&d<s.range*.85&&see){const[a]=aimAt(u,tgt,{},sk);trySuper(u,a,d);}break;
    case 'beam':case 'bigbomb':case 'field':case 'boomerang3':case 'bigwave':case 'chainbig':if(tgt&&d<(s.range||300)*.92&&(see||s.kind==='bigbomb'||s.kind==='field')){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'magnet':case 'sawring':case 'mushring':if(foes.filter(e=>!e.isStruct&&dist(u.x,u.y,e.x,e.y)<(s.radius||s.range*.7)).length)trySuper(u,u.aim,0);break;
    case 'tongue':case 'shadowstep':if(tgt&&!tgt.isStruct&&d<s.range*.9&&(see||s.kind==='shadowstep')){const[a]=aimAt(u,tgt,{},sk);trySuper(u,a,d);}break;
    case 'rainbow':case 'starfall':if(tgt&&d<s.range*.9){const[a,dd]=aimAt(u,tgt,s,sk);trySuper(u,a,dd);}break;
    case 'scaffold':if(tgt&&d<420&&u.hp/u.maxHp<.7)trySuper(u,Math.atan2(tgt.y-u.y,tgt.x-u.x),0);break;
    case 'darkdive':if(tgt&&d<520&&onTrail(u))trySuper(u,u.aim,0);break;
    case 'phoenix':case 'dash':if(tgt&&d<s.range*.8&&d>60&&losWide(u.x,u.y,tgt.x,tgt.y,u.rad*.8)){const[a]=aimAt(u,tgt,s,sk);trySuper(u,a,d);}break;
  }
}
function aiGadget(u,tgt,dt){
  if(!u.gadget||u.gUses<=0||u.gCd>0||Math.random()>dt*(u.ai.skill.gad??2.5))return;
  const g=u.gadget.type,hpR=u.hp/u.maxHp,d=tgt?dist(u.x,u.y,tgt.x,tgt.y):1e9;let use=false,dir=null;
  switch(g){
    case 'heal':use=hpR<.4;break;
    case 'pickrarity':use=tgt&&d<500;break;
    case 'healzone':use=M.units.some(a=>a.team===u.team&&!a.dead&&a.hp/a.maxHp<.6&&dist(u.x,u.y,a.x,a.y)<130);break;
    case 'reloadzone':use=tgt&&d<rangeOf(u)+120;break;case 'shield':use=hpR<.65&&M.now-u.lastHurt<.4;break;
    case 'speed':use=u.ai.mode==='retreat'||(tgt&&d<320&&u.b.pref<.3);break;case 'reload':use=u.ammo<1&&tgt&&d<rangeOf(u);break;
    case 'dash':if(u.ai.mode==='retreat'&&hpR<.3&&tgt){use=true;dir=Math.atan2(u.y-tgt.y,u.x-tgt.x);}else if(tgt&&u.b.pref<.3&&d<320&&d>110){use=true;dir=Math.atan2(tgt.y-u.y,tgt.x-u.x);}break;
    case 'blast':case 'pull':case 'slowfield':use=tgt&&!tgt.isStruct&&d<130;break;
    case 'reveal':use=M.units.some(e=>e.team!==u.team&&!e.dead&&e.hidden)||(tgt&&Math.random()<.2);break;
    case 'shotgun':use=tgt&&!tgt.isStruct&&d<300&&los(u.x,u.y,tgt.x,tgt.y);break;
  }
  if(use)useGadget(u,dir);
}
function aiUpdate(u,dt){
  const ai=u.ai,sk=ai.skill;
  ai.t-=dt;ai.strafeT-=dt;ai.fireCd-=dt;ai.dodgeT-=dt;ai.pinCd-=dt;
  /* bots send random emotes now and then */
  if(ai.emoteT==null)ai.emoteT=rand(6,22);ai.emoteT-=dt;if(ai.emoteT<=0&&!M.trial){ai.emoteT=rand(10,30);if(Math.random()<.55){const all=BASIC_PINS.concat(PREMIUM_PINS,DAILY_ONLY_PINS,TROLL_PINS,GEN_PINS,halloweenOn()?HALLOWEEN_PINS:[]).map(p=>p[0]);sendPin(u,'b:'+pick(all));}}
  if(ai.strafeT<=0){ai.strafeDir*=-1;ai.strafeT=rand(.6,1.5);}
  if(ai.t<=0){ai.t=sk.react*rand(.7,1.3);think(u);}
  let tgt=ai.target;if(tgt&&(tgt.dead||tgt.hidden))tgt=ai.target=null;
  let mx=0,my=0;
  if(ai.mode==='retreat'){let th=null,td=1e9;for(const e of M.units){if(e.team===u.team||e.dead||e.hidden)continue;const d=dist(u.x,u.y,e.x,e.y);if(d<td){td=d;th=e;}}
    const mate=M.units.filter(m=>m!==u&&m.team===u.team&&!m.dead&&!m.shadow).sort((a,b)=>dist(u.x,u.y,a.x,a.y)-dist(u.x,u.y,b.x,b.y))[0];
    if(mate&&dist(u.x,u.y,mate.x,mate.y)>90&&(!th||dist(mate.x,mate.y,th.x,th.y)>td))[mx,my]=steer(u,mate.x,mate.y);
    else if(th&&td<500&&!M.mode.sd){const ax2=u.x+(u.x-th.x)/td*260,ay2=u.y+(u.y-th.y)/td*260;[mx,my]=steer(u,clamp(ax2,60,MW-60),clamp(ay2,60,MH-60));}
    else [mx,my]=steer(u,u.spawn[0],u.spawn[1]);}
  else if(ai.mode==='fight'&&tgt){
    const d=dist(u.x,u.y,tgt.x,tgt.y),ang=Math.atan2(tgt.y-u.y,tgt.x-u.x),R=rangeOf(u),pref=tgt.isStruct?R*.75:R*u.b.pref;
    const clear=u.b.atk.kind==='lob'||los(u.x,u.y,tgt.x,tgt.y);
    if(!clear||d>R*.9){[mx,my]=steer(u,tgt.x,tgt.y);}
    else if(d<pref*.75){const sw=.6*(sk.strafe??1);mx=-Math.cos(ang)-Math.sin(ang)*ai.strafeDir*sw;my=-Math.sin(ang)+Math.cos(ang)*ai.strafeDir*sw;}
    else{const sw=tgt.isStruct?.4:(sk.strafe??1);mx=-Math.sin(ang)*ai.strafeDir*sw;my=Math.cos(ang)*ai.strafeDir*sw;
      if(pref<1){mx+=Math.cos(ang)*1.2;my+=Math.sin(ang)*1.2;}
      else{const o=modeObjective(u),od=dist(u.x,u.y,o[0],o[1]);if(od>140){mx+=(o[0]-u.x)/od*.35;my+=(o[1]-u.y)/od*.35;}}}
  } else {const o=modeObjective(u);if(dist(u.x,u.y,o[0],o[1])>14)[mx,my]=steer(u,o[0],o[1]);else if(ai.zp&&Math.random()<dt*.9)ai.zp=null;}
  if(M.storm&&dist(u.x,u.y,ZX,ZY)>M.storm.r-60){const d=dist(u.x,u.y,ZX,ZY)||1;mx+=(ZX-u.x)/d*1.5;my+=(ZY-u.y)/d*1.5;}
  /* step out of enemy damage zones */
  for(const f of M.fields){if(f.team===u.team||!f.radius)continue;const d=dist(u.x,u.y,f.x,f.y);if(d<f.radius+u.rad+6&&d>.01){mx+=(u.x-f.x)/d*1.4;my+=(u.y-f.y)/d*1.4;}}
  scanDodge(u);
  if(ai.dodgeT>0){mx=mx*.35+ai.dvx;my=my*.35+ai.dvy;}
  for(const o of M.units){if(o===u||o.dead||o.team!==u.team)continue;const dx=u.x-o.x,dy=u.y-o.y,dd=dx*dx+dy*dy;if(dd<55*55&&dd>.01){const d=Math.sqrt(dd);mx+=dx/d*.5*(1-d/55);my+=dy/d*.5*(1-d/55);}}
  const want=Math.hypot(mx,my)>.3;
  ai.stuckT=(want&&Math.hypot(u.x-ai.lx,u.y-ai.ly)<.4)?ai.stuckT+dt:0;ai.lx=u.x;ai.ly=u.y;
  if(ai.stuckT>.45){ai.unstickT=.4;const s=Math.random()<.5?1:-1;ai.ux=-my*s;ai.uy=mx*s;ai.stuckT=0;}
  if(ai.unstickT>0){ai.unstickT-=dt;mx=ai.ux;my=ai.uy;}
  if(tgt&&ai.mode==='fight')u.aim=Math.atan2(tgt.y-u.y,tgt.x-u.x);else if(Math.hypot(mx,my)>.1)u.aim=Math.atan2(my,mx);
  if(tgt&&M.state==='play'){
    const d=dist(u.x,u.y,tgt.x,tgt.y),a=u.b.atk,R=rangeOf(u),inR=(a.kind==='melee'||a.kind==='pulse'||a.kind==='starslash')?d<=R-20+tgt.rad-2:d<=R*.95;
    if(inR&&ai.fireCd<=0&&u.ammo>=1&&(a.kind==='lob'||a.kind==='spore'||a.kind==='phase'||a.kind==='orbs'||a.kind==='pulse'||los(u.x,u.y,tgt.x,tgt.y))){const[ang,dd]=aimAt(u,tgt,a,sk);if(tryAttack(u,ang,dd))ai.fireCd=rand(sk.fire[0],sk.fire[1]);}
  }
  if(M.state==='play'){if(u.super>=1&&Math.random()<dt*(sk.sup??20))aiSuper(u,tgt,sk);aiGadget(u,tgt,dt);}
  return[mx,my];
}

/* ---------- Simulation ---------- */
const ctl={move:null,atk:null,sup:null};
const keys=new Set();
let touchUI=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
let mouseMode=false;const mouse={x:0,y:0,has:false};
/* a drag pulled back to the middle of the stick cancels the shot */
const AIM_CANCEL_R=22,aimCentered=o=>!!o&&o.drag&&Math.hypot(o.x-o.sx,o.y-o.sy)<AIM_CANCEL_R;
const aimingNow=()=>(ctl.atk&&ctl.atk.drag&&!aimCentered(ctl.atk))||(ctl.sup&&ctl.sup.drag&&!aimCentered(ctl.sup))||(mouseMode&&mouse.has);
function playerMove(){
  if(ctl.move){const dx=ctl.move.x-ctl.move.ox,dy=ctl.move.y-ctl.move.oy,l=Math.hypot(dx,dy);return l>8?s2w(dx/l,dy/l):[0,0];}
  let x=0,y=0;
  if(keys.has('a')||keys.has('arrowleft'))x--;if(keys.has('d')||keys.has('arrowright'))x++;
  if(keys.has('w')||keys.has('arrowup'))y--;if(keys.has('s')||keys.has('arrowdown'))y++;
  return[x,y];
}
function hitsBox(x,y,r,ox,oy){if(!M||!M.boxes.length)return false;for(const b of M.boxes){if(b.dead)continue;const rr=(b.rad+r)**2,nd=(b.x-x)**2+(b.y-y)**2;if(nd<rr&&nd<(b.x-ox)**2+(b.y-oy)**2)return true;}return false;}
function moveBy(u,dx,dy){
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8)),sx=dx/steps,sy=dy/steps;let blocked=false;
  for(let i=0;i<steps;i++){if(!hitsWall(u.x+sx,u.y,u.rad)&&!hitsBox(u.x+sx,u.y,u.rad,u.x,u.y))u.x+=sx;else blocked=true;if(!hitsWall(u.x,u.y+sy,u.rad)&&!hitsBox(u.x,u.y+sy,u.rad,u.x,u.y))u.y+=sy;else blocked=true;}
  return blocked;
}
function respawnUnit(u){
  let sp=u.spawn;
  if(M.mode.sd){const mate=M.units.find(o=>o!==u&&o.team===u.team&&!o.dead&&!o.shadow);if(mate)sp=openPoint(mate.x,mate.y,30,80);}
  else if(M.mode.ffa){let best=sp,bd=-1;for(const p of MAP.ffa){let md=1e9;for(const e of M.units)if(e!==u&&!e.dead)md=Math.min(md,dist(p[0],p[1],e.x,e.y));if(md>bd){bd=md;best=p;}}sp=best;}
  u.dead=false;u.hp=u.maxHp;u.x=sp[0];u.y=sp[1];u.shield=2;u.ammo=u.b.atk.kind==='cloudzap'?0:u.maxAmmo;u.thrown=null;u.leap=null;u.strongFist=false;if(u.b.random)trickReroll(u);u.flash=0;u.vx=u.vy=0;u.lastHurt=-9;u.slowT=u.stunT=u.poisonT=u.markT=u.vulnT=0;u.ghosts.length=0;u.soakT=0;u.soak=null;
  if(u.sk.supercharged)superSpawnFx(u);else skinSpawnFx(u);
  addFx({k:'beam',x:u.x,y:u.y,t:0,T:.6,col:u.team===0?BLUE:RED});if(M.mode.sd&&u.team===0)textFx(u.x,u.y-u.rad-40,u===P?'You\u2019re back!':'Back!','#8fd3ff',16);ringFx(u.x,u.y,8,70,.5,'#ffffff',5);sparks(u.x,u.y,'#ffffff',10,200,2.5);
  if(u.ai){u.ai.target=null;u.ai.mode='objective';u.ai.lx=u.x;u.ai.ly=u.y;u.ai.zp=null;}
}
function updateUnit(u,dt){
  u.pinT-=dt;u.pinCd-=dt;if(u.pinT<=0)u.pin=null;
  for(let i=u.ghosts.length-1;i>=0;i--){u.ghosts[i].t+=dt;if(u.ghosts[i].t>.3)u.ghosts.splice(i,1);}
  if(u.shadow&&!u.dead){u.lifeT-=dt;if(u.lifeT<=0){kill(u,null);return;}}
  if(u.dead){if(u.respawn!==Infinity){u.respawn-=dt;if(u.respawn<=0&&M.state!=='ended')respawnUnit(u);}return;}
  u.shield=Math.max(0,u.shield-dt);u.flash=Math.max(0,u.flash-dt*5);u.atkCd-=dt;u.gCd-=dt;u.squash=Math.max(0,u.squash-dt*4);
  u.slowT=Math.max(0,u.slowT-dt);u.stunT=Math.max(0,u.stunT-dt);u.markT=Math.max(0,u.markT-dt);u.vulnT=Math.max(0,u.vulnT-dt);u.zoneT=Math.max(0,u.zoneT-dt);u.guardT=Math.max(0,u.guardT-dt);u.boostT=Math.max(0,u.boostT-dt);u.damT=Math.max(0,u.damT-dt);
  if(u.soakT>0){u.soakT-=dt;if(u.soakT<=0&&u.soak){u.poisonT=u.soak.T;u.poisonDmg=u.soak.dmg;u.poisonSrc=u.soak.src;u.poisonTick=1;u.soak=null;}}
  if(u.poisonT>0){u.poisonT-=dt;u.poisonTick-=dt;if(u.poisonTick<=0){u.poisonTick=1;hurt(u,u.poisonDmg,u.poisonSrc,true);for(let i=0;i<3;i++)addFx({k:'bubble',x:u.x+rand(-14,14),y:u.y-rand(0,16),t:0,T:.7,col:'#9be35a'});}if(u.dead)return;}
  u.fastT=Math.max(0,(u.fastT||0)-dt);if(u.cloakT>0)u.cloakT-=dt;if(u.burnT>0){u.burnT-=dt;if(Math.random()<dt*10)addFx({k:'spark',x:u.x+rand(-10,10),y:u.y-rand(0,14),vx:0,vy:-60,t:0,T:.35,s:3,col:'#ff7a1a'});}
  if(u.darkT>0){u.darkT-=dt;u.trailT=(u.trailT||0)-dt;if(u.trailT<=0){u.trailT=.12;addTrail(u.darkSrc,u,u.x,u.y);}}
  if(u.darkX>0)u.darkX-=dt;
  if(u.hot){u.hot.t-=dt;u.hot.tick-=dt;if(u.hot.tick<=0){u.hot.tick=1;heal(u,u.hot.amt);}if(u.hot.t<=0)u.hot=null;}
  if(u.dive){u.dive.t-=dt;u.dive.tr-=dt;if(u.dive.tr<=0){u.dive.tr=.1;addTrail(u,null,u.x,u.y);}if(Math.random()<dt*14)addFx({k:'smoke',x:u.x+rand(-12,12),y:u.y+rand(-8,8),vx:0,vy:-10,t:0,T:.5,s:8,col:'#140a24'});if(u.dive.t<=0){u.dive=null;smoke(u.x,u.y,4,20,'#140a24');}}
  if(u.b.random){if(u.rerollA>0){u.rerollA-=dt;if(u.rerollA<=0)trickAtk(u);}if(u.rerollS>0){u.rerollS-=dt;if(u.rerollS<=0)trickSup(u);}}
  if(u.ammo<u.maxAmmo&&!(u.b.atk.kind==='cloudzap'&&!u.zoneOn))u.ammo=Math.min(u.maxAmmo,u.ammo+(u.fastT>0?2:1)*dt*(u.zoneT>0&&u.zoneBoss?2:1)/(u.b.reload/(1+u.mods.reloadspd)));
  const rd=3-u.mods.regen;if(M.now-u.lastHurt>rd&&M.now-u.lastAttack>rd&&u.hp<u.maxHp){u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.13*dt);if(Math.random()<dt*3)addFx({k:'plus',x:u.x+rand(-12,12),y:u.y-rand(0,10),t:0,T:.8});}
  for(let i=u.pending.length-1;i>=0;i--){const p=u.pending[i];p.t-=dt;if(p.t<=0){u.pending.splice(i,1);if(u.stunT<=0)p.fn();}}
  const ox=u.x,oy=u.y,live=M.state==='play'||M.state==='ended';
  {const z=closeZone(u.b);u.zoneOn=false;if(z&&!u.dead&&M.state==='play'){for(const e of M.units)if(e.team!==u.team&&!e.dead&&dist(u.x,u.y,e.x,e.y)<z+e.rad){u.zoneOn=true;break;}
    if(u.zoneOn&&u.super<1)u.super=Math.min(1,u.super+dt*ZONE_CHARGE*(1+u.mods.charge));}}
  if(u.leap){const L=u.leap;L.t+=dt;const k=Math.min(1,L.t/L.T);u.x=L.x0+(L.tx-L.x0)*k;u.y=L.y0+(L.ty-L.y0)*k;L.h=Math.sin(k*Math.PI)*90;
    if(k>=1){u.leap=null;ringFx(u.x,u.y,u.rad,L.radius,.35,'#9fe8ff',9);ringFx(u.x,u.y,u.rad,L.radius*.7,.25,'#ffffff',5);flashFx(u.x,u.y,L.radius,'#9fe8ff',.2);sparks(u.x,u.y,'#ffe14d',16,320,3);shakeAt(u.x,u.y,8);sfx('bass');
      for(const e of M.ents){if(e.team===u.team||e.dead)continue;if(dist(u.x,u.y,e.x,e.y)<L.radius+e.rad){hurt(e,L.dmg,u);hitFx(e.x,e.y,'#9fe8ff');knock(e,Math.atan2(e.y-u.y,e.x-u.x),220);}}
      if(L.heal){ringFx(u.x,u.y,u.rad,L.radius,.4,'#6be39a',7);for(const e of M.units)if(e.team===u.team&&!e.dead&&dist(u.x,u.y,e.x,e.y)<L.radius+e.rad)heal(e,L.heal);}}}
  else if(u.thrown){const th=u.thrown;th.t+=dt;
    if(th.phase==='grab'){const sr=th.src,gx=sr.x+Math.cos(th.ang)*(sr.rad+u.rad+4),gy=sr.y+Math.sin(th.ang)*(sr.rad+u.rad+4),k=Math.min(1,dt*16);
      if(!hitsWall(gx,gy,u.rad)){u.x+=(gx-u.x)*k;u.y+=(gy-u.y)*k;}th.h=Math.min(26,th.t*160);if(th.t>=.18||sr.dead){th.phase='fly';th.t=0;}}
    else{const bx=u.x,by=u.y,step=th.spd*dt;moveBy(u,th.vx*dt,th.vy*dt);const mv=Math.hypot(u.x-bx,u.y-by);th.trav+=mv;
      th.h=26+Math.sin(clamp(th.trav/th.max,0,1)*Math.PI)*60*(1-clamp(th.trav/th.max,0,1)*.4);if(Math.random()<dt*40)addFx({k:'smoke',x:u.x,y:u.y+u.rad*.6,vx:0,vy:-6,t:0,T:.35,s:5,col:'#c9b9a0'});
      if(th.trav>=th.max||mv<step*.35)landThrow(u);}}
  else if(u.dash){const d=u.dash,dx=d.vx*dt,dy=d.vy*dt;moveBy(u,dx,dy);if(Math.hypot(u.x-ox,u.y-oy)<Math.hypot(dx,dy)*.4)d.t=0;
    if(d.dmg)for(const e of M.ents){if(e.team===u.team||e.dead||d.hit.has(e.id))continue;if(dist(u.x,u.y,e.x,e.y)<u.rad+e.rad+8){d.hit.add(e.id);hurt(e,d.dmg,u);hitFx(e.x,e.y,u.sk.proj);knock(e,Math.atan2(e.y-u.y,e.x-u.x),d.kb);shakeAt(e.x,e.y,4);}}
    u.afterT-=dt;if(u.afterT<=0){u.afterT=.035;u.ghosts.push({x:u.x,y:u.y,t:0});}
    if(d.fire){d.fire.last-=dt;if(d.fire.last<=0){d.fire.last=.09;createField(u,u.x,u.y,{radius:40,dur:2.5,dps:d.fire.dps,kind:'fire'});}}
    d.t-=dt;if(d.t<=0){u.dash=null;smoke(u.x,u.y,2,14);}}
  else if(u.kb){moveBy(u,u.kb.vx*dt,u.kb.vy*dt);u.kb.t-=dt;if(u.kb.t<=0)u.kb=null;}
  else if(live&&u.stunT<=0){
    let mx,my;[mx,my]=u.net?[u.net.mx,u.net.my]:u.isPlayer?(NETS?[0,0]:playerMove()):aiUpdate(u,dt);
    const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
    const sp=u.b.speed*(1+u.mods.speed)*(u.boostT>0?1.4:1)*(u.slowT>0?.55:1)*(u.damT>0?1+u.damSpeed:1)*(u.hasCrown?.9:1)*(u.zoneT>0?1.1:1);
    if(l>.01)moveBy(u,mx*sp*dt,my*sp*dt);
  }
  u.vx=dt>0?(u.x-ox)/dt:0;u.vy=dt>0?(u.y-oy)/dt:0;u.moving=Math.hypot(u.vx,u.vy)>20;
  if(u.isPlayer&&!(u.net?u.net.aiming:aimingNow())&&u.moving&&M.now-u.lastAttack>.4)u.aim=Math.atan2(u.vy,u.vx);
  if(u.moving){u.stepT-=dt;if(u.stepT<=0){u.stepT=.24;if(inBush(u.x,u.y)){addFx({k:'leaf',x:u.x+rand(-12,12),y:u.y+rand(-6,10),vx:rand(-40,40),vy:rand(-50,-10),t:0,T:.7,rot:rand(0,TAU)});}else addFx({k:'smoke',x:u.x+rand(-6,6),y:u.y+u.rad*.8,vx:-u.vx*.1,vy:-8,t:0,T:.45,s:6,col:'#5f6d86'});}}
  if(u.stunT>0&&Math.random()<dt*5)addFx({k:'star',x:u.x,y:u.y-u.rad-14,t:0,T:.6,a:rand(0,TAU)});
  if(u.slowT>0&&Math.random()<dt*6)addFx({k:'snow',x:u.x+rand(-16,16),y:u.y-rand(0,20),t:0,T:.8});
  if(u.boostT>0&&u.moving&&Math.random()<dt*20)addFx({k:'spark',x:u.x,y:u.y+u.rad*.5,vx:-u.vx*.3,vy:-u.vy*.3,t:0,T:.3,s:2.5,col:'#9ff5bf'});
}
function updateShots(dt){
  const L=M.shots;
  for(let i=L.length-1;i>=0;i--){
    const s=L[i];let dead=false;s.age+=dt;
    if(s.lob){s.t+=dt;const k=Math.min(1,s.t/s.T);s.x=s.sx+(s.tx-s.sx)*k;s.y=s.sy+(s.ty-s.sy)*k;s.h=Math.sin(k*Math.PI)*(s.big?130:95);if(s.style==='meteor'){s.x=s.tx-170*(1-k);s.y=s.ty;s.h=700*(1-k)*(1-k);if(Math.random()<.9)smoke(s.x,s.y-s.h,1,16,'#4a2a22');}
      if(Math.random()<dt*25)addFx({k:'spark',x:s.x,y:s.y-s.h,vx:rand(-30,30),vy:rand(-30,30),t:0,T:.25,s:2,col:'#ffd38a'});
      if(k>=1){explode(s);dead=true;}}
    else{
      s.trail.push(s.x,s.y);if(s.trail.length>16)s.trail.splice(0,2);
      s.spin+=dt*18;
      if(s.home){const h=s.home;h.t+=dt;
        if(h.phase==='out'&&(!h.tgt||h.tgt.dead)){h.tgt=nearestFoeUnit(s.team,s.x,s.y,700);if(!h.tgt){h.free-=dt;if(h.free<=0){h.phase='back';}}}
        const goal=h.phase==='out'?h.tgt:s.owner;
        if(goal){const a=Math.atan2(goal.y-s.y,goal.x-s.x),cur=Math.atan2(s.vy,s.vx),turn=clamp(angDiff(cur,a),-dt*(5+h.t*8),dt*(5+h.t*8)),na=cur+turn;s.vx=Math.cos(na)*s.spd;s.vy=Math.sin(na)*s.spd;}
        s.x+=s.vx*dt;s.y+=s.vy*dt;
        for(const e of M.units){if(e.team===s.team||e.dead||s.hit.has(e.id))continue;if(h.phase==='out'&&e!==h.tgt)continue;const rr=e.rad+s.r;
          if((e.x-s.x)**2+(e.y-s.y)**2<rr*rr){s.hit.add(e.id);batHit(s,e,h.phase==='out'?s.dmg:s.dmgBack);if(h.phase==='out'){h.phase='back';s.spd*=1.15;}}}
        if(h.phase==='back'&&(s.owner.dead||dist(s.x,s.y,s.owner.x,s.owner.y)<s.owner.rad+14)){dead=true;if(!s.owner.dead)sparks(s.owner.x,s.owner.y,'#c98f55',6,160,2);}
        if(h.t>7)dead=true;
      }else if(s.rang){
        if(!s.rang.back){s.x+=s.vx*dt;s.y+=s.vy*dt;s.left-=s.spd*dt;if(s.left<=0||isWall(s.x,s.y)){s.rang.back=true;s.hit.clear();}}
        else{const o=s.owner,a=Math.atan2(o.y-s.y,o.x-s.x);s.vx=Math.cos(a)*s.spd*1.1;s.vy=Math.sin(a)*s.spd*1.1;s.x+=s.vx*dt;s.y+=s.vy*dt;if(o.dead||dist(s.x,s.y,o.x,o.y)<o.rad+10||s.age>3)dead=true;}
      }else{
        if(s.seek){if(s.seek.dead)s.seek=null;else{const a=Math.atan2(s.seek.y-s.y,s.seek.x-s.x);s.vx=Math.cos(a)*s.spd;s.vy=Math.sin(a)*s.spd;}}
        if(s.curve){const a=Math.atan2(s.vy,s.vx)+s.curve*dt;s.vx=Math.cos(a)*s.spd;s.vy=Math.sin(a)*s.spd;}
        s.x+=s.vx*dt;s.y+=s.vy*dt;s.left-=s.spd*dt;
        if(s.bounce>0&&isWall(s.x,s.y)){s.bounce--;const bx=isWall(s.x-s.vx*dt,s.y),by=isWall(s.x,s.y-s.vy*dt);if(!bx)s.vx=-s.vx;if(!by)s.vy=-s.vy;if(bx&&by){s.vx=-s.vx;s.vy=-s.vy;}s.x+=s.vx*dt*2;s.y+=s.vy*dt*2;s.hit.clear();sparks(s.x,s.y,s.color,4,140,2);}
        if((s.left<=0||(!s.ghost&&isWall(s.x,s.y)))&&s.owner&&(s.sawDps||s.splat)){const bx=isWall(s.x,s.y)?s.x-s.vx*dt*2:s.x,by=isWall(s.x,s.y)?s.y-s.vy*dt*2:s.y;if(s.sawDps)createField(s.owner,bx,by,{radius:38,dur:1.6,dps:s.sawDps,kind:'saw'});else{createField(s.owner,bx,by,{radius:36,dur:2.2,dps:s.splat,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=s.color;}s.sawDps=0;s.splat=0;}
        if(s.left<=0){dead=true;if(s.style==='log'||s.style==='wave')smoke(s.x,s.y,2,12,s.style==='wave'?'#bfefff':'#7a5a40');}
        else if(!s.ghost&&isWall(s.x,s.y)){dead=true;sparks(s.x,s.y,s.color,5,160,2.2);flashFx(s.x,s.y,12,s.color,.08);if(s.style==='wave')smoke(s.x,s.y,3,14,'#bfefff');if(s.style==='log')debris(s.x,s.y,'#a0673f',4);}
      }
      if(!dead&&!s.home)for(const e of M.ents){
        if(e.team===s.team||e.dead||s.hit.has(e.id))continue;const rr=e.rad+s.r;
        if((e.x-s.x)**2+(e.y-s.y)**2<rr*rr){s.hit.add(e.id);if(s.boom&&!e.isStruct){const bd=s.boom,ow=s.owner,tm=s.team,tg=e;tg.pending.push({t:.7,fn:()=>{if(!M||tg.dead)return;boom(tg.x,tg.y,55,'#ffb347',false);for(const o of M.ents){if(o.team===tm||o.dead)continue;if(dist(tg.x,tg.y,o.x,o.y)<55+o.rad)hurt(o,bd,ow);}}});}if(s.splat&&s.owner){createField(s.owner,s.x,s.y,{radius:36,dur:2.2,dps:s.splat,slow:true,kind:'paint'});M.fields[M.fields.length-1].col=s.color;s.splat=0;}hurt(e,s.fist?s.dmg*(1+s.fist.far*clamp(1-s.left/s.range,0,1)):s.dmg,s.owner);hitFx(s.x,s.y,s.color);
          if(s.fist){const o=s.owner;if(s.fist.strong){ringFx(e.x,e.y,e.rad,e.rad*3,.3,'#ffd23f',7);shakeAt(e.x,e.y,5);}else if(!e.isStruct&&o&&!o.dead){o.strongFist=true;o.ammo=Math.min(o.maxAmmo,o.ammo+.85);if(o===P)textFx(o.x,o.y-o.rad-36,'Power punch ready!','#ffd23f',13);}}
          if(s.slow)slowE(e,s.slow,s.owner);if(s.stun)stun(e,s.stun);if(s.kb)knock(e,Math.atan2(s.vy,s.vx),s.kb);
          if(s.chain)doChain(s,e);if(s.split)splitLog(s,e);if(s.spread)spreadStar(s,e);
          if(!s.pierce){dead=true;break;}}
      }
    }
    if(dead)L.splice(i,1);
  }
}
function updateStructs(dt){
  for(const s of M.structs){
    if(s.dead)continue;s.flash=Math.max(0,s.flash-dt*5);
    if(s.lifeT!=null){s.lifeT-=dt;if(s.lifeT<=0){s.dead=true;smoke(s.x,s.y,3,16);debris(s.x,s.y,'#a0673f',4);continue;}}
    if(s.kind==='turret'){
      s.t-=dt;if(s.t<=0||!s.owner||s.owner.dead&&M.mode.id==='stand'){s.dead=true;smoke(s.x,s.y,4,18);debris(s.x,s.y,'#c7cedb',5);continue;}
      s.cd-=dt;let best=null,bd=s.reach;
      for(const e of M.units){if(e.team===s.team||e.dead||e.hidden)continue;const d=dist(s.x,s.y,e.x,e.y);if(d<bd&&los(s.x,s.y,e.x,e.y)){bd=d;best=e;}}
      if(best){s.aim=Math.atan2(best.y-s.y,best.x-s.x);if(s.cd<=0){s.cd=s.rate;const cx=Math.cos(s.aim),sy=Math.sin(s.aim);spawnShot(s,s.aim,{x:s.x+cx*20,y:s.y+sy*20,spd:900,range:s.reach,dmg:s.dmg,r:5,style:'rivet',color:s.owner.sk.proj});flashFx(s.x+cx*22,s.y+sy*22,12,s.owner.sk.proj,.07);}}
    }else if(s.kind==='core'&&s.hp<s.maxHp*.5&&Math.random()<dt*(s.hp<s.maxHp*.25?10:4))addFx({k:'spark',x:s.x+rand(-20,20),y:s.y+rand(-24,10),vx:rand(-60,60),vy:rand(-160,-40),t:0,T:.4,s:2.5,col:'#ffb347'});
  }
  if(M.structs.length>4)M.structs=M.structs.filter(s=>!s.dead||s.kind==='core');
}
function updateFields(dt){
  for(let i=M.fields.length-1;i>=0;i--){
    const f=M.fields[i];f.t+=dt;if(f.t>=f.dur){M.fields.splice(i,1);continue;}
    if(f.kind==='hole')for(const e of M.units){if(e.team===f.team||e.dead)continue;const d=dist(e.x,e.y,f.x,f.y);if(d<f.r*1.3&&d>8){const a=Math.atan2(f.y-e.y,f.x-e.x);moveBy(e,Math.cos(a)*f.pull*dt,Math.sin(a)*f.pull*dt);}}
    if(f.kind==='thunder'){f.zt-=dt;if(f.zt<=0){f.zt=f.rate;const foes=M.ents.filter(e=>e.team!==f.team&&!e.dead&&dist(e.x,e.y,f.x,f.y)<f.r+e.rad);
        for(const e of shuffle(foes.slice()).slice(0,2)){const ci=Math.floor(Math.random()*f.clouds),a=M.now*.8+ci*TAU/f.clouds,cx=f.x+Math.cos(a)*f.r*.55,cy=f.y+Math.sin(a)*f.r*.55-50;
          boltFx(cx,cy,e.x,e.y,'#fff3a0');hurt(e,f.dps,f.owner);hitFx(e.x,e.y,'#fff3a0');}if(foes.length)sfx('zap');}continue;}
    f.tick-=dt;if(f.tick>0)continue;const step=f.kind==='dam'?.5:.25;f.tick=step;
    for(const e of M.units){
      if(e.dead||dist(e.x,e.y,f.x,f.y)>f.r+e.rad*.5)continue;
      if(f.kind==='dam'){
        if(e.team===f.team){heal(e,e.maxHp*f.heal*step,true);e.damT=.6;e.damSpeed=f.speed;if(Math.random()<.5)addFx({k:'plus',x:e.x+rand(-12,12),y:e.y-rand(0,10),t:0,T:.8});}
        else{if(f.dps)hurt(e,f.dps*step,f.owner);e.soakT=.6;e.soak={dmg:f.poison,T:f.poisonT,src:f.owner};}
      }else if(f.kind==='spore'||f.kind==='mush'){if(e.team===f.team){if(f.heal)heal(e,(f.kind==='spore'?e.maxHp*f.heal:f.heal)*step,true);}else if(f.dps)hurt(e,f.dps*step,f.owner);
      }else if(f.kind==='healzone'){if(e.team===f.team)heal(e,f.heal*step,true);
      }else if(f.kind==='reloadzone'){if(e.team===f.team)e.fastT=.4;
      }else if(f.kind==='starzone'){
        if(e.team===f.team){e.zoneT=.4;e.zoneBoss=e===f.owner;}
        else{hurt(e,f.dps*step,f.owner);if(e.dead)continue;slowE(e,.6,f.owner);e.poisonDmg=f.poison;e.poisonSrc=f.owner;if(e.poisonT<=0)e.poisonTick=1;e.poisonT=Math.max(e.poisonT,f.poisonT);addFx({k:'fallstar',x:e.x+rand(-14,14),y:e.y-rand(0,10),t:0,T:.3,col:'#ffd36b'});}
      }else if(e.team!==f.team){if(f.dps)hurt(e,f.dps*step,f.owner);if(f.slow)slowE(e,.6,f.owner);}
    }
  }
}
function updateFx(dt){
  for(let i=M.fx.length-1;i>=0;i--){const f=M.fx[i];f.t+=dt;
    if(f.k==='spark'||f.k==='smoke'||f.k==='leaf'){f.x+=f.vx*dt;f.y+=f.vy*dt;const k=1-Math.min(1,dt*(f.k==='smoke'?2:4));f.vx*=k;f.vy*=k;if(f.k==='leaf')f.vy+=60*dt;}
    else if(f.k==='debris'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vz-=650*dt;f.z+=f.vz*dt;f.rot+=f.vr*dt;if(f.z<0){f.z=0;f.vz*=-.35;f.vx*=.55;f.vy*=.55;f.vr*=.5;}}
    if(f.t>=f.T)M.fx.splice(i,1);}
  for(let i=M.texts.length-1;i>=0;i--){const t=M.texts[i];t.t+=dt;t.y-=34*dt;if(t.t>=t.T)M.texts.splice(i,1);}
  for(let i=M.decals.length-1;i>=0;i--){const d=M.decals[i];d.t+=dt;if(d.t>=d.T)M.decals.splice(i,1);}
  for(const e of M.embers){e.y-=e.v*dt;e.x+=Math.sin(M.now*.8+e.ph)*8*dt;if(e.y<-10){e.y=MH+10;e.x=rand(0,MW);}}
  M.shake=Math.max(0,M.shake-dt*28);
}
function update(dt){
  if(M.state==='countdown'){M.cd-=dt;if(M.cd<=0){M.state='play';sfx('go');}}
  let sdt=dt;
  if(M.state==='ended'){M.endT+=dt;sdt=dt*.3;if(M.endT>1.8&&!M.shown){M.shown=true;showEnd();}}
  M.now+=sdt;if(M.state==='play')M.time-=sdt;
  M.ents=M.units.concat(M.structs.filter(s=>!s.dead));
  for(const u of M.units)updateUnit(u,sdt);
  if(M.units.some(u=>u.gone))M.units=M.units.filter(u=>!u.gone);
  for(const u of M.units){
    if(u.dead){u.hidden=false;continue;}
    u.hidden=u.cloakT>0||(u.markT<=0&&inBush(u.x,u.y)&&M.now-u.lastAttack>1.2&&M.now-u.lastHurt>1.2&&!M.units.some(e=>e.team!==u.team&&!e.dead&&(e.x-u.x)**2+(e.y-u.y)**2<120*120));
  }
  if(M.trails)for(let i=M.trails.length-1;i>=0;i--){const p=M.trails[i];p.t+=sdt;if(p.t>=p.T)M.trails.splice(i,1);}
  updateShots(sdt);updateStructs(sdt);updateFields(sdt);updateFx(sdt);
  if(M.state==='play')modeTick(sdt);
}
function endMatch(w){
  if(M.state==='ended')return;
  M.state='ended';M.endT=0;
  /* Showdown: finishing in the top 3 counts as a win */
  if(M.mode.sd){M.place=M.place||1;w=M.place<=SD_WIN_PLACES?0:M.place<=Math.ceil(M.nTeams/2)?-1:1;}
  else if(M.mode.ffa){const mine=M.score[0];M.place=1+M.score.slice(1).filter(v=>v>mine).length;w=M.place===1?0:M.place<=3?-1:1;}
  M.result=w;M.reward=applyRewards();if(w===0&&P)say(P,'w',true);
  sfx(w===0?'win':w===1?'lose':'draw');
  if(!M.trial)for(const u of M.units)if(u.ai&&!u.dead&&Math.random()<.6)sendPin(u,(u.team===0)===(w===0)?pick(['b:gg','b:happy','b:laugh']):pick(['b:sad','b:gg','b:angry']));
}
const ROAD_MAX=100,TROPHY_MAX=10000,HELL_AT=5000;
/* Trophy road: 100 steps up to 10,000. Every 1,000 trophies = an Amazing Drop. */
function roadReward(n){if(n%10===0)return{drop:'ultra',n:n===100?3:n>=50?2:1,gems:30+n*2,chromos:1000+n*40};if(n%5===0)return{drop:n>=50?'legendary':'mythic',coins:600+n*40,pp:300+n*15};
  if(n%5===3)return{drop:n>=60?'mythic':'epic',coins:300+n*20};const c=[{coins:400+n*30},{chromos:600+n*45},{gems:20+n},{pp:300+n*20}];return c[(n-1)%4];}
function roadLabel(rw){const out=[];for(const k of['coins','chromos','gems','pp'])if(rw[k])out.push('+'+fmtFull(rw[k])+' '+CUR_NAME[k]);if(rw.drop)out.unshift((rw.n>1?rw.n+' ':'')+RARITY[rw.drop].name+' Drop'+(rw.n>1?'s':''));return out.join(', ');}
function applyRewards(){
  if(M.trial)return{trial:true,trophies:0,coins:0,pp:0,gems:0,chromos:0,rp:0,prestige:0,road:[],rank:null};
  const w=M.result,me=S.owned[P.b.id],r={trophies:0,coins:0,pp:0,gems:0,chromos:P.kills*CHROMOS_PER_KO,rp:0,prestige:0,road:[],rank:null};
  if(M.ranked){
    if(w===0){S.streak++;r.rp=25+Math.min(15,(S.streak-1)*5);r.coins=100;r.pp=50;r.gems=3;}else if(w===1){S.streak=0;r.rp=-15;r.coins=30;r.pp=15;}else{r.coins=50;r.pp=25;}
    S.rp=Math.max(0,S.rp+r.rp);S.rpBest=Math.max(S.rpBest,S.rp);const after=rankInfo(S.rp).i;
    if(after>=RANK_STEPS-1&&w===0){const k=1+Math.floor(Math.max(0,S.rp-(RANK_STEPS-1)*100)/100);r.coins+=60*k;r.pp+=30*k;r.gems+=Math.min(25,2*k);r.chromos+=100*k;r.masterBonus=k;}
    if(after>(S.rankPeak|0)){S.rankPeak=after;r.rank=after;r.rankWaiting=true;}
  }else if(M.mode.sd){const n=M.nTeams,i=clamp(M.place,1,n)-1,TT={8:[10,5,2,0,-1,-2,-3,-4],5:[10,5,2,-1,-3],4:[10,5,2,-3]}[n]||[10,5,2,0,-1,-2,-3,-4],CC={8:[50,40,32,25,18,14,12,10],5:[50,38,26,16,10],4:[50,34,20,12]}[n]||[50,40,32,25,18,14,12,10],PT={8:[30,25,20,15,12,10,8,6],5:[30,22,15,10,6],4:[30,20,12,8]}[n]||[30,25,20,15,12,10,8,6],t=TT[i];r.trophies=S.trophies<50?Math.max(0,t):t;r.coins=CC[i];r.pp=PT[i];if(i===0)r.gems=2;
  }else if(M.mode.ffa){const i=M.place-1;const t=[10,7,3,0,-2,-4][i];r.trophies=S.trophies<50?Math.max(0,t):t;r.coins=[45,35,25,15,12,10][i];r.pp=[25,20,15,10,8,6][i];if(i===0)r.gems=2;}
  else{const tr=S.trophies;if(w===0){r.trophies=tr<500?8:tr<1000?6:4;r.coins=40;r.pp=25;r.gems=Math.random()<.5?2:1;}else if(w===1){r.trophies=tr<50?0:tr<500?-3:-5;r.coins=15;r.pp=10;}else{r.coins=25;r.pp=15;}}
  /* Star Player: nobody in the match got more takedowns than you. Worth extra trophies, win or lose. */
  {let st=null;for(const u of M.units)if(!u.shadow&&(u.kills||0)>0&&(!st||u.kills>st.kills||u===P&&u.kills===st.kills))st=u;
   M.star=st;if(st===P&&!M.ranked){r.star=true;r.trophies+=STAR_PLAYER_TROPHIES;}}
  if(w===0){S.wins++;if(halloweenOn()){S.hw.wins++;r.knock=S.hw.wins%KNOCK_EVERY===0;}if(me&&me.prestige<PRESTIGE_MAX){me.prestige++;r.prestige=1;if(PRESTIGE_REWARDS[me.prestige]&&(me.prClaim||0)<me.prestige)grantPrestige(P.b.id,me.prestige,r);}}
  S.matches++;
  if(!M.left){const old=S.pass.xp;r.passXp=Math.round(((w===0?40:w===1?15:25)+Math.min(30,P.kills*5))*(M.ranked?1.5:1));S.pass.xp+=r.passXp;
    if(w===0){S.pass.wins++;if(S.pass.wins%PASS_WIN_EVERY===0){S.pass.xp+=PASS_STEP;r.passWinTier=true;}}
    const t1=passTier(S.pass.xp);if(t1>passTier(old))r.passUp=t1;
    if(w===0){const plan=winDropPlan();if(S.dropDay.n<WIN_DROPS_PER_DAY){const pr=plan[S.dropDay.n],lucky=pr==='rare'?null:pr;r.drop=lucky||'any';S.drops.push(lucky?{r:lucky,min:null,g:1}:{r:null,min:null});S.dropDay.n++;}else r.dropCap=true;}}
  S.trophies=clamp(S.trophies+r.trophies,0,TROPHY_MAX);S.best=Math.max(S.best,S.trophies);
  while(Math.floor(S.best/100)>S.road&&S.road<ROAD_MAX){S.road++;const rw=roadReward(S.road);r.road.push(rw);S.coins+=rw.coins||0;S.gems+=rw.gems||0;S.pp+=rw.pp||0;S.chromos+=rw.chromos||0;if(rw.drop)for(let k=0;k<(rw.n||1);k++)S.drops.push({r:rw.drop,min:null});}
  S.coins+=r.coins;S.pp+=r.pp;S.gems+=r.gems;S.chromos+=r.chromos;
  persist();return r;
}
function giveRankReward(i,r){const rw=rankReward(i),b=r.rankBundle;
  r.chromos+=rw.chromos;r.gems+=rw.gems;r.coins+=rw.coins;r.pp+=rw.pp;b.chromos+=rw.chromos;b.gems+=rw.gems;b.coins+=rw.coins;b.pp+=rw.pp;
  for(const d of rw.drops)for(let k=0;k<d.n;k++){S.drops.push({r:d.r,min:null});b.drops++;}
  if(rw.master){S.masterAll=true;for(const id in S.owned)grantSkin(id,'master');if(!S.pins.includes('master'))S.pins.push('master');r.master=true;}}
/* Claim: collect every rank reward reached this climb, then go back to Bronze I. Rank sets get new random rumblers next climb (Master stays Ember). */
function claimRanked(){const r={chromos:0,gems:0,coins:0,pp:0,rankBundle:{chromos:0,gems:0,coins:0,pp:0,drops:0},rankSets:[]};const peak=S.rankPeak|0;if(peak<=(S.rankClaimed|0))return null;
  for(let i=(S.rankClaimed|0)+1;i<=peak;i++)giveRankReward(i,r);
  RANK_SETS.forEach((rs,k)=>{if(rs.idx<=peak){const rid=rankSetRumbler(k,rankSeed(S));if(!hasSkin(rid,rs.skin.id)||!S.pins.includes(rs.pin)){grantRankSet(k);r.rankSets.push(k);}}});
  S.coins+=r.coins;S.pp+=r.pp;S.gems+=r.gems;S.chromos+=r.chromos;
  S.rp=0;S.rankPeak=0;S.rankClaimed=0;S.streak=0;S.rankCycle=(S.rankCycle|0)+1;persist();return r;}

/* ---------- Rendering ---------- */
const gameEl=$('#game'),canvas=$('#world'),ctx=canvas.getContext('2d');
let W=1,H=1,dpr=1;
const cam={x:MW/2,y:MH*.75,zoom:1,sx:0,sy:0};
let ROT=false,LANDW=false,WA=0;
/* Landscape on a phone: the battlefield is turned sideways so you see exactly what portrait shows (same zoom, same distance ahead), just on a wide screen. Your team attacks to the right. */
const curWA=()=>(LANDW&&touchUI&&!mouseMode)?Math.PI/2:0;
function upr(c,x,y){if(WA){c.translate(x,y);c.rotate(-WA);c.translate(-x,-y);}}
function upP(ox,oy,x,y){if(!WA)return[x,y];const dx=x-ox,dy=y-oy;return[ox-dy,oy+dx];}
const s2w=(x,y)=>WA?[y,-x]:[x,y];
/* Screen setting: Auto / Portrait / Landscape. Tries a real orientation lock first; if the phone or app won't allow it, the match view is turned sideways instead. */
function applyOrient(){const want=S.orient||'auto';
  try{const so=screen.orientation;if(so){if(want==='auto'){if(so.unlock)so.unlock();}else if(so.lock){const p=so.lock(want);if(p&&p.catch)p.catch(()=>{});}}}catch(e){}
  const land=innerWidth>innerHeight,rot=view==='game'&&want!=='auto'&&(want==='landscape')!==land;
  ROT=rot;document.body.classList.toggle('rot-game',rot);if(rot){gameEl.style.width=innerHeight+'px';gameEl.style.height=innerWidth+'px';}else{gameEl.style.width='';gameEl.style.height='';}}
function resize(){if(typeof S!=='undefined'&&S)try{applyOrient();}catch(e){}const r={width:gameEl.offsetWidth||gameEl.getBoundingClientRect().width,height:gameEl.offsetHeight||gameEl.getBoundingClientRect().height};W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);LANDW=W>H&&H<600;cam.zoom=clamp(LANDW?Math.min(W/820,H/520):Math.min(W/520,H/820),.5,1.6);}
function toWorld(sx,sy){const[dx,dy]=s2w((sx-W/2)/cam.zoom,(sy-H/2)/cam.zoom);return[dx+cam.x,dy+cam.y];}
function camera(dt,snap){
  if(!P)return;let f=P;if(P.dead&&M&&M.mode.sd){const m=M.units.find(o=>o.team===MYT&&!o.dead&&!o.shadow);if(m)f=m;}const tx=f.dead?P.spawn[0]:f.x,ty=f.dead?P.spawn[1]:f.y;
  const k=snap?1:Math.min(1,dt*8);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
  WA=curWA();const vw=(WA?H:W)/cam.zoom,vh=(WA?W:H)/cam.zoom;
  cam.x=vw<MW+40?clamp(cam.x,vw/2-20,MW-vw/2+20):MW/2;
  cam.y=vh<MH+40?clamp(cam.y,vh/2-60,MH-vh/2+60):MH/2;
  const s=M?M.shake:0;cam.sx=s?rand(-s,s):0;cam.sy=s?rand(-s,s):0;
}
const add=c=>{c.globalCompositeOperation='lighter';},norm=c=>{c.globalCompositeOperation='source-over';};
function crate(c,x,y,cc,rr){
  const v=((cc*13+rr*7)%3);
  c.fillStyle='rgba(8,6,22,.35)';c.fillRect(x+4,y+TILE-6,TILE,8);
  c.fillStyle='#6f3f2c';c.fillRect(x,y+TILE-12,TILE,12);
  c.fillStyle=v===0?'#b8714a':v===1?'#ad6843':'#c07b52';c.fillRect(x,y,TILE,TILE-12);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+2,y+2,TILE-4,4);
  c.strokeStyle='rgba(18,15,38,.4)';c.lineWidth=1.5;c.beginPath();c.moveTo(x+4,y+13);c.lineTo(x+TILE-4,y+13);c.moveTo(x+4,y+25);c.lineTo(x+TILE-4,y+25);if(v===2){c.moveTo(x+6,y+4);c.lineTo(x+TILE-6,y+34);}c.stroke();
  c.strokeStyle=OUT;c.lineWidth=2.5;c.strokeRect(x+1.25,y+1.25,TILE-2.5,TILE-2.5);
}
function bush(c,x,y,cc,rr,t){
  const sw=Math.sin(t*1.6+cc+rr)*1.5;
  c.fillStyle='#276b3b';rrect(c,x+2,y+3,TILE-4,TILE-5,14);c.fill();
  c.fillStyle='#3f9d55';ell(c,x+15+sw,y+17,12,11);c.fill();ell(c,x+34+sw,y+21,13,12);c.fill();ell(c,x+23+sw*.5,y+35,12,9);c.fill();
  c.fillStyle='#62c27a';ell(c,x+13+sw,y+13,5,4);c.fill();ell(c,x+33+sw,y+17,5,4);c.fill();
  c.strokeStyle='#143a22';c.lineWidth=2;rrect(c,x+2,y+3,TILE-4,TILE-5,14);c.stroke();
}
function drawArena(c,x0,y0,x1,y1){
  c.fillStyle='#4a3149';c.fillRect(-20,-20,MW+40,MH+40);
  c.fillStyle='#2e1f33';for(let i=-20;i<MW+20;i+=40){c.fillRect(i,-20,20,6);c.fillRect(i,MH+14,20,6);}
  c.strokeStyle=OUT;c.lineWidth=3;c.strokeRect(-20,-20,MW+40,MH+40);
  const c0=Math.max(0,Math.floor(x0/TILE)),c1=Math.min(COLS-1,Math.floor(x1/TILE)),r0=Math.max(0,Math.floor(y0/TILE)),r1=Math.min(ROWS-1,Math.floor(y1/TILE));
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++){c.fillStyle=((r+cc)&1)?'#356a73':'#3a7079';c.fillRect(cc*TILE,r*TILE,TILE,TILE);if(((cc*7+r*11)%9)===0){c.fillStyle='rgba(0,0,0,.08)';c.fillRect(cc*TILE+8,r*TILE+8,12,12);}}
  c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=1;c.beginPath();for(let cc=c0;cc<=c1+1;cc++){c.moveTo(cc*TILE,r0*TILE);c.lineTo(cc*TILE,(r1+1)*TILE);}c.stroke();
  if(!M.mode.ffa){c.fillStyle='rgba(70,180,255,.1)';c.fillRect(0,MH-3*TILE,MW,3*TILE);c.fillStyle='rgba(255,93,87,.1)';c.fillRect(0,0,MW,3*TILE);}
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=4;c.setLineDash([22,18]);c.beginPath();c.moveTo(0,MH/2);c.lineTo(MW,MH/2);c.stroke();c.setLineDash([]);
  for(const d of M.decals){const k=d.t/d.T;c.save();c.globalAlpha=1-k*k;c.translate(d.x,d.y);c.rotate(d.rot);c.fillStyle=d.col;ell(c,0,0,d.r,d.r*.8);c.fill();c.restore();}
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++){if(BUSH[r*COLS+cc])bush(c,cc*TILE,r*TILE,cc,r,M.now);}
}
function drawWalls(c,x0,y0,x1,y1){
  const c0=Math.max(0,Math.floor(x0/TILE)),c1=Math.min(COLS-1,Math.floor(x1/TILE)),r0=Math.max(0,Math.floor(y0/TILE)),r1=Math.min(ROWS-1,Math.floor(y1/TILE));
  for(let r=r0;r<=r1;r++)for(let cc=c0;cc<=c1;cc++)if(WALL[r*COLS+cc]){if(WA){c.save();upr(c,cc*TILE+TILE/2,r*TILE+TILE/2);crate(c,cc*TILE,r*TILE,cc,r);c.restore();}else crate(c,cc*TILE,r*TILE,cc,r);}
}
function drawZone(c){
  const col=M.zone===(MYT?'red':'blue')?BLUE:M.zone===(MYT?'blue':'red')?RED:M.zone==='contested'?SUNC:'#ffffff',t=M.now;
  c.save();add(c);glow(c,ZX,ZY,ZR*1.5,col,.18+.06*Math.sin(t*3));norm(c);
  c.globalAlpha=.16;c.fillStyle=col;c.beginPath();c.arc(ZX,ZY,ZR,0,TAU);c.fill();
  c.globalAlpha=.9;c.strokeStyle=col;c.lineWidth=5;c.setLineDash([18,12]);c.lineDashOffset=-t*20;c.stroke();c.setLineDash([]);
  c.globalAlpha=.3;c.lineWidth=3;c.beginPath();c.arc(ZX,ZY,ZR*.45,0,TAU);c.stroke();c.restore();
  if(M.zone!=='empty'&&Math.random()<.5)addFx({k:'spark',x:ZX+rand(-ZR,ZR)*.8,y:ZY+rand(-ZR,ZR)*.8,vx:0,vy:-60,t:0,T:.8,s:2.2,col});
}
function drawModeObjects(c){
  const id=M.mode.id,t=M.now;
  if(id==='ring')drawZone(c);
  if(M.mode.sd)for(const cb of M.cubes){const bb=Math.sin(t*4+cb.ph)*3,sc=Math.min(1,cb.t*5);c.save();upr(c,cb.x,cb.y);c.translate(cb.x,cb.y-8+bb);c.scale(sc,sc);c.fillStyle='rgba(8,6,22,.35)';ell(c,0,16-bb,9,3.5);c.fill();add(c);glow(c,0,0,28,'#46b4ff',.55+.15*Math.sin(t*5+cb.ph));norm(c);drawCube(c,0,0,11);c.restore();}
  if(id==='battery'){
    (MAP.pads||[[500,1505],[500,95]]).forEach((p,i)=>{const col=i===MYT?BLUE:RED;c.save();add(c);glow(c,p[0],p[1],PAD_R*1.5,col,.25+.08*Math.sin(t*4));norm(c);
      c.fillStyle='rgba(13,10,36,.6)';c.beginPath();c.arc(p[0],p[1],PAD_R,0,TAU);c.fill();c.lineWidth=5;c.strokeStyle=col;c.setLineDash([12,8]);c.lineDashOffset=t*30;c.stroke();c.setLineDash([]);
      c.fillStyle=col;c.globalAlpha=.8;c.beginPath();c.moveTo(p[0]+4,p[1]-22);c.lineTo(p[0]-10,p[1]+3);c.lineTo(p[0]-1,p[1]+3);c.lineTo(p[0]-4,p[1]+22);c.lineTo(p[0]+10,p[1]-3);c.lineTo(p[0]+1,p[1]-3);c.closePath();c.fill();c.restore();});
    c.fillStyle='rgba(92,225,160,.08)';c.beginPath();c.arc(ZX,ZY,90,0,TAU);c.fill();
    for(const it of M.items){const b=Math.sin(t*4+it.ph)*3,s=Math.min(1,it.t*4);c.save();upr(c,it.x,it.y);c.translate(it.x,it.y-6+b);c.scale(s,s);add(c);glow(c,0,0,30,'#5ce1a0',.5);norm(c);
      rrect(c,-7,-11,14,22,4);c.fillStyle='#1d3b30';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#5ce1a0';c.fillRect(-4,-4,8,12);c.fillStyle='#c9ffe6';c.fillRect(-3,-14,6,4);c.restore();}
  }
  if(id==='core')for(const s of M.cores){if(s.dead){c.fillStyle='rgba(15,10,25,.55)';ell(c,s.x,s.y+10,44,22);c.fill();continue;}
    const col=s.team===MYT?BLUE:RED,k=s.hp/s.maxHp;c.save();add(c);glow(c,s.x,s.y,90,col,.3+.15*Math.sin(t*3));norm(c);
    c.fillStyle='rgba(8,6,22,.4)';ell(c,s.x,s.y+30,44,14);c.fill();
    c.translate(s.x,s.y);c.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;c.lineTo(Math.cos(a)*38,Math.sin(a)*38);}c.closePath();c.fillStyle='#2a2560';c.fill();c.strokeStyle=OUT;c.lineWidth=3.5;c.stroke();
    c.rotate(t*.8);c.fillStyle=col;star(c,0,0,22,12,6);c.fill();c.rotate(-t*.8);c.fillStyle=s.flash>0?'#ffffff':'#fff';ell(c,0,0,9+2*Math.sin(t*6),9+2*Math.sin(t*6));c.fill();
    if(k<.66){c.strokeStyle='rgba(13,10,36,.85)';c.lineWidth=2.5;c.beginPath();c.moveTo(-20,-18);c.lineTo(-6,-4);c.lineTo(-14,10);if(k<.33){c.moveTo(18,-20);c.lineTo(8,0);c.lineTo(20,16);}c.stroke();}
    c.restore();}
  if(id==='crown'&&M.crown.live&&!M.crown.carrier){const cr=M.crown,b=Math.sin(t*3)*4;c.save();upr(c,cr.x,cr.y);add(c);glow(c,cr.x,cr.y,50,'#ffd23f',.5);norm(c);c.fillStyle='rgba(8,6,22,.35)';ell(c,cr.x,cr.y+14,16,6);c.fill();drawCrownIcon(c,cr.x,cr.y-8+b,1.1);c.restore();if(Math.random()<.3)addFx({k:'spark',x:cr.x+rand(-14,14),y:cr.y-rand(0,20),vx:0,vy:-40,t:0,T:.6,s:2,col:'#ffe27a'});}
}
function drawCrownIcon(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-14,8);c.lineTo(-16,-10);c.lineTo(-7,-2);c.lineTo(0,-14);c.lineTo(7,-2);c.lineTo(16,-10);c.lineTo(14,8);c.closePath();c.fillStyle='#ffd23f';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();c.fillStyle='#ff4d6d';ell(c,0,1,3,3);c.fill();c.restore();}
function drawCloud(c,x,y,s,flash){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=flash?'#e8f2ff':'#5b6380';c.strokeStyle=OUT;c.lineWidth=2.5;c.beginPath();c.arc(-14,4,12,0,TAU);c.arc(0,-4,16,0,TAU);c.arc(15,4,12,0,TAU);c.rect(-14,4,29,10);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.25)';ell(c,-4,-10,8,4);c.fill();c.restore();}
function drawFields(c){
  const t=M.now;
  for(const f of M.fields){const life=Math.min(1,f.t*4,(f.dur-f.t)*3);c.save();c.globalAlpha=life;
    if(f.kind==='dam'){
      const g=c.createRadialGradient(f.x,f.y,10,f.x,f.y,f.r);g.addColorStop(0,'rgba(90,190,235,.55)');g.addColorStop(1,'rgba(40,120,190,.35)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(220,250,255,.5)';c.lineWidth=2;for(let i=0;i<3;i++){const rr=((t*30+i*f.r/3)%f.r);c.globalAlpha=life*(1-rr/f.r)*.7;c.beginPath();c.arc(f.x,f.y,rr,0,TAU);c.stroke();}c.globalAlpha=life;
      const n=Math.round(f.r/11);for(let i=0;i<n;i++){const a=i/n*TAU;c.save();c.translate(f.x+Math.cos(a)*f.r,f.y+Math.sin(a)*f.r);c.rotate(a+Math.PI/2);rrect(c,-12,-6,24,12,5);c.fillStyle=i%2?'#8a5a3b':'#a0673f';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#e8c79a';ell(c,12,0,3.5,5);c.fill();c.restore();}
      if(Math.random()<.2)addFx({k:'bubble',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.8,col:'#d9f6ff'});
    }else if(f.kind==='saw'){c.translate(f.x,f.y);c.rotate(t*14);c.fillStyle='#d8dbe6';c.strokeStyle=OUT;c.lineWidth=2;c.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16,rr=i%2?f.r*.55:f.r*.8;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.fillStyle='#7a8094';ell(c,0,0,f.r*.2,f.r*.2);c.fill();
    }else if(f.kind==='paint'){c.fillStyle=f.col||'#ff5e87';c.globalAlpha=life*.55;c.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10,rr=f.r*(.8+.2*Math.sin(i*2.3));c.lineTo(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr);}c.closePath();c.fill();c.globalAlpha=life*.35;c.fillStyle='#fff';ell(c,f.x-f.r*.25,f.y-f.r*.25,f.r*.2,f.r*.12);c.fill();
    }else if(f.kind==='fire'){c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.2,'#ff7a1a',.5);c.globalCompositeOperation='source-over';if(Math.random()<.25)addFx({k:'spark',x:f.x+rand(-f.r,f.r)*.6,y:f.y+rand(-f.r,f.r)*.6,vx:0,vy:-70,t:0,T:.4,s:3,col:'#ffb347'});
    }else if(f.kind==='spore'||f.kind==='mush'){const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(185,242,124,.4)');g.addColorStop(1,'rgba(120,200,90,.08)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();c.strokeStyle='rgba(185,242,124,.8)';c.lineWidth=3;c.setLineDash([10,8]);c.lineDashOffset=-t*25;c.stroke();c.setLineDash([]);
      if(f.kind==='mush')for(let i=0;i<8;i++){const a=i*TAU/8,x=f.x+Math.cos(a)*f.r*.88,y=f.y+Math.sin(a)*f.r*.88;c.fillStyle='#fff6e8';c.fillRect(x-3,y-2,6,9);c.fillStyle=i%2?'#e2543b':'#9dff6b';ell(c,x,y-3,9,6);c.fill();}
      if(Math.random()<.3)addFx({k:'bubble',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.8,col:'#d9ffb0'});
    }else if(f.kind==='starzone'){
      c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.3,'#7b4bff',.3);c.globalCompositeOperation='source-over';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(8,4,24,.85)');g.addColorStop(.55,'rgba(40,24,100,.55)');g.addColorStop(1,'rgba(120,80,255,.18)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(255,211,107,.85)';c.lineWidth=3;c.setLineDash([10,8]);c.lineDashOffset=-t*30;c.stroke();c.setLineDash([]);
      c.strokeStyle='rgba(200,180,255,.5)';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(f.x,f.y,f.r*(.3+i*.2),-t*2+i,-t*2+i+1.8);c.stroke();}
      c.fillStyle='#fff6d0';for(let i=0;i<14;i++){const a=i*2.4+t*.4,rr=f.r*(.15+((i*37)%80)/100),k=.5+.5*Math.sin(t*4+i);c.globalAlpha=life*(.4+.6*k);star(c,f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,3+k*2,1.3,4);c.fill();}c.globalAlpha=life;
      if(Math.random()<.35)addFx({k:'fallstar',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,t:0,T:.35,col:'#ffe48a'});
    }else if(f.kind==='thunder'){const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(40,50,110,.15)');g.addColorStop(1,'rgba(60,80,170,.4)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(191,230,255,.7)';c.lineWidth=3;c.setLineDash([14,10]);c.lineDashOffset=t*40;c.stroke();c.setLineDash([]);
      for(let k=0;k<f.clouds;k++){const a=t*.8+k*TAU/f.clouds,cx=f.x+Math.cos(a)*f.r*.55,cy=f.y+Math.sin(a)*f.r*.55-50;c.fillStyle='rgba(10,8,30,.25)';ell(c,cx,cy+50,34,10);c.fill();drawCloud(c,cx,cy,1.3,Math.random()<.06);}
    }else if(f.kind==='healzone'||f.kind==='reloadzone'){const col=f.kind==='healzone'?'107,227,154':'255,210,63';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba('+col+',.35)');g.addColorStop(1,'rgba('+col+',.08)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba('+col+',.85)';c.lineWidth=3;c.setLineDash([12,8]);c.lineDashOffset=-t*30;c.stroke();c.setLineDash([]);
      if(Math.random()<.3)addFx({k:f.kind==='healzone'?'plus':'spark',x:f.x+rand(-f.r,f.r)*.7,y:f.y+rand(-f.r,f.r)*.7,vx:0,vy:-30,t:0,T:.8,s:2.5,col:'#ffd23f'});
    }else if(f.kind==='hole'){
      c.globalCompositeOperation='lighter';glow(c,f.x,f.y,f.r*1.2,'#7b4bff',.35);c.globalCompositeOperation='source-over';
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(5,2,15,.95)');g.addColorStop(.5,'rgba(40,20,90,.6)');g.addColorStop(1,'rgba(120,80,255,0)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(200,180,255,.6)';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.arc(f.x,f.y,f.r*(.3+i*.17),t*3+i,t*3+i+2.2);c.stroke();}
      if(Math.random()<.6){const a=rand(0,TAU);addFx({k:'spark',x:f.x+Math.cos(a)*f.r,y:f.y+Math.sin(a)*f.r,vx:-Math.cos(a)*f.r*1.6,vy:-Math.sin(a)*f.r*1.6,t:0,T:.5,s:2,col:'#c9b5ff'});}
    }else{
      const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);g.addColorStop(0,'rgba(220,245,255,.45)');g.addColorStop(1,'rgba(140,200,255,.15)');c.fillStyle=g;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();
      c.strokeStyle='rgba(230,248,255,.7)';c.lineWidth=2;c.setLineDash([6,8]);c.lineDashOffset=-t*20;c.stroke();c.setLineDash([]);
      if(Math.random()<.7)addFx({k:'snow',x:f.x+rand(-f.r,f.r)*.8,y:f.y+rand(-f.r,f.r)*.8,t:0,T:.9});
    }
    c.restore();}
}
function drawStorm(c,x0,y0,vw,vh){
  if(!M.storm||M.storm.r>=999)return;const sf=M.storm.fill||'rgba(90,30,140,.42)',se=M.storm.edge||'rgba(220,150,255,.8)',sg=M.storm.fog||'#6a2fa0';const r=M.storm.r;
  c.save();c.beginPath();c.rect(x0-50,y0-50,vw+100,vh+100);c.arc(ZX,ZY,r,0,TAU,true);c.fillStyle=sf;c.fill('evenodd');
  c.strokeStyle=se;c.lineWidth=4;c.setLineDash([16,10]);c.lineDashOffset=M.now*25;c.beginPath();c.arc(ZX,ZY,r,0,TAU);c.stroke();c.restore();
  if(Math.random()<.8){const a=rand(0,TAU);addFx({k:'smoke',x:ZX+Math.cos(a)*(r+rand(0,60)),y:ZY+Math.sin(a)*(r+rand(0,60)),vx:0,vy:-10,t:0,T:1,s:20,col:sg});}
}
function drawAim(c){
  if(!P||P.dead||M.state!=='play')return;
  let kind=null,ang=0,frac=1,faint=false;
  const drag=o=>[Math.atan2(o.y-o.sy,o.x-o.sx)-WA,clamp(Math.hypot(o.x-o.sx,o.y-o.sy)/70,.15,1)];
  if(ctl.sup&&ctl.sup.drag){kind='sup';[ang,frac]=drag(ctl.sup);}
  else if(ctl.atk&&ctl.atk.drag){kind='atk';[ang,frac]=drag(ctl.atk);}
  else if(mouseMode&&mouse.has){kind='atk';faint=true;const[wx,wy]=toWorld(mouse.x,mouse.y);ang=Math.atan2(wy-P.y,wx-P.x);if(P.b.atk.kind==='lob')frac=clamp(dist(P.x,P.y,wx,wy)/P.b.atk.range,.1,1);}
  if(!kind)return;
  const spec=kind==='atk'?P.b.atk:P.b.sup,k=spec.kind,base=kind==='sup'?'rgba(255,201,60,':'rgba(255,255,255,',a0=faint?.12:.24,R=1+P.mods.range;
  c.save();c.fillStyle=base+a0+')';c.strokeStyle=base+(a0+.3)+')';c.lineWidth=2;
  if(['single','beam','dash','log','chain','star','chainbig','boomerang','wave','bigwave','burst'].includes(k)){const w=k==='dash'?P.rad*2:(spec.r||7)*2+8,len=k==='dash'||k==='boomerang'||k==='bigwave'?spec.range*R:rayLen(P.x,P.y,ang,spec.range*R);c.translate(P.x,P.y);c.rotate(ang);rrect(c,0,-w/2,len,w,w/2);c.fill();c.stroke();}
  else if(k==='spread'||k==='melee'||k==='shockcone'||k==='boomerang3'){const RR=(spec.range||200)*R+(k==='melee'?10:0),arc=(spec.arc||.3)+(k==='spread'?.12:0);c.beginPath();c.moveTo(P.x,P.y);c.arc(P.x,P.y,RR,ang-arc/2,ang+arc/2);c.closePath();c.fill();c.stroke();}
  else if(k==='lob'||k==='orbs'||k==='meteor'||k==='bigbomb'||k==='field'||k==='starzone'||k==='dam'){const d=(k==='dam'?spec.range:spec.range*R)*frac,tx=P.x+Math.cos(ang)*d,ty=P.y+Math.sin(ang)*d,rr=k==='field'||k==='starzone'||k==='dam'||k==='meteor'?spec.radius:spec.splash*(1+P.mods.splash);c.setLineDash([6,8]);c.beginPath();c.moveTo(P.x,P.y);c.quadraticCurveTo((P.x+tx)/2,(P.y+ty)/2-80,tx,ty);c.stroke();c.setLineDash([]);c.beginPath();c.arc(tx,ty,rr,0,TAU);c.fill();c.stroke();}
  else if(k==='grabthrow'){const gt=grabTarget(P),L=rayLen(P.x,P.y,ang,tossDist(P));c.setLineDash([5,7]);c.beginPath();c.arc(P.x,P.y,spec.grab,0,TAU);c.stroke();c.setLineDash([]);c.translate(P.x,P.y);c.rotate(ang);rrect(c,0,-14,L,28,14);c.fill();c.stroke();c.rotate(-ang);c.translate(-P.x,-P.y);if(gt){c.lineWidth=3;c.beginPath();c.arc(gt.x,gt.y,gt.rad+8,0,TAU);c.stroke();}}
  else{const rr=spec.zone||spec.radius||spec.range*R||spec.reach||120;c.beginPath();c.arc(P.x,P.y,k==='turret'?44:rr,0,TAU);c.fill();c.stroke();}
  c.restore();
}
function drawUnit(c,u){c.save();upr(c,u.x,u.y);try{drawUnit0(c,u);}finally{c.restore();}}
function drawUnit0(c,u){
  const ally=u.team===MYT,alpha=((ally&&u.hidden)?.5:1)*(u.dive?.45:1),col=u.isPlayer?OKC:ally?BLUE:RED;
  if(M.mode.id==='hunt'&&u.bounty){const by=u.y-u.rad*1.65-50;c.save();c.fillStyle=u.bounty>=5?'#ff7a1a':'#ffd23f';c.strokeStyle=OUT;c.lineWidth=2.5;star(c,u.x,by,11,5,5);c.fill();c.stroke();c.fillStyle='#120f26';c.font='900 11px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(u.bounty),u.x,by+1);c.restore();}
  if(u.darkT>0){c.save();c.strokeStyle='rgba(20,10,36,.9)';c.lineWidth=5;c.setLineDash([6,5]);c.lineDashOffset=-M.now*20;c.beginPath();c.arc(u.x,u.y,u.rad*1.25,0,TAU);c.stroke();c.restore();}
  if(u.darkX>0&&(u.darkT>0||u.poisonT>0)){const yx=u.y-u.rad*2.4;c.save();c.lineCap='round';for(const[w,col2]of[[9,'#ffffff'],[5,'#120a20']]){c.strokeStyle=col2;c.lineWidth=w;c.beginPath();c.moveTo(u.x-9,yx-9);c.lineTo(u.x+9,yx+9);c.moveTo(u.x+9,yx-9);c.lineTo(u.x-9,yx+9);c.stroke();}c.restore();}
  for(const g of u.ghosts){const gp=upP(u.x,u.y,g.x,g.y);drawFighter(c,gp[0],gp[1],u.rad,u.b,u.sk,u.aim+WA,M.now,{alpha:.35*(1-g.t/.3),still:true,noShadow:true,flat:true,tint:'rgba(255,255,255,.35)'});}
  c.save();c.globalAlpha=alpha;add(c);glow(c,u.x,u.y+u.rad*.9,u.rad*1.6,col,.22);norm(c);c.strokeStyle=col;c.lineWidth=3;ell(c,u.x,u.y+u.rad*.92,u.rad*1.05,u.rad*.38);c.stroke();c.restore();
  if(u.shadow){c.save();add(c);glow(c,u.x,u.y,u.rad*2.2,'#9d7bff',.45);c.restore();}
  if(u.zoneT>0){c.save();add(c);glow(c,u.x,u.y+u.rad*.5,u.rad*2,'#ffd36b',.35);c.restore();}
  if(u.damT>0){c.save();add(c);glow(c,u.x,u.y,u.rad*2,'#7fd3ff',.35);c.restore();}
  if(u.guardT>0){c.save();c.globalAlpha=.6;c.strokeStyle='#9ff5bf';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.rad*1.4,0,TAU);c.stroke();c.restore();}
  const lift=u.thrown?u.thrown.h:u.leap?u.leap.h:0;
  if(u===P||(u.team===MYT&&!u.isPlayer)){const z=closeZone(u.b);if(z){c.save();c.globalAlpha=u===P?(u.zoneOn?.5:.2):.12;c.strokeStyle=u.zoneOn?'#ffd23f':'#ffffff';c.lineWidth=u.zoneOn?3:2;c.setLineDash([10,9]);c.beginPath();c.arc(u.x,u.y,z,0,TAU);c.stroke();c.restore();}}
  if(u===P&&u.b.sup.kind==='leap'&&u.super>=1){const has=!!leapTarget(u);c.save();c.globalAlpha=has?.55:.3;c.strokeStyle=has?'#9fe8ff':'#9a98a8';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.b.sup.zone,0,TAU);c.stroke();c.restore();}
  if(lift){c.save();c.fillStyle='rgba(8,6,22,.35)';ell(c,u.x,u.y+u.rad*.9,u.rad*.9*(1-lift/200),u.rad*.3);c.fill();c.restore();}
  drawFighter(c,u.x,u.y-lift,u.rad,u.b,u.sk,(u.thrown?u.thrown.t*14+u.aim:u.aim)+WA,M.now,{noShadow:!!lift,alpha,flash:u.flash,moving:u.moving&&u.stunT<=0,phase:u.phase,hurt:u.hp/u.maxHp<.3,still:REDUCED||u.stunT>0,squash:u.squash,tint:u.shadow?'rgba(40,15,90,.6)':u.slowT>0?'rgba(150,210,255,.35)':u.poisonT>0?'rgba(140,230,80,.3)':null});
  if(u.b.atk.kind==='cloudzap'){const ch=u.ammo/u.maxAmmo;drawCloud(c,u.x,u.y-lift-u.rad*2.4+Math.sin(M.now*2)*2,.85,u.zoneOn&&Math.random()<.08);c.fillStyle=ch>=.34?'#ffe14d':'rgba(255,225,77,.35)';for(let k=0;k<u.maxAmmo;k++){c.beginPath();c.arc(u.x-10+k*10,u.y-lift-u.rad*2.4+16,3,0,TAU);c.fillStyle=u.ammo>=k+1?'#ffe14d':'rgba(255,255,255,.25)';c.fill();}}
  if(u.hasCrown){drawCrownIcon(c,u.x,u.y-u.rad*1.9-22+Math.sin(M.now*4)*2,.8);c.save();add(c);glow(c,u.x,u.y-u.rad*2-20,30,'#ffd23f',.5);c.restore();}
  if(u.carry>0){c.save();c.translate(u.x+u.rad*.9,u.y-u.rad*.9);rrect(c,-11,-9,22,18,6);c.fillStyle='#1d3b30';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.fillStyle='#5ce1a0';c.font='800 12px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(u.carry,0,1);c.restore();}
  if(u.shield>0){c.save();c.globalAlpha=.35+.15*Math.sin(M.now*10);c.strokeStyle='#bff3ff';c.fillStyle='rgba(191,243,255,.15)';c.lineWidth=3;c.beginPath();c.arc(u.x,u.y,u.rad*1.55,0,TAU);c.fill();c.stroke();c.restore();}
  if(u.vulnT>0){c.save();c.translate(u.x+u.rad*1.15,u.y-u.rad*1.05);c.fillStyle='#ff9a3d';c.strokeStyle=OUT;c.lineWidth=2;c.beginPath();c.moveTo(-6,-5);c.lineTo(6,-5);c.lineTo(0,5);c.closePath();c.fill();c.stroke();c.restore();}
  for(const s of M.shots)if(s.home&&s.home.phase==='out'&&s.home.tgt===u&&s.team!==u.team){c.save();c.strokeStyle='#ffd36b';c.lineWidth=3;c.setLineDash([6,5]);c.lineDashOffset=M.now*30;c.beginPath();c.arc(u.x,u.y,u.rad*1.7,0,TAU);c.stroke();c.restore();}
  if(u.markT>0&&!ally){c.save();c.translate(u.x,u.y-u.rad*2.2-16);c.rotate(Math.sin(M.now*6)*.15);c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(-10,-10);c.lineTo(10,10);c.moveTo(10,-10);c.lineTo(-10,10);c.stroke();c.strokeStyle='#ff2b3a';c.lineWidth=5;c.stroke();c.restore();}
  if(u.stunT>0){for(let i=0;i<3;i++){const a=M.now*5+i*TAU/3;c.fillStyle='#ffe27a';star(c,u.x+Math.cos(a)*u.rad*.9,u.y-u.rad*1.3+Math.sin(a)*u.rad*.3,5,2.2,5);c.fill();}}
  if(u.isPlayer&&u.super>=1){c.save();c.strokeStyle=SUNC;c.lineWidth=3;c.setLineDash([8,7]);c.lineDashOffset=-M.now*30;c.beginPath();c.arc(u.x,u.y,u.rad*1.45,0,TAU);c.stroke();add(c);glow(c,u.x,u.y,u.rad*2.2,SUNC,.2+.1*Math.sin(M.now*6));c.restore();}
}
function drawStructs(c){
  for(const s of M.structs){if(s.dead||s.kind!=='box')continue;const hit=s.flash>0?s.flash:0,jx=Math.sin(M.now*26+s.id*1.7)*1.3+(hit?rand(-3,3)*hit:0);
    c.save();c.translate(s.x+jx,s.y);if(WA)c.rotate(-WA);c.fillStyle='rgba(8,6,22,.38)';ell(c,0,21,23,7);c.fill();c.rotate(Math.sin(M.now*19+s.id)*.05);
    rrect(c,-22,-20,44,40,8);c.fillStyle='#2f5f9e';c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    rrect(c,-16,-14,32,28,5);c.fillStyle='#4a86c8';c.fill();c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-16,-14,32,5);
    c.fillStyle='#c98f55';c.fillRect(-22,-3,44,6);c.strokeStyle=OUT;c.lineWidth=2;c.strokeRect(-22,-3,44,6);
    add(c);glow(c,0,0,26,'#7fd3ff',.35+.15*Math.sin(M.now*4+s.id));norm(c);drawCube(c,0,0,8);
    if(hit){c.fillStyle='rgba(255,255,255,'+(hit*.6)+')';rrect(c,-22,-20,44,40,8);c.fill();}c.restore();}
  for(const s of M.structs){if(s.dead||s.kind!=='turret')continue;const col=s.owner.sk.proj;c.save();c.translate(s.x,s.y);if(WA)c.rotate(-WA);
    c.fillStyle='rgba(8,6,22,.35)';ell(c,0,14,18,7);c.fill();rrect(c,-15,-6,30,20,6);c.fillStyle='#4a4f66';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();
    c.rotate(s.aim+WA);rrect(c,-10,-10,20,20,7);c.fillStyle=s.owner.sk.body;c.fill();c.stroke();rrect(c,6,-4,18,8,3);c.fillStyle='#3a3350';c.fill();c.stroke();c.rotate(-(s.aim+WA));
    add(c);glow(c,0,0,14,col,.5+.3*Math.sin(M.now*8));c.restore();}
}
function bar(c,x,y,w,h,f,col){c.fillStyle='rgba(10,8,25,.8)';rrect(c,x-2,y-2,w+4,h+4,4);c.fill();if(f>0){c.fillStyle=col;rrect(c,x,y,Math.max(2,w*f),h,3);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x+2,y+1,Math.max(0,w*f-4),2);}}
function drawLabels(c,u,z){
  const ally=u.team===MYT,col=u.isPlayer?OKC:ally?BLUE:RED,bw=52,bh=7,top=u.y-u.rad*1.65-14,bx=u.x-bw/2;
  c.save();upr(c,u.x,u.y);if(ally&&u.hidden)c.globalAlpha=.6;
  bar(c,bx,top,bw,bh,clamp(u.hp/u.maxHp,0,1),col);
  const fs=11/z;c.font='800 '+fs+'px Rubik, system-ui, sans-serif';c.textAlign='center';c.textBaseline='bottom';c.lineWidth=3/z;c.strokeStyle='rgba(10,8,25,.9)';c.lineJoin='round';
  const nm=u.name+' · '+u.lvl+(u.stolen.length?'  ✦'+u.stolen.length:'');c.strokeText(nm,u.x,top-3);if(u.cubes){const cy=top-3-fs-8/z;drawCube(c,u.x-9/z,cy,6/z);c.save();c.textAlign='left';c.textBaseline='middle';c.font='900 '+(12/z)+'px Rubik, system-ui, sans-serif';c.strokeText(u.cubes,u.x+1/z,cy+1/z);c.fillStyle='#bfeaff';c.fillText(u.cubes,u.x+1/z,cy+1/z);c.restore();}c.fillStyle='#ffffff';c.fillText(nm,u.x,top-3);
  if(u.isPlayer){const na=u.maxAmmo||3,gap=3,sw=na===1?42:15,tot=sw*na+gap*(na-1),ay=u.y+u.rad*1.3+6;let ax=u.x-tot/2;
    for(let i=0;i<na;i++){c.fillStyle='rgba(10,8,25,.8)';c.fillRect(ax-1,ay-1,sw+2,7);const fl=clamp(u.ammo-i,0,1),ac=u.b.atk.kind==='fist'?(u.strongFist?'#ffd23f':'#9fe8ff'):SUNC;c.fillStyle=fl>=1?ac:'rgba(255,201,60,.5)';c.fillRect(ax,ay,sw*fl,5);ax+=sw+gap;}}
  if(u.say&&M.now-u.say.at<2.2&&!u.pin){const age=M.now-u.say.at,k=Math.min(1,age*8),py=top-26/z-(u.cubes?16/z:0);c.save();c.translate(u.x,py);c.scale(k,k);c.font='800 '+(12/z)+'px Rubik, system-ui, sans-serif';const w=c.measureText(u.say.txt).width+16/z;
    rrect(c,-w/2,-12/z,w,22/z,10/z);c.fillStyle=u===P?'#fff6c2':'#ffffff';c.fill();c.strokeStyle=OUT;c.lineWidth=2/z;c.stroke();c.beginPath();c.moveTo(-5/z,10/z);c.lineTo(0,17/z);c.lineTo(5/z,10/z);c.fill();c.fillStyle='#1b1430';c.textAlign='center';c.textBaseline='middle';c.fillText(u.say.txt,0,0);c.restore();}
  if(u.pin){const k=Math.min(1,(2.6-u.pinT)*6),py=top-30/z-6-(u.cubes?16/z:0);c.translate(u.x,py);c.scale(k,k);rrect(c,-24,-24,48,46,14);c.fillStyle='#ffffff';c.fill();c.strokeStyle=OUT;c.lineWidth=2.5;c.stroke();c.beginPath();c.moveTo(-6,21);c.lineTo(0,30);c.lineTo(6,21);c.fillStyle='#fff';c.fill();drawPin(c,u.pin,0,-1,40);}
  c.restore();
}
function drawShot(c,s){
  if(s.lob){c.fillStyle='rgba(8,6,22,.35)';ell(c,s.x,s.y,s.r,s.r*.45);c.fill();const y=s.y-s.h;
    if(s.style==='meteor'){const k=Math.min(1,s.t/s.T);c.fillStyle='rgba(8,6,22,.4)';ell(c,s.tx,s.ty,s.r*(.4+k*1.4),s.r*(.2+k*.6));c.fill();
      c.save();add(c);glow(c,s.x,y,s.r*3.5,'#ff7a1a',.9);glow(c,s.x+40,y-60,s.r*2.5,'#ffb347',.45);norm(c);
      c.translate(s.x,y);c.rotate(M.now*4);c.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,rr=s.r*(.82+((i*37)%5)*.06);c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle='#5a3a2a';c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
      c.fillStyle='#ff9a3d';ell(c,-s.r*.25,-s.r*.2,s.r*.22,s.r*.16);c.fill();ell(c,s.r*.3,s.r*.25,s.r*.16,s.r*.12);c.fill();c.restore();return;}
    if(s.style==='sun'){c.save();add(c);glow(c,s.x,y,s.r*3,'#ffb347',.8);norm(c);c.strokeStyle='#fff1a6';c.lineWidth=2;for(let i=0;i<8;i++){const a=i/8*TAU+M.now*3;c.beginPath();c.moveTo(s.x+Math.cos(a)*s.r*1.2,y+Math.sin(a)*s.r*1.2);c.lineTo(s.x+Math.cos(a)*s.r*1.8,y+Math.sin(a)*s.r*1.8);c.stroke();}
      ell(c,s.x,y,s.r,s.r);c.fillStyle='#ffd36b';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.restore();return;}
    if(s.style==='moon2'){c.save();add(c);glow(c,s.x,y,s.r*2.6,'#9fc8ff',.7);norm(c);c.beginPath();c.arc(s.x,y,s.r,Math.PI*.3,Math.PI*1.7);c.arc(s.x+s.r*.45,y,s.r*.78,Math.PI*1.55,Math.PI*.45,true);c.closePath();c.fillStyle='#e6efff';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.restore();return;}
    if(s.style==='coco'){ell(c,s.x,y,s.r,s.r);c.fillStyle='#6b4226';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else if(s.onLand){c.save();add(c);glow(c,s.x,y,s.r*2.4,s.onLand.kind==='hole'||s.onLand.kind==='starzone'?'#9d7bff':'#c9f0ff',.7);c.restore();ell(c,s.x,y,s.r,s.r);c.fillStyle=s.onLand.kind==='hole'||s.onLand.kind==='starzone'?'#1b1035':'#e6f8ff';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else if(s.style==='pebble'){ell(c,s.x,y,s.r*1.2,s.r);c.fillStyle='#9a948a';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();}
    else{ell(c,s.x,y,s.r,s.r);c.fillStyle='#2c2340';c.fill();c.strokeStyle=OUT;c.lineWidth=2;c.stroke();c.save();add(c);glow(c,s.x+s.r*.5,y-s.r*.8,8,'#ffd38a',.9);c.restore();}
    return;}
  const a=Math.atan2(s.vy,s.vx),col=s.color;
  c.save();add(c);
  const tr=s.trail;if(tr.length>=4){c.lineCap='round';for(let i=2;i<tr.length;i+=2){const k=i/tr.length;c.globalAlpha=k*.55;c.strokeStyle=col;c.lineWidth=s.r*2*k*(s.big?1.4:1);c.beginPath();c.moveTo(tr[i-2],tr[i-1]);c.lineTo(tr[i],tr[i+1]);c.stroke();}c.globalAlpha=1;}
  glow(c,s.x,s.y,s.r*(s.big?3.6:2.6),col,s.style==='splinter'||s.style==='log'||s.style==='stone'?.25:.75);norm(c);
  c.translate(s.x,s.y);c.strokeStyle=OUT;c.lineWidth=2;c.fillStyle=col;
  switch(s.style){
    case 'fist':c.rotate(a);c.fillStyle='#f4f1e6';rrect(c,-s.r*1.6,-s.r*.55,s.r*.6,s.r*1.1,s.r*.2);c.fill();c.stroke();c.fillStyle=col;ell(c,0,0,s.r*1.15,s.r);c.fill();c.stroke();ell(c,-s.r*.15,-s.r*.85,s.r*.45,s.r*.32);c.fill();c.stroke();break;
    case 'flame':{const k=clamp(s.left/s.range,0,1);c.globalAlpha=.5+.5*k;ell(c,0,0,s.r*1.2,s.r*1.2);c.fill();c.fillStyle='#fff3c4';ell(c,0,0,s.r*.5,s.r*.5);c.fill();break;}
    case 'beam':c.rotate(a);rrect(c,-s.r*2.4,-s.r*.7,s.r*3.4,s.r*1.4,s.r*.7);c.fill();c.stroke();c.fillStyle='#fff';rrect(c,-s.r*1.8,-s.r*.3,s.r*2.6,s.r*.6,s.r*.3);c.fill();break;
    case 'laser':c.rotate(a);rrect(c,-s.r*3,-s.r*.45,s.r*4,s.r*.9,s.r*.45);c.fill();c.fillStyle='#fff';rrect(c,-s.r*2.4,-s.r*.2,s.r*3,s.r*.4,s.r*.2);c.fill();break;
    case 'shard':c.rotate(a);c.beginPath();c.moveTo(s.r*1.6,0);c.lineTo(0,-s.r*.7);c.lineTo(-s.r*1.2,0);c.lineTo(0,s.r*.7);c.closePath();c.fill();c.stroke();break;
    case 'needle':case 'claw':c.rotate(a);c.beginPath();c.moveTo(s.r*1.6,0);c.lineTo(-s.r,-s.r*.45);c.lineTo(-s.r,s.r*.45);c.closePath();c.fill();c.stroke();break;
    case 'rang':case 'moon':c.rotate(s.spin);if(s.style==='moon'){c.beginPath();c.arc(0,0,s.r,Math.PI*.35,Math.PI*1.65);c.arc(s.r*.4,0,s.r*.75,Math.PI*1.55,Math.PI*.45,true);c.closePath();c.fill();c.stroke();}
      else{c.beginPath();c.moveTo(-s.r,-s.r*.2);c.lineTo(0,-s.r*.2);c.lineTo(s.r*.2,-s.r);c.lineTo(s.r*.6,-s.r*.8);c.lineTo(s.r*.3,s.r*.2);c.lineTo(-s.r,s.r*.2);c.closePath();c.fill();c.stroke();}break;
    case 'wave':{c.rotate(a);const k=clamp(s.left/s.range,0,1);c.globalAlpha=.4+.6*k;c.beginPath();c.arc(-s.r*.4,0,s.r,-1.1,1.1);c.arc(-s.r*.9,0,s.r*.8,1.0,-1.0,true);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.stroke();
      if(Math.random()<.5)addFx({k:'bubble',x:s.x+rand(-s.r,s.r)*.5,y:s.y+rand(-s.r,s.r)*.5,t:0,T:.5,col:'#e6faff'});break;}
    case 'spark':c.save();add(c);glow(c,0,0,s.r*3,'#ffffff',.8);c.restore();c.beginPath();for(let i=0;i<6;i++){const aa=i/6*TAU+s.spin,rr=i%2?s.r*.6:s.r*1.5;c.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);}c.closePath();c.fill();break;
    case 'log':c.rotate(a+Math.sin(s.spin*.4)*.1);rrect(c,-s.r*1.6,-s.r*.65,s.r*3.2,s.r*1.3,s.r*.6);c.fillStyle='#a0673f';c.fill();c.stroke();c.fillStyle='#e8c79a';ell(c,s.r*1.5,0,s.r*.35,s.r*.6);c.fill();c.lineWidth=1.5;c.stroke();c.strokeStyle='rgba(60,30,15,.6)';c.beginPath();c.moveTo(-s.r,-s.r*.2);c.lineTo(s.r*.8,-s.r*.2);c.moveTo(-s.r*.6,s.r*.25);c.lineTo(s.r,s.r*.25);c.stroke();break;
    case 'splinter':c.rotate(s.spin);rrect(c,-s.r,-s.r*.35,s.r*2,s.r*.7,s.r*.3);c.fillStyle='#b67a4c';c.fill();c.stroke();break;
    case 'stone':c.rotate(s.spin);ell(c,0,0,s.r*1.1,s.r*.9);c.fillStyle='#a49e94';c.fill();c.stroke();break;
    case 'ball':ell(c,0,0,s.r,s.r);c.fillStyle='#f4f1e6';c.fill();c.stroke();c.strokeStyle='#e23d3d';c.lineWidth=1.5;c.beginPath();c.arc(-s.r*.9,0,s.r*.7,-.9,.9);c.stroke();c.beginPath();c.arc(s.r*.9,0,s.r*.7,Math.PI-.9,Math.PI+.9);c.stroke();break;
    case 'bat':c.rotate(s.spin*1.3);rrect(c,-s.r*1.6,-s.r*.22,s.r*1.4,s.r*.44,s.r*.2);c.fillStyle='#8a5a2e';c.fill();c.stroke();
      c.beginPath();c.moveTo(-s.r*.3,-s.r*.22);c.quadraticCurveTo(s.r*.6,-s.r*.5,s.r*1.6,-s.r*.4);c.quadraticCurveTo(s.r*1.9,0,s.r*1.6,s.r*.4);c.quadraticCurveTo(s.r*.6,s.r*.5,-s.r*.3,s.r*.22);c.closePath();c.fillStyle='#c98f55';c.fill();c.stroke();
      c.fillStyle='#ff4d6d';c.fillRect(-s.r*1.5,-s.r*.2,s.r*.6,s.r*.4);break;
    case 'star':c.rotate(s.spin*.6);star(c,0,0,s.r*1.35,s.r*.58,5);c.fill();c.stroke();c.fillStyle='#fff';star(c,0,0,s.r*.6,s.r*.26,5);c.fill();break;
    case 'pellet':ell(c,0,0,s.r*.8,s.r*.8);c.fill();break;
    case 'rivet':c.rotate(a);rrect(c,-s.r*1.2,-s.r*.5,s.r*2.4,s.r,s.r*.4);c.fill();c.stroke();break;
    default:ell(c,0,0,s.r,s.r);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';ell(c,-s.r*.3,-s.r*.3,s.r*.35,s.r*.35);c.fill();
  }
  c.restore();
}
function drawLobMarkers(c){for(const s of M.shots){if(!s.lob)continue;const enemy=s.team!==MYT;c.save();c.globalAlpha=enemy?.65:.3;c.strokeStyle=enemy?RED:'#ffffff';c.fillStyle=enemy?'rgba(255,93,87,.16)':'rgba(255,255,255,.08)';c.lineWidth=2.5;c.setLineDash([7,6]);c.lineDashOffset=-M.now*20;const rr=s.onLand?s.onLand.radius:s.splash;c.beginPath();c.arc(s.tx,s.ty,rr*(.6+.4*Math.min(1,s.t/s.T)),0,TAU);c.fill();c.stroke();c.restore();}}
const UPR_FX=new Set(['ghost','beam','fallstar','plus','star','bubble','snow','vine']);
function drawFx(c,front){
  for(const f of M.fx){if(f.t<0)continue;const k=f.t/f.T;
    if(front!==(f.k!=='smoke'&&f.k!=='leaf'&&f.k!=='vine'&&f.k!=='beam'))continue;
    c.save();if(WA&&UPR_FX.has(f.k))upr(c,f.x,f.y);
    switch(f.k){
      case 'spark':add(c);glow(c,f.x,f.y,f.s*3.2*(1-k*.6),f.col,1-k);break;
      case 'flash':add(c);glow(c,f.x,f.y,f.r*(.6+k*.6),f.col,(1-k)*.95);break;
      case 'smoke':c.globalAlpha=(1-k)*.45;c.fillStyle=f.col;ell(c,f.x,f.y,f.s*(1+k*1.4),f.s*(1+k*1.4));c.fill();break;
      case 'debris':c.globalAlpha=k>.8?(1-k)*5:1;c.fillStyle='rgba(8,6,22,.3)';ell(c,f.x,f.y,f.s,f.s*.4);c.fill();c.translate(f.x,f.y-f.z);c.rotate(f.rot);c.fillStyle=f.col;c.fillRect(-f.s,-f.s*.6,f.s*2,f.s*1.2);c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(-f.s,-f.s*.6,f.s*2,f.s*1.2);break;
      case 'ring':c.globalAlpha=(1-k)*.9;c.strokeStyle=f.col;c.lineWidth=f.w*(1-k)+1;c.beginPath();c.arc(f.x,f.y,Math.max(0,f.r0+(f.r1-f.r0)*(1-(1-k)*(1-k))),0,TAU);c.stroke();break;
      case 'swipe':if(f.dark){c.globalAlpha=.55*(1-k);c.fillStyle='#0a0612';c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;c.strokeStyle='#000000';c.lineWidth=6;c.lineCap='round';c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();c.strokeStyle='rgba(123,47,224,.6)';c.lineWidth=2;c.stroke();break;}add(c);c.globalAlpha=.6*(1-k);c.fillStyle=f.col;c.beginPath();c.moveTo(f.x,f.y);c.arc(f.x,f.y,f.r,f.ang-f.arc/2,f.ang+f.arc/2);c.closePath();c.fill();c.globalAlpha=1-k;c.strokeStyle='#ffffff';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,f.r*(.8+k*.2),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();break;
      case 'cone':add(c);c.globalAlpha=.45*(1-k);c.strokeStyle=f.col;c.lineWidth=10*(1-k)+2;c.beginPath();c.arc(f.x,f.y,f.r*(.2+k*.8),f.ang-f.arc/2,f.ang+f.arc/2);c.stroke();break;
      case 'bolt':add(c);c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=5;c.lineJoin='round';c.beginPath();f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();break;
      case 'lines':add(c);c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=3;for(let i=0;i<14;i++){const a=i/14*TAU+f.seed,r0=30+k*70,r1=r0+40+((i*37)%30);c.beginPath();c.moveTo(f.x+Math.cos(a)*r0,f.y+Math.sin(a)*r0);c.lineTo(f.x+Math.cos(a)*r1,f.y+Math.sin(a)*r1);c.stroke();}break;
      case 'plus':c.globalAlpha=1-k;c.fillStyle='#6be39a';c.strokeStyle=OUT;c.lineWidth=1.5;c.translate(f.x,f.y-k*30);c.fillRect(-2,-6,4,12);c.fillRect(-6,-2,12,4);break;
      case 'leaf':c.globalAlpha=1-k;c.translate(f.x,f.y);c.rotate(f.rot+k*4);c.fillStyle='#62c27a';ell(c,0,0,5,2.5);c.fill();break;
      case 'vine':{const g=Math.min(1,f.t*6),fade=k>.75?(1-k)*4:1;c.globalAlpha=fade;c.translate(f.x,f.y);c.rotate(f.rot);c.strokeStyle='#3c8a2e';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(8*g,-12*g,0,-24*g);c.stroke();c.strokeStyle='#7ed957';c.lineWidth=2.5;c.stroke();break;}
      case 'star':c.globalAlpha=1-k;c.fillStyle='#ffe27a';star(c,f.x+Math.cos(f.a)*12*k,f.y-14*k,5,2.2,5);c.fill();break;
      case 'snow':c.globalAlpha=1-k;c.fillStyle='#ffffff';ell(c,f.x,f.y+k*16,2,2);c.fill();break;
      case 'bubble':c.globalAlpha=1-k;c.strokeStyle=f.col;c.lineWidth=1.5;c.beginPath();c.arc(f.x,f.y-k*20,2+k*3,0,TAU);c.stroke();break;
      case 'ghost':c.globalAlpha=.55*(1-k);drawFighter(c,f.x+Math.sin(f.t*6)*6,f.y-k*70,f.b.rad*.9,f.b,f.sk,Math.PI/2,0,{still:true,noShadow:true,flat:true,ko:true,tint:'rgba(255,255,255,.5)'});break;
      case 'beam':add(c);c.globalAlpha=1-k;const g2=c.createLinearGradient(f.x,f.y-260,f.x,f.y);g2.addColorStop(0,'rgba(255,255,255,0)');g2.addColorStop(1,f.col);c.fillStyle=g2;c.fillRect(f.x-18*(1-k*.5),f.y-260,36*(1-k*.5),260);break;
      case 'fallstar':{add(c);const yy=f.y-(1-k)*80;c.globalAlpha=1-k*.4;c.strokeStyle=f.col;c.lineWidth=2.5;c.beginPath();c.moveTo(f.x-10*(1-k)-6,yy-30);c.lineTo(f.x,yy);c.stroke();glow(c,f.x,yy,11,f.col,1);if(k>.85)glow(c,f.x,f.y,18,'#ffffff',(1-k)*6);break;}
      case 'mark':c.globalAlpha=1-k;c.strokeStyle='#ff2b3a';c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,20+k*50,0,TAU);c.stroke();break;
    }
    c.restore();}
}
function drawTexts(c,z){
  c.save();c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  for(const t of M.texts){const k=t.t/t.T,pop=k<.15?1+(.15-k)*4:1;c.globalAlpha=1-k*k;c.font='900 '+(t.size*pop/z)+'px Rubik, system-ui, sans-serif';c.lineWidth=4/z;c.strokeStyle='rgba(10,8,25,.9)';if(WA){c.save();upr(c,t.x,t.y);}c.strokeText(t.txt,t.x,t.y);c.fillStyle=t.col;c.fillText(t.txt,t.x,t.y);if(WA)c.restore();}
  c.restore();
}
function drawEmbers(c){c.save();add(c);for(const e of M.embers){glow(c,e.x,e.y,e.s*4,'#ffb35c',.35+.25*Math.sin(M.now*3+e.ph));}c.restore();}
function layout(){return{mx:105,my:H-125,ax:W-100,ay:H-125,sx:W-185,sy:H-225,gx:W-72,gy:H-238,px:W-36,py:118};}
function drawControls(c){
  if(!P||M.state==='ended')return;
  const L=layout();c.save();
  if(touchUI&&!mouseMode){
    const mv=ctl.move,mbx=mv?mv.ox:L.mx,mby=mv?mv.oy:L.my;
    c.globalAlpha=mv?.95:.4;c.fillStyle='rgba(10,8,25,.35)';c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;c.beginPath();c.arc(mbx,mby,52,0,TAU);c.fill();c.stroke();
    let kx=mbx,ky=mby;if(mv){const dx=mv.x-mv.ox,dy=mv.y-mv.oy,l=Math.hypot(dx,dy),m=Math.min(l,52);if(l>0){kx+=dx/l*m;ky+=dy/l*m;}}
    c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(kx,ky,24,0,TAU);c.fill();
    const at=ctl.atk;c.globalAlpha=.95;c.fillStyle='rgba(255,201,60,.16)';c.strokeStyle=SUNC;c.beginPath();c.arc(L.ax,L.ay,54,0,TAU);c.fill();c.stroke();
    let ax=L.ax,ay=L.ay;if(at&&at.drag){const dx=at.x-at.sx,dy=at.y-at.sy,l=Math.hypot(dx,dy),m=Math.min(l,54);ax+=dx/l*m;ay+=dy/l*m;}
    c.fillStyle=P.ammo>=1?(P.b.atk.kind==='fist'?(P.strongFist?'#ffd23f':'#9fe8ff'):SUNC):'rgba(255,201,60,.45)';c.beginPath();c.arc(ax,ay,26,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    const blocked=P.super>=1&&P.b.sup.kind==='leap'&&!leapTarget(P),ready=P.super>=1&&!blocked,su=ctl.sup;
    if(ready){c.save();add(c);glow(c,L.sx,L.sy,60,SUNC,.4+.2*Math.sin(M.now*6));c.restore();}
    c.fillStyle=ready?'rgba(255,201,60,.95)':blocked?'rgba(150,148,165,.85)':'rgba(10,8,25,.6)';c.beginPath();c.arc(L.sx,L.sy,34,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.strokeStyle=SUNC;c.lineWidth=5;c.beginPath();c.arc(L.sx,L.sy,40,-Math.PI/2,-Math.PI/2+TAU*P.super);c.stroke();
    star(c,L.sx,L.sy,15,6.5,5);c.fillStyle=ready?OUT:'rgba(255,255,255,.45)';c.fill();
    if(su&&su.drag&&ready){const dx=su.x-su.sx,dy=su.y-su.sy,l=Math.hypot(dx,dy),m=Math.min(l,40);c.fillStyle='#fff';c.beginPath();c.arc(L.sx+dx/l*m,L.sy+dy/l*m,12,0,TAU);c.fill();}
  }
  if(P.gadget&&(touchUI&&!mouseMode)){const ok=P.gUses>0&&P.gCd<=0;c.globalAlpha=1;c.fillStyle=ok?'#4fd585':'rgba(10,8,25,.6)';c.beginPath();c.arc(L.gx,L.gy,26,0,TAU);c.fill();c.strokeStyle=OUT;c.lineWidth=3;c.stroke();
    c.fillStyle=ok?OUT:'rgba(255,255,255,.5)';c.font='900 18px Rubik, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('G',L.gx,L.gy+1);
    for(let i=0;i<3;i++){c.fillStyle=i<P.gUses?'#9ff5bf':'rgba(255,255,255,.2)';c.beginPath();c.arc(L.gx-12+i*12,L.gy+34,4,0,TAU);c.fill();}}
  c.restore();
}
function drawTrails(c){if(!M.trails||!M.trails.length)return;c.save();for(const p of M.trails){const a=Math.max(0,1-p.t/p.T);c.globalAlpha=.55*a;c.fillStyle='#0a0612';ell(c,p.x,p.y,20,14);c.fill();c.globalAlpha=.25*a;c.strokeStyle='#7b2fe0';c.lineWidth=2;ell(c,p.x,p.y,21,15);c.stroke();}c.restore();}
function render(){
  const c=ctx;c.setTransform(dpr,0,0,dpr,0,0);
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1b1546');bg.addColorStop(1,'#0b0820');c.fillStyle=bg;c.fillRect(0,0,W,H);
  if(!M)return;
  WA=curWA();const z=cam.zoom,vw=(WA?H:W)/z,vh=(WA?W:H)/z,x0=cam.x-vw/2+cam.sx,y0=cam.y-vh/2+cam.sy;
  if(WA){c.setTransform(dpr,0,0,dpr,0,0);c.translate(W/2,H/2);c.rotate(WA);c.scale(z,z);c.translate(-(x0+vw/2),-(y0+vh/2));}else c.setTransform(dpr*z,0,0,dpr*z,-x0*z*dpr,-y0*z*dpr);
  drawArena(c,x0,y0,x0+vw,y0+vh);
  drawFields(c);drawTrails(c);drawModeObjects(c);drawLobMarkers(c);drawFx(c,false);
  drawWalls(c,x0,y0,x0+vw,y0+vh);
  drawAim(c);
  const list=M.units.filter(u=>!u.dead&&!(u.team!==MYT&&u.hidden)).sort(WA?(a,b)=>a.x-b.x:(a,b)=>a.y-b.y);
  drawStructs(c);for(const u of list)drawUnit(c,u);
  for(const s of M.shots){if(WA&&s.lob&&s.style!=='meteor'){c.save();upr(c,s.x,s.y);drawShot(c,s);c.restore();}else drawShot(c,s);}
  drawFx(c,true);drawStorm(c,x0,y0,vw,vh);drawEmbers(c);
  for(const u of list)drawLabels(c,u,z);
  for(const s of M.structs)if(!s.dead&&(s.kind!=='box'||s.hp<s.maxHp)){c.save();upr(c,s.x,s.y);if(s.kind==='box')bar(c,s.x-22,s.y-32,44,5,s.hp/s.maxHp,'#7fd3ff');else bar(c,s.x-34,s.y-(s.kind==='core'?58:30),68,s.kind==='core'?9:6,s.hp/s.maxHp,s.team===MYT?BLUE:RED);c.restore();}
  drawTexts(c,z);
  c.setTransform(dpr,0,0,dpr,0,0);
  const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(5,3,18,.55)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  if(P&&!P.dead&&P.hp/P.maxHp<.35){const a=(.35-P.hp/P.maxHp)*1.6*(.7+.3*Math.sin(M.now*8));const rg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);rg.addColorStop(0,'rgba(255,0,40,0)');rg.addColorStop(1,'rgba(255,0,40,'+a+')');c.fillStyle=rg;c.fillRect(0,0,W,H);}
  drawControls(c);
}

/* ---------- Sound (synthesized, starts after the first tap) ---------- */
let AC=null,SFXU=null;const sfxLast={};
function ensureAC(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(AC.state==='suspended'){try{AC.resume();}catch(e){}}return AC;}
function audio(){if(!S.sound)return null;return ensureAC();}
/* ---------- Lobby music: an original bouncy loop, synthesized live ---------- */
const MUS={gain:null,next:0,step:0,on:false,song:null};
const mhz=n=>440*Math.pow(2,(n-69)/12),_=null;
/* Lobby tracks. Each: tempo, 8 bars of chords, a lead (written or arpeggiated) and a drum feel. */
const SONGS=[
 {id:'bounce',name:'Rooftop Bounce',bpm:118,ch:[[48,52,55],[45,48,52],[41,45,48],[43,47,50],[48,52,55],[45,48,52],[41,45,48],[43,47,50]],
  lead:[[72,_,76,_,79,_,76,_,72,_,74,_,76,_,_,_],[72,_,69,_,72,_,76,_,74,_,72,_,69,_,_,_],[69,_,72,_,77,_,76,_,74,_,72,_,74,_,76,_],[79,_,_,_,77,_,76,_,74,_,_,_,71,_,74,_],
   [76,_,79,_,84,_,79,_,76,_,79,_,81,_,79,_],[76,_,72,_,69,_,72,_,76,_,77,_,76,_,74,_],[72,_,_,77,_,_,76,_,74,_,72,_,74,_,77,_],[79,_,77,_,74,_,71,_,74,_,_,_,67,_,_,_]],
  leadWave:'triangle',kick:[0,6,8],snare:[4,12],hat:2,bass:[0,3,6,8,10,14],stab:[2,6,10,14],vol:1},
 {id:'neon',name:'Neon Night',bpm:100,ch:[[45,48,52],[41,45,48],[48,52,55],[43,47,50],[45,48,52],[41,45,48],[48,52,55],[43,47,50]],
  arp:[0,1,2,1,0,2,1,2],arpUp:24,lead:[[76,_,_,_,_,_,74,_,72,_,_,_,71,_,72,_],_,[79,_,_,_,77,_,76,_,_,_,74,_,72,_,_,_],_,[81,_,_,_,79,_,76,_,_,_,79,_,77,_,76,_],_,[72,_,74,_,76,_,79,_,_,_,77,_,76,_,74,_],[71,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]],
  leadWave:'sawtooth',leadVol:.06,kick:[0,8,10],snare:[4,12],hat:1,bass:[0,2,4,6,8,10,12,14],stab:[],vol:.9},
 {id:'sunny',name:'Sunny Skies',bpm:136,ch:[[43,47,50],[50,54,57],[40,43,47],[48,52,55],[43,47,50],[50,54,57],[40,43,47],[48,52,55]],
  lead:[[79,_,79,_,81,_,83,_,_,_,81,_,79,_,_,_],[78,_,_,_,74,_,78,_,81,_,_,_,78,_,_,_],[76,_,79,_,83,_,_,_,81,_,79,_,76,_,_,_],[72,_,76,_,79,_,81,_,79,_,76,_,74,_,_,_],
   [83,_,83,_,84,_,86,_,_,_,84,_,83,_,_,_],[81,_,78,_,74,_,78,_,81,_,83,_,81,_,_,_],[79,_,_,_,76,_,79,_,83,_,_,_,79,_,_,_],[81,_,79,_,76,_,74,_,79,_,_,_,_,_,_,_]],
  leadWave:'square',leadVol:.07,kick:[0,4,8,12],snare:[4,12],hat:2,bass:[0,4,8,12],stab:[2,6,10,14],vol:.85},
 {id:'chill',name:'Chill Breeze',bpm:84,ch:[[41,45,48,52],[40,43,47,50],[38,41,45,48],[48,52,55,59],[41,45,48,52],[40,43,47,50],[38,41,45,48],[48,52,55,59]],
  lead:[[_,_,72,_,_,_,69,_,_,_,72,_,74,_,_,_],[_,_,71,_,_,_,67,_,_,_,_,_,_,_,_,_],[_,_,69,_,72,_,_,_,74,_,72,_,_,_,69,_],[_,_,67,_,_,_,_,_,_,_,_,_,_,_,_,_],
   [_,_,76,_,_,_,72,_,_,_,74,_,76,_,_,_],[_,_,74,_,_,_,71,_,_,_,67,_,_,_,_,_],[_,_,72,_,74,_,_,_,77,_,76,_,_,_,74,_],[_,_,72,_,_,_,_,_,_,_,_,_,_,_,_,_]],
  leadWave:'sine',leadVol:.16,kick:[0,10],snare:[8],hat:4,bass:[0,10],stab:[0,8],stabWave:'triangle',stabVol:.035,stabLen:5,vol:1},
 /* Halloween: a spooky minor-key tune with a creepy organ arp */
 {id:'spooky',name:'Spooky Rooftops',bpm:112,ch:[[45,48,52],[41,45,48],[44,47,50],[45,48,52],[45,48,52],[50,53,57],[44,47,52],[45,48,51]],
  arp:[0,2,1,2,0,2,1,2],arpUp:24,
  lead:[[69,_,72,_,76,_,75,_,76,_,_,_,72,_,_,_],[77,_,76,_,72,_,_,_,69,_,_,_,_,_,_,_],[71,_,74,_,77,_,_,_,76,_,74,_,71,_,_,_],[69,_,_,_,64,_,_,_,69,_,_,_,_,_,_,_],
   [81,_,_,80,81,_,_,_,76,_,_,_,72,_,_,_],[74,_,77,_,81,_,_,_,79,_,77,_,74,_,_,_],[76,_,_,_,71,_,74,_,76,_,80,_,_,_,_,_],[81,_,_,_,_,_,_,_,69,_,_,_,_,_,_,_]],
  leadWave:'triangle',leadVol:.12,kick:[0,7,8],snare:[4,12],hat:2,bass:[0,3,6,8,11,14],stab:[],vol:.95}];
const MSONG=()=>MUS.song||SONGS[0];
function mNote(type,f,t,dur,vol){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+dur+.05);}
function mHit(t,dur,vol,freq,hp){const a=AC;if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.6,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;f.type=hp?'highpass':'bandpass';f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(MUS.gain);s.start(t);s.stop(t+dur+.02);}
function mKick(t){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.14);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(MUS.gain);o.start(t);o.stop(t+.2);}
function mStep(i,t){const so=MSONG(),st=60/so.bpm/4,bar=Math.floor(i/16)%8,s=i%16,ch=so.ch[bar];
  if(so.kick.includes(s))mKick(t);if(so.snare.includes(s))mHit(t,.14,.2,1800);if(s%so.hat===0)mHit(t,.04,s%4===2?.08:.045,7000,true);
  if(so.bass.includes(s))mNote('triangle',mhz(ch[0]-12),t,st*1.6,.26);
  if(so.stab.includes(s))for(const n of ch)mNote(so.stabWave||'square',mhz(n+12),t,st*(so.stabLen||.9),so.stabVol||.022);
  if(so.arp)mNote('square',mhz(ch[so.arp[s%so.arp.length]%ch.length]+so.arpUp),t,st*.8,.025);
  const lb=so.lead[bar];const l=lb?lb[s]:null;if(l!=null){mNote(so.leadWave,mhz(l),t,st*1.8,so.leadVol||.13);mNote('sine',mhz(l+12),t,st*1.2,.025);}}
function pickSong(shuffle){const id=S.musicTrack||(halloweenOn()?'spooky':'bounce');if(shuffle||id==='shuffle'){const l=SONGS.filter(x=>x!==MUS.song);MUS.song=l[Math.floor(Math.random()*l.length)];}else MUS.song=SONGS.find(x=>x.id===id)||SONGS[0];MUS.step=0;}
function musicTick(){if(!AC||AC.state!=='running')return;if(!MUS.song)pickSong(false);
  if(!MUS.gain){MUS.gain=AC.createGain();MUS.gain.gain.value=0;MUS.gain.connect(AC.destination);}
  const want=!!S.music&&typeof view!=='undefined'&&view!=='game'&&!document.hidden,now=AC.currentTime;
  if(want!==MUS.on){MUS.on=want;MUS.gain.gain.cancelScheduledValues(now);MUS.gain.gain.setValueAtTime(MUS.gain.gain.value,now);MUS.gain.gain.linearRampToValueAtTime(want?.16*MSONG().vol:0,now+(want?1.2:.5));if(want){MUS.next=0;if(S.musicTrack==='shuffle')pickSong(true);}else MUS.stopAt=now+.6;}
  if(!want&&now>(MUS.stopAt||0))return;
  if(!MUS.next||MUS.next<now)MUS.next=now+.06;
  while(MUS.next<now+.3){mStep(MUS.step,MUS.next);MUS.next+=60/MSONG().bpm/4;MUS.step=(MUS.step+1)%128;if(MUS.step===0&&S.musicTrack==='shuffle')pickSong(true);}}
document.addEventListener('pointerdown',()=>{if(S.music)ensureAC();});
function tone(type,f1,f2,dur,vol,delay){const a=audio();if(!a)return;const t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t0);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.03);}
let noiseBuf=null;
function noise(dur,vol,freq){const a=audio();if(!a)return;if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.6,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t0=a.currentTime;s.buffer=noiseBuf;f.type='lowpass';f.frequency.setValueAtTime(freq,t0);f.frequency.exponentialRampToValueAtTime(80,t0+dur);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t0);s.stop(t0+dur+.02);}
const NEAR=['shoot','tick','swish','flame','lob','zap','laser','splash','bass','crack'];
function sfx(n){
  if(NETS){if(M&&M.netEv&&M.netEv.length<40)M.netEv.push(['s',n,SFXU&&SFXU.id||0]);return;}
  if(!S.sound)return;const now=performance.now();if(sfxLast[n]&&now-sfxLast[n]<70)return;
  if(NEAR.includes(n)&&M&&P&&SFXU&&SFXU!==P&&dist(SFXU.x,SFXU.y,P.x,P.y)>420)return;
  sfxLast[n]=now;const me=SFXU===P;
  switch(n){
    case 'shoot':tone('square',me?620:480,220,.07,me?.05:.025);break;
    case 'tick':tone('square',900,500,.04,me?.04:.02);break;
    case 'laser':tone('sawtooth',1200,300,.12,me?.05:.025);break;
    case 'flame':noise(.12,me?.08:.04,2400);break;
    case 'swish':noise(.09,me?.07:.035,4200);break;
    case 'lob':tone('sine',300,520,.12,me?.06:.03);break;
    case 'zap':tone('sawtooth',1500,200,.1,me?.05:.025);noise(.06,.03,6000);break;
    case 'splash':noise(.2,me?.07:.035,1400);break;
    case 'bass':tone('sine',140,50,.22,me?.14:.07);break;
    case 'crack':noise(.1,.06,3000);tone('square',260,120,.06,.03);break;
    case 'boom':noise(.32,.14,900);tone('sine',120,40,.3,.12);break;
    case 'bigboom':noise(.55,.2,700);tone('sine',90,30,.5,.18);break;
    case 'super':tone('sawtooth',220,880,.25,.05);tone('sine',440,1320,.3,.05,.05);break;
    case 'ready':tone('sine',660,660,.08,.06);tone('sine',990,990,.12,.06,.08);break;
    case 'gadget':tone('triangle',500,1000,.15,.07);break;
    case 'shotgun':noise(.28,.22,2600);tone('square',160,50,.2,.1);break;
    case 'mark':tone('square',880,880,.06,.05);tone('square',660,660,.06,.05,.08);tone('square',880,880,.06,.05,.16);break;
    case 'build':noise(.12,.08,900);noise(.12,.08,900);tone('triangle',200,300,.15,.06,.1);break;
    case 'freeze':noise(.3,.06,7000);tone('sine',1400,800,.25,.03);break;
    case 'pop':tone('sine',700,200,.12,.06);break;
    case 'thud':tone('sine',180,45,.28,.13);noise(.14,.08,500);break;
    case 'ko':tone('sawtooth',400,80,.5,.08);break;
    case 'pickup':tone('sine',880,1320,.1,.06);break;
    case 'score':tone('triangle',660,990,.12,.07);tone('triangle',990,1480,.15,.07,.1);break;
    case 'pin':tone('sine',1000,1200,.07,.05);break;
    case 'go':tone('square',523,523,.1,.06);tone('square',784,784,.2,.06,.12);break;
    case 'win':[523,659,784,1047].forEach((f,i)=>tone('triangle',f,f,.25,.07,i*.12));break;
    case 'lose':[392,330,262].forEach((f,i)=>tone('triangle',f,f*.95,.3,.06,i*.16));break;
    case 'draw':tone('triangle',440,440,.3,.06);break;
    case 'click':tone('sine',800,600,.04,.04);break;
    case 'buy':tone('triangle',700,1400,.12,.07);tone('sine',1400,1400,.15,.05,.1);break;
    case 'unlock':[523,659,784,1047,1319].forEach((f,i)=>tone('triangle',f,f,.3,.07,i*.09));break;
  }
}

/* ---------- Input ---------- */
function pt(e){const r=canvas.getBoundingClientRect();if(ROT)return{x:e.clientY-r.top,y:r.right-e.clientX};return{x:e.clientX-r.left,y:e.clientY-r.top};}
function fireAtMouse(kind){
  if(!P||P.dead)return;const[wx,wy]=toWorld(mouse.x,mouse.y),a=Math.atan2(wy-P.y,wx-P.x),d=dist(P.x,P.y,wx,wy);
  kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);
}
function release(kind,o){
  if(!P||P.dead||!M)return;
  const dx=o.x-o.sx,dy=o.y-o.sy,l=Math.hypot(dx,dy);let a,d;
  if(o.drag&&l<AIM_CANCEL_R){textFx(P.x,P.y-P.rad-36,kind==='sup'?'Super cancelled':'Cancelled','#d6d3ea',12);return;}
  if(!o.drag){[a,d]=autoAim(P,kind);}
  else{const spec=kind==='atk'?P.b.atk:P.b.sup;a=Math.atan2(dy,dx)-WA;d=(spec.range||spec.radius||300)*clamp(l/70,.15,1);}
  kind==='atk'?tryAttack(P,a,d):trySuper(P,a,d);
}
canvas.addEventListener('pointerdown',e=>{
  if(!M||paused)return;audio();const p=pt(e);
  if(e.pointerType==='mouse'){mouseMode=true;mouse.x=p.x;mouse.y=p.y;mouse.has=true;if(e.button===0)fireAtMouse('atk');else if(e.button===2)fireAtMouse('sup');e.preventDefault();return;}
  touchUI=true;mouseMode=false;mouse.has=false;
  const L=layout();
  if(P&&P.gadget&&dist(p.x,p.y,L.gx,L.gy)<36){useGadget(P);e.preventDefault();return;}
  const o={id:e.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y,drag:false};
  if(!ctl.sup&&dist(p.x,p.y,L.sx,L.sy)<50)ctl.sup=o;
  else if(!ctl.atk&&p.x>W*.5)ctl.atk=o;
  else if(!ctl.move){o.ox=p.x;o.oy=p.y;ctl.move=o;}
  else return;
  try{canvas.setPointerCapture(e.pointerId);}catch(err){}
  e.preventDefault();
});
canvas.addEventListener('pointermove',e=>{
  const p=pt(e);
  if(e.pointerType==='mouse'){mouse.x=p.x;mouse.y=p.y;mouse.has=true;if(M&&!touchUI)mouseMode=true;return;}
  for(const k of['move','atk','sup']){const o=ctl[k];if(!o||o.id!==e.pointerId)continue;o.x=p.x;o.y=p.y;
    if(k==='move'){const dx=o.x-o.ox,dy=o.y-o.oy,l=Math.hypot(dx,dy);if(l>64){o.ox=o.x-dx/l*64;o.oy=o.y-dy/l*64;}}
    else if(Math.hypot(o.x-o.sx,o.y-o.sy)>14)o.drag=true;}
});
function endPointer(e,cancel){for(const k of['move','atk','sup']){const o=ctl[k];if(!o||o.id!==e.pointerId)continue;ctl[k]=null;if(!cancel&&k!=='move')release(k,o);}}
canvas.addEventListener('pointerup',e=>endPointer(e,false));
canvas.addEventListener('pointercancel',e=>endPointer(e,true));
canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')mouse.has=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
  if(view!=='game'||!M)return;const k=e.key.toLowerCase();
  if(k==='escape'||k==='p'){setPaused(!paused);return;}
  if(paused)return;
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);touchUI=false;e.preventDefault();}
  if((k==='e'||k===' ')&&!e.repeat){e.preventDefault();if(mouseMode&&mouse.has)fireAtMouse('sup');else{const[a,d]=autoAim(P,'sup');trySuper(P,a,d);}}
  if(k==='f'&&!e.repeat){const[a,d]=autoAim(P,'atk');tryAttack(P,a,d);}
  if(k==='q'&&!e.repeat)useGadget(P);
  if(/^[1-8]$/.test(k)&&!e.repeat){const l=pinList();const id=l[+k-1];if(id)sendPin(P,id);}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());

/* pins */
function pinList(){const id=P&&P.b?P.b.id:S.selected,me=S.owned[id],fp=me&&me.facePins||[];const l=PIN_FACES.map((f,k)=>fp[k]&&S.pins.includes(fp[k])&&pinAllowedFor(fp[k],id)?'b:'+fp[k]:'r:'+id+':'+f[0]);
  const slots=S.customPins||[null,null],fall=['b:gg','b:thumb'];slots.forEach((s,k)=>l.push(s&&(S.pins.includes(s)||BASIC_PINS.some(p=>p[0]===s))&&!pinPersonal(s)?'b:'+s:fall[k]));return l;}
const pinBtn=$('#pinBtn'),pinPick=$('#pinPick');
pinBtn.addEventListener('click',()=>{if(!M)return;if(!pinPick.hidden){pinPick.hidden=true;return;}pinPick.innerHTML='';
  const ids=pinList(),rows=[ids.slice(0,3),ids.slice(3)];rows.forEach((row,r)=>{const d=document.createElement('div');d.className='pp-row'+(r?' custom':'');
    for(const id of row){const b=document.createElement('button');b.className='pinopt';b.append(pinCanvas(id,44));b.setAttribute('aria-label','Send pin');b.addEventListener('click',()=>{sendPin(P,id);pinPick.hidden=true;});d.append(b);}pinPick.append(d);});
  pinPick.hidden=false;});
function sendQuickChat(i){if(!M||!P||P.dead||!QUICK_CHAT[i])return;if(NETC){netAct('qc',null,null,String(i));return;}if((P.qcCd||0)>M.now)return;P.say={txt:QUICK_CHAT[i],at:M.now};P.qcCd=M.now+2.5;sfx('pin');}

/* ---------- UI helpers ---------- */
const ICON={
 trophies:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M7 6h10v3a5 5 0 0 1-10 0z" fill="#ffc93c" stroke="#120f26" stroke-width="1.4"/><path d="M10 14h4l.6 3H9.4z" fill="#ffc93c" stroke="#120f26" stroke-width="1.2"/><rect x="8" y="17" width="8" height="2" rx="1" fill="#ffc93c" stroke="#120f26" stroke-width="1.2"/></svg>',
 gems:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 5l6 6-6 8-6-8z" fill="#5ce1a0" stroke="#120f26" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 5l2 6-2 8" fill="none" stroke="#c9ffe6" stroke-width="1"/></svg>',
 coins:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><circle cx="12" cy="12" r="6.5" fill="#ffc93c" stroke="#120f26" stroke-width="1.4"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="#e09a12" stroke-width="1.4"/></svg>',
 pp:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M13 4l-6 9h4l-1 7 6-9h-4z" fill="#c792ff" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/></svg>',
 chromos:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 4.5l6.5 3.75v7.5L12 19.5l-6.5-3.75v-7.5z" fill="#46b4ff" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 8.5l3 1.75v3.5L12 15.5l-3-1.75v-3.5z" fill="#c8ecff"/></svg>',
 rp:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M12 5l5.5 2v4.5c0 3.4-2.3 6-5.5 7.5-3.2-1.5-5.5-4.1-5.5-7.5V7z" fill="#ff5e87" stroke="#120f26" stroke-width="1.3"/></svg>',
};
ICON.pass='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><path d="M5 8h14v2.5a1.5 1.5 0 0 0 0 3V16H5v-2.5a1.5 1.5 0 0 0 0-3z" fill="#ffd36b" stroke="#120f26" stroke-width="1.3" stroke-linejoin="round"/><path d="m12 9.3.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="#120f26"/></svg>';
/* Little drop icon in its real rarity color (filled in automatically wherever it appears) */
const DI=(r,s)=>'<span class="dropmini" data-r="'+(r||'rare')+'" data-s="'+(s||22)+'"></span>';
ICON.drop='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#3b2f7a"/><ellipse cx="12" cy="12" rx="5.6" ry="7.4" fill="#b56cff" stroke="#120f26" stroke-width="1.4"/><rect x="5.6" y="10.6" width="12.8" height="2.8" rx="1.4" fill="#2a2560" stroke="#120f26" stroke-width="1.1"/><circle cx="12" cy="12" r="1.3" fill="#fff"/></svg>';
const rpc=r=>r==='ultra'?' ultra':r==='celestial'?' celestial':'';
const CUR_NAME={coins:'coins',gems:'gems',pp:'power points',chromos:'chromos',trophies:'trophies'};
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cost=(cur,n)=>'<span class="cost">'+ICON[cur]+fmtFull(n)+'</span>';
function pills(keys){return keys.map(k=>'<span class="pill" aria-label="'+CUR_NAME[k]+': '+fmtFull(S[k])+'">'+ICON[k]+'<span>'+fmt(S[k])+'</span></span>').join('');}
function toast(html,icon){const t=document.createElement('div');t.className='toast';t.innerHTML=(icon?ICON[icon]:'')+'<span>'+html+'</span>';$('#toasts').append(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320);},2400);}
function spend(cur,n){if(S[cur]<n){toast('Not enough '+CUR_NAME[cur]+' yet',cur);return false;}S[cur]-=n;persist();sfx('buy');return true;}
const ownedCount=()=>Object.keys(S.owned).length;

/* ---------- Navigation ---------- */
let view='home';
const SCREENS=['home','modes','rumblers','pass','shop','ranked','settings','game'];
function go(name){
  SCREENS.forEach(s=>{$('#'+s).hidden=s!==name;});view=name;try{applyOrient();}catch(e){}
  $('#tabbar').hidden=name==='game';
  document.querySelectorAll('.tab').forEach(t=>{if(t.dataset.tab===name||(name==='modes'&&t.dataset.tab==='home'))t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  ensureDaily();
  if(name==='home')renderHome();else if(name==='modes')renderModes();else if(name==='rumblers')renderRumblers();else if(name==='pass')renderPass(true);else if(name==='shop')renderShop();else if(name==='ranked')renderRanked();else if(name==='settings')renderSettings();
  const el=$('#'+name);if(el&&name!=='game')el.scrollTop=0;
  updateShopDot();
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{sfx('click');go(t.dataset.tab);}));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
function updateShopDot(){$('#shopDot').hidden=S.daily.claimed;$('#passDot').hidden=!passClaimable();}

/* ---------- Sheet ---------- */
const sheetEl=$('#sheet'),sheetCard=$('#sheetCard');
function openSheet(build){sheetCard.innerHTML='<div class="grab"></div>';build(sheetCard);sheetEl.hidden=false;sheetCard.scrollTop=0;}
function closeSheet(){sheetEl.hidden=true;sheetCard.innerHTML='';}
$('#sheetBg').addEventListener('click',closeSheet);
function confirmBuy(title,canvasEl,options,onDone){
  openSheet(card=>{
    const top=document.createElement('div');top.className='d-top';if(canvasEl)top.append(canvasEl);
    const info=document.createElement('div');info.className='d-info';info.innerHTML='<h2>'+esc(title)+'</h2><p class="sub">Pick how you want to pay.</p>';top.append(info);card.append(top);
    const row=document.createElement('div');row.className='row';
    for(const[cur,n]of options){const b=document.createElement('button');b.className='btn '+(cur==='gems'?'green':cur==='pp'?'pink':'primary');b.innerHTML=cost(cur,n);b.style.flex='1';if(S[cur]<n)b.disabled=true;
      b.addEventListener('click',()=>{if(spend(cur,n)){closeSheet();onDone();}});row.append(b);}
    card.append(row);
    const have=document.createElement('p');have.className='hint';have.textContent='You have '+options.map(([c])=>fmtFull(S[c])+' '+CUR_NAME[c]).join(', ')+'.';card.append(have);
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);
  });
}

/* ---------- Home ---------- */
const prev=$('#preview'),pctx=prev.getContext('2d');
function renderHome(){
  $('#meName').textContent=S.name;{const mi=$('#meIcon');if(mi){const ok=ownedIcons();if(!ok.includes(S.icon))S.icon='r:'+(S.owned.ember?'ember':Object.keys(S.owned)[0]);mi.innerHTML='';mi.append(iconCanvas(S.icon,40));}}$('#meTrophies').innerHTML=ICON.trophies+'<span>'+fmtFull(S.trophies)+'</span>';
  $('#wallet').innerHTML=pills(['coins','gems','pp','chromos']);
  const next=(S.road+1)*100,prevM=S.road*100;$('#roadFill').style.width=Math.round(clamp((S.best-prevM)/(next-prevM),0,1)*100)+'%';
  const rw=roadReward(Math.min(ROAD_MAX,S.road+1));$('#roadIco').innerHTML=ICON.trophies;$('#roadTxt').textContent=S.road>=ROAD_MAX?'Trophy road complete!':fmtFull(S.best)+' / '+next+' · '+roadLabel(rw);
  const b=BY_ID[S.selected],me=S.owned[b.id],sk=getSkin(b,me.skin),r=RARITY[b.rarity];
  $('#stage').style.setProperty('--r',r.col);
  $('#hRarity').textContent=r.name;$('#hRarity').className='rpill'+rpc(b.rarity);$('#hRarity').style.setProperty('--r',r.col);
  $('#hName').textContent=b.name;$('#hSub').textContent=sk.name+' · '+b.role;
  $('#hLvl').innerHTML='<small>LEVEL</small><b>'+me.lvl+'</b>';if(typeof renderParty==='function')renderParty();if(typeof netBadge==='function')netBadge();if(typeof netHello==='function'&&!NETC)netHello();
  const rk=$('#hRank'),ptn=prestigeTier(me.prestige);rk.textContent='★ '+ptn.name+' prestige '+me.prestige;rk.style.background=ptn.col;rk.style.color='#1b1430';
  const m=MODE_BY[S.mode];$('#modeIco').innerHTML=MODE_ICON[m.id];$('#modeIco').style.setProperty('--mc',m.col);$('#modeName').textContent=m.name;$('#modeMap').textContent=MAPS[dailyMap(m.id)].name+' · '+(modeTag(m));
  $('#playSub').textContent=modeTag(m);
  {const rot=S.matches>0&&S.mapRot!==todayKey(),mb=$('#modeBtn');mb.classList.toggle('rotated',rot);let tg=mb.querySelector('.rot-tag');if(rot&&!tg){tg=document.createElement('span');tg.className='rot-tag';tg.innerHTML='Map has rotated! <b>+40</b> pass tokens';mb.append(tg);}else if(!rot&&tg)tg.remove();}
  {const used=S.dropDay&&S.dropDay.date===todayKey()?S.dropDay.n:0,left=Math.max(0,WIN_DROPS_PER_DAY-used);
   {const plan=winDropPlan(),el=$('#dropsLeft');el.innerHTML=ICON.drop+'<span>'+(left?'<b>'+left+' of '+WIN_DROPS_PER_DAY+'</b> win drops left today':'No win drops left today · more tomorrow')+'</span><span class="wdplan"></span>';
    const wp=el.querySelector('.wdplan');plan.forEach((r,k)=>{const used=k<WIN_DROPS_PER_DAY-left,w=document.createElement('span');w.className='wd'+(used?' used':'')+(k===WIN_DROPS_PER_DAY-left?' next':'');w.title=dropName(r);w.append(dropCanvas(r,24));wp.append(w);});
    el.onclick=()=>openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Today\u2019s win drops</h2><p class="sub">Your next '+left+' win'+(left===1?'':'s')+' today give these drops, in order. Most are Rare, but some days you get lucky.</p>');const g=document.createElement('div');g.className='wdlist';
      plan.forEach((r,k)=>{const used=k<WIN_DROPS_PER_DAY-left,d=document.createElement('div');d.className='wdcell'+(used?' used':'');d.append(dropCanvas(r,56));d.insertAdjacentHTML('beforeend','<b class="'+(r==='ultra'?'rainbow-text':r==='season'?'galaxy-text':'')+'" style="color:'+RARITY[r].col+'">'+RARITY[r].name+'</b><small>Win '+(k+1)+(used?' \u00b7 earned':'')+'</small>');g.append(d);});
      card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}}
  renderTiles();
}
const GIFT_SVG='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="18" width="34" height="24" rx="4" fill="#ff5e87" stroke="#120f26" stroke-width="3"/><rect x="4" y="12" width="40" height="9" rx="3" fill="#ff8fb1" stroke="#120f26" stroke-width="3"/><rect x="21" y="12" width="6" height="30" fill="#ffd23f" stroke="#120f26" stroke-width="2"/><path d="M24 12c-4-8-13-8-11-2 1 3 7 2 11 2zm0 0c4-8 13-8 11-2-1 3-7 2-11 2z" fill="#ffd23f" stroke="#120f26" stroke-width="2.5"/></svg>';
const LOCK_SVG='<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="3" fill="#ffc93c" stroke="#120f26" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#120f26" stroke-width="2.5"/></svg>';
function renderTiles(){
  const t=$('#tiles');t.innerHTML='';
  const mk=(cls,tc,on)=>{const b=document.createElement('button');b.className='tile '+cls;b.style.setProperty('--tc',tc);b.addEventListener('click',()=>{sfx('click');on();});t.append(b);return b;};
  if(S.drops.length){const b=mk('wide drops',S.drops.some(d=>isSpecialDrop(d.r))?'#9d7bff':RARITY[DROP_RAR[S.drops.reduce((m,d)=>Math.max(m,DROP_RAR.indexOf(d.r||d.min||'rare')),0)]].col,openDrops);
    const rk=d=>d.r==='season'?9:SPOOKY.includes(d.r)?8:DROP_RAR.indexOf(d.r||d.min||'rare'),srt=S.drops.slice().sort((a,b2)=>rk(b2)-rk(a)),bestD=srt[0],br=isSpecialDrop(bestD.r)?bestD.r:DROP_RAR[Math.max(0,rk(bestD))];
    b.append(dropCanvas(br,52));const cnt={};for(const d of S.drops){const k=isSpecialDrop(d.r)?d.r:(d.r||d.min||'rare');cnt[k]=(cnt[k]||0)+1;}
    const order=['season','pumpkin','skeleton','zombie','ultra','legendary','mythic','epic','rare'].filter(k=>cnt[k]);
    b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Rumble Drops</span><b>'+S.drops.length+' ready to open</b><span class="tt dropq"></span></span>');
    const q=b.querySelector('.dropq');for(const k of order){const w=document.createElement('span');w.className='dq';w.append(dropCanvas(k,22));w.insertAdjacentHTML('beforeend','<i>'+cnt[k]+' '+RARITY[k].name+'</i>');q.append(w);}}
  if(halloweenOn()){const tk=tokensLeft(),kl=knocksLeft(),b=mk('wide hwtile','#ff8a1f',openHalloween);const into=(S.hw.wins|0)%KNOCK_EVERY;
    b.append(dropCanvas('pumpkin',52));b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Halloween \u00b7 Trick or Treat</span><b>'+(tk>0?tk+' Halloween token'+(tk>1?'s':'')+' ready!':kl>0?kl+' door knock'+(kl>1?'s':'')+' ready!':(KNOCK_EVERY-into)+' more win'+(KNOCK_EVERY-into>1?'s':'')+' for a token')+'</b><span class="tbar"><i style="width:'+(tk>0?100:into/KNOCK_EVERY*100)+'%"></i></span></span>');}
  if(!S.daily.claimed){const g=GIFTS[S.daily.gift||0],k=Object.keys(g)[0],b=mk('wide gift','#6be39a',()=>go('shop'));
    b.innerHTML='<span class="tico">'+GIFT_SVG+'</span><span style="min-width:0"><span class="tk">Free daily gift</span><b>'+g[k]+' '+CUR_NAME[k]+' waiting</b><span class="tt">Tap to claim it in the shop</span></span>';}
  {const tier=passTier(S.pass.xp),done=tier>=PASS_TIERS,into=done?(S.pass.xp-PASS_TIERS*PASS_STEP)%PASS_BONUS_STEP:S.pass.xp%PASS_STEP,ready=passClaimable(),b=mk('wide'+(ready?' passr':''),'#ffd36b',()=>go('pass'));
    b.innerHTML='<span class="tico">'+passBadge(tier,46)+'</span><span style="min-width:0"><span class="tk">Rumble Pass · Starfall</span><b>'+(ready?ready+' reward'+(ready>1?'s':'')+' to claim':done?'Pass complete':'Tier '+tier+' of '+PASS_TIERS)+'</b><span class="tbar"><i style="width:'+Math.round(into/PASS_STEP*100)+'%;background:#ffd36b"></i></span></span>';}
  const locked=RUMBLERS.filter(x=>!S.owned[x.id]&&!RARITY[x.rarity].passOnly&&!eventLocked(x)).sort((a,b)=>RARITY[a.rarity].chromos-RARITY[b.rarity].chromos);
  if(locked.length){const nb=locked[0],need=RARITY[nb.rarity].chromos,f=clamp(S.chromos/need,0,1),b=mk('',RARITY[nb.rarity].col,()=>openRumbler(nb.id));
    const cv=thumb(nb,getSkin(nb,'classic'),48);cv.classList.add('lockd');b.append(cv);
    b.insertAdjacentHTML('beforeend','<span style="min-width:0"><span class="tk">Next unlock</span><b>'+nb.name+'</b><span class="tbar"><i style="width:'+Math.round(f*100)+'%"></i></span><span class="tt">'+fmt(S.chromos)+' / '+fmt(need)+' chromos</span></span>');}
  else{const b=mk('','#ffc93c',()=>go('rumblers'));b.innerHTML='<span class="tico">'+ICON.chromos+'</span><span><span class="tk">Collection</span><b>All unlocked!</b></span>';}
  const ri=rankInfo(S.rp),lk=ownedCount()<3,b=mk('',lk?'#8f88c4':ri.col,()=>go('ranked'));
  b.innerHTML='<span class="tico">'+emblem(ri.i,46)+'</span><span style="min-width:0"><span class="tk">Ranked</span><b>'+(lk?'Locked':ri.name)+'</b>'+(lk?'<span class="tt">Own 3 rumblers ('+ownedCount()+' / 3)</span>':'<span class="tbar"><i style="width:'+(ri.need?Math.round(ri.into/ri.need*100):100)+'%;background:#ff5e87"></i></span><span class="tt">'+fmtFull(S.rp)+' RP</span>')+'</span>';
}
$('#catalogBtn').addEventListener('click',()=>openCatalog(S.selected));
$('#hRank').addEventListener('click',()=>openPrestigeTrack(S.selected));
$('#road').addEventListener('click',()=>openTrophyRoad());
$('#meTrophies').addEventListener('click',()=>openTrophyRoad());
$('#modeBtn').addEventListener('click',()=>{sfx('click');if(S.matches>0&&S.mapRot!==todayKey()){S.mapRot=todayKey();S.pass.xp+=40;persist();sfx('unlock');toast('Maps have rotated! +40 pass tokens','pass');renderHome();return;}go('modes');});
function drawPreview(t){
  const d=Math.min(2,window.devicePixelRatio||1),sz=230;
  if(prev.width!==Math.round(sz*d)){prev.width=Math.round(sz*d);prev.height=Math.round(sz*d);}
  pctx.setTransform(d,0,0,d,0,0);pctx.clearRect(0,0,sz,sz);
  const b=BY_ID[S.selected],sk=getSkin(b,S.owned[b.id].skin);
  pctx.save();pctx.globalCompositeOperation='lighter';glow(pctx,115,200,90,RARITY[b.rarity].col,.35);pctx.restore();
  pctx.save();pctx.strokeStyle='rgba(255,201,60,.6)';pctx.lineWidth=3;pctx.setLineDash([10,8]);pctx.lineDashOffset=-t*12;ell(pctx,115,200,84,20);pctx.stroke();pctx.restore();
  drawFighter(pctx,115,132,60,b,sk,REDUCED?.55:.55+Math.sin(t*.7)*.45,t,{still:REDUCED});
  pctx.save();pctx.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const a=i/7*TAU+t*.3,rr=88+Math.sin(t*1.3+i)*8,k=.5+.5*Math.sin(t*3+i*1.7);glow(pctx,115+Math.cos(a)*rr,120+Math.sin(a)*rr*.6,5+k*5,RARITY[b.rarity].col,k*.9);}pctx.restore();
}

/* ---------- Modes ---------- */
function renderModes(){
  const g=$('#modeGrid');g.innerHTML='';
  const sdm=MODES.filter(m=>m.group==='sd'),cur=sdm.find(m=>m.id===S.mode),gb=document.createElement('button');
  gb.className='mode-card'+(cur?' sel':'');gb.style.setProperty('--mc','#46d0ff');
  gb.innerHTML='<span class="mico" style="--mc:#46d0ff">'+MODE_ICON.showdown+'</span><span><b>Showdown</b><span>Break boxes for energy cubes and be the last one standing. Play solo, as a duo or as a trio.</span><em>'+(cur?cur.name+' selected · tap to switch':'Solo · Duo · Trio')+'</em></span>';
  gb.addEventListener('click',()=>{sfx('click');openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Showdown</h2><p class="sub">Pick how you want to play. All three use Storm Grove and the green storm.</p>');
    for(const m of sdm){const b=document.createElement('button');b.className='mode-card'+(S.mode===m.id?' sel':'');b.style.setProperty('--mc',m.col);
      b.innerHTML='<span class="mico" style="--mc:'+m.col+'">'+MODE_ICON[m.id]+'</span><span><b>'+m.name+'</b><span>'+m.desc+'</span><em>'+modeTag(m)+'</em></span>';
      b.addEventListener('click',()=>{S.mode=m.id;persist();sfx('click');closeSheet();go('home');});card.append(b);}
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);});});
  g.append(gb);
  for(const m of MODES){if(m.hidden||m.group)continue;const b=document.createElement('button');b.className='mode-card'+(S.mode===m.id?' sel':'');b.style.setProperty('--mc',m.col);b.setAttribute('aria-pressed',S.mode===m.id?'true':'false');
    b.innerHTML='<span class="mico" style="--mc:'+m.col+'">'+MODE_ICON[m.id]+'</span><span><b>'+m.name+'</b><span>'+m.desc+'</span><em>'+MAPS[dailyMap(m.id)].name+' · '+(modeTag(m))+(m.ranked?' · In ranked':'')+'</em></span>';
    b.addEventListener('click',()=>{S.mode=m.id;persist();sfx('click');go('home');});g.append(b);}
}

/* ---------- Rumblers ---------- */
const modeTag=m=>m.tag?m.tag:m.size>1?(m.size===2?'Duos':'Trios')+' · '+m.players+' players':m.players?'Solo · '+m.players+' players':m.ffa?'Free for all':'3 vs 3';
const RORDER=['common','rare','epic','mythic','legendary','ultra','celestial'];
function renderRumblers(){
  $('#ownCount').textContent=ownedCount()+' / '+RUMBLERS.length+' · '+fmtFull(S.chromos)+' chromos';
  const g=$('#rGrid');g.innerHTML='';g.className='';g.style.cssText='display:flex;flex-direction:column;gap:10px';
  for(const rar of RORDER){const list=RUMBLERS.filter(b=>b.rarity===rar);if(!list.length)continue;const r=RARITY[rar];
    const head=document.createElement('div');head.className='rar-head';head.innerHTML='<span class="rpill'+rpc(rar)+'" style="--r:'+r.col+'">'+r.name+'</span><span>'+list.filter(b=>S.owned[b.id]).length+' / '+list.length+' unlocked'+(r.passOnly?' · Tier 30 of the Rumble Pass':r.chromos?' · '+fmtFull(r.chromos)+' chromos each':'')+'</span>';g.append(head);
    const grid=document.createElement('div');grid.className='grid rum';
    for(const b of list){const me=S.owned[b.id],el=document.createElement('button');
      el.className='card'+(me?'':' locked')+(S.selected===b.id?' sel':'');el.style.setProperty('--r',r.col);
      el.append(thumb(b,getSkin(b,me?me.skin:'classic'),84));
      let foot;if(me)foot='<span class="tag">★ '+me.prestige+'</span>';else if(eventLocked(b))foot='<span class="tag on">\ud83c\udf83 Event</span>';else if(r.passOnly)foot='<span class="tag on">'+ICON.pass+'Tier '+PASS_TIERS+'</span>';else{const f=clamp(S.chromos/r.chromos,0,1);foot='<span class="tag'+(f>=1?' on':'')+'">'+ICON.chromos+fmt(r.chromos)+'</span><span class="cbar"><i style="width:'+Math.round(f*100)+'%"></i></span>';}
      el.insertAdjacentHTML('beforeend',(me?'<span class="lvtag">'+me.lvl+'</span>':LOCK_SVG)+'<span class="nm">'+b.name+'</span>'+foot);
      el.addEventListener('click',()=>{sfx('click');openRumbler(b.id);});grid.append(el);}
    g.append(grid);}
}
function statRows(b,lvl,mods){
  const a=b.atk,per=a.kind==='orbs'?a.dmg*2:a.kind==='spread'?a.n*a.dmg:a.kind==='burst'?a.n*a.dmg:a.double?a.dmg*2:a.dmg;const m=mulFor(lvl),nx=lvl<MAX_LVL?mulFor(lvl+1):m;
  const rows=[['Health',b.hp*m,b.hp*nx,10500],['Damage',per*m,per*nx,2100]];
  let h=rows.map(([n,v,v2,mx])=>'<div class="stat"><span>'+n+'</span><div class="track" style="position:relative"><i class="nx" style="position:absolute;inset:0 auto 0 0;width:'+Math.round(clamp(v2/mx,.06,1)*100)+'%"></i><i style="position:relative;width:'+Math.round(clamp(v/mx,.06,1)*100)+'%"></i></div><b>'+fmtFull(v)+(lvl<MAX_LVL?' <span style="color:#6be39a">+'+fmtFull(v2-v)+'</span>':'')+'</b></div>').join('');
  h+='<div class="stat"><span>Range</span><div class="track"><i style="width:'+Math.round(clamp((a.range||120)/450,.06,1)*100)+'%"></i></div><b>'+((a.range||120)/TILE).toFixed(1)+' tiles</b></div>';
  h+='<div class="stat"><span>Speed</span><div class="track"><i style="width:'+Math.round(clamp(b.speed/180,.06,1)*100)+'%"></i></div><b>'+(b.speed>=165?'Very fast':b.speed>=145?'Fast':'Normal')+'</b></div>';
  return h;
}
/* Skin catalog: every skin of every rumbler, owned or not, with a way to try each one */
let catId=null;
function skinHow(b,sk){const me=S.owned[b.id];if(me&&me.skins.includes(sk.id))return['Owned','#6be39a'];if(sk.tier===0)return['Starter look','#9aa3c7'];
  if(sk.tier==='golden')return['20,000 coins, any time','#ffd23f'];if(sk.tier==='power')return['10,000 power points, any time','#c79bff'];
  const dm=dailySkinMult(b.id,sk.id);if(dm)return[dm<1?'In the shop today · 50% off':'In the shop today','#ffd23f'];
  if(sk.tier==='pass')return['Rumble Pass','#ffd36b'];if(sk.tier==='master')return['Reach Master','#ff7aa8'];if(sk.tier==='rank'||sk.tier==='master'){const k=RANK_SETS.findIndex(x=>x.skin.id===sk.id),rs=RANK_SETS[k],mine=rankSetRumbler(k,rankSeed(S))===b.id,when=rs.key==='master'?'Reach Master':rs.idx===0?'First ranked match':'Reach '+rs.name+' I';return[mine?when+' (yours!)':'Ranked reward for other players','#c79bff'];}
  if(sk.tier==='prestige')return['Prestige '+sk.prestige,'#e7a36b'];return['Daily skins (rotates)','#8fd3ff'];}
function openCatalog(id){catId=id||catId||S.selected;const locked=(S.pendingSkins||[]).map(x=>x.split(':')).filter(([r,k])=>BY_ID[r]&&!S.owned[r]);if(catId==='__locked'&&!locked.length)catId=S.selected;
  if(catId==='__locked')return openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Locked skins</h2><p class="sub">Skins you already own for rumblers you haven\u2019t unlocked yet. Unlock the rumbler and the skin is ready to wear. You can try them now.</p>');
    const back=document.createElement('button');back.className='btn sm';back.textContent='\u2190 All skins';back.addEventListener('click',()=>openCatalog(S.selected));card.append(back);const g=document.createElement('div');g.className='catgrid';
    for(const[rid,skid]of locked){const b=BY_ID[rid],sk=getSkin(b,skid),r=RARITY[b.rarity],need=eventLocked(b)?'Open '+DARK_DROPS+' Halloween Drops':r.passOnly?'Rumble Pass tier '+PASS_TIERS:'Unlock '+esc(b.name)+' \u00b7 '+fmtFull(r.chromos)+' chromos',d=document.createElement('div');d.className='catcell';d.append(thumb(b,sk,80));
      d.insertAdjacentHTML('beforeend','<b>'+esc(sk.name)+'</b><small>'+esc(b.name)+'</small><small style="color:#ffd23f">\ud83d\udd12 '+need+'</small>');const t=document.createElement('button');t.className='btn sm';t.textContent='Try';t.addEventListener('click',()=>startTrial(b.id,sk.id));d.append(t);g.append(d);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});
  openSheet(card=>{const b=BY_ID[catId];
  card.insertAdjacentHTML('beforeend','<h2>Skin catalog</h2><p class="sub">Every skin in the game. Try any of them in training, even for rumblers you haven\u2019t unlocked.</p>');
  const chips=document.createElement('div');chips.className='catchips';for(const x of RUMBLERS){const ch=document.createElement('button');ch.className='catchip'+(x.id===catId?' on':'');ch.append(thumb(x,getSkin(x,'classic'),34));ch.insertAdjacentHTML('beforeend','<span>'+esc(x.name)+'</span>');ch.addEventListener('click',()=>openCatalog(x.id));chips.append(ch);}
  if(locked.length){const lc=document.createElement('button');lc.className='catchip lockchip';lc.innerHTML='<span>\ud83d\udd12 Locked skins ('+locked.length+')</span>';lc.addEventListener('click',()=>openCatalog('__locked'));chips.prepend(lc);}
  card.append(chips);const g=document.createElement('div');g.className='catgrid';
  for(const sk of skinsOf(b)){const[how,col]=skinHow(b,sk),d=document.createElement('div');d.className='catcell';d.append(thumb(b,sk,80));d.insertAdjacentHTML('beforeend','<b>'+esc(sk.name)+'</b><small style="color:'+col+'">'+how+'</small>');
    const t=document.createElement('button');t.className='btn sm';t.textContent='Try';t.addEventListener('click',()=>startTrial(b.id,sk.id));d.append(t);g.append(d);}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
  setTimeout(()=>{const on=chips.querySelector('.on');if(on)chips.scrollLeft=on.offsetLeft-chips.offsetLeft-20;},0);});}
/* Trophy road: every 100 trophies up to 5,000 */
function openTrophyRoad(){openSheet(card=>{const nx=Math.min(ROAD_MAX,S.road+1),nxT=nx*100,prevT=S.road*100,pct=S.road>=ROAD_MAX?100:Math.round(clamp((S.best-prevT)/(nxT-prevT),0,1)*100),amz=Math.min(TROPHY_MAX,(Math.floor(S.best/1000)+1)*1000),ot=OPP_TIERS[oppTier(S.trophies)];
  card.classList.add('troad');
  card.insertAdjacentHTML('beforeend','<div class="tr-hero"><div class="tr-cup">'+ICON.trophies+'</div><div class="tr-main"><span class="of-kick">Trophy road</span><b class="tr-num">'+fmtFull(S.trophies)+'</b><small>Best '+fmtFull(S.best)+' \u00b7 road goes to '+fmtFull(TROPHY_MAX)+'</small></div></div>'+
    '<div class="tr-next"><span>'+(S.road>=ROAD_MAX?'Road complete!':'Next reward at <b>'+fmtFull(nxT)+'</b>')+'</span><span class="tr-bar"><i style="width:'+pct+'%"></i></span></div>'+
    '<div class="tr-chips"><span class="tr-chip amz">'+(S.best>=TROPHY_MAX?'Every Amazing Drop claimed':'Amazing Drop at <b>'+fmtFull(amz)+'</b>')+'</span><span class="tr-chip" style="--oc:'+ot.col+'">Opponents: <b>'+ot.name+'</b></span>'+(S.trophies>=HELL_AT?'<span class="tr-chip hell">Hell mode</span>':'<span class="tr-chip">Hell mode from '+fmtFull(HELL_AT)+'</span>')+'</div>');
  const tr=document.createElement('div');tr.className='prtrack';
  for(let n=1;n<=ROAD_MAX;n++){const rw=roadReward(n),got=S.road>=n,next=n===S.road+1,row=document.createElement('div');row.className='pt-row'+(got?' got':next?' next':'')+(n%10===0?' big':'');row.style.setProperty('--pc',rw.drop?RARITY[rw.drop].col:'#ffd23f');
    row.insertAdjacentHTML('beforeend','<div class="pt-num"><b>'+fmtFull(n*100)+'</b><small>'+(got?'Claimed':next?(n*100-S.best)+' to go':'')+'</small></div>');const mid=document.createElement('div');mid.className='pt-items';
    if(rw.drop)mid.append(dropCanvas(rw.drop,54));let h='<ul class="pt-list">';if(rw.drop)h+='<li>'+(rw.n>1?rw.n+'\u00d7 ':'')+RARITY[rw.drop].name+' Drop</li>';for(const k of['coins','chromos','gems','pp'])if(rw[k])h+='<li>'+ICON[k]+fmtFull(rw[k])+'</li>';mid.insertAdjacentHTML('beforeend',h+'</ul>');row.append(mid);tr.append(row);}
  card.append(tr);card.insertAdjacentHTML('beforeend','<p class="pr-hint">Swipe sideways to see every reward \u2192</p>');const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
  const nxEl=tr.querySelector('.pt-row.next')||tr.lastChild;setTimeout(()=>{tr.scrollLeft=Math.max(0,nxEl.offsetLeft-tr.offsetLeft-20);},0);});}
/* Pin catalog: tap a category tab to see its pins */
let pinCatTab='new';
function openPinCatalog(back){openSheet(card=>{const ids=l=>l.map(p=>p[0]);
  const CATS=[['secret','Secret','Hidden pins. Can you find them?',S.pins.includes('secretking')?ids(SECRET_PINS):[]],['halloween','Halloween','Knock on doors and open Halloween drops',ids(HALLOWEEN_PINS)],['new','New','150 brand new pins from the daily shop',ids(GEN_PINS)],['free','Free','Everyone has these',ids(BASIC_PINS)],['random','Random','Random pins from the daily shop',ids(PREMIUM_PINS.concat(DAILY_ONLY_PINS))],['friendly','Friendly','Nice things to say, from the daily shop',ids(FRIENDLY_PINS)],['toxic','Toxic & troll','Daily pins shop',ids(TOXIC_PINS.concat(TROLL_PINS))],
    ['starfall','Starfall','Rumble Pass and Starfall Drops',ids(PASS_PINS.concat(SEASON_PINS))],['ranked','Ranked','Reach each rank',ids(RANK_PINS)],['sets','Skin sets','Come with special skins',ids(SET_PINS)],['yours','Skin & prestige','Yours, from skins and prestige',S.pins.filter(x=>/^(sk|pr):/.test(x))]];
  if(!CATS.some(c=>c[0]===pinCatTab))pinCatTab='random';
  card.insertAdjacentHTML('beforeend','<h2>Pin catalog</h2><p class="sub">Tap a category to see its pins. Owned pins have a green tick.</p>');
  const tabs=document.createElement('div');tabs.className='catchips';
  for(const[id,nm,,list]of CATS){const own=list.filter(x=>S.pins.includes(x)||BASIC_PINS.some(p=>p[0]===x)).length,t=document.createElement('button');t.className='catchip pctab'+(id===pinCatTab?' on':'');t.innerHTML='<span>'+nm+'</span><small>'+own+' / '+list.length+'</small>';
    t.addEventListener('click',()=>{pinCatTab=id;openPinCatalog(back);});tabs.append(t);}
  card.append(tabs);const cat=CATS.find(c=>c[0]===pinCatTab);
  card.insertAdjacentHTML('beforeend','<div class="sec-title"><h2>'+cat[1]+'</h2><span>'+cat[2]+'</span></div>');
  const g=document.createElement('div');g.className='pingrid';
  if(!cat[3].length)card.insertAdjacentHTML('beforeend','<p class="hint">Nothing here yet. Buy skins or prestige rumblers to get these.</p>');
  for(const id of cat[3]){const own=S.pins.includes(id)||BASIC_PINS.some(p=>p[0]===id),c=document.createElement('div');c.className='pcell'+(own?' own':'');c.append(pinCanvas('b:'+id,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(id))+'</small>'+(own?'<i class="tick">✓</i>':''));g.append(c);}
  card.append(g);if(pinCatTab==='free')card.insertAdjacentHTML('beforeend','<p class="hint">Every rumbler also has 3 free pins of its own (Happy, Angry, Sad).</p>');
  const x=document.createElement('button');x.className='btn';x.textContent=back?'Back':'Close';x.addEventListener('click',back||closeSheet);card.append(x);
  setTimeout(()=>{const on=tabs.querySelector('.on');if(on)tabs.scrollLeft=on.offsetLeft-tabs.offsetLeft-20;},0);});}
/* Pin loadout per rumbler: 3 free rumbler pins + 2 custom slots */
const CHAT_SVG='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="currentColor"/><circle cx="8.5" cy="11" r="1.5" fill="#16133a"/><circle cx="15.5" cy="11" r="1.5" fill="#16133a"/></svg>';
function openPinLoadout(id){const b=BY_ID[id],me=S.owned[id];if(!me)return;if(!Array.isArray(me.facePins))me.facePins=[null,null,null];if(!Array.isArray(S.customPins))S.customPins=[null,null];
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+'’s pins</h2><p class="sub">These 5 pins show up when you tap the chat button in a match. The first 3 are '+esc(b.name)+'’s own pins: tap one to swap in a skin or prestige pin you own for '+esc(b.name)+'. The 2 custom pins are shared by all your rumblers.</p>');
    card.insertAdjacentHTML('beforeend','<p class="lbl" style="margin:0">'+esc(b.name)+'’s pins</p>');const row=document.createElement('div');row.className='pinslots';
    PIN_FACES.forEach((f,k)=>{const cur=me.facePins[k]&&S.pins.includes(me.facePins[k])?me.facePins[k]:null,d=document.createElement('button');d.className='pslot fixed'+(cur?' swapped':'');d.append(pinCanvas(cur?'b:'+cur:'r:'+id+':'+f[0],58));d.insertAdjacentHTML('beforeend','<small>'+(cur?esc(pinName(cur)):f[1])+'</small>');d.addEventListener('click',()=>pickFacePin(id,k));row.append(d);});
    card.append(row);card.insertAdjacentHTML('beforeend','<p class="lbl" style="margin:0">Custom pins · shared by every rumbler</p>');const row2=document.createElement('div');row2.className='pinslots custom';
    S.customPins.forEach((s,k)=>{if(s&&pinPersonal(s))s=S.customPins[k]=null;const d=document.createElement('button');d.className='pslot custom';if(s)d.append(pinCanvas('b:'+s,58));else d.insertAdjacentHTML('beforeend','<span class="pplus">+</span>');d.insertAdjacentHTML('beforeend','<small>'+(s?esc(pinName(s)):'Custom '+(k+1))+'</small>');
      d.addEventListener('click',()=>pickPinFor(id,k));row2.append(d);});
    card.append(row2);const pc=document.createElement('button');pc.className='btn';pc.textContent='Pin catalog';pc.addEventListener('click',()=>openPinCatalog(()=>openPinLoadout(id)));const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));card.append(pc,x);});}
/* one of the rumbler's own slots: its normal face pin, or a skin / prestige / set pin that belongs to this rumbler */
function pickFacePin(id,k){const me=S.owned[id],b=BY_ID[id],f=PIN_FACES[k],mine=S.pins.filter(p=>pinPersonal(p)&&pinAllowedFor(p,id));
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+'’s pin '+(k+1)+'</h2><p class="sub">'+(mine.length?'Swap in a skin, prestige or set pin you own for '+esc(b.name)+'.':'You don’t have any skin pins for '+esc(b.name)+' yet. Skins come with their own pins.')+'</p>');const g=document.createElement('div');g.className='pingrid';
    const def=document.createElement('button');def.className='pcell'+(!me.facePins[k]?' on':'');def.append(pinCanvas('r:'+id+':'+f[0],52));def.insertAdjacentHTML('beforeend','<small>'+f[1]+' (normal)</small>');def.addEventListener('click',()=>{me.facePins[k]=null;persist();openPinLoadout(id);});g.append(def);
    for(const p of mine){const c=document.createElement('button');c.className='pcell'+(me.facePins[k]===p?' on':'');c.append(pinCanvas('b:'+p,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(p))+'</small>');c.addEventListener('click',()=>{const o=me.facePins.indexOf(p);if(o>=0&&o!==k)me.facePins[o]=null;me.facePins[k]=p;persist();sfx('click');openPinLoadout(id);});g.append(c);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openPinLoadout(id));card.append(x);});}
function pickPinFor(id,k){const mine=BASIC_PINS.map(p=>p[0]).concat(S.pins).filter(p=>!pinPersonal(p));if(!Array.isArray(S.customPins))S.customPins=[null,null];
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Pick custom pin '+(k+1)+'</h2><p class="sub">Custom pins are shared by all your rumblers. Skin and prestige pins go in a rumbler’s own slots instead. Get more pins from the Daily pins in the shop.</p>');const g=document.createElement('div');g.className='pingrid';
    const clear=document.createElement('button');clear.className='pcell';clear.innerHTML='<span class="pplus">×</span><small>Empty</small>';clear.addEventListener('click',()=>{S.customPins[k]=null;persist();openPinLoadout(id);});g.append(clear);
    for(const p of[...new Set(mine)]){const c=document.createElement('button');c.className='pcell'+(S.customPins[k]===p?' on':'');c.append(pinCanvas('b:'+p,52));c.insertAdjacentHTML('beforeend','<small>'+esc(pinName(p))+'</small>');c.addEventListener('click',()=>{S.customPins[k]=p;persist();sfx('click');openPinLoadout(id);});g.append(c);}
    card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openPinLoadout(id));card.append(x);});}
/* Prestige track: every reward from 0 to 250, with skins you can try */
function openPrestigeTrack(id){const b=BY_ID[id],me=S.owned[id],n=me?me.prestige:0,tn=prestigeTier(n);
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(b.name)+' prestige track</h2><p class="sub">You\u2019re at <b style="color:'+tn.col+'">'+n+' / '+PRESTIGE_MAX+'</b> ('+tn.name+'). Every win with '+esc(b.name)+' is +1 prestige. Bronze is under 150, Silver from 150, Gold at 250.</p>');
    const tr=document.createElement('div');tr.className='prtrack';
    for(const m of[50,100,150,200,250]){const rw=PRESTIGE_REWARDS[m],got=n>=m,t2=prestigeTier(m),row=document.createElement('div');row.className='pt-row'+(got?' got':n>=m-50?' next':'');row.style.setProperty('--pc',t2.col);
      const left=document.createElement('div');left.className='pt-num';left.innerHTML='<b>'+m+'</b><small>'+(got?'Claimed':n>=m-50?(m-n)+' to go':'')+'</small>';row.append(left);
      const mid=document.createElement('div');mid.className='pt-items';
      if(rw.skin){const sk=getSkin(b,rw.skin);const w=document.createElement('div');w.className='pt-skin';w.append(thumb(b,sk,64));w.insertAdjacentHTML('beforeend','<small>'+esc(sk.name)+' skin</small>');
        const tb=document.createElement('button');tb.className='btn sm';tb.textContent='Try';tb.addEventListener('click',()=>startTrial(id,rw.skin));w.append(tb);mid.append(w);}
      if(rw.pin){const w=document.createElement('div');w.className='pt-skin';w.append(pinCanvas('b:pr:'+id+':'+rw.pin,52));w.insertAdjacentHTML('beforeend','<small>'+t2.name+' pin</small>');mid.append(w);}
      mid.insertAdjacentHTML('beforeend','<ul class="pt-list"><li>'+ICON.coins+fmtFull(rw.coins)+'</li><li>'+ICON.pp+fmtFull(rw.pp)+'</li>'+rw.drops.map(d=>'<li>'+DI(d.r,18)+d.n+' '+RARITY[d.r].name+'</li>').join('')+'</ul>');
      row.append(mid);tr.append(row);}
    card.append(tr);card.insertAdjacentHTML('beforeend','<p class="pr-hint">Swipe sideways to see every reward \u2192</p>');const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);
    const nx=tr.querySelector('.pt-row.next')||tr.querySelector('.pt-row:not(.got)');if(nx)setTimeout(()=>{tr.scrollLeft=Math.max(0,nx.offsetLeft-tr.offsetLeft-20);},0);});}
function openRumbler(id){
  const b=BY_ID[id],me=S.owned[id],r=RARITY[b.rarity];
  openSheet(card=>{
    const top=document.createElement('div');top.className='d-top';top.append(thumb(b,getSkin(b,me?me.skin:'classic'),132));
    const info=document.createElement('div');info.className='d-info';
    info.innerHTML='<span class="rpill'+rpc(b.rarity)+'" style="--r:'+r.col+';align-self:flex-start">'+r.name+'</span><h2>'+b.name+'</h2><p class="sub">'+b.role+(me?' · Level '+me.lvl+' · ★ Prestige '+me.prestige:'')+'</p>';
    if(me){const pb=document.createElement('button');pb.className='btn sm chatpins';pb.innerHTML=CHAT_SVG+'<span>Pins</span>';pb.setAttribute('aria-label',b.name+' pins');pb.addEventListener('click',()=>openPinLoadout(id));info.append(pb);}
    top.append(info);card.append(top);
    if(me){const pt=prestigeTier(me.prestige),pr=document.createElement('div');pr.className='proad';
      pr.innerHTML='<div class="pr-head"><b style="color:'+pt.col+'">'+pt.name+' prestige · '+me.prestige+' / '+PRESTIGE_MAX+'</b><span>+1 every win</span></div><div class="pr-bar"><i style="width:'+(me.prestige/PRESTIGE_MAX*100)+'%"></i></div><div class="pr-steps"></div>';
      const steps=pr.querySelector('.pr-steps');for(const m of[50,100,150,200,250]){const rw=PRESTIGE_REWARDS[m],got=me.prestige>=m,d=document.createElement('div');d.className='pr-step'+(got?' got':'');
        if(rw.skin)d.append(thumb(b,getSkin(b,rw.skin),46));else d.insertAdjacentHTML('beforeend','<span class="pr-ico">'+DI(rw.drops[rw.drops.length-1].r,40)+'</span>');
        d.insertAdjacentHTML('beforeend','<b>'+m+'</b><small>'+(rw.skin?esc(getSkin(b,rw.skin).name):'Drops')+'</small>');steps.append(d);}
      pr.setAttribute('role','button');pr.tabIndex=0;pr.insertAdjacentHTML('beforeend','<small class="pr-tap">Tap to see the full prestige track</small>');pr.addEventListener('click',()=>openPrestigeTrack(id));card.append(pr);}
    const st=document.createElement('div');st.className='moves';st.innerHTML=statRows(b,me?me.lvl:1)+'<div><strong>'+b.atkName+':</strong> '+b.atkDesc+'</div><div><strong>Super · '+b.supName+':</strong> '+b.supDesc+'</div>';card.append(st);
    const tryB=document.createElement('button');tryB.className='btn';tryB.innerHTML='Try '+b.name+' <span style="font-family:var(--body);font-weight:800;font-size:12px;opacity:.8">· level '+MAX_LVL+' training</span>';
    tryB.addEventListener('click',()=>{closeSheet();startTrial(id);});
    if(!me&&r.passOnly){
      card.append(tryB);const pb=document.createElement('button');pb.className='btn gold';pb.textContent='Get at Rumble Pass tier '+PASS_TIERS;pb.addEventListener('click',()=>{closeSheet();go('pass');});card.append(pb);
      const p=document.createElement('p');p.className='hint';p.textContent='Rumble Pass Exclusive rumblers can only be earned from the Rumble Pass. '+b.name+' is the reward at the very end of the Rumble Pass track. You\u2019re on tier '+passTier(S.pass.xp)+(S.pass.premium?'.':' and still need to unlock the pass.');card.append(p);return;
    }
    if(!me&&eventLocked(b)){card.append(tryB);const hb=document.createElement('button');hb.className='btn gold';hb.textContent='Unlock in the Halloween event';hb.addEventListener('click',()=>{closeSheet();openHalloween();});card.append(hb);
      card.insertAdjacentHTML('beforeend','<p class="hint">Open '+DARK_DROPS+' Halloween Drops to get '+esc(b.name)+' for free ('+Math.min(DARK_DROPS,S.hw.opened|0)+' / '+DARK_DROPS+' so far). After the event ends you can unlock him with chromos.</p>');return;}
    if(!me){
      card.append(tryB);
      const can=S.chromos>=r.chromos,btn=document.createElement('button');btn.className='btn primary';btn.disabled=!can;btn.innerHTML='Unlock · '+cost('chromos',r.chromos);
      btn.addEventListener('click',()=>{if(!spend('chromos',r.chromos))return;grantRumbler(id);persist();sfx('unlock');toast(b.name+' unlocked!','chromos');closeSheet();renderRumblers();});
      card.append(btn);const p=document.createElement('p');p.className='hint';p.textContent=can?'You have enough chromos.':'You have '+fmtFull(S.chromos)+' of '+fmtFull(r.chromos)+' chromos. Every takedown you score earns '+CHROMOS_PER_KO+'.';card.append(p);return;
    }
    const row=document.createElement('div');row.className='row';
    const sel=document.createElement('button');sel.className='btn green';sel.style.flex='1';sel.textContent=S.selected===id?'Selected':'Use '+b.name;sel.disabled=S.selected===id;
    sel.addEventListener('click',()=>{S.selected=id;persist();sfx('click');closeSheet();go('home');});row.append(sel);
    if(me.lvl<MAX_LVL){const cpp=UP_PP[me.lvl-1],cc=UP_COIN[me.lvl-1],up=document.createElement('button');up.className='btn primary';up.style.flex='1';
      up.innerHTML='Level '+(me.lvl+1)+' · '+cost('pp',cpp)+' '+cost('coins',cc);up.disabled=S.pp<cpp||S.coins<cc;
      up.addEventListener('click',()=>{if(S.pp<cpp||S.coins<cc)return;S.pp-=cpp;S.coins-=cc;me.lvl++;persist();sfx('unlock');toast(b.name+' is now level '+me.lvl,'pp');openRumbler(id);});row.append(up);}
    card.append(row);card.append(tryB);
    if(me.lvl<MAX_LVL){const p=document.createElement('p');p.className='hint';p.textContent='You have '+fmtFull(S.pp)+' power points and '+fmtFull(S.coins)+' coins.';card.append(p);}
    const gr=GEAR[id];
    for(const[kind,list,lv,price,label]of[['g',gr.g,GADGET_LVL,GADGET_COST,'Gadgets'],['s',gr.s,STAR_LVL,STAR_COST,'Star powers']]){
      const sec=document.createElement('div');sec.className='sec-title';sec.innerHTML='<h2>'+label+'</h2><span>'+(me.lvl>=lv?(kind==='g'?'Pick one · 3 uses a match':'Pick one · always on'):'Unlocks at level '+lv)+'</span>';card.append(sec);
      for(const x of list){const owned=(kind==='g'?me.gadgets:me.stars).includes(x.id),eq=(kind==='g'?me.gadget:me.star)===x.id;
        const it=document.createElement('div');it.className='panel';it.style.padding='10px 12px';it.style.gap='6px';
        it.innerHTML='<div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-family:var(--display);font-weight:400">'+esc(x.name)+'</b>'+(eq?'<span class="tag on">Equipped</span>':owned?'<span class="tag own">Owned</span>':'')+'</div><p class="hint" style="margin:0;color:#ddd8ff">'+esc(x.desc)+'</p>';
        const bt=document.createElement('button');bt.className='btn sm '+(owned?'':'primary');
        if(owned){bt.textContent=eq?'Equipped':'Equip';bt.disabled=eq;bt.addEventListener('click',()=>{if(kind==='g')me.gadget=x.id;else me.star=x.id;persist();sfx('click');openRumbler(id);});}
        else{bt.innerHTML=me.lvl>=lv?'Buy · '+cost('coins',price):'Reach level '+lv;bt.disabled=me.lvl<lv||S.coins<price;bt.addEventListener('click',()=>{if(!spend('coins',price))return;(kind==='g'?me.gadgets:me.stars).push(x.id);if(kind==='g'&&!me.gadget)me.gadget=x.id;if(kind==='s'&&!me.star)me.star=x.id;persist();toast(x.name+' bought','coins');openRumbler(id);});}
        it.append(bt);card.append(it);}
    }
    const ss=document.createElement('div');ss.className='sec-title';ss.innerHTML='<h2>Skins</h2><span>'+me.skins.length+' / '+skinsOf(b).length+' owned</span>';card.append(ss);
    const sr=document.createElement('div');sr.className='skinrow';
    for(const sk of skinsOf(b)){const owned=me.skins.includes(sk.id);if(!owned&&(sk.tier==='rank'||sk.tier==='master')){const k=RANK_SETS.findIndex(x=>x.skin.id===sk.id);if(rankSetRumbler(k,rankSeed(S))!==id)continue;}const el=document.createElement('button');el.className='card'+(me.skin===sk.id?' sel':'')+(owned?'':' ');el.style.setProperty('--r',owned?'#3a3380':'#2a2560');
      el.append(thumb(b,sk,72));const dm=owned?null:ALWAYS_SKIN(sk)?1:dailySkinMult(id,sk.id),pr=dm?skinPrice(sk):null;
      el.insertAdjacentHTML('beforeend','<span class="nm">'+esc(sk.name)+'</span>'+(me.skin===sk.id?'<span class="tag on">On</span>':owned?'<span class="tag own">Owned</span>':(pr?'<span class="tag">'+(pr.gems!=null?ICON.gems+Math.ceil(pr.gems*dm):pr.coins!=null?ICON.coins+fmt(pr.coins):ICON.pp+fmt(pr.pp))+'</span>':!earnOnly(sk)&&sk.tier!==0?'<span class="tag" style="opacity:.75">Not in shop</span>':'<span class="tag on">'+(sk.tier==='master'?'Master':sk.tier==='rank'?'Ranked':sk.tier==='prestige'?'★'+sk.prestige:'Pass')+'</span>')));
      el.addEventListener('click',()=>{if(owned){me.skin=sk.id;persist();sfx('click');openRumbler(id);}else if(pr)buySkin(id,sk.id,dm,()=>openRumbler(id));
      else if(!earnOnly(sk)){openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2>'+esc(sk.name+' '+b.name)+'</h2><p class="sub">This skin isn\u2019t in the shop today. Skins can only be bought when they show up in Daily skins, which change every day.</p>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,sk,130));c2.append(pv);const t=document.createElement('button');t.className='btn primary';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,sk.id));const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));c2.append(t,x);});}else if(sk.tier==='prestige'){openPrestigeTrack(id);}
      else{const rk=sk.tier==='master'||sk.tier==='rank',rs=rk?RANK_SETS.find(x=>x.skin.id===sk.id):null,how=rk?(rs.idx===0?'Play a ranked match to get it.':'Reach '+(rs.key==='master'?'Master':rs.name+' I')+' in ranked to unlock it.'):'It comes from the Rumble Pass.';
        openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2>'+esc(sk.name+' '+b.name)+'</h2><p class="sub">'+how+'</p>');const pv=document.createElement('div');pv.className='d-set';pv.append(thumb(b,sk,130));c2.append(pv);
          const t=document.createElement('button');t.className='btn primary';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,sk.id));
          const g=document.createElement('button');g.className='btn';g.textContent=rk?'Go to Ranked':'Go to Rumble Pass';g.addEventListener('click',()=>{closeSheet();go(rk?'ranked':'pass');});
          const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openRumbler(id));c2.append(t,g,x);});}});sr.append(el);}
    card.append(sr);
    const close=document.createElement('button');close.className='btn';close.textContent='Close';close.addEventListener('click',closeSheet);card.append(close);
  });
}
function addTryBtn(id,skId){const card=$('#sheetCard');if(!card||$('#sheet').hidden)return;const t=document.createElement('button');t.className='btn';t.textContent='Try this skin in training';t.addEventListener('click',()=>startTrial(id,skId));card.append(t);}
function buySkin(id,skId,mult,after){
  const b=BY_ID[id],sk=getSkin(b,skId),pr=skinPrice(sk),m=mult||1;
  setTimeout(()=>addTryBtn(id,skId),0);confirmBuy(sk.name+' '+b.name,thumb(b,sk,110),['gems','coins','pp'].filter(k=>pr[k]!=null).map(k=>[k,Math.ceil(pr[k]*m)]),()=>{
    const me=S.owned[id];grantSkinPin(id,skId);if(me){if(!me.skins.includes(skId))me.skins.push(skId);me.skin=skId;}else grantSkin(id,skId);if(sk.set&&!S.pins.includes(sk.set)){S.pins.push(sk.set);toast('Set bonus: the '+sk.name+' pin is yours too','gems');}if(m<1)S.daily.bought.push(id+':'+skId);persist();sfx('unlock');toast(sk.name+' '+b.name+' is yours','gems');if(after)after();});
}

/* ---------- Settings ---------- */
function applyTheme(){const hw=S.theme==='halloween'||(!S.theme&&halloweenOn());if(document.body&&document.body.classList)document.body.classList.toggle('hw-theme',hw);else return;
  let d=document.getElementById('hwDeco');if(hw&&!d){d=document.createElement('div');d.id='hwDeco';d.setAttribute('aria-hidden','true');
    let bats='';for(let i=0;i<5;i++)bats+='<svg class="hwbat" style="--d:'+(14+i*5)+'s;--y:'+(8+i*9)+'%;--dl:-'+(i*4)+'s;--s:'+(.6+((i*37)%5)*.12)+'" viewBox="0 0 60 30"><path d="M30 12c-3-6-8-8-14-6 3 2 4 5 3 8-3-2-8-2-11 0 3 1 5 4 5 7 4-3 10-3 14 0 1-3 2-4 3-4s2 1 3 4c4-3 10-3 14 0 0-3 2-6 5-7-3-2-8-2-11 0-1-3 0-6 3-8-6-2-11 0-14 6z" fill="#120a20"/></svg>';
    let houses='<svg class="hwcity" viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 120V70h30V50l15-15 15 15v20h25V40h10V30h20v10h10v80h15V60l20-20 20 20v60h20V55h35v-15l10-12 10 12v15h20v65h25V75l18-18 18 18v45h25V45h30v75z" fill="#0f0820"/>';
    for(const[x,y]of[[40,60],[95,55],[110,75],[160,80],[225,70],[262,62],[300,90],[340,70],[370,60],[385,85]])houses+='<rect x="'+x+'" y="'+y+'" width="6" height="8" fill="#ff8a1f" opacity=".85"><animate attributeName="opacity" values=".85;.4;.85" dur="'+(2+(x%5))+'s" repeatCount="indefinite"/></rect>';
    houses+='</svg>';d.innerHTML='<div class="hwmoon"></div>'+bats+houses+'<div class="hwfog"></div>';$('#app').prepend(d);}
  if(d)d.hidden=!hw;}
function renderSettings(){renderName();{const orr=$('#orientRow');if(orr){orr.innerHTML='';for(const[id,nm]of[['auto','Auto'],['portrait','Portrait'],['landscape','Landscape']]){const b=document.createElement('button');b.className='tpill'+((S.orient||'auto')===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{S.orient=id;persist();applyOrient();renderSettings();toast(id==='auto'?'Matches follow how you hold your phone':'Matches will play in '+nm.toLowerCase());});orr.append(b);}}}{const fs=$('#findSwitch');if(fs)fs.setAttribute('aria-checked',S.findByName?'true':'false');}applyTheme();{const tr=$('#themeRow');if(tr){tr.innerHTML='';for(const[id,nm]of[['halloween','Halloween'],['default','Default']]){const b=document.createElement('button');b.className='tpill'+((S.theme||(halloweenOn()?'halloween':'default'))===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{S.theme=id;persist();renderSettings();});tr.append(b);}}}$('#invSwitch').setAttribute('aria-checked',S.invitesOn!==false?'true':'false');{const su=$('#srvUrl');if(document.activeElement!==su)su.value=S.netUrl||'';}$('#voiceSwitch').setAttribute('aria-checked',S.voice?'true':'false');{const tr=$('#trackRow');tr.innerHTML='';for(const[id,nm]of SONGS.map(x=>[x.id,x.name]).concat([['shuffle','Shuffle']])){const b=document.createElement('button');b.className='tpill'+((S.musicTrack||(halloweenOn()?'spooky':'bounce'))===id?' on':'');b.textContent=nm;b.addEventListener('click',()=>{S.musicTrack=id;persist();pickSong(false);MUS.next=0;if(!S.music){S.music=true;}ensureAC();renderSettings();});tr.append(b);}}$('#musSwitch').setAttribute('aria-checked',S.music?'true':'false');$('#sndSwitch').setAttribute('aria-checked',S.sound?'true':'false');$('#shakeSwitch').setAttribute('aria-checked',S.shake?'true':'false');}
$('#voiceSwitch').addEventListener('click',()=>{S.voice=!S.voice;persist();renderSettings();if(S.voice)speakLine('Let\u2019s rumble!',BY_ID[S.selected]);});
$('#musSwitch').addEventListener('click',()=>{S.music=!S.music;persist();renderSettings();if(S.music)ensureAC();});
$('#sndSwitch').addEventListener('click',()=>{S.sound=!S.sound;persist();renderSettings();if(S.sound)sfx('click');});
$('#shakeSwitch').addEventListener('click',()=>{S.shake=!S.shake;persist();renderSettings();});
let resetArmed=0;
$('#codeCopy').addEventListener('click',()=>{const code=saveCode(),out=$('#codeOut');out.value=code;out.focus();out.select();let ok=false;
  try{ok=document.execCommand('copy');}catch(e){}if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(()=>toast('Save code copied! Keep it somewhere safe.'),()=>{if(!ok)toast('Select the code in the box and copy it.');});else toast(ok?'Save code copied! Keep it somewhere safe.':'Select the code in the box and copy it.');});
let codeArmed=0;
function applySaveCode(raw,msgEl,btn){const r=readCode(raw);if(r.err){msgEl.textContent=r.err;msgEl.style.color='#ff8a80';return false;}
  if(btn&&!codeArmed){codeArmed=setTimeout(()=>{codeArmed=0;btn.textContent='Load save code';},4000);btn.textContent='Tap again to replace your progress';msgEl.textContent='Code looks good: '+esc(r.save.name)+', '+fmtFull(r.save.trophies)+' trophies, '+Object.keys(r.save.owned).length+' rumblers.';msgEl.style.color='';return false;}
  clearTimeout(codeArmed);codeArmed=0;S=r.save;S.onboarded=true;persist();ensureDaily();sfx('unlock');toast('Welcome back, '+esc(S.name)+'! Your progress is loaded.');if(btn)btn.textContent='Load save code';msgEl.textContent='';go('home');return true;}
$('#codeLoad').addEventListener('click',e=>applySaveCode($('#codeIn').value,$('#codeMsg'),e.currentTarget));
$('#resetBtn').addEventListener('click',e=>{const btn=e.currentTarget;
  if(!resetArmed){resetArmed=setTimeout(()=>{resetArmed=0;btn.textContent='Reset progress';},3000);btn.textContent='Tap again to reset';return;}
  clearTimeout(resetArmed);resetArmed=0;S=defaultSave();persist();btn.textContent='Reset progress';toast('Progress reset. Ember is waiting for you.');openOnboarding();renderSettings();});

/* ---------- Player name ---------- */
const nameCost=()=>60*Math.pow(2,S.nameChanges||0);
function fmtLeft(ms){const h=Math.ceil(ms/3600000);return h>=24?Math.floor(h/24)+'d '+(h%24)+'h':h+'h';}
const cleanName=x=>String(x).normalize('NFC').replace(/\s+/g,' ').trim();
/* Name filter: blocks rude words, even with l33t spelling, spaces or dots in between */
const BAD_WORDS=['sex','fuck','fuk','fck','shit','bitch','btch','cunt','dick','cock','pussy','asshole','dumbass','bastard','slut','whore','nigg','niga','fag','retard','rape','rapist','penis','vagina','porn','sexy','nude','boob','tits','nazi','hitler','twat','wank','piss','kys','killyourself','suicide','jizz','cum','dildo','anal','pedo','molest','kkk'];
const BAD_OK=['essex','sussex','wessex','middlesex','sextant','sexton','sextet','scum','cumber','cucumber','document','circum','peacock','hancock','hitchcock','dickens','analys','canal','banal','grape','drape','scrape','therapist','skyscraper','cockpit','shitake','shiitake','pisstol','spiss','cumul','accum'];
function badName(x){let t=String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
  const raw=t.replace(/[^a-z]/g,'');for(const ok of BAD_OK)t=t.split(ok).join('_');
  t=t.replace(/[0@4]/g,m=>m==='0'?'o':'a').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/8/g,'b').replace(/[^a-z_]/g,'').replace(/(.)\1{2,}/g,'$1$1');
  const t2=t.replace(/_/g,'');const tc=t.replace(/(.)\1+/g,'$1');return BAD_WORDS.some(w=>t.includes(w)||(!/(.)\1/.test(w)&&tc.includes(w))||(w.length>=4&&t2.includes(w)&&!BAD_OK.some(o=>raw.includes(o))));}
const safeName=x=>badName(x)?'Player':String(x).slice(0,20);
/* Party chat filter: blocks links, emails, phone numbers and rude words (also spelled with spaces like "b a d") */
function chatFilter(s){s=String(s||'').replace(/[\u0000-\u001f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,80);
  s=s.replace(/(https?:\/\/|www\.)\S*/gi,'***').replace(/\S+\.(com|net|org|gg|io|co|uk|ie|me|tv|app|xyz|ly|be|link)\b\S*/gi,'***').replace(/\S+@\S+/g,'***').replace(/\d[\d ().+-]{5,}\d/g,'***');
  const w=s.split(' ');for(let i=0;i<w.length;){if(w[i].length===1){let j=i,acc='';while(j<w.length&&w[j].length===1){acc+=w[j];j++;}if(acc.length>=3&&badName(acc))for(let k=i;k<j;k++)w[k]='*';i=j;}else i++;}
  return w.map(x=>x!=='*'&&x!=='***'&&badName(x)?'*'.repeat(Math.min(6,x.length)):x).join(' ');}
function checkName(a,b){a=cleanName(a);b=cleanName(b);if(a.length<3)return 'Names need at least 3 characters.';if(badName(a))return 'That name isn\u2019t allowed. Please pick a friendly one.';if(a.length>14)return 'Names can be up to 14 characters.';
  if(!/^[\p{L}\p{N} _.\-]+$/u.test(a))return 'Use letters, numbers, spaces, dots, dashes or underscores.';if(a!==b)return 'The two names don’t match. Type it exactly the same both times.';return '';}
function renderName(){const left=(S.nameLockUntil||0)-Date.now();$('#nameVal').textContent=S.name;$('#nameBtn').disabled=left>0;
  $('#nameHint').textContent=left>0?'You can change it again in '+fmtLeft(left)+'. The next change costs '+nameCost()+' gems.':'Changing your name costs '+nameCost()+' gems. After a change, you have to wait 2 days and the price doubles.';}
function nameForm(card,btnHtml,btnCls,onOk){
  /* A plain button, not a <form>: some app views block form submission, so the submit event never fires */
  const f=document.createElement('div');f.className='onb-form';
  const inp=(id,label,ph)=>'<div class="field"><label class="lbl" for="'+id+'">'+label+'</label><input class="inp" id="'+id+'" type="text" maxlength="14" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="'+(id==='nmNew'?'next':'done')+'"'+(ph?' placeholder="'+ph+'"':'')+'></div>';
  f.innerHTML=inp('nmNew','Name','3 to 14 characters')+inp('nmConf','Type it again to confirm','')+'<p class="onb-err" id="nmErr" role="alert"></p><button class="btn '+btnCls+'" type="button" id="nmGo">'+btnHtml+'</button>';
  const n1=f.querySelector('#nmNew'),n2=f.querySelector('#nmConf'),err=f.querySelector('#nmErr');
  const go=()=>{const e=checkName(n1.value,n2.value);err.textContent=e;if(!e)onOk(cleanName(n1.value));};
  f.querySelector('#nmGo').addEventListener('click',go);
  n1.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();n2.focus();}});
  n2.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
  [n1,n2].forEach(x=>x.addEventListener('input',()=>{err.textContent='';}));
  card.append(f);setTimeout(()=>{try{n1.focus();}catch(e){}},50);return f;}
$('#nameBtn').addEventListener('click',()=>{
  if((S.nameLockUntil||0)>Date.now())return;const c=nameCost();
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Change name</h2><p class="sub">Right now you’re <b>'+esc(S.name)+'</b>. This change costs '+c+' gems (you have '+fmtFull(S.gems)+'). Afterwards you can’t change it again for 2 days, and the next change costs '+(c*2)+' gems.</p>');
    nameForm(card,'Change for '+cost('gems',c),'green',nm=>{if(nm===S.name){$('#nmErr').textContent='That’s already your name.';return;}if(!spend('gems',c))return;
      S.name=nm;S.nameChanges=(S.nameChanges||0)+1;S.nameLockUntil=Date.now()+2*864e5;persist();closeSheet();toast('You’re now '+esc(nm),'gems');renderSettings();});
    const x=document.createElement('button');x.className='btn';x.textContent='Cancel';x.addEventListener('click',closeSheet);card.append(x);});
});
$('#tutBtn').addEventListener('click',()=>openOnboarding(true));

/* ---------- Halloween: tokens, the haunted estate, tricks, and Dark ---------- */
const KNOCK_TXT={skin:'gave you a skin!',drop:'gave you a Rumble Drop!',gdrop:'gave you a guaranteed drop!',hskin:'gave you a Halloween skin!',hpin:'gave you a Halloween pin!',spooky:'gave you a Halloween Drop!',coins:'gave you coins!',pp:'gave you power points!'};
function tokenSvg(s){return '<svg viewBox="0 0 40 40" width="'+s+'" height="'+s+'"><circle cx="20" cy="20" r="18" fill="#ff8a1f" stroke="#1a0b10" stroke-width="3"/><circle cx="20" cy="20" r="13" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="3 3"/><path d="M13 17l4 0-2-4zM27 17l-4 0 2-4zM12 23h16l-3 5h-10z" fill="#1a0b10"/></svg>';}
function darkSilhouette(size){const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);cv.width=cv.height=Math.round(size*d);cv.style.width=cv.style.height=size+'px';const c=cv.getContext('2d');c.scale(d,d);
  const R=size*.3,x=size/2,y=size*.46;c.fillStyle='#07040c';c.strokeStyle='#3a2a55';c.lineWidth=Math.max(1.5,R*.09);c.beginPath();c.ellipse(x,y,R*.86,R*.95,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(x-R*.86,y);c.lineTo(x+R*.86,y);c.stroke();return cv;}
function darkBoxCanvas(size){const cv=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(size*d);cv.height=Math.round(size*1.05*d);cv.style.width=size+'px';cv.style.height=(size*1.05)+'px';const c=cv.getContext('2d');c.scale(d,d);
  const W2=size,b=BY_ID.dark;c.lineJoin='round';c.strokeStyle=OUT;c.lineWidth=4;
  if(b)drawFighter(c,W2/2,W2*.34,W2*.2,b,getSkin(b,'classic'),Math.PI/2,performance.now()/1000,{still:true,noShadow:true});
  rrect(c,W2*.12,W2*.42,W2*.76,W2*.5,12);c.fillStyle='#d42a3a';c.fill();c.stroke();rrect(c,W2*.08,W2*.38,W2*.84,W2*.13,8);c.fillStyle='#ff4d5e';c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<4;i++){c.beginPath();c.arc(W2*(.22+i*.19),W2*.62,W2*.035,0,TAU);c.fill();}
  rrect(c,W2*.16,W2*.76,W2*.68,W2*.12,6);c.fillStyle='#ffd23f';c.fill();c.stroke();c.fillStyle='#2b1400';c.font='900 '+(W2*.075)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('NEW RUMBLER',W2/2,W2*.82);return cv;}
function openHalloween(){openSheet(card=>{const tk=tokensLeft(),kl=knocksLeft(),into=(S.hw.wins|0)%KNOCK_EVERY,doors=hwDoors();
  card.classList.add('hwcard');
  card.insertAdjacentHTML('beforeend','<h2 class="hw-title">Trick or Treat!</h2><div class="hw-top"><div class="hw-stat"><small>Wins</small><b>'+(S.hw.wins|0)+'</b></div><button class="hw-token'+(tk>0?' ready':'')+'" id="hwToken">'+tokenSvg(52)+'<b>'+tk+'</b><small>Halloween token'+(tk===1?'':'s')+'</small></button><div class="hw-stat"><small>Knocks</small><b>'+kl+'</b></div></div>'+
    '<div class="hw-knocks"><span class="tbar"><i style="width:'+(into/KNOCK_EVERY*100)+'%"></i></span><small>'+into+' / '+KNOCK_EVERY+' wins to the next token · tap a token to spend it on a Halloween Drop or a door knock</small></div>');
  card.querySelector('#hwToken').addEventListener('click',()=>{if(tokensLeft()<=0){toast('Win '+(KNOCK_EVERY-into)+' more to earn a token');return;}openTokenChoice();});
  const est=document.createElement('div');est.className='estate';est.innerHTML='<div class="est-moon"></div><div class="est-fog"></div>';const g=document.createElement('div');g.className='hw-doors';est.append(g);card.append(est);
  doors.forEach((id,i)=>{const b=BY_ID[id],d=document.createElement('button');d.className='house h'+(i%3)+(kl>0?' ready':'');d.disabled=kl<=0;
    d.innerHTML='<span class="roof"></span><span class="win w1"></span><span class="win w2"></span><span class="hw-door"><span class="hw-peek"></span><span class="hw-panel"><i class="hw-knob"></i></span></span><small>'+esc(b.name)+'’s house</small>';d.querySelector('.hw-peek').append(thumb(b,getSkin(b,'classic'),52));
    d.addEventListener('click',()=>{const res=knockDoor(i);if(!res)return;sfx('thud');d.classList.add('open');g.querySelectorAll('.house').forEach(x=>x.disabled=true);
      setTimeout(()=>{if(res.kind==='trick'){openTrick(b);return;}sfx('unlock');let what=KNOCK_TXT[res.kind];if(res.kind==='skin')what='gave you '+esc(getSkin(BY_ID[res.id],res.skid).name)+' '+esc(BY_ID[res.id].name)+'!';else if(res.kind==='pin')what='gave you the '+esc(pinName(res.pin))+' pin!';else if(res.kind==='gdrop')what='gave you a guaranteed '+dropName(res.r)+'!';else if(res.kind==='spooky')what='gave you a '+dropName(res.r)+'!';else if(res.kind==='coins'||res.kind==='pp')what='gave you '+fmtFull(res.n)+' '+CUR_NAME[res.kind]+'!';
        openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title">Treat!</h2>');const w=document.createElement('div');w.className='hw-reveal';w.append(thumb(b,getSkin(b,'classic'),90));
          if(res.kind==='skin'){const rb=BY_ID[res.id];w.append(thumb(rb,getSkin(rb,res.skid),110));}else if(res.kind==='pin')w.append(pinCanvas('b:'+res.pin,100));else if(res.kind==='coins'||res.kind==='pp')w.insertAdjacentHTML('beforeend','<span class="hw-cur">'+ICON[res.kind].replace('<svg','<svg width="80" height="80"')+'</span>');else w.append(dropCanvas(res.r||'rare',100));c2.append(w);
          c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center"><b>'+esc(b.name)+'</b> '+what+'</p>');hwBackBtns(c2);});},650);});
    g.append(d);});
  /* Dark: open 15 Halloween drops to unlock him for free */
  const op=Math.min(DARK_DROPS,S.hw.opened|0),own=!!S.owned.dark,db=document.createElement('div');db.className='darkbox';
  db.insertAdjacentHTML('beforeend','<span class="of-kick">New Halloween rumbler</span><h2>Dark</h2>');const bw=document.createElement('div');bw.className='db-art';bw.append(darkBoxCanvas(150));db.append(bw);
  db.insertAdjacentHTML('beforeend','<p class="db-need">'+(own?'Dark is yours!':op>=DARK_DROPS?'You opened '+DARK_DROPS+' Halloween Drops. Claim Dark!':'Open <b>'+(DARK_DROPS-op)+'</b> more Halloween Drop'+(DARK_DROPS-op===1?'':'s')+' to unlock Dark for free')+'</p><p class="db-count">'+op+' / '+DARK_DROPS+' opened</p>');
  const sl=document.createElement('div');sl.className='db-slots';for(let i=0;i<DARK_DROPS;i++){const s=document.createElement('span');s.append(i<op?dropCanvas(SPOOKY[i%3],40):darkSilhouette(40));sl.append(s);}db.append(sl);
  if(!own&&op>=DARK_DROPS){const cb=document.createElement('button');cb.className='btn gold';cb.textContent='Claim Dark';cb.addEventListener('click',()=>{if(claimDark()){sfx('unlock');toast('Dark joined your rumblers!','chromos');openHalloween();}});db.append(cb);}
  const tb=document.createElement('button');tb.className='btn';tb.textContent='See Dark’s abilities';tb.addEventListener('click',()=>openRumbler('dark'));db.append(tb);
  db.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">Dark can’t be bought with chromos until the Halloween event ends.</p>');card.append(db);
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',()=>{closeSheet();renderTiles();});card.append(x);});}
function hwBackBtns(c2){const again=document.createElement('button');again.className='btn gold';again.textContent=knocksLeft()>0?'Knock again':tokensLeft()>0?'Spend a token':'Back to the street';again.addEventListener('click',openHalloween);
  const done=document.createElement('button');done.className='btn';done.textContent='Done';done.addEventListener('click',()=>{closeSheet();renderTiles();});c2.append(again,done);}
function openTokenChoice(){openSheet(card=>{card.classList.add('hwcard');card.insertAdjacentHTML('beforeend','<h2 class="hw-title">Spend a token</h2><p class="sub" style="text-align:center">You have '+tokensLeft()+' Halloween token'+(tokensLeft()===1?'':'s')+'. Pick one reward:</p>');
  const row=document.createElement('div');row.className='hw-choice';
  const a=document.createElement('button');a.className='hw-opt';a.append(dropCanvas(pick(SPOOKY),90));a.insertAdjacentHTML('beforeend','<b>Halloween Drop</b><small>Pumpkin, Skeleton or Zombie. Counts toward Dark.</small>');
  const b=document.createElement('button');b.className='hw-opt';b.insertAdjacentHTML('beforeend','<span class="hw-mini-door"><i></i></span><b>1 Door knock</b><small>Knock on a house. Treat… or trick?</small>');
  a.addEventListener('click',()=>{const r=spendToken('drop');if(r){sfx('unlock');toast(dropName(r.r)+' added! Open it from Play','drop');openHalloween();}});
  b.addEventListener('click',()=>{const r=spendToken('knock');if(r){sfx('unlock');toast('+1 knock! Pick a house','gems');openHalloween();}});
  row.append(a,b);card.append(row);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',openHalloween);card.append(x);});}
/* Trick! Catch 6 ghosts in 8 seconds to earn another knock */
function openTrick(who){openSheet(card=>{card.classList.add('hwcard');sfx('thud');
  card.insertAdjacentHTML('beforeend','<h2 class="hw-title">TRICK!</h2><p class="sub" style="text-align:center">'+esc(who.name)+' played a trick on you! Tap <b>6 ghosts</b> in 8 seconds to win another knock.</p><div class="trick-hud"><b id="trkN">0 / 6</b><span id="trkT">8.0s</span></div>');
  const area=document.createElement('div');area.className='trick-area';card.append(area);let got=0,left=8,over=false;
  const spawn=()=>{if(over)return;const gh=document.createElement('button');gh.className='trick-ghost';gh.textContent='👻';gh.style.left=(8+Math.random()*78)+'%';gh.style.top=(8+Math.random()*70)+'%';
    gh.addEventListener('pointerdown',e=>{e.preventDefault();if(over)return;got++;sfx('pop');gh.remove();$('#trkN').textContent=got+' / 6';if(got>=6)end(true);else spawn();});area.append(gh);setTimeout(()=>{if(gh.isConnected&&!over){gh.remove();spawn();}},1100);};
  spawn();setTimeout(spawn,400);
  const iv=setInterval(()=>{left=Math.max(0,left-.1);const t=$('#trkT');if(t)t.textContent=left.toFixed(1)+'s';if(left<=0)end(false);},100);
  function end(win){if(over)return;over=true;clearInterval(iv);if(win){S.hw.knocks++;persist();sfx('unlock');}
    setTimeout(()=>openSheet(c2=>{c2.classList.add('hwcard');c2.insertAdjacentHTML('beforeend','<h2 class="hw-title">'+(win?'You beat the trick!':'Spooked!')+'</h2><p class="sub" style="text-align:center">'+(win?'You caught all 6 ghosts. +1 door knock!':'The ghosts got away this time.')+'</p>');hwBackBtns(c2);}),300);}});}

applyTheme();

/* ---------- Credits ---------- */
$('#creditsBtn').addEventListener('click',()=>{sfx('click');openSheet(card=>{card.classList.add('credits');
  const bk=document.createElement('button');bk.className='btn sm cr-back';bk.innerHTML='← Back';bk.addEventListener('click',closeSheet);card.append(bk);
  card.insertAdjacentHTML('beforeend','<div class="cr-crown"><svg viewBox="0 0 120 90" width="150" height="112"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.8s" repeatCount="indefinite"/>'+
    '<path d="M14 78 8 22l28 24 24-38 24 38 28-24-6 56z" fill="#ffd23f" stroke="#120f26" stroke-width="5" stroke-linejoin="round"/><rect x="12" y="74" width="96" height="12" rx="4" fill="#ffb000" stroke="#120f26" stroke-width="5"/>'+
    '<circle cx="60" cy="52" r="9" fill="#ff3b30" stroke="#120f26" stroke-width="3"><animate attributeName="fill" values="#ff3b30;#ff7a7a;#ff3b30" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="32" cy="60" r="5" fill="#5ec8ff" stroke="#120f26" stroke-width="2.5"/><circle cx="88" cy="60" r="5" fill="#6be39a" stroke="#120f26" stroke-width="2.5"/></g>'+
    '<path d="M100 8l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"><animate attributeName="opacity" values="1;.1;1" dur="1.1s" repeatCount="indefinite"/></path><path d="M16 4l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"><animate attributeName="opacity" values=".1;1;.1" dur="1.4s" repeatCount="indefinite"/></path></svg></div>'+
    '<p class="cr-role">In-game name</p><h2 class="cr-name">Geo</h2><p class="cr-ign">Name: <b>Lucas</b></p><p class="cr-role">Game creator · designer of every rumbler, mode and event</p>'+
    '<div class="cr-list"><p><b>Rooftop Rumble</b></p><p>Thank you for playing!</p></div>');});});

/* ---------- Profiles ---------- */
function myProfile(){const pres=Object.entries(S.owned).map(([id,v])=>[id,v.prestige|0]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return{name:S.name,icon:S.icon,code:playerCode(),trophies:S.trophies|0,best:S.best|0,coins:S.coins|0,pp:S.pp|0,wins:S.wins|0,rank:rankInfo(S.rp).name,rumblers:Object.keys(S.owned).length,pres};}
function openProfile(pr,mine){pr=pr||myProfile();openSheet(card=>{card.classList.add('profile');
  const top=document.createElement('div');top.className='pf-top';const ic=document.createElement('button');ic.className='pf-icon';ic.append(iconCanvas(pr.icon||'r:ember',92));if(mine)ic.addEventListener('click',openIconPicker);top.append(ic);
  top.insertAdjacentHTML('beforeend','<div class="pf-main"><b class="pf-name">'+esc(safeName(pr.name||'Player'))+'</b><span class="pf-code">Player code: <b>'+esc(pr.code||'------')+'</b></span>'+(mine?'<small>Tap your icon to change it</small>':'')+'</div>');card.append(top);
  card.insertAdjacentHTML('beforeend','<div class="pf-troph">'+ICON.trophies+'<b>'+fmtFull(pr.trophies|0)+'</b><small>trophies \u00b7 best '+fmtFull(pr.best|0)+'</small></div>'+
    '<div class="pf-grid"><span>'+ICON.coins+'<b>'+fmtFull(pr.coins|0)+'</b><small>coins</small></span><span>'+ICON.pp+'<b>'+fmtFull(pr.pp|0)+'</b><small>power points</small></span><span>'+ICON.rp+'<b>'+esc(pr.rank||'Bronze I')+'</b><small>rank</small></span><span>\ud83c\udfc6<b>'+fmtFull(pr.wins|0)+'</b><small>wins</small></span></div>'+
    '<h3 class="pf-h">Prestige</h3>');
  const pl=document.createElement('div');pl.className='pf-pres';for(const[id,n]of(pr.pres||[])){const b=BY_ID[id];if(!b)continue;const d=document.createElement('div');d.append(thumb(b,getSkin(b,'classic'),48));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small style="color:'+prestigeTier(n).col+'">\u2605 '+n+'</small>');pl.append(d);}card.append(pl);
  if(mine){const cp=document.createElement('button');cp.className='btn sm';cp.textContent='Copy my player code';cp.addEventListener('click',()=>{try{navigator.clipboard.writeText(playerCode());toast('Code copied: '+playerCode());}catch(e){toast('Your code: '+playerCode());}});card.append(cp);}
  const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}
function openIconPicker(){openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Profile icon</h2><p class="sub">Unlock more with rumblers, trophies (250, 500, then every 500 up to 5,000), ranked (one for each rank you reach), special skins and Rumbler Boxes.</p>');const g=document.createElement('div');g.className='icon-grid';
  const own=ownedIcons(),all=Object.keys(S.owned).map(id=>'r:'+id).concat(TROPHY_ICONS.map(n=>'t:'+n),[0,1,2,3,4,5,6,7].map(t=>'k:'+t),SPECIAL_ICONS.map(x=>'x:'+x[0]));
  for(const id of [...new Set(own.concat(all))]){const has=own.includes(id),b=document.createElement('button');b.className='icon-cell'+(S.icon===id?' on':'')+(has?'':' locked');b.append(iconCanvas(id,60));if(!has)b.insertAdjacentHTML('beforeend','<i>\ud83d\udd12</i><small>'+(id[0]==='t'?fmtFull(+id.split(':')[1])+' trophies':id[0]==='k'?'Reach '+(+id[2]>=7?'Master':TIERS[+id[2]][0]):'Rumbler Box')+'</small>');
    if(has)b.addEventListener('click',()=>{S.icon=id;persist();sfx('click');renderHome();openProfile(null,true);if(typeof netHello==='function')netHello();});g.append(b);}
  card.append(g);const x=document.createElement('button');x.className='btn';x.textContent='Back';x.addEventListener('click',()=>openProfile(null,true));card.append(x);});}
$('#meIcon').addEventListener('click',()=>{sfx('click');openProfile(null,true);});
$('#meName').addEventListener('click',()=>{sfx('click');openProfile(null,true);});
$('#findSwitch').addEventListener('click',()=>{S.findByName=!S.findByName;persist();renderSettings();if(typeof netHello==='function')netHello();toast(S.findByName?'Friends can find you by name or code':'Friends can only find you by your player code');});

/* =====================================================================
   Online multiplayer.
   The game server runs the real match (same code as here, headless) and
   streams snapshots; phones send their joystick and button presses.
   ===================================================================== */
const NET_VER=1;
const NET_SKIP=new Set(['ai','pending','ents','net','_s','seen','onLand','hit','netKey','spawn0']);
let skinIdx=null;
function skinKey(sk){if(!skinIdx){skinIdx=new Map();for(const b of RUMBLERS)for(const s of skinsOf(b))skinIdx.set(s,b.id+'|'+s.id);}return skinIdx.get(sk);}
function netPack(v,cx,depth){
  if(v===null||v===undefined)return v;const ty=typeof v;
  if(ty==='function')return undefined;
  if(ty==='number')return Number.isInteger(v)?v:(isFinite(v)?Math.round(v*100)/100:(v>0?1e9:-1e9));
  if(ty!=='object')return v;
  if(depth>7)return undefined;
  if(Array.isArray(v)){const o=new Array(v.length);for(let i=0;i<v.length;i++)o[i]=netPack(v[i],cx,depth+1);return o;}
  if(v instanceof Set||v instanceof Map)return undefined;
  if(depth>0&&cx.units.has(v))return{$u:v.id};
  if(depth>0&&cx.structs.has(v))return{$t:cx.structs.get(v)};
  if(v.id&&BY_ID[v.id]===v)return{$b:v.id};
  if(v.id&&MODE_BY[v.id]===v)return{$m:v.id};
  if(v.body&&v.tier!==undefined){const k=skinKey(v);if(k)return{$s:k};}
  const o={};for(const k in v){if(NET_SKIP.has(k))continue;const p=netPack(v[k],cx,depth+1);if(p!==undefined)o[k]=p;}return o;}
function netUnpack(v,rs){
  if(v===null||typeof v!=='object')return v;
  if(Array.isArray(v))return v.map(x=>netUnpack(x,rs));
  if(v.$u!=null)return rs.u(v.$u);if(v.$t!=null)return rs.t(v.$t);
  if(v.$b)return BY_ID[v.$b];if(v.$m)return MODE_BY[v.$m];
  if(v.$s){const i=v.$s.indexOf('|');const b=BY_ID[v.$s.slice(0,i)];return b?getSkin(b,v.$s.slice(i+1)):null;}
  const o={};for(const k in v)o[k]=netUnpack(v[k],rs);return o;}
/* which unit each human takes over, per team */
function netCandidates(){const id=M.mode.id,c=[];for(let k=0;k<M.nTeams;k++)c.push([]);
  for(const u of M.units){if(u.team>=c.length)continue;c[u.team].push(u);}
  if(c[0].includes(P)){c[0]=[P].concat(c[0].filter(u=>u!==P));}
  if(id==='duel'){c[0]=c[0].slice(0,1);c[1]=c[1].slice(0,1);}
  if(id==='boss'){c[1]=[];}
  return c;}
function netConvert(humans){const cands=netCandidates();M.netCaps=cands.map(l=>l.length);M.netMap={};
  const human=new Set();
  for(const h of humans){const list=cands[h.team];if(!list||!list.length)continue;const old=list.shift(),b=BY_ID[h.rumbler]||old.b;
    const gear=GEAR[b.id],g=gear&&gear.g.some(x=>x.id===h.gadget)&&h.lvl>=GADGET_LVL?h.gadget:null,s=gear&&gear.s.some(x=>x.id===h.star)&&h.lvl>=STAR_LVL?h.star:null;
    const nu=makeUnit(b,skinsOf(b).some(k=>k.id===h.skin)?h.skin:'classic',old.team,{player:true,name:String(h.name||'Player').slice(0,14),lvl:clamp(h.lvl|0,1,MAX_LVL),spawn:old.spawn,gadget:g,star:s});
    nu.x=old.x;nu.y=old.y;nu.net={mx:0,my:0,aiming:false};nu.netKey=h.key;M.netMap[h.key]=nu.id;human.add(nu);
    const i=M.units.indexOf(old);M.units[i]=nu;if(old===P)P=nu;}
  /* a "player" slot nobody took becomes a normal bot */
  for(let i=0;i<M.units.length;i++){const u=M.units[i];if(u.isPlayer&&!human.has(u)){const lv=randi(1,MAX_LVL),lo=botLoadout(u.b,lv);const nb=makeUnit(u.b,u.sk.id,u.team,{name:botName().slice(0,14),skill:'normal',lvl:lv,spawn:u.spawn,gadget:lo.gadget,star:lo.star});nb.x=u.x;nb.y=u.y;M.units[i]=nb;if(u===P)P=nb;}}
  if(human.size)P=[...human][0];
  M.ents=M.units.slice();M.netEv=[];M.netPlace={};}
function netToBot(u){if(!u||!u.net)return;const t=makeUnit(u.b,u.sk.id,u.team,{name:u.name,skill:'normal',lvl:u.lvl,spawn:u.spawn});u.ai=t.ai;u.isPlayer=false;u.net=null;}

/* ---------- headless side (inside the server) ---------- */
if(NETS){
  window.__rrNet={
    ver(){return NET_VER;},
    start(spec){S.trophies=clamp(spec.trophies|0,0,TROPHY_MAX);newMatch({mode:spec.mode,netHumans:spec.humans||[]});M.netId=spec.id;if(spec.time)M.time=spec.time;return{caps:M.netCaps,map:M.netMap,nTeams:M.nTeams};},
    caps(mode){newMatch({mode,netHumans:[]});const c=M.netCaps;M=null;P=null;return c;},
    input(key,inp){if(!M)return;const u=M.units.find(x=>x.id===M.netMap[key]);if(!u||!u.net)return;
      if(inp.mx!=null){let mx=+inp.mx||0,my=+inp.my||0;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}u.net.mx=mx;u.net.my=my;}
      if(inp.aim!=null&&isFinite(inp.aim))u.aim=+inp.aim;u.net.aiming=!!inp.aiming;
      if(inp.k&&!u.dead&&M.state==='play'){const a=isFinite(inp.a)?+inp.a:u.aim,d=isFinite(inp.d)?+inp.d:300;
        if(inp.k==='atk')tryAttack(u,a,d);else if(inp.k==='sup')trySuper(u,a,d);else if(inp.k==='gad')useGadget(u,isFinite(inp.a)?+inp.a:undefined);}
      if(inp.k==='qc'&&!u.dead){const i=parseInt(inp.id,10);if(QUICK_CHAT[i]&&(u.qcCd||0)<=M.now){u.say={txt:QUICK_CHAT[i],at:M.now};u.qcCd=M.now+2.5;}}
      if(inp.k==='pin'&&typeof inp.id==='string'&&/^[a-z]:[a-z_0-9:]+$/.test(inp.id))sendPin(u,inp.id);},
    leave(key){if(!M)return;const u=M.units.find(x=>x.id===M.netMap[key]);netToBot(u);},
    step(dt){if(!M)return;update(dt);
      if(M.mode.sd)for(let k=0;k<M.nTeams;k++)if(M.elim[k]&&!M.netPlace[k]){let left=0;for(let j=0;j<M.nTeams;j++)if(!M.elim[j])left++;M.netPlace[k]=left+1;}},
    state(){return M?M.state:null;},timeLeft(){return M?Math.round(M.time):0;},endT(){return M?M.endT:0;},
    snap(full){const cx={units:new Set(M.units),structs:new Map(M.structs.map((s,i)=>[s,i]))},o={};
      for(const k in M){if(k==='units'||k==='structs'||k==='fx'||k==='texts'||k==='decals'||k==='embers'||k==='ents'||k==='reward'||k==='draft'||k==='netEv'||k==='netMap'||k==='netCaps'||k==='netPlace')continue;const p=netPack(M[k],cx,1);if(p!==undefined)o[k]=p;}
      o.units=M.units.map(u=>netPack(u,cx,0));o.structs=M.structs.map(s=>netPack(s,cx,0));
      for(const k of['fx','texts','decals']){const l=[];for(const f of M[k])if(!f._s||full){f._s=1;if(l.length<120)l.push(netPack(f,cx,1));}o[k]=l;}
      o.ev=M.netEv;M.netEv=[];return o;},
    results(){const out=[];const sc=M.score,nT=M.nTeams;
      for(const u of M.units){if(!u.netKey&&!u.isPlayer)continue;const key=Object.keys(M.netMap).find(k=>M.netMap[k]===u.id);if(!key)continue;const t=u.team;let w,place=0;
        if(M.mode.sd){place=M.netPlace[t]||1;if(!M.netPlace[t]){const alive=[];for(let k=0;k<nT;k++)if(!M.netPlace[k])alive.push(k);if(alive.length>1){const tc=k=>M.units.filter(x=>x.team===k&&!x.shadow).reduce((n,x)=>n+(x.cubes||0),0);place=1+alive.filter(k=>k!==t&&tc(k)>tc(t)).length;}}
          w=place<=SD_WIN_PLACES?0:place<=Math.ceil(nT/2)?-1:1;}
        else if(M.mode.ffa){place=1+sc.filter((v,k)=>k!==t&&v>sc[t]).length;w=place===1?0:place<=3?-1:1;}
        else{const w0=M.result;w=t===0?w0:w0===0?1:w0===1?0:-1;}
        out.push({key,w,place,kills:u.kills||0,cubes:u.cubes||0,star:M.star===u});}
      return out;}
  };
}

/* ---------- client side ---------- */
const NETW={ws:null,url:'',ok:false,pid:null,retry:0,searchCb:null,queue:null,party:[],partyLeader:null,chat:[]};
let NETC=null;
const NET_CLIENT_SKIP=new Set(['units','structs','fx','texts','decals','ev','result','place','shown','endT','reward','left','star','shake','net','netId','trial','ranked']);
function netUrl(){let u=(S.netUrl||'').trim().replace(/\/+$/,'');if(!u)return'';if(/^https?:\/\//i.test(u))u=u.replace(/^http/i,'ws');else if(!/^wss?:\/\//i.test(u))u='wss://'+u;return u;}
function netSend(o){if(NETW.ws&&NETW.ws.readyState===1)NETW.ws.send(JSON.stringify(o));}
function myPid(){if(!S.pid){S.pid='p'+(S.seed>>>0).toString(36)+Math.random().toString(36).slice(2,8);persist();}return S.pid;}
function netHello(){if(!NETW.ok)return;const b=BY_ID[S.selected],me=S.owned[b.id];netSend({t:'hello',v:NET_VER,ageBand:S.ageBand||'kid',profile:myProfile(),code:playerCode(),findByName:!!S.findByName,icon:S.icon,pid:myPid(),name:safeName(S.name),rumbler:b.id,skin:me.skin,trophies:S.trophies|0,invites:S.invitesOn!==false,load:{rumbler:b.id,skin:me.skin,lvl:me.lvl,gadget:me.gadget,star:me.star,name:safeName(S.name),trophies:S.trophies|0}});}
function netConnect(){const url=netUrl();if(NETW.ws){try{NETW.ws.onclose=null;NETW.ws.close();}catch(e){}NETW.ws=null;}NETW.ok=false;netBadge();if(!url||typeof WebSocket==='undefined')return;NETW.url=url;
  let ws;try{ws=new WebSocket(url);}catch(e){return;}NETW.ws=ws;
  ws.onopen=()=>{NETW.ok=true;NETW.retry=0;netHello();netBadge();};
  ws.onclose=()=>{const was=NETW.ok;NETW.ok=false;NETW.ws=null;netBadge();if(NETC&&M&&M.state!=='ended'){toast('Lost connection to the server');netEndLocal();}if(NETW.queue)netQueueUi(null);
    if(netUrl()){NETW.retry=Math.min(30,NETW.retry+3);setTimeout(()=>{if(!NETW.ws)netConnect();},NETW.retry*1000);}};
  ws.onerror=()=>{};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}netOnMsg(m);};}
function netBadge(){const b=$('#onlineBtn');if(!b)return;const on=S.playOnline!==false;
  b.classList.toggle('on',on&&NETW.ok);b.innerHTML='<i></i>'+(!netUrl()?'Offline · no server set':!NETW.ok?(on?'Connecting…':'Offline'):on?'Online':'Offline (tap for online)');}
function netOnMsg(m){
  if(m.t==='search'&&NETW.searchCb)NETW.searchCb(m.list||[]);
  else if(m.t==='invite')netShowInvite(m);
  else if(m.t==='party'){NETW.party=(m.members||[]).filter(x=>x.pid!==S.pid);NETW.partyLeader=m.leader;S.party=NETW.party.slice(0,2).map(x=>({id:x.pid,name:safeName(x.name),rumbler:BY_ID[x.rumbler]?x.rumbler:STARTER,skin:x.skin||'classic',profile:x.profile||null}));persist();if(typeof renderParty==='function')renderParty();}
  else if(m.t==='toast')toast(esc(String(m.msg||'')));
  else if(m.t==='pchat'){const t=typeof m.txt==='string'?(S.ageBand==='teen'?chatFilter(m.txt):''):QUICK_CHAT[m.i|0];if(t)chatGot(safeName(m.name),t,m.pid,false);}
  else if(m.t==='queue')netQueueUi(m.cancel?null:m);
  else if(m.t==='start')netStartClient(m);
  else if(m.t==='snap')netApplySnap(m.s);
  else if(m.t==='end')netEndClient(m);}
/* matchmaking */
function netCanPlay(){return S.playOnline!==false&&NETW.ok;}
function netTeamCap(m){m=MODE_BY[m];if(!m)return 3;if(m.id==='duel'||m.ffa)return 1;if(m.sd)return m.size||1;return 3;}
function netQueue(modeId){if((NETW.party||[]).length+1>netTeamCap(modeId)){toast('<b style="color:#ff5d57">TOO MANY PEOPLE IN PARTY!</b>');sfx('thud');return;}const b=BY_ID[S.selected],me=S.owned[b.id];audio();sfx('click');
  netSend({t:'queue',mode:modeId,load:{rumbler:b.id,skin:me.skin,lvl:me.lvl,gadget:me.gadget,star:me.star,name:safeName(S.name),trophies:S.trophies|0}});
  netQueueUi({n:1,need:0,mode:modeId,wait:0});}
function netQueueUi(m){const mm=$('#mm');NETW.queue=m;if(!m){mm.hidden=true;return;}mm.hidden=false;
  $('#mmKicker').textContent='Online · '+(MODE_BY[m.mode]?MODE_BY[m.mode].name:'');$('#mmTitle').textContent=m.found?'Match found!':'Finding players';
  $('#mmMode').textContent=m.need?m.n+' / '+m.need+' players'+(m.left!=null?' · bots fill in after '+Math.max(0,Math.ceil(m.left))+'s':''):'Connecting to the queue…';$('#mmOpp').hidden=true;
  const slots=$('#mmSlots');slots.innerHTML='';for(let i=0;i<(m.need||1);i++){const d=document.createElement('div');d.className='mm-slot '+(i<m.n?'in blue':'wait');slots.append(d);}}
/* the match on this phone */
function netStartClient(m){NETW.queue=null;$('#mm').hidden=true;clearMM&&clearMM();lastRanked=false;lastTrial=null;
  const mode=MODE_BY[m.mode];loadMap(m.s&&m.s.mapId&&MAPS[m.s.mapId]?m.s.mapId:mode.map);MYT=m.team|0;
  M={mode,ranked:false,units:[],structs:[],ents:[],shots:[],fields:[],items:[],cubes:[],boxes:[],elim:{},fx:[],decals:[],texts:[],score:[],time:mode.time,now:0,state:'countdown',cd:3.6,tick:0,zone:'empty',endT:0,result:null,place:0,reward:null,shown:false,nTeams:2,crown:null,storm:null,shake:0,battT:2,embers:[],net:true};
  for(let i=0;i<40;i++)M.embers.push({x:rand(0,MW),y:rand(0,MH),s:rand(1,2.6),v:rand(8,26),ph:rand(0,TAU)});
  NETC={id:m.id,me:m.unit,umap:new Map(),smap:[],lastIn:0,sent:{},ended:false};P=null;
  if(m.s)netApplySnap(m.s);enterGame();}
function netApplySnap(s){if(!NETC||!M||!s)return;const C=NETC,first=!C.got;C.got=true;
  const keep=new Map();for(const pu of s.units){let u=C.umap.get(pu.id);if(!u){u={ghosts:[],pending:[],mods:{},stolen:[]};C.umap.set(pu.id,u);}keep.set(pu.id,u);}
  for(const id of[...C.umap.keys()])if(!keep.has(id))C.umap.delete(id);
  const structs=s.structs.map((ps,i)=>C.smap[i]||(C.smap[i]={}));C.smap.length=s.structs.length;
  const rs={u:id=>C.umap.get(id)||null,t:i=>structs[i]||null};
  for(const pu of s.units){const u=C.umap.get(pu.id),wasDead=u.dead,ox=u.x,oy=u.y;const d=netUnpack(pu,rs);
    for(const k in d){if(k==='ghosts'&&u.ghosts&&u!==P)continue;u[k]=d[k];}u.ghosts=u.ghosts||[];
    u.isPlayer=u.id===C.me;u.tx=d.x;u.ty=d.y;
    if(!first&&ox!=null&&!u.dead&&!wasDead){const far=Math.hypot(d.x-ox,d.y-oy)>(u.isPlayer?90:160);if(!far){u.x=ox;u.y=oy;}}
    if(u.isPlayer)P=u;if(!wasDead&&u.dead&&!first){}}
  M.units=s.units.map(pu=>C.umap.get(pu.id));
  s.structs.forEach((ps,i)=>{const d=netUnpack(ps,rs);Object.assign(structs[i],d);});M.structs=structs;
  for(const k in s){if(NET_CLIENT_SKIP.has(k)||k==='state'&&M.state==='ended')continue;M[k]=netUnpack(s[k],rs);}
  for(const k of['fx','texts','decals'])if(s[k])for(const f of s[k]){const o=netUnpack(f,rs);if(M[k].length<900)M[k].push(o);}
  if(s.ev)for(const e of s.ev){if(e[0]==='s'){const prev=SFXU;SFXU=C.umap.get(e[2])||null;try{sfx(e[1]);}catch(x){}SFXU=prev;}else if(e[0]==='k'){const a=C.umap.get(e[1])||null,b=C.umap.get(e[2]);if(b)try{onKillFeed(a,b);}catch(x){}}}
  M.ents=M.units.concat(M.structs.filter(x=>!x.dead));}
function netClientUpdate(dt){const C=NETC;if(!C||!M)return;
  if(M.state==='countdown')M.cd=Math.max(0,M.cd-dt);M.now+=dt;if(M.state==='play')M.time=Math.max(0,M.time-dt);
  for(const u of M.units){if(u.tx==null)continue;if(u===P&&!u.dead&&!u.dash&&!u.thrown&&!u.leap&&!u.kb&&u.stunT<=0&&M.state==='play'){
      const[mx0,my0]=playerMove();let mx=mx0,my=my0;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
      const sp=u.b.speed*(1+(u.mods.speed||0))*(u.boostT>0?1.4:1)*(u.slowT>0?.55:1)*(u.hasCrown?.9:1)*(u.zoneT>0?1.1:1);const ox=u.x,oy=u.y;
      if(l>.01)moveBy(u,mx*sp*dt,my*sp*dt);u.moving=l>.01;if(u.moving&&!aimingNow()&&M.now-(u.lastAttack||0)>.4)u.aim=Math.atan2(my,mx);
      const k=Math.min(1,dt*(u.moving?1.2:5));u.x+=(u.tx-u.x)*k;u.y+=(u.ty-u.y)*k;}
    else{const k=Math.min(1,dt*14);u.x+=(u.tx-u.x)*k;u.y+=(u.ty-u.y)*k;}
    u.pinT=(u.pinT||0)-dt;if(u.pinT<=0&&u.pin)u.pin=null;u.flash=Math.max(0,(u.flash||0)-dt*5);
    if(u.ghosts)for(let i=u.ghosts.length-1;i>=0;i--){u.ghosts[i].t+=dt;if(u.ghosts[i].t>.3)u.ghosts.splice(i,1);}}
  for(const s of M.shots){if(s.lob){s.t=Math.min(s.T||1,(s.t||0)+dt);}else if(s.vx!=null&&s.vy!=null){s.x+=s.vx*dt;s.y+=s.vy*dt;}}
  try{updateFx(dt);}catch(e){}
  C.lastIn-=dt;if(C.lastIn<=0&&P){C.lastIn=.05;const[mx,my]=playerMove();const o={t:'in',mx:+mx.toFixed(2),my:+my.toFixed(2),aim:+(P.aim||0).toFixed(3),aiming:!!aimingNow()};
    const key=o.mx+','+o.my+','+o.aim+','+o.aiming;if(key!==C.sentKey||C.idle>.5){C.sentKey=key;C.idle=0;netSend(o);}else C.idle=(C.idle||0)+.05;}}
function netAct(k,a,d,id){if(!NETC)return;const o={t:'in',k};if(a!=null)o.a=+(+a).toFixed(3);if(d!=null)o.d=Math.round(d);if(id)o.id=id;netSend(o);}
function netEndClient(m){if(!NETC||!M)return;const r=m.r||{};NETC.ended=true;M.state='ended';M.endT=0;M.result=r.w;M.place=r.place||0;if(P){P.kills=r.kills|0;P.cubes=r.cubes|0;}if(r.star)M.star=P;
  M.reward=applyRewards();sfx(r.w===0?'win':r.w===1?'lose':'draw');setTimeout(()=>{if(M&&NETC&&!M.shown){M.shown=true;showEnd();}},1500);}
function netEndLocal(){if(!M)return;M.state='ended';M.result=1;M.place=0;M.left=true;M.reward=applyRewards();setTimeout(()=>{if(M&&!M.shown){M.shown=true;showEnd();}},600);}
function netLeave(){if(NETC){netSend({t:'leave'});NETC=null;}MYT=0;}

/* ---------- party, search and invites over the server ---------- */
function renderParty(){if(!Array.isArray(S.party))S.party=[];{const lc=$('#lobbyChat');if(lc)lc.hidden=!(S.party.length&&NETW.ok);}for(let i=0;i<2;i++){const el=$('#party'+i);if(!el)continue;const f=S.party[i],b=f&&BY_ID[f.rumbler];el.innerHTML='';el.classList.toggle('full',!!b);
  if(b){el.style.setProperty('--r',RARITY[b.rarity].col);el.append(thumb(b,getSkin(b,f.skin||'classic'),104));el.insertAdjacentHTML('beforeend','<small>'+esc(f.name)+'</small>');}else el.textContent='+';}}
function openParty(i){const f=(S.party||[])[i];
  if(f){openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>'+esc(f.name)+'</h2><p class="sub">In your party with '+esc(BY_ID[f.rumbler].name)+'. When the party leader presses Play, you all join the same online match on the same team.</p>');
    if(f.profile){const pb=document.createElement('button');pb.className='btn gold';pb.textContent='See '+f.name+'\u2019s profile';pb.addEventListener('click',()=>openProfile(f.profile,false));card.append(pb);}
    const k=document.createElement('button');k.className='btn';k.textContent='Leave party';k.addEventListener('click',()=>{netSend({t:'leaveParty'});S.party=[];NETW.party=[];persist();closeSheet();renderParty();});card.append(k);});return;}
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Invite a friend</h2><p class="sub">Type their player code (it’s on their profile), or their name if they allow it, then tap Invite. Your code: <b>'+playerCode()+'</b>. Friends who join play in your online matches with you.</p>');
    const inp=document.createElement('input');inp.className='psearch';inp.placeholder='Player code or name…';inp.type='search';inp.autocomplete='off';card.append(inp);
    const list=document.createElement('ul');list.className='plist';card.append(list);
    const x=document.createElement('button');x.className='btn';x.textContent='Close';x.style.marginTop='10px';x.addEventListener('click',()=>{NETW.searchCb=null;closeSheet();});card.append(x);
    if(!NETW.ok){list.innerHTML='<li><span>'+(netUrl()?'Can’t reach the game server right now.':'No game server set yet. Add your server link in Settings to play online.')+'</span></li>';inp.disabled=true;return;}
    let tm=0;NETW.searchCb=res=>{list.innerHTML='';if(!res.length){list.innerHTML='<li><span>No players found. They need to be online right now.</span></li>';return;}
      for(const p of res){const b=BY_ID[p.rumbler]||BY_ID[STARTER],li=document.createElement('li');li.append(iconCanvas(p.icon||('r:'+b.id),36));
        li.insertAdjacentHTML('beforeend','<span>'+esc(safeName(p.name))+'<br><small>'+esc(b.name)+' · '+(p.trophies|0)+' trophies</small></span>');
        const bt=document.createElement('button');bt.className='btn sm '+(p.invites===false?'':'green');bt.textContent=p.invites===false?'Invites off':'Invite';bt.disabled=p.invites===false;
        bt.addEventListener('click',()=>{netSend({t:'invite',to:p.pid});bt.disabled=true;bt.textContent='Invited!';});li.append(bt);list.append(li);}};
    const go=()=>{const q=inp.value.trim();if(q.length<2){list.innerHTML='<li><span>Type at least 2 letters.</span></li>';return;}list.innerHTML='<li><span>Searching…</span></li>';netSend({t:'search',q});};
    inp.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(go,250);});setTimeout(()=>inp.focus(),50);});}
function netShowInvite(v){if(S.invitesOn===false)return;const b=BY_ID[v.rumbler]||BY_ID[STARTER];
  openSheet(card=>{card.append(thumb(b,getSkin(b,v.skin||'classic'),90));card.insertAdjacentHTML('beforeend','<h2>'+esc(safeName(v.name))+' invited you!</h2><p class="sub">Join their party? You’ll play online matches together on the same team.</p>');
    const y=document.createElement('button');y.className='btn green';y.textContent='Join';y.addEventListener('click',()=>{netSend({t:'accept',from:v.from});closeSheet();});
    const n=document.createElement('button');n.className='btn';n.textContent='No thanks';n.addEventListener('click',closeSheet);card.append(y,n);});}
for(let i=0;i<2;i++){const el=$('#party'+i);if(el)el.addEventListener('click',()=>{sfx('tap');openParty(i);});}
$('#invSwitch').addEventListener('click',()=>{S.invitesOn=S.invitesOn===false;persist();renderSettings();netHello();toast(S.invitesOn?'Invites are on':'Invites are off');});
$('#srvUrl').addEventListener('change',e=>{S.netUrl=e.target.value.trim();persist();netConnect();if(S.netUrl)toast('Connecting to your game server…');});
{const ob=$('#onlineBtn');if(ob)ob.addEventListener('click',()=>{if(!netUrl()){go('settings');toast('Paste your game server link in Settings first');return;}S.playOnline=S.playOnline===false;persist();netBadge();});}
setInterval(()=>{if(NETW.ok&&!NETC)netHello();},30000);
setTimeout(netConnect,600);

/* party lobby quick chat: the little chat button under your rumbler */
{const cb=$('#lobbyChat');if(cb)cb.addEventListener('click',()=>{sfx('click');openPartyChat();});}

/* ---------- Party chat (lobby only) ---------- */
function chatGot(name,txt,pid,me){NETW.chat.push({name,txt,me});if(NETW.chat.length>30)NETW.chat.shift();
  const i=(S.party||[]).findIndex(f=>f.id===pid),slot=me?$('#lobbyStageMe'):i>=0?$('#party'+i):null;
  if(slot){const old=slot.querySelector('.pbubble');if(old)old.remove();const bb=document.createElement('span');bb.className='pbubble';bb.textContent=txt;slot.append(bb);slot.classList.add('talking');setTimeout(()=>{bb.remove();if(!slot.querySelector('.pbubble'))slot.classList.remove('talking');},4500);}
  const log=$('#chatLog');if(log)renderChatLog(log);else if(!me)toast('<b>'+esc(name)+':</b> '+esc(txt));if(!me)sfx('pin');}
function renderChatLog(el){el.innerHTML=NETW.chat.length?NETW.chat.slice(-12).map(c=>'<p class="'+(c.me?'me':'')+'"><b>'+esc(c.me?'You':c.name)+'</b> '+esc(c.txt)+'</p>').join(''):'<p class="empty">No messages yet. Say hi!</p>';el.scrollTop=el.scrollHeight;}
function openPartyChat(){if(!canQuickChat()){toast('Party chat unlocks from age 7. You can still send pins in matches.');return;}if(!NETW.ok||!(S.party||[]).length){toast('Invite friends to your party to chat with them');return;}
  const teen=S.ageBand==='teen';
  openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Party chat</h2><p class="sub">Only people in your party see this. '+(teen?'Links, phone numbers and rude words get blocked. Friends under 15 only see quick chat.':'Typing your own messages unlocks at age 15. For now, tap a message below.')+'</p>');
    const log=document.createElement('div');log.className='chatlog';log.id='chatLog';card.append(log);renderChatLog(log);
    if(teen){const row=document.createElement('form');row.className='chatrow';row.innerHTML='<input class="chatin" maxlength="80" placeholder="Type a message…" autocomplete="off" aria-label="Message"><button class="btn primary sm" type="submit">Send</button>';
      row.addEventListener('submit',e=>{e.preventDefault();const inp=row.querySelector('input'),t=chatFilter(inp.value);if(!t.replace(/[\s*]/g,''))return;const now=Date.now();if(now-(NETW.lastChat||0)<1200){toast('Slow down a little');return;}NETW.lastChat=now;netSend({t:'pchat',txt:t});chatGot('You',t,null,true);inp.value='';});card.append(row);}
    const g=document.createElement('div');g.className='qc-grid';QUICK_CHAT.forEach((t,i)=>{const b=document.createElement('button');b.className='qcopt';b.textContent=t;b.addEventListener('click',()=>{const now=Date.now();if(now-(NETW.lastChat||0)<1200)return;NETW.lastChat=now;netSend({t:'pchat',i});chatGot('You',t,null,true);});g.append(b);});card.append(g);
    const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}

/* ---------- Shop ---------- */
const GIFTS=[{coins:100},{gems:10},{pp:60}];
const PACKS=[{id:'pp1',name:'Power pack',get:{pp:100},pay:['coins',200]},{id:'pp2',name:'Big power pack',get:{pp:350},pay:['coins',600]},{id:'c1',name:'Coin pouch',get:{coins:500},pay:['gems',40]},{id:'c2',name:'Coin chest',get:{coins:1600},pay:['gems',110]}];
let shopTab=null;
let secretTaps=0;
/* Pay gems to roll a fresh set of daily skins (including the discounted one) or daily pins (the free pin stays) */
const REROLL_GEMS={skins:25,pins:15};
function rerollBtn(kind){const b=document.createElement('button');b.className='btn sm reroll';b.innerHTML='\u21bb New '+kind+' for '+cost('gems',REROLL_GEMS[kind]);
  b.addEventListener('click',()=>{if(!spend('gems',REROLL_GEMS[kind]))return;const seed=(Math.random()*4e9)>>>0;
    if(kind==='skins')S.daily.dealSkins=dailySkinPicks(seed);else{const free=S.daily.pinShop&&S.daily.pinShop.free;const np=dailyPinPicks(seed);np.free=free;np.pins=np.pins.filter(x=>x!==free);S.daily.pinShop=np;}
    persist();sfx('buy');toast('Fresh daily '+kind+'!','gems');renderShop();});return b;}
function sectionTitle(h,s){const d=document.createElement('div');d.className='sec-title';d.innerHTML='<h2>'+h+'</h2><span>'+(s||'')+'</span>';return d;}
function renderShop(){
  ensureDaily();$('#shopWallet').innerHTML=pills(['coins','gems','pp']);
  const body=$('#shopBody');body.innerHTML='';
  if(S.daily.offer===undefined){S.daily.offer=pickOffer(S.daily.date||todayKey());persist();}
  /* new player gift */
  if(!S.welcomeGift){const sg=document.createElement('div');sg.className='panel sorry welcome';sg.append(dropCanvas('legendary',70));sg.append(dropCanvas('rbox',70));
    sg.insertAdjacentHTML('beforeend','<div style="flex:1 1 160px;min-width:0"><span class="of-kick">New player gift</span><h2>3 Legendary Drops + 1 Rumbler Box</h2><p class="hint" style="margin:0">Welcome to Rooftop Rumble! This one is on us.</p></div>');
    const b3=document.createElement('button');b3.className='btn gold';b3.textContent='Claim';sg.append(b3);
    b3.addEventListener('click',()=>{S.welcomeGift=1;for(let k=0;k<3;k++)S.drops.push({r:'legendary',min:null});S.drops.push({r:'rbox',min:null});persist();sfx('unlock');toast('Gift added! Open your drops from the Play screen','chromos');renderShop();});
    body.append(sg);}
  const of=S.daily.offer,ob=of&&BY_ID[of.id];
  if(ob){const r=RARITY[ob.rarity],pr=offerPrices(ob),owned=!!S.owned[ob.id],card=document.createElement('div');card.className='offer';card.style.setProperty('--r',r.col);
    {const th=thumb(ob,getSkin(ob,'classic'),120);th.style.cursor='pointer';th.addEventListener('click',()=>{secretTaps++;sfx('tap');th.animate&&th.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:160});
      if(secretTaps>=10&&!S.pins.includes('secretking')){S.pins.push('secretking');persist();sfx('unlock');openSheet(c2=>{c2.insertAdjacentHTML('beforeend','<h2 style="text-align:center">You found a secret!</h2>');const w=document.createElement('div');w.style.cssText='display:flex;justify-content:center;margin:8px 0';w.append(pinCanvas('b:secretking',140));c2.append(w);c2.insertAdjacentHTML('beforeend','<p class="sub" style="text-align:center">The <b>Secret King</b> pin is yours. Add it to a rumbler\u2019s pin slots.</p>');const x=document.createElement('button');x.className='btn gold';x.textContent='Nice!';x.addEventListener('click',closeSheet);c2.append(x);});}});card.append(th);}
    const info=document.createElement('div');info.className='of-info';
    info.innerHTML='<span class="of-kick">Daily rumbler offer</span><span class="of-tags"><span class="rpill'+rpc(ob.rarity)+'" style="--r:'+r.col+'">'+r.name+'</span>'+(of.bought||owned?'':'<span class="of-off">50% OFF</span>')+'</span><h2>'+esc(ob.name)+'</h2><span class="of-time">'+esc(ob.role)+'<br>New rumbler in <span class="of-cd">'+untilMidnight()+'</span></span>';
    card.append(info);
    if(of.bought||owned){card.insertAdjacentHTML('beforeend','<p class="of-done">'+(of.bought?'Bought! ':'You already own '+esc(ob.name)+'. ')+'A new rumbler arrives tomorrow.</p>');}
    else{card.insertAdjacentHTML('beforeend','<div class="of-prices">'+pr.map(([c,n])=>'<span class="of-price">'+ICON[c]+'<span>'+fmtFull(n)+(c==='chromos'?' <s>'+fmtFull(r.chromos)+'</s>':'')+'</span></span>').join('')+'</div>');
      const bt=document.createElement('div');bt.className='of-btns';
      const buy=document.createElement('button');buy.className='btn gold';buy.textContent='Get '+ob.name;
      buy.addEventListener('click',()=>confirmBuy(ob.name+' · daily offer',thumb(ob,getSkin(ob,'classic'),110),pr,()=>{grantRumbler(ob.id);S.daily.offer.bought=true;persist();sfx('unlock');toast(ob.name+' unlocked!','chromos');renderShop();}));
      const tr=document.createElement('button');tr.className='btn';tr.textContent='Try first';tr.addEventListener('click',()=>startTrial(ob.id));
      bt.append(buy,tr);card.append(bt);}
    body.append(card);}
  const gift=GIFTS[S.daily.gift||0],gk=Object.keys(gift)[0];
  const gp=document.createElement('div');gp.className='panel';gp.style.flexDirection='row';gp.style.alignItems='center';gp.style.flexWrap='wrap';
  gp.innerHTML='<div style="flex:1 1 180px;min-width:0"><h2>Daily gift</h2><p class="hint" style="margin:0">'+(S.daily.claimed?'Come back tomorrow for another one.':'Free, once a day: '+gift[gk]+' '+CUR_NAME[gk]+'.')+'</p></div>';
  const gb=document.createElement('button');gb.className='btn green';gb.innerHTML=S.daily.claimed?'Claimed':'Claim '+cost(gk,gift[gk]);gb.disabled=S.daily.claimed;
  gb.addEventListener('click',()=>{if(S.daily.claimed)return;S.daily.claimed=true;S[gk]+=gift[gk];persist();sfx('unlock');toast('+'+gift[gk]+' '+CUR_NAME[gk],gk);renderShop();updateShopDot();});gp.append(gb);body.append(gp);
  if(!S.pass.premium){const pp=document.createElement('button');pp.className='tile wide';pp.style.setProperty('--tc','#ffd36b');pp.innerHTML='<span class="tico">'+passBadge(passTier(S.pass.xp),46)+'</span><span style="min-width:0"><span class="tk">Season 1 · Starfall</span><b>Rumble Pass</b><span class="tt">30 extra rewards, 5 Starfall skins and the exclusive rumbler Orion · '+PASS_GEMS+' gems</span></span>';pp.addEventListener('click',()=>go('pass'));body.append(pp);}
  {const all=S.daily.dealSkins||[],feat=all[0],rest=all.slice(1).filter(([rid,sid])=>BY_ID[rid]&&!hasSkin(rid,sid));
   body.append(sectionTitle('Daily skins','New skins every day · new in '+untilMidnight()));body.append(rerollBtn('skins'));
   if(feat&&BY_ID[feat[0]]){const[rid,sid]=feat,b=BY_ID[rid],sk=getSkin(b,sid),pr=skinPrice(sk),own=hasSkin(rid,sid),d=document.createElement('button');d.className='pindeal skindeal';d.append(thumb(b,sk,96));
     d.insertAdjacentHTML('beforeend','<span class="pd-info"><span class="of-kick">Skin of the day · 50% off</span><b>'+esc(sk.name+' '+b.name)+'</b><span class="sm">Comes with a matching pin'+(S.owned[rid]?'':' · saved until you unlock '+esc(b.name))+'</span>'+(own?'<span class="tag own">Owned</span>':'<span class="tag">'+ICON.gems+Math.ceil(pr.gems*.5)+' <s style="opacity:.6">'+pr.gems+'</s></span>')+'</span>');
     if(!own)d.addEventListener('click',()=>buySkin(rid,sid,.5,renderShop));body.append(d);}
   if(rest.length){const g=document.createElement('div');g.className='grid three';
     for(const[rid,sid]of rest){const b=BY_ID[rid],sk=getSkin(b,sid),pr=skinPrice(sk),el=document.createElement('button');el.className='card';el.style.setProperty('--r',sk.tier==='sig'?'#ffc93c':sk.tier===3?'#ffd23f':sk.tier===2?'#b56cff':'#46b4ff');
       el.append(thumb(b,sk,90));el.insertAdjacentHTML('beforeend',(sk.set?'<span class="ribbon" style="background:#2fb48c">+ pin</span>':'')+'<span class="nm" style="font-size:13px">'+esc(sk.name)+'</span><span class="sm">'+b.name+(S.owned[rid]?'':' · saved until unlocked')+'</span><span class="tag">'+ICON.gems+pr.gems+'</span><span class="sm">or '+fmt(pr.coins)+' coins</span>');
       el.addEventListener('click',()=>buySkin(rid,sid,1,renderShop));g.append(el);}body.append(g);}
   const cb=document.createElement('button');cb.className='btn';cb.textContent='Open the skin catalog';cb.addEventListener('click',()=>openCatalog());body.append(cb);}
  {const mine=RUMBLERS.filter(b=>S.owned[b.id]);
   for(const[tierId,title,sub,col,cur]of[['gold','Golden skins','Coins only \u00b7 always for sale \u00b7 3-pin set','#ffd23f','coins'],['power','Power skins','The best rarity \u00b7 power points only \u00b7 3-pin set','#9d7bff','pp']]){
     const list=mine.filter(b=>!hasSkin(b.id,tierId));body.append(sectionTitle(title,sub));if(!list.length){body.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">You own every '+title.toLowerCase()+' for your rumblers.</p>');continue;}
     const g=document.createElement('div');g.className='hscroll';for(const b of list){const sk=getSkin(b,tierId),pr=skinPrice(sk),el=document.createElement('button');el.className='card';el.style.setProperty('--r',col);el.append(thumb(b,sk,84));
       el.insertAdjacentHTML('beforeend','<span class="nm" style="font-size:13px">'+esc(sk.name)+'</span><span class="sm">'+esc(b.name)+'</span><span class="tag">'+ICON[cur]+fmtFull(pr[cur])+'</span>');el.addEventListener('click',()=>buySkin(b.id,tierId,1,renderShop));g.append(el);}body.append(g);}}
  {const ps=S.daily.pinShop||{free:null,pins:[]},buyPin=(pid,pr)=>confirmBuy(pinName(pid)+' pin',pinCanvas('b:'+pid,96),pr,()=>{if(!S.pins.includes(pid))S.pins.push(pid);persist();toast(pinName(pid)+' pin is yours! Add it to a rumbler’s pin slots.','gems');renderShop();});
   body.append(sectionTitle('Daily pins','New pins every day · new in '+untilMidnight()));body.append(rerollBtn('pins'));
   if(ps.free){const own=S.pins.includes(ps.free),d=document.createElement('button');d.className='pindeal';d.append(pinCanvas('b:'+ps.free,84));
     d.insertAdjacentHTML('beforeend','<span class="pd-info"><span class="of-kick">Free pin of the day</span><b>'+esc(pinName(ps.free))+'</b>'+(own?'<span class="tag own">Claimed</span><span class="sm">A new free pin arrives tomorrow</span>':'<span class="tag" style="background:#6be39a;color:#062b16">FREE · tap to claim</span>')+'</span>');
     if(!own)d.addEventListener('click',()=>{S.pins.push(ps.free);persist();sfx('unlock');toast(pinName(ps.free)+' pin claimed! Add it to a rumbler’s pin slots.','gems');renderShop();});body.append(d);}
   const pg=document.createElement('div');pg.className='grid three';
   for(const pid of ps.pins){const own=S.pins.includes(pid),el=document.createElement('button');el.className='card';el.style.setProperty('--r',TOXIC_PINS.some(x=>x[0]===pid)?'#7ed957':DAILY_ONLY_PINS.some(x=>x[0]===pid)?'#5ec8ff':'#ff9f43');
     el.append(pinCanvas('b:'+pid,64));el.insertAdjacentHTML('beforeend','<span class="nm" style="font-size:13px">'+esc(pinName(pid))+'</span>'+(own?'<span class="tag own">Owned</span>':'<span class="tag">'+ICON.gems+PIN_PRICE.gems+'</span><span class="sm">or '+PIN_PRICE.coins+' coins</span>'));
     if(!own)el.addEventListener('click',()=>buyPin(pid,[['gems',PIN_PRICE.gems],['coins',PIN_PRICE.coins]]));pg.append(el);}
   body.append(pg);body.insertAdjacentHTML('beforeend','<p class="hint" style="margin:0">Every rumbler already has 3 free pins of its own. Tap a rumbler, then Pins, to choose its 2 custom pins.</p>');const pcb=document.createElement('button');pcb.className='btn';pcb.textContent='Open the pin catalog';pcb.addEventListener('click',()=>openPinCatalog());body.append(pcb);}
  body.append(sectionTitle('Boxes','Gems only \u00b7 open them from the Play screen'));
  {const bg=document.createElement('div');bg.className='grid';
   for(const[k,desc]of[['rbox','A guaranteed new rumbler (usually Rare to Mythic, sometimes Legendary) + 7 or more rewards'],['sbox','2 guaranteed skins for your rumblers + 2 rewards']]){const el=document.createElement('button');el.className='card boxcard';el.style.setProperty('--r',RARITY[k].col);
     el.append(dropCanvas(k,80));el.insertAdjacentHTML('beforeend','<span class="nm">'+RARITY[k].name+'</span><span class="sm">'+desc+'</span><span class="tag">'+ICON.gems+BOX_PRICE[k]+'</span>');
     el.addEventListener('click',()=>confirmBuy(RARITY[k].name,dropCanvas(k,110),[['gems',BOX_PRICE[k]]],()=>{S.drops.push({r:k,min:null});persist();sfx('unlock');toast(RARITY[k].name+' added! Opening it now','gems');renderShop();openDrops();}));bg.append(el);}
   body.append(bg);}
  body.append(sectionTitle('Resources'));const rg=document.createElement('div');rg.className='grid';
  for(const p of PACKS){const k=Object.keys(p.get)[0],el=document.createElement('button');el.className='card';el.style.setProperty('--r',k==='pp'?'#c792ff':'#ffc93c');
    el.innerHTML='<span style="width:64px;height:64px;display:grid;place-items:center">'+ICON[k].replace('<svg','<svg width="60" height="60"')+'</span><span class="nm">'+p.name+'</span><span class="sm">+'+fmtFull(p.get[k])+' '+CUR_NAME[k]+'</span><span class="tag">'+ICON[p.pay[0]]+fmtFull(p.pay[1])+'</span>';
    el.addEventListener('click',()=>confirmBuy(p.name,null,[p.pay],()=>{S[k]+=p.get[k];persist();toast('+'+fmtFull(p.get[k])+' '+CUR_NAME[k],k);renderShop();}));rg.append(el);}
  body.append(rg);
}

/* ---------- Ranked ---------- */
let embN=0;
function starPath(cx,cy,r1,r2,n){let d='';for(let k=0;k<n*2;k++){const a=k*Math.PI/n-Math.PI/2,r=k%2?r2:r1;d+=(k?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1);}return d+'Z';}
const EMB_PAL=[['#ffd2a8','#c77a43'],['#ffffff','#a9b3c9'],['#fff1a0','#e9a521'],['#e6fdff','#45c4ef'],['#f0dcff','#9a5cf5'],['#ffd1dc','#ff4f7e'],['#e6fdff','#7df9ff'],['#fff7c2','#d46bff']];
function emblem(i,size,noPips){
  const master=i>=RANK_STEPS-1,t=master?7:Math.floor(i/3),dv=master?-1:i%3,id='em'+(embN++),[c1,c2]=EMB_PAL[t];
  const O='stroke="#120f26" stroke-width="5" stroke-linejoin="round"';
  const SH='M60 12 100 26v28c0 27-17 45-40 56C37 99 20 81 20 54V26z',HI='M60 22 90 33v21c0 20-12 33-30 42-18-9-30-22-30-42V33z';
  let back='',body='',front='';
  const mirror=s=>s+'<g transform="translate(120 0) scale(-1 1)">'+s+'</g>';
  if(t===0){body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===1){back=mirror('<path d="M26 40 4 30l6 13-8 4 10 8-6 6 20 2z" fill="#e9edf6" '+O+'/>');body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===2){let l='';for(let k=0;k<6;k++){const a=(118+k*24)*Math.PI/180,x=60+Math.cos(a)*50,y=62+Math.sin(a)*50,r=(a*180/Math.PI)+90;l+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="8" ry="4" transform="rotate('+r.toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="#7fd36b" stroke="#120f26" stroke-width="2.5"/>';}
    back=mirror(l);body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';front='<path d="M40 20 43 4l9 8 8-10 8 10 9-8 3 16z" fill="#ffd23f" '+O.replace('5','4')+'/><circle cx="60" cy="13" r="3" fill="#ff4d6d"/>';}
  if(t===3){body='<path d="M60 6 104 42 60 114 16 42z" fill="url(#'+id+')" '+O+'/><path d="M16 42h88M38 42 60 6 82 42M38 42 60 114 82 42" fill="none" stroke="rgba(18,15,38,.45)" stroke-width="2.5"/><path d="M60 14 78 40H42z" fill="rgba(255,255,255,.4)"/>';}
  if(t===4){back=mirror('<path d="M32 32C14 24 8 10 12 2c6 10 16 16 28 18z" fill="#3a2266" '+O.replace('5','4')+'/>');body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';}
  if(t===5){back=mirror('<path d="M28 34C12 30 2 18 2 6c8 8 16 10 26 12-10 2-16 0-22-2 6 8 14 12 24 12-8 4-14 4-20 2 6 6 12 8 20 8z" fill="#ffb347" '+O.replace('5','3.5')+'/>');
    body='<path d="'+SH+'" fill="url(#'+id+')" '+O+'/>';front='<path d="M42 22 45 6l8 8 7-11 7 11 8-8 3 16z" fill="#ffd23f" '+O.replace('5','4')+'/>';}
  if(t===6){/* Ultra: a glowing prism crystal with a spinning halo and orbiting shards */
    let sh='';for(let k=0;k<3;k++){const a2=k*120;sh+='<path d="M60 0l5 9-5 9-5-9z" fill="#fff" transform="rotate('+a2+' 60 60)"/>';}
    back='<circle cx="60" cy="60" r="58" fill="url(#'+id+'h)"><animate attributeName="r" values="52;58;52" dur="2s" repeatCount="indefinite"/></circle><g><circle cx="60" cy="60" r="54" fill="none" stroke="#7df9ff" stroke-width="3" stroke-dasharray="14 9" opacity=".8"/><animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite"/></g>';
    body='<path d="M60 6 102 30v60L60 114 18 90V30z" fill="url(#'+id+')" '+O+'/><path d="M60 6v108M18 30l84 60M102 30 18 90" stroke="rgba(18,15,38,.25)" stroke-width="2"/><path d="M60 18 90 36v26L60 46 30 62V36z" fill="rgba(255,255,255,.28)"/><path d="M28 44 40 56 30 70M92 44 80 56 90 70" fill="none" stroke="#e6fdff" stroke-width="3" stroke-linecap="round"><animate attributeName="opacity" values="1;.2;1" dur=".9s" repeatCount="indefinite"/></path>';
    front='<g>'+sh+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="-360 60 60" dur="5s" repeatCount="indefinite"/></g><path d="M44 18 48 4l7 7 5-9 5 9 7-7 4 14z" fill="#e6fdff" '+O.replace('5','3.5')+'/>';}
  if(t===7){/* Master: the star badge, now in a spinning rainbow, with rainbow rays, a jewelled crown and orbiting gems */
    const RB=['#ff4d6d','#ff9a1a','#ffd23f','#6be39a','#5ec8ff','#7b6cff','#d46bff'];
    let rays='';for(let k=0;k<14;k++){const a2=k*360/14;rays+='<path d="M60 60 L'+(60+Math.cos((a2-5)*Math.PI/180)*62).toFixed(1)+' '+(60+Math.sin((a2-5)*Math.PI/180)*62).toFixed(1)+' L'+(60+Math.cos((a2+5)*Math.PI/180)*62).toFixed(1)+' '+(60+Math.sin((a2+5)*Math.PI/180)*62).toFixed(1)+'z" fill="'+RB[k%7]+'" opacity=".5"/>';}
    let sp='';for(let k=0;k<4;k++){const a2=k*Math.PI/2+Math.PI/4;sp+='<path d="'+starPath(60+Math.cos(a2)*54,60+Math.sin(a2)*54,5.5,2,4)+'" fill="#fff"/>';}
    back='<circle cx="60" cy="60" r="58" fill="url(#'+id+'g)"/><g>'+rays+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="14s" repeatCount="indefinite"/></g>';
    body='<path d="'+starPath(60,60,52,38,12)+'" fill="url(#'+id+')" stroke="#120f26" stroke-width="5" stroke-linejoin="round"/><path d="'+starPath(60,60,45,33,12)+'" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>'+
      '<circle cx="60" cy="60" r="32" fill="url(#'+id+'c)" stroke="#120f26" stroke-width="4"/><circle cx="60" cy="60" r="28" fill="none" stroke="#ffd23f" stroke-width="3"/><circle cx="60" cy="60" r="23" fill="none" stroke="url(#'+id+')" stroke-width="2.5" opacity=".9"/>';
    front='<path d="M37 25 40 5l10 9 10-13 10 13 10-9 3 20z" fill="url(#'+id+'k)" stroke="#120f26" stroke-width="4" stroke-linejoin="round"/><path d="M38 21h44" stroke="#120f26" stroke-width="2" opacity=".35"/>'+
      '<circle cx="40" cy="5" r="2.8" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/><circle cx="60" cy="3.5" r="3" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/><circle cx="80" cy="5" r="2.8" fill="#fff6c2" stroke="#120f26" stroke-width="1.4"/>'+
      '<circle cx="48" cy="17" r="2.8" fill="#5ef2ff" stroke="#120f26" stroke-width="1.4"/><path d="M60 10l4.5 5.5-4.5 5.5-4.5-5.5z" fill="#ff4d6d" stroke="#120f26" stroke-width="1.4"/><circle cx="72" cy="17" r="2.8" fill="#6be39a" stroke="#120f26" stroke-width="1.4"/>'+
      '<g>'+sp+'<animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="6s" repeatCount="indefinite"/></g>'+
      '<g>'+RB.map((col,k)=>'<circle cx="'+(60+Math.cos(k*TAU/7)*44).toFixed(1)+'" cy="'+(60+Math.sin(k*TAU/7)*44).toFixed(1)+'" r="3.2" fill="'+col+'" stroke="#120f26" stroke-width="1.5"/>').join('')+'<animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="9s" repeatCount="indefinite"/></g>'+
      '<circle cx="60" cy="60" r="40" fill="none" stroke="url(#'+id+')" stroke-width="2.5" opacity=".7"><animate attributeName="r" values="36;57;36" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="2.2s" repeatCount="indefinite"/></circle>';}
  let mid;
  if(t===4)mid='<ellipse cx="60" cy="56" rx="17" ry="11" fill="#fff" stroke="#120f26" stroke-width="3.5"/><circle cx="60" cy="56" r="7" fill="#7b2fe0"/><circle cx="58" cy="54" r="2.4" fill="#fff"/>';
  else if(t===5)mid='<path d="M60 36c10 10 14 18 10 28-2 6-6 9-10 10-4-1-8-4-10-10-3-8 0-14 6-20 0 6 2 9 4 10 1-6 0-12 0-18z" fill="#fff1a6" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/>';
  else if(t===6)mid='<path d="M60 40l14 18-14 22-14-22z" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"><animate attributeName="fill" values="#fff;#ffe9fb;#e6fdff;#fff" dur="2s" repeatCount="indefinite"/></path>';
  else if(t===7)mid='<path d="'+starPath(60,60,21,9,5)+'" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/><path d="'+starPath(60,60,21,9,5)+'" fill="url(#'+id+')" opacity=".25"/>';
  else mid='<path d="'+starPath(60,t===3?44:56,15,6.8,5)+'" fill="#fff" stroke="#120f26" stroke-width="3.5" stroke-linejoin="round"/>';
  const hi=t===3||t>=6?'':'<path d="'+HI+'" fill="rgba(255,255,255,.2)"/><path d="'+HI+'" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/>'+(t>=2&&t!==3&&t<6?'<path d="M60 92l6 6-6 6-6-6z" fill="'+c1+'" stroke="#120f26" stroke-width="2.5"/>':'');
  let pips='';if(dv>=0&&!noPips)for(let k=0;k<3;k++){const x=46+k*14;pips+='<path d="M'+x+' 80l5 5-5 5-5-5z" fill="'+(k<=dv?'#fff':'rgba(18,15,38,.35)')+'" stroke="#120f26" stroke-width="2"/>';}
  const grad=t===6?'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7df9ff"><animate attributeName="stop-color" values="#7df9ff;#ff7ad9;#ffe98a;#7df9ff" dur="3s" repeatCount="indefinite"/></stop><stop offset=".5" stop-color="#2f6bff"><animate attributeName="stop-color" values="#2f6bff;#8a3bff;#2fd0ff;#2f6bff" dur="3s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="#7a1fd8"><animate attributeName="stop-color" values="#7a1fd8;#1f9bd8;#d81f9b;#7a1fd8" dur="3s" repeatCount="indefinite"/></stop></linearGradient><radialGradient id="'+id+'h"><stop offset=".4" stop-color="#7df9ff" stop-opacity=".6"/><stop offset="1" stop-color="#7df9ff" stop-opacity="0"/></radialGradient>':t===7?'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+['#ff4d6d','#ff9a1a','#ffd23f','#6be39a','#5ec8ff','#7b6cff','#d46bff','#ff4d6d'].map((col,k)=>'<stop offset="'+(k/7).toFixed(3)+'" stop-color="'+col+'"/>').join('')+'<animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="5s" repeatCount="indefinite"/></linearGradient><radialGradient id="'+id+'g"><stop offset=".3" stop-color="#ffffff" stop-opacity=".45"/><stop offset=".7" stop-color="#d46bff" stop-opacity=".25"/><stop offset="1" stop-color="#5ec8ff" stop-opacity="0"/></radialGradient><radialGradient id="'+id+'c" cx=".4" cy=".35"><stop offset="0" stop-color="#5a3ad8"/><stop offset="1" stop-color="#140f3a"/></radialGradient><linearGradient id="'+id+'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a6"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#e08a1a"/></linearGradient>'
    :'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c1+'"/><stop offset="1" stop-color="'+c2+'"/></linearGradient>';
  /* extra flair: glowing aura, a shine that sweeps across, and twinkling sparkles on higher ranks */
  const shape=t===3?'M60 6 104 42 60 114 16 42z':t===7?starPath(60,60,52,38,12):t===6?'M60 6 102 30v60L60 114 18 90V30z':SH,big=size>=40;
  const aura=t>=1?'<circle cx="60" cy="60" r="56" fill="url(#'+id+'a)"><animate attributeName="opacity" values=".5;1;.5" dur="'+(3-t*.3).toFixed(1)+'s" repeatCount="indefinite"/></circle>':'';
  const auraG='<radialGradient id="'+id+'a"><stop offset=".45" stop-color="'+c2+'" stop-opacity=".7"/><stop offset="1" stop-color="'+c2+'" stop-opacity="0"/></radialGradient><clipPath id="'+id+'k"><path d="'+shape+'"/></clipPath>';
  const sheen=big?'<g clip-path="url(#'+id+'k)"><rect x="-80" y="-10" width="26" height="150" fill="#fff" opacity=".45" transform="skewX(-22)"><animate attributeName="x" values="-80;170;170" dur="'+(4-t*.3).toFixed(1)+'s" repeatCount="indefinite"/></rect></g>':'';
  let tw='';if(big&&t>=2){const P=[[18,22],[102,30],[98,96],[22,90],[60,4]];for(let k=0;k<Math.min(5,t);k++){const[x,y]=P[k];tw+='<path d="'+starPath(x,y,6,2,4)+'" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="'+(k*.4).toFixed(1)+'s" repeatCount="indefinite"/></path>';}}
  const rim=t>=3&&t<=6?'<path d="'+shape+'" fill="none" stroke="'+c1+'" stroke-width="2" stroke-dasharray="8 10" opacity=".9"><animate attributeName="stroke-dashoffset" values="0;-36" dur="1.6s" repeatCount="indefinite"/></path>':'';
  return '<svg viewBox="0 0 120 120" width="'+size+'" height="'+size+'" aria-hidden="true"><defs>'+grad+auraG+'</defs>'+aura+back+body+hi+sheen+rim+mid+pips+front+tw+'</svg>';
}
function renderRanked(){
  const body=$('#rankedBody'),ri=rankInfo(S.rp),locked=ownedCount()<3;
  let h='<header class="head"><h1>Ranked</h1><span class="pill">'+emblem(ri.i,24)+'<span>'+fmtFull(S.rp)+' RP</span></span></header>';
  h+='<div class="panel emblem">'+emblem(ri.i,120)+'<h2 style="color:'+ri.col+';text-shadow:0 3px 0 #0d0a22">'+ri.name+'</h2>';
  h+=ri.need?'<div class="rp-bar"><i style="width:'+Math.round(ri.into/ri.need*100)+'%"></i></div><p class="hint">'+ri.into+' / '+ri.need+' RP to the next division · win streak '+S.streak+'</p>':'<p class="hint">Top of the ladder.</p>';
  h+=locked?'<p class="hint" style="color:#ffd1dc">Unlock 3 rumblers to play ranked ('+ownedCount()+' / 3). Earn chromos from takedowns to unlock more.</p>':'<p class="hint">Each match picks a random mode. Wins give 25 RP plus a streak bonus, 100 coins, 50 power points and 3 gems; losses cost 15 RP. Ranked matches also earn 1.5× pass tokens. Opponents now: <b>'+RANK_FOE_NAMES[ri.i>=RANK_STEPS-1?6:Math.floor(ri.i/3)]+'</b>. In Master every win pays extra, more the higher your RP.</p>';
  h+='<button class="play ranked" id="rankedPlay"'+(locked?' disabled style="filter:grayscale(.7) brightness(.7)"':'')+'>Play ranked<small>Random mode · 3 vs 3</small></button></div>';
  {const got=!!S.masterAll;h+='<div class="panel master-panel"><div class="mp-head">'+emblem(RANK_STEPS-1,64)+'<div><span class="of-kick">Reach Master</span><h2>Master bundle</h2><p class="hint" style="margin:0">'+(got?'Claimed. You\u2019re a Master!':'Everything below, all at once, the moment you reach Master.')+'</p></div></div><ul class="mp-list">'+
    '<li>'+ICON.chromos+'<span>15,000 chromos</span></li><li>'+ICON.gems+'<span>500 gems</span></li><li>'+ICON.coins+'<span>10,000 coins</span></li><li>'+ICON.pp+'<span>5,000 power points</span></li>'+
    '<li>'+DI('ultra')+'<span>3 Amazing Drops</span></li><li>'+DI('legendary')+'<span>5 Legendary Drops</span></li><li>'+ICON.rp+'<span>Grandmaster skin on <b>every</b> rumbler</span></li><li>'+ICON.rp+'<span>Master pin with an “I reached Masters” sign</span></li></ul><div class="mp-art"></div></div>';}
  h+='<div class="sec-title"><h2>Rank sets</h2><span>A skin and pin for every rank, for a rumbler picked just for you</span></div><div class="rsets">'+RANK_SETS.map((rs,k)=>{const got=hasSkin(rankSetRumbler(k,rankSeed(S)),rs.skin.id)&&S.pins.includes(rs.pin);
    return '<button class="rset'+(got?' got':'')+'" data-k="'+k+'" style="--rc:'+rs.pal[1]+'"><span class="rs-art"></span><b>'+(rs.key==='master'?'Master':rs.name)+'</b><small>'+(got?'Owned':rs.idx===0?'Play ranked':'Reach '+(rs.key==='master'?'Master':rs.name+' I'))+'</small></button>';}).join('')+'</div>';
  h+='<div class="sec-title"><h2>Ladder</h2><span>Tap a division to see its rewards</span></div><ol class="ladder">';
  for(let i=RANK_STEPS-1;i>=1;i--){const r=i===RANK_STEPS-1?{name:'Master',col:'#ff5e87'}:rankInfo(i*100),rw=rankReward(i),cls=i===ri.i?'cur':i<=S.rankClaimed?'done':i<=(S.rankPeak|0)?'ready':'';
    h+='<li class="'+cls+'" data-i="'+i+'" tabindex="0" role="button">'+emblem(i,42)+'<span>'+r.name+'</span><small>'+(i<=S.rankClaimed?'Claimed':rw.master?ICON.rp+'Master bundle':(RANK_SETS.some(rs=>rs.idx===i)?'<span class="setchip">+ set</span> ':'')+ICON.chromos+fmt(rw.chromos)+' '+ICON.gems+rw.gems+' '+DI(rw.drops[0].r,18)+'×'+rw.drops[0].n)+'</small></li>';}
  h+='</ol>';
  {const n=Math.max(0,(S.rankPeak|0)-(S.rankClaimed|0));h+='<div class="panel claim-panel"><h2>Claim rank rewards</h2><p class="hint" style="margin:0">'+(n?'You have <b>'+n+'</b> rank reward'+(n>1?'s':'')+' waiting, up to <b>'+(S.rankPeak>=RANK_STEPS-1?'Master':rankInfo(S.rankPeak*100).name)+'</b>. Claiming pays them all out and sends you back to Bronze I to climb again. Rank sets get new random rumblers each climb (Master stays Ember).':'Climb the ladder, then come back here to claim every reward you reached at once.')+'</p><button class="btn gold claim-btn" id="rankClaim"'+(n?'':' disabled')+'>Claim'+(n?' '+n+' reward'+(n>1?'s':''):'')+'</button></div>';}
  body.innerHTML=h;
  {const cb=$('#rankClaim');if(cb)cb.addEventListener('click',()=>{const ask=(msg,yes)=>openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Are you sure?</h2><p class="sub">'+msg+'</p>');const y=document.createElement('button');y.className='btn gold';y.textContent='Yes';y.addEventListener('click',yes);const n=document.createElement('button');n.className='btn';n.textContent='No';n.addEventListener('click',closeSheet);card.append(y,n);});
    ask('By claiming this reward, this resets you to Bronze I. Are you sure?',()=>ask('Really sure? You go back to Bronze I and climb again. This can\u2019t be undone.',()=>{const r=claimRanked();closeSheet();if(!r)return;sfx('unlock');
      openSheet(card=>{card.insertAdjacentHTML('beforeend','<h2>Rewards claimed!</h2><ul class="mp-list"><li>'+ICON.chromos+'<span>+'+fmtFull(r.chromos)+' chromos</span></li><li>'+ICON.gems+'<span>+'+r.gems+' gems</span></li><li>'+ICON.coins+'<span>+'+fmtFull(r.coins)+' coins</span></li><li>'+ICON.pp+'<span>+'+fmtFull(r.pp)+' power points</span></li><li>'+ICON.drop+'<span>'+r.rankBundle.drops+' drops (open them from Play)</span></li>'+(r.rankSets.length?'<li>'+ICON.rp+'<span>'+r.rankSets.length+' rank set'+(r.rankSets.length>1?'s':'')+'</span></li>':'')+(r.master?'<li>'+ICON.rp+'<span>Grandmaster skin on every rumbler!</span></li>':'')+'</ul><p class="sub">You\u2019re back at Bronze I. Good luck on the next climb!</p>');const x=document.createElement('button');x.className='btn gold';x.textContent='Nice!';x.addEventListener('click',()=>{closeSheet();renderRanked();});card.append(x);});renderRanked();}));});}
  {const art=body.querySelector('.mp-art');if(art){const sb=BY_ID[rankSetRumbler(RANK_SETS.length-1,rankSeed(S))];art.append(thumb(sb,getSkin(sb,'master'),110));art.insertAdjacentHTML('beforeend','<small>Grandmaster '+esc(sb.name)+'</small>');const pc=pinCanvas('b:master',84);pc.classList.add('mp-pin');art.append(pc);art.insertAdjacentHTML('beforeend','<small>Master pin</small>');}}
  const rsb=rs=>BY_ID[rankSetRumbler(RANK_SETS.indexOf(rs),rankSeed(S))];
  const setPreview=rs=>{const eb=rsb(rs);const d=document.createElement('div');d.className='d-set';d.append(thumb(eb,getSkin(eb,rs.skin.id),110));const pc=pinCanvas('b:'+rs.pin,96);pc.className='mp-pin';d.append(pc);return d;};
  body.querySelectorAll('.rset').forEach(bt=>{const rs=RANK_SETS[+bt.dataset.k],eb=rsb(rs),art=bt.querySelector('.rs-art');art.append(thumb(eb,getSkin(eb,rs.skin.id),64));const pc=pinCanvas('b:'+rs.pin,34);pc.className='rs-pin';art.append(pc);
    bt.addEventListener('click',()=>openSheet(card=>{const got=S.pins.includes(rs.pin),nm=rs.key==='master'?'Master':rs.name;
      card.insertAdjacentHTML('beforeend','<h2>'+nm+' set</h2><p class="sub">'+(got?'You own this set. Equip the skin on '+esc(rsb(rs).name)+' and send the pin in matches.':rs.idx===0?'Play your first ranked match to get it.':'Reach '+(rs.key==='master'?'Master':nm+' I')+' in ranked to get it.')+'</p>');
      card.append(setPreview(rs));card.insertAdjacentHTML('beforeend','<ul class="mp-list"><li>'+ICON.rp+'<span>'+esc(rs.skin.name)+' '+esc(rsb(rs).name)+' skin</span></li><li>'+ICON.rp+'<span>“I reached '+rs.name+'” pin</span></li></ul>');
      const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);}));});
  body.querySelectorAll('.ladder li').forEach(li=>{const open=()=>{const i=+li.dataset.i;if(i>=RANK_STEPS-1){$('#ranked').scrollTop=0;return;}const rw=rankReward(i),nm=rankInfo(i*100).name,setAt=RANK_SETS.find(rs=>rs.idx===i);
    openSheet(card=>{card.insertAdjacentHTML('beforeend','<div class="d-top">'+emblem(i,96)+'<div class="d-info"><h2>'+nm+'</h2><p class="sub">'+(i<=S.rankClaimed?'You already claimed these.':'You get all of this the first time you reach '+nm+'.')+'</p></div></div><ul class="mp-list">'+
      '<li>'+ICON.chromos+'<span>'+fmtFull(rw.chromos)+' chromos</span></li><li>'+ICON.gems+'<span>'+rw.gems+' gems</span></li><li>'+ICON.coins+'<span>'+fmtFull(rw.coins)+' coins</span></li><li>'+ICON.pp+'<span>'+fmtFull(rw.pp)+' power points</span></li><li>'+ICON.drop+'<span>'+rw.drops[0].n+' '+dropName(rw.drops[0].r)+(rw.drops[0].n>1?'s':'')+'</span></li>'+(setAt?'<li>'+ICON.rp+'<span>'+esc(setAt.skin.name)+' Ember skin</span></li><li>'+ICON.rp+'<span>\u201cI reached '+setAt.name+'\u201d pin</span></li>':'')+'</ul>');
      if(setAt)card.append(setPreview(setAt));
      const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});};
    li.addEventListener('click',open);li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});
  const b=$('#rankedPlay');if(b&&!locked)b.addEventListener('click',()=>startMatchmaking(true));
}

/* Trick's Pick a Rarity gadget: choose where his next attack comes from */
let rarPickT=null;
function openRarPick(list){const el=$('#rarPick');el.innerHTML='<p>Pick a rarity for your next attack</p>';const row=document.createElement('div');row.className='rp-row';
  const done=r=>{clearTimeout(rarPickT);el.hidden=true;if(P&&!P.dead)forceTrickAtk(P,r);};
  for(const r of list){const b=document.createElement('button');b.className='rpill'+rpc(r);b.style.setProperty('--r',RARITY[r].col);b.textContent=RARITY[r].name;b.addEventListener('click',e=>{e.stopPropagation();done(r);});row.append(b);}
  el.append(row);el.hidden=false;clearTimeout(rarPickT);rarPickT=setTimeout(()=>{if(!el.hidden)done(pick(list));},6000);}
/* ---------- Matchmaking ---------- */
let mmTimers=[],lastRanked=false,lastTrial=null;
function clearMM(){mmTimers.forEach(clearTimeout);mmTimers=[];}
/* Ranked pick screen: picks happen in turns (red, blue, you, red, red, blue). Bots take a moment to decide, and nobody can take a picked rumbler */
let draftTimers=[];
function clearDraft(){draftTimers.forEach(clearTimeout);draftTimers.forEach(clearInterval);draftTimers=[];}
function openRankedDraft(){audio();sfx('click');clearMM();closeSheet();clearDraft();
  const mode=pick(MODES.filter(m=>m.ranked)),pool=RUMBLERS.filter(b=>!b.random),smx=seasonMaxed(),RANK_MIN_LVL=4;
  const party=[...new Set((S.party||[]).map(f=>f.rumbler).filter(id=>BY_ID[id]))].slice(0,2);
  const picks={m0:null,m1:null,me:null,f0:null,f1:null,f2:null},bans=[],taken=()=>new Set(Object.values(picks).filter(Boolean).concat(bans)),banOn=rankInfo(S.rp).tier>=2;
  const choices=smx.map(id=>({id,maxed:true})).concat(Object.keys(S.owned).filter(id=>BY_ID[id]&&!smx.includes(id)).map(id=>({id,maxed:false})));
  const okLvl=c=>c.maxed||(S.owned[c.id]&&S.owned[c.id].lvl>=RANK_MIN_LVL);
  const fn=shuffle(BOT_NAMES.slice()),names={me:S.name,m0:(S.party||[])[0]?safeName(S.party[0].name):fn[0],m1:(S.party||[])[1]?safeName(S.party[1].name):fn[1],f0:fn[2],f1:fn[3],f2:fn[4]};
  const ORDER=['f0','m0','me','f1','f2','m1'];
  const el=$('#draft');el.hidden=false;const card=el.querySelector('.draft-card');card.classList.add('rk-draft');
  const slot=k=>'<div class="dslot '+(k[0]==='f'?'red':'blue')+(k==='me'?' you':'')+'" data-k="'+k+'"><span class="ds-pic"></span><span class="ds-txt"><b>'+esc(names[k])+'</b><small>Waiting…</small></span></div>';
  card.innerHTML='<div class="dr-top"><p class="mm-k">Ranked · '+rankInfo(S.rp).name+'</p><h2>'+esc(mode.name)+'</h2><p class="small">'+'Random map every ranked game'+'</p></div>'+
    '<div class="dr-turn" id="drTurn">Getting ready…</div>'+(banOn?'<div class="dr-bans" id="drBans"><small>Bans</small></div>':'')+
    '<div class="dr-board"><div class="dr-col">'+['m0','me','m1'].map(slot).join('')+'</div><div class="dr-vs">VS</div><div class="dr-col">'+['f0','f1','f2'].map(slot).join('')+'</div></div>'+
    '<p class="small">Your rumbler must be level '+RANK_MIN_LVL+'+. Season Max rumblers are free for everyone this month at max level with a gadget and star power.</p><div class="dr-grid"></div><button class="btn" id="draftCancel">Leave</button>';
  const grid=card.querySelector('.dr-grid'),turnEl=card.querySelector('#drTurn');let myTurn=false;
  const setSlot=(k,id,state)=>{const sEl=card.querySelector('.dslot[data-k="'+k+'"]'),pic=sEl.querySelector('.ds-pic'),sm=sEl.querySelector('small');pic.innerHTML='';
    if(id){const b=BY_ID[id];pic.append(thumb(b,getSkin(b,k==='me'&&S.owned[id]?S.owned[id].skin:'classic'),54));}
    sEl.classList.toggle('thinking',state==='think');sEl.classList.toggle('locked',state==='lock');sEl.classList.toggle('turn',state==='think'||state==='turn');
    sm.textContent=state==='lock'?BY_ID[id].name+(k==='me'&&mineMax?' · Season Max':''):state==='think'?'Choosing…':state==='turn'?'Your turn!':'Waiting…';};
  let mineMax=false;
  const drawGrid=()=>{grid.innerHTML='';const t=taken();for(const c of choices){const b=BY_ID[c.id],own=S.owned[c.id],tk=t.has(c.id),low=!okLvl(c),d=document.createElement('button');
    d.className='dr-pick'+(c.maxed?' max':'')+(tk||low?' lock':'');d.disabled=tk||low||!myTurn;d.style.setProperty('--r',RARITY[b.rarity].col);
    d.append(thumb(b,getSkin(b,own?own.skin:'classic'),62));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b><small>'+(tk?'Taken':low?'Lv '+own.lvl+' · needs '+RANK_MIN_LVL:c.maxed?'SEASON MAX':'Level '+own.lvl)+'</small>');
    if(!tk&&!low)d.addEventListener('click',()=>{if(myTurn)lockMe(c);});grid.append(d);}};
  const finish=()=>{turnEl.textContent='Get ready to rumble!';draftTimers.push(setTimeout(()=>{el.hidden=true;card.classList.remove('rk-draft');startMatchmaking(true,{mode,draft:{id:picks.me,maxed:mineMax,mates:[picks.m0,picks.m1],foes:[picks.f0,picks.f1,picks.f2]}});},1400));};
  let step=0;
  const next=()=>{if(step>=ORDER.length){finish();return;}const k=ORDER[step++];
    if(k==='me'){const free=choices.filter(c=>!taken().has(c.id)&&okLvl(c));
      if(!free.length){const r=pick(pool.filter(b=>!taken().has(b.id)));toast('No free rumbler at level '+RANK_MIN_LVL+'+, so you get a random one: '+esc(r.name));picks.me=r.id;setSlot('me',r.id,'lock');drawGrid();draftTimers.push(setTimeout(next,700));return;}
      myTurn=true;let left=20;setSlot('me',null,'turn');turnEl.innerHTML='<b>Your turn to pick!</b> <span class="dr-clock">'+left+'</span>';drawGrid();sfx('pin');
      const iv=setInterval(()=>{left--;const ck=turnEl.querySelector('.dr-clock');if(ck)ck.textContent=left;if(left<=0){clearInterval(iv);lockMe(pick(choices.filter(c=>!taken().has(c.id)&&okLvl(c))));}},1000);draftTimers.push(iv);lockMe.iv=iv;return;}
    const fixed=k==='m0'?party[0]:k==='m1'?party[1]:null,cand=pool.filter(b=>!taken().has(b.id)&&b.id!==fixed),final=fixed&&!taken().has(fixed)?fixed:pick(cand).id;
    turnEl.textContent=(k[0]==='f'?'Opponent ':'Teammate ')+names[k]+' is choosing…';let n=0;
    const iv=setInterval(()=>{const h=pick(cand);setSlot(k,h.id,'think');n++;},260);draftTimers.push(iv);
    draftTimers.push(setTimeout(()=>{clearInterval(iv);picks[k]=final;setSlot(k,final,'lock');sfx('pin');drawGrid();draftTimers.push(setTimeout(next,450));},rand(1600,3400)));};
  function lockMe(c){if(!myTurn||!c)return;myTurn=false;if(lockMe.iv)clearInterval(lockMe.iv);picks.me=c.id;mineMax=!!c.maxed;setSlot('me',c.id,'lock');sfx('unlock');drawGrid();turnEl.textContent='Locked in '+BY_ID[c.id].name+'!';draftTimers.push(setTimeout(next,600));}
  drawGrid();card.querySelector('#draftCancel').addEventListener('click',()=>{clearDraft();el.hidden=true;card.classList.remove('rk-draft');});
  /* Gold and up: each team bans one rumbler first. Your bot teammates always agree with your ban. */
  const showBan=(id,mine)=>{const bx=card.querySelector('#drBans');const s=document.createElement('span');s.className='dr-ban '+(mine?'blue':'red');s.append(thumb(BY_ID[id],getSkin(BY_ID[id],'classic'),40));s.insertAdjacentHTML('beforeend','<i>\u2715</i><small>'+esc(BY_ID[id].name)+'</small>');bx.append(s);};
  const banPhase=()=>{let done=false,left=15;turnEl.innerHTML='<b>Ban a rumbler!</b> Nobody can play it this game <span class="dr-clock">'+left+'</span>';grid.innerHTML='';
    const doBan=id=>{if(done)return;done=true;clearInterval(iv);bans.push(id);showBan(id,true);sfx('thud');turnEl.textContent='Your team agreed: '+BY_ID[id].name+' is banned!';
      draftTimers.push(setTimeout(()=>{const strong=pool.filter(b=>!bans.includes(b.id)).sort(()=>Math.random()-.5).sort((a,b)=>DROP_RAR.indexOf(b.rarity)-DROP_RAR.indexOf(a.rarity));const eb=(Math.random()<.6?strong[0]:pick(strong)).id;bans.push(eb);showBan(eb,false);turnEl.textContent='Opponents banned '+BY_ID[eb].name+'!';sfx('thud');drawGrid();draftTimers.push(setTimeout(next,1200));},1400));};
    for(const b of pool){const d=document.createElement('button');d.className='dr-pick banpick';d.style.setProperty('--r',RARITY[b.rarity].col);d.append(thumb(b,getSkin(b,'classic'),50));d.insertAdjacentHTML('beforeend','<b>'+esc(b.name)+'</b>');d.addEventListener('click',()=>doBan(b.id));grid.append(d);}
    const iv=setInterval(()=>{left--;const ck=turnEl.querySelector('.dr-clock');if(ck)ck.textContent=left;if(left<=0)doBan(pick(pool).id);},1000);draftTimers.push(iv);};
  draftTimers.push(setTimeout(banOn?banPhase:next,700));}
function startMatchmaking(ranked,pre){
  if(!ranked&&!pre&&netCanPlay()){if(NETC)netLeave();netQueue(S.mode);return;}
  if(ranked&&!pre){openRankedDraft();return;}
  audio();sfx('click');clearMM();closeSheet();lastRanked=ranked;lastTrial=null;
  const mode=pre?pre.mode:ranked?pick(MODES.filter(m=>m.ranked)):MODE_BY[S.mode];
  try{newMatch({mode:mode.id,ranked,draft:pre&&pre.draft});}catch(err){M=null;P=null;toast('Could not start the match: '+esc(err.message||err));return;}
  const mm=$('#mm'),slots=$('#mmSlots');mm.hidden=false;
  $('#mmKicker').textContent=ranked?'Ranked · '+rankInfo(S.rp).name:'Matchmaking';$('#mmTitle').textContent='Finding players';
  $('#mmMode').textContent=mode.name+' · '+MAPS[M.mapId||mode.map].name;
  const opp=$('#mmOpp');if(M.opp!=null){const o=OPP_TIERS[M.opp];opp.hidden=false;opp.style.setProperty('--oc',o.col);opp.innerHTML='<b>'+o.name+' opponents</b><span>'+o.note+'</span>';}else opp.hidden=true;
  slots.innerHTML='';const order=M.units.slice().sort((a,b)=>a.team-b.team);
  const els=order.map((u,i)=>{const d=document.createElement('div');d.className='mm-slot wait '+(u.team===0?'blue':'red');slots.append(d);return d;});
  let t=150;order.forEach((u,i)=>{t+=i===0?0:order.length>8?rand(90,200):rand(180,420);mmTimers.push(setTimeout(()=>{const d=els[i];d.className='mm-slot in '+(u.team===0?'blue':'red');d.innerHTML='';d.append(thumb(u.b,u.sk,64));sfx('pin');},t));});
  mmTimers.push(setTimeout(()=>{$('#mmTitle').textContent='Match found!';sfx('go');},t+200));
  mmTimers.push(setTimeout(()=>{mm.hidden=true;enterGame();},t+900));
}
$('#mmCancel').addEventListener('click',()=>{if(NETW.queue){netSend({t:'cancel'});netQueueUi(null);return;}clearMM();$('#mm').hidden=true;M=null;P=null;});
$('#playBtn').addEventListener('click',()=>startMatchmaking(false));
let lastTrialSkin=null;
function startTrial(id,skin){
  audio();sfx('click');clearMM();closeSheet();lastTrial=id;lastTrialSkin=skin||null;lastRanked=false;
  try{newMatch({mode:'try',trial:id,trialSkin:skin||null});}catch(err){M=null;P=null;toast('Could not start training: '+esc(err.message||err));return;}
  enterGame();
}
function enterGame(){
  for(const k in last)delete last[k];
  ctl.move=ctl.atk=ctl.sup=null;keys.clear();H$.feed.innerHTML='';$('#pinPick').hidden=true;
  $('#pauseOv').hidden=true;$('#endOv').hidden=true;paused=false;
  try{go('game');resize();camera(0,true);syncHud();}catch(err){toast('Could not start the match: '+esc(err.message||err));leaveMatch(true);}
}

/* ---------- Match HUD ---------- */
const H$={mates:$('#mates'),sbBlue:$('#sbBlue'),sbRed:$('#sbRed'),snBlue:$('#snBlue'),snRed:$('#snRed'),timer:$('#timer'),zone:$('#zoneMsg'),center:$('#centerMsg'),desk:$('#deskHint'),feed:$('#feed')};
const last={};
function setTxt(k,el,v){if(last[k]!==v){last[k]=v;el.textContent=v;}}
function setHtml(k,el,v){if(last[k]!==v){last[k]=v;el.innerHTML=v;}}
function onKillFeed(src,t){
  if(NETS){if(M&&M.netEv)M.netEv.push(['k',src&&src.id||0,t.id]);return;}
  if(!H$||!H$.feed)return;const el=document.createElement('div');el.className='kf';
  const a=document.createElement('span');a.className=src&&src.team===MYT?'tb':'tr';a.textContent=src?src.name:'Storm';
  const x=document.createElement('span');x.className='x';x.textContent='KO';
  const b=document.createElement('span');b.className=t.team===MYT?'tb':'tr';b.textContent=t.name;
  el.append(a,x,b);H$.feed.prepend(el);while(H$.feed.children.length>4)H$.feed.lastChild.remove();setTimeout(()=>el.remove(),3200);
}
function syncHud(){
  const h=modeHud();
  setTxt('nb',H$.snBlue,h.lt);setTxt('nr',H$.snRed,h.rt);
  const wb=Math.round(clamp(h.l,0,1)*100)+'%',wr=Math.round(clamp(h.r,0,1)*100)+'%';if(last.wb!==wb){last.wb=wb;H$.sbBlue.style.width=wb;}if(last.wr!==wr){last.wr=wr;H$.sbRed.style.width=wr;}
  const tl=Math.max(0,Math.ceil(M.time));setTxt('tm',H$.timer,Math.floor(tl/60)+':'+String(tl%60).padStart(2,'0'));
  setTxt('zn',H$.zone,h.msg||'');
  {let mh='';if(M.mode.sd&&M.mode.size>1&&M.state!=='ended')for(const u of M.units){if(u.team!==MYT||u===P||u.shadow||!u.dead||u.respawn===Infinity)continue;mh+='<span class="mate"><i style="background:'+u.sk.body+'"></i>'+esc(u.name)+' back in <b>'+Math.max(1,Math.ceil(u.respawn))+'s</b></span>';}setHtml('mt',H$.mates,mh);}
  let msg='',cls='center-msg';
  if(M.state==='countdown'){if(M.cd>2.6){msg=esc(M.mode.name)+'<small>'+(M.ranked?'Ranked · ':'')+esc(MAPS[M.mapId||M.mode.map].name)+'</small>';cls+=' mid';}else{msg=M.cd>.7?String(Math.ceil(M.cd-.6)):'Rumble!';cls+=' big';}}
  else if(M.state==='ended'&&!M.shown){msg=M.mode.ffa?(ORD[M.place-1]+' place'):M.result===0?'Victory':M.result===1?'Defeat':'Draw';cls+=' big';}
  else if(P&&P.dead){msg=P.respawn===Infinity?'Knocked out<small>Watch your team finish it</small>':'Back in '+Math.max(1,Math.ceil(P.respawn));cls+=' mid';}
  setHtml('cm',H$.center,msg);if(last.cc!==cls+msg.length){last.cc=cls+msg.length;H$.center.className=cls;}
  const showDesk=!touchUI||mouseMode;if(H$.desk.hidden===showDesk)H$.desk.hidden=!showDesk;
}
function setPaused(v){if(!M||M.state==='ended')v=false;paused=v;$('#pauseOv').hidden=!v;$('#pinPick').hidden=true;$('#leaveNote').textContent=M&&M.trial?'Training has no rewards, so leave any time.':M&&M.state==='play'?(M.ranked?'Leaving counts as a loss and costs RP.':'Leaving counts as a loss.'):'You can leave freely before the match starts.';if(v){ctl.move=ctl.atk=ctl.sup=null;keys.clear();}}
function leaveMatch(silent){
  if(NETC){if(M&&M.state!=='ended'&&!silent){M.left=true;M.result=1;M.place=6;M.state='ended';M.reward=applyRewards();}netLeave();M=null;P=null;paused=false;$('#endOv').hidden=true;$('#pauseOv').hidden=true;go('home');return;}
  if(M&&M.state==='play'&&!silent&&!M.trial){M.left=true;M.result=1;M.place=6;M.state='ended';M.reward=applyRewards();}
  M=null;P=null;paused=false;$('#endOv').hidden=true;$('#pauseOv').hidden=true;go('home');
}
$('#pauseBtn').addEventListener('click',()=>setPaused(true));
$('#resumeBtn').addEventListener('click',()=>setPaused(false));
$('#leaveBtn').addEventListener('click',()=>leaveMatch(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&view==='game'&&M&&M.state!=='ended')setPaused(true);});
function showEnd(){
  $('#rarPick').hidden=true;clearTimeout(rarPickT);
  if(M.trial){const tb=P.b,owned=!!S.owned[tb.id];
    $('#endSheet').innerHTML='<p class="small">Training</p><p class="end-k win">Trial over</p><p class="end-score">'+P.kills+' takedown'+(P.kills===1?'':'s')+'</p><p class="small">'+(owned?'Level '+esc(tb.name)+' up to '+MAX_LVL+' to make them this strong in real matches.':(RARITY[tb.rarity].passOnly?'Like '+esc(tb.name)+'? Get them at tier 30 of the Rumble Pass.':'Like '+esc(tb.name)+'? Unlock them for '+fmtFull(RARITY[tb.rarity].chromos)+' chromos. You have '+fmtFull(S.chromos)+'.'))+'</p><div class="row"><button class="btn primary" id="againBtn">Try again</button><button class="btn" id="homeBtn2">Back</button></div>';
    $('#endOv').hidden=false;
    $('#againBtn').addEventListener('click',()=>{$('#endOv').hidden=true;M=null;P=null;startTrial(lastTrial,lastTrialSkin);});
    $('#homeBtn2').addEventListener('click',()=>{leaveMatch(true);go('rumblers');});return;}
  const r=M.reward,w=M.result,b=P&&P.b?P.b:BY_ID[S.selected],me=S.owned[b.id]||{prestige:0};
  const title=M.mode.ffa||M.mode.sd?(ORD[M.place-1]+' place'):w===0?'Victory':w===1?'Defeat':'Draw',cls=w===0?'win':w===1?'lose':'';
  if(w===0){const[cx,cy]=[cam.x,cam.y];const cols=['#ffc93c','#ff5e87','#46b4ff','#6be39a','#c792ff'];for(let i=0;i<70;i++)addFx({k:'spark',x:cx+rand(-200,200),y:cy-rand(100,300),vx:rand(-120,120),vy:rand(40,260),t:0,T:rand(1,1.8),s:rand(3,5),col:pick(cols)});}
  const li=(icon,txt,val)=>'<li>'+ICON[icon]+'<span>'+txt+'</span><b>'+val+'</b></li>';
  let rows='';
  if(r.masterBonus)rows+='<li class="set-row" style="border-color:#ff7aa8"><span class="star-ico" style="background:#ff7aa8">M</span><span><b style="color:#ff7aa8">Master bonus \u00d7'+r.masterBonus+'</b> \u00b7 the higher your RP, the bigger it gets</span><b></b></li>';
  if(M.ranked){const ri=rankInfo(S.rp);rows+=li('rp',(r.rp>=0?'+':'')+r.rp+' RP'+(S.streak>1&&w===0?' · '+S.streak+' win streak':''),ri.name);}
  else rows+=li('trophies',(r.trophies>0?'+':'')+r.trophies+' trophies',fmtFull(S.trophies));
  if(r.star)rows+='<li class="star-row"><span class="star-ico" aria-hidden="true">★</span><span>Star Player · most takedowns</span><b>+'+STAR_PLAYER_TROPHIES+' trophies</b></li>';
  rows+=li('coins','+'+r.coins+' coins',fmt(S.coins));rows+=li('pp','+'+r.pp+' power points',fmt(S.pp));
  if(r.gems)rows+=li('gems','+'+r.gems+' gems',fmt(S.gems));
  rows+=li('chromos','+'+r.chromos+' chromos · '+P.kills+' takedown'+(P.kills===1?'':'s'),fmt(S.chromos));
  if(r.passXp)rows+=li('pass','+'+r.passXp+' pass tokens'+(r.passUp?' · tier '+r.passUp+' reached!':''),'Tier '+passTier(S.pass.xp));
  if(r.passWinTier)rows+=li('pass',PASS_WIN_EVERY+' wins! +1 free Rumble Pass tier','Tier '+passTier(S.pass.xp));else if(w===0&&r.passXp)rows+=li('pass','Free tier progress · '+(S.pass.wins%PASS_WIN_EVERY)+' / '+PASS_WIN_EVERY+' wins','');
  if(r.drop&&r.drop!=='any')rows+='<li class="lucky-row" style="--r:'+RARITY[r.drop].col+'"><span class="drop-ico" data-r="'+r.drop+'"></span><span><b>Lucky drop!</b> Guaranteed '+dropName(r.drop)+' · '+S.dropDay.n+' of '+WIN_DROPS_PER_DAY+' today</span><b>'+S.drops.length+' ready</b></li>';
  else if(r.drop)rows+='<li><span class="drop-ico" data-r="rare"></span><span>Rare Rumble Drop (taps can upgrade it) · '+S.dropDay.n+' of '+WIN_DROPS_PER_DAY+' from wins today</span><b>'+S.drops.length+' ready</b></li>';
  if(r.dropCap)rows+=li('drop','No drop: you\u2019ve had all '+WIN_DROPS_PER_DAY+' win drops today','');
  if(r.prestige)rows+='<li><span class="badge" style="background:#ffc93c;border-radius:6px;padding:0 4px;color:#2b1a00;font-weight:900">★</span><span>'+b.name+' prestige +1</span><b>'+me.prestige+'</b></li>';
  for(const rw of r.road)rows+='<li>'+ICON.trophies+'<span>Trophy road: '+roadLabel(rw)+'</span><b></b></li>';
  if(r.rank!=null){const bb=r.rankBundle;rows+='<li>'+emblem(r.rank,24)+'<span>Reached '+rankInfo(r.rank*100).name+'!</span><b></b></li>';
    if(bb)rows+='<li>'+ICON.rp+'<span>Rank rewards: +'+fmtFull(bb.chromos)+' chromos, +'+bb.gems+' gems, +'+fmtFull(bb.coins)+' coins, +'+fmtFull(bb.pp)+' power points, '+bb.drops+' Rumble Drop'+(bb.drops===1?'':'s')+'</span><b></b></li>';
    if(r.master)rows+='<li>'+ICON.rp+'<span><b style="color:#ffd23f">MASTER!</b> the Grandmaster skin and the Master pin are yours</span><b></b></li>';
    if(r.rankWaiting)rows+='<li>'+ICON.rp+'<span>New rank rewards are waiting. <b>Claim them at the bottom of Ranked</b></span><b></b></li>';}
  if(r.prestigeReward){const pr=r.prestigeReward,tn=prestigeTier(pr.m);rows+='<li class="set-row" style="border-color:'+tn.col+'"'+(pr.pin?' data-pin="pr:'+pr.id+':'+pr.pin+'"':'')+'>'+(pr.pin?'<span class="set-pin"></span>':DI(pr.drops[0].r,30))+'<span><b style="color:'+tn.col+'">Prestige '+pr.m+'!</b> '+(pr.skin?esc(getSkin(b,pr.skin).name+' '+b.name)+' skin + pin, ':'')+'+'+fmtFull(pr.coins)+' coins, +'+fmtFull(pr.pp)+' PP, '+pr.drops.map(d=>d.n+' '+dropName(d.r)+(d.n>1?'s':'')).join(', ')+'</span><b></b></li>';}
  if(r.rankSets)for(const k of r.rankSets){const rs=RANK_SETS[k];rows+='<li class="set-row" data-pin="'+rs.pin+'"><span class="set-pin"></span><span>New rank set! '+esc(rs.skin.name)+' '+esc(BY_ID[rankSetRumbler(k,rankSeed(S))].name)+' skin + \u201cI reached '+rs.name+'\u201d pin</span><b></b></li>';}
  const sheet=$('#endSheet');
  const score=M.mode.sd?'<p class="end-score">'+P.kills+' knockout'+(P.kills===1?'':'s')+' · '+P.cubes+' cube'+(P.cubes===1?'':'s')+'</p>'+(w===0&&M.place>1?'<p class="end-top3">Top '+SD_WIN_PLACES+' finish · counts as a win</p>':''):M.mode.ffa?'<p class="end-score">You scored '+M.score[0]+'</p>':M.mode.id==='core'?'':'<p class="end-score"><span class="t-blue">'+M.score[0]+'</span> – <span class="t-red">'+M.score[1]+'</span></p>';
  const starLine=M.star?(M.star===P?'<p class="end-star me">★ You’re the Star Player!</p>':'<p class="end-star">★ Star Player: '+esc(M.star.name)+' · '+M.star.kills+' takedown'+(M.star.kills===1?'':'s')+'</p>'):'';
  sheet.innerHTML='<p class="small">'+esc(M.mode.name)+(M.ranked?' · Ranked':'')+'</p><p class="end-k '+cls+'">'+title+'</p>'+score+starLine+'<ul class="rewards">'+rows+'</ul><div class="row"><button class="btn primary" id="againBtn">Play again</button><button class="btn" id="homeBtn2">Home</button></div>';
  sheet.querySelectorAll('.drop-ico').forEach(el=>el.append(dropCanvas(el.dataset.r,30)));
  sheet.querySelectorAll('.set-row').forEach(li=>li.querySelector('.set-pin').append(pinCanvas('b:'+li.dataset.pin,30)));
  $('#endOv').hidden=false;
  $('#againBtn').addEventListener('click',()=>{$('#endOv').hidden=true;M=null;P=null;go('home');startMatchmaking(lastRanked);});
  $('#homeBtn2').addEventListener('click',()=>leaveMatch(true));
}

function untilMidnight(){const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const ms=m-n;return Math.floor(ms/3600000)+'h '+Math.floor(ms%3600000/60000)+'m';}
/* ---------- Rumble Pass ---------- */
function passClaimable(){let n=0;const t=passTier(S.pass.xp);for(let i=0;i<t;i++){if(!S.pass.cf.includes(i))n++;if(S.pass.premium&&!S.pass.cp.includes(i))n++;}return n+Math.max(0,bonusAvail(S.pass.xp)-S.pass.bonus);}
function passBadge(n,size){return '<svg viewBox="0 0 48 48" width="'+size+'" height="'+size+'" aria-hidden="true"><path d="'+starPath(24,24,23,18,10)+'" fill="#ffc93c" stroke="#120f26" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="24" r="13.5" fill="#1d1b52" stroke="#120f26" stroke-width="2.5"/><text x="24" y="29.5" text-anchor="middle" font-family="Bungee, Impact, sans-serif" font-size="'+(n>9?13:15)+'" fill="#ffd36b">'+n+'</text></svg>';}
const rwKey=rw=>Object.keys(rw)[0];
function rewardLabel(rw){const k=rwKey(rw),v=rw[k];
  if(k==='drop')return (rw.n>1?rw.n+' ':'')+dropName(v)+(rw.n>1?'s':'');if(k==='rumbler')return BY_ID[v].name+' · new rumbler';if(k==='skin')return 'Starfall '+BY_ID[v].name;if(k==='pin')return pinName(v)+' pin';return '+'+fmtFull(v)+' '+CUR_NAME[k];}
function rewardVisual(rw,size){const k=rwKey(rw),v=rw[k];
  if(k==='drop')return dropCanvas(v,size);if(k==='rumbler'){const b=BY_ID[v];return thumb(b,getSkin(b,'classic'),size);}if(k==='skin'){const b=BY_ID[v];return thumb(b,getSkin(b,'starfall'),size);}if(k==='pin')return pinCanvas('b:'+v,size);
  const sp=document.createElement('span');sp.className='rv-ico';sp.innerHTML=ICON[k];return sp;}
function giveReward(rw){const k=rwKey(rw),v=rw[k];if(k==='rumbler'){if(!grantRumbler(v))S.chromos+=5000;}else if(k==='drop'){for(let n=0;n<(rw.n||1);n++)S.drops.push({r:v,min:null});}else if(k==='skin')grantSkin(v,'starfall');else if(k==='pin'){if(!S.pins.includes(v))S.pins.push(v);}else S[k]+=v;}
function claimPass(i,prem,quiet){
  const list=prem?S.pass.cp:S.pass.cf;if(i>=passTier(S.pass.xp)||list.includes(i)||(prem&&!S.pass.premium))return false;
  const rw=(prem?PASS_PREM:PASS_FREE)[i];giveReward(rw);list.push(i);
  if(!quiet){persist();sfx('unlock');toast(rewardLabel(rw)+(rwKey(rw)==='drop'?' · open from the home screen':rwKey(rw)==='skin'?' · equip it from the rumbler sheet':rwKey(rw)==='rumbler'?' · find them on the Rumblers tab':''),'pass');renderPass();updateShopDot();}
  return true;}
function claimAll(){let n=0;for(let i=0;i<PASS_TIERS;i++){if(claimPass(i,false,true))n++;if(claimPass(i,true,true))n++;}
  const b=Math.max(0,bonusAvail(S.pass.xp)-S.pass.bonus);for(let k=0;k<b;k++)S.drops.push({r:null,min:null});S.pass.bonus+=b;n+=b;
  persist();if(n){sfx('unlock');toast(n+' reward'+(n>1?'s':'')+' claimed','pass');}renderPass();updateShopDot();}
function renderPass(scroll){
  const xp=S.pass.xp,tier=passTier(xp),done=tier>=PASS_TIERS,need=done?PASS_BONUS_STEP:PASS_STEP,into=done?(xp-PASS_TIERS*PASS_STEP)%PASS_BONUS_STEP:xp%PASS_STEP,ready=passClaimable(),zb=BY_ID.zenith;
  $('#passTokens').innerHTML=ICON.pass+'<span>'+fmtFull(xp)+' tokens</span>';
  const body=$('#passBody');body.innerHTML='';
  const hero=document.createElement('div');hero.className='pass-hero';
  hero.innerHTML='<div class="ph-top"><span class="ph-season">Season 1</span><h2>Starfall</h2><p class="hint">Every match earns pass tokens: 40 for a win, 25 for a draw, 15 for a loss, plus 5 per takedown.</p></div><div class="ph-art"></div>'+
    '<div class="ph-prog"><span class="ph-badge"><small>TIER</small><b>'+tier+'</b></span><span class="ph-barwrap"><span class="ph-bar"><i style="width:'+Math.round(into/need*100)+'%"></i></span><span class="ph-sub">'+(done?'Pass complete! '+into+' / '+need+' tokens to the next bonus drop':into+' / '+need+' tokens to tier '+(tier+1))+'</span></span></div><div class="ph-wins"><span>Every '+PASS_WIN_EVERY+' wins = 1 free tier</span><span class="pips" aria-label="'+(S.pass.wins%PASS_WIN_EVERY)+' of '+PASS_WIN_EVERY+' wins">'+Array.from({length:PASS_WIN_EVERY},(_,k)=>'<i'+(k<S.pass.wins%PASS_WIN_EVERY?' class="on"':'')+'></i>').join('')+'</span></div><div class="ph-btns"></div>';
  const art=hero.querySelector('.ph-art');const ob=BY_ID.orion;art.append(thumb(ob,getSkin(ob,'classic'),96));art.insertAdjacentHTML('beforeend','<small>Tier '+PASS_TIERS+' · Orion</small>');
  const btns=hero.querySelector('.ph-btns');
  if(!S.pass.premium){const b=document.createElement('button');b.className='btn gold';b.innerHTML='Unlock Rumble Pass · '+cost('gems',PASS_GEMS);
    b.addEventListener('click',()=>confirmBuy('Rumble Pass · Season 1',thumb(BY_ID.orion,getSkin(BY_ID.orion,'classic'),110),[['gems',PASS_GEMS]],()=>{S.pass.premium=true;persist();sfx('unlock');toast('Rumble Pass unlocked! Claim your rewards.','pass');renderPass();updateShopDot();}));btns.append(b);}
  else btns.insertAdjacentHTML('beforeend','<span class="tag on" style="align-self:center;padding:6px 10px">Rumble Pass unlocked</span>');
  if(ready){const b=document.createElement('button');b.className='btn green';b.textContent='Claim all ('+ready+')';b.addEventListener('click',claimAll);btns.append(b);}
  body.append(hero);
  body.insertAdjacentHTML('beforeend','<div class="track-head"><span>Free</span><span></span><span>Rumble Pass</span></div>');
  const tr=document.createElement('div');tr.className='ptrack';
  for(let i=0;i<PASS_TIERS;i++){
    const row=document.createElement('div');row.className='prow'+(i<tier?' reached':'')+(i===tier?' cur':'');row.dataset.t=i;
    const cell=prem=>{const rw=(prem?PASS_PREM:PASS_FREE)[i],got=(prem?S.pass.cp:S.pass.cf).includes(i),plock=prem&&!S.pass.premium,lock=i>=tier,ok=!got&&!lock&&!plock;
      const b=document.createElement('button');b.className='pcell'+(prem?' prem':'')+(i===PASS_TIERS-1?' final':'')+(got?' got':ok?' ready':' lock');
      {const k=rwKey(rw),v=rw[k],rc=k==='drop'?RARITY[v].col:k==='rumbler'?RARITY[BY_ID[v].rarity].col:k==='skin'?'#ffd36b':k==='pin'?'#5ec8ff':{coins:'#ffc93c',gems:'#6be39a',pp:'#c79bff',chromos:'#46b4ff'}[k]||'#9d7bff';b.style.setProperty('--rc',rc);if(k==='drop'&&v==='ultra')b.classList.add('rc-rainbow');if(k==='drop'&&v==='season')b.classList.add('rc-galaxy');}
      b.append(rewardVisual(rw,48));b.insertAdjacentHTML('beforeend','<span class="pl">'+esc(rewardLabel(rw))+'</span>'+(got?'<span class="chk">✓</span>':ok?'<span class="ctag">Claim</span>':plock?LOCK_SVG.replace('class="lock"','class="plk"'):''));
      b.setAttribute('aria-label','Tier '+(i+1)+(prem?' Rumble Pass':' free')+' reward: '+rewardLabel(rw)+(got?', claimed':ok?', ready to claim':', locked'));
      b.addEventListener('click',()=>{if(ok)claimPass(i,prem);else if(got)return;else if(lock)toast('Reach tier '+(i+1)+' to claim this','pass');else toast('Unlock the Rumble Pass to claim this','pass');});
      return b;};
    row.append(cell(false));row.insertAdjacentHTML('beforeend','<span class="tnum">'+(i+1)+'</span>');row.append(cell(true));tr.append(row);}
  body.append(tr);
  const bonus=document.createElement('div');bonus.className='panel';bonus.style.cssText='flex-direction:row;align-items:center;gap:12px';
  bonus.append(dropCanvas('rare',52));bonus.insertAdjacentHTML('beforeend','<div style="min-width:0"><h2>Bonus drops</h2><p class="hint" style="margin:0">After tier '+PASS_TIERS+', every '+PASS_BONUS_STEP+' tokens earns another Rumble Drop. Claimed so far: '+S.pass.bonus+'.</p></div>');
  body.append(bonus);
  if(scroll)requestAnimationFrame(()=>{const sc=$('#pass'),r=tr.querySelector('[data-t="'+Math.max(0,Math.min(PASS_TIERS-1,tier-1))+'"]');if(sc&&r&&r.getBoundingClientRect)sc.scrollTop+=r.getBoundingClientRect().top-sc.getBoundingClientRect().top-sc.clientHeight*.35;});
}

/* ---------- Rumble Drops ---------- */
const dropOv=$('#dropOv'),dropCv=$('#dropCv'),dctx=dropCv.getContext('2d');
let DA=null,DW=1,DH=1,Dd=1;
function sizeDrop(){const r=dropOv.getBoundingClientRect();DW=Math.max(1,r.width);DH=Math.max(1,r.height);Dd=Math.min(2,window.devicePixelRatio||1);dropCv.width=Math.round(DW*Dd);dropCv.height=Math.round(DH*Dd);}
function openDrops(){if(!S.drops.length){toast('No Rumble Drops yet. Win matches to earn them.','drop');return;}audio();closeSheet();dropOv.hidden=false;sizeDrop();nextDrop();}
function closeDrops(){dropOv.hidden=true;DA=null;if(view==='home')renderHome();else if(view==='pass')renderPass();else if(view==='rumblers')renderRumblers();updateShopDot();}
function setDropUi(kicker,title,col){$('#dropKicker').textContent=kicker;const t=$('#dropTitle');t.textContent=title;t.style.color=col||'';t.classList.toggle('rainbow-text',col===RARITY.ultra.col);t.classList.toggle('galaxy-text',col===RARITY.season.col);}
function remainingDrops(){return S.drops.length+(DA&&DA.res&&DA.phase!=='shown'?1:0);}
function dropBtns(){const p=DA&&DA.phase,nx=$('#dropNext');nx.disabled=!(p==='idle'||p==='shown')||(p==='idle'&&DA.lock>0);nx.textContent=p==='shown'?(DA.res&&DA.res.kind==='box'&&DA.res.idx<DA.res.items.length-1?'Next reward':S.drops.length?'Next drop':'Done'):'Tap';$('#dropAll').hidden=!(remainingDrops()>1&&(p==='idle'||p==='shown'));}
function nextDrop(){
  if(DA&&DA.phase==='shown'&&DA.res&&DA.res.kind==='box'&&DA.res.idx<DA.res.items.length-1){DA.res.idx++;burstParts(DA.col,30,360,DW/2,DA.py);sfx('pin');revealDrop();dropBtns();return;}
  if(!S.drops.length){closeDrops();return;}
  const d=S.drops[0],st=d.r||d.min||'rare',ci=Math.max(0,DROP_RAR.indexOf(st));
  DA={phase:'fall',t:0,py:DH*.4,col:RARITY[st].col,cur:ci,res:null,parts:[],open:0,shake:0,rays:0,lock:0,ups:0,season:isSpecialDrop(st),r:st};
  const el=$('#dropReward');el.hidden=true;el.innerHTML='';
  {let q=$('#dropQueue');if(!q){q=document.createElement('div');q.id='dropQueue';q.className='dropqueue';$('.drop-head').append(q);}q.innerHTML='';S.drops.slice(0,10).forEach((x,k)=>{const r2=isSpecialDrop(x.r)?x.r:(x.r||x.min||'rare');const cv=dropCanvas(r2,k?28:38);if(!k)cv.classList.add('cur');q.append(cv);});if(S.drops.length>10)q.insertAdjacentHTML('beforeend','<small>+'+(S.drops.length-10)+'</small>');}
  setDropUi(d.g?'Lucky win drop · guaranteed '+RARITY[st].name+'!':S.drops.length+' to open',dropName(st),RARITY[st].col);dropBtns();
}
function burstParts(col,n,sp,x,y){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(sp*.3,sp);DA.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,T:rand(.5,1.1),s:rand(3,7),col});}if(DA.parts.length>400)DA.parts.splice(0,DA.parts.length-400);}
/* Each tap either upgrades the drop one rarity step or, when it can't, opens it */
function dropTap(){
  if(!DA)return;
  if(DA.phase==='shown'){nextDrop();return;}
  if(DA.phase!=='idle'||DA.lock>0)return;
  if(!DA.res)DA.res=openDrop(S.drops.shift());
  const tgt=DROP_RAR.indexOf(DA.res.rar);
  if(DA.cur<tgt){DA.cur++;DA.ups++;const r=DROP_RAR[DA.cur],col=RARITY[r].col;DA.col=col;DA.shake=1.3;DA.lock=.4;
    burstParts(col,26,340,DW/2,DA.py);burstParts('#ffffff',10,240,DW/2,DA.py);tone('triangle',440+DA.cur*160,720+DA.cur*210,.2,.08);tone('sine',880+DA.cur*200,880+DA.cur*200,.12,.04,.08);
    setDropUi('Upgraded! Tap again',dropName(r),col);}
  else{DA.phase='burst';DA.t=0;burstParts(DA.col,46,440,DW/2,DA.py);burstParts('#ffffff',18,320,DW/2,DA.py);sfx('boom');}
  dropBtns();
}
function revealDrop(){
  if(DA.res&&DA.res.kind==='box'){const bx=DA.res,it=bx.items[bx.idx],el=$('#dropReward');el.innerHTML='';renderDropItem(el,it);
    const tot={coins:0,pp:0,gems:0,chromos:0};let rum=0,sk=0;for(let i=0;i<=bx.idx;i++){const x=bx.items[i];if(x.kind==='rumbler')rum++;else if(x.kind==='skin')sk++;else if(tot[x.kind]!=null)tot[x.kind]+=x.n;}
    let h='<div class="box-count"><small>Reward '+(bx.idx+1)+' of '+bx.items.length+'</small><div>';for(const k in tot)h+='<span class="bc'+(tot[k]?' on':'')+'">'+ICON[k]+fmtFull(tot[k])+'</span>';
    if(bx.rar==='rbox')h+='<span class="bc'+(rum?' on':'')+'">'+ICON.chromos+rum+' rumbler</span>';else h+='<span class="bc'+(sk?' on':'')+'">'+ICON.gems+sk+' / 2 skins</span>';
    el.insertAdjacentHTML('beforeend',h+'</div></div>');el.hidden=false;
    setDropUi(dropName(bx.rar)+(bx.idx<bx.items.length-1?' \u00b7 tap for more':' \u00b7 all done'),it.kind==='rumbler'?'New rumbler!':it.kind==='skin'?'New skin!':'Nice!',RARITY[bx.rar].col);return;}
  const res=DA.res,el=$('#dropReward');el.innerHTML='';renderDropItem(el,res);
  el.hidden=false;setDropUi(dropName(res.rar),res.kind==='rumbler'?'Jackpot!':res.kind==='skin'?'Fresh look!':res.kind==='pin'?'New pin!':'Nice!',RARITY[res.rar].col);}
function renderDropItem(el,res){
  if(res.kind==='icon'){el.insertAdjacentHTML('beforeend','<p class="drop-new">New profile icon!</p>');el.append(iconCanvas('x:'+res.icon,120));el.insertAdjacentHTML('beforeend','<p>Pick it from your profile (tap your icon next to your name).</p>');sfx('unlock');return;}
  if(res.kind==='rumbler'){const b=BY_ID[res.id],r=RARITY[b.rarity];el.insertAdjacentHTML('beforeend','<p class="drop-new">New rumbler!</p>');el.append(thumb(b,getSkin(b,'classic'),140));
    el.insertAdjacentHTML('beforeend','<span class="rpill'+rpc(b.rarity)+'" style="--r:'+r.col+'">'+r.name+'</span><span class="big">'+esc(b.name)+'</span><p>'+esc(b.role)+'. Find them on the Rumblers tab.</p>');}
  else if(res.kind==='skin'){const b=BY_ID[res.id],sk=getSkin(b,res.skid);el.insertAdjacentHTML('beforeend','<p class="drop-new">New skin!</p>');el.append(thumb(b,sk,130));
    el.insertAdjacentHTML('beforeend','<span class="big" style="font-size:28px">'+esc(sk.name)+'</span><p>For '+esc(b.name)+'. Equip it from the rumbler sheet.</p>');}
  else if(res.kind==='pin'){el.insertAdjacentHTML('beforeend','<p class="drop-new">New pin!</p>');el.append(pinCanvas('b:'+res.pin,120));el.insertAdjacentHTML('beforeend','<span class="big" style="font-size:28px">'+esc(pinName(res.pin))+'</span><p>Add it to a rumbler\u2019s pin slots.</p>');}
  else if(res.kind==='pass')el.insertAdjacentHTML('beforeend','<span class="rv-ico">'+ICON.pass+'</span><span class="big">+'+fmtFull(res.n)+'</span><p>Rumble Pass tokens</p>');
  else el.insertAdjacentHTML('beforeend','<span class="rv-ico">'+ICON[res.kind]+'</span><span class="big">+'+fmtFull(res.n)+'</span><p>'+CUR_NAME[res.kind]+(res.note?'. '+esc(res.note)+'.':'')+'</p>');
  sfx(res.kind==='rumbler'||res.kind==='skin'||res.kind==='pin'?'unlock':'buy');
}
function openAll(){
  if(!DA||!(DA.phase==='idle'||DA.phase==='shown'))return;
  const tot={coins:0,pp:0,chromos:0,gems:0,pass:0},items=[];let best=0,n=0,sea=false;
  while(S.drops.length){const res=openDrop(S.drops.shift());n++;if(isSpecialDrop(res.rar))sea=res.rar;else best=Math.max(best,DROP_RAR.indexOf(res.rar));for(const it of res.kind==='box'?res.items:[res]){if(it.kind==='rumbler'||it.kind==='skin'||it.kind==='pin')items.push(it);else tot[it.kind]=(tot[it.kind]||0)+it.n;}}
  DA.phase='shown';DA.t=0;DA.open=1;DA.col=sea?RARITY[sea].col:RARITY[DROP_RAR[best]].col;burstParts(DA.col,50,420,DW/2,DA.py);burstParts('#ffffff',20,300,DW/2,DA.py);
  let h='<ul class="drop-sum">';for(const k of['coins','pp','chromos','gems','pass'])if(tot[k])h+='<li>'+ICON[k]+'<span>+'+fmtFull(tot[k])+' '+(k==='pass'?'pass tokens':CUR_NAME[k])+'</span></li>';
  for(const it of items){if(it.kind==='pin'){h+='<li>'+ICON.gems+'<span>New pin: '+esc(pinName(it.pin))+'</span></li>';continue;}const b=BY_ID[it.id];h+='<li>'+(it.kind==='rumbler'?ICON.chromos:ICON.gems)+'<span>'+(it.kind==='rumbler'?'New rumbler: <b>'+esc(b.name)+'</b>':'New skin: '+esc(getSkin(b,it.skid).name)+' '+esc(b.name))+'</span></li>';}
  h+='</ul>';const el=$('#dropReward');el.innerHTML=h;el.hidden=false;
  setDropUi(n+' drops opened',items.some(i=>i.kind==='rumbler')?'Jackpot!':'What a haul!',DA.col);sfx(items.length?'unlock':'buy');dropBtns();
}
function showOdds(){openSheet(card=>{
  const lootName=e=>e[0]==='rumbler'?'A new '+e[2].map(x=>RARITY[x].name).join(' or ')+' rumbler':e[0]==='skin'?'A skin for a rumbler you own':fmtFull(e[2][0])+'–'+fmtFull(e[2][1])+' '+CUR_NAME[e[0]];
  let h='<h2>Rumble Drop odds</h2><p class="sub">Most drops from wins start at Rare, but some are lucky drops with a guaranteed rarity. Pass drops start at their guaranteed rarity. Every tap has a chance to upgrade the drop one step, all the way to Amazing. You can earn '+WIN_DROPS_PER_DAY+' drops from wins each day.</p><div class="sec-title"><h2>Upgrade chance per tap</h2></div><table class="odds">';
  for(let i=0;i<DROP_UP.length;i++)h+='<tr><td>'+RARITY[DROP_RAR[i]].name+' → '+RARITY[DROP_RAR[i+1]].name+'</td><td>'+(Math.round(DROP_UP[i]*1000)/10)+'%</td></tr>';
  h+='</table><div class="sec-title"><h2>Lucky win drops</h2></div><table class="odds">';for(const[r,pc]of WIN_DROP_LUCKY)h+='<tr><td>Guaranteed <span class="rpill'+rpc(r)+'" style="--r:'+RARITY[r].col+'">'+RARITY[r].name+'</span></td><td>'+pc+'%</td></tr>';
  h+='<tr><td>Normal drop (starts at Rare)</td><td>'+(Math.round((100-WIN_DROP_LUCKY.reduce((n,e)=>n+e[1],0))*10)/10)+'%</td></tr>';
  h+='</table><div class="sec-title"><h2>Final rarity of a drop that starts at Rare</h2></div><table class="odds">';
  DROP_RAR.forEach((r,i)=>{h+='<tr><td><span class="rpill'+rpc(r)+'" style="--r:'+RARITY[r].col+'">'+RARITY[r].name+'</span></td><td>'+DROP_ODDS[i]+'%</td></tr>';});h+='</table>';
  for(const r of DROP_RAR){const L=DROP_LOOT[r],tot=L.reduce((n,e)=>n+e[1],0);h+='<div class="sec-title"><h2>'+RARITY[r].name+' Drop</h2></div><table class="odds">';for(const e of L)h+='<tr><td>'+lootName(e)+'</td><td>'+(Math.round(e[1]/tot*1000)/10)+'%</td></tr>';h+='</table>';}
  {const tot=SEASON_LOOT.reduce((n,e)=>n+e[1],0),nm={skin:'A Starfall skin',pin:'A Starfall pin',pass:'Rumble Pass tokens'};h+='<div class="sec-title"><h2 class="galaxy-text">Starfall Drop</h2><span>Seasonal · better than Amazing · no rumblers</span></div><table class="odds">';
   for(const e of SEASON_LOOT)h+='<tr><td>'+(nm[e[0]]||CUR_NAME[e[0]])+(e[2]?' ('+fmtFull(e[2][0])+'\u2013'+fmtFull(e[2][1])+')':'')+'</td><td>'+(Math.round(e[1]/tot*1000)/10)+'%</td></tr>';h+='</table>';}
  h+='<p class="hint">If you already own every rumbler a drop could give, you get chromos instead.</p>';
  card.insertAdjacentHTML('beforeend',h);const x=document.createElement('button');x.className='btn';x.textContent='Close';x.addEventListener('click',closeSheet);card.append(x);});}
function drawDropScene(dt){
  if(!DA||dropOv.hidden)return;
  const c=dctx;DA.t+=dt;c.setTransform(Dd,0,0,Dd,0,0);
  const cx=DW/2,R=Math.min(DW*.17,DH*.11),T=DA.t,now=performance.now()/1000;
  const target=DH*(DA.phase==='shown'?.27:.4);if(DA.phase!=='fall')DA.py+=(target-DA.py)*Math.min(1,dt*6);
  const bg=c.createRadialGradient(cx,DA.py,10,cx,DA.py,Math.max(DW,DH)*.8);bg.addColorStop(0,'#2c2672');bg.addColorStop(1,'#0b0820');c.fillStyle=bg;c.fillRect(0,0,DW,DH);
  c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<40;i++){const x=(i*97.3)%DW,y=(i*61.7)%DH,k=.5+.5*Math.sin(now*2+i);c.globalAlpha=.25+.5*k;c.fillRect(x,y,1.6,1.6);}c.globalAlpha=1;
  if(DA.ups>0||DA.phase==='burst'||DA.phase==='shown')DA.rays=Math.min(1,DA.rays+dt*2);
  if(DA.lock>0){DA.lock=Math.max(0,DA.lock-dt);if(DA.lock===0)dropBtns();}
  if(DA.rays>0){const L=Math.max(DW,DH);c.save();c.translate(cx,DA.py);c.rotate(now*.25);c.globalCompositeOperation='lighter';c.globalAlpha=.14*DA.rays;c.fillStyle=DA.col;for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(0,0);c.lineTo(-L*.08,-L);c.lineTo(L*.08,-L);c.closePath();c.fill();}c.restore();}
  if(DA.phase==='fall'){const k=Math.min(1,T/.55);DA.py=-R*2+(DH*.4+R*2)*k*k;if(k>=1){DA.phase='idle';DA.t=0;DA.shake=1;burstParts('#ffffff',16,300,cx,DA.py+R);sfx('thud');
      if(DA.season)setDropUi(RARITY[DA.r]&&RARITY[DA.r].box?'Tap to open the box':SPOOKY.includes(DA.r)?'Halloween drop \u00b7 tap to open':'Seasonal drop \u00b7 tap to open',dropName(DA.r),DA.col);else setDropUi('Tap! It might upgrade',dropName(DROP_RAR[DA.cur]),DA.col);dropBtns();}}
  else if(DA.phase==='burst'){DA.open=Math.min(1,T/.35);if(T>=.5){DA.phase='shown';DA.t=0;revealDrop();dropBtns();}}
  DA.shake=Math.max(0,DA.shake-dt*4);
  const bob=DA.phase==='idle'?Math.sin(T*3)*6:0,shx=DA.shake?rand(-7,7)*DA.shake:0;
  c.save();if(DA.phase==='shown')c.globalAlpha=Math.max(.35,1-T*1.2);drawDropPod(c,cx+shx,DA.py+bob,R*(1+DA.cur*.07),DA.col,now,DA.open);c.restore();
  if(DA.phase==='burst'){c.save();c.globalCompositeOperation='lighter';glow(c,cx,DA.py,R*7*Math.min(1,T*3),'#ffffff',Math.max(0,1-T*2));c.restore();}
  if(DA.phase==='shown'&&Math.random()<dt*24)DA.parts.push({x:rand(0,DW),y:-10,vx:rand(-20,20),vy:rand(80,200),t:0,T:2.4,s:rand(2,4),col:DA.col});
  c.save();c.globalCompositeOperation='lighter';
  for(let i=DA.parts.length-1;i>=0;i--){const p=DA.parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;p.vx*=1-dt*1.5;if(p.t>=p.T){DA.parts.splice(i,1);continue;}glow(c,p.x,p.y,p.s*3,p.col,1-p.t/p.T);}
  c.restore();
}
const dropAdvance=dropTap;
dropCv.addEventListener('click',dropAdvance);
$('#dropNext').addEventListener('click',dropAdvance);
$('#dropAll').addEventListener('click',openAll);
$('#dropClose').addEventListener('click',closeDrops);
$('#dropOdds').addEventListener('click',showOdds);

/* ---------- Welcome & tutorial ---------- */
const SVG_MOVE='<svg viewBox="0 0 220 120" width="220" height="120" aria-hidden="true"><rect x="4" y="4" width="212" height="112" rx="18" fill="#1d1846" stroke="#120f26" stroke-width="4"/><circle cx="56" cy="76" r="27" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.6)" stroke-width="3"/><circle cx="66" cy="68" r="12" fill="#fff"/><path d="M56 76l12-10" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-dasharray="3 4"/><circle cx="164" cy="76" r="27" fill="rgba(255,201,60,.2)" stroke="#ffc93c" stroke-width="3"/><circle cx="164" cy="76" r="13" fill="#ffc93c" stroke="#120f26" stroke-width="3"/><text x="56" y="32" text-anchor="middle" fill="#d6d0ff" font-family="Rubik,sans-serif" font-size="12" font-weight="800" letter-spacing="1">MOVE</text><text x="164" y="32" text-anchor="middle" fill="#ffd36b" font-family="Rubik,sans-serif" font-size="12" font-weight="800" letter-spacing="1">ATTACK</text></svg>';
const SVG_SUPER='<svg viewBox="0 0 140 140" width="130" height="130" aria-hidden="true"><circle cx="70" cy="70" r="62" fill="rgba(255,201,60,.16)"/><circle cx="70" cy="70" r="54" fill="none" stroke="#ffc93c" stroke-width="6" stroke-dasharray="10 8"/><circle cx="70" cy="70" r="44" fill="#ffc93c" stroke="#120f26" stroke-width="5"/><path d="M70 42l8 17 18 2-13 13 4 18-17-9-17 9 4-18-13-13 18-2z" fill="#120f26"/></svg>';
const ONB=[
  {t:'Hello, welcome to Rooftop Rumble!',d:'A 3v3 brawler fought across the city rooftops. Here’s a quick tour before your first match.',art:()=>{const w=document.createElement('div');w.append(thumb(BY_ID.ember,getSkin(BY_ID.ember,'classic'),150));return w;}},
  {t:'Move and attack',d:'Drag on the left side of the screen to move. Tap the yellow stick to auto-aim at the closest enemy, or drag it to aim yourself. On a computer, use WASD and click.',art:()=>{const w=document.createElement('div');w.innerHTML=SVG_MOVE;return w;}},
  {t:'Charge your super',d:'Hitting enemies fills your super. When the star button glows, tap it or drag it to aim. Gadgets get their own green button once you unlock them.',art:()=>{const w=document.createElement('div');w.innerHTML=SVG_SUPER;return w;}},
  {t:'Pick a mode',d:'Choose a mode on the home screen, like Showdown, Ring Rumble or Battery Run. Showdown comes in solo, duo and trio. Ranked unlocks once you own 3 rumblers.',art:()=>{const w=document.createElement('div');w.className='onb-art';for(const id of['ring','battery','showdown'])w.insertAdjacentHTML('beforeend','<span class="mico" style="--mc:'+MODE_BY[id].col+'">'+MODE_ICON[id]+'</span>');return w;}},
  {t:'Collect rumblers',d:'You start with Ember. Every takedown earns chromos to unlock more rumblers, and coins with power points level them up.',art:()=>{const w=document.createElement('div');w.className='onb-art';for(const id of['ember','lilt','zenith'])w.append(thumb(BY_ID[id],getSkin(BY_ID[id],'classic'),88));return w;}},
  {t:'Drops and the Rumble Pass',d:'Win matches to earn up to 5 Rumble Drops a day. Tap to open them, and every tap might upgrade the drop! Every match also fills your Rumble Pass.',art:()=>{const w=document.createElement('div');w.className='onb-art';w.append(dropCanvas('rare',70));w.insertAdjacentHTML('beforeend','<span class="onb-arrow">›</span>');w.append(dropCanvas('epic',84));w.insertAdjacentHTML('beforeend','<span class="onb-arrow">›</span>');w.append(dropCanvas('legendary',100));return w;}},
];
let onbStep=0,onbReplay=false;
/* Age step: decides chat. Under 7 = pins only. 7 and up = pins + quick chat phrases. Nobody can type free messages to other players. */
function ageStep(card,done){card.innerHTML='';let age=10;
  card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">How old are you?</h2><p>This sets up chat so it\u2019s right for you. It stays on this device.</p><div class="age-box"><b id="ageVal">10</b><input type="range" id="ageRange" min="4" max="18" value="10" aria-label="Your age"><div class="age-ends"><span>4</span><span>18+</span></div></div><p class="hint" id="ageInfo"></p>');
  const info=card.querySelector('#ageInfo'),upd=()=>{card.querySelector('#ageVal').textContent=age>=18?'18+':age;info.textContent=age<7?'You can send pins in matches.':'You can send pins and quick-chat phrases like \u201cNice shot!\u201d. Nobody can type messages to other players.';};upd();
  card.querySelector('#ageRange').addEventListener('input',e=>{age=+e.target.value;upd();});
  const b=document.createElement('button');b.className='btn primary';b.textContent='Let\u2019s rumble!';b.addEventListener('click',()=>{S.ageBand=age<7?'u7':age<15?'kid':'teen';persist();done();});card.append(b);}
function askAgeIfNeeded(){if(!S.onboarded||S.ageBand)return;$('#onb').hidden=false;ageStep($('#onbCard'),()=>{$('#onb').hidden=true;toast('All set!');});}
function openOnboarding(replay){onbReplay=!!replay;onbStep=0;closeSheet();$('#onb').hidden=false;renderOnb();}
function renderOnb(){
  const card=$('#onbCard');card.innerHTML='';const total=ONB.length+(onbReplay?0:1);
  const dots='<div class="onb-dots" aria-hidden="true">'+Array.from({length:total},(_,k)=>'<i'+(k===onbStep?' class="on"':'')+'></i>').join('')+'</div>';
  if(onbStep<ONB.length){const st=ONB[onbStep],art=st.art();art.classList.add('onb-art');card.append(art);
    card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">'+esc(st.t)+'</h2><p>'+esc(st.d)+'</p>'+dots);
    const row=document.createElement('div');row.className='onb-btns';
    if(onbStep>0){const b=document.createElement('button');b.className='btn';b.textContent='Back';b.addEventListener('click',()=>{onbStep--;sfx('click');renderOnb();});row.append(b);}
    const n=document.createElement('button');n.className='btn primary';const last=onbStep===ONB.length-1;n.textContent=last?(onbReplay?'Done':'Pick my name'):onbStep===0?'Show me':'Next';
    n.addEventListener('click',()=>{audio();sfx('click');if(last&&onbReplay){$('#onb').hidden=true;return;}onbStep++;renderOnb();});row.append(n);card.append(row);
    if(onbStep===0&&!onbReplay){const lc=document.createElement('button');lc.className='linkish';lc.textContent='Have a save code? Load your progress';lc.addEventListener('click',()=>{const c2=$('#onbCard');c2.innerHTML='<h2 id="onbTitle">Load your save code</h2><p>Paste the code you copied from Settings in an older version.</p>';
      const ta=document.createElement('textarea');ta.className='codebox';ta.rows=4;ta.placeholder='Paste your save code here';const msg=document.createElement('p');msg.className='hint';const go2=document.createElement('button');go2.className='btn primary';go2.textContent='Load my progress';
      go2.addEventListener('click',()=>{if(applySaveCode(ta.value,msg,null))$('#onb').hidden=true;});const back=document.createElement('button');back.className='linkish';back.textContent='Back';back.addEventListener('click',()=>{onbStep=0;renderOnb();});c2.append(ta,msg,go2,back);});card.append(lc);}
    if(!last){const sk=document.createElement('button');sk.className='linkish';sk.textContent=onbReplay?'Close':'Skip the tour';sk.addEventListener('click',()=>{if(onbReplay){$('#onb').hidden=true;return;}onbStep=ONB.length;renderOnb();});card.append(sk);}
    return;}
  card.insertAdjacentHTML('beforeend','<h2 id="onbTitle">Pick your name</h2><p>This is the name other players see above your rumbler. Type it twice to make sure it’s right. Changing it later costs gems.</p>'+dots);
  nameForm(card,'Next','primary',nm=>{S.name=nm;persist();sfx('click');ageStep(card,()=>{S.onboarded=true;persist();$('#onb').hidden=true;sfx('unlock');toast('Welcome to the rooftops, '+esc(nm)+'!');if(view==='home')renderHome();else if(view==='settings')renderSettings();});});
}

/* ---------- Loop ---------- */
let lastTs=0,loopErr=false,dayCheckT=0;
function fillDropMinis(){document.querySelectorAll('.dropmini:empty').forEach(el=>el.append(dropCanvas(el.dataset.r,+el.dataset.s||22)));}
if(typeof MutationObserver!=='undefined'){let mq=false;new MutationObserver(()=>{if(mq)return;mq=true;Promise.resolve().then(()=>{mq=false;fillDropMinis();});}).observe(document.body,{childList:true,subtree:true});}
/* Keeps daily things daily even if the app stays open past midnight */
function dayCheck(){
  if(S.daily.date!==todayKey()){ensureDaily();updateShopDot();if(view==='shop')renderShop();else if(view==='home')renderHome();}
  else if(view==='shop'){const cd=document.querySelector('.of-cd');if(cd)cd.textContent=untilMidnight();}
}
function frame(ts){
  requestAnimationFrame(frame);
  try{musicTick();}catch(e){}
  if(view!=='game'&&ts-(frame.pinT||0)>45){frame.pinT=ts;try{animPins();}catch(e){}}
  if(ts-dayCheckT>5000){dayCheckT=ts;try{if(view!=='game')dayCheck();}catch(e){}}
  const dt=Math.min(.05,lastTs?(ts-lastTs)/1000:.016);lastTs=ts;
  try{
    if(view==='game'&&M){
      if(!paused){
        if(P&&!P.dead){
          if(ctl.sup&&ctl.sup.drag)P.aim=Math.atan2(ctl.sup.y-ctl.sup.sy,ctl.sup.x-ctl.sup.sx)-WA;
          else if(ctl.atk&&ctl.atk.drag)P.aim=Math.atan2(ctl.atk.y-ctl.atk.sy,ctl.atk.x-ctl.atk.sx)-WA;
          else if(mouseMode&&mouse.has){const[wx,wy]=toWorld(mouse.x,mouse.y);P.aim=Math.atan2(wy-P.y,wx-P.x);}
        }
        if(NETC)netClientUpdate(dt);else update(dt);camera(dt);syncHud();
      }else if(NETC){netClientUpdate(dt);camera(dt);syncHud();}
      render();
    }else if(view==='home')drawPreview(ts/1000);
    if(DA)drawDropScene(dt);
  }catch(err){if(!loopErr){loopErr=true;console.error(err);toast('Something went wrong: '+esc(err.message||err));setTimeout(()=>{loopErr=false;},4000);}}
}
window.addEventListener('resize',()=>{if(view==='game')resize();if(!dropOv.hidden)sizeDrop();});
go('home');
if(!S.onboarded)openOnboarding();else askAgeIfNeeded();
requestAnimationFrame(frame);
})();
