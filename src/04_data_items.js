/* ================= items ================= */
const SLOTS = ['weapon', 'offhand', 'head', 'body', 'hands', 'waist', 'feet', 'neck', 'ring1', 'ring2'];
const SLOT_NAME = { weapon: 'Weapon', offhand: 'Off-hand', head: 'Head', body: 'Robe', hands: 'Hands', waist: 'Sash', feet: 'Feet', neck: 'Amulet', ring1: 'Ring', ring2: 'Ring', ring: 'Ring' };
const RARITY = ['Normal', 'Magic', 'Rare', 'Unique', 'Quest', 'Socketed'];
const BASES = {};
function defB(id, o) { o.id = id; BASES[id] = o; }
// weapons: kind drives icon & implicit
const WLINES = {
  vajra: { names: ['Bronze Vajra', 'Iron Vajra', 'Thunder Vajra', 'Adamant Vajra', "Indra's Vajra"], dmg: [[2, 6], [6, 13], [12, 24], [20, 40], [32, 62]], req: 'str', imp: t => ({ el_light: 5 + 5 * t }) },
  bow: { names: ['Bamboo Bow', 'Recurve Bow', 'Yumi', 'Great Yumi', 'Heavenly Yumi'], dmg: [[2, 7], [6, 15], [12, 28], [21, 46], [34, 72]], req: 'dex', imp: t => ({ projSpeed: 5 + 5 * t }) },
  sword: { names: ['Temple Sword', 'Jian', 'Wisdom Blade', 'Flaming Jian', 'Prajna Edge'], dmg: [[2, 7], [6, 14], [11, 26], [20, 44], [32, 68]], req: 'spi', imp: t => ({ crit: 2 + t }) },
  staff: { names: ['Pilgrim Staff', 'Ringed Khakkhara', 'Iron Khakkhara', 'Six-Ringed Staff', 'Adamant Khakkhara'], dmg: [[2, 5], [5, 11], [9, 20], [16, 34], [26, 54]], req: 'spi', imp: t => ({ spellPct: 10 + 10 * t }) },
  mala: { names: ['Wooden Mala', 'Bodhi-Seed Mala', 'Lotus-Seed Mala', 'Coral Mala', 'Crystal Mala'], dmg: [[1, 4], [4, 9], [8, 16], [14, 28], [22, 44]], req: 'spi', imp: t => ({ minionDmg: 10 + 10 * t, manaRegen: 5 + 5 * t }) },
  khatvanga: { names: ['Bone Khatvanga', 'Skull Khatvanga', 'Trident Khatvanga', 'Dakini Khatvanga', 'Wisdom Khatvanga'], dmg: [[2, 6], [6, 13], [11, 24], [19, 40], [31, 62]], req: 'dex', imp: t => ({ el_void: 5 + 5 * t, lifeOnKill: 1 + t }) }
};
const TQ = [1, 10, 20, 32, 44];
const REQV = [0, 20, 34, 52, 72];
for (const k in WLINES) { const L = WLINES[k]; L.names.forEach((n, t) => defB(`w_${k}${t + 1}`, { slot: 'weapon', kind: k, name: n, q: TQ[t], tier: t, dmg: L.dmg[t], req: { [L.req]: REQV[t] }, imp: L.imp(t) })); }
const ALINES = {
  head: { kinds: [['hood', 'Cloth Hood', 1, [2, 4], 0], ['kasa', 'Straw Kasa', 9, [5, 9], 0], ['helm', 'Iron Helm', 18, [10, 18], 25], ['crown', 'Ritual Crown', 28, [16, 26], 25], ['mask', 'Wrathful Mask', 40, [26, 40], 45]] },
  body: { kinds: [['robe', 'Plain Robe', 1, [4, 8], 0], ['kasaya', 'Patchwork Kasaya', 9, [10, 18], 0], ['padded', 'Padded Robe', 18, [20, 34], 20], ['lamellar', 'Lamellar Coat', 28, [34, 56], 45], ['diamond', 'Diamond Robe', 40, [54, 86], 50]] },
  hands: { kinds: [['wraps', 'Cloth Wraps', 1, [1, 3], 0], ['gloves', 'Leather Gloves', 10, [3, 6], 10], ['gauntlets', 'Chain Gauntlets', 22, [6, 12], 35], ['mudra', 'Mudra Gloves', 36, [10, 18], 30]] },
  waist: { kinds: [['rope', 'Rope Sash', 1, [1, 3], 0, 1], ['belt', 'Leather Belt', 10, [3, 6], 10, 2], ['silk', 'Silk Sash', 22, [6, 11], 15, 3], ['plated', 'Plated Belt', 36, [10, 17], 40, 4]] },
  feet: { kinds: [['sandals', 'Straw Sandals', 1, [1, 3], 0], ['geta', 'Wooden Geta', 10, [3, 6], 10], ['boots', 'Leather Boots', 22, [6, 11], 25], ['cloud', 'Cloudstep Slippers', 36, [10, 17], 20]] },
  offhand: { kinds: [['wheel', 'Hand Prayer Wheel', 1, [3, 8], 0, 0], ['bell', 'Ghanta Bell', 4, [1, 3], 0, 0], ['quiver', 'Bamboo Quiver', 3, [0, 0], 0, 0], ['wheel2', 'Bronze Prayer Wheel', 14, [8, 18], 20, 0], ['bell2', 'Silver Ghanta', 18, [3, 6], 0, 0], ['quiver2', 'Lacquered Quiver', 20, [0, 0], 0, 0], ['wheel3', 'Golden Prayer Wheel', 30, [18, 34], 40, 0], ['bell3', 'Vajra Ghanta', 34, [5, 10], 0, 0], ['quiver3', 'Dragon Quiver', 38, [0, 0], 0, 0]] }
};
for (const slot in ALINES) {
  for (const k of ALINES[slot].kinds) {
    const [kind, name, q, def, str, extra] = k; const o = { slot, kind: kind.replace(/\d$/, ''), name, q, def, req: str ? { str } : {}, imp: {} };
    if (slot === 'waist') o.imp.potCap = extra;
    if (o.kind === 'wheel') o.imp.block = 8 + Math.floor(q / 6);
    if (o.kind === 'bell') o.imp = { mana: 8 + q, manaRegen: 10 + q };
    if (o.kind === 'quiver') o.imp = { pierce: 6 + Math.floor(q / 3), projSpeed: 10 };
    if (kind === 'crown') o.imp.mana = 15;
    defB(`${slot[0]}_${kind}`, o);
  }
}
defB('o_bowl', { slot: 'offhand', kind: 'bowl', name: 'Alms Bowl', q: 1, def: [1, 2], req: {}, imp: {}, uniqueOnly: 1 });
defB('n_amulet', { slot: 'neck', kind: 'amulet', name: 'Amulet', q: 1, req: {}, imp: {} });
defB('r_ring', { slot: 'ring', kind: 'ring', name: 'Ring', q: 1, req: {}, imp: {} });

