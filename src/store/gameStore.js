import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

// --- RUBRIC & HELPER ---
export const STAT_RUBRIC = {
    0: { label: "Khởi đầu", desc: "Chưa có nền tảng." },
    20: { label: "Tập sự", desc: "Đã bắt đầu, còn yếu." },
    40: { label: "Trung bình", desc: "Mức độ chấp nhận được." },
    60: { label: "Khá", desc: "Thành thạo, thói quen tốt." },
    80: { label: "Giỏi", desc: "Chuyên gia, điểm mạnh." },
    100: { label: "Thần thoại", desc: "Đỉnh cao nhân loại." }
};

export const getStatInfo = (score) => {
    if (score >= 100) return STAT_RUBRIC[100];
    if (score >= 80) return STAT_RUBRIC[80];
    if (score >= 60) return STAT_RUBRIC[60];
    if (score >= 40) return STAT_RUBRIC[40];
    if (score >= 20) return STAT_RUBRIC[20];
    return STAT_RUBRIC[0];
};

const INITIAL_CHAR = {
    name: "Novice Hero", level: 1, xp: 0, maxXp: 1000, hp: 100, maxHp: 100, gold: 0,
    stats: { health: 50, wisdom: 50, wealth: 50, social: 50, career: 50, spirit: 50 },
    role: 'user'
};

