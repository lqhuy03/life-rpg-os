import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';
import { toast } from 'sonner';

// --- 1. RUBRIC & HELPER ---
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

const calculateLevel = (xp) => {
    let level = 1;
    let req = 1000;
    while (xp >= req) {
        xp -= req;
        level++;
        req = Math.floor(req * 1.2);
    }
    return { level, currentXp: xp, nextLevelXp: req };
};

// --- 2. DATA MẪU ---
const DEFAULT_SHOP_ITEMS = [
    { title: "Cà phê / Trà sữa", cost: 50 },
    { title: "Xem phim 1 tập", cost: 80 },
    { title: "Ngủ nướng 1 hôm", cost: 200 },
    { title: "Mua món đồ < 200k", cost: 500 },
];

const DEFAULT_QUESTS = [
    { title: "Uống 1 ly nước", difficulty: "easy", type: "good", reward_xp: 10, reward_gold: 5, description: "Giúp não bộ tập trung" },
    { title: "Lướt MXH quá 30p", difficulty: "medium", type: "bad", reward_xp: 0, reward_gold: 0, description: "Gây mất tập trung" },
];

// CẬP NHẬT 8 CHỈ SỐ MỚI & TIER
const INITIAL_CHAR = {
    name: "Hero", role: 'user', level: 1, xp: 0, maxXp: 1000, gold: 0, hp: 100, maxHp: 100,
    stats: { 
        health: 5, finance: 5, career: 5, growth: 5, 
        relationship: 5, fun: 5, environment: 5, spirit: 5 
    },
    current_tier: null, // Mặc định chưa có tier
    last_reset_date: '', login_streak: 0
};

