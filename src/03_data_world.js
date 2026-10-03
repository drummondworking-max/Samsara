/* ================= realms, enemies, quests ================= */
const REALMS = [
  { id: 'deva', name: 'Deva Realm', skt: 'Deva-gati', sub: 'The Realm of the Gods', poison: 'Pride',
    intro: 'In the heavens, beings live long lives of delight and forget that delight must end. Pride is the poison here: the gods believe their bliss is their own. Nothing here wishes to harm you. Everything here wishes you to stay.',
    pal: { floor: '#c9b894', floor2: '#e6d9b8', accent: '#d9b24a', grout: '#a8946a', wall: '#ece4d2', wall2: '#c9bda3', trim: '#caa048', voidTop: '#a9b6e6', voidBot: '#6d7cc0', dark: 0.12, light: 12, amb: '#fff4d8', paved: 1, decal: ['#f2b8c8', '#fff', '#e8c860'], fog: '#e8e0ff' },
    props: ['bliss_tree', 'pillar', 'cloud', 'stupa_w', 'lotus_pool'], caveProps: ['crystal', 'pillar'],
    guide: { name: 'Nikko Jizo', title: 'Kshitigarbha of Sunlight' },
    npcs: { merchant: 'Chitraratha the Gandharva', smith: 'Vishvakarman\'s Apprentice', gambler: 'The Fortune-Stick Deva', healer: 'Nikko Jizo' },
    areas: [
      { name: 'Tushita Pavilion', kind: 'town' },
      { name: 'Cloud Terraces', kind: 'field', d: 0, roster: ['bliss_wisp', 'apsara', 'gandharva'] },
      { name: 'Nandana Grove', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['bliss_wisp', 'apsara', 'gandharva', 'kinnara'] },
      { name: 'Halls of the Thirty-Three', kind: 'field', d: 4, paved: 1, quest: 'soma_keeper', roster: ['apsara', 'deva_sentinel', 'radiant_deva', 'kinnara'] },
      { name: 'The Radiant Stair', kind: 'field', d: 6, wp: 1, cave2: 7, paved: 1, roster: ['deva_sentinel', 'radiant_deva', 'white_elephant', 'bliss_wisp'] },
      { name: "Brahma's Throne", kind: 'boss', d: 8, boss: 'mahabrahma' },
      { name: 'Grotto of Delight', kind: 'cave', d: 3, back: 2, mini: 'rambha', roster: ['apsara', 'bliss_wisp', 'gandharva'] },
      { name: 'Vault of the Wishing Tree', kind: 'cave', d: 7, back: 4, treasure: 1, roster: ['apsara', 'radiant_deva', 'bliss_wisp', 'deva_sentinel'] }
    ] },
  { id: 'human', name: 'Human Realm', skt: 'Manushya-gati', sub: 'The Realm of Humankind', poison: 'Desire',
    intro: 'This is the precious human birth, the one realm where awakening comes readily, and it is squandered by desire and doubt. Here the monk walks roads he knows, among fears he recognizes as his own.',
    pal: { floor: '#6e5b3c', floor2: '#5a6538', accent: '#8a7a52', grout: '#4a3d28', wall: '#77695a', wall2: '#5a4e42', trim: '#8a6a3a', voidTop: '#0f0c09', voidBot: '#0a0806', dark: 0.5, light: 8.5, amb: '#ffd9a0', paved: 0, decal: ['#7a8a3a', '#9a8a5a', '#5a3a22'], fog: '#3a3020' },
    props: ['sal_tree', 'boulder', 'dead_tree', 'hut', 'stupa_s'], caveProps: ['bones', 'pyre'],
    guide: { name: 'Jogaisho Jizo', title: 'Remover of Obstacles' },
    npcs: { merchant: 'Old Peddler Sudatta', smith: 'Cunda the Smith', gambler: 'Dice-Player Kitava', healer: 'Jogaisho Jizo' },
    areas: [
      { name: 'Deer Park Monastery', kind: 'town' },
      { name: 'Road of Merchants', kind: 'field', d: 0, roster: ['wild_dog', 'bandit', 'bandit_archer', 'carrion_crow'] },
      { name: 'The Burning Village', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['bandit', 'bandit_archer', 'mad_ascetic', 'carrion_crow'] },
      { name: 'Forest of Doubt', kind: 'field', d: 4, quest: 'bandit_chief', roster: ['doubt_wraith', 'wild_dog', 'bandit', 'mad_ascetic'] },
      { name: 'Jalini Wilds', kind: 'field', d: 6, wp: 1, cave2: 7, roster: ['rakshasa', 'doubt_wraith', 'bandit_archer', 'wild_dog'] },
      { name: 'The Hermitage of Fingers', kind: 'boss', d: 8, boss: 'angulimala' },
      { name: 'The Charnel Ground', kind: 'cave', d: 3, back: 2, mini: 'pyre_rakshasi', roster: ['charnel_ghoul', 'doubt_wraith', 'carrion_crow'] },
      { name: 'The Robbers\' Hoard', kind: 'cave', d: 7, back: 4, treasure: 1, roster: ['bandit', 'bandit_archer', 'wild_dog', 'rakshasa'] }
    ] },
  { id: 'asura', name: 'Asura Realm', skt: 'Asura-gati', sub: 'The Realm of the Titans', poison: 'Jealousy',
    intro: 'The titans wage an endless war against the gods for the fruit of a tree whose roots are theirs and whose fruit is not. Jealousy is their poison, and every victory feeds the next war.',
    pal: { floor: '#5c2a20', floor2: '#44201a', accent: '#8a3a22', grout: '#2a120e', wall: '#6a3a2c', wall2: '#4a241c', trim: '#a8742a', voidTop: '#140605', voidBot: '#0a0302', dark: 0.55, light: 8, amb: '#ffb080', paved: 0, decal: ['#8a1a12', '#3a1a12', '#a8742a'], fog: '#3a0a06' },
    props: ['spire', 'spears', 'bonepile', 'banner', 'chariot'], caveProps: ['anvil', 'spire'],
    guide: { name: 'Jiji Jizo', title: 'Holder of the Earth' },
    npcs: { merchant: 'Quartermaster Prahlada', smith: 'Armourer Maya', gambler: 'Spoils-Caster Bali', healer: 'Jiji Jizo' },
    areas: [
      { name: 'Truce Shrine', kind: 'town' },
      { name: 'Fields of Blood', kind: 'field', d: 0, roster: ['jealous_flame', 'asura_warrior', 'asura_archer'] },
      { name: 'War Camps of the Titans', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['asura_warrior', 'asura_archer', 'war_drummer', 'jealous_flame'] },
      { name: 'The Shattered Rampart', kind: 'field', d: 4, quest: 'moon_thief', roster: ['asura_warrior', 'rahu_spawn', 'asura_brute', 'asura_archer'] },
      { name: 'Citadel Beneath the Sea', kind: 'field', d: 6, wp: 1, cave2: 7, paved: 1, roster: ['asura_brute', 'war_drummer', 'rahu_spawn', 'jealous_flame'] },
      { name: 'Altar of Eclipse', kind: 'boss', d: 8, boss: 'rahu' },
      { name: 'Forge of Envy', kind: 'cave', d: 3, back: 2, mini: 'forge_champion', roster: ['jealous_flame', 'asura_warrior', 'asura_brute'] },
      { name: 'Armoury of Vemacitrin', kind: 'cave', d: 7, back: 4, treasure: 1, roster: ['asura_warrior', 'asura_brute', 'forge_smith', 'asura_archer'] }
    ] },
  { id: 'animal', name: 'Animal Realm', skt: 'Tiryak-gati', sub: 'The Realm of Beasts', poison: 'Ignorance',
    intro: 'In the animal realm beings live by instinct, hunting and hunted, unable to question. Ignorance is the poison here. It is not evil, only a darkness that never asks why.',
    pal: { floor: '#2f4a2a', floor2: '#44402a', accent: '#4a7a3a', grout: '#1a2a18', wall: '#244a26', wall2: '#163018', trim: '#5a8a3a', voidTop: '#040a05', voidBot: '#020502', dark: 0.62, light: 7.5, amb: '#c8ffb0', paved: 0, decal: ['#6aa04a', '#3a5a2a', '#8a7a3a'], fog: '#0a2010' },
    props: ['banyan', 'fern', 'bamboo', 'mossrock', 'mound'], caveProps: ['mossrock', 'eggs'],
    guide: { name: 'Hoin Jizo', title: 'Bearer of the Seal' },
    npcs: { merchant: 'Mahakapi the Monkey King', smith: 'The Elephant Smith Chaddanta', gambler: 'The Jackal Gambler', healer: 'Hoin Jizo' },
    areas: [
      { name: 'Banyan of the Deer King', kind: 'town' },
      { name: 'The Tangled Jungle', kind: 'field', d: 0, roster: ['locust', 'tiger', 'ape', 'vulture'] },
      { name: 'Serpent Marsh', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['serpent', 'croc', 'locust', 'boar'] },
      { name: "Hunters' Ground", kind: 'field', d: 4, quest: 'hunter_chief', roster: ['boar', 'tiger', 'vulture', 'ape'] },
      { name: 'The Dim Wilds', kind: 'field', d: 6, wp: 1, cave2: 7, roster: ['croc', 'tiger', 'serpent', 'locust'] },
      { name: 'Hub of the Wheel', kind: 'boss', d: 8, boss: 'three_poisons' },
      { name: 'Naga Grotto', kind: 'cave', d: 3, back: 2, mini: 'naga_matriarch', roster: ['naga_warrior', 'serpent', 'locust'] },
      { name: 'Den of the Tiger Mother', kind: 'cave', d: 7, back: 4, treasure: 1, roster: ['tiger', 'boar', 'ape', 'locust'] }
    ] },
  { id: 'preta', name: 'Preta Realm', skt: 'Preta-gati', sub: 'The Realm of Hungry Ghosts', poison: 'Craving',
    intro: 'The hungry ghosts have mouths like the eye of a needle and bellies like mountains. Food turns to fire in their throats. Craving is the poison: the more they seek, the less they can receive.',
    pal: { floor: '#6a6150', floor2: '#57503f', accent: '#8a8060', grout: '#3a3428', wall: '#6a604e', wall2: '#4a4234', trim: '#7a9a6a', voidTop: '#0a0a08', voidBot: '#050504', dark: 0.62, light: 7.5, amb: '#d0ffd8', paved: 0, decal: ['#8a8a6a', '#4a4436', '#a8a080'], fog: '#1a2a1a' },
    props: ['dead_tree', 'urns', 'lantern', 'bonepile', 'shrine_ruin'], caveProps: ['urns', 'bones'],
    guide: { name: 'Hoju Jizo', title: 'Bearer of the Wish-Granting Jewel' },
    npcs: { merchant: 'The Fed Ghost Uttara', smith: 'Bronze-Throat', gambler: 'The Alms-Bowl Gambler', healer: 'Hoju Jizo' },
    areas: [
      { name: 'Ullambana Lantern Shrine', kind: 'town' },
      { name: 'The Ashen Plain', kind: 'field', d: 0, roster: ['pin_throat', 'preta', 'corpse_eater'] },
      { name: 'Parched Riverbed', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['preta', 'flame_mouth', 'pin_throat', 'lantern_ghost'] },
      { name: 'Wailing Gorge', kind: 'field', d: 4, quest: 'mothers_captor', roster: ['ash_wraith', 'corpse_eater', 'lantern_ghost', 'pin_throat'] },
      { name: 'City of Hunger', kind: 'field', d: 6, wp: 1, cave2: 7, paved: 1, roster: ['glutton_grub', 'flame_mouth', 'ash_wraith', 'preta'] },
      { name: 'Pit of the Flaming Mouth', kind: 'boss', d: 8, boss: 'ulkamukha' },
      { name: 'The Empty Granary', kind: 'cave', d: 3, back: 2, mini: 'glutton_belly', roster: ['preta', 'glutton_grub', 'pin_throat'] },
      { name: 'Tomb of the Miser', kind: 'cave', d: 7, back: 4, treasure: 1, roster: ['preta', 'glutton_grub', 'lantern_ghost', 'pin_throat'] }
    ] },
  { id: 'naraka', name: 'Naraka', skt: 'Naraka-gati', sub: 'The Hell Realms', poison: 'Hatred',
    intro: 'The hells are made of hatred. Their wardens are anger given iron and flame. Beings here die and revive and die again until their karma is spent. At the bottom lies Avici, where suffering has no interval, and there Mara waits.',
    pal: { floor: '#271c19', floor2: '#3a1a12', accent: '#ff5a1a', grout: '#120a08', wall: '#221a1a', wall2: '#140e0e', trim: '#ff6a2a', voidTop: '#080202', voidBot: '#030101', dark: 0.7, light: 7.5, amb: '#ff9a70', paved: 0, lava: 1, decal: ['#ff4a12', '#3a0a06', '#6a2a1a'], fog: '#2a0602' },
    props: ['obsidian', 'swordtree', 'spikes', 'brazier', 'cauldron'], caveProps: ['icespike', 'frozen'],
    guide: { name: 'Danda Jizo', title: 'Staff-Bearer of the Hells' },
    npcs: { merchant: 'The Repentant Warden', smith: 'Iron-Chain Smith', gambler: "Yama's Clerk", healer: 'Danda Jizo' },
    areas: [
      { name: "Kshitigarbha's Refuge", kind: 'town' },
      { name: 'Reviving Hell', kind: 'field', d: 0, roster: ['damned', 'hell_crow', 'burning_soul'] },
      { name: 'Black Thread Hell', kind: 'field', d: 2, wp: 1, cave: 6, roster: ['damned', 'ox_head', 'hell_hound', 'hell_crow'] },
      { name: 'Crushing Hell', kind: 'field', d: 4, quest: 'mirror_bearer', roster: ['horse_face', 'ox_head', 'burning_soul', 'sword_leaf'] },
      { name: 'Hell of Great Heat', kind: 'field', d: 6, wp: 1, cave2: 7, roster: ['hell_hound', 'sword_leaf', 'burning_soul', 'horse_face'] },
      { name: 'Avici', kind: 'boss', d: 8, boss: 'mara' },
      { name: 'Cold Hell of Arbuda', kind: 'cave', d: 3, back: 2, mini: 'gozu_mezu', cold: 1, roster: ['ice_damned', 'hell_crow', 'damned'] },
      { name: 'Vault of Yama\'s Ledgers', kind: 'cave', d: 7, back: 4, treasure: 1, cold: 0, roster: ['horse_face', 'ox_head', 'burning_soul', 'hell_hound'] }
    ] }
];
const realmLvl = (r, d) => 1 + r * 8 + d;
const areaKey = (r, i) => `r${r}a${i}`;