/* gems: the Seven Treasures */
const GEMS = {
  carnelian: { name: 'Carnelian', col: '#d8402a', w: { el_fire: [10, 20, 35] }, a: { life: [10, 22, 40] } },
  lapis: { name: 'Lapis Lazuli', col: '#2a4ad8', w: { el_cold: [10, 20, 35] }, a: { mana: [10, 22, 40] } },
  gold: { name: 'Gold', col: '#f0c040', w: { el_light: [10, 20, 35] }, a: { mf: [8, 15, 25] } },
  silver: { name: 'Silver', col: '#e0e4ee', w: { el_spirit: [10, 20, 35] }, a: { resAll: [5, 9, 14] } },
  crystal: { name: 'Crystal', col: '#b8f0ff', w: { crit: [3, 6, 10] }, a: { edef: [15, 30, 50] } },
  agate: { name: 'Agate', col: '#a8683a', w: { el_void: [10, 20, 35] }, a: { lifeRegen: [1, 3, 6] } },
  pearl: { name: 'Red Pearl', col: '#ff9ab0', w: { lifeLeech: [2, 4, 7] }, a: { manaRegen: [10, 20, 35] } }
};
const GEM_GRADE = ['Chipped', 'Flawless', 'Perfect'];
const GEM_Q = [1, 18, 34];