// --- 3. STORE CHÍNH ---
const useGameStore = create((set, get) => ({
  user: null,
  isLoading: false,
  showDailyLoginModal: false,
  
  character: INITIAL_CHAR,
  habits: [],
  projects: [],
  tasks: [],
  shopItems: [],
  inventory: [],
  logs: [], 

  setUser: (user) => set({ user }),
  closeDailyModal: () => set({ showDailyLoginModal: false }),

  // --- LOAD DATA ---
  loadGameData: async (userId) => {
    set({ isLoading: true });
    try {
      let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (!profile) {
         const { data: { user } } = await supabase.auth.getUser();
         const name = user?.user_metadata?.full_name || "Hero";
         const role = user?.email === 'huy30987@gmail.com' ? 'admin' : 'user';

         const newProfile = { 
             id: userId, username: name, role, 
             stats: INITIAL_CHAR.stats, // Dùng 8 chỉ số mới
             level: 1, xp: 0, gold: 0, hp: 100, 
             current_tier: null 
         };

         const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
         
         if (insertError) {
             if (insertError.code === '23505') {
                 const { data: existing } = await supabase.from('profiles').select('*').eq('id', userId).single();
                 profile = existing;
             } else { throw insertError; }
         } else {
             profile = newProfile;
             await supabase.from('habits').insert(DEFAULT_QUESTS.map(q => ({ ...q, user_id: userId })));
             await supabase.from('shop_items').insert(DEFAULT_SHOP_ITEMS.map(i => ({ ...i, user_id: userId })));
         }
      }

      await supabase.rpc('check_login_streak'); 
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();

      const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId).order('id');
      const { data: projects } = await supabase.from('projects').select('*').eq('user_id', userId).order('id');
      const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).order('is_completed');
      const { data: inventory } = await supabase.from('inventory').select('*').eq('user_id', userId);
      const { data: shopItems } = await supabase.from('shop_items').select('*').or(`user_id.eq.${userId},user_id.is.null`);
      const { data: logs } = await supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);

      const levelInfo = calculateLevel(updatedProfile.xp || 0);
      const today = new Date().toISOString().split('T')[0];
      const showPopup = updatedProfile.last_login_date === today && localStorage.getItem('seen_daily_popup') !== today;

      set({
        character: { 
            ...updatedProfile, 
            name: updatedProfile.username, 
            xp: levelInfo.currentXp, 
            maxXp: levelInfo.nextLevelXp, 
            level: levelInfo.level 
        },
        habits: habits || [], projects: projects || [], tasks: tasks || [],
        inventory: inventory || [], shopItems: shopItems || [], logs: logs || [],
        isLoading: false, showDailyLoginModal: showPopup
      });

    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  // --- LOG ACTIVITY ---
  logActivity: async (actionType, targetName, xp, gold) => {
      const state = get();
      const newLog = {
          user_id: state.user.id,
          action_type: actionType,
          target_name: targetName,
          xp_gained: xp,
          gold_gained: gold
      };
      const { data } = await supabase.from('activity_logs').insert([newLog]).select();
      if (data) set(s => ({ logs: [data[0], ...s.logs] }));
  },

  // --- HABITS ---
  addHabit: async (habit) => {
      const state = get();
      const { data, error } = await supabase.from('habits').insert([{
          user_id: state.user.id,
          title: habit.title,
          difficulty: habit.difficulty,
          type: habit.type,
          description: habit.description 
      }]).select();
      if (!error) {
          set(s => ({ habits: [...s.habits, data[0]] }));
          toast.success("Đã tạo thói quen mới");
      }
  },

  checkHabit: async (habit) => {
      const state = get();
      const today = new Date().toISOString().split('T')[0];
      if (habit.last_completed_date === today) return;

      let xp = 10; let gold = 5;
      if (habit.difficulty === 'medium') { xp = 20; gold = 10; }
      if (habit.difficulty === 'hard') { xp = 40; gold = 20; }

      if (habit.type === 'good') {
          const newStreak = habit.current_streak + 1;
          const newHistory = [...(habit.history || []), today];
          
          await supabase.from('habits').update({ current_streak: newStreak, last_completed_date: today, history: newHistory }).eq('id', habit.id);
          await state.addReward(xp, gold);
          await state.logActivity('habit_done', habit.title, xp, gold);

          set(s => ({ habits: s.habits.map(h => h.id === habit.id ? { ...h, current_streak: newStreak, last_completed_date: today, history: newHistory } : h) }));
          toast.success(`Tuyệt vời! +${xp} XP`);
      } else {
          const newHistory = [...(habit.history || []), today];
          await supabase.from('habits').update({ current_streak: 0, last_completed_date: today, history: newHistory }).eq('id', habit.id);
          
          const damage = habit.difficulty === 'hard' ? 30 : 15;
          await state.takeDamage(damage);
          await state.logActivity('habit_fail', habit.title, 0, 0);

          set(s => ({ habits: s.habits.map(h => h.id === habit.id ? { ...h, current_streak: 0, last_completed_date: today, history: newHistory } : h) }));
          toast.error(`Phạm quy! -${damage} HP`);
      }
  },

  deleteHabit: async (id) => {
      await supabase.from('habits').delete().eq('id', id);
      set(s => ({ habits: s.habits.filter(h => h.id !== id) }));
  },

  // --- PROJECTS & TASKS ---
  addProject: async (title) => {
      const state = get();
      const { data } = await supabase.from('projects').insert([{ user_id: state.user.id, title: title }]).select();
      if (data) set(s => ({ projects: [...s.projects, data[0]] }));
  },
  deleteProject: async (id) => {
      await supabase.from('projects').delete().eq('id', id);
      set(s => ({ projects: s.projects.filter(p => p.id !== id), tasks: s.tasks.filter(t => t.project_id !== id) }));
  },
  addTask: async (task) => {
      const state = get();
      const { data } = await supabase.from('tasks').insert([{
          user_id: state.user.id, project_id: task.projectId || null, title: task.title, difficulty: task.difficulty, priority: task.priority
      }]).select();
      if (data) set(s => ({ tasks: [...s.tasks, data[0]] }));
  },
  toggleTask: async (id) => {
      const state = get();
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;
      const isCompleted = !task.is_completed;
      
      await supabase.from('tasks').update({ is_completed: isCompleted, completed_at: isCompleted ? new Date() : null }).eq('id', id);
      
      if (isCompleted) { 
          await state.addReward(20, 10); 
          await state.logActivity('task_done', task.title, 20, 10);
          toast.success("Task Done! +20 XP");
      }
      set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, is_completed: isCompleted } : t) }));
  },
  deleteTask: async (id) => {
      await supabase.from('tasks').delete().eq('id', id);
      set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },

  // --- SHOP & INVENTORY ---
  addShopItem: async (item) => {
      const state = get();
      const { data } = await supabase.from('shop_items').insert([{ user_id: state.user.id, title: item.title, cost: item.cost }]).select();
      if (data) set(s => ({ shopItems: [...s.shopItems, data[0]] }));
  },
  deleteShopItem: async (id) => {
      await supabase.from('shop_items').delete().eq('id', id);
      set(s => ({ shopItems: s.shopItems.filter(i => i.id !== id) }));
  },
  buyItem: async (id) => {
      const state = get();
      const item = state.shopItems.find(i => i.id === id);
      if (item && state.character.gold >= item.cost) {
          const newGold = state.character.gold - item.cost;
          await supabase.from('profiles').update({ gold: newGold }).eq('id', state.user.id);
          const { data } = await supabase.from('inventory').insert([{ user_id: state.user.id, item_name: item.title }]).select();
          
          await state.logActivity('buy_item', item.title, 0, -item.cost);
          set(s => ({ character: { ...s.character, gold: newGold }, inventory: [...s.inventory, data[0]] }));
          toast.success(`Đã mua: ${item.title}`);
      } else {
          toast.error("Không đủ tiền!");
      }
  },
  useItem: async (id) => {
      await supabase.from('inventory').delete().eq('id', id);
      set(s => ({ inventory: s.inventory.filter(i => i.id !== id) }));
      toast.info("Đã dùng vật phẩm");
  },

  // --- CORE HELPERS ---
  addReward: async (xpGain, goldGain) => {
      const state = get();
      const { xp, gold, id } = state.character;
      const { error } = await supabase.from('profiles').update({ xp: xp + xpGain, gold: gold + goldGain }).eq('id', id);
      if (!error) {
          const levelInfo = calculateLevel(xp + xpGain);
          set(s => ({ character: { ...s.character, xp: levelInfo.currentXp, maxXp: levelInfo.nextLevelXp, level: levelInfo.level, gold: gold + goldGain } }));
      }
  },
  takeDamage: async (dmg) => {
      const state = get();
      let { hp, id } = state.character;
      let newHp = Math.max(0, hp - dmg);
      await supabase.from('profiles').update({ hp: newHp }).eq('id', id);
      set(s => ({ character: { ...s.character, hp: newHp } }));
      if (newHp === 0) toast.error("BẠN ĐÃ KIỆT SỨC!");
  },
  
  // --- UPDATE PROFILE (Hỗ trợ cả Tier) ---
  updateProfile: async (name, stats, tier = null) => { 
      const state = get();
      const updates = { username: name, stats: stats };
      if (tier) updates.current_tier = tier;

      await supabase.from('profiles').update(updates).eq('id', state.user.id);
      
      set(s => ({ 
          character: { ...s.character, name, stats, ...(tier && { current_tier: tier }) } 
      }));
      if (!tier) toast.success("Đã lưu hồ sơ");
  },

  // --- DAILY RESET ---
  checkDailyReset: async () => {
    const state = get();
    if (!state.user) return;
    const today = new Date().toISOString().split('T')[0];
    
    if (state.character.last_reset_date !== today) {
        const habits = state.habits;
        let bonusXp = 0;
        habits.forEach(h => {
            if (h.type === 'bad' && h.last_completed_date !== today) {
                bonusXp += 10; 
            }
        });
        if (bonusXp > 0) {
            await state.addReward(bonusXp, 0);
            toast.success(`Kiềm chế tốt! +${bonusXp} XP`);
        }

        await supabase.from('profiles').update({ last_reset_date: today }).eq('id', state.user.id);
        set(s => ({ character: { ...s.character, last_reset_date: today } }));
        toast.info("Ngày mới! Chúc bạn năng suất.");
    }
  }
}));

export default useGameStore;