/* ------------- monsters (level-1 baselines; scaled by level) ------------- */
// ai: melee swarm charger ranged caster exploder summoner reviver tree
const E = {};
function defE(id, o) { o.id = id; o.r = o.r || 0.34; o.res = o.res || {}; E[id] = o; }
// Deva
defE('bliss_wisp', { name: 'Bliss Wisp', ai: 'swarm', hp: 8, dmg: 1.6, spd: 3.7, xp: 3, fly: 1, r: 0.26, elem: 'light', look: { body: 'wisp', col: '#ffe8a0', col2: '#fff', eye: '#ff9ab8', h: 18 } });
defE('apsara', { name: 'Apsara Dancer', ai: 'melee', hp: 20, dmg: 4, spd: 3.3, xp: 6, look: { body: 'human', h: 42, skin: '#e8b890', cloth: '#e8789a', cloth2: '#f8e0a0', head: 'crown', scarf: '#ffb0c8', fem: 1, weapon: 'none' } });
defE('gandharva', { name: 'Gandharva Musician', ai: 'ranged', hp: 18, dmg: 5, spd: 2.4, xp: 7, atk: { elem: 'light', cd: 2.2, range: 6, proj: 'note', speed: 6 }, look: { body: 'human', h: 42, skin: '#d8a070', cloth: '#6a9ae0', cloth2: '#f0d060', head: 'crown', weapon: 'lute' } });
defE('kinnara', { name: 'Kinnara', ai: 'charger', hp: 24, dmg: 6, spd: 3.0, xp: 8, look: { body: 'human', h: 40, skin: '#e0b080', cloth: '#58b0a0', cloth2: '#f0e0a0', head: 'bird', wings: '#b8e8e0', weapon: 'none' } });
defE('deva_sentinel', { name: 'Deva Sentinel', ai: 'melee', hp: 46, dmg: 7, spd: 2.3, xp: 12, r: 0.42, res: { phys: 20 }, look: { body: 'human', h: 50, skin: '#e0b080', cloth: '#e8c050', cloth2: '#fff4d0', head: 'helm', weapon: 'spear', armor: '#d8b040' } });
defE('radiant_deva', { name: 'Radiant Deva', ai: 'caster', hp: 26, dmg: 8, spd: 2.2, xp: 10, atk: { elem: 'light', cd: 3, range: 7, aoe: 1.3, delay: 0.9 }, look: { body: 'human', h: 46, skin: '#f0c8a0', cloth: '#fff8e8', cloth2: '#e0b040', head: 'crown', halo: '#ffe8a0', weapon: 'staff' } });
defE('white_elephant', { name: 'Airavata Calf', ai: 'charger', hp: 72, dmg: 10, spd: 2.2, xp: 20, r: 0.62, look: { body: 'quad', kind: 'elephant', h: 44, col: '#ece8e0', col2: '#e8b050' } });
// Human
defE('wild_dog', { name: 'Pariah Dog', ai: 'swarm', hp: 13, dmg: 2.6, spd: 3.9, xp: 4, look: { body: 'quad', kind: 'dog', h: 22, col: '#8a6a44', col2: '#5a4430' } });
defE('bandit', { name: 'Highway Bandit', ai: 'melee', hp: 26, dmg: 5, spd: 2.9, xp: 7, look: { body: 'human', h: 42, skin: '#a8744a', cloth: '#5a4a3a', cloth2: '#8a2a1a', head: 'turban', weapon: 'sword' } });
defE('bandit_archer', { name: 'Bandit Archer', ai: 'ranged', hp: 20, dmg: 5, spd: 2.6, xp: 8, atk: { elem: 'phys', cd: 2, range: 7, proj: 'arrow', speed: 10 }, look: { body: 'human', h: 42, skin: '#a8744a', cloth: '#4a5a3a', cloth2: '#6a4a2a', head: 'hood', weapon: 'bow' } });
defE('doubt_wraith', { name: 'Wraith of Doubt', ai: 'melee', hp: 22, dmg: 5, spd: 3.0, xp: 8, fly: 1, elem: 'void', res: { void: 30, phys: 20 }, look: { body: 'ghost', h: 44, col: '#8a8aa0', col2: '#3a3a4a', eye: '#b8c8ff' } });
defE('mad_ascetic', { name: 'Mad Ascetic', ai: 'melee', hp: 18, dmg: 6, spd: 3.6, xp: 7, look: { body: 'human', h: 40, skin: '#b8b0a8', cloth: '#6a5a4a', cloth2: '#3a3028', head: 'hair', thin: 1, weapon: 'none' } });
defE('carrion_crow', { name: 'Carrion Crow', ai: 'swarm', hp: 10, dmg: 3, spd: 4.0, xp: 3, fly: 1, r: 0.25, look: { body: 'bird', h: 18, col: '#2a2830', col2: '#5a5460', beak: '#c8a040' } });
defE('rakshasa', { name: 'Rakshasa', ai: 'melee', hp: 62, dmg: 10, spd: 2.5, xp: 18, r: 0.5, look: { body: 'human', h: 56, skin: '#5a7a4a', cloth: '#3a1a1a', cloth2: '#c8a040', head: 'horns', fangs: 1, weapon: 'club', bulky: 1 } });
defE('charnel_ghoul', { name: 'Charnel Ghoul', ai: 'melee', hp: 30, dmg: 7, spd: 3.1, xp: 9, look: { body: 'human', h: 40, skin: '#a8b0a0', cloth: '#4a4a40', cloth2: '#2a2a24', head: 'skull', thin: 1, weapon: 'claws' } });
// Asura
defE('jealous_flame', { name: 'Envy Flame', ai: 'swarm', hp: 14, dmg: 4, spd: 3.8, xp: 4, fly: 1, elem: 'fire', r: 0.28, res: { fire: 50 }, look: { body: 'wisp', col: '#7aff5a', col2: '#ff6a1a', eye: '#fff', h: 20, flame: 1 } });
defE('asura_warrior', { name: 'Asura Warrior', ai: 'melee', hp: 40, dmg: 8, spd: 3.0, xp: 10, look: { body: 'human', h: 48, skin: '#c8402a', cloth: '#2a2a3a', cloth2: '#d8a030', head: 'crown', arms: 4, weapon: 'sword', armor: '#a87a2a' } });
defE('asura_archer', { name: 'Asura Archer', ai: 'ranged', hp: 30, dmg: 5.5, spd: 2.7, xp: 10, atk: { elem: 'phys', cd: 2.3, range: 7, proj: 'arrow', speed: 10, n: 2, spread: 0.3 }, look: { body: 'human', h: 46, skin: '#b8342a', cloth: '#3a2a1a', cloth2: '#d8a030', head: 'helm', arms: 4, weapon: 'bow' } });
defE('asura_brute', { name: 'Asura Titan', ai: 'melee', hp: 115, dmg: 13, spd: 2.2, xp: 28, r: 0.7, res: { phys: 15 }, look: { body: 'human', h: 70, skin: '#9a2a1e', cloth: '#1a1a22', cloth2: '#c89030', head: 'horns', arms: 4, weapon: 'club', bulky: 1, fangs: 1 } });
defE('war_drummer', { name: 'War Drummer', ai: 'caster', hp: 36, dmg: 9, spd: 2.3, xp: 12, atk: { elem: 'fire', cd: 3.2, range: 7, aoe: 1.5, delay: 1.0 }, look: { body: 'human', h: 46, skin: '#c8402a', cloth: '#5a1a12', cloth2: '#e8b040', head: 'turban', arms: 4, weapon: 'drum' } });
defE('rahu_spawn', { name: 'Eclipse Head', ai: 'charger', hp: 30, dmg: 9, spd: 3.2, xp: 10, fly: 1, res: { cold: 20 }, look: { body: 'head', h: 30, col: '#2a3a6a', col2: '#c8a040', eye: '#ffe080' } });
defE('forge_smith', { name: 'Forge Asura', ai: 'caster', hp: 40, dmg: 10, spd: 2.3, xp: 12, atk: { elem: 'fire', cd: 2.8, range: 6, aoe: 1.4, delay: 0.9 }, look: { body: 'human', h: 48, skin: '#a8341e', cloth: '#1a1410', cloth2: '#ff8a2a', head: 'bald', arms: 4, weapon: 'club' } });
// Animal
defE('locust', { name: 'Locust Swarm', ai: 'swarm', hp: 12, dmg: 3, spd: 4.2, xp: 3, fly: 1, r: 0.3, look: { body: 'swarm', h: 18, col: '#8a8a3a', col2: '#4a4a1a' } });
defE('tiger', { name: 'Striped Hunger', ai: 'melee', hp: 46, dmg: 10, spd: 4.0, xp: 12, r: 0.45, look: { body: 'quad', kind: 'tiger', h: 30, col: '#e08a2a', col2: '#1a1208' } });
defE('boar', { name: 'Wild Boar', ai: 'charger', hp: 56, dmg: 11, spd: 3.0, xp: 13, r: 0.48, look: { body: 'quad', kind: 'boar', h: 28, col: '#4a3a30', col2: '#e8e0c8' } });
defE('ape', { name: 'Grey Ape', ai: 'ranged', hp: 40, dmg: 9, spd: 2.8, xp: 11, atk: { elem: 'phys', cd: 2.4, range: 6, proj: 'rock', speed: 8 }, look: { body: 'human', h: 40, skin: '#6a6a6a', cloth: '#6a6a6a', cloth2: '#4a4a4a', head: 'ape', ape: 1, weapon: 'none', bulky: 1 } });
defE('serpent', { name: 'Pit Viper', ai: 'ranged', hp: 30, dmg: 8, spd: 2.8, xp: 10, elem: 'void', res: { void: 40 }, atk: { elem: 'void', cd: 2.2, range: 5.5, proj: 'venom', speed: 7 }, look: { body: 'serpent', h: 22, col: '#4a8a3a', col2: '#c8c040' } });
defE('croc', { name: 'Marsh Crocodile', ai: 'melee', hp: 115, dmg: 12, spd: 2.0, xp: 26, r: 0.66, res: { phys: 25 }, look: { body: 'quad', kind: 'croc', h: 22, col: '#3a5a32', col2: '#a8a870' } });
defE('vulture', { name: 'Vulture', ai: 'melee', hp: 28, dmg: 7, spd: 3.8, xp: 8, fly: 1, look: { body: 'bird', h: 26, col: '#4a3a30', col2: '#e8d8c0', beak: '#e8c890' } });
defE('naga_warrior', { name: 'Naga Warrior', ai: 'melee', hp: 62, dmg: 12, spd: 2.8, xp: 16, r: 0.48, res: { void: 30, cold: 20 }, look: { body: 'naga', h: 48, skin: '#4a9a7a', col: '#2a6a5a', col2: '#e8d060', weapon: 'trident' } });
// Preta
defE('pin_throat', { name: 'Needle-Throat', ai: 'swarm', hp: 16, dmg: 4, spd: 3.8, xp: 4, fly: 1, r: 0.28, look: { body: 'ghost', h: 30, col: '#9ab0a0', col2: '#3a4a40', eye: '#e0ffe0', thin: 1 } });
defE('preta', { name: 'Hungry Ghost', ai: 'melee', hp: 62, dmg: 12, spd: 1.9, xp: 14, r: 0.5, look: { body: 'human', h: 50, skin: '#9a9a80', cloth: '#5a5040', cloth2: '#3a3428', head: 'hair', belly: 1, thin: 1, weapon: 'none' } });
defE('flame_mouth', { name: 'Flame-Mouth', ai: 'ranged', hp: 40, dmg: 11, spd: 2.4, xp: 12, elem: 'fire', res: { fire: 50 }, atk: { elem: 'fire', cd: 2.4, range: 6, proj: 'fireball', speed: 7 }, look: { body: 'human', h: 46, skin: '#8a8070', cloth: '#4a3a2a', cloth2: '#ff6a1a', head: 'hair', belly: 1, thin: 1, mouthfire: 1, weapon: 'none' } });
defE('corpse_eater', { name: 'Corpse-Eater', ai: 'melee', hp: 36, dmg: 10, spd: 3.8, xp: 10, look: { body: 'human', h: 38, skin: '#7a7a62', cloth: '#3a342a', cloth2: '#2a241c', head: 'skull', thin: 1, hunch: 1, weapon: 'claws' } });
defE('ash_wraith', { name: 'Ash Wraith', ai: 'caster', hp: 38, dmg: 12, spd: 2.4, xp: 12, fly: 1, elem: 'void', res: { void: 50 }, atk: { elem: 'void', cd: 3, range: 7, aoe: 1.4, delay: 0.9 }, look: { body: 'ghost', h: 46, col: '#6a6458', col2: '#2a2620', eye: '#ff6a4a' } });
defE('lantern_ghost', { name: 'Lantern Shade', ai: 'exploder', hp: 26, dmg: 13, spd: 3.5, xp: 9, fly: 1, elem: 'cold', look: { body: 'ghost', h: 36, col: '#5a8a8a', col2: '#1a2a2a', eye: '#aaffee', lantern: '#aaffcc' } });
defE('glutton_grub', { name: 'Glutton Grub', ai: 'melee', hp: 125, dmg: 12, spd: 1.6, xp: 26, r: 0.66, look: { body: 'blob', h: 34, col: '#b8a88a', col2: '#6a5a42' } });
// Naraka
defE('hell_crow', { name: 'Iron-Beak Crow', ai: 'swarm', hp: 18, dmg: 5, spd: 4.2, xp: 4, fly: 1, r: 0.26, res: { phys: 20 }, look: { body: 'bird', h: 20, col: '#1a1818', col2: '#6a2a1a', beak: '#b8b8c8', eye: '#ff3a1a' } });
defE('burning_soul', { name: 'Burning Soul', ai: 'exploder', hp: 28, dmg: 15, spd: 3.6, xp: 8, fly: 1, elem: 'fire', res: { fire: 75 }, look: { body: 'ghost', h: 36, col: '#ff7a2a', col2: '#6a1a0a', eye: '#fff4a0', flame: 1 } });
defE('damned', { name: 'Reviving Damned', ai: 'reviver', hp: 40, dmg: 11, spd: 2.8, xp: 10, look: { body: 'human', h: 42, skin: '#6a3a2a', cloth: '#2a1a14', cloth2: '#ff5a1a', head: 'skull', thin: 1, weapon: 'none', burnt: 1 } });
defE('ox_head', { name: 'Ox-Head Warden', ai: 'melee', hp: 92, dmg: 12, spd: 2.6, xp: 22, r: 0.56, res: { fire: 30 }, look: { body: 'human', h: 60, skin: '#3a2a22', cloth: '#1a1414', cloth2: '#a83a1a', head: 'ox', weapon: 'trident', bulky: 1, armor: '#4a4a52' } });
defE('horse_face', { name: 'Horse-Face Warden', ai: 'charger', hp: 76, dmg: 12, spd: 2.9, xp: 20, r: 0.52, res: { fire: 30 }, look: { body: 'human', h: 58, skin: '#5a3a2a', cloth: '#1a1414', cloth2: '#a83a1a', head: 'horse', weapon: 'spear', armor: '#4a4a52' } });
defE('sword_leaf', { name: 'Sword-Leaf Tree', ai: 'tree', hp: 72, dmg: 13, spd: 0.7, xp: 18, r: 0.55, res: { phys: 30, fire: 20 }, atk: { elem: 'phys', cd: 2.6, range: 7, proj: 'swordleaf', speed: 8, n: 5, spread: 1.2 }, look: { body: 'tree', h: 64, col: '#3a3a44', col2: '#c8c8d8' } });
defE('hell_hound', { name: 'Hell Hound', ai: 'melee', hp: 46, dmg: 12, spd: 4.2, xp: 12, elem: 'fire', res: { fire: 50 }, look: { body: 'quad', kind: 'dog', h: 28, col: '#3a1a12', col2: '#ff5a1a', fire: 1 } });
defE('ice_damned', { name: 'Frozen Damned', ai: 'melee', hp: 56, dmg: 13, spd: 2.6, xp: 14, elem: 'cold', res: { cold: 75 }, look: { body: 'human', h: 44, skin: '#8ab8d8', cloth: '#2a3a4a', cloth2: '#c8e8ff', head: 'skull', thin: 1, weapon: 'none', icy: 1 } });