/* affixes: [minIlvl, lo, hi, name] tiers */
const ARM = ['head', 'body', 'hands', 'waist', 'feet', 'offhand'];
const JEW = ['neck', 'ring'];
const ALL = ['weapon', ...ARM, ...JEW];
const AFFIX = [
  { k: 'ed', pre: 1, s: ['weapon'], t: [[1, 10, 20, 'Keen'], [8, 21, 40, 'Fierce'], [18, 41, 65, 'Wrathful'], [30, 66, 100, 'Adamantine'], [42, 101, 150, 'Vajra-Forged']] },
  { k: 'edef', pre: 1, s: ARM, t: [[1, 10, 20, 'Sturdy'], [10, 21, 40, 'Stalwart'], [20, 41, 65, 'Stone'], [32, 66, 100, 'Mountain'], [44, 101, 140, "Meru's"]] },
  { k: 'mana', pre: 1, s: ['weapon', 'head', 'body', 'offhand', 'neck', 'ring'], t: [[1, 5, 10, 'Calm'], [10, 11, 20, 'Serene'], [22, 21, 35, 'Luminous'], [36, 36, 55, 'Radiant']] },
  { k: 'life', pre: 1, s: ['head', 'body', 'waist', 'offhand', 'neck', 'ring', 'feet'], t: [[1, 6, 12, 'Hale'], [10, 13, 25, 'Robust'], [22, 26, 45, 'Vital'], [36, 46, 70, "Bodhi's"]] },
  { k: 'resAll', pre: 1, s: ['head', 'body', 'offhand', 'neck', 'ring'], t: [[6, 4, 8, 'Harmonious'], [18, 9, 14, 'Balanced'], [32, 15, 22, 'Equanimous']] },
  { k: 'res_fire', pre: 1, s: [...ARM, ...JEW], t: [[1, 8, 15, 'Cooling'], [14, 16, 25, 'Snowbound'], [28, 26, 40, 'Himalayan']] },
  { k: 'res_cold', pre: 1, s: [...ARM, ...JEW], t: [[1, 8, 15, 'Warming'], [14, 16, 25, 'Hearth-Warm'], [28, 26, 40, 'Sun-Kissed']] },
  { k: 'res_light', pre: 1, s: [...ARM, ...JEW], t: [[1, 8, 15, 'Grounded'], [14, 16, 25, 'Earthen'], [28, 26, 40, 'Rooted']] },
  { k: 'res_void', pre: 1, s: [...ARM, ...JEW], t: [[1, 8, 15, 'Pure'], [14, 16, 25, 'Unstained'], [28, 26, 40, 'Immaculate']] },
  { k: 'el_fire', pre: 1, s: ['weapon', 'neck', 'hands', 'head', 'ring'], t: [[4, 8, 15, 'Smoldering'], [16, 16, 30, 'Blazing'], [30, 31, 50, 'Homa-Fired']] },
  { k: 'el_cold', pre: 1, s: ['weapon', 'neck', 'hands', 'head', 'ring'], t: [[4, 8, 15, 'Chilling'], [16, 16, 30, 'Frozen'], [30, 31, 50, 'Glacial']] },
  { k: 'el_light', pre: 1, s: ['weapon', 'neck', 'hands', 'head', 'ring'], t: [[4, 8, 15, 'Sparking'], [16, 16, 30, 'Thundering'], [30, 31, 50, "Indra's"]] },
  { k: 'el_void', pre: 1, s: ['weapon', 'neck', 'hands', 'head', 'ring'], t: [[4, 8, 15, 'Hollow'], [16, 16, 30, 'Shadowed'], [30, 31, 50, 'Voidborn']] },
  { k: 'el_spirit', pre: 1, s: ['weapon', 'neck', 'hands', 'head', 'ring'], t: [[4, 8, 15, 'Glowing'], [16, 16, 30, 'Shining'], [30, 31, 50, "Tathagata's"]] },
  { k: 'el_phys', pre: 1, s: ['weapon', 'neck', 'hands', 'ring'], t: [[4, 8, 15, 'Heavy'], [16, 16, 30, 'Brutal'], [30, 31, 50, 'Crushing']] },
  { k: 'spellPct', pre: 1, s: ['weapon', 'neck', 'offhand', 'head'], t: [[6, 8, 15, 'Chanting'], [20, 16, 30, 'Mantric'], [34, 31, 45, 'Dharani']] },
  { k: 'dmgPct', pre: 1, s: ['neck', 'ring', 'hands'], t: [[12, 4, 8, 'Zealous'], [30, 9, 15, 'Diligent']] },
  { k: 'sk_cls', pre: 1, s: ['neck', 'weapon', 'head'], t: [[8, 1, 1, ''], [30, 2, 2, '']] },
  { k: 'sk_tree', pre: 1, s: ['weapon', 'offhand', 'neck', 'head'], t: [[10, 1, 1, ''], [24, 2, 2, ''], [38, 3, 3, '']] },
  { k: 'str', pre: 0, s: ['head', 'body', 'hands', 'waist', 'feet', 'neck', 'ring', 'weapon'], t: [[1, 1, 3, 'of the Ox'], [8, 4, 6, 'of the Bull'], [18, 7, 10, 'of the Elephant'], [32, 11, 15, 'of the Naga King']] },
  { k: 'dex', pre: 0, s: ['head', 'body', 'hands', 'waist', 'feet', 'neck', 'ring', 'weapon'], t: [[1, 1, 3, 'of the Crane'], [8, 4, 6, 'of the Heron'], [18, 7, 10, 'of the Monkey'], [32, 11, 15, 'of the Garuda']] },
  { k: 'vit', pre: 0, s: ['head', 'body', 'hands', 'waist', 'feet', 'neck', 'ring', 'offhand'], t: [[1, 1, 3, 'of the Tortoise'], [8, 4, 6, 'of the Banyan'], [18, 7, 10, 'of the Mountain'], [32, 11, 15, 'of Meru']] },
  { k: 'spi', pre: 0, s: ['head', 'body', 'hands', 'waist', 'neck', 'ring', 'weapon', 'offhand'], t: [[1, 1, 3, 'of the Lotus'], [8, 4, 6, 'of the Sutra'], [18, 7, 10, 'of the Mandala'], [32, 11, 15, 'of the Dharma']] },
  { k: 'castSpeed', pre: 0, s: ['weapon', 'neck', 'ring', 'hands', 'offhand'], t: [[4, 5, 8, 'of Mindfulness'], [16, 9, 12, 'of Swiftness'], [30, 13, 18, 'of Instant Insight']] },
  { k: 'moveSpeed', pre: 0, s: ['feet'], t: [[1, 5, 10, 'of the Pilgrim'], [14, 11, 16, 'of the Wind'], [28, 17, 24, 'of the Horse King']] },
  { k: 'lifeLeech', pre: 0, s: ['weapon', 'ring', 'hands', 'neck'], t: [[6, 2, 3, 'of the Leech'], [20, 4, 6, 'of Hunger'], [34, 7, 9, 'of the Preta']] },
  { k: 'manaLeech', pre: 0, s: ['weapon', 'ring', 'hands', 'neck'], t: [[6, 2, 3, 'of Thirst'], [20, 4, 6, 'of Craving']] },
  { k: 'crit', pre: 0, s: ['weapon', 'hands', 'head', 'neck'], t: [[4, 3, 5, 'of Insight'], [18, 6, 9, 'of Clarity'], [32, 10, 14, 'of Awakening']] },
  { k: 'critDmg', pre: 0, s: ['weapon', 'neck', 'ring'], t: [[10, 10, 20, 'of Piercing Sight'], [26, 21, 40, 'of the Diamond Eye']] },
  { k: 'area', pre: 0, s: ['weapon', 'neck', 'head', 'body'], t: [[10, 5, 10, 'of Expanse'], [26, 11, 18, 'of the Vast Mandala']] },
  { k: 'duration', pre: 0, s: ['weapon', 'neck', 'head', 'offhand'], t: [[10, 8, 15, 'of Patience'], [26, 16, 25, 'of Endurance']] },
  { k: 'projSpeed', pre: 0, s: ['weapon', 'offhand'], t: [[4, 10, 20, 'of Swift Flight'], [22, 21, 35, 'of the Falcon']] },
  { k: 'pierce', pre: 0, s: ['weapon', 'offhand', 'neck'], t: [[8, 8, 15, 'of Penetration'], [24, 16, 25, 'of the Unobstructed']] },
  { k: 'lifeRegen', pre: 0, s: ['body', 'waist', 'head', 'neck', 'ring'], t: [[1, 1, 2, 'of Renewal'], [12, 3, 5, 'of Regrowth'], [28, 6, 9, 'of the Evergreen']] },
  { k: 'manaRegen', pre: 0, s: ['head', 'neck', 'ring', 'offhand', 'weapon'], t: [[1, 10, 20, 'of Stillness'], [14, 21, 35, 'of Tranquility'], [30, 36, 55, 'of Deep Samadhi']] },
  { k: 'mf', pre: 0, s: ['head', 'neck', 'ring', 'feet', 'hands'], t: [[4, 5, 12, 'of Fortune'], [18, 13, 22, 'of Good Karma'], [32, 23, 35, 'of Abundant Karma']] },
  { k: 'gf', pre: 0, s: ['head', 'neck', 'ring', 'feet', 'hands', 'waist'], t: [[1, 15, 30, 'of Wealth'], [16, 31, 60, 'of Greed'], [30, 61, 90, 'of the Treasure Vase']] },
  { k: 'xpPct', pre: 0, s: ['neck', 'ring', 'head'], t: [[10, 3, 5, 'of Merit'], [28, 6, 9, 'of Great Merit']] },
  { k: 'pickup', pre: 0, s: ['neck', 'ring', 'feet', 'waist'], t: [[1, 20, 40, 'of Gathering'], [16, 41, 80, 'of the Alms-Bowl']] },
  { k: 'thorns', pre: 0, s: ['body', 'offhand'], t: [[1, 2, 5, 'of Karma'], [14, 6, 15, 'of Retribution'], [30, 16, 35, 'of Inevitable Karma']] },
  { k: 'dr', pre: 0, s: ['body', 'offhand', 'head', 'waist'], t: [[14, 3, 5, 'of the Rampart'], [32, 6, 9, 'of the Vajra Wall']] },
  { k: 'lifeOnKill', pre: 0, s: ['weapon', 'hands', 'ring'], t: [[4, 1, 3, 'of the Vulture'], [20, 4, 7, 'of the Charnel Ground']] },
  { k: 'manaOnKill', pre: 0, s: ['weapon', 'hands', 'ring', 'neck'], t: [[4, 1, 2, 'of the Offering'], [20, 3, 4, 'of the Great Offering']] },
  { k: 'minionDmg', pre: 0, s: ['weapon', 'offhand', 'neck', 'head'], t: [[4, 10, 20, 'of the Protector'], [20, 21, 40, 'of the Dharmapala']] },
  { k: 'minionLife', pre: 0, s: ['offhand', 'neck', 'body', 'head'], t: [[4, 10, 25, 'of Guardians'], [20, 26, 50, 'of the Temple Guard']] },
  { k: 'block', pre: 0, s: ['offhand'], t: [[4, 4, 8, 'of Turning'], [20, 9, 14, 'of the Dharma Wheel']] },
  { k: 'costRed', pre: 0, s: ['neck', 'head'], t: [[16, 5, 10, 'of Frugality']] },
  { k: 'projCount', pre: 0, s: ['neck', 'weapon', 'offhand'], t: [[32, 1, 1, 'of Multitudes']], rare: 1 }
];
const TREE_ADJ = { vajra: ['Thunderous', 'Ironclad', 'Wrathful'], sage: ['Insightful', 'Empty', 'Mandalic'], invoker: ['Protective', 'Many-Armed', 'Merciful'], archer: ['Archer\'s', 'Elemental', 'Windborne'], chod: ['Charnel', 'Severing', 'Dancing'] };
const CLS_ADJ = { vajra: ["Vajra-Adept's", "Vajra-Master's"], sage: ["Scholar's", "Sage's"], invoker: ["Summoner's", "Invoker's"], archer: ["Fletcher's", "Kyudo Master's"], chod: ["Yogini's", "Machig's"] };
const RARE_A = ['Dharma', 'Lotus', 'Karma', 'Sutra', 'Bodhi', 'Stupa', 'Mandala', 'Dragon', 'Tiger', 'Crane', 'Garuda', 'Naga', 'Vajra', 'Moon', 'Sun', 'Ember', 'Frost', 'Storm', 'Jade', 'Iron', 'Cinder', 'Ghost', 'Bone', 'Ash', 'Cloud', 'Pearl', 'Shadow', 'Thunder'];
const RARE_B = { weapon: ['Bite', 'Song', 'Fang', 'Spire', 'Word', 'Edge', 'Call', 'Wrath', 'Needle', 'Thorn'], offhand: ['Ward', 'Chime', 'Turn', 'Guard', 'Aegis', 'Echo'], head: ['Crown', 'Brow', 'Visage', 'Veil', 'Hood', 'Halo'], body: ['Mantle', 'Shroud', 'Vestment', 'Skin', 'Hide', 'Cloak'], hands: ['Grip', 'Grasp', 'Palm', 'Mudra', 'Touch'], waist: ['Knot', 'Cord', 'Coil', 'Sash', 'Girdle'], feet: ['Stride', 'Path', 'Step', 'Road', 'Trail'], neck: ['Heart', 'Eye', 'Seal', 'Talisman', 'Amulet', 'Charm'], ring: ['Circle', 'Band', 'Loop', 'Coil', 'Spiral', 'Knot'] };

