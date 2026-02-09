// Quest SDK - utilities for quest status and helpers
// All quest status is inferred from live game state (varps + messages).

import type { BotSDK } from './index';
import type { BotWorldState, GameMessage, DialogState, NearbyNpc, NearbyLoc } from './types';

export const QUEST_NAMES = [
    "Black Knight's Fortress",
    "Cook's Assistant",
    "Demon Slayer",
    "Doric's Quest",
    "Dragon Slayer",
    "Earnest the Chicken",
    "Goblin Diplomacy",
    "The Knight's Sword",
    "Imp Catcher",
    "Pirate's Treasure",
    "Prince Ali Rescue",
    "The Restless Ghost",
    "Romeo & Juliet",
    "Rune Mysteries Quest",
    "Sheep Shearer",
    "Shield of Arrav",
    "Vampire Slayer",
    "Witch's Potion",
    "Big Chompy Bird Hunting",
    "Biohazard",
    "Clock Tower",
    "Digsite Quest",
    "Drudic Ritual",
    "Dwarf Cannon",
    "Family Crest",
    "Fight Arena",
    "Fishing Contest",
    "Gertrude's Cat",
    "The Grand Tree",
    "Hazeel Cult",
    "Hero's Quest",
    "Holy Grail",
    "Jungle Potion",
    "Legends Quest",
    "Lost City",
    "Merlin's Crystal",
    "Monk's Friend",
    "Murder Mystery",
    "Observatory Quest",
    "Plague City",
    "Scorpion Catcher",
    "Sea Slug Quest",
    "Sheep Herder",
    "Shilo Village",
    "Temple of Ikov",
    "The Tourist Trap",
    "Tree Gnome Village",
    "Tribal Totem",
    "Underground Pass",
    "Watch Tower",
    "Waterfall Quest",
    "Witches House",
    "Elemental Workshop",
    "Priest In Peril"
] as const;

export type QuestName = (typeof QUEST_NAMES)[number];
export type QuestStatus = 'not_started' | 'started' | 'completed';

export interface QuestDefinition {
    id: number;
    name: QuestName;
    slug: string;
    requires?: QuestName[];
    minQuestPoints?: number;
}

export interface QuestCompletionInfo {
    isCompleted: boolean;
    questName?: string;
    completionMessage?: string;
    completionTick?: number;
}

export interface QuestStartInfo {
    isStarted: boolean;
    questName?: string;
    startMessage?: string;
    startTick?: number;
}

type WorldStateWithVarps = BotWorldState & { varps?: number[] };

// ============ Varp Data ============

type QuestVarpId = number;

