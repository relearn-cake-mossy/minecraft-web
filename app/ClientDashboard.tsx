'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClientDashboard({ data, chartData }: { data: any; chartData: any[] }) {
  const themeColor = data?.online ? 'emerald' : 'rose';
  const shadowNeon = data?.online 
    ? 'shadow-[0_0_50px_rgba(16,185,129,0.15)] border-emerald-500/30' 
    : 'shadow-[0_0_50px_rgba(244,63,94,0.15)] border-rose-500/30';

  return (
    <main className="min-h-screen bg-[#060207] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Nền lưới Cyberpunk */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#37415108_1px,transparent_1px),linear-gradient(to_bottom,#37415108_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

      {/* Cụm Dashboard tổng thể */}
      <div className="w-full max-w-4xl space-y-6 relative z-10">
        
        {/* Phần Thống kê nhanh phía trên */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/80 backdrop-blur-2xl p-6 rounded-3xl border ${shadowNeon}`}>
          <div className="flex items-center gap-4">
            {data?.icon ? (
              <img src={data.icon} alt="Icon" className="w-14 h-14 rounded-xl border border-slate-800" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800">⛏️</div>
            )}
            <div>
              <h2 className="font-mono font-bold text-slate-200">MINECRAFT HUB</h2>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold bg-${themeColor}-500/10 text-${themeColor}-400 border border-${themeColor}-500/20 mt-1 inline-block`}>
                {data?.online ? 'ONLINE NODE' : 'OFFLINE NODE'}
              </span>
            </div>
          </div>
          
          <div className="bg-black/30 p-3 rounded-xl border border-slate-900 font-mono text-xs flex flex-col justify-center">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Mô tả hệ thống</span>
            <p className="text-slate-300 mt-0.5 truncate">{data?.motd || 'No transmission data.'}</p>
          </div>

          <div className="bg-black/30 p-3 rounded-xl border border-slate-900 font-mono text-xs flex justify-between items-center px-4">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">ONLINE / MAX</span>
              <p className={`text-xl font-black text-${themeColor}-400 mt-0.5`}>
                {data?.players?.online ?? 0}<span className="text-slate-600 text-xs font-normal"> / {data?.players?.max ?? 0}</span>
              </p>
            </div>
            <button 
              onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
              className={`p-2.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-${themeColor}-500/40 text-slate-400 hover:text-white transition-all active:scale-95`}
              title="Làm mới"
            >
              🔄
            </button>
          </div>
        </div>

        {/* ─── KHU VỰC BIỂU ĐỒ CHUẨN 100% NHƯ TRONG ẢNH MẪU ─── */}
        <div className="w-full bg-[#110509] p-6 rounded-[2rem] border border-red-950/30 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative">
          
          <div className="mb-4 flex justify-between items-center px-2">
            <span className="font-mono text-xs text-red-500/60 uppercase tracking-[0.2em] font-bold">Live Players Analytical</span>
            <span className="text-[10px] font-mono text-slate-600">Timeline: 7 Cycles</span>
          </div>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Khai báo dải màu chuyển sắc Gradient đổ bóng sâu từ Xanh dương xuống Tím tối của ảnh mẫu */}
                  <linearGradient id="cyberGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1e1b4b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>

                {/* Đường lưới kẻ ngang mờ mờ */}
                <CartesianGrid strokeDasharray="0" stroke="#1f1519" vertical={false} />
                
                {/* Trục X hiển thị ngày tháng */}
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} 
                  dy={15}
                />
                
                {/* Trục Y hiển thị số lượng người chơi */}
                <YAxis 
                  domain={[0, 'dataMax + 10']}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} 
                />

                {/* Ô hiển thị thông số chi tiết khi di chuột qua */}
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090507', borderColor: '#3b82f640', borderRadius: '12px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#64748b', fontSize: '11px' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />

                {/* Vẽ đường cong Spline mượt mà (type="monotone") kèm chấm tròn phát sáng tại đỉnh */}
                <Area 
                  type="monotone" 
                  dataKey="players" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#cyberGlow)"
                  // Tạo chấm tròn trắng viền neon xanh giống hệt ảnh mẫu tại các đỉnh nút giao
                  dot={{ r: 5, fill: '#ffffff', stroke: '#3b82f6', strokeWidth: 3, shadowBlur: 10 }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: '#60a5fa', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chân trang thông số ngủ đông */}
        <p className="text-center text-[10px] text-slate-600 font-mono tracking-wider">
          SYSTEM STATUS: HEALTHY • CORE HIBERNATION: ENABLED (12H INACTIVITY TRIGGER)
        </p>
      </div>
    </main>
  );
}
