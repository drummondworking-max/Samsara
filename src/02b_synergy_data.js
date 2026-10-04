/* ================= skill layout & synergies =================
   Every class has three columns:
     - two ACTIVE trees (arts that cast themselves), unlocked by tier and chained one after another
     - one PASSIVE tree ("Inner Practice"): always-on boons, unlocked by level only
   Three kinds of synergy turn leveled skills into new attacks, in the spirit of Vampire Survivors:
     EVOLUTION  an active art at level 8+ together with its matching passive at level 4+ transforms into a new, stronger art
     UNION      two equipped active arts, each at level 5+, grant each other a unique extra attack
     HARMONY    two passives, each at level 5+, grant a bonus together
   Effective levels (including item bonuses) are used throughout. */
const TIER_REQ = [1, 5, 10, 16, 22, 28];
const PASS_REQ = [1, 5, 10, 16, 22];
const EVO_LV = 8, EVO_PLV = 4, UNION_LV = 5, HARM_LV = 5;
const PASSIVE_TREE = 2;
function tierReq(s) { return s.tree === PASSIVE_TREE ? PASS_REQ[s.tier] : TIER_REQ[s.tier]; }

/* ---------- layout: [tree 0 actives, tree 1 actives, passives] ---------- */
const LAYOUT = {
  vajra: [
    ['vajra_strike', 'charged_vajra', 'thunder_palm', 'indras_net', 'vajrapani'],
    ['burning_palm', 'wheel_of_flames', 'fierce_roar', 'adamantine', 'wrathful_form'],
    ['iron_shirt', 'stillness', 'mahakala_stance', 'diamond_aura', 'unshakable']],
  sage: [
    ['prajna_bolt', 'wisdom_blades', 'cutting_through', 'frost_stillness', 'manjushri_blade'],
    ['void_orb', 'homa_flame', 'gravity_well', 'homa_meteor', 'kalachakra', 'great_emptiness'],
    ['heart_sutra', 'clear_light', 'form_emptiness', 'mandala_circle', 'tummo']],
  archer: [
    ['true_arrow', 'fanning_arrows', 'mind_arrow', 'prayer_wheel', 'thousand_arrows'],
    ['fire_arrow', 'frost_arrow', 'thunder_arrow', 'whirling_leaves', 'lotus_mines', 'five_wisdoms'],
    ['swift_steps', 'piercing_mind', 'mindfulness', 'breath_of_bow', 'elemental_mastery']],
  chod: [
    ['bone_shard', 'skull_ring', 'charnel_burst', 'kangling', 'feed_demons', 'red_feast'],
    ['kartika', 'whirling_knives', 'severing_cry', 'summon_dakini', 'citipati', 'sky_dancer'],
    ['death_meditation', 'body_offering', 'dakini_step', 'dwelling', 'fearless_heart']]
};
CLASSES.vajra.trees = ['Thunderbolt', 'Wrathful Deity', 'Diamond Body'];
CLASSES.sage.trees = ['Sword of Wisdom', 'Emptiness and Flame', 'Inner Light'];
CLASSES.archer.trees = ['Zen Archery', 'Five Elements', 'Walking Meditation'];
CLASSES.chod.trees = ['Charnel Ground', 'Dakini Dance', 'Inner Practice'];

