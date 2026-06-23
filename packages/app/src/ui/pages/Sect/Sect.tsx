import React, { useState, useMemo } from 'react';
import { usePlayerStore } from '@/data';
import { ITEM_DB, getItem } from '@/data';

// ==================== 工具函数 ====================

/** 游戏时间 → 总小时数（用于计算任务进度） */
function gameTimeToHours(t: { year: number; month: number; day: number; hour: number }): number {
  return t.hour + t.day * 24 + t.month * 30 * 24 + t.year * 12 * 30 * 24;
}

/** 格式化游戏时间内 → "X天Y时辰" */
function formatGameDuration(hours: number): string {
  if (hours <= 0) return '即将完成';
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  if (d > 0) return `${d}天${h}时辰`;
  return `${h}时辰`;
}

// ==================== 数据定义 ====================

const NPC_LIST = [
  {
    id: 'elder_liu', name: '柳云鹤', title: '黄枫谷执事', role: '引路人',
    realm: '筑基期', affinity: 60,
    desc: '引你入仙途的修士，沉稳可靠。',
    sprite: 'sprite-npc-elder',
    dialogues: [
      '"小友，既已踏入仙途，便当勤加修炼。"',
      '"黄枫谷虽非大宗，但功法齐全。"',
      '"若有疑难，可去藏经阁查阅典籍。"',
      '"外门弟子每月可领取一份丹药补给。"',
    ],
  },
  {
    id: 'elder_wang', name: '王长老', title: '炼气堂长老', role: '导师',
    realm: '筑基期', affinity: 30,
    desc: '负责教导新入门弟子基础功法。',
    sprite: 'sprite-npc-elder',
    dialogues: [
      '"修仙之路，根基为重！"',
      '"你的灵根资质...尚可，需加倍努力。"',
      '"演武场随时欢迎你来切磋。"',
    ],
  },
  {
    id: 'disciple_zhang', name: '张铁柱', title: '外门弟子', role: '同伴',
    realm: '炼气期', affinity: 45,
    desc: '同期入门的外门弟子，憨厚老实。',
    sprite: 'sprite-npc-smith',
    dialogues: [
      '"嘿，道友今日修为可有长进？"',
      '"听说秘境最近有异动..."',
      '"坊市的丹药又涨价了，唉。"',
    ],
  },
  {
    id: 'disciple_lin', name: '林婉儿', title: '内门弟子', role: '同伴',
    realm: '筑基期', affinity: 20,
    desc: '天资卓越的内门师姐，性格清冷。',
    sprite: 'sprite-npc-female',
    dialogues: [
      '"......"',
      '"有事？没事别来打扰我修炼。"',
      '"想学功法？去找柳执事吧。"',
    ],
  },
];

// 藏经阁功法列表
const LIBRARY_TECHNIQUES = [
  { id: 'skill_changchun', costType: 'contribution' as const, cost: 50, reqRealm: 0 },
  { id: 'skill_mingguang',   costType: 'contribution' as const, cost: 80, reqRealm: 0 },
];

// 丹药堂每月可领
const MONTHLY_PILLS = [
  { itemId: 'pill_hp_small', quantity: 2 },
  { itemId: 'pill_mp_small', quantity: 1 },
];

// 任务堂任务
const SECT_MISSIONS = [
  {
    id: 'm1', title: '采集灵草', desc: '去青石村周边采集10株灵草',
    rewardGold: 20, rewardContribution: 5, rewardItem: 'herb_spirit' as string,
    duration: 4,
  },
  {
    id: 'm2', title: '清理妖兽', desc: '前往狼妖谷击退3只低阶狼妖',
    rewardGold: 40, rewardContribution: 10, rewardItem: 'beast_core' as string,
    duration: 8,
  },
  {
    id: 'm3', title: '护送商队', desc: '护送商队安全通过黄枫谷外围区域',
    rewardGold: 60, rewardContribution: 15, rewardItem: null,
    duration: 12,
  },
  {
    id: 'm4', title: '矿洞探查', desc: '进入废弃矿洞收集下品灵石',
    rewardGold: 30, rewardContribution: 8, rewardItem: 'spirit_stone_low' as string,
    duration: 6,
  },
];

type ModalType = 'none' | 'library' | 'training' | 'alchemy' | 'mission' | 'npc-talk' | 'mission-result';

