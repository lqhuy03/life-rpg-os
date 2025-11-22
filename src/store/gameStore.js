import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';

// Giá trị mặc định cho người chơi mới
const INITIAL_STATE = {
  character: {
    name: "Novice Hero",
    level: 1, xp: 0, maxXp: 1000, hp: 100, maxHp: 100, gold: 0,
    stats: { health: 50, wisdom: 50, wealth: 50, social: 50, career: 50, spirit: 50 }
  },
  quests: [],
  shopItems: []
};

const useGameStore = create((set, get) => ({
  user: null,
  isLoading: false,
  ...INITIAL_STATE,

  setUser: (user) => set({ user }),

  // 1. Tải dữ liệu từ Supabase về
    loadGameData: async (userId) => {
    set({ isLoading: true });
    try {
      // Bước 1: Cố gắng lấy dữ liệu
      const { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        // => TRƯỜNG HỢP 1: Tìm thấy dữ liệu -> Nạp vào game
        set({
          character: data.character,
          quests: data.quests,
          shopItems: data.shop_items,
          isLoading: false
        });
      } else {
        // => TRƯỜNG HỢP 2: Không thấy -> Tạo mới
        const newUserData = { 
            user_id: userId, 
            character: INITIAL_STATE.character, 
            quests: [], 
            shop_items: [] 
        };

        // Thử Insert
        const { error: insertError } = await supabase
            .from('game_state')
            .insert([newUserData]);
        
        if (insertError) {
            // QUAN TRỌNG: Nếu lỗi là "Duplicate" (Mã 23505), nghĩa là vừa có người tạo xong
            // Thì gọi lại hàm này đệ quy để tải dữ liệu đó về.
            if (insertError.code === '23505') {
                return get().loadGameData(userId);
            }
            throw insertError;
        }

        // Nếu tạo thành công không lỗi -> Nạp vào store
        set({ ...INITIAL_STATE, isLoading: false });
      }
    } catch (err) {
      console.error("Lỗi:", err);
      set({ isLoading: false });
    }
  },

  // 2. Hàm đồng bộ ngược lên Supabase (Lưu game)
  syncToCloud: async () => {
    const state = get();
    if (!state.user) return;

    await supabase
      .from('game_state')
      .update({
        character: state.character,
        quests: state.quests,
        shop_items: state.shopItems,
        updated_at: new Date()
      })
      .eq('user_id', state.user.id);
  },

  // 3. Các hành động trong game (Logic RPG)
  addQuest: (quest) => {
    const newQuest = { ...quest, id: Date.now(), isCompleted: false };
    set((state) => ({ quests: [...state.quests, newQuest] }));
    get().syncToCloud();
  },

  deleteQuest: (id) => {
    set((state) => ({ quests: state.quests.filter(q => q.id !== id) }));
    get().syncToCloud();
  },

  toggleQuest: (id) => {
    const state = get();
    const quest = state.quests.find(q => q.id === id);
    if (!quest) return;

    const isCompleting = !quest.isCompleted;
    let { xp, gold, level, maxXp, hp, maxHp } = state.character;
    const multiplier = isCompleting ? 1 : -1; // Nếu bỏ check thì trừ lại thưởng

    xp += quest.reward.xp * multiplier;
    gold += quest.reward.gold * multiplier;

    // Logic Level Up
    if (xp >= maxXp) {
      level++;
      xp -= maxXp;
      maxXp = Math.floor(maxXp * 1.2);
      hp = maxHp; // Hồi máu khi lên cấp
      alert("LEVEL UP! Bạn đã đạt cấp " + level);
    }

    // Cập nhật State local trước
    set({
      quests: state.quests.map(q => q.id === id ? { ...q, isCompleted: isCompleting } : q),
      character: { ...state.character, xp, gold, level, maxXp, hp }
    });
    
    // Lưu lên server sau
    get().syncToCloud();
  },

  addShopItem: (item) => {
    set((state) => ({ shopItems: [...state.shopItems, { ...item, id: Date.now() }] }));
    get().syncToCloud();
  },

  buyItem: (id) => {
    const state = get();
    const item = state.shopItems.find(i => i.id === id);
    
    if (item && state.character.gold >= item.cost) {
      set({ character: { ...state.character, gold: state.character.gold - item.cost } });
      alert(`Đã đổi thưởng: ${item.title}`);
      get().syncToCloud();
    } else {
      alert("Không đủ Gold!");
    }
  },
  
  deleteShopItem: (id) => {
    set((state) => ({ shopItems: state.shopItems.filter(i => i.id !== id) }));
    get().syncToCloud();
  }
}));

export default useGameStore;