/* ------------- unique minibosses & quest monsters ------------- */
const UNIQ = {
  rambha: { base: 'apsara', name: 'Rambha, Queen of Dancers', mods: ['fast', 'light_ench'], scale: 1.6, hpMul: 10, minions: 'apsara', quest: 'q0a' },
  soma_keeper: { base: 'gandharva', name: 'Soma the Nectar-Keeper', mods: ['multishot', 'strong'], scale: 1.4, hpMul: 7, minions: 'gandharva', quest: 'q0b', drop: 'The Amrita Urn' },
  pyre_rakshasi: { base: 'rakshasa', name: 'Rakshasi of the Pyre', mods: ['fire_ench', 'strong'], scale: 1.4, hpMul: 9, minions: 'charnel_ghoul', quest: 'q1a' },
  bandit_chief: { base: 'bandit', name: 'Kalinga the Bandit Chief', mods: ['fast', 'vampiric'], scale: 1.5, hpMul: 8, minions: 'bandit', quest: 'q1b' },
  forge_champion: { base: 'asura_brute', name: "Vemacitrin's Champion", mods: ['fire_ench', 'stone'], scale: 1.3, hpMul: 7, minions: 'forge_smith', quest: 'q2a' },
  moon_thief: { base: 'rahu_spawn', name: 'Svarbhanu the Moon-Thief', mods: ['cold_ench', 'teleport'], scale: 1.9, hpMul: 9, minions: 'rahu_spawn', quest: 'q2b' },
  naga_matriarch: { base: 'naga_warrior', name: 'Naga Matriarch', mods: ['cold_ench', 'strong'], scale: 1.5, hpMul: 9, minions: 'naga_warrior', quest: 'q3a' },
  hunter_chief: { base: 'ape', name: 'Lubdhaka the Deer-Hunter', mods: ['multishot', 'fast'], scale: 1.4, hpMul: 8, minions: 'tiger', quest: 'q3b', look: { body: 'human', h: 44, skin: '#8a5a3a', cloth: '#4a3a1a', cloth2: '#8a8a3a', head: 'hood', weapon: 'bow' }, atk: { elem: 'phys', cd: 1.8, range: 7, proj: 'arrow', speed: 12 } },
  glutton_belly: { base: 'glutton_grub', name: 'The Bottomless Belly', mods: ['vampiric', 'stone'], scale: 1.7, hpMul: 9, minions: 'preta', quest: 'q4a' },
  mothers_captor: { base: 'ash_wraith', name: 'Warden of Craving', mods: ['mana_burn', 'teleport'], scale: 1.5, hpMul: 9, minions: 'pin_throat', quest: 'q4b' },
  gozu_mezu: { base: 'ox_head', name: 'Gozu, Ox-Headed Gaoler', mods: ['cold_ench', 'strong'], scale: 1.4, hpMul: 8, minions: 'ice_damned', quest: 'q5a', partner: 'mezu' },
  mezu: { base: 'horse_face', name: 'Mezu, Horse-Faced Gaoler', mods: ['fast', 'cold_ench'], scale: 1.4, hpMul: 7, minions: null },
  mirror_bearer: { base: 'ox_head', name: 'Clerk of the Karma Mirror', mods: ['aura_might', 'light_ench'], scale: 1.4, hpMul: 9, minions: 'damned', quest: 'q5b' }
};
const ELITE_MODS = {
  strong: 'Extra Strong', fast: 'Extra Fast', stone: 'Stone Skin', fire_ench: 'Fire Enchanted', cold_ench: 'Cold Enchanted',
  light_ench: 'Lightning Enchanted', vampiric: 'Vampiric', multishot: 'Multiple Shots', teleport: 'Teleportation', aura_might: 'Might Aura',
  aura_freeze: 'Holy Freeze', mana_burn: 'Mana Burn'
};
const UNAME_A = ['Kala', 'Vritra', 'Ghora', 'Mahisa', 'Kumbha', 'Dhumra', 'Rakta', 'Tamas', 'Asita', 'Bhima', 'Krura', 'Durmukha', 'Vikata', 'Canda', 'Mudha', 'Lobha', 'Dvesa', 'Mana', 'Irshya', 'Trishna', 'Soma', 'Hema', 'Ratna', 'Indu'];
const UNAME_B = ['the Hungry', 'Bone-Gnawer', 'the Jealous', 'Iron-Tooth', 'the Deceiver', 'Soul-Flayer', 'the Unrepentant', 'Ash-Born', 'the Proud', 'Gold-Tongue', 'the Grasping', 'Night-Eye', 'the Unmoved', 'Blood-Drinker', 'the Lost', 'Thorn-Heart', 'the Bitter', 'Cloud-Treader', 'the Hollow', 'Fire-Throat'];