/* uniques */
const UNIQUES = [
  { id: 'u_indra', base: 'w_vajra3', q: 18, name: 'Thunderbolt of Indra', mods: { ed: 120, el_light: 40, 'sk_tree:vajra:0': 2, castSpeed: 15, lifeLeech: 4 }, procs: [{ on: 'hit', chance: 8, fx: 'chain', elem: 'light', mul: 0.8 }], lore: 'Taken from the king of the gods, who has not yet noticed.' },
  { id: 'u_vajrapani', base: 'w_vajra5', q: 44, name: "Vajrapani's Fist", mods: { ed: 180, 'sk_cls:vajra': 2, str: 20, el_light: 60, crit: 10 }, lore: 'The diamond does not break. It breaks things.' },
  { id: 'u_pilgrim_staff', base: 'w_staff2', q: 10, name: "Pilgrim's Iron Staff", mods: { spellPct: 30, mana: 25, manaRegen: 30, sk_all: 1, resAll: 10 }, lore: 'It has walked farther than any god.' },
  { id: 'u_khakkhara', base: 'w_staff5', q: 44, name: "Kshitigarbha's Khakkhara", mods: { sk_all: 2, resAll: 30, lifeRegen: 10, spellPct: 60, castSpeed: 20 }, lore: 'Its six rings warn the smallest creatures to step aside.' },
  { id: 'u_manjushri', base: 'w_sword4', q: 32, name: "Manjushri's Edge", mods: { ed: 150, 'sk_tree:sage:0': 3, el_spirit: 60, el_fire: 30, crit: 10 }, lore: 'It cuts nothing but ignorance.' },
  { id: 'u_discern', base: 'w_sword2', q: 10, name: 'Blade of Discernment', mods: { ed: 90, crit: 8, dex: 8, el_spirit: 20 }, lore: 'It knows what is real and what is merely vivid.' },
  { id: 'u_mist_yumi', base: 'w_bow2', q: 10, name: 'Yumi of the Morning Mist', mods: { ed: 100, dex: 10, castSpeed: 10, pierce: 15 }, lore: 'The archer does not aim. The arrow does not miss.' },
  { id: 'u_deer_bow', base: 'w_bow4', q: 32, name: 'Bow of the Deer Park', mods: { ed: 160, 'sk_cls:archer': 2, projCount: 1, crit: 8, critDmg: 40 }, lore: 'Strung where the first sermon was spoken.' },
  { id: 'u_108', base: 'w_mala2', q: 12, name: 'Mala of One Hundred and Eight', mods: { 'sk_cls:invoker': 1, minionDmg: 40, minionLife: 40, mana: 20, manaRegen: 25 }, lore: 'One bead for each affliction of the mind.' },
  { id: 'u_charnel_rosary', base: 'w_mala4', q: 32, name: 'Rosary of the Charnel Ground', mods: { 'sk_tree:invoker:0': 3, minionDmg: 80, lifeOnKill: 6, el_void: 30 }, lore: 'Carved from the bones of those who meditated on death until they no longer feared it.' },
  { id: 'u_kangling', base: 'w_khatvanga2', q: 12, name: 'Khatvanga of the Cemetery', mods: { ed: 90, 'sk_cls:chod': 1, el_void: 30, lifeLeech: 4, spi: 8 }, lore: 'Three heads upon it: one fresh, one withered, one bare bone.' },
  { id: 'u_machig', base: 'w_khatvanga5', q: 44, name: "Machig Labdrön's Staff", mods: { ed: 170, 'sk_cls:chod': 2, el_void: 60, 'sk_tree:chod:0': 2, lifeOnKill: 10, castSpeed: 15 }, lore: 'She taught that the demon is the thing you cling to.' },
  { id: 'u_damaru', base: 'o_bell2', q: 22, name: 'Damaru of Two Skulls', mods: { 'sk_tree:chod:1': 2, mana: 30, minionDmg: 40, castSpeed: 10, resAll: 10 }, lore: 'Its two faces are made from two skulls, and its rhythm is a heartbeat.' },
  { id: 'u_bowl', base: 'o_bowl', q: 6, name: 'The Begging Bowl', mods: { gf: 150, mf: 60, lifeRegen: 3 }, lore: 'Whatever is given, receive it.' },
  { id: 'u_clear_bell', base: 'o_bell2', q: 18, name: 'Bell of Clear Mind', mods: { mana: 40, manaRegen: 60, castSpeed: 15, sk_all: 1 }, lore: 'Its note lasts exactly as long as a breath.' },
  { id: 'u_wind_quiver', base: 'o_quiver2', q: 20, name: 'Quiver of the Wind', mods: { projCount: 1, projSpeed: 30, pierce: 20, dex: 10 }, lore: 'Empty, and never empty.' },
  { id: 'u_dharma_wheel', base: 'o_wheel3', q: 30, name: 'Wheel of the Turning Dharma', mods: { edef: 120, block: 20, resAll: 20, thorns: 25, sk_all: 1 }, procs: [{ on: 'hurt', chance: 15, fx: 'nova', elem: 'fire', mul: 1.2 }], lore: 'Each turn is a prayer for all beings.' },
  { id: 'u_wanderer_hat', base: 'h_kasa', q: 8, name: 'Straw Hat of the Wanderer', mods: { moveSpeed: 15, mf: 30, dex: 8, pickup: 60 }, lore: 'Rain on the brim, road beneath the feet.' },
  { id: 'u_five_crown', base: 'h_crown', q: 30, name: 'Crown of the Five Buddhas', mods: { sk_all: 2, resAll: 15, mana: 40, el_spirit: 25 }, lore: 'Five wisdoms, one mind.' },
  { id: 'u_mahakala_mask', base: 'h_mask', q: 42, name: "Mahakala's Mask", mods: { dmgPct: 25, lifeLeech: 5, str: 20, dr: 8, lifeOnKill: 8 }, lore: 'Wrath, worn in the service of compassion.' },
  { id: 'u_ananda', base: 'h_hood', q: 4, name: "Ananda's Memory", mods: { costRed: 15, xpPct: 10, mana: 15, spi: 10 }, lore: '"Thus have I heard."' },
  { id: 'u_patches', base: 'b_kasaya', q: 10, name: 'Robe of Patches', mods: { resAll: 15, life: 30, lifeRegen: 4, thorns: 8 }, lore: 'Sewn from rags found at the charnel ground, as the robes of the first monks were.' },
  { id: 'u_diamond_kasaya', base: 'b_diamond', q: 44, name: 'Diamond Kasaya', mods: { sk_all: 2, edef: 150, resAll: 25, life: 80, dr: 10 }, lore: 'Nothing can pierce what is already empty.' },
  { id: 'u_asura_coat', base: 'b_lamellar', q: 28, name: 'Asura War-Coat', mods: { edef: 120, str: 15, life: 60, el_phys: 30, res_fire: 30 }, lore: 'Every plate taken from a fallen rival.' },
  { id: 'u_mudra', base: 'h_mudra', q: 36, name: 'Mudras of Fearlessness', mods: { castSpeed: 20, crit: 10, lifeLeech: 5, str: 10, dex: 10 }, lore: 'The raised palm that says: do not be afraid.' },
  { id: 'u_smith_hands', base: 'h_gloves', q: 10, name: 'Hands of the Smith', mods: { el_fire: 25, castSpeed: 10, res_fire: 25, str: 6 }, lore: 'Cunda made the Buddha\'s last meal. He was not blamed.' },
  { id: 'u_kasina', base: 'w_silk', q: 22, name: 'Sash of the Kasina', mods: { life: 50, lifeRegen: 6, mana: 30, potCap: 2 }, lore: 'Tied with the colour one meditates upon.' },
  { id: 'u_milarepa', base: 'f_cloud', q: 36, name: 'Slippers of Milarepa', mods: { moveSpeed: 30, dodge: 10, res_cold: 40, dex: 15 }, lore: 'He wore cotton in the snows of Tibet and was warm.' },
  { id: 'u_pilgrim_sandals', base: 'f_sandals', q: 6, name: 'Sandals of the Pilgrim', mods: { moveSpeed: 20, pickup: 60, gf: 40 }, lore: 'Worn thin on the road to Bodh Gaya.' },
  { id: 'u_bodhi_leaf', base: 'n_amulet', q: 20, name: 'Bodhi Leaf', mods: { sk_all: 1, xpPct: 10, resAll: 15, lifeRegen: 5 }, lore: 'Fallen from the tree beneath which one man sat until he woke.' },
  { id: 'u_garland', base: 'n_amulet', q: 16, name: 'Garland of Fingers', mods: { el_phys: 40, lifeLeech: 8, str: 12, resAll: -10 }, lore: 'He laid it down. You have picked it up. Be careful.', noDrop: 1 },
  { id: 'u_kannon', base: 'n_amulet', q: 36, name: "Kannon's Thousand Eyes", mods: { projCount: 1, crit: 12, el_spirit: 30, sk_all: 1 }, lore: 'She who hears the cries of the world.' },
  { id: 'u_heart_amulet', base: 'n_amulet', q: 40, name: 'Heart Sutra Amulet', mods: { sk_all: 2, castSpeed: 15, mana: 50, costRed: 10 }, procs: [{ on: 'kill', chance: 8, fx: 'nova', elem: 'spirit', mul: 1.5 }], lore: 'Gate, gate, paragate, parasamgate, bodhi svaha.' },
  { id: 'u_rahu_ring', base: 'r_ring', q: 24, name: "Rahu's Hunger", mods: { manaLeech: 8, lifeLeech: 5, el_void: 30, res_light: -15 }, lore: 'It swallows, and the light passes through.' },
  { id: 'u_eightfold', base: 'r_ring', q: 30, name: 'Ring of the Eightfold Path', mods: { str: 8, dex: 8, vit: 8, spi: 8, resAll: 8, mf: 20, dmgPct: 8 }, lore: 'Right view, right intention, right speech, right action...' },
  { id: 'u_hoju', base: 'r_ring', q: 40, name: 'Jewel of Hoju', mods: { sk_all: 1, mf: 50, gf: 80, life: 30 }, lore: 'The wish-granting jewel grants only one wish, and it is not the one you expect.' },
  { id: 'u_tara_ring', base: 'r_ring', q: 12, name: "Green Tara's Ring", mods: { lifeRegen: 5, life: 30, res_void: 30 }, lore: 'She steps down from her lotus before you finish calling.' }
];
// fix base ids (hands/offhand/waist naming)
for (const u of UNIQUES) { if (u.base === 'h_mudra') u.base = 'h_mudra'; }
const UMAP = {}; for (const u of UNIQUES) UMAP[u.id] = u;