/* ---------- new and converted passives ---------- */
(function () {
  const add = o => { SKILL_LIST.push(o); SKILLS[o.id] = o; };
  const conv = (id, desc, mods) => { const s = SKILLS[id]; s.type = 'passive'; s.desc = desc; if (mods) s.mods = mods; delete s.cost; delete s.cd; delete s.dmg; delete s.p; delete s.syn; delete s.elem; delete s.stat; };
  conv('diamond_aura', 'A field of diamond hardness guards your body, and those who strike you are wounded in turn.');
  conv('mandala_circle', 'The sacred mandala turns within you. Your fire burns hotter, and your every spell reaches a little further.', l => ({ el_fire: 8 + 4 * l, area: Math.min(30, 2 + 1.2 * l) }));
  add({ id: 'clear_light', cls: 'sage', tree: 2, tier: 1, name: 'Clear Light', type: 'passive', icon: ['lotus', '#fff2c8'], desc: 'The luminous nature of mind shines through every spell and every blade.', mods: l => ({ spellPct: 4 + 2 * l, crit: 0.4 * l }) });
  add({ id: 'breath_of_bow', cls: 'archer', tree: 2, tier: 3, name: 'Breath of the Bow', type: 'passive', icon: ['lotus', '#a8e0c8'], desc: 'You loose on the end of the breath. Arrows fly faster and land harder.', mods: l => ({ projSpeed: 6 + 2 * l, dmgPct: 1.5 * l, crit: 0.3 * l }) });
  add({ id: 'dwelling', cls: 'chod', tree: 2, tier: 3, name: 'Dwelling in the Charnel Ground', type: 'passive', icon: ['skull', '#e8e0c8'], desc: 'You have lived so long among the dead that they follow you. Your skeletons, dakinis and guardians grow strong.', mods: l => ({ minionDmg: 8 + 5 * l, minionLife: 10 + 6 * l, minionRegen: 0.2 * l }) });
  add({ id: 'fearless_heart', cls: 'chod', tree: 2, tier: 4, name: 'Fearless Heart', type: 'passive', icon: ['heart', '#ffb0c0'], desc: 'What is there to fear when the self has been offered up? Your resistances and your spells grow.', mods: l => ({ resAll: 3 + 1.2 * l, spellPct: 3 + 2 * l }) });
  for (const cls in LAYOUT) LAYOUT[cls].forEach((ids, t) => ids.forEach((id, i) => { const s = SKILLS[id]; if (!s) throw new Error('layout: missing ' + id); s.cls = cls; s.tree = t; s.tier = i; }));
  // passive tree has no chain of prerequisites; only a level requirement
})();
function treeSkills(cls, t) { return SKILL_LIST.filter(s => s.cls === cls && s.tree === t).sort((a, b) => a.tier - b.tier); }
function prereqOf(s) { if (s.tier === 0 || s.tree === PASSIVE_TREE) return null; return SKILL_LIST.find(o => o.cls === s.cls && o.tree === s.tree && o.tier === s.tier - 1); }

