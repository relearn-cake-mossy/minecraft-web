import { kv } from '@vercel/kv';
import { status } from 'mcstatus-js';

// Đổi IP Server Minecraft của bạn tại đây
const IP_SERVER = 'tbel1v1pvp.freezehost.com:8130'; 
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

/**
 * ─── BACKEND LOGIC (Giữ nguyên logic của bạn) ───
 */
async function getOrUpdateStatus(isCronJob = false) {
  'use server';

  const now = Date.now();
  const lastActive = (await kv.get<number>('last_active')) || now;

  if (isCronJob && (now - lastActive > TWELVE_HOURS)) {
    return { sleeping: true, message: 'Hệ thống đang ngủ đông.' };
  }

  if (!isCronJob) {
    await kv.set('last_active', now);
  }

  try {
    const [host, portStr] = IP_SERVER.split(':');
    const port = portStr ? parseInt(portStr, 10) : 25565;
    const response = await status(host, port);

    const freshData = {
      online: true,
      version: response.version?.name || 'Không rõ',
      players: { online: response.players?.online || 0, max: response.players?.max || 0 },
      motd: response.description?.text || 'Minecraft Server',
      icon: response.favicon || null,
      lastUpdated: new Date().toLocaleTimeString('vi-VN'),
    };

    await kv.set('last_valid_status', freshData);
    return freshData;
  } catch (error) {
    const cachedData: any = await kv.get('last_valid_status');
    return cachedData ? { ...cachedData, online: false } : { online: false };
  }
}

/**
 * ─── FRONTEND INTERFACE (Giao diện NEON CYBERPUNK nâng cấp) ───
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ cron?: string }> }) {
  const query = await searchParams;
  const isCron = query.cron === 'true';
  
  const data: any = await getOrUpdateStatus(isCron);

  if (isCron) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }

  // Định nghĩa màu Neon chủ đạo dựa trên trạng thái của server
  const themeColor = data?.online ? 'emerald' : 'rose';
  const shadowNeon = data?.online 
    ? 'shadow-[0_0_50px_rgba(16,185,129,0.25)] border-emerald-500/40' 
    : 'shadow-[0_0_50px_rgba(244,63,94,0.25)] border-rose-500/40';

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Cyberpunk Grid Background (Nền lưới ma trận) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* 2. Đèn Neon tỏa dải màu khổng lồ phía sau (Ambient Glow) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 ${
        data?.online ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      }`}></div>

      {/* 3. Khung bo mạch trung tâm (Main Card Dashboard) */}
      <div className={`relative max-w-md w-full bg-slate-950/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border transition-all duration-700 ${shadowNeon}`}>
        
        {/* Góc bo góc kiểu công nghệ */}
        <div className={`absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-${themeColor}-500 to-transparent`}></div>

        {/* Tiêu đề góc nhìn tương lai */}
        <div className="mb-8 relative">
          <h1 className={`text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 uppercase italic`}>
            NEXUS <span className={`text-${themeColor}-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]`}>CORE</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono mt-1">S y s t e m . m o n i t o r</p>
        </div>

        <div className="space-y-6">
          
          {/* Badge Trạng thái phát sáng */}
          <div className="flex justify-center">
            {data?.online ? (
              <div className="px-5 py-2 rounded-full text-xs font-black font-mono tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2.5 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
                ONLINE NODE
              </div>
            ) : (
              <div className="px-5 py-2 rounded-full text-xs font-black font-mono tracking-widest bg-rose-950/60 text-rose-400 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)] flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"></span>
                OFFLINE NODE
              </div>
            )}
          </div>

          {/* Khối Thông tin Server (Hộp kính mờ đen) */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 flex items-center gap-4 text-left shadow-inner hover:border-slate-700/60 transition-all group">
            {data?.icon ? (
              <img src={data.icon} alt="Server Icon" className={`w-16 h-16 rounded-xl border border-slate-700 shadow-lg group-hover:scale-105 transition-transform duration-300 ${data?.online ? 'shadow-emerald-500/10' : ''}`} />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center text-3xl border border-slate-700 shadow-md">⛏️</div>
            )}
            <div>
              <h3 className="font-bold text-lg text-slate-100 font-mono tracking-tight group-hover:text-white transition-colors">MINECRAFT HUB</h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                VERSION: <span className={`font-bold text-${themeColor}-400`}>{data?.version || 'UNKNOWN'}</span>
              </p>
            </div>
          </div>

          {/* Khối hiển thị MOTD (Dòng chữ chạy/mô tả của Server) */}
          <div className="relative bg-black/50 text-left p-4 rounded-xl border border-slate-900 font-mono text-xs text-slate-400 leading-relaxed break-words shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <div className={`absolute top-0 left-0 w-[3px] h-full bg-${themeColor}-500`}></div>
            <p className="pl-2 font-mono text-slate-300 selection:bg-slate-700">{data?.motd || 'No transmission data received.'}</p>
          </div>

          {/* Bảng thông số Grid đôi cá tính */}
          <div className="grid grid-cols-2 gap-4">
            {/* Box hiển thị người chơi */}
            <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/50 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Players Data</p>
              <p className={`text-3xl font-black text-${themeColor}-400 mt-1 tracking-tighter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]`}>
                {data?.players?.online ?? 0}
                <span className="text-slate-600 text-xs font-normal tracking-normal ml-1">/ {data?.players?.max ?? 0}</span>
              </p>
              <div className={`absolute -right-4 -bottom-4 text-5xl opacity-[0.03] font-mono text-${themeColor}-400 select-none group-hover:scale-110 transition-transform`}>QTY</div>
            </div>

            {/* Box hiển thị thời gian */}
            <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/50 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors flex flex-col justify-between">
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider text-center sm:text-left">Timestamp</p>
              <p className="text-sm font-bold text-slate-300 mt-3 font-mono tracking-widest text-center sm:text-left">
                {data?.lastUpdated || '--:--:--'}
              </p>
              <div className="absolute -right-4 -bottom-4 text-5xl opacity-[0.03] font-mono text-slate-400 select-none group-hover:scale-110 transition-transform">SYS</div>
            </div>
          </div>

          {/* Siêu nút bấm tương lai (Neon Interactive Button) */}
          <button 
            // Đoạn mã ép trình duyệt tải lại trang lấy dữ liệu tức thì
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = window.location.pathname;
              }
            }}
            className={`w-full py-4 relative group rounded-xl font-bold font-mono text-xs uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 text-black bg-gradient-to-r from-${themeColor}-400 to-teal-400 hover:from-${themeColor}-300 hover:to-teal-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98]`}
          >
            {/* Hiệu ứng tia sáng quét ngang nút khi di chuột qua */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
            Re-engage System
          </button>
        </div>

        {/* Chú thích chân trang */}
        <div className="mt-8 pt-4 border-t border-slate-900 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-tight leading-normal">
            💡 Auto-ping interval: 30m • Hibernation standby: 12h idle
          </p>
        </div>
      </div>
    </main>
  );
}