const QUEST_VARP_IDS: Record<QuestName, QuestVarpId> = {
    "Black Knight's Fortress": 130, // spy
    "Cook's Assistant": 29, // cookquest
    "Demon Slayer": 222, // demonstart
    "Doric's Quest": 31, // doricquest
    "Dragon Slayer": 176, // dragonquest
    "Earnest the Chicken": 32, // haunted
    "Goblin Diplomacy": 62, // goblinquest
    "The Knight's Sword": 122, // squire
    "Imp Catcher": 160, // imp
    "Pirate's Treasure": 71, // hunt
    "Prince Ali Rescue": 273, // princequest
    "The Restless Ghost": 107, // prieststart
    "Romeo & Juliet": 144, // rjquest
    "Rune Mysteries Quest": 63, // runemysteries
    "Sheep Shearer": 179, // sheep
    "Shield of Arrav": 145, // blackarmgang (phoenixgang = 146)
    "Vampire Slayer": 178, // vampire
    "Witch's Potion": 67, // hetty
    "Big Chompy Bird Hunting": 293, // chompybird
    "Biohazard": 68, // biohazard
    "Clock Tower": 10, // cogquest
    "Digsite Quest": 131, // itexamlevel
    "Drudic Ritual": 80, // druidquest
    "Dwarf Cannon": 0, // mcannon
    "Family Crest": 148, // crestquest
    "Fight Arena": 17, // arenaquest
    "Fishing Contest": 11, // fishingcompo
    "Gertrude's Cat": 180, // fluffs
    "The Grand Tree": 150, // grandtree
    "Hazeel Cult": 223, // hazeelcultquest
    "Hero's Quest": 188, // heroquest
    "Holy Grail": 5, // grail
    "Jungle Potion": 175, // junglepotion
    "Legends Quest": 139, // legendsquest
    "Lost City": 147, // zanaris
    "Merlin's Crystal": 14, // arthur
    "Monk's Friend": 30, // drunkmonkquest
    "Murder Mystery": 192, // murderquest
    "Observatory Quest": 112, // itgronigen
    "Plague City": 165, // elenaquest
    "Scorpion Catcher": 76, // scorpcatcher
    "Sea Slug Quest": 159, // seaslugquest
    "Sheep Herder": 60, // sheepherderquest
    "Shilo Village": 116, // zombiequeen
    "Temple of Ikov": 26, // ikov
    "The Tourist Trap": 197, // desertrescue
    "Tree Gnome Village": 111, // treequest
    "Tribal Totem": 200, // totemquest
    "Underground Pass": 161, // upass
    "Watch Tower": 212, // itwatchtower
    "Waterfall Quest": 65, // waterfall_quest
    "Witches House": 226, // ballquest
    "Elemental Workshop": 299, // elemental_workshop_bits
    "Priest In Peril": 302 // priestperil
};

const QUEST_COMPLETE_VALUES: Record<QuestName, number> = {
    "Black Knight's Fortress": 4,
    "Cook's Assistant": 2,
    "Demon Slayer": 30,
    "Doric's Quest": 100,
    "Dragon Slayer": 10,
    "Earnest the Chicken": 3,
    "Goblin Diplomacy": 6,
    "The Knight's Sword": 7,
    "Imp Catcher": 2,
    "Pirate's Treasure": 4,
    "Prince Ali Rescue": 110,
    "The Restless Ghost": 5,
    "Romeo & Juliet": 100,
    "Rune Mysteries Quest": 6,
    "Sheep Shearer": 22,
    "Shield of Arrav": 4,
    "Vampire Slayer": 3,
    "Witch's Potion": 3,
    "Big Chompy Bird Hunting": 65,
    "Biohazard": 16,
    "Clock Tower": 8,
    "Digsite Quest": 9,
    "Drudic Ritual": 4,
    "Dwarf Cannon": 11,
    "Family Crest": 11,
    "Fight Arena": 14,
    "Fishing Contest": 5,
    "Gertrude's Cat": 6,
    "The Grand Tree": 160,
    "Hazeel Cult": 9,
    "Hero's Quest": 15,
    "Holy Grail": 10,
    "Jungle Potion": 12,
    "Legends Quest": 75,
    "Lost City": 6,
    "Merlin's Crystal": 7,
    "Monk's Friend": 80,
    "Murder Mystery": 2,
    "Observatory Quest": 7,
    "Plague City": 29,
    "Scorpion Catcher": 6,
    "Sea Slug Quest": 12,
    "Sheep Herder": 3,
    "Shilo Village": 15,
    "Temple of Ikov": 80,
    "The Tourist Trap": 30,
    "Tree Gnome Village": 9,
    "Tribal Totem": 5,
    "Underground Pass": 10,
    "Watch Tower": 13,
    "Waterfall Quest": 10,
    "Witches House": 7,
    "Elemental Workshop": 20,
    "Priest In Peril": 60
};