/* ---------- evolutions: active art + passive ---------- */
const EVOS = {
  /* Vajra Fist */
  vajra_strike: { passive: 'iron_shirt', name: 'Diamond Fist', icon: ['vajra', '#fff4c0'], dmg: 1.25,
    desc: 'The blow lands with the weight of a mountain: wider, heavier, and every strike sends a shockwave outward.',
    p: b => ({ range: b.range * 1.25, arc: 3.0, knock: b.knock * 2 }), riders: [{ k: 'nova', r: 3.2, m: 0.6, e: 'light', stun: 0.4 }] },
  thunder_palm: { passive: 'stillness', name: 'Palm of Stillness', icon: ['burst', '#fff7a0'], dmg: 1.2,
    desc: 'The still mind strikes twice: a wider ring of thunder, followed by its echo.',
    p: b => ({ radius: b.radius * 1.4, stun: b.stun * 2 }), riders: [{ k: 'echo', d: 0.45, m: 0.75 }] },
  burning_palm: { passive: 'mahakala_stance', name: "Mahakala's Palm", icon: ['fist', '#ff4a1a'], dmg: 1.25,
    desc: 'The Great Black One lends his hand. A longer, fiercer arc that leaves the ground burning.',
    p: b => ({ range: b.range * 1.2, arc: 3.0, burn: 1.0 }), riders: [{ k: 'zone', r: 2, dur: 3, m: 0.25, e: 'fire', fx: 'fire' }] },
  wheel_of_flames: { passive: 'mahakala_stance', name: 'Chakra of Ten Thousand Flames', icon: ['wheel', '#ffcf4a'], dmg: 1.2,
    desc: 'More chakras spin wider and longer, and they shed lightning as they turn.',
    p: b => ({ n: b.n + 3, orbitR: 2.2, dur: b.dur * 1.4, burn: 0.6 }), riders: [{ k: 'chain', j: 3, m: 0.5, e: 'fire' }] },
  indras_net: { passive: 'diamond_aura', name: 'Jewel Net of Indra', icon: ['chain', '#ffffff'], dmg: 1.2,
    desc: 'Every jewel in the net answers every other. The lightning leaps farther and calls bolts from above.',
    p: b => ({ jumps: b.jumps + 6, hop: 5, range: 10 }), riders: [{ k: 'bolts', n: 4, m: 0.5, e: 'light' }] },
  adamantine: { passive: 'iron_shirt', name: 'Diamond Body', icon: ['diamond', '#ffffff'], dmg: 1.2,
    desc: 'You become indestructible for longer, and the shock of it mends you and flings enemies far.',
    p: b => ({ dur: b.dur * 1.6, radius: 5, knock: 3.5 }), riders: [{ k: 'heal', pct: 12 }, { k: 'nova', r: 5, m: 0.8, e: 'phys', stun: 0.8 }] },
  vajrapani: { passive: 'unshakable', name: 'Vajrapani Descends', icon: ['bolt', '#ffffff'], dmg: 1.3,
    desc: 'The Diamond-Holder himself comes. Many more bolts fall, and they leave the earth crackling.',
    p: b => ({ n: b.n + 8, area: 7.5, impact: 1.7, stun: 1.0, delay: 0.2 }), riders: [{ k: 'zone', r: 3.4, dur: 3, m: 0.3, e: 'light', fx: 'spark' }] },
  /* Prajna Sage */
  prajna_bolt: { passive: 'heart_sutra', name: 'Prajnaparamita Bolt', icon: ['orb', '#ffffff'], dmg: 1.2,
    desc: 'The bolt of perfect wisdom: more bolts, passing through everything, and leaping from foe to foe.',
    p: b => ({ n: b.n + 2, pierce: 4, speed: b.speed * 1.15 }), riders: [{ k: 'chain', j: 3, m: 0.5, e: 'spirit' }] },
  wisdom_blades: { passive: 'clear_light', name: 'Thousand Blades of Clear Light', icon: ['fan', '#ffffff'], dmg: 1.15,
    desc: 'A great fan of seeking blades, and each cast loosens a swarm of lesser lights.',
    p: b => ({ n: b.n + 5, pierce: 4, homing: 2.5 }), riders: [{ k: 'arrows', n: 4, m: 0.35, e: 'spirit' }] },
  manjushri_blade: { passive: 'clear_light', name: 'Blade of Clear Light', icon: ['sword', '#ffffff'], dmg: 1.25,
    desc: 'The sword sweeps wider and its light rolls outward in a wave that heals you.',
    p: b => ({ radius: b.radius * 1.35 }), riders: [{ k: 'nova', r: 5.5, m: 0.6, e: 'spirit' }, { k: 'heal', pct: 4 }] },
  void_orb: { passive: 'form_emptiness', name: 'Orb of the Great Void', icon: ['void', '#ffffff'], dmg: 1.3,
    desc: 'A larger, faster sphere of emptiness whose burst opens a well that drags enemies in.',
    p: b => ({ explode: b.explode * 1.9, speed: 8, radius: 0.6 }), riders: [{ k: 'zone', r: 3, dur: 2.5, m: 0.3, e: 'void', pull: 2.5, fx: 'well' }] },
  gravity_well: { passive: 'form_emptiness', name: 'Collapsing Star', icon: ['spiral', '#ffffff'], dmg: 1.25,
    desc: 'The well pulls harder and collapses with a far greater burst, and a ring of void rolls out of it.',
    p: b => ({ burst: b.burst * 2, pull: 4.5, radius: 4.2 }), riders: [{ k: 'nova', r: 5, m: 0.6, e: 'void' }] },
  homa_flame: { passive: 'mandala_circle', name: 'Mandala of Flames', icon: ['mandala', '#ffcf4a'], dmg: 1.25,
    desc: 'The offering fire spreads wide and lasts long, and its burst throws out a ring of flame.',
    p: b => ({ radius: b.radius * 1.8, dur: b.dur * 1.6, burst: b.burst * 1.6 }), riders: [{ k: 'nova', r: 3.5, m: 0.5, e: 'fire' }] },
  homa_meteor: { passive: 'tummo', name: 'Great Homa Meteor', icon: ['meteor', '#ffffff'], dmg: 1.2,
    desc: 'Far more stones fall, larger, and the ground burns beneath them for longer.',
    p: b => ({ n: b.n + 3, area: 6.2, impact: 2.3, burnGround: 4 }), riders: [{ k: 'zone', r: 3, dur: 3, m: 0.3, e: 'fire', fx: 'fire' }] },
  /* Kyudo Archer */
  true_arrow: { passive: 'piercing_mind', name: 'Arrow of Perfect Aim', icon: ['arrow', '#ffffff'], dmg: 1.2,
    desc: 'One more arrow, faster, passing through everything it meets, and two more fly out to follow it.',
    p: b => ({ n: b.n + 1, pierce: 99, speed: b.speed * 1.25 }), riders: [{ k: 'arrows', n: 2, m: 0.3, e: 'phys' }, { k: 'mana', v: 2 }] },
  fanning_arrows: { passive: 'swift_steps', name: 'Fan of the Wind Horse', icon: ['fan', '#a8e0c8'], dmg: 1.1,
    desc: 'A far wider fan that passes through two foes, followed at once by its echo.',
    p: b => ({ n: b.n + 4, pierce: 2, spread: 1.2 }), riders: [{ k: 'echo', d: 0.3, m: 0.6 }] },
  mind_arrow: { passive: 'mindfulness', name: "Mind's Eye Arrow", icon: ['arrow', '#ffffff'], dmg: 1.2,
    desc: 'The arrows now hunt their targets across the field and leap on from the first foe they strike.',
    p: b => ({ homing: 14, n: b.n + 2, pierce: 2 }), riders: [{ k: 'chain', j: 3, m: 0.4, e: 'spirit' }] },
  prayer_wheel: { passive: 'mindfulness', name: 'Wheel of Ten Thousand Prayers', icon: ['pwheel', '#ffffff'], dmg: 1.15,
    desc: 'More wheels, turning faster and lasting longer, and each cast sends out a flight of prayers.',
    p: b => ({ max: b.max + 2, rate: b.rate * 0.6, dur: 16 }), riders: [{ k: 'arrows', n: 3, m: 0.3, e: 'phys' }] },
  fire_arrow: { passive: 'elemental_mastery', name: 'Arrow of the Burning Plain', icon: ['arrow', '#ffcf4a'], dmg: 1.25,
    desc: 'The flame bursts wide, and the ground burns where the arrow fell.',
    p: b => ({ explode: b.explode * 1.9, n: b.n + 1 }), riders: [{ k: 'zone', r: 2.2, dur: 3, m: 0.3, e: 'fire', fx: 'fire' }] },
  frost_arrow: { passive: 'elemental_mastery', name: 'Glacier Arrow', icon: ['arrow', '#e0f4ff'], dmg: 1.2,
    desc: 'Arrows of mountain ice pierce everything, chill to a standstill, and burst in a ring of frost.',
    p: b => ({ chill: 60, pierce: 99, n: b.n + 1 }), riders: [{ k: 'nova', r: 3, m: 0.5, e: 'cold' }] },
  thunder_arrow: { passive: 'breath_of_bow', name: 'Thunderbolt Arrow', icon: ['arrow', '#ffffff'], dmg: 1.2,
    desc: 'The lightning leaps four times farther and calls bolts down from the sky.',
    p: b => ({ chain: b.chain + 4 }), riders: [{ k: 'bolts', n: 3, m: 0.5, e: 'light' }] },
  /* Chöd Yogini */
  bone_shard: { passive: 'death_meditation', name: 'Thighbone Lance', icon: ['bone', '#ffffff'], dmg: 1.2,
    desc: 'More, faster shards that pierce three foes each, and the dead answer with leaping void.',
    p: b => ({ n: b.n + 2, pierce: 3, speed: b.speed * 1.1 }), riders: [{ k: 'chain', j: 3, m: 0.5, e: 'void' }] },
  skull_ring: { passive: 'dwelling', name: 'Garland of a Hundred Skulls', icon: ['skull', '#ffffff'], dmg: 1.2,
    desc: 'A wider, longer ring with more skulls, and each cast restores a little of your life.',
    p: b => ({ n: b.n + 4, orbitR: 2.3, dur: b.dur * 1.3 }), riders: [{ k: 'heal', pct: 3 }] },
  charnel_burst: { passive: 'death_meditation', name: 'Charnel Eruption', icon: ['burst', '#ffffff'], dmg: 1.2,
    desc: 'The bones burst in greater numbers over a wider ground, and the ground beneath turns to feast.',
    p: b => ({ n: b.n + 4, area: 5.2, impact: 2.2 }), riders: [{ k: 'zone', r: 2.6, dur: 3, m: 0.3, e: 'void', fx: 'feast', slow: 30 }] },
  feed_demons: { passive: 'body_offering', name: 'Banquet of Demons', icon: ['spiral', '#ffffff'], dmg: 1.3,
    desc: 'A larger, longer feast, and each devoured demon feeds you.',
    p: b => ({ radius: 3.8, dur: 4.5 }), riders: [{ k: 'heal', pct: 5 }] },
  red_feast: { passive: 'body_offering', name: 'Ocean of Nectar', icon: ['drop', '#ffffff'], dmg: 1.2,
    desc: 'Many more drops of nectar over a wider field, and the feast restores you in full measure.',
    p: b => ({ n: b.n + 6, area: 7 }), riders: [{ k: 'heal', pct: 6 }] },
  kartika: { passive: 'dakini_step', name: 'Kartika of the Dakini', icon: ['sword', '#ffffff'], dmg: 1.2,
    desc: 'The hooked knife reaches farther and cuts in a wider arc, and cuts again in its own echo.',
    p: b => ({ range: b.range * 1.3, arc: 3.0 }), riders: [{ k: 'echo', d: 0.25, m: 0.7 }] },
  summon_dakini: { passive: 'dwelling', name: 'Host of Dakinis', icon: ['deity', '#ffffff'], dmg: 1.2,
    desc: 'Two more dakinis answer the drum, and each arrival sends out a ring of force.',
    p: b => ({ max: b.max + 2 }), riders: [{ k: 'nova', r: 3, m: 0.5, e: 'phys' }] }
};
for (const id in EVOS) { const e = EVOS[id]; e.id = id; e.lv = EVO_LV; e.pLv = EVO_PLV; if (!SKILLS[id] || !SKILLS[e.passive]) throw new Error('evo: ' + id); }

