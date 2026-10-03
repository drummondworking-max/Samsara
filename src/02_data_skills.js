/* ================= classes & skills ================= */
const sp = (b, l) => b * (1 + 0.3 * (l - 1) + 0.011 * (l - 1) * (l - 1));
const R = (lo, hi) => l => [sp(lo, l), sp(hi, l)];
const TIER_REQ = [1, 6, 12, 18, 26];
const ELEM_NAME = { phys: 'Physical', fire: 'Fire', cold: 'Cold', light: 'Lightning', void: 'Void', spirit: 'Spirit' };
const ELEM_COL = { phys: '#e8e0d0', fire: '#ff7a2e', cold: '#7fc8ff', light: '#ffe066', void: '#b77dff', spirit: '#fff2c8' };
const STAT_NAME = { str: 'Strength', dex: 'Dexterity', vit: 'Vitality', spi: 'Spirit' };

const CLASSES = {
  vajra: {
    name: 'Vajra Fist', title: 'Disciple of Vajrapani', stat: 'str',
    desc: 'A wrestler-monk who carries the thunderbolt of Vajrapani. He fights close, strikes with lightning and fire, and endures what would break other men.',
    trees: ['Thunderbolt', 'Iron Body', 'Wrathful Deity'],
    base: { str: 25, dex: 20, vit: 25, spi: 10 }, life: [70, 3.6, 4], mana: [14, 1.6, 1.2],
    start: 'vajra_strike', weapon: 'w_vajra1', robe: '#d9822b', robe2: '#a8481a', skin: '#c68a5a',
    mantra: 'Thunder of Vajrapani'
  },
  sage: {
    name: 'Prajna Sage', title: 'Adept of Manjushri', stat: 'spi',
    desc: 'A scholar of the Perfection of Wisdom whose sword cuts through delusion. Frail in body, she commands light, emptiness and the sacred fire of the mandala.',
    trees: ['Sword of Wisdom', 'Emptiness', 'Mandala'],
    base: { str: 12, dex: 20, vit: 18, spi: 30 }, life: [50, 2.8, 2.6], mana: [22, 2, 1.8],
    start: 'prajna_bolt', weapon: 'w_sword1', robe: '#7a1f2b', robe2: '#d8a53a', skin: '#d8a27a',
    mantra: "Manjushri's Sword"
  },
  archer: {
    name: 'Kyudo Archer', title: 'Zen Bowman', stat: 'dex',
    desc: 'A Zen monk of the bow, for whom aim, breath and target are one. He fights from afar with arrows of wind, fire and frost, and never wastes a step.',
    trees: ['Zen Archery', 'Elemental Arrows', 'Wind and Void'],
    base: { str: 18, dex: 30, vit: 20, spi: 12 }, life: [55, 3.1, 3], mana: [14, 1.5, 1.2],
    start: 'true_arrow', weapon: 'w_bow1', robe: '#23262c', robe2: '#e8e2d2', skin: '#d6a07a',
    mantra: 'Rain of Ten Thousand Arrows'
  }
};
CLASSES.chod = {
  name: 'Chöd Yogini', title: 'Daughter of Machig Labdrön', stat: 'spi',
  desc: 'A wandering yogini of the charnel grounds who offers her own body to the demons and so cuts through the self they feed on. She curses, raises the dancing skeleton lords, and fights beside the dakinis.',
  trees: ['Charnel Ground', 'Severance', 'Dakini Dance'],
  base: { str: 15, dex: 23, vit: 20, spi: 22 }, life: [52, 3, 2.8], mana: [16, 1.8, 1.5],
  start: 'bone_shard', weapon: 'w_khatvanga1', robe: '#e8e2d2', robe2: '#8a1a1a', skin: '#c8906a',
  mantra: 'The Great Feast'
};
const CLASS_IDS = ['vajra', 'sage', 'archer', 'chod'];