/* stat labels for tooltips */
const MOD_TXT = {
  ed: v => `+${v}% Enhanced Damage`, edef: v => `+${v}% Enhanced Defense`, mana: v => `+${v} to Mana`, life: v => `+${v} to Life`,
  resAll: v => `All Resistances ${v >= 0 ? '+' : ''}${v}%`, res_fire: v => `Fire Resist ${v >= 0 ? '+' : ''}${v}%`, res_cold: v => `Cold Resist ${v >= 0 ? '+' : ''}${v}%`,
  res_light: v => `Lightning Resist ${v >= 0 ? '+' : ''}${v}%`, res_void: v => `Void Resist ${v >= 0 ? '+' : ''}${v}%`,
  el_fire: v => `+${v}% Fire Damage`, el_cold: v => `+${v}% Cold Damage`, el_light: v => `+${v}% Lightning Damage`, el_void: v => `+${v}% Void Damage`,
  el_spirit: v => `+${v}% Spirit Damage`, el_phys: v => `+${v}% Physical Damage`, spellPct: v => `+${v}% Spell Damage`, dmgPct: v => `+${v}% Damage`,
  str: v => `+${v} to Strength`, dex: v => `+${v} to Dexterity`, vit: v => `+${v} to Vitality`, spi: v => `+${v} to Spirit`,
  castSpeed: v => `+${v}% Faster Casting`, moveSpeed: v => `+${v}% Faster Walking`, lifeLeech: v => `${v}% Life Stolen per Hit`, manaLeech: v => `${v}% Mana Stolen per Hit`,
  crit: v => `+${v}% Critical Chance`, critDmg: v => `+${v}% Critical Damage`, area: v => `+${v}% Area of Effect`, duration: v => `+${v}% Skill Duration`,
  projSpeed: v => `+${v}% Projectile Speed`, pierce: v => `+${v}% Chance to Pierce`, lifeRegen: v => `Replenish ${v} Life per Second`, manaRegen: v => `Regenerate Mana ${v}%`,
  mf: v => `${v}% Better Chance of Getting Magic Items`, gf: v => `${v}% Extra Gold from Monsters`, xpPct: v => `+${v}% Experience Gained`, pickup: v => `+${v}% Gathering Radius`,
  thorns: v => `Attacker Takes Damage of ${v}`, dr: v => `Physical Damage Reduced by ${v}%`, lifeOnKill: v => `+${v} Life after each Kill`, manaOnKill: v => `+${v} Mana after each Kill`,
  minionDmg: v => `+${v}% Guardian Damage`, minionLife: v => `+${v}% Guardian Life`, block: v => `+${v}% Chance to Block`, costRed: v => `Skills Cost ${v}% Less Mana`,
  projCount: v => `+${v} Projectile${v > 1 ? 's' : ''}`, sk_all: v => `+${v} to All Skills`, potCap: v => `+${v} Potion Capacity`, dodge: v => `+${v}% Chance to Evade`,
  defPct: v => `+${v}% Defense`, lifePct: v => `+${v}% Maximum Life`
};
function modText(k, v) {
  if (k.startsWith('sk_cls:')) { const c = k.split(':')[1]; return `+${v} to ${CLASSES[c].name} Skills`; }
  if (k.startsWith('sk_tree:')) { const [, c, t] = k.split(':'); return `+${v} to ${CLASSES[c].trees[+t]} Skills <span style="color:var(--dim)">(${CLASSES[c].name})</span>`; }
  if (k.startsWith('sk_one:')) { const id = k.split(':')[1]; return `+${v} to ${SKILLS[id].name}`; }
  const f = MOD_TXT[k]; return f ? f(v) : `${k}: ${v}`;
}

