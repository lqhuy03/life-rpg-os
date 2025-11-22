import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

// --- 1. BẢNG ĐIỀU KIỆN ĐÁNH GIÁ (RUBRIC) ---
export const STAT_RUBRIC = {
    0: { label: "Khởi đầu", desc: "Chưa có nền tảng, cần nỗ lực rất nhiều." },
    20: { label: "Tập sự", desc: "Đã bắt đầu, nhưng còn yếu và thiếu ổn định." },
    40: { label: "Trung bình", desc: "Có kiến thức cơ bản, duy trì ở mức chấp nhận được." },
    60: { label: "Khá", desc: "Thành thạo, có thói quen tốt, kết quả rõ ràng." },
    80: { label: "Giỏi", desc: "Chuyên gia, là điểm mạnh vượt trội của bản thân." },
    100: { label: "Thần thoại", desc: "Đỉnh cao, không thể tốt hơn được nữa." }
};

export const getStatInfo = (score) => {
    if (score >= 100) return STAT_RUBRIC[100];
    if (score >= 80) return STAT_RUBRIC[80];
    if (score >= 60) return STAT_RUBRIC[60];
    if (score >= 40) return STAT_RUBRIC[40];
    if (score >= 20) return STAT_RUBRIC[20];
    return STAT_RUBRIC[0];
};

// --- 2. DỮ LIỆU MẪU (CHO NGƯỜI MỚI) ---
const DEFAULT_SHOP_ITEMS = [
    { id: 'def-1', title: "Cà phê / Trà sữa", cost: 50 },
    { id: 'def-2', title: "Xem phim 1 tập", cost: 80 },
    { id: 'def-3', title: "Ngủ nướng 1 hôm", cost: 200 },
    { id: 'def-4', title: "Mua món đồ < 200k", cost: 500 },
];

const DEFAULT_QUESTS = [
    { id: 'q-1', title: "Uống 1 ly nước", type: "daily", difficulty: "easy", reward: { xp: 10, gold: 5 }, isCompleted: false },
    { id: 'q-2', title: "Đọc sách 15p", type: "daily", difficulty: "medium", reward: { xp: 30, gold: 15 }, isCompleted: false },
];

const INITIAL_STATE = {
  character: {
    name: "Novice Hero",
    level: 1, xp: 0, maxXp: 1000, hp: 100, maxHp: 100, gold: 0,
    stats: { health: 50, wisdom: 50, wealth: 50, social: 50, career: 50, spirit: 50 },
    role: 'user', // Mặc định là user
    lastResetDate: '' // <--- MỚI: Lưu ngày reset cuối cùng
  },
  inventory: [],
  history: [],
  quests: [],
  shopItems: []
};