/* ---------- unions: two equipped active arts ---------- */
const UNIONS = [
  { id: 'storm_wheel', cls: 'vajra', a: 'thunder_palm', b: 'wheel_of_flames', name: 'Storm Wheel', desc: 'The flaming chakras crackle with chain lightning, and each Thunder Palm sheds two small wheels of fire.',
    riders: { wheel_of_flames: [{ k: 'chain', j: 3, m: 0.5, e: 'light' }], thunder_palm: [{ k: 'orbit', n: 2, m: 0.4, e: 'fire', dur: 3, sprite: 'chakra' }] } },
  { id: 'fire_and_thunder', cls: 'vajra', a: 'vajra_strike', b: 'burning_palm', name: 'Fire and Thunder', desc: 'Each Vajra Strike bursts into flame; each Burning Palm calls two bolts from the sky.',
    riders: { vajra_strike: [{ k: 'nova', r: 2.8, m: 0.45, e: 'fire' }], burning_palm: [{ k: 'bolts', n: 2, m: 0.5, e: 'light' }] } },
  { id: 'roar_of_thunder', cls: 'vajra', a: 'fierce_roar', b: 'thunder_palm', name: 'Roar of Thunder', desc: 'The roar calls four bolts down on the terrified, and the palm rings a second time.',
    riders: { fierce_roar: [{ k: 'bolts', n: 4, m: 0.5, e: 'light' }], thunder_palm: [{ k: 'echo', d: 0.5, m: 0.5 }] } },
  { id: 'burning_insight', cls: 'sage', a: 'prajna_bolt', b: 'homa_flame', name: 'Burning Insight', desc: 'Prajna Bolts leave sacred fire where they land; Homa Flames throw out bolts of light.',
    riders: { prajna_bolt: [{ k: 'zone', r: 1.4, dur: 2, m: 0.2, e: 'fire', fx: 'fire' }], homa_flame: [{ k: 'arrows', n: 3, m: 0.3, e: 'spirit' }] } },
  { id: 'shattering_stillness', cls: 'sage', a: 'void_orb', b: 'frost_stillness', name: 'Shattering Stillness', desc: 'Frozen foes shatter in a ring of void; Void Orbs leave a chilling field.',
    riders: { frost_stillness: [{ k: 'nova', r: 4, m: 0.5, e: 'void' }], void_orb: [{ k: 'zone', r: 2.4, dur: 2.5, m: 0.15, e: 'cold', slow: 40, fx: 'frost' }] } },
  { id: 'burning_time', cls: 'sage', a: 'homa_meteor', b: 'kalachakra', name: 'Wheel of Burning Time', desc: 'The turning Wheel rains meteors; each meteor shower sets small suns circling you.',
    riders: { kalachakra: [{ k: 'meteor', n: 3, m: 0.6 }], homa_meteor: [{ k: 'orbit', n: 3, m: 0.35, e: 'fire', dur: 4, sprite: 'sunfire' }] } },
  { id: 'edge_of_wisdom', cls: 'sage', a: 'cutting_through', b: 'manjushri_blade', name: "Edge of Wisdom", desc: "The blade's sweep leaps from foe to foe; the cutting ray scatters lights.",
    riders: { manjushri_blade: [{ k: 'chain', j: 4, m: 0.4, e: 'spirit' }], cutting_through: [{ k: 'arrows', n: 3, m: 0.35, e: 'spirit' }] } },
  { id: 'fire_and_ice', cls: 'archer', a: 'fire_arrow', b: 'frost_arrow', name: 'Fire and Ice', desc: 'Fire arrows burst in a ring of frost; frost arrows leave burning ground.',
    riders: { fire_arrow: [{ k: 'nova', r: 3, m: 0.4, e: 'cold' }], frost_arrow: [{ k: 'zone', r: 2, dur: 2.5, m: 0.2, e: 'fire', fx: 'fire' }] } },
  { id: 'storm_volley', cls: 'archer', a: 'true_arrow', b: 'thunder_arrow', name: 'Storm Volley', desc: 'True Arrows crackle with lightning; Thunder Arrows loose two more arrows.',
    riders: { true_arrow: [{ k: 'chain', j: 2, m: 0.4, e: 'light' }], thunder_arrow: [{ k: 'arrows', n: 2, m: 0.3, e: 'phys' }] } },
  { id: 'garden_of_prayer', cls: 'archer', a: 'prayer_wheel', b: 'lotus_mines', name: 'Garden of Prayer', desc: 'Lotus Mines loose burning arrows when planted; Prayer Wheels set the ground alight.',
    riders: { lotus_mines: [{ k: 'arrows', n: 4, m: 0.3, e: 'fire' }], prayer_wheel: [{ k: 'zone', r: 2.2, dur: 3, m: 0.2, e: 'fire', fx: 'fire' }] } },
  { id: 'leaves_on_wind', cls: 'archer', a: 'whirling_leaves', b: 'fanning_arrows', name: 'Leaves on the Wind', desc: 'Whirling Leaves fire arrows as they turn; Fanning Arrows set leaves circling you.',
    riders: { whirling_leaves: [{ k: 'arrows', n: 3, m: 0.3, e: 'phys' }], fanning_arrows: [{ k: 'orbit', n: 3, m: 0.3, e: 'phys', dur: 3, sprite: 'leaf' }] } },
  { id: 'bone_and_blade', cls: 'chod', a: 'bone_shard', b: 'kartika', name: 'Bone and Blade', desc: 'Bone Shards bring two knives circling; Kartika Cuts loose two bone splinters.',
    riders: { bone_shard: [{ k: 'orbit', n: 2, m: 0.35, e: 'phys', dur: 3, sprite: 'knife' }], kartika: [{ k: 'arrows', n: 2, m: 0.3, e: 'void' }] } },
  { id: 'whirl_of_death', cls: 'chod', a: 'skull_ring', b: 'whirling_knives', name: 'Whirl of Death', desc: 'Skulls and knives alike throw chains of void lightning at the foes they pass.',
    riders: { skull_ring: [{ k: 'chain', j: 3, m: 0.4, e: 'void' }], whirling_knives: [{ k: 'chain', j: 3, m: 0.4, e: 'void' }] } },
  { id: 'cut_and_curse', cls: 'chod', a: 'severing_cry', b: 'kangling', name: 'Cut and Curse', desc: 'The Severing Cry rolls a cursing wave through every enemy the Kangling has marked.',
    riders: { severing_cry: [{ k: 'nova', r: 5, m: 0.5, e: 'void', curse: 30, curseDur: 5 }] } },
  { id: 'charnel_feast', cls: 'chod', a: 'charnel_burst', b: 'feed_demons', name: 'Charnel Feast', desc: 'Bursting bones leave a starving ground; the feast calls bolts of void upon those in it.',
    riders: { charnel_burst: [{ k: 'zone', r: 2.4, dur: 3, m: 0.25, e: 'void', fx: 'feast', slow: 40 }], feed_demons: [{ k: 'bolts', n: 3, m: 0.4, e: 'void' }] } }
];
for (const u of UNIONS) if (!SKILLS[u.a] || !SKILLS[u.b]) throw new Error('union: ' + u.id);

