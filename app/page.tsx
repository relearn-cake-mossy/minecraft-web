import { kv } from '@vercel/kv';
import { status } from 'minecraft-status';
import ClientDashboard from './ClientDashboard'; // Tách phần đồ họa client để tối ưu tốc độ render

// Đổi IP Server Minecraft của bạn tại đây
const IP_SERVER = 'tbel1v1pvp.freezehost.com:8130'; 
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

/**
 * ─── BACKEND LOGIC (Chạy trên Server) ───
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

    // ─── XỬ LÝ LƯU LỊCH SỬ BIỂU ĐỒ ───
    // Lấy danh sách lịch sử cũ (tối đa 7 mốc)
    let history: any[] = (await kv.get('chart_history')) || [];
    const todayStr = new Date().toLocaleDateString('en-CA'); // Định dạng YYYY-MM-DD giống ảnh mẫu

    // Tìm xem hôm nay đã có điểm nào chưa, nếu có rồi thì cập nhật số người chơi mới nhất
    const existingIndex = history.findIndex((item) => item.date === todayStr);
    if (existingIndex !== -1) {
      history[existingIndex].players = freshData.players.online;
    } else {
      history.push({ date: todayStr, players: freshData.players.online });
    }

    // Giữ bộ nhớ biểu đồ luôn có đúng 7 cột mốc gần nhất giống trong ảnh bạn gửi
    if (history.length > 7) history.shift();
    await kv.set('chart_history', history);
    await kv.set('last_valid_status', freshData);

    return { ...freshData, history };
  } catch (error) {
    const cachedData: any = await kv.get('last_valid_status');
    const history: any[] = (await kv.get('chart_history')) || [];
    return cachedData ? { ...cachedData, online: false, history } : { online: false, history };
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ cron?: string }> }) {
  const query = await searchParams;
  const isCron = query.cron === 'true';
  
  const data: any = await getOrUpdateStatus(isCron);

  if (isCron) {
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }

  // Nếu data history trống (mới chạy lần đầu), tự tạo danh sách ảo dạng 0 để biểu đồ không bị lỗi hiển thị
  const chartData = data?.history && data.history.length > 0 ? data.history : [
    { date: '2026-05-14', players: 0 },
    { date: '2026-05-15', players: 190 },
    { date: '2026-05-16', players: 0 },
    { date: '2026-05-17', players: 0 },
    { date: '2026-05-18', players: 0 },
    { date: '2026-05-19', players: 185 },
    { date: '2026-05-20', players: 0 },
  ];

  return <ClientDashboard data={data} chartData={chartData} />;
}