const QUEST_POINTS: Record<QuestName, number> = {
    "Black Knight's Fortress": 3,
    "Cook's Assistant": 1,
    "Demon Slayer": 3,
    "Doric's Quest": 1,
    "Dragon Slayer": 2,
    "Earnest the Chicken": 4,
    "Goblin Diplomacy": 5,
    "The Knight's Sword": 1,
    "Imp Catcher": 1,
    "Pirate's Treasure": 2,
    "Prince Ali Rescue": 3,
    "The Restless Ghost": 4,
    "Romeo & Juliet": 5,
    "Rune Mysteries Quest": 1,
    "Sheep Shearer": 1,
    "Shield of Arrav": 1,
    "Vampire Slayer": 3,
    "Witch's Potion": 1,
    "Big Chompy Bird Hunting": 2,
    "Biohazard": 3,
    "Clock Tower": 1,
    "Digsite Quest": 2,
    "Drudic Ritual": 4,
    "Dwarf Cannon": 1,
    "Family Crest": 1,
    "Fight Arena": 2,
    "Fishing Contest": 1,
    "Gertrude's Cat": 1,
    "The Grand Tree": 5,
    "Hazeel Cult": 1,
    "Hero's Quest": 1,
    "Holy Grail": 2,
    "Jungle Potion": 1,
    "Legends Quest": 4,
    "Lost City": 3,
    "Merlin's Crystal": 6,
    "Monk's Friend": 1,
    "Murder Mystery": 3,
    "Observatory Quest": 2,
    "Plague City": 1,
    "Scorpion Catcher": 1,
    "Sea Slug Quest": 1,
    "Sheep Herder": 4,
    "Shilo Village": 2,
    "Temple of Ikov": 1,
    "The Tourist Trap": 2,
    "Tree Gnome Village": 2,
    "Tribal Totem": 1,
    "Underground Pass": 5,
    "Watch Tower": 4,
    "Waterfall Quest": 1,
    "Witches House": 4,
    "Elemental Workshop": 1,
    "Priest In Peril": 1
};

const PHOENIX_GANG_VARP_ID = 146;
const ELEMENTAL_WORKSHOP_COMPLETE_BIT = 20;

// ============ Message/Dialog Detection ============

export function detectQuestCompletion(
    messages: GameMessage[],
    questName?: string
): QuestCompletionInfo | null {
    const completionPatterns = [
        /you have completed/i,
        /quest complete/i,
        /completed the quest/i,
        /quest finished/i
    ];

    const questSpecificPatterns: RegExp[] = [];
    if (questName) {
        const escapedName = questName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        questSpecificPatterns.push(
            new RegExp(`${escapedName}.*complete`, 'i'),
            new RegExp(`complete.*${escapedName}`, 'i')
        );
    }

    for (const msg of messages) {
        const text = msg.text.toLowerCase();
        for (const pattern of completionPatterns) {
            if (pattern.test(text)) {
                return {
                    isCompleted: true,
                    questName: questName ?? extractQuestNameFromMessage(msg.text),
                    completionMessage: msg.text,
                    completionTick: msg.tick
                };
            }
        }
        for (const pattern of questSpecificPatterns) {
            if (pattern.test(text)) {
                return {
                    isCompleted: true,
                    questName,
                    completionMessage: msg.text,
                    completionTick: msg.tick
                };
            }
        }
    }

    return null;
}

export function detectQuestStart(
    messages: GameMessage[],
    questName?: string
): QuestStartInfo | null {
    const startPatterns = [
        /quest started/i,
        /started.*quest/i,
        /begin.*quest/i,
        /accepted.*quest/i,
        /you have started/i
    ];

    const questSpecificPatterns: RegExp[] = [];
    if (questName) {
        const escapedName = questName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        questSpecificPatterns.push(
            new RegExp(`${escapedName}.*start`, 'i'),
            new RegExp(`start.*${escapedName}`, 'i')
        );
    }

    for (const msg of messages) {
        const text = msg.text.toLowerCase();
        for (const pattern of startPatterns) {
            if (pattern.test(text)) {
                return {
                    isStarted: true,
                    questName: questName ?? extractQuestNameFromMessage(msg.text),
                    startMessage: msg.text,
                    startTick: msg.tick
                };
            }
        }
        for (const pattern of questSpecificPatterns) {
            if (pattern.test(text)) {
                return {
                    isStarted: true,
                    questName,
                    startMessage: msg.text,
                    startTick: msg.tick
                };
            }
        }
    }

    return null;
}

