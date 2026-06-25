import React, { useState } from 'react';

// ========== 章节数据 ==========
interface GuideSection {
  id: string;
  icon: string;
  title: string;
  summary: string;
  content: string[];
  tips?: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: 'intro',
    icon: '📖',
    title: '游戏简介',
    summary: '了解凡人修仙传的世界，以及你的修仙之旅',
    content: [
      '凡人修仙传是一款以修仙为题材的单机 RPG 游戏。你将扮演一位身怀灵根的凡人，从天南大陆黄枫谷起步，踏上漫漫仙途。',
      '游戏的核心循环是：修炼积累修为 → 突破境界 → 学习技能/获取装备 → 外出历练 → 变强后冲击更高境界。',
      '你的角色拥有生命（HP）、灵力（MP）、攻击、防御、速度等属性。境界越高，基础属性越强。每次突破大境界，寿元上限都会大幅延长。',
      '最终目标是突破层层境界，从凡人修炼至化神期，甚至前往神秘的乱星海。',
    ],
    tips: [
      '修仙不是一蹴而就的，保持耐心，合理分配修炼和历练的时间。',
    ],
  },
  {
    id: 'character',
    icon: '🧑',
    title: '角色创建',
    summary: '灵根选择建议与角色属性解析',
    content: [
      '创建角色时需要选择 1~3 种灵根。灵根决定了你的角色擅长什么方向：',
      '',
      '金灵根：攻击力 +5，适合追求高伤害的玩家。',
      '木灵根：生命值 +30，适合追求生存能力的玩家。',
      '水灵根：灵力 +20 / 精神 +3，适合频繁使用技能的法修。',
      '火灵根：攻击 +3 / 暴击率 +2%，适合赌暴击的爆发型。',
      '土灵根：防御力 +5，适合稳健防御流的玩家。',
      '',
      '多灵根可以叠加加成，举例：选金+火两个灵根，攻击力总共 +8，暴击率 +2%，输出非常暴力。选木+土则生命和防御双高，适合新手。',
    ],
    tips: [
      '新手推荐：金+火（暴力输出）或 木+土（生存优先）。',
      '多灵根的好处是属性叠加，但灵根种类与后期技能的属性联动尚待开发。',
    ],
  },
  {
    id: 'cultivation',
    icon: '🧘',
    title: '修炼与突破',
    summary: '如何高效提升修为与突破境界',
    content: [
      '修炼是游戏的核心玩法。在洞府点击「闭关修炼」即可消耗 2 时辰，获得一定修为。修为满后可以尝试突破到下一层。',
      '',
      '修炼收益公式：10（基础）+ 洞府加成 + 境界加成（境界越高加成越多）。升级洞府和建造静修室可以提升修炼效率。',
      '',
      '突破系统：',
      '每个境界有多层（炼气13层、筑基3层…），修为满后可以突破。',
      '越高的境界突破概率越低（筑基50% → 结丹30% → 元婴15%）。',
      '丹毒会降低突破成功率！服用丹药会积累丹毒，丹毒越高突破越难。',
      '可以使用冲关丹提升突破成功率。',
      '',
      '寿元提醒：每个境界有寿元上限。如果寿元耗尽角色会死亡，务必在寿元耗尽前突破到下一境界！',
    ],
    tips: [
      '炼气期有13层，每层需要的修为递增，优先提升洞府等级来加速修炼。',
      '突破失败不会死亡，只是消耗修为，可以继续修炼再尝试。',
    ],
  },
  {
    id: 'combat',
    icon: '⚔️',
    title: '战斗系统',
    summary: '回合制战斗详解，技能使用与自动战斗',
    content: [
      '战斗采用回合制，你和敌人轮流行动。每回合可以选择：',
      '',
      '⚔️ 攻击：普通攻击，不消耗 MP。',
      '🔥 技能：消耗 MP 释放技能，有冷却时间（CD）。技能威力远超普攻，还能附加灼烧、麻痹、护盾等效果。',
      '🛡️ 防御：本回合受到伤害减半。',
      '🏃 逃跑：退出战斗。',
      '',
      '自动战斗：开启后自动每 0.8 秒执行一次动作。优先使用已学习的最高威力技能，MP 不足时自动普攻。手动操作会自动关闭自动战斗。',
      '',
      '战斗奖励：',
      '不同怪物掉落奖励不同，难度越高奖励越丰厚。',
      '技能击杀获得 1.6 倍灵石和修为奖励。',
      '概率掉落道具（丹药、材料、装备等），掉落率随怪物难度提升。',
    ],
    tips: [
      '前期优先学习火球术和聚灵术，一个输出一个回血。',
      '开启自动战斗后状态会保存，下次进入战斗仍然自动模式。',
    ],
  },
  {
    id: 'skills',
    icon: '📜',
    title: '技能树',
    summary: '16 个技能的学习、升级与战斗运用',
    content: [
      '技能按境界分组解锁，从炼气期到元婴期共 16 个技能：',
      '',
      '炼气期：火球术、冰锥术、灵气护盾、聚灵术、轻身术',
      '筑基期：剑气斩、雷击术、真元护体、回元术',
      '金丹期：三昧真火、金刚不坏、大还丹术',
      '元婴期：天雷正法、不死金身、元婴出窍',
      '',
      '学习技能需要消耗灵石和修为。升级技能（提升等级）同样需要灵石和修为，等级越高消耗越大。',
      '技能等级提升后，威力和效果数值都会增长（每级 +12%~15%）。',
      '',
      '技能类型：',
      '攻击型（红色）：造成伤害，部分附带减速、灼烧、麻痹等异常状态。',
      '防御型（蓝色）：生成护盾吸收伤害，或提升防御力。',
      '辅助型（绿色）：恢复 HP、提升属性 Buff。',
    ],
    tips: [
      '优先升满一个主力攻击技能，再考虑防御和辅助技能。',
      '战斗中自动战斗会优先使用最高威力的已学习技能。',
    ],
  },
  {
    id: 'map',
    icon: '🗺️',
    title: '天南地图',
    summary: '13 处地点的探索指南',
    content: [
      '天南地图包含 13 处可探索地点，按境界逐级解锁：',
      '',
      '凡人区域：黄枫谷（宗门）、青石村（交易/休息）、落凤坡（低级历练）。',
      '炼气区域：狼谷、太岳山脉、灵石矿脉、燕家堡、血色禁地。',
      '筑基区域：嘉元城、水月湖、断魂崖、天南城。',
      '结丹区域：乱星海入口。',
      '',
      '每个地点提供不同的动作：历练（战斗）、交易（购买物品）、休息（恢复）、探索（获得随机奖励）、任务（完成委托）。',
      '未解锁的地点会显示 🔒 标记和所需境界提示，达到对应境界后自动解锁。',
    ],
    tips: [
      '炼气期推荐先去狼谷历练，掉落物品比较实用。',
      '灵石矿脉有概率挖到稀有材料，筑基后务必探索。',
    ],
  },
  {
    id: 'sect',
    icon: '🏛️',
    title: '宗门系统',
    summary: '藏经阁、演武场、丹药堂、任务堂使用指南',
    content: [
      '黄枫谷是你所在的宗门，提供四大设施：',
      '',
      '📚 藏经阁：消耗贡献点兑换功法，学习后角色的各项能力会提升。',
      '⚔️ 演武场：与同门切磋比试，胜率与你的攻击力挂钩。获胜可获得贡献点和少量灵石奖励。',
      '💊 丹药堂：每月可免费领取丹药，包括回血、回蓝、加修为等各类丹药。',
      '📋 任务堂：接取宗门任务，完成后获得灵石和贡献点。任务有进度条，随着游戏时间自动推进，完成后会收到提示。',
      '',
      '贡献点是宗门内的硬通货，可以用来兑换功法和丹药。通过演武场切磋和完成宗门任务获取。',
    ],
    tips: [
      '每月记得去丹药堂领药，这是免费的修为来源！',
      '任务有成功率，境界越高成功率越高。失败也有灵石安慰奖。',
    ],
  },
  {
    id: 'trading',
    icon: '💰',
    title: '坊市交易',
    summary: '商品列表与灵石赚取攻略',
    content: [
      '坊市是天南大陆的交易中心，可以购买各类物品：',
      '',
      '丹药类：回春丹（回血）、聚灵丹（加修为）、培元丹（大量加修为）、回灵丹（回蓝）、冲关丹（提升突破率）。',
      '装备类：铁剑（+5攻击）、钢剑（+10攻击）、布袍（+3防御）、丝袍（+6防御 +5灵力）。',
      '符箓类：火球符（一次性高伤害）、护身符（一次性减伤）。',
      '材料类：灵草、妖兽核、下品灵石。',
      '功法类：长春功残篇（木系）、明光诀（金系）。',
      '',
      '灵石来源：战斗胜利奖励、宗门任务、秘境探索、切磋比试。',
    ],
    tips: [
      '灵石有限，优先买聚灵丹加速修炼，或买装备提升战斗力。',
      '冲关丹在突破关键瓶颈时使用，性价比最高。',
    ],
  },
  {
    id: 'inventory',
    icon: '🎒',
    title: '乾坤袋与装备',
    summary: '物品管理、装备穿戴与使用说明',
    content: [
      '乾坤袋是角色背包，可以查看和管理你的所有物品。',
      '',
      '物品分为五类：',
      '全部：所有物品一览。',
      '装备：武器、头盔、衣服、手套、鞋子、饰品（2个槽位），穿戴后提升属性。',
      '消耗品：丹药、符箓等一次性使用物品，治疗效果即时生效。',
      '材料：灵草、妖兽核等炼丹/炼器原料（当前版本主要用于收藏和未来系统）。',
      '功法：功法书，学习后永久获得被动加成。',
      '',
      '点击物品可查看详情，消耗品可直接使用，装备可穿戴或卸下，功法可学习。',
    ],
    tips: [
      '装备槽有 7 个，同类型装备只能穿一件，换装会自动卸下旧装备。',
      '学习过的功法无法重复学习。',
    ],
  },
  {
    id: 'realm',
    icon: '🏯',
    title: '秘境探索',
    summary: '秘境玩法与挑战攻略',
    content: [
      '秘境是特殊的挑战副本，难度比普通历练更高，奖励也更丰厚。',
      '',
      '秘境按难度分级，越高级的秘境需要越高的境界才能进入。',
      '每个秘境有多层，清完一层可进入下一层。',
      '最终层有 Boss，击败 Boss 获得大量奖励。',
      '秘境支持反复挑战，系统会记录你的最佳成绩。',
    ],
    tips: [
      '挑战秘境前确保 HP/MP 充足，准备好回血丹药。',
      '击败 Boss 的奖励是灵石和稀有物品的重要来源。',
    ],
  },
  {
    id: 'save',
    icon: '💾',
    title: '存档系统',
    summary: '多槽位存档、自动保存与读档',
    content: [
      '游戏提供完整的存档管理功能：',
      '',
      '6 个存档槽位：可以在主菜单选择「读档」查看所有存档，每个档位独立保存，互不影响。',
      '自动存档：进入游戏后每 5 分钟自动保存一次，数据安全有保障。',
      '快速存档：在洞府点击「快速存档」可立即保存当前进度并弹出提示。',
      '返回主菜单：退出前会自动保存，不用担心进度丢失。',
      '',
      '存档包含的内容：角色信息（境界/属性/灵石）、背包物品、装备、技能学习情况、洞府等级和建筑、游戏时间。',
    ],
    tips: [
      '重大决策前（如突破）可以手动快速存档，失败后可读档重来。',
      '建议使用不同槽位体验不同灵根组合的角色。',
    ],
  },
  {
    id: 'tips',
    icon: '💡',
    title: '常用技巧与进阶',
    summary: '快速提升实力的实用建议',
    content: [
      '1. 修炼优先：前期多闭关修炼积累修为，尽快突破到炼气期深层。',
      '2. 灵石管理：优先买装备提升战斗力，再买丹药加速修炼。',
      '3. 技能策略：先学会火球术（攻击）和聚灵术（回血），再扩展防御技能。',
      '4. 丹药使用：回春丹在战斗前使用恢复 HP，聚灵丹随时使用加速修为积累。',
      '5. 洞府升级：尽早升级洞府和建造静修室，修炼加成效果显著。',
      '6. 地图探索：每个境界解锁的新地点都要去一次，获取首通奖励。',
      '7. 宗门月领：每月记得去丹药堂白嫖丹药！',
      '8. 丹毒管理：尽量少嗑药，多靠修炼。丹毒高了突破失败率会大幅上升。',
    ],
    tips: [
      '突破概率 = 基础突破率 × (1 - 丹毒/100) × 道具加成。丹毒 50% 时突破率直接减半！',
      '寿元耗尽角色会永久死亡（Hardcore），务必关注剩余寿元。',
    ],
  },
];