// --- 3. STORE CHÍNH ---
const useGameStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isSaving: false,
  ...INITIAL_STATE,

  setUser: (user) => set({ user }),

  // --- HÀM TẢI DỮ LIỆU ---
  // --- ACTION MỚI: KIỂM TRA VÀ RESET NHIỆM VỤ NGÀY ---
  checkDailyReset: () => {
    const state = get();
    const today = new Date().toLocaleDateString('en-CA'); // Lấy ngày dạng YYYY-MM-DD (theo múi giờ máy)

    // Nếu ngày lưu trong database KHÁC ngày hôm nay => Sang ngày mới rồi!
    if (state.character.lastResetDate !== today) {
        console.log("Detect New Day! Resetting Dailies...");
        
        // 1. Reset các nhiệm vụ type = 'daily'
        const resetQuests = state.quests.map(q => 
            q.type === 'daily' ? { ...q, isCompleted: false } : q
        );

        // 2. Cập nhật lại ngày reset mới nhất
        set({
            quests: resetQuests,
            character: { ...state.character, lastResetDate: today }
        });

        // 3. Thông báo và Lưu
        toast.info("🌅 Chào ngày mới! Nhiệm vụ Daily đã được làm mới.");
        get().syncToCloud();
    }
  },

  // --- HÀM TẢI DỮ LIỆU TỪ CLOUD ---
  loadGameData: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        // USER CŨ: Load dữ liệu về
        set({
          character: { ...data.character, role: data.character.role || 'user' },
          quests: data.quests || [],
          // QUAN TRỌNG: Map từ 'shop_items' (DB) sang 'shopItems' (App)
          shopItems: data.shop_items || [], 
          inventory: data.inventory || [],
          isLoading: false
        });
      } else {
        // USER MỚI: Tạo dữ liệu mẫu
        const { data: { user } } = await supabase.auth.getUser();
        const registeredName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
        
        // Logic Admin (Thay email của bạn vào đây)
        const role = user?.email === 'huy30987@gmail.com' ? 'admin' : 'user';

        const newUserData = { 
            user_id: userId, 
            character: { ...INITIAL_STATE.character, name: registeredName, role }, 
            quests: DEFAULT_QUESTS,
            shop_items: DEFAULT_SHOP_ITEMS, 
            inventory: []
        };

        const { error: insertError } = await supabase.from('game_state').insert([newUserData]);
        
        if (insertError) {
            if (insertError.code === '23505') return get().loadGameData(userId);
            throw insertError;
        }

        // Cập nhật state local ngay lập tức
        set({ 
            ...newUserData, 
            shopItems: DEFAULT_SHOP_ITEMS, // Map lại tên biến cho đúng
            isLoading: false 
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  // --- HÀM LƯU DỮ LIỆU (SYNC) ---
  syncToCloud: async () => {
    const state = get();
    if (!state.user) return;
    
    set({ isSaving: true });
    
    const { error } = await supabase.from('game_state').update({
        character: state.character,
        quests: state.quests,
        shop_items: state.shopItems, // Lưu đúng tên cột DB
        inventory: state.inventory
    }).eq('user_id', state.user.id);

    if (error) console.error("Lỗi lưu:", error);
    set({ isSaving: false });
  },

  // --- GAME ACTIONS ---

  addQuest: (quest) => {
    const newQuest = { ...quest, id: Date.now(), isCompleted: false };
    set((state) => ({ quests: [...state.quests, newQuest] }));
    get().syncToCloud();
  },

  toggleQuest: (id) => {
      const state = get();
      const quest = state.quests.find(q => q.id === id);
      if (!quest) return;
      
      const isCompleting = !quest.isCompleted;
      let { xp, gold, level, maxXp, hp, maxHp } = state.character;
      const multiplier = isCompleting ? 1 : -1;
      
      xp += quest.reward.xp * multiplier;
      gold += quest.reward.gold * multiplier;
      
      if (xp >= maxXp) { 
          level++; 
          xp -= maxXp; 
          maxXp = Math.floor(maxXp * 1.2); 
          hp = maxHp; 
          toast.success("LEVEL UP! Sức mạnh gia tăng!"); 
      }

      set({
        quests: state.quests.map(q => q.id === id ? { ...q, isCompleted: isCompleting } : q),
        character: { ...state.character, xp, gold, level, maxXp, hp }
      });
      get().syncToCloud();
  },

  deleteQuest: (id) => {
      set(state => ({ quests: state.quests.filter(q => q.id !== id) }));
      get().syncToCloud();
  },

  // --- SHOP ACTIONS ---
  
  addShopItem: (item) => {
      set(state => ({ shopItems: [...state.shopItems, { ...item, id: Date.now() }] }));
      toast.success("Đã thêm vật phẩm vào Shop");
      get().syncToCloud();
  },

  deleteShopItem: (id) => {
      set(state => ({ shopItems: state.shopItems.filter(i => i.id !== id) }));
      get().syncToCloud();
  },

  buyItem: (id) => {
    const state = get();
    const item = state.shopItems.find(i => i.id === id);
    
    if (item && state.character.gold >= item.cost) {
      const newItem = { ...item, id: Date.now(), originalId: item.id };
      
      set({ 
        character: { ...state.character, gold: state.character.gold - item.cost },
        inventory: [...(state.inventory || []), newItem],
        history: [{ action: `Đã mua ${item.title}`, date: new Date() }, ...state.history]
      });
      
      toast.success(`Đã mua: ${item.title}`);
      get().syncToCloud();
    } else {
      toast.error("Không đủ Gold!");
    }
  },

  useItem: (id) => {
      const state = get();
      set({ inventory: state.inventory.filter(i => i.id !== id) });
      toast.info("Đã sử dụng vật phẩm");
      get().syncToCloud();
  },

  updateProfile: (name, stats) => {
    set(state => ({ character: { ...state.character, name, stats } }));
    toast.success("Đã cập nhật hồ sơ");
    get().syncToCloud();
  }
}));

export default useGameStore;