export function detectQuestStartFromDialog(
    dialog: DialogState,
    questName?: string
): QuestStartInfo | null {
    if (!dialog.isOpen || !dialog.text) return null;

    const text = dialog.text.toLowerCase();
    const questLower = questName?.toLowerCase() || '';

    const inProgressPatterns = [
        /you.*help/i,
        /you.*started/i,
        /you.*doing/i,
        /how.*going/i,
        /progress/i,
        /need.*help/i,
        /bring.*me/i,
        /collect/i,
        /gather/i
    ];

    if (questName && text.includes(questLower)) {
        for (const pattern of inProgressPatterns) {
            if (pattern.test(text)) {
                return {
                    isStarted: true,
                    questName,
                    startMessage: dialog.text,
                    startTick: Date.now()
                };
            }
        }
    }

    if (dialog.options) {
        const questOptionPatterns = [/bring/i, /collect/i, /gather/i, /find/i, /get/i, /hand.*in/i, /give/i];
        for (const option of dialog.options) {
            const optionText = option.text.toLowerCase();
            for (const pattern of questOptionPatterns) {
                if (pattern.test(optionText)) {
                    return {
                        isStarted: true,
                        questName,
                        startMessage: `Dialog option: ${option.text}`,
                        startTick: Date.now()
                    };
                }
            }
        }
    }

    return null;
}

function extractQuestNameFromMessage(message: string): QuestName | undefined {
    const lowerMessage = message.toLowerCase();
    for (const questName of QUEST_NAMES) {
        const questWords = questName.toLowerCase().split(/\s+/);
        const allWordsPresent = questWords.every(word => {
            if (['the', 'a', 'an'].includes(word)) return true;
            return lowerMessage.includes(word);
        });

        if (allWordsPresent && questWords.length > 1) {
            return questName;
        }
    }

    return undefined;
}

// ============ Varp Helpers ============

function getVarp(state: WorldStateWithVarps | null, varpId: number): number | null {
    if (!state?.varps) return null;
    const value = state.varps[varpId];
    return value === undefined ? null : value;
}

function testBit(value: number, bitIndex: number): boolean {
    return (value & (1 << bitIndex)) !== 0;
}

function getQuestCompletionFromVarps(state: BotWorldState | null, questName: QuestName): QuestStatus | null {
    const varpId = QUEST_VARP_IDS[questName];
    const progress = getVarp(state, varpId);
    if (progress === null) return null;

    if (questName === 'Shield of Arrav') {
        const phoenix = getVarp(state, PHOENIX_GANG_VARP_ID) ?? 0;
        if (progress >= QUEST_COMPLETE_VALUES[questName] || phoenix >= 10) return 'completed';
        if (progress > 0 || phoenix > 0) return 'started';
        return 'not_started';
    }

    if (questName === 'Elemental Workshop') {
        if (testBit(progress, ELEMENTAL_WORKSHOP_COMPLETE_BIT)) return 'completed';
        if (progress > 0) return 'started';
        return 'not_started';
    }

    const completeValue = QUEST_COMPLETE_VALUES[questName];
    if (progress >= completeValue) return 'completed';
    if (progress > 0) return 'started';
    return 'not_started';
}

// ============ Quest Status ============

export function checkQuestCompleted(state: BotWorldState | null, questName: QuestName): boolean {
    const statusFromVarps = getQuestCompletionFromVarps(state, questName);
    if (statusFromVarps === 'completed') return true;

    if (state?.gameMessages) {
        const completion = detectQuestCompletion(state.gameMessages, questName);
        if (completion?.isCompleted) return true;
    }

    return false;
}