// ==================== 组件 ====================

export const Sect: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const addItem = usePlayerStore((s) => s.addItem);
  const modifyGold = usePlayerStore((s) => s.modifyGold);
  const advanceTime = usePlayerStore((s) => s.advanceTime);
  const updateAttributes = usePlayerStore((s) => s.updateAttributes);

  // UI 状态
  const [modal, setModal] = useState<ModalType>('none');
  const [selectedNpc, setSelectedNpc] = useState<typeof NPC_LIST[0] | null>(null);
  const [dialogueIdx, setDialogueIdx] = useState(0);

  // 宗门贡献度
  const [contribution, setContributionRaw] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem('fanren_contribution') || '0', 10);
      return isNaN(v) ? 0 : v;
    }
    catch { return 0; }
  });
  // 读取最新值并写入 localStorage + state
  const persistContribution = (val: number) => {
    const safeV = isNaN(val) ? 0 : val;
    localStorage.setItem('fanren_contribution', String(safeV));
    setContributionRaw(safeV);
  };
  // 安全增减贡献：直接从 contribution 快照计算新值
  const addContribution = (delta: number) => {
    const current = parseInt(localStorage.getItem('fanren_contribution') || '0', 10) || 0;
    const newVal = current + delta;
    persistContribution(newVal);
  };

  // 已领取的月份
  const [claimedMonth, setClaimedMonth] = useState(() => {
    try {
      const d = new Date();
      return localStorage.getItem('fanren_pill_month') === `${d.getFullYear()}-${d.getMonth()}`;
    } catch { return false; }
  });

  // —— 任务状态 ——
  // activeMissionId: 当前进行中的任务ID（null=无）
  // missionStartTime: 接取时的游戏时间（用于计算进度）
  const [activeMissionId, setActiveMissionId] = useState<string | null>(() =>
    localStorage.getItem('fanren_active_mission')
  );
  const [missionStartJson, setMissionStartJson] = useState<string | null>(() =>
    localStorage.getItem('fanren_mission_start')
  );
  const [missionJustDone, setMissionJustDone] = useState(false);
  const [missionResult, setMissionResult] = useState<{
    success: boolean; mission: typeof SECT_MISSIONS[0]; gold: number; item?: string | null;
  } | null>(null);

  /** 计算当前任务进度（0~1） */
  const missionProgress = useMemo(() => {
    if (!player || !activeMissionId || !missionStartJson) return 0;
    try {
      const start = JSON.parse(missionStartJson) as { year: number; month: number; day: number; hour: number };
      const m = SECT_MISSIONS.find((mi) => mi.id === activeMissionId);
      if (!m) return 0;
      const elapsed = gameTimeToHours(player.gameTime) - gameTimeToHours(start);
      return Math.min(1, Math.max(0, elapsed / m.duration));
    } catch {
      return 0;
    }
  }, [player?.gameTime, activeMissionId, missionStartJson]);

  // 进度达100%时触发提示
  const prevProgressRef = React.useRef(0);
  React.useEffect(() => {
    if (missionProgress >= 1 && prevProgressRef.current < 1 && activeMissionId) {
      setMissionJustDone(true);
      setTimeout(() => setMissionJustDone(false), 4000);
    }
    prevProgressRef.current = missionProgress;
  }, [missionProgress, activeMissionId]);

  if (!player) return null;

  // ====== 工具函数 ======
  const handleBack = () => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));

  // ====== 藏经阁：学习功法 ======
  const learnTechnique = (techId: string) => {
    const tech = LIBRARY_TECHNIQUES.find((t) => t.id === techId);
    if (!tech) return;
    if (tech.costType === 'contribution') {
      if (contribution < tech.cost) return alert(`宗门贡献不足！需要 ${tech.cost} 点`);
      addContribution(-tech.cost);
    } else if (tech.costType === 'gold') {
      if (player.gold < tech.cost) return alert(`灵石不足！需要 ${tech.cost} 灵石`);
      modifyGold(-tech.cost);
    }
    const item = getItem(tech.id);
    if (item) addItem(item, 1);
    alert(`成功获得《${item?.name}》！已放入背包`);
    setModal('none');
  };

  // ====== 演武场：切磋 ======
  const [sparringResult, setSparringResult] = useState('');
  const doSparring = () => {
    const winRate = 0.3 + (player.attributes.attack / 200);
    const win = Math.random() < winRate;
    advanceTime(2);

    if (win) {
      const contribGain = Math.floor(Math.random() * 5) + 3;
      const cultGain = Math.floor(Math.random() * 15) + 5;
      addContribution(contribGain);
      usePlayerStore.getState().addCultivation(cultGain);
      setSparringResult(
        `🎉 切磋获胜！\n` +
        `+${contribGain} 宗门贡献\n+${cultGain} 修为`
      );
    } else {
      const hpLoss = Math.floor(player.attributes.maxHp * 0.15);
      updateAttributes({ hp: -hpLoss });
      setSparringResult(
        `😔 切磋落败...\n-${hpLoss} 生命值\n继续努力！`
      );
    }
  };

  // ====== 丹药堂：领取月供 ======
  const claimMonthlyPills = () => {
    if (claimedMonth) return alert('本月已经领过了！');
    MONTHLY_PILLS.forEach(({ itemId, quantity }) => {
      const item = getItem(itemId);
      if (item) addItem(item, quantity);
    });
    const d = new Date();
    localStorage.setItem('fanren_pill_month', `${d.getFullYear()}-${d.getMonth()}`);
    setClaimedMonth(true);
    setModal('none');
  };

  // ====== 任务堂：成功率计算 ======
  // player.realm 是字符串（如"炼气期"），直接按字符串映射
  const getSuccessRate = (): number => {
    const p = usePlayerStore.getState().player;
    if (!p) return 60;
    // 字符串境界 → 加成映射
    const realmBonusMap: Record<string, number> = {
      '炼气期': 0,
      '筑基期': 15,
      '金丹期': 30,
      '元婴期': 50,
      '化神期': 70,
      '炼虚期': 70,
      '合体期': 70,
      '大乘期': 70,
    };
    const realmBonus = realmBonusMap[p.realm] ?? 0;
    const attackBonus = Math.floor(((p.attributes.attack as number) || 0) / 400 * 100);
    return Math.min(60 + realmBonus + attackBonus, 95);
  };
  const successRatePct = getSuccessRate();

  // ====== 任务堂：接取 ======
  const acceptMission = (missionId: string) => {
    if (activeMissionId) return alert('当前已有进行中的任务！');
    // 保存任务ID + 当前游戏时间
    setActiveMissionId(missionId);
    const startJson = JSON.stringify(player.gameTime);
    setMissionStartJson(startJson);
    localStorage.setItem('fanren_active_mission', missionId);
    localStorage.setItem('fanren_mission_start', startJson);
  };

  // ====== 任务堂：提交 ======
  const completeMission = () => {
    const storeState = usePlayerStore.getState();
    const latestPlayer = storeState.player;
    if (!latestPlayer || !activeMissionId) return;

    const m = SECT_MISSIONS.find((mi) => mi.id === activeMissionId);
    if (!m) return;

    // 成功率 = 基础60% + 境界加成 + 攻击力加成
    // 境界加成直接用字符串映射（player.realm 是"炼气期"等）
    const realmBonusMap: Record<string, number> = {
      '炼气期': 0,
      '筑基期': 0.15,
      '金丹期': 0.30,
      '元婴期': 0.50,
      '化神期': 0.70,
      '炼虚期': 0.70,
      '合体期': 0.70,
      '大乘期': 0.70,
    };
    const realmBonus = realmBonusMap[latestPlayer.realm] ?? 0;
    const attackBonus = ((latestPlayer.attributes.attack as number) || 0) / 400;
    const successRate = 0.60 + realmBonus + attackBonus;
    const success = Math.random() < Math.min(successRate, 0.95); // 最高95%成功率

    setActiveMissionId(null);
    setMissionStartJson(null);
    localStorage.removeItem('fanren_active_mission');
    localStorage.removeItem('fanren_mission_start');

    if (success) {
      // 成功：全额奖励
      modifyGold(m.rewardGold);
      addContribution(m.rewardContribution);
      if (m.rewardItem) {
        const item = getItem(m.rewardItem);
        if (item) addItem(item, 1);
      }
      setMissionResult({ success: true, mission: m, gold: m.rewardGold, item: m.rewardItem });
    } else {
      // 失败：给50%灵石安慰奖 + 日志记录原因
      const consolationGold = Math.floor(m.rewardGold * 0.5);
      modifyGold(consolationGold);
      setMissionResult({ success: false, mission: m, gold: consolationGold, item: null });
    }
    setModal('mission-result');
  };

  // ====== NPC 对话 ======
  const openNpcTalk = (npc: typeof NPC_LIST[0]) => {
    setSelectedNpc(npc);
    setDialogueIdx(Math.floor(Math.random() * npc.dialogues.length));
    setModal('npc-talk');
  };

  // ====== Modal 渲染 ======
  const renderModal = () => {
    switch (modal) {
      case 'library':
        return (
          <div className="modal-overlay" onClick={() => setModal('none')}>
            <div className="panel fade-in" style={{ maxWidth: 480, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="panel-title" style={{ margin: 0 }}>📚 藏经阁</div>
                <button className="btn btn-sm" onClick={() => setModal('none')}>✕</button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                用宗门贡献兑换功法秘籍。当前贡献：<span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{contribution}</span>
              </p>
              {LIBRARY_TECHNIQUES.map((t) => {
                const item = ITEM_DB[t.id];
                const canAfford = t.costType === 'contribution' ? contribution >= t.cost : player.gold >= t.cost;
                const hasIt = player.inventory.some((inv) => inv.item.id === t.id);
                return (
                  <div key={t.id} className="card" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, marginBottom: 8, opacity: hasIt ? 0.5 : 1,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.description}</div>
                    </div>
                    <button
                      className={`btn ${hasIt ? '' : 'btn-primary'} btn-sm`}
                      onClick={() => learnTechnique(t.id)}
                      disabled={hasIt || !canAfford}
                    >
                      {hasIt ? '已拥有' : `${t.costType === 'contribution' ? '贡献' : '灵石'} ${t.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'training':
        return (
          <div className="modal-overlay" onClick={() => { setModal('none'); setSparringResult(''); }}>
            <div className="panel fade-in" style={{ maxWidth: 400, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="panel-title" style={{ margin: 0 }}>⚔️ 演武场</div>
                <button className="btn btn-sm" onClick={() => { setModal('none'); setSparringResult(''); }}>✕</button>
              </div>
              {!sparringResult ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                    与同门切磋技艺，提升实战能力。每次消耗 2 个时辰。
                  </p>
                  <div style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>你的状态</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      HP {player.attributes.hp}/{player.attributes.maxHp} · 攻击 {player.attributes.attack}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={doSparring} style={{ width: '100%' }}>
                    开始切磋
                  </button>
                </>
              ) : (
                <div style={{
                  padding: 24, textAlign: 'center', whiteSpace: 'pre-line',
                  lineHeight: 1.8, fontSize: 14,
                }}>
                  {sparringResult}
                  <br />
                  <button className="btn btn-primary" onClick={doSparring} style={{ marginTop: 16 }}>
                    再来一局
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'alchemy':
        return (
          <div className="modal-overlay" onClick={() => setModal('none')}>
            <div className="panel fade-in" style={{ maxWidth: 400, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="panel-title" style={{ margin: 0 }}>🏥 丹药堂</div>
                <button className="btn btn-sm" onClick={() => setModal('none')}>✕</button>
              </div>
              {claimedMonth ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>本月已领取</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>下月再来领取月供丹药</div>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                    外门弟子每月可领取一次丹药补给。
                  </p>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>本月月供：</div>
                    {MONTHLY_PILLS.map(({ itemId, qty }) => {
                      const item = ITEM_DB[itemId];
                      return (
                        <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                          <span>{item.name} x{qty}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>{item.description}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={claimMonthlyPills} style={{ width: '100%' }}>
                    领取月供
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case 'mission': {
        const activeMission = SECT_MISSIONS.find((m) => m.id === activeMissionId);
        const progressPct = Math.round(missionProgress * 100);
        const isDone = missionProgress >= 1;

        return (
          <div className="modal-overlay" onClick={() => setModal('none')}>
            <div className="panel fade-in" style={{ maxWidth: 500, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="panel-title" style={{ margin: 0 }}>📋 任务堂</div>
                <button className="btn btn-sm" onClick={() => setModal('none')}>✕</button>
              </div>

              {activeMissionId && activeMission ? (
                /* ——— 任务进行中 ——— */
                <div>
                  {/* 任务信息 */}
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📝</div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{activeMission.title}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 4 }}>
                      {activeMission.desc}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>
                      预计耗时 {activeMission.duration} 时辰
                      {' · '}
                      奖励 💰{activeMission.rewardGold} 🏆{activeMission.rewardContribution}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div style={{
                    marginBottom: 16, padding: 12,
                    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>任务进度</span>
                      <span style={{ fontWeight: 600, color: isDone ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                        {progressPct}%
                      </span>
                    </div>
                    {/* 进度条轨道 */}
                    <div style={{
                      height: 14, borderRadius: 7, overflow: 'hidden',
                      background: 'var(--border-default)',
                      position: 'relative',
                    }}>
                      {/* 填充 */}
                      <div style={{
                        height: '100%', width: `${progressPct}%`,
                        borderRadius: 7,
                        background: isDone
                          ? 'linear-gradient(90deg, var(--brand-primary), #4ade80)'
                          : 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))',
                        transition: 'width 0.6s ease',
                        position: 'relative',
                      }}>
                        {/* 进行中动画光效 */}
                        {!isDone && (
                          <div style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0, width: 20,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3))',
                            animation: 'shimmer 1.5s infinite',
                          }} />
                        )}
                      </div>
                    </div>
                    {/* 状态提示 */}
                    <div style={{
                      marginTop: 8, fontSize: 12, textAlign: 'center',
                      color: isDone ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                      fontWeight: isDone ? 600 : 400,
                    }}>
                      {isDone
                        ? '✅ 任务已完成！可提交领取奖励'
                        : `还需 ${formatGameDuration(activeMission.duration - Math.floor(missionProgress * activeMission.duration))}…（可通过修炼/切磋推进时间）`
                      }
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <button
                    className={`btn btn-lg ${isDone ? 'btn-primary' : ''}`}
                    style={{
                      width: '100%',
                      opacity: isDone ? 1 : 0.5,
                      cursor: isDone ? 'pointer' : 'not-allowed',
                    }}
                    disabled={!isDone}
                    onClick={completeMission}
                  >
                    {isDone ? '📤 提交任务' : `进行中… ${progressPct}%`}
                  </button>
                </div>
              ) : (
                /* ——— 任务列表 ——— */
                <>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    接取宗门任务可获得灵石和贡献奖励（同时只能进行一个）
                  </div>
                  {SECT_MISSIONS.map((m) => (
                    <div key={m.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{m.desc}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 4 }}>
                            ⏱ {m.duration}时辰 · 💰{m.rewardGold} 🏆{m.rewardContribution}
                            {m.rewardItem && ` · ${ITEM_DB[m.rewardItem]?.name}`}
                          </div>
                          <div style={{
                            fontSize: 11, marginTop: 4,
                            color: successRatePct >= 80 ? 'var(--brand-accent)' : successRatePct >= 60 ? 'var(--brand-primary)' : 'var(--brand-danger)',
                            fontWeight: 500,
                          }}>
                            预估成功率：{successRatePct}%
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => acceptMission(m.id)}>
                          接取
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        );
      }

      case 'mission-result':
        if (!missionResult) return null;
        return (
          <div className="modal-overlay" onClick={() => { setModal('none'); setMissionResult(null); }}>
            <div className="panel fade-in" style={{ maxWidth: 360, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {missionResult.success ? '🎉' : '😔'}
                </div>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                  {missionResult.success ? '任务完成！' : '任务失败...'}
                </div>
                {missionResult.success && (
                  <div style={{
                    whiteSpace: 'pre-line', lineHeight: 1.8,
                    color: 'var(--text-secondary)',
                  }}>
                    {`💰 +${missionResult.mission.rewardGold} 灵石`}
                    {`\n🏆 +${missionResult.mission.rewardContribution} 贡献`}
                    {missionResult.item && `\n🎁 ${ITEM_DB[missionResult.item]?.name}`}
                  </div>
                )}
                {!missionResult.success && (
                  <div style={{ color: 'var(--text-tertiary)' }}>
                    任务失败，下次再努力吧...
                  </div>
                )}
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setModal('none'); setMissionResult(null); }}>
                  确定
                </button>
              </div>
            </div>
          </div>
        );

      case 'npc-talk':
        if (!selectedNpc) return null;
        return (
          <div className="modal-overlay" onClick={() => setModal('none')}>
            <div className="panel fade-in" style={{ maxWidth: 420, width: '100%', margin: 16 }} onClick={(e) => e.stopPropagation()}>
              {/* NPC 头部 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className={`sprite-bg ${selectedNpc.sprite}`} style={{
                  border: '2px solid var(--brand-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{selectedNpc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {selectedNpc.title} · {selectedNpc.realm}
                  </div>
                </div>
              </div>

              {/* 对话内容 */}
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                padding: 16, marginBottom: 16, minHeight: 60,
              }}>
                <div style={{ fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  {selectedNpc.dialogues[dialogueIdx % selectedNpc.dialogues.length]}
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" style={{ flex: 1 }}
                  onClick={() => setDialogueIdx(dialogueIdx + 1)}>
                  继续对话
                </button>
                <button className="btn btn-sm" style={{ flex: 1 }}
                  onClick={() => setModal('none')}>
                  告辞
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="panel-title" style={{ marginBottom: 0 }}>黄枫谷</div>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: 'var(--color-gold)', color: '#fff',
          }}>
            贡献 {contribution}
          </span>
        </div>
        <button className="btn btn-sm" onClick={handleBack}>← 返回</button>
      </div>

      {/* 宗门背景 */}
      <div style={{
        backgroundImage: 'url(/backgrounds/bg_huangfeng_valley.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        height: 140, marginBottom: 16, position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(transparent, rgba(245,243,237,0.95))',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>黄枫谷</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            太岳山脉 · 七大宗门之一
          </div>
        </div>
      </div>

      {/* 功能设施 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-lg" onClick={() => setModal('library')}
          style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 20 }}>📚</span>
          藏经阁
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>兑换功法</span>
        </button>
        <button className="btn btn-lg" onClick={() => { setModal('training'); setSparringResult(''); }}
          style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 20 }}>⚔️</span>
          演武场
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>切磋较量</span>
        </button>
        <button className="btn btn-lg" onClick={() => setModal('alchemy')}
          style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          丹药堂
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>领取丹药</span>
        </button>
        <button className="btn btn-lg" onClick={() => setModal('mission')}
          style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
          <span style={{ fontSize: 20 }}>📋</span>
          任务堂
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>宗门任务</span>
          {activeMissionId && missionProgress < 1 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--brand-danger)', color: '#fff',
              fontSize: 9, padding: '1px 5px', borderRadius: 'var(--radius-full)',
            }}>
              进行中
            </span>
          )}
          {activeMissionId && missionProgress >= 1 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              background: '#4ade80', color: '#fff',
              fontSize: 9, padding: '1px 5px', borderRadius: 'var(--radius-full)',
              animation: 'pulse 1.5s infinite',
            }}>
              ✅ 可提交
            </span>
          )}
        </button>
      </div>

      {/* 任务完成提示（页面内的 Toast） */}
      {missionJustDone && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, var(--brand-primary), #4ade80)',
          color: '#fff', padding: '12px 28px',
          borderRadius: 'var(--radius-lg)', fontSize: 15, fontWeight: 600,
          zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          animation: 'slideDown 0.4s ease, fadeOut 0.4s ease 3.2s forwards',
          whiteSpace: 'nowrap',
        }}>
          🎉 任务已完成！请前往任务堂提交领取奖励
        </div>
      )}

      {/* NPC列表 */}
      <div className="panel">
        <div className="panel-title">宗门人物</div>
        {NPC_LIST.map((npc) => (
          <div key={npc.id} className="card" onClick={() => openNpcTalk(npc)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', marginBottom: 8, cursor: 'pointer',
            transition: 'transform 0.15s',
          }}>
            <div className={`sprite-bg ${npc.sprite}`} style={{
              border: '2px solid var(--border-default)',
              background: 'var(--bg-elevated)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {npc.name}
                <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {npc.title}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {npc.realm} · 好感度 {npc.affinity}
              </div>
            </div>
            <span style={{ fontSize: 20, color: 'var(--text-disabled)' }}>›</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};