/* ---------- harmonies: two passives ---------- */
const HARMONIES = [
  { id: 'diamond_mind', cls: 'vajra', a: 'iron_shirt', b: 'stillness', name: 'Diamond Mind', desc: 'A body of iron and a mind unmoved: heal faster and take less from every blow.', mods: { lifeRegen: 3, dr: 5 } },
  { id: 'wrathful_mountain', cls: 'vajra', a: 'mahakala_stance', b: 'unshakable', name: 'Wrathful Mountain', desc: 'Immovable and terrible: more damage, and attackers are wounded.', mods: { dmgPct: 12, thorns: 20 } },
  { id: 'fire_of_wisdom', cls: 'sage', a: 'heart_sutra', b: 'tummo', name: 'Fire of Wisdom', desc: 'Insight kindles the inner fire: stronger spells and swifter mana.', mods: { spellPct: 15, manaRegen: 20 } },
  { id: 'luminous_void', cls: 'sage', a: 'form_emptiness', b: 'clear_light', name: 'Luminous Void', desc: 'Emptiness lit from within: more critical hits, and blows often pass through you.', mods: { crit: 6, dodge: 6 } },
  { id: 'walking_meditation', cls: 'archer', a: 'swift_steps', b: 'mindfulness', name: 'Walking Meditation', desc: 'Every step is practice: faster casting and faster walking.', mods: { castSpeed: 8, moveSpeed: 8 } },
  { id: 'five_colored_arrow', cls: 'archer', a: 'piercing_mind', b: 'elemental_mastery', name: 'Five-Colored Arrow', desc: 'Arrows that find the weak point of every element.', mods: { resPierce: 8, crit: 5 } },
  { id: 'feast_of_dead', cls: 'chod', a: 'death_meditation', b: 'body_offering', name: 'Feast of the Dead', desc: 'Every death feeds you: more life and mana from kills, and life stolen with every blow.', mods: { lifeOnKill: 3, lifeLeech: 3 } },
  { id: 'fearless_dance', cls: 'chod', a: 'dakini_step', b: 'fearless_heart', name: 'Fearless Dance', desc: 'Dancing without fear: you slip aside from more blows and move faster.', mods: { dodge: 8, moveSpeed: 8 } }
];
for (const h of HARMONIES) if (!SKILLS[h.a] || !SKILLS[h.b]) throw new Error('harmony: ' + h.id);
function evoFor(id) { return EVOS[id] || null; }
function unionsFor(cls) { return UNIONS.filter(u => u.cls === cls); }
function harmoniesFor(cls) { return HARMONIES.filter(h => h.cls === cls); }