export function checkQuestStarted(state: BotWorldState | null, questName: QuestName): boolean {
    const statusFromVarps = getQuestCompletionFromVarps(state, questName);
    if (statusFromVarps === 'started' || statusFromVarps === 'completed') return true;

    if (state?.gameMessages) {
        const startInfo = detectQuestStart(state.gameMessages, questName);
        if (startInfo?.isStarted) return true;
    }

    if (state?.dialog) {
        const dialogStart = detectQuestStartFromDialog(state.dialog, questName);
        if (dialogStart?.isStarted) return true;
    }

    if (state?.recentDialogs) {
        for (const dialog of state.recentDialogs) {
            if (dialog.text) {
                const dialogState: DialogState = {
                    isOpen: false,
                    options: [],
                    isWaiting: false,
                    text: dialog.text.join(' ')
                };
                const dialogStart = detectQuestStartFromDialog(dialogState, questName);
                if (dialogStart?.isStarted) return true;
            }
        }
    }

    return false;
}

export function getQuestStatus(state: BotWorldState | null, questName: QuestName): QuestStatus {
    if (!state) return 'not_started';

    const statusFromVarps = getQuestCompletionFromVarps(state, questName);
    if (statusFromVarps) return statusFromVarps;

    if (checkQuestCompleted(state, questName)) return 'completed';
    if (checkQuestStarted(state, questName)) return 'started';
    return 'not_started';
}

export function getQuestPoints(state: BotWorldState | null): number {
    if (!state) return 0;
    let total = 0;
    for (const questName of QUEST_NAMES) {
        if (getQuestStatus(state, questName) === 'completed') {
            total += QUEST_POINTS[questName] || 0;
        }
    }
    return total;
}

export function getQuestProgress(state: BotWorldState | null, questName: QuestName): number | null {
    const varpId = QUEST_VARP_IDS[questName];
    return getVarp(state, varpId);
}

// ============ Quest NPC/Location Helpers ============

export function findQuestNpc(
    sdk: BotSDK,
    questName: QuestName,
    pattern?: RegExp
): NearbyNpc | null {
    if (pattern) return sdk.findNearbyNpc(pattern);

    const questNpcPatterns: Partial<Record<QuestName, RegExp>> = {
        "Cook's Assistant": /cook/i,
        "The Restless Ghost": /father|aereck|ghost/i,
        "Sheep Shearer": /farmer|fred/i,
        "Romeo & Juliet": /romeo|juliet/i,
        "Doric's Quest": /doric/i,
        "Imp Catcher": /wizard|mizgog/i,
        "Pirate's Treasure": /redbeard|frank|luthas/i,
        "Prince Ali Rescue": /hassan|osman|leela|keli|joe|otto/i,
        "Black Knight's Fortress": /sir.*amik|black.*knight/i,
        "Demon Slayer": /gypsy|aris|wise.*old.*man/i,
        "Dragon Slayer": /guildmaster|oziach/i,
        "Goblin Diplomacy": /wartface|bentnoze/i,
        "The Knight's Sword": /sir.*vyvin|thurgo/i,
        "Vampire Slayer": /hovenden|draynor/i,
        "Witch's Potion": /hetty/i,
        "Rune Mysteries Quest": /horacio|sedridor|aubury/i
    };

    const matchingPattern = questNpcPatterns[questName];
    if (matchingPattern) return sdk.findNearbyNpc(matchingPattern);

    const questWords = questName.split(/\s+/).filter(w => w.length > 3);
    for (const word of questWords) {
        const npc = sdk.findNearbyNpc(new RegExp(word, 'i'));
        if (npc) return npc;
    }

    return null;
}

export function findQuestLocation(
    sdk: BotSDK,
    questName: QuestName,
    pattern?: RegExp
): NearbyLoc | null {
    if (pattern) return sdk.findNearbyLoc(pattern);

    const questLocPatterns: Partial<Record<QuestName, RegExp>> = {
        "Cook's Assistant": /kitchen|stove|range/i,
        "The Restless Ghost": /church|graveyard|altar/i,
        "Sheep Shearer": /sheep|pen/i,
        "Doric's Quest": /anvil|mine/i,
        "Rune Mysteries Quest": /rune.*shop|wizard.*tower/i
    };

    const matchingPattern = questLocPatterns[questName];
    if (matchingPattern) return sdk.findNearbyLoc(matchingPattern);

    return null;
}

