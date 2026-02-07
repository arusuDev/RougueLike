// スキルツリー画面

import { SKILL_TREE, getSkill, canUnlockSkill, calculateStatBonuses, type SkillNode } from '../data/skillTree';
import { usePersistentStore } from '../state/persistentState';

interface SkillTreeScreenProps {
    onBack: () => void;
}

export function SkillTreeScreen({ onBack }: SkillTreeScreenProps) {
    const { saveData, spendDP, unlockSkill: unlockSkillInStore } = usePersistentStore();
    const { currentDP, unlockedSkills } = saveData;

    const statBonuses = calculateStatBonuses(unlockedSkills);

    // スキル解放処理
    const handleUnlockSkill = (skillId: string) => {
        const skill = getSkill(skillId);
        if (!skill) return;

        if (!canUnlockSkill(skillId, unlockedSkills)) return;
        if (currentDP < skill.cost) return;

        if (spendDP(skill.cost)) {
            unlockSkillInStore(skillId);
        }
    };

    // ブランチごとにスキルを分類
    const branches = {
        hp: SKILL_TREE.filter(s => s.branch === 'hp'),
        attack: SKILL_TREE.filter(s => s.branch === 'attack'),
        defense: SKILL_TREE.filter(s => s.branch === 'defense'),
    };

    // スキルカードをレンダリング
    const renderSkillCard = (skill: SkillNode) => {
        const isUnlocked = unlockedSkills.includes(skill.id);
        const canUnlock = canUnlockSkill(skill.id, unlockedSkills);
        const canAfford = currentDP >= skill.cost;

        let status = 'locked';
        if (isUnlocked) status = 'unlocked';
        else if (canUnlock && canAfford) status = 'available';
        else if (canUnlock) status = 'cant-afford';

        return (
            <div
                key={skill.id}
                className={`skill-card skill-${status}`}
                onClick={() => status === 'available' && handleUnlockSkill(skill.id)}
            >
                <div className="skill-name">{skill.name}</div>
                <div className="skill-description">{skill.description}</div>
                <div className="skill-cost">
                    {isUnlocked ? '解放済' : `${skill.cost} DP`}
                </div>
            </div>
        );
    };

    // ブランチをレンダリング
    const renderBranch = (branchName: string, skills: SkillNode[], colorClass: string) => {
        const tier1 = skills.filter(s => s.tier === 1);
        const tier2 = skills.filter(s => s.tier === 2);
        const tier3a = skills.filter(s => s.tier === 3 && s.subBranch === 'a');
        const tier3b = skills.filter(s => s.tier === 3 && s.subBranch === 'b');

        return (
            <div className={`skill-branch ${colorClass}`}>
                <div className="skill-branch-title">{branchName}</div>

                {/* Tier 1 */}
                <div className="skill-tier">
                    {tier1.map(renderSkillCard)}
                </div>

                {/* 矢印 */}
                <div className="skill-arrow">↓</div>

                {/* Tier 2 */}
                <div className="skill-tier">
                    {tier2.map(renderSkillCard)}
                </div>

                {/* 分岐矢印 */}
                <div className="skill-arrow-split">
                    <span>↙</span>
                    <span>↘</span>
                </div>

                {/* Tier 3 (分岐) */}
                <div className="skill-tier skill-tier-split">
                    {tier3a.map(renderSkillCard)}
                    {tier3b.map(renderSkillCard)}
                </div>
            </div>
        );
    };

    return (
        <div className="skill-tree-screen">
            <h1 className="skill-tree-title">スキルツリー</h1>

            <div className="skill-tree-header">
                <div className="dp-display">
                    <span className="dp-label">所持DP:</span>
                    <span className="dp-value">{currentDP}</span>
                </div>

                <div className="stat-bonuses">
                    <span className="bonus-item">HP +{statBonuses.hp}</span>
                    <span className="bonus-item">ATK +{statBonuses.attack}</span>
                    <span className="bonus-item">DEF +{statBonuses.defense}</span>
                </div>
            </div>

            <div className="skill-tree-branches">
                {renderBranch('HP系', branches.hp, 'branch-hp')}
                {renderBranch('攻撃系', branches.attack, 'branch-attack')}
                {renderBranch('防御系', branches.defense, 'branch-defense')}
            </div>

            <div className="skill-tree-actions">
                <button className="btn-back" onClick={onBack}>
                    戻る
                </button>
            </div>
        </div>
    );
}
