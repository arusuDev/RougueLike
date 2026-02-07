// スキルツリー定義

// スキル効果タイプ
export type SkillEffectType = 'hp' | 'attack' | 'defense';

// スキル効果
export interface SkillEffect {
    type: SkillEffectType;
    value: number;
}

// スキルノード
export interface SkillNode {
    id: string;
    name: string;
    description: string;
    cost: number;
    tier: number;                  // 段階（1, 2, 3...）
    branch: 'hp' | 'attack' | 'defense';
    subBranch?: 'a' | 'b';         // サブブランチ（3段階目以降）
    prerequisites: string[];       // 前提スキルID
    effects: SkillEffect[];
}

// スキルツリー定義
export const SKILL_TREE: SkillNode[] = [
    // ===== HP系 =====
    {
        id: 'hp_1',
        name: 'HP強化Ⅰ',
        description: '最大HPが5増加する',
        cost: 10,
        tier: 1,
        branch: 'hp',
        prerequisites: [],
        effects: [{ type: 'hp', value: 5 }],
    },
    {
        id: 'hp_2',
        name: 'HP強化Ⅱ',
        description: '最大HPが10増加する',
        cost: 25,
        tier: 2,
        branch: 'hp',
        prerequisites: ['hp_1'],
        effects: [{ type: 'hp', value: 10 }],
    },
    {
        id: 'hp_3a',
        name: '生命力',
        description: '最大HPが15増加する',
        cost: 50,
        tier: 3,
        branch: 'hp',
        subBranch: 'a',
        prerequisites: ['hp_2'],
        effects: [{ type: 'hp', value: 15 }],
    },
    {
        id: 'hp_3b',
        name: '頑丈',
        description: '最大HPが10、防御力が2増加する',
        cost: 50,
        tier: 3,
        branch: 'hp',
        subBranch: 'b',
        prerequisites: ['hp_2'],
        effects: [{ type: 'hp', value: 10 }, { type: 'defense', value: 2 }],
    },

    // ===== 攻撃系 =====
    {
        id: 'atk_1',
        name: '攻撃強化Ⅰ',
        description: '攻撃力が2増加する',
        cost: 10,
        tier: 1,
        branch: 'attack',
        prerequisites: [],
        effects: [{ type: 'attack', value: 2 }],
    },
    {
        id: 'atk_2',
        name: '攻撃強化Ⅱ',
        description: '攻撃力が3増加する',
        cost: 25,
        tier: 2,
        branch: 'attack',
        prerequisites: ['atk_1'],
        effects: [{ type: 'attack', value: 3 }],
    },
    {
        id: 'atk_3a',
        name: '猛攻',
        description: '攻撃力が5増加する',
        cost: 50,
        tier: 3,
        branch: 'attack',
        subBranch: 'a',
        prerequisites: ['atk_2'],
        effects: [{ type: 'attack', value: 5 }],
    },
    {
        id: 'atk_3b',
        name: '会心の目',
        description: '攻撃力が3、最大HPが5増加する',
        cost: 50,
        tier: 3,
        branch: 'attack',
        subBranch: 'b',
        prerequisites: ['atk_2'],
        effects: [{ type: 'attack', value: 3 }, { type: 'hp', value: 5 }],
    },

    // ===== 防御系 =====
    {
        id: 'def_1',
        name: '防御強化Ⅰ',
        description: '防御力が2増加する',
        cost: 10,
        tier: 1,
        branch: 'defense',
        prerequisites: [],
        effects: [{ type: 'defense', value: 2 }],
    },
    {
        id: 'def_2',
        name: '防御強化Ⅱ',
        description: '防御力が3増加する',
        cost: 25,
        tier: 2,
        branch: 'defense',
        prerequisites: ['def_1'],
        effects: [{ type: 'defense', value: 3 }],
    },
    {
        id: 'def_3a',
        name: '鉄壁',
        description: '防御力が5増加する',
        cost: 50,
        tier: 3,
        branch: 'defense',
        subBranch: 'a',
        prerequisites: ['def_2'],
        effects: [{ type: 'defense', value: 5 }],
    },
    {
        id: 'def_3b',
        name: '反撃',
        description: '防御力が3、攻撃力が2増加する',
        cost: 50,
        tier: 3,
        branch: 'defense',
        subBranch: 'b',
        prerequisites: ['def_2'],
        effects: [{ type: 'defense', value: 3 }, { type: 'attack', value: 2 }],
    },
];

// スキル取得ヘルパー
export function getSkill(id: string): SkillNode | undefined {
    return SKILL_TREE.find(s => s.id === id);
}

// 解放済みスキルから総ステータスボーナスを計算
export function calculateStatBonuses(unlockedSkillIds: string[]): { hp: number; attack: number; defense: number } {
    const bonuses = { hp: 0, attack: 0, defense: 0 };

    for (const skillId of unlockedSkillIds) {
        const skill = getSkill(skillId);
        if (!skill) continue;

        for (const effect of skill.effects) {
            bonuses[effect.type] += effect.value;
        }
    }

    return bonuses;
}

// 前提条件を満たしているか確認
export function canUnlockSkill(skillId: string, unlockedSkillIds: string[]): boolean {
    const skill = getSkill(skillId);
    if (!skill) return false;

    // 既に解放済み
    if (unlockedSkillIds.includes(skillId)) return false;

    // 前提スキルをすべて持っているか
    return skill.prerequisites.every(prereq => unlockedSkillIds.includes(prereq));
}