/* type: bolt strike nova orbit aura chain zone rain summon beam boomerang sentry buff passive heal */
const SKILL_LIST = [
  /* ---------------- VAJRA FIST ---------------- */
  { id: 'vajra_strike', cls: 'vajra', tree: 0, tier: 0, name: 'Vajra Strike', type: 'strike', elem: 'phys', stat: 'str', attack: 1, icon: ['vajra', '#e8c060'],
    desc: 'A sweeping blow of the thunderbolt-sceptre that strikes every foe in an arc before you.',
    cost: l => 1, cd: l => 0.7, pct: l => 140 + 16 * (l - 1), flat: R(3, 5), p: l => ({ range: 2.1 + l * 0.02, arc: 2.4, knock: 0.35, lifeHit: 0.8 }), syn: [['charged_vajra', 5], ['indras_net', 4]] },
  { id: 'charged_vajra', cls: 'vajra', tree: 0, tier: 1, name: 'Charged Vajra', type: 'boomerang', elem: 'light', stat: 'str', icon: ['vajra', '#ffe066'],
    desc: 'Hurl a spinning vajra that crackles through every enemy in its path, then returns to your hand.',
    cost: l => 3, cd: l => 1.3, dmg: R(8, 14), p: l => ({ n: 1 + Math.floor((l + 2) / 6), range: 7, speed: 9, radius: 0.6 }), syn: [['vajra_strike', 5], ['thunder_palm', 5]] },
  { id: 'thunder_palm', cls: 'vajra', tree: 0, tier: 2, name: 'Thunder Palm', type: 'nova', elem: 'light', stat: 'str', icon: ['burst', '#ffe066'],
    desc: 'Strike the earth with an open palm, loosing a ring of lightning that stuns those it touches.',
    cost: l => 5, cd: l => 2.0, dmg: R(13, 23), p: l => ({ radius: 3.6 + l * 0.05, stun: 0.35, speed: 11 }), syn: [['charged_vajra', 6], ['vajrapani', 4]] },
  { id: 'indras_net', cls: 'vajra', tree: 0, tier: 3, name: "Indra's Net", type: 'chain', elem: 'light', stat: 'str', icon: ['chain', '#ffe066'],
    desc: 'Every jewel in the net of Indra reflects every other. Lightning leaps from foe to foe along its threads.',
    cost: l => 6, cd: l => 1.5, dmg: R(17, 30), p: l => ({ jumps: 5 + Math.floor(l / 3), range: 8, hop: 3.8 }), syn: [['thunder_palm', 6], ['charged_vajra', 4]] },
  { id: 'vajrapani', cls: 'vajra', tree: 0, tier: 4, name: "Vajrapani's Wrath", type: 'rain', elem: 'light', stat: 'str', icon: ['bolt', '#fff7a0'],
    desc: 'Call down the wrath of the Diamond-Holder. Bolts of lightning strike foes all around you.',
    cost: l => 12, cd: l => 4, dmg: R(34, 56), p: l => ({ n: 7 + Math.floor(l / 3), area: 6, impact: 1.4, dur: 1.4, delay: 0.25, stun: 0.5, fx: 'lightning' }), syn: [['indras_net', 5], ['thunder_palm', 5]] },

  { id: 'iron_shirt', cls: 'vajra', tree: 1, tier: 0, name: 'Iron Shirt', type: 'passive', icon: ['shield', '#b0b0b8'],
    desc: 'Years of conditioning have made your body into armour.',
    mods: l => ({ defPct: 20 + 10 * l, life: 4 * l }) },
  { id: 'stillness', cls: 'vajra', tree: 1, tier: 1, name: 'Unmoving Mind', type: 'passive', icon: ['eye', '#a8c8e8'],
    desc: 'The mind that does not flinch cannot be wounded as deeply.',
    mods: l => ({ dr: Math.min(25, 3 + 1.1 * l), lifeRegen: 0.5 + 0.35 * l }) },
  { id: 'diamond_aura', cls: 'vajra', tree: 1, tier: 2, name: 'Diamond Aura', type: 'aura', elem: 'phys', stat: 'str', icon: ['wheel', '#dfe6ff'],
    desc: 'An adamantine field surrounds you. Nearby foes are ground against it, and those who strike you are wounded in turn.',
    cost: l => 0, cd: l => 0.5, dmg: R(5, 9), p: l => ({ radius: 2.8 + 0.04 * l, tick: 0.5 }), mods: l => ({ thorns: 4 * l, defPct: 15 + 5 * l, dr: Math.min(15, 2 + 0.5 * l) }), syn: [['iron_shirt', 6]] },
  { id: 'unshakable', cls: 'vajra', tree: 1, tier: 3, name: 'Unshakable', type: 'passive', icon: ['mountain', '#c8b890'],
    desc: 'Like Mount Meru, you are not moved by the winds of the elements.',
    mods: l => ({ resAll: 4 + 1.8 * l, lifePct: 2 * l }) },
  { id: 'adamantine', cls: 'vajra', tree: 1, tier: 4, name: 'Adamantine Body', type: 'buff', elem: 'phys', stat: 'str', icon: ['diamond', '#e8f0ff'],
    desc: 'For a moment your body becomes diamond. You cannot be harmed, and the shock of your transformation hurls foes away.',
    cost: l => 10, cd: l => 14, dmg: R(20, 34), p: l => ({ dur: 1.5 + 0.05 * l, radius: 3.6, knock: 2.5, invuln: 1 }), syn: [['diamond_aura', 6], ['unshakable', 4]] },

  { id: 'burning_palm', cls: 'vajra', tree: 2, tier: 0, name: 'Burning Palm', type: 'strike', elem: 'fire', stat: 'str', icon: ['fist', '#ff7a2e'],
    desc: 'A palm strike wreathed in the fire of the wrathful deities. Foes are left burning.',
    cost: l => 2, cd: l => 0.9, dmg: R(8, 13), p: l => ({ range: 2.4, arc: 2.0, burn: 0.5, knock: 0.2, lifeHit: 0.8 }), syn: [['wheel_of_flames', 5], ['fierce_roar', 4]] },
  { id: 'mahakala_stance', cls: 'vajra', tree: 2, tier: 1, name: "Mahakala's Stance", type: 'passive', icon: ['deity', '#3a4ab8'],
    desc: 'You take the stance of the Great Black One. Your blows grow heavier and quicker.',
    mods: l => ({ el_phys: 10 + 5 * l, el_fire: 10 + 5 * l, castSpeed: 5 + 1 * l }) },
  { id: 'wheel_of_flames', cls: 'vajra', tree: 2, tier: 2, name: 'Wheel of Flames', type: 'orbit', elem: 'fire', stat: 'str', icon: ['wheel', '#ff7a2e'],
    desc: 'Flaming chakras spin about you, burning all they touch.',
    cost: l => 6, cd: l => 7, dmg: R(8, 14), p: l => ({ n: 2 + Math.floor(l / 5), orbitR: 1.8, size: 0.5, dur: 5, spin: 3.2, hitCd: 0.45, burn: 0.3, sprite: 'chakra' }), syn: [['burning_palm', 5], ['wrathful_form', 4]] },
  { id: 'fierce_roar', cls: 'vajra', tree: 2, tier: 3, name: 'Fierce Roar', type: 'nova', elem: 'fire', stat: 'str', icon: ['roar', '#ff9a4a'],
    desc: 'The lion\'s roar of the Dharma. Foes are scorched, flee in terror, and take more damage for a time.',
    cost: l => 5, cd: l => 5, dmg: R(14, 24), p: l => ({ radius: 4.6, fear: 1.5 + 0.05 * l, curse: 20, curseDur: 4, speed: 9 }), syn: [['burning_palm', 5], ['mahakala_stance', 3]] },
  { id: 'wrathful_form', cls: 'vajra', tree: 2, tier: 4, name: 'Wrathful Form', type: 'buff', elem: 'fire', stat: 'str', icon: ['deity', '#ff4a2e'],
    desc: 'You take on the terrible aspect of a wrathful protector. Your damage and reach swell, and the ground burns where you walk.',
    cost: l => 12, cd: l => 18, dmg: R(4, 7), p: l => ({ dur: 6 + 0.2 * l, trail: 1 }), bmods: l => ({ dmgPct: 40 + 4 * l, area: 25, moveSpeed: 15 }), syn: [['wheel_of_flames', 5], ['fierce_roar', 5]] },

  /* ---------------- PRAJNA SAGE ---------------- */
  { id: 'prajna_bolt', cls: 'sage', tree: 0, tier: 0, name: 'Prajna Bolt', type: 'bolt', elem: 'spirit', stat: 'spi', icon: ['orb', '#fff2c8'],
    desc: 'A bolt of pure insight that seeks the nearest foe.',
    cost: l => 1, cd: l => 0.6, dmg: R(6, 11), p: l => ({ n: 1 + Math.floor((l + 1) / 5), spread: 0.25, speed: 12, pierce: 1, radius: 0.35, sprite: 'orb' }), syn: [['wisdom_blades', 5], ['cutting_through', 3]] },
  { id: 'wisdom_blades', cls: 'sage', tree: 0, tier: 1, name: 'Wisdom Blades', type: 'bolt', elem: 'spirit', stat: 'spi', icon: ['fan', '#fff2c8'],
    desc: 'A fan of shining blades that pass through several foes.',
    cost: l => 4, cd: l => 1.4, dmg: R(6, 11), p: l => ({ n: 3 + Math.floor(l / 4), spread: 0.95, speed: 10, pierce: 2, radius: 0.4, sprite: 'blade' }), syn: [['prajna_bolt', 5], ['cutting_through', 4]] },
  { id: 'cutting_through', cls: 'sage', tree: 0, tier: 2, name: 'Cutting Through', type: 'beam', elem: 'spirit', stat: 'spi', icon: ['beam', '#fff2c8'],
    desc: 'A ray of wisdom that cuts through every delusion in its line.',
    cost: l => 6, cd: l => 2.5, dmg: R(4, 7), p: l => ({ range: 8.5, width: 0.7, dur: 1.2, tick: 0.15 }), syn: [['wisdom_blades', 5], ['prajna_bolt', 4]] },
  { id: 'heart_sutra', cls: 'sage', tree: 0, tier: 3, name: 'Heart Sutra', type: 'passive', icon: ['sutra', '#f0d898'],
    desc: 'Form is emptiness, emptiness is form. Your understanding sharpens every spell.',
    mods: l => ({ el_spirit: 10 + 5 * l, costRed: Math.min(30, 1.5 * l), crit: 0.5 * l }) },
  { id: 'manjushri_blade', cls: 'sage', tree: 0, tier: 4, name: "Manjushri's Blade", type: 'sweep', elem: 'spirit', stat: 'spi', icon: ['sword', '#ffd070'],
    desc: 'The flaming sword of the Bodhisattva of Wisdom sweeps a full circle around you.',
    cost: l => 14, cd: l => 6, dmg: R(40, 62), p: l => ({ radius: 4 + 0.05 * l, dur: 0.6 }), syn: [['cutting_through', 5], ['wisdom_blades', 5]] },

  { id: 'void_orb', cls: 'sage', tree: 1, tier: 0, name: 'Void Orb', type: 'bolt', elem: 'void', stat: 'spi', icon: ['void', '#b77dff'],
    desc: 'A slow sphere of emptiness that bursts on impact.',
    cost: l => 2, cd: l => 1.2, dmg: R(6, 11), p: l => ({ n: 1, speed: 6.5, pierce: 0, radius: 0.45, explode: 1.7, sprite: 'void' }), syn: [['gravity_well', 4], ['great_emptiness', 4]] },
  { id: 'frost_stillness', cls: 'sage', tree: 1, tier: 1, name: 'Frost of Stillness', type: 'zone', elem: 'cold', stat: 'spi', icon: ['snow', '#7fc8ff'],
    desc: 'Where the mind is still, all motion freezes. Foes within the field are slowed and chilled.',
    cost: l => 5, cd: l => 3.5, dmg: R(2, 4), p: l => ({ radius: 2.5, dur: 4, tick: 0.5, slow: 40, place: 'cluster', fx: 'frost' }), syn: [['void_orb', 4], ['form_emptiness', 3]] },
  { id: 'form_emptiness', cls: 'sage', tree: 1, tier: 2, name: 'Form is Emptiness', type: 'passive', icon: ['void', '#d0b0ff'],
    desc: 'What is there to strike? Blows sometimes pass through you, and your void and cold spells deepen.',
    mods: l => ({ dodge: Math.min(30, 5 + 1 * l), el_void: 8 + 4 * l, el_cold: 8 + 4 * l }) },
  { id: 'gravity_well', cls: 'sage', tree: 1, tier: 3, name: 'Gravity Well', type: 'zone', elem: 'void', stat: 'spi', icon: ['spiral', '#b77dff'],
    desc: 'Open a point of emptiness that drags foes inward, then collapses with a crushing burst.',
    cost: l => 8, cd: l => 6, dmg: R(3, 6), p: l => ({ radius: 3.5, dur: 3, tick: 0.3, pull: 3.2, place: 'cluster', burst: 4, fx: 'well' }), syn: [['void_orb', 5], ['frost_stillness', 3]] },
  { id: 'great_emptiness', cls: 'sage', tree: 1, tier: 4, name: 'Great Emptiness', type: 'nova', elem: 'void', stat: 'spi', icon: ['void', '#8a4aff'],
    desc: 'All things are revealed as empty. A wave of the void erases weakened foes outright.',
    cost: l => 18, cd: l => 9, dmg: R(40, 70), p: l => ({ radius: 6.2, speed: 8, execute: 12 }), syn: [['gravity_well', 5], ['void_orb', 5]] },

  { id: 'homa_flame', cls: 'sage', tree: 2, tier: 0, name: 'Homa Flame', type: 'zone', elem: 'fire', stat: 'spi', icon: ['flame', '#ff7a2e'],
    desc: 'Kindle a ritual fire-offering beneath a foe. It bursts, then burns on.',
    cost: l => 2, cd: l => 1.4, dmg: R(2, 4), p: l => ({ radius: 1.4, dur: 2.5, tick: 0.4, place: 'target', burst: 2.2, fx: 'fire' }), syn: [['homa_meteor', 4], ['mandala_circle', 3]] },
  { id: 'mandala_circle', cls: 'sage', tree: 2, tier: 1, name: 'Mandala Circle', type: 'aura', elem: 'fire', stat: 'spi', icon: ['mandala', '#ff9a3a'],
    desc: 'A turning mandala of sacred fire surrounds you, burning all who enter it.',
    cost: l => 0, cd: l => 0.5, dmg: R(2.5, 4.5), p: l => ({ radius: 2.3 + 0.05 * l, tick: 0.5 }), syn: [['homa_flame', 4], ['tummo', 3]] },
  { id: 'homa_meteor', cls: 'sage', tree: 2, tier: 2, name: 'Homa Meteor', type: 'rain', elem: 'fire', stat: 'spi', icon: ['meteor', '#ff6a1e'],
    desc: 'The great offering: blazing stones fall upon the thickest crowds of foes.',
    cost: l => 9, cd: l => 3.5, dmg: R(18, 30), p: l => ({ n: 3 + Math.floor(l / 5), area: 5, impact: 1.9, dur: 1.0, delay: 0.7, fx: 'meteor', burnGround: 2, cluster: 1 }), syn: [['homa_flame', 5], ['kalachakra', 4]] },
  { id: 'tummo', cls: 'sage', tree: 2, tier: 3, name: 'Warmth of Tummo', type: 'passive', icon: ['flame', '#ffb04a'],
    desc: 'The inner fire of the yogis. Your fire burns hotter and your mind is refilled faster.',
    mods: l => ({ el_fire: 10 + 5 * l, manaRegen: 10 + 4 * l, res_cold: 2 * l }) },
  { id: 'kalachakra', cls: 'sage', tree: 2, tier: 4, name: 'Kalachakra Wheel', type: 'orbit', elem: 'fire', stat: 'spi', icon: ['wheel', '#ffcf4a'],
    desc: 'The Wheel of Time turns about you, its burning spokes sweeping through your enemies.',
    cost: l => 16, cd: l => 10, dmg: R(14, 24), p: l => ({ n: 4 + Math.floor(l / 5), orbitR: 2.8, size: 0.8, dur: 6, spin: 2.4, hitCd: 0.4, sprite: 'sunfire', wheel: 1 }), syn: [['homa_meteor', 5], ['mandala_circle', 5]] },

  /* ---------------- KYUDO ARCHER ---------------- */
  { id: 'true_arrow', cls: 'archer', tree: 0, tier: 0, name: 'True Arrow', type: 'bolt', elem: 'phys', stat: 'dex', attack: 1, icon: ['arrow', '#e8e0d0'],
    desc: 'Breath, bow and target become one. A single perfect arrow.',
    cost: l => 0.5, cd: l => 0.5, pct: l => 115 + 13 * (l - 1), p: l => ({ n: 1 + Math.floor((l + 1) / 6), spread: 0.2, speed: 17, pierce: 1, radius: 0.3, sprite: 'arrow' }), syn: [['fanning_arrows', 4], ['mind_arrow', 4]] },
  { id: 'fanning_arrows', cls: 'archer', tree: 0, tier: 1, name: 'Fanning Arrows', type: 'bolt', elem: 'phys', stat: 'dex', attack: 1, icon: ['fan', '#e8e0d0'],
    desc: 'Loose a spread of arrows that covers the field before you.',
    cost: l => 3, cd: l => 1.2, pct: l => 70 + 8 * (l - 1), p: l => ({ n: 3 + Math.floor(l / 3), spread: 0.95, speed: 15, pierce: 0, radius: 0.3, sprite: 'arrow' }), syn: [['true_arrow', 4]] },
  { id: 'piercing_mind', cls: 'archer', tree: 0, tier: 2, name: 'Piercing Mind', type: 'passive', icon: ['eye', '#e8e0d0'],
    desc: 'A mind without obstruction. Your arrows pass through foes and find weak points.',
    mods: l => ({ pierce: Math.min(80, 10 + 3 * l), crit: 2 + 0.6 * l }) },
  { id: 'mind_arrow', cls: 'archer', tree: 0, tier: 3, name: 'Mind Arrow', type: 'bolt', elem: 'phys', stat: 'dex', attack: 1, icon: ['arrow', '#ffe8a0'],
    desc: 'Arrows guided by intention alone. They turn in flight to follow their target.',
    cost: l => 4, cd: l => 1.3, pct: l => 125 + 14 * (l - 1), p: l => ({ n: 2 + Math.floor(l / 6), spread: 0.8, speed: 13, pierce: 0, radius: 0.3, homing: 7, sprite: 'arrowg' }), syn: [['true_arrow', 5], ['fanning_arrows', 3]] },
  { id: 'thousand_arrows', cls: 'archer', tree: 0, tier: 4, name: 'Ten Thousand Arrows', type: 'rain', elem: 'phys', stat: 'dex', attack: 1, icon: ['rain', '#e8e0d0'],
    desc: 'Fire into the sky. A storm of arrows falls upon the enemy host.',
    cost: l => 12, cd: l => 5, pct: l => 95 + 10 * (l - 1), p: l => ({ n: 16 + l, area: 4.2, impact: 0.95, dur: 1.4, delay: 0.3, fx: 'arrow', cluster: 1 }), syn: [['mind_arrow', 4], ['fanning_arrows', 4]] },

  { id: 'fire_arrow', cls: 'archer', tree: 1, tier: 0, name: 'Fire Arrow', type: 'bolt', elem: 'fire', stat: 'dex', attack: 1, icon: ['arrow', '#ff7a2e'],
    desc: 'An arrow wrapped in flame that bursts on impact.',
    cost: l => 2, cd: l => 0.9, pct: l => 95 + 11 * (l - 1), p: l => ({ n: 1, speed: 15, pierce: 0, radius: 0.32, explode: 1.3, sprite: 'arrowf' }), syn: [['elemental_mastery', 3], ['five_wisdoms', 3]] },
  { id: 'frost_arrow', cls: 'archer', tree: 1, tier: 1, name: 'Frost Arrow', type: 'bolt', elem: 'cold', stat: 'dex', attack: 1, icon: ['arrow', '#7fc8ff'],
    desc: 'An arrow of mountain ice that pierces and chills its targets.',
    cost: l => 2.5, cd: l => 1.0, pct: l => 95 + 11 * (l - 1), p: l => ({ n: 1 + Math.floor(l / 8), spread: 0.3, speed: 15, pierce: 1, radius: 0.32, chill: 35, sprite: 'arrowc' }), syn: [['fire_arrow', 3], ['elemental_mastery', 3]] },
  { id: 'thunder_arrow', cls: 'archer', tree: 1, tier: 2, name: 'Thunder Arrow', type: 'bolt', elem: 'light', stat: 'dex', attack: 1, icon: ['arrow', '#ffe066'],
    desc: 'An arrow that splits into lightning on impact, leaping to nearby foes.',
    cost: l => 4, cd: l => 1.3, pct: l => 85 + 10 * (l - 1), p: l => ({ n: 1, speed: 16, pierce: 0, radius: 0.32, chain: 2 + Math.floor(l / 5), sprite: 'arrowl' }), syn: [['frost_arrow', 3], ['fire_arrow', 3]] },
  { id: 'elemental_mastery', cls: 'archer', tree: 1, tier: 3, name: 'Elemental Mastery', type: 'passive', icon: ['five', '#ffcf4a'],
    desc: 'Fire, frost and thunder bend to your bow and pierce the resistances of your foes.',
    mods: l => ({ el_fire: 10 + 5 * l, el_cold: 10 + 5 * l, el_light: 10 + 5 * l, resPierce: Math.min(30, 2 + 0.9 * l) }) },
  { id: 'five_wisdoms', cls: 'archer', tree: 1, tier: 4, name: 'Arrow of Five Wisdoms', type: 'five', elem: 'spirit', stat: 'dex', attack: 1, icon: ['five', '#ffffff'],
    desc: 'Five arrows in the colours of the Five Wisdom Buddhas: light, frost, thunder, fire and void, each piercing all it meets.',
    cost: l => 10, cd: l => 2.2, pct: l => 110 + 12 * (l - 1), p: l => ({ n: 5, spread: 0.7, speed: 15, pierce: 99, radius: 0.35 }), syn: [['thunder_arrow', 4], ['fire_arrow', 3], ['frost_arrow', 3]] },

  { id: 'swift_steps', cls: 'archer', tree: 2, tier: 0, name: 'Swift Steps', type: 'passive', icon: ['feet', '#a8e0c8'],
    desc: 'Walking meditation made swift. You move faster and slip aside from blows.',
    mods: l => ({ moveSpeed: Math.min(40, 8 + 1.5 * l), dodge: Math.min(25, 2 + 0.7 * l) }) },
  { id: 'prayer_wheel', cls: 'archer', tree: 2, tier: 1, name: 'Prayer Wheel Sentry', type: 'sentry', elem: 'phys', stat: 'dex', attack: 1, icon: ['pwheel', '#e0b23a'],
    desc: 'Set down a spinning prayer wheel. Each turn sends out a prayer, and an arrow.',
    cost: l => 5, cd: l => 3, pct: l => 50 + 6 * (l - 1), p: l => ({ max: Math.min(5, 1 + Math.floor(l / 5)), dur: 12, rate: 0.6, speed: 15 }), syn: [['whirling_leaves', 3], ['lotus_mines', 3]] },
  { id: 'whirling_leaves', cls: 'archer', tree: 2, tier: 2, name: 'Whirling Leaves', type: 'orbit', elem: 'phys', stat: 'dex', attack: 1, icon: ['leaf', '#8fe07a'],
    desc: 'Razor-edged bodhi leaves ride the wind around you.',
    cost: l => 6, cd: l => 7, pct: l => 40 + 6 * (l - 1), p: l => ({ n: 3 + Math.floor(l / 4), orbitR: 2.0, size: 0.4, dur: 6, spin: 4, hitCd: 0.4, sprite: 'leaf' }), syn: [['swift_steps', 3], ['prayer_wheel', 3]] },
  { id: 'mindfulness', cls: 'archer', tree: 2, tier: 3, name: 'Mindfulness', type: 'passive', icon: ['eye', '#a8e0c8'],
    desc: 'Attention without distraction. You act faster and strike deeper when you strike true.',
    mods: l => ({ castSpeed: 6 + 1.5 * l, critDmg: 10 + 4 * l }) },
  { id: 'lotus_mines', cls: 'archer', tree: 2, tier: 4, name: 'Lotus Mines', type: 'mines', elem: 'fire', stat: 'dex', attack: 1, icon: ['lotus', '#ff8a5a'],
    desc: 'Scatter lotus buds among your foes. They bloom into fire when an enemy draws near.',
    cost: l => 9, cd: l => 4, pct: l => 200 + 20 * (l - 1), p: l => ({ n: 3 + Math.floor(l / 6), radius: 2.1, arm: 0.5, life: 6 }), syn: [['prayer_wheel', 4], ['fire_arrow', 3]] },

  /* ---------------- CHÖD YOGINI ---------------- */
  { id: 'bone_shard', cls: 'chod', tree: 0, tier: 0, name: 'Bone Shard', type: 'bolt', elem: 'void', stat: 'spi', icon: ['bone', '#e8e0c8'],
    desc: 'A splinter of bone from the charnel ground, flung with a word of power. It passes through the first foe it strikes.',
    cost: l => 1, cd: l => 0.65, dmg: R(6, 10), p: l => ({ n: 1 + Math.floor((l + 1) / 6), spread: 0.3, speed: 12, pierce: 1, radius: 0.35, sprite: 'bone' }), syn: [['skull_ring', 4], ['charnel_burst', 4]] },
  { id: 'skull_ring', cls: 'chod', tree: 0, tier: 1, name: 'Garland of Skulls', type: 'orbit', elem: 'void', stat: 'spi', icon: ['skull', '#e8e0c8'],
    desc: 'The skulls of your former selves circle you, biting whatever comes near.',
    cost: l => 6, cd: l => 7, dmg: R(5, 9), p: l => ({ n: 3 + Math.floor(l / 4), orbitR: 1.9, size: 0.45, dur: 6, spin: 2.8, hitCd: 0.45, sprite: 'skull' }), syn: [['bone_shard', 4], ['death_meditation', 3]] },
  { id: 'charnel_burst', cls: 'chod', tree: 0, tier: 2, name: 'Charnel Burst', type: 'rain', elem: 'void', stat: 'spi', icon: ['burst', '#b77dff'],
    desc: 'The bones of the dead beneath your enemies burst upward in a storm of splinters.',
    cost: l => 8, cd: l => 3, dmg: R(15, 26), p: l => ({ n: 3 + Math.floor(l / 5), area: 4, impact: 1.8, dur: 0.6, delay: 0.5, fx: 'bones', cluster: 1 }), syn: [['bone_shard', 5], ['skull_ring', 3]] },
  { id: 'death_meditation', cls: 'chod', tree: 0, tier: 3, name: 'Meditation on Death', type: 'passive', icon: ['skull', '#b77dff'],
    desc: 'You sat among the corpses until you no longer feared becoming one. Your void magic deepens, and every death restores you.',
    mods: l => ({ el_void: 10 + 5 * l, lifeOnKill: 1 + Math.floor(l * 0.8), manaOnKill: Math.floor(l / 3) }) },
  { id: 'citipati', cls: 'chod', tree: 0, tier: 4, name: 'Dance of the Citipati', type: 'summon', elem: 'void', stat: 'spi', icon: ['skull', '#ffd070'],
    desc: 'The two skeleton lords of the charnel ground rise and dance at your side, crushing all who come near.',
    cost: l => 16, cd: l => 6, dmg: R(22, 36), p: l => ({ kind: 'citipati', max: 2, hp: 180 * (1 + 0.25 * (l - 1)) }), syn: [['death_meditation', 4], ['skull_ring', 3]] },

  { id: 'kangling', cls: 'chod', tree: 1, tier: 0, name: 'Call of the Kangling', type: 'curse', elem: 'void', stat: 'spi', icon: ['roar', '#e8e0c8'],
    desc: 'The thighbone trumpet summons the demons to their feast. Nearby foes are slowed and take more damage from every source.',
    cost: l => 0, cd: l => 0.5, p: l => ({ radius: 4 + 0.06 * l, curse: Math.min(55, 12 + 2 * l), slow: 15 }) },
  { id: 'body_offering', cls: 'chod', tree: 1, tier: 1, name: 'Offering of the Body', type: 'passive', icon: ['heart', '#ff5a4a'],
    desc: 'You give your body away in visualisation, and it returns to you stronger. Your blows steal life.',
    mods: l => ({ life: 5 * l, lifePct: 1.5 * l, lifeLeech: Math.min(10, 1 + 0.4 * l) }) },
  { id: 'severing_cry', cls: 'chod', tree: 1, tier: 2, name: 'Severing Cry', type: 'nova', elem: 'void', stat: 'spi', icon: ['roar', '#b77dff'],
    desc: 'PHAT! The seed-syllable that cuts through clinging. Foes are struck, terrified and laid open.',
    cost: l => 6, cd: l => 5, dmg: R(12, 20), p: l => ({ radius: 4.6, fear: 1.2 + 0.04 * l, curse: 25, curseDur: 5, speed: 10 }), syn: [['kangling', 4], ['feed_demons', 3]] },
  { id: 'feed_demons', cls: 'chod', tree: 1, tier: 3, name: 'Feeding the Demons', type: 'zone', elem: 'void', stat: 'spi', icon: ['spiral', '#ff5a4a'],
    desc: 'You open a feast for the hungry demons. Foes caught in it are held fast and devoured.',
    cost: l => 7, cd: l => 4, dmg: R(5, 8), p: l => ({ radius: 2.8, dur: 3, tick: 0.4, slow: 50, root: 1, place: 'cluster', fx: 'feast' }), syn: [['severing_cry', 4], ['body_offering', 3]] },
  { id: 'red_feast', cls: 'chod', tree: 1, tier: 4, name: 'The Red Feast', type: 'rain', elem: 'void', stat: 'spi', icon: ['drop', '#ff3a2a'],
    desc: 'Your body, transformed into an ocean of nectar, pours down on every demon at once. Each that drinks restores you.',
    cost: l => 15, cd: l => 8, dmg: R(22, 36), p: l => ({ n: 10 + Math.floor(l / 2), area: 6, impact: 1.3, dur: 1.6, delay: 0.35, fx: 'feast', heal: 1 }), syn: [['feed_demons', 5], ['kangling', 3]] },

  { id: 'kartika', cls: 'chod', tree: 2, tier: 0, name: 'Kartika Cut', type: 'strike', elem: 'phys', stat: 'dex', attack: 1, icon: ['sword', '#e8e0d0'],
    desc: 'A slash of the dakini\'s hooked knife, which cuts through attachment and through flesh.',
    cost: l => 1, cd: l => 0.6, pct: l => 120 + 14 * (l - 1), flat: R(2, 4), p: l => ({ range: 2.2, arc: 2.2, knock: 0.2, lifeHit: 0.6 }), syn: [['whirling_knives', 4], ['sky_dancer', 3]] },
  { id: 'dakini_step', cls: 'chod', tree: 2, tier: 1, name: "Dakini's Step", type: 'passive', icon: ['feet', '#ff8ab0'],
    desc: 'The dakinis move through the sky without leaving footprints. So do you, nearly.',
    mods: l => ({ moveSpeed: Math.min(35, 6 + 1.5 * l), dodge: Math.min(25, 3 + 0.8 * l), castSpeed: 3 + l }) },
  { id: 'whirling_knives', cls: 'chod', tree: 2, tier: 2, name: 'Whirling Knives', type: 'orbit', elem: 'phys', stat: 'dex', attack: 1, icon: ['fan', '#e8e0d0'],
    desc: 'Hooked knives spin about you in the dakini\'s dance.',
    cost: l => 6, cd: l => 7, pct: l => 55 + 7 * (l - 1), p: l => ({ n: 3 + Math.floor(l / 4), orbitR: 1.7, size: 0.45, dur: 6, spin: 4.2, hitCd: 0.35, sprite: 'knife' }), syn: [['kartika', 4], ['dakini_step', 2]] },
  { id: 'summon_dakini', cls: 'chod', tree: 2, tier: 3, name: 'Summon Dakini', type: 'summon', elem: 'phys', stat: 'dex', icon: ['deity', '#ff6ab0'],
    desc: 'A sky-dancer answers your drum and fights beside you with flashing knives. More answer as you grow.',
    cost: l => 9, cd: l => 4, dmg: R(10, 16), p: l => ({ kind: 'dakini', max: Math.min(3, 1 + Math.floor(l / 7)), hp: 110 * (1 + 0.25 * (l - 1)) }), syn: [['kartika', 3], ['whirling_knives', 3]] },
  { id: 'sky_dancer', cls: 'chod', tree: 2, tier: 4, name: 'Sky Dancer', type: 'buff', elem: 'phys', stat: 'dex', icon: ['wheel', '#ff6ab0'],
    desc: 'You become a dakini yourself. For a time you move and strike with blinding speed, and cut deeper.',
    cost: l => 12, cd: l => 16, dmg: R(4, 7), p: l => ({ dur: 6 + 0.2 * l }), bmods: l => ({ dmgPct: 30 + 3 * l, castSpeed: 30 + 2 * l, moveSpeed: 25 }), syn: [['summon_dakini', 4], ['kartika', 4]] }
];
const SKILLS = {}; for (const s of SKILL_LIST) SKILLS[s.id] = s;
const ACTIVE_TYPES = new Set(['bolt', 'strike', 'nova', 'orbit', 'aura', 'chain', 'zone', 'rain', 'summon', 'beam', 'boomerang', 'sentry', 'buff', 'heal', 'curse', 'sweep', 'five', 'mines']);
function classSkills(cls) { return SKILL_LIST.filter(s => s.cls === cls); }
function treeSkills(cls, t) { return SKILL_LIST.filter(s => s.cls === cls && s.tree === t).sort((a, b) => a.tier - b.tier); }
function prereqOf(s) { if (s.tier === 0) return null; return SKILL_LIST.find(o => o.cls === s.cls && o.tree === s.tree && o.tier === s.tier - 1); }

/* summoned guardians */
const MINIONS = {
  snow_lion: { name: 'Snow Lion', speed: 5.6, r: 0.42, ai: 'melee', range: 1.1, atkCd: 0.8, sprite: 'm_lion' },
  garuda: { name: 'Garuda', speed: 6.5, r: 0.4, ai: 'ranged', range: 6.5, atkCd: 1.1, fly: 1, proj: 'feather', sprite: 'm_garuda' },
  naga: { name: 'Naga', speed: 4.2, r: 0.45, ai: 'ranged', range: 5.5, atkCd: 1.4, proj: 'venom', sprite: 'm_naga' },
  mahakala: { name: 'Mahakala', speed: 4.8, r: 0.9, ai: 'smash', range: 2.6, atkCd: 1.2, sprite: 'm_mahakala', big: 1 },
  citipati: { name: 'Citipati', speed: 4.6, r: 0.5, ai: 'smash', range: 1.9, atkCd: 1.0, sprite: 'm_citipati' },
  dakini: { name: 'Dakini', speed: 6.2, r: 0.4, ai: 'melee', range: 1.1, atkCd: 0.55, sprite: 'm_dakini' }
};