// --- STORE CHÍNH ---
const useGameStore = create((set, get) => ({
  user: null,
  character: INITIAL_CHAR,
  quests: [],
  shopItems: [],
  inventory: [],
  isLoading: false,

  setUser: (user) => set({ user }),

  // --- HÀM CHECK NGÀY MỚI ---
  checkDailyReset: async () => {
    const state = get();
    if (!state.user) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Lấy ngày reset từ character (DB đã trả về)
    const lastReset = state.character.last_reset_date;

    if (lastReset !== today) {
        console.log("🌅 New Day Detected!");
        
        // 1. Reset Quest trên Local
        const resetQuests = state.quests.map(q => 
            q.type === 'daily' ? { ...q, is_completed: false } : q
        );
        
        // 2. Update DB (Quests)
        await supabase.from('quests')
            .update({ is_completed: false })
            .eq('user_id', state.user.id)
            .eq('type', 'daily');

        // 3. Update DB (Profile - set ngày mới)
        await supabase.from('profiles')
            .update({ last_reset_date: today })
            .eq('id', state.user.id);

        // 4. Update Store
        set({
            quests: resetQuests,
            character: { ...state.character, last_reset_date: today }
        });
        
        toast.info("Ngày mới! Nhiệm vụ đã được làm mới.");
    }
  },

  // --- 1. HÀM TẢI DỮ LIỆU (LOAD DATA) ---
  loadGameData: async (userId) => {
    set({ isLoading: true });
    try {
      // 1. Cố gắng lấy Profile hiện có
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // 2. Nếu chưa có -> Tạo mới
      if (!profile) {
        const { data: { user } } = await supabase.auth.getUser();
        const registeredName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Hero";
        // Logic Admin
        const role = user?.email === 'huy30987@gmail.com' ? 'admin' : 'user';

        const newProfile = { 
            id: userId, 
            username: registeredName, 
            role, 
            stats: INITIAL_STATE.character.stats, // Dùng stats mặc định
            level: 1, xp: 0, gold: 0, hp: 100, max_hp: 100, max_xp: 1000
        };

        // Thử Insert
        const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
        
        if (insertError) {
            // QUAN TRỌNG: Nếu lỗi là "Đã tồn tại" (23505), nghĩa là luồng khác đã tạo xong.
            // Ta chỉ cần load lại dữ liệu là xong.
            if (insertError.code === '23505') {
                const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId).single();
                profile = existing; // Dùng cái đã có
            } else {
                throw insertError; // Lỗi khác thì báo ra
            }
        } else {
            profile = newProfile; // Insert thành công
            // Tạo dữ liệu mẫu cho người mới (Quest, Shop...)
            // (Chỉ chạy khi chắc chắn insert thành công để tránh duplicate quest)
            await supabase.from('quests').insert(DEFAULT_QUESTS.map(q => ({
                user_id: userId, title: q.title, difficulty: q.difficulty, type: q.type, reward_xp: q.reward.xp, reward_gold: q.reward.gold
            })));
            await supabase.from('shop_items').insert(DEFAULT_SHOP_ITEMS.map(i => ({
                user_id: userId, title: i.title, cost: i.cost
            })));
        }
      }

      // 3. Load các bảng phụ (Lúc này chắc chắn đã có Profile)
      const { data: quests } = await supabase.from('quests').select('*').eq('user_id', userId).order('id');
      const { data: inventory } = await supabase.from('inventory').select('*').eq('user_id', userId);
      const { data: shopItems } = await supabase.from('shop_items').select('*').or(`user_id.eq.${userId},user_id.is.null`);

      set({ 
          character: { 
              ...profile, 
              name: profile.username, 
              maxXp: 1000 * Math.pow(1.2, (profile.level || 1) - 1) 
          },
          quests: quests || [],
          inventory: inventory || [],
          shopItems: shopItems || [],
          isLoading: false 
      });

    } catch (err) {
      console.error("Load Error:", err);
      // Không hiện thông báo lỗi đỏ nếu là lỗi duplicate (vì đã xử lý ngầm)
      if (err.code !== '23505') toast.error("Lỗi tải dữ liệu: " + err.message);
      set({ isLoading: false });
    }
  },

  // --- 2. CÁC HÀNH ĐỘNG (ACTIONS) ---

  addQuest: async (quest) => {
    const state = get();
    const { data, error } = await supabase.from('quests').insert([{
        user_id: state.user.id,
        title: quest.title,
        difficulty: quest.difficulty,
        type: quest.type,
        reward_xp: quest.reward.xp,     // Map từ UI cũ sang DB mới
        reward_gold: quest.reward.gold  // Map từ UI cũ sang DB mới
    }]).select();

    if (error) return toast.error(error.message);
    set(s => ({ quests: [...s.quests, data[0]] }));
    toast.success("Đã thêm nhiệm vụ!");
  },

  toggleQuest: async (id) => {
    const state = get();
    const quest = state.quests.find(q => q.id === id);
    if (!quest) return;

    const isCompleted = !quest.is_completed; // DB dùng snake_case
    const multiplier = isCompleted ? 1 : -1;
    
    // Tính toán Character mới
    let { xp, gold, level, hp } = state.character;
    xp += quest.reward_xp * multiplier;
    gold += quest.reward_gold * multiplier;
    
    let maxXp = 1000 * Math.pow(1.2, level - 1);

    if (xp >= maxXp) {
        level++;
        xp -= maxXp;
        hp = 100; // Hồi máu
        toast.success(`LEVEL UP! Chào mừng cấp độ ${level}`);
    }

    // 1. Update Local UI ngay (Optimistic)
    set(s => ({
        quests: s.quests.map(q => q.id === id ? { ...q, is_completed: isCompleted } : q),
        character: { ...s.character, xp, gold, level, hp }
    }));

    // 2. Update DB
    await supabase.from('quests').update({ is_completed: isCompleted }).eq('id', id);
    await supabase.from('profiles').update({ xp, gold, level, hp }).eq('id', state.user.id);
  },

  deleteQuest: async (id) => {
      const { error } = await supabase.from('quests').delete().eq('id', id);
      if (!error) set(s => ({ quests: s.quests.filter(q => q.id !== id) }));
  },

  addShopItem: async (item) => {
      const state = get();
      const { data, error } = await supabase.from('shop_items').insert([{
          user_id: state.user.id,
          title: item.title,
          cost: item.cost
      }]).select();
      
      if (!error) {
          set(s => ({ shopItems: [...s.shopItems, data[0]] }));
          toast.success("Đã thêm vật phẩm!");
      }
  },

  deleteShopItem: async (id) => {
      const { error } = await supabase.from('shop_items').delete().eq('id', id);
      if (!error) set(s => ({ shopItems: s.shopItems.filter(i => i.id !== id) }));
  },

  buyItem: async (id) => {
      const state = get();
      const item = state.shopItems.find(i => i.id === id);
      if (!item) return;

      if (state.character.gold >= item.cost) {
          // Trừ tiền
          const newGold = state.character.gold - item.cost;
          
          // 1. Update Profile DB
          await supabase.from('profiles').update({ gold: newGold }).eq('id', state.user.id);
          
          // 2. Insert Inventory DB
          const { data: invItem } = await supabase.from('inventory').insert([{
              user_id: state.user.id,
              item_name: item.title
          }]).select();

          // 3. Update Local State
          set(s => ({
              character: { ...s.character, gold: newGold },
              inventory: [...s.inventory, invItem[0]]
          }));
          toast.success(`Đã mua: ${item.title}`);
      } else {
          toast.error("Không đủ tiền!");
      }
  },

  useItem: async (id) => {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (!error) {
          set(s => ({ inventory: s.inventory.filter(i => i.id !== id) }));
          toast.info("Đã sử dụng vật phẩm");
      }
  },

  updateProfile: async (name, stats) => {
      const state = get();
      const { error } = await supabase.from('profiles').update({
          username: name,
          stats: stats
      }).eq('id', state.user.id);

      if (!error) {
          set(s => ({ character: { ...s.character, name, stats } }));
          toast.success("Đã lưu hồ sơ");
      }
  }
}));

export default useGameStore;