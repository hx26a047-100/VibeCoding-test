import React, { useState, useEffect } from 'react';
import { ScoreHistory } from '../types';
import { Trophy, Calendar, Zap, Sparkles, Trash2 } from 'lucide-react';

interface LeaderboardProps {
  currentScore?: number;
  maxCombo?: number;
  multiplierType?: string;
  onClose?: () => void;
  isTestPlay?: boolean;
}

export default function Leaderboard({ currentScore, maxCombo, multiplierType, onClose, isTestPlay = false }: LeaderboardProps) {
  const [scores, setScores] = useState<ScoreHistory[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadedScores = localStorage.getItem('match3_highscores');
    if (loadedScores) {
      try {
        const parsed = JSON.parse(loadedScores) as ScoreHistory[];
        // Sort descending
        parsed.sort((a, b) => b.score - a.score);
        setScores(parsed.slice(0, 5)); // Keep top 5
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !currentScore) return;

    const newRecord: ScoreHistory = {
      id: Math.random().toString(36).substring(2, 9),
      name: playerName.slice(0, 10),
      score: currentScore,
      maxCombo: maxCombo || 1,
      multiplierType: multiplierType || 'linear',
      date: new Date().toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [...scores, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // top 5

    setScores(updated);
    localStorage.setItem('match3_highscores', JSON.stringify(updated));
    setHasSubmitted(true);
  };

  const clearLeaderboard = () => {
    if (window.confirm('ランキング記録をすべてリセットしますか？')) {
      localStorage.removeItem('match3_highscores');
      setScores([]);
    }
  };

  const getMultiplierLabel = (type: string) => {
    switch (type) {
      case 'linear': return 'リニア (+0.5x)';
      case 'steep': return '急上昇 (+1.0x)';
      case 'fever': return 'フィーバー (+1.5x)';
      default: return 'カスタム';
    }
  };

  return (
    <div className="bg-[#0F0F0F]/95 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl space-y-6 max-w-md w-full mx-auto" id="leaderboard-card">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="text-xl font-display italic font-semibold text-[#D4AF37] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          High Scores
        </h3>
        {scores.length > 0 && (
          <button
            onClick={clearLeaderboard}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-md"
            title="ランキングをクリア"
            id="clear-leaderboard-btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {currentScore !== undefined && currentScore > 0 && !hasSubmitted && (
        isTestPlay ? (
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center space-y-1.5" id="test-play-notice">
            <p className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest animate-pulse font-bold">Test Play Mode Active</p>
            <p className="text-2xl font-mono font-bold text-white">{currentScore.toLocaleString()} pts</p>
            <p className="text-xs text-zinc-400 font-sans">※ テストプレイモードのため、ランキングの記録は行われません。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitScore} className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-3" id="submit-score-form">
            <div className="text-center">
              <p className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">New Highscore Recorded!</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">{currentScore.toLocaleString()} pts</p>
              <p className="text-xs text-zinc-400 mt-0.5 font-display italic">Max Combo: {maxCombo || 1}回</p>
            </div>
            <div>
              <label className="block text-[11px] font-sans font-medium text-zinc-400 mb-1">Enter Name (Max 10 characters)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="PLAYER"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]/50 text-sm flex-1 font-mono"
                  id="player-name-input"
                />
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#bfa032] active:scale-95 text-black font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md"
                  id="save-score-submit-btn"
                >
                  登録
                </button>
              </div>
            </div>
          </form>
        )
      )}

      <div className="space-y-2.5">
        {scores.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-sm font-sans">
            まだハイスコアの記録がありません。<br />プレイして一番乗りを目指そう！
          </div>
        ) : (
          scores.map((score, index) => {
            const isTop1 = index === 0;
            return (
              <div
                key={score.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isTop1
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/35 shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                    : 'bg-black/30 border-white/5'
                }`}
                id={`score-row-${index}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                      index === 0
                        ? 'bg-[#D4AF37] text-black shadow-md'
                        : index === 1
                        ? 'bg-zinc-300 text-zinc-900'
                        : index === 2
                        ? 'bg-amber-750 text-white bg-amber-800'
                        : 'bg-zinc-900 text-zinc-505 text-zinc-500 border border-white/5'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5 font-sans">
                      {score.name}
                      {isTop1 && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 font-mono">
                      <span className="flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-[#D4AF37]" />
                        {score.maxCombo} Combo
                      </span>
                      <span>•</span>
                      <span>{getMultiplierLabel(score.multiplierType)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-base ${isTop1 ? 'text-[#D4AF37]' : 'text-zinc-100'}`}>
                    {score.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-600 flex items-center justify-end gap-1 font-mono">
                    <Calendar className="w-2.5 h-2.5" />
                    {score.date}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-[#D4AF37] hover:text-white border border-white/10 py-2.5 rounded-xl font-semibold text-sm transition-all font-display italic"
          id="close-leaderboard-btn"
        >
          メニューに戻る
        </button>
      )}
    </div>
  );
}
