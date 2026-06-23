import React, { useState } from 'react';
import { usePlayerStore } from '@fanren/data';
import { BREAKTHROUGH_BASE_RATE, REALM_NAMES, Realm } from '@fanren/core';

export const Breakthrough: React.FC = () => {
  const player = usePlayerStore((s) => s.player);
  const breakthrough = usePlayerStore((s) => s.breakthrough);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; newRealm: string } | null>(null);

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'cave' } }));
  };

  if (!player) return null;

  const baseRate = BREAKTHROUGH_BASE_RATE[player.realm];
  const pillBonus = 0; // todo: calculate from pills
  const finalRate = Math.min(0.95, baseRate + pillBonus - player.pillToxin * 0.005);

  const handleBreakthrough = () => {
    if (animating || player.cultivation < player.cultivationToNext) return;
    setAnimating(true);
    setTimeout(() => {
      const res = breakthrough();
      setResult(res);
      setAnimating(false);
    }, 3000); // Dramatic delay
  };

  return (
    <div className="page-container" style={{
      backgroundImage: animating || result
        ? 'url(assets/backgrounds/bg_breakthrough.png)'
        : undefined,
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      <button className="btn btn-sm" onClick={handleBack} style={{ marginBottom: 16, alignSelf: 'flex-start' }}>
        ← 返回
      </button>

      {!animating && !result && (
        <div className="panel fade-in" style={{ maxWidth: 450, margin: '0 auto', textAlign: 'center' }}>
          <div className="panel-title">境界突破</div>

          <div style={{ fontSize: 24, fontFamily: 'var(--font-title)', color: 'var(--color-gold)', marginBottom: 16 }}>
            {REALM_NAMES[player.realm]} · {player.realmLayer}层
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              当前修为进度
            </div>
            <div className="progress-bar" style={{ marginBottom: 4 }}>
              <div className="progress-bar-fill progress-cultivation"
                style={{ width: `${Math.floor((player.cultivation / player.cultivationToNext) * 100)}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {player.cultivation} / {player.cultivationToNext}
            </div>
          </div>

          <div style={{
            padding: 16, background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)', marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>突破信息</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>基础成功率</span>
              <span style={{ color: finalRate > 0.5 ? 'var(--color-green)' : 'var(--brand-danger)' }}>
                {(baseRate * 100).toFixed(0)}%
              </span>
            </div>
            {player.pillToxin > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--brand-danger)' }}>丹毒影响</span>
                <span style={{ color: 'var(--brand-danger)' }}>
                  -{(player.pillToxin * 0.5).toFixed(0)}%
                </span>
              </div>
            )}
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600,
              marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-default)',
            }}>
              <span>最终成功率</span>
              <span style={{ color: finalRate > 0.5 ? 'var(--color-green)' : 'var(--brand-danger)' }}>
                {(finalRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleBreakthrough}
            disabled={player.cultivation < player.cultivationToNext}
          >
            {player.cultivation < player.cultivationToNext ? '修为不足，继续修炼吧' : '✨ 冲击瓶颈'}
          </button>
        </div>
      )}

      {animating && (
        <div className="fade-in" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#F5F3ED',
        }}>
          <div className="float" style={{ fontSize: 36, fontFamily: 'var(--font-title)' }}>
            突破中...
          </div>
          <p style={{ marginTop: 16, opacity: 0.7 }}>天地灵气汇聚，冲击境界瓶颈</p>
        </div>
      )}

      {result && (
        <div className="fade-in" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 48, fontFamily: 'var(--font-title)',
            color: result.success ? 'var(--color-gold)' : 'var(--brand-danger)',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}>
            {result.success ? '突破成功！' : '突破失败...'}
          </div>
          <p style={{ marginTop: 12, color: '#F5F3ED', fontSize: 18 }}>
            {result.newRealm}
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 32 }}
            onClick={handleBack}
          >
            返回洞府
          </button>
        </div>
      )}
    </div>
  );
};