/* ------------- bosses ------------- */
const BOSSES = {
  mahabrahma: { name: 'Mahabrahma', title: 'Who Believes Himself the Creator', hp: 850, dmg: 8, r: 1.3, h: 150, realm: 0 },
  angulimala: { name: 'Angulimala', title: 'Garland of Fingers', hp: 950, dmg: 9, r: 0.8, h: 90, realm: 1 },
  rahu: { name: 'Rahu', title: 'Devourer of the Sun', hp: 1050, dmg: 10, r: 1.6, h: 150, realm: 2 },
  three_poisons: { name: 'The Three Poisons', title: 'Greed, Hatred and Delusion', hp: 380, dmg: 10, r: 1.0, h: 80, realm: 3 },
  ulkamukha: { name: 'Ulkamukha', title: 'The Flaming Mouth', hp: 1100, dmg: 11, r: 1.4, h: 160, realm: 4 },
  mara: { name: 'Mara', title: 'Lord of Illusion and Death', hp: 950, dmg: 11, r: 1.5, h: 180, realm: 5 }
};

/* ------------- quests ------------- */
const QUESTS = [
  { id: 'q0a', realm: 0, name: 'The Garden of Distraction', obj: 'Slay Rambha in the Grotto of Delight, beneath Nandana Grove.', reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'In Nandana Grove there is a grotto where the apsaras dance, and their queen Rambha has never let a pilgrim leave. Those who watch her forget why they came. Go and end the dance, so that the next pilgrim may pass.',
    done: 'The music has stopped. Take this lesson with you: a pleasure that keeps you from the path is a chain, however golden. Your mind is freer now.' },
  { id: 'q0b', realm: 0, name: 'The Nectar of Forgetting', obj: 'Take the Amrita Urn from Soma the Nectar-Keeper in the Halls of the Thirty-Three.', reward: { stat: 5 }, rtext: '+5 Attribute Points',
    give: 'The gods drink amrita and believe themselves deathless. A gandharva named Soma guards the urn in the Halls of the Thirty-Three. Bring it to me. The nectar is not wicked; the belief it feeds is.',
    done: 'The Amrita Urn. Do not drink it for the long life it promises. Pour it out as an offering, and let the merit of that offering strengthen you instead.' },
  { id: 'q0c', realm: 0, name: "The Creator's Delusion", obj: "Defeat Mahabrahma at Brahma's Throne.", reward: { next: 1 }, rtext: 'The way to the Human Realm',
    give: 'Above the Radiant Stair sits Mahabrahma. He was the first being to appear when this world formed, and so he believes he made it. His pride holds the whole heaven in place. Show him that he is not the author of anything.',
    done: 'Mahabrahma bows. Even the highest god was only another being on the wheel. Go down now, into the realm of humans.' },
  { id: 'q1a', realm: 1, name: 'The Charnel Ground', obj: 'Slay the Rakshasi of the Pyre in the Charnel Ground, beneath the Burning Village.', reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'Monks go to the charnel ground to meditate on death. Now a rakshasi feeds there, and no one sits among the pyres. Cleanse it, and it can again teach what it is meant to teach.',
    done: 'The pyres burn quietly again. Remember what you saw there. Everything that is born must die, and that is not cause for despair. It is the reason to walk the path now.' },
  { id: 'q1b', realm: 1, name: 'Tools of the Road', obj: 'Defeat Kalinga the Bandit Chief in the Forest of Doubt.', reward: { imbue: 1 }, rtext: 'Cunda the Smith will imbue an item',
    give: 'Kalinga and his bandits have taken every traveller\'s goods on the forest road, including the tools of Cunda the smith. Defeat him and Cunda will repay you with his craft.',
    done: 'Cunda has his hammer back. He has promised to work one of your items into something finer. Speak with him when you are ready.' },
  { id: 'q1c', realm: 1, name: 'The Garland of Fingers', obj: 'Confront Angulimala at the Hermitage of Fingers.', reward: { next: 1 }, rtext: 'The way to the Asura Realm',
    give: 'In the Jalini Wilds lives Angulimala, who was taught that a thousand fingers would buy him wisdom. He wears them strung around his neck. Many have tried to kill him. You must stop him, which is not the same thing.',
    done: '"I have stopped," the Buddha told him long ago. "It is you who have not stopped." Angulimala has stopped. Go on, down to the realm of the titans.' },
  { id: 'q2a', realm: 2, name: 'The Forge of Envy', obj: "Slay Vemacitrin's Champion in the Forge of Envy, beneath the War Camps.", reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'Beneath the war camps the asuras forge weapons for a war they can never win. Their champion guards the fires. Put them out.',
    done: 'The forge is cold. For a moment, at least, one less weapon will be made. That is how peace begins: one less weapon.' },
  { id: 'q2b', realm: 2, name: 'The Stolen Moon', obj: 'Defeat Svarbhanu the Moon-Thief on the Shattered Rampart.', reward: { life: 30 }, rtext: '+30 Maximum Life',
    give: 'Svarbhanu, herald of Rahu, has stolen the light of the moon and hides it on the Shattered Rampart. Without it the asuras cannot see how far their war has taken them from home. Win it back.',
    done: 'The moonlight is free. Drink of it: its coolness will stay in your body, a reserve of life for what is still to come.' },
  { id: 'q2c', realm: 2, name: 'Eclipse', obj: 'Defeat Rahu at the Altar of Eclipse.', reward: { next: 1 }, rtext: 'The way to the Animal Realm',
    give: 'Rahu stole the nectar of the gods and lost his body for it. Only his head remains, and still he chases the sun and moon to swallow them. They always pass through him. Envy is like that. Face him.',
    done: 'The eclipse ends; the sun passes through. Go down now, into the realm of beasts.' },
  { id: 'q3a', realm: 3, name: 'Nest of the Naga', obj: 'Slay the Naga Matriarch in the Naga Grotto, beneath Serpent Marsh.', reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'Not all nagas are wicked. Mucalinda sheltered the Buddha from a storm. But the matriarch of the marsh grotto has forgotten that she was ever anything but hunger. Free her from it.',
    done: 'The grotto is silent. The nagas that remain may yet remember kinder ways.' },
  { id: 'q3b', realm: 3, name: 'The Banyan Deer', obj: "Defeat Lubdhaka the Deer-Hunter in the Hunters' Ground.", reward: { res: 10 }, rtext: '+10 to All Resistances',
    give: 'Once the Bodhisattva was born as a deer king who offered his own life so that a pregnant doe would be spared. The hunter Lubdhaka hunts his herd still. Stop him.',
    done: 'The deer drink at the river without fear. The deer king\'s blessing will keep you from harm.' },
  { id: 'q3c', realm: 3, name: 'The Three Poisons', obj: 'Defeat the Rooster, the Snake and the Pig at the Hub of the Wheel.', reward: { next: 1 }, rtext: 'The way to the Preta Realm',
    give: 'At the hub of the Wheel of Life, three animals chase one another\'s tails: the rooster of greed, the snake of hatred, the pig of delusion. They turn the whole wheel. Stop them.',
    done: 'With the hub stilled, the wheel slows. Go down, into the realm of the hungry ghosts.' },
  { id: 'q4a', realm: 4, name: 'The Empty Granary', obj: 'Slay the Bottomless Belly in the Empty Granary, beneath the Parched Riverbed.', reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'There is a granary under the riverbed, and something in it eats everything that is offered there before the ghosts can receive it. Find it.',
    done: 'The granary is quiet. Offerings made there will reach the ghosts again.' },
  { id: 'q4b', realm: 4, name: 'Ullambana', obj: 'Defeat the Warden of Craving in the Wailing Gorge and free the mother of Maudgalyayana.', reward: { stat: 5, item: 'unique' }, rtext: '+5 Attribute Points and a gift',
    give: 'The monk Maudgalyayana found his mother here, starving, and his offerings turned to fire in her mouth. Only offerings made by the whole Sangha could free her. The Warden of Craving holds her still in the Wailing Gorge. Make your offering.',
    done: 'She is free, and she thanks you with her son\'s gift. Every year, on the fifteenth day of the seventh month, the living remember her and feed the ghosts. Now you know why.' },
  { id: 'q4c', realm: 4, name: 'The Flaming Mouth', obj: 'Defeat Ulkamukha in the Pit of the Flaming Mouth.', reward: { next: 1 }, rtext: 'The way to Naraka',
    give: 'Ulkamukha, the ghost whose mouth is fire, once appeared to Ananda and foretold his death. Ananda answered with the first offering to the ghosts. Answer Ulkamukha too, in your way.',
    done: 'The fire in its throat is out. Only the hells remain. Go down, and go carefully.' },
  { id: 'q5a', realm: 5, name: 'The Cold Hell', obj: 'Defeat Gozu and Mezu in the Cold Hell of Arbuda, beneath Black Thread Hell.', reward: { skill: 1 }, rtext: '+1 Skill Point',
    give: 'Not every hell burns. Beneath Black Thread Hell lies Arbuda, where the cold raises blisters on the skin of the damned. The gaolers Ox-Head and Horse-Face keep it. Break their keys.',
    done: 'The gaolers are gone. The ice will thaw a little now.' },
  { id: 'q5b', realm: 5, name: 'The Mirror of Karma', obj: 'Defeat the Clerk of the Karma Mirror in the Crushing Hell.', reward: { skill: 2 }, rtext: '+2 Skill Points',
    give: 'Yama\'s mirror shows every being its own deeds. A clerk has stolen it and shows the damned only their worst moments, so that they never repent. Take it from him.',
    done: 'Look into it if you wish. It shows you as you are: a monk, seated, meditating. You have not moved at all.' },
  { id: 'q5c', realm: 5, name: 'Mara', obj: 'Descend to Avici and defeat Mara.', reward: { end: 1 }, rtext: 'Awakening',
    give: 'Mara waits at the bottom of Avici, as he waited beneath the Bodhi tree. He will offer you everything, then threaten you with everything. Neither is real. When you have seen that, touch the earth.',
    done: '' }
];
const QMAP = {}; for (const q of QUESTS) QMAP[q.id] = q;

const GUIDE_LINES = [
  ['Welcome, pilgrim. You sit beneath a tree in the waking world, but here you walk. I am Kshitigarbha, as the sun-bright guardian of the gods. I have vowed to walk every realm until the last hell is empty, so we will meet again in each of them.', 'These heavens are sweet. That is their danger.'],
  ['You have fallen from the heavens into the human realm, as every god eventually does. This birth is the rarest of all. Do not waste it.', 'Desire makes a road look shorter than it is.'],
  ['The asuras will fight you because you are not them. Do not fight them for the same reason.', 'Every war here is over a fruit no one can eat.'],
  ['The beasts here are not your enemies. They are what you become when you stop asking questions.', 'Walk carefully. Everything here is hungry, or afraid, or both.'],
  ['Offer what you can here. The ghosts cannot receive it, but offering is not only for them.', 'Craving is a mouth that grows smaller the more it wants.'],
  ['This is my true home. I carry this staff so its rings will warn the small creatures of my coming. The hells are made by minds, and minds can unmake them.', 'Mara is not a stranger. You have met him every time you were afraid.']
];