// ========== 组件 ==========
export const Guide: React.FC = () => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['intro']));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      {/* 顶部导航 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 700, margin: 0,
          }}>
            📖 修仙攻略
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, margin: '4px 0 0' }}>
            从凡人到化神，手把手教你如何修炼
          </p>
        </div>
        <button className="btn btn-sm" onClick={handleBack}>
          ← 返回洞府
        </button>
      </div>

      {/* 章节列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SECTIONS.map((section) => {
          const isExpanded = expanded.has(section.id);
          return (
            <div
              key={section.id}
              className="panel"
              style={{ overflow: 'hidden', transition: 'box-shadow 0.2s' }}
            >
              {/* 章节头部 — 可点击 */}
              <div
                onClick={() => toggle(section.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                  borderBottom: isExpanded ? '1px solid var(--border-default)' : 'none',
                  transition: 'background 0.2s',
                }}
              >
                {/* 图标 */}
                <div style={{
                  width: 42, height: 42, borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {section.icon}
                </div>

                {/* 标题 + 摘要 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                    {section.title}
                    <span style={{
                      marginLeft: 8, fontSize: 16,
                      color: 'var(--text-disabled)',
                      display: 'inline-block',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      verticalAlign: 'middle',
                    }}>
                      ▾
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-tertiary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {section.summary}
                  </div>
                </div>
              </div>

              {/* 展开内容 */}
              {isExpanded && (
                <div style={{
                  padding: '16px 20px 20px',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  {/* 正文段落 */}
                  <div style={{ fontSize: 14, lineHeight: 2, color: 'var(--text-secondary)' }}>
                    {section.content.map((line, i) =>
                      line === '' ? (
                        <div key={i} style={{ height: 8 }} />
                      ) : line.startsWith(' ') ? (
                        <div key={i} style={{ paddingLeft: 16, fontSize: 13 }}>
                          {line}
                        </div>
                      ) : line.endsWith('：') || line.endsWith(':') ? (
                        <div key={i} style={{ fontWeight: 600, marginTop: i > 0 ? 12 : 0 }}>
                          {line}
                        </div>
                      ) : (
                        <div key={i}>{line}</div>
                      )
                    )}
                  </div>

                  {/* 小贴士 */}
                  {section.tips && section.tips.length > 0 && (
                    <div style={{
                      marginTop: 16, padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--color-gold)',
                    }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--color-gold)',
                        marginBottom: 8,
                      }}>
                        💡 小贴士
                      </div>
                      {section.tips.map((tip, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
                          }}
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部 */}
      <div style={{
        textAlign: 'center', padding: '24px 0', color: 'var(--text-disabled)', fontSize: 12,
      }}>
        修仙之路漫漫，且行且珍惜 🧘
      </div>
    </div>
  );
};