// ============ Dialog Helpers ============

export function isQuestDialog(dialog: { text?: string; options?: Array<{ text: string }> }): boolean {
    if (!dialog.text) return false;
    const text = dialog.text.toLowerCase();
    const questKeywords = ['quest', 'mission', 'task', 'help', 'assistant', 'complete', 'reward', 'points'];
    return questKeywords.some(keyword => text.includes(keyword));
}

export function findQuestDialogOption(
    options: Array<{ index: number; text: string }>,
    patterns: (RegExp | string)[]
): { index: number; text: string } | null {
    for (const option of options) {
        const optionText = option.text.toLowerCase();
        for (const pattern of patterns) {
            if (typeof pattern === 'string') {
                if (optionText.includes(pattern.toLowerCase())) return option;
            } else if (pattern.test(option.text)) {
                return option;
            }
        }
    }
    return null;
}

export const QUEST_DIALOG_PATTERNS = {
    accept: [/yes/i, /accept/i, /i'll help/i, /i can help/i, /sure/i, /okay/i, /ok/i, /what.*wrong/i, /can i help/i],
    decline: [/no/i, /decline/i, /not now/i, /maybe later/i],
    handIn: [/yes/i, /here/i, /give/i, /hand/i, /complete/i],
    askAbout: [/tell me/i, /what.*quest/i, /how.*help/i, /what.*need/i]
};

// ============ Quest SDK Class ============

export class QuestSDK {
    static readonly QUEST_DIALOG_PATTERNS = QUEST_DIALOG_PATTERNS;

    constructor(private sdk: BotSDK) {}

    getStatus(questName: QuestName): QuestStatus {
        const state = this.sdk.getState();
        return getQuestStatus(state, questName);
    }

    getAllStatuses(): Record<QuestName, QuestStatus> {
        const state = this.sdk.getState();
        const statuses: Record<QuestName, QuestStatus> = {} as Record<QuestName, QuestStatus>;
        for (const questName of QUEST_NAMES) {
            statuses[questName] = getQuestStatus(state, questName);
        }
        return statuses;
    }

    isCompleted(questName: QuestName): boolean {
        return this.getStatus(questName) === 'completed';
    }

    isStarted(questName: QuestName): boolean {
        const status = this.getStatus(questName);
        return status === 'started' || status === 'completed';
    }

    getProgress(questName: QuestName): number | null {
        const state = this.sdk.getState();
        return getQuestProgress(state, questName);
    }

    getQuestPoints(): number {
        const state = this.sdk.getState();
        return getQuestPoints(state);
    }

    detectCompletion(questName?: QuestName): QuestCompletionInfo | null {
        const state = this.sdk.getState();
        if (!state?.gameMessages) return null;
        return detectQuestCompletion(state.gameMessages, questName);
    }

    detectStart(questName?: QuestName): QuestStartInfo | null {
        const state = this.sdk.getState();
        if (!state) return null;
        if (state.gameMessages) {
            const startInfo = detectQuestStart(state.gameMessages, questName);
            if (startInfo) return startInfo;
        }
        if (state.dialog) {
            const dialogStart = detectQuestStartFromDialog(state.dialog, questName);
            if (dialogStart) return dialogStart;
        }
        return null;
    }

    findNpc(questName: QuestName, pattern?: RegExp): NearbyNpc | null {
        return findQuestNpc(this.sdk, questName, pattern);
    }

    findLocation(questName: QuestName, pattern?: RegExp): NearbyLoc | null {
        return findQuestLocation(this.sdk, questName, pattern);
    }

    isQuestDialog(): boolean {
        const state = this.sdk.getState();
        if (!state?.dialog) return false;
        return isQuestDialog(state.dialog);
    }

    findDialogOption(patterns: (RegExp | string)[]): { index: number; text: string } | null {
        const state = this.sdk.getState();
        if (!state?.dialog?.options) return null;
        return findQuestDialogOption(state.dialog.options, patterns);
    }
}