/* Dharanis: gems set in a specific order into a plain socketed item */
const DHARANIS = [
  { id: 'dharma_wheel', name: 'Turning the Wheel', gems: ['gold', 'carnelian'], slots: ['weapon', 'offhand'], mods: { castSpeed: 25, area: 20, dmgPct: 15, sk_all: 1 }, lore: 'First spoken in a deer park, to five companions.' },
  { id: 'refuge', name: 'Refuge', gems: ['pearl', 'silver'], slots: ['head', 'body', 'offhand'], mods: { life: 45, lifeLeech: 4, resAll: 15, block: 8 }, lore: 'Be a lamp unto yourselves.' },
  { id: 'three_jewels', name: 'Three Jewels', gems: ['gold', 'silver', 'crystal'], slots: ['weapon', 'body'], mods: { sk_all: 2, dmgPct: 30, resAll: 20, xpPct: 5 }, lore: 'I take refuge in the Buddha, the Dharma and the Sangha.' },
  { id: 'om_ah_hum', name: 'Om Ah Hum', gems: ['silver', 'carnelian', 'lapis'], slots: ['body'], mods: { sk_all: 1, castSpeed: 20, mana: 50, manaRegen: 50, life: 40 }, lore: 'Body, speech and mind, made pure.' },
  { id: 'diamond_cutter', name: 'Diamond Cutter', gems: ['crystal', 'crystal', 'gold'], slots: ['weapon'], mods: { ed: 140, crit: 15, critDmg: 50, pierce: 25 }, lore: 'All conditioned things are like a dream, a bubble, a shadow.' },
  { id: 'lapis_radiance', name: 'Lapis Radiance', gems: ['lapis', 'lapis', 'agate'], slots: ['body'], mods: { life: 90, lifeRegen: 8, resAll: 25, dr: 6 }, lore: 'The Medicine Buddha is the colour of lapis lazuli.' },
  { id: 'emptiness', name: 'Form Is Emptiness', gems: ['agate', 'crystal', 'agate'], slots: ['weapon', 'body'], mods: { el_void: 50, dodge: 12, resPierce: 15, sk_all: 1 }, lore: 'No eye, no ear, no nose, no tongue, no body, no mind.' },
  { id: 'lotus_crown', name: 'Lotus Crown', gems: ['pearl', 'gold'], slots: ['head'], mods: { sk_all: 1, mf: 30, mana: 30, lifeRegen: 4 }, lore: 'The jewel is in the lotus.' }
];
const DHMAP = {}; for (const d of DHARANIS) DHMAP[d.id] = d;
const MAX_SOCK = { weapon: 3, body: 3, head: 2, offhand: 2 };
function checkDharani(it) {
  if (it.rar !== 5 || !it.sockets || it.gems.length !== it.sockets) return null;
  const seq = it.gems.map(g => g.gem).join(',');
  const d = DHARANIS.find(d => d.gems.length === it.sockets && d.gems.join(',') === seq && d.slots.includes(it.slot)); if (!d) return null;
  it.dharani = d.id; it.rar = 6; it.name = d.name; for (const k in d.mods) it.mods[k] = (it.mods[k] || 0) + d.mods[k]; return d;
}
