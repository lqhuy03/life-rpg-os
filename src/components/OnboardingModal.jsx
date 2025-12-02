import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Target, Shield, Zap, RefreshCcw } from 'lucide-react';
import useGameStore from '../store/gameStore';
import { toast } from 'sonner';

// DỮ LIỆU CÂU HỎI CHI TIẾT (Theo tài liệu bạn cung cấp)
const LIFE_ASPECTS = [
    {
        key: 'health',
        label: 'Sức Khỏe & Thể Chất',
        desc: 'Năng lượng để sống',
        questions: [
            "Ngủ đủ 7-8 tiếng, dậy tỉnh táo?",
            "Tập thể dục (ra mồ hôi) 3 lần/tuần?",
            "Ăn uống kiểm soát đường/dầu mỡ, đủ rau?",
            "Khám sức khỏe trong 12 tháng qua?",
            "Năng lượng 3h chiều ổn định?"
        ]
    },
    {
        key: 'finance',
        label: 'Tài Chính Cá Nhân',
        desc: 'Sự an tâm và tự do',
        questions: [
            "Biết chính xác tháng rồi tiêu bao nhiêu?",
            "Có quỹ khẩn cấp 3-6 tháng?",
            "Trả hết nợ tiêu dùng hàng tháng?",
            "Có nguồn thu nhập ngoài lương cứng?",
            "Có bảo hiểm nhân thọ/sức khỏe?"
        ]
    },
    {
        key: 'career',
        label: 'Sự Nghiệp',
        desc: 'Cảm giác có ích và thăng tiến',
        questions: [
            "Hào hứng khi đi làm sáng thứ Hai?",
            "Công việc đúng sở trường/giá trị cốt lõi?",
            "Có lộ trình thăng tiến 3 năm tới?",
            "Được sếp/đồng nghiệp ghi nhận?",
            "Thu nhập xứng đáng công sức?"
        ]
    },
    {
        key: 'growth',
        label: 'Phát Triển Bản Thân',
        desc: 'Trí tuệ và kỹ năng',
        questions: [
            "Đọc xong 1 sách/khóa học tháng qua?",
            "Đang chủ động học kỹ năng mới?",
            "Dành thời gian tĩnh lặng (journal/thiền)?",
            "Sẵn sàng đón nhận thử thách mới?",
            "Có mentor hoặc hình mẫu noi theo?"
        ]
    },
    {
        key: 'relationship',
        label: 'Mối Quan Hệ',
        desc: 'Sự kết nối và yêu thương',
        questions: [
            "Có 3 người sẵn sàng giúp khi gặp nạn?",
            "Dành thời gian chất lượng cho gia đình?",
            "Cảm thấy được lắng nghe/thấu hiểu?",
            "Chủ động giải quyết xung đột?",
            "Môi trường xung quanh tích cực?"
        ]
    },
    {
        key: 'fun',
        label: 'Giải Trí & Tận Hưởng',
        desc: 'Tái tạo năng lượng',
        questions: [
            "Có sở thích quên thời gian (flow)?",
            "Nghỉ ngơi hoàn toàn 1 ngày/tuần?",
            "Cười sảng khoái gần đây?",
            "Có kế hoạch đi chơi/trải nghiệm mới?",
            "Nghỉ ngơi không cảm thấy tội lỗi?"
        ]
    },
    {
        key: 'environment',
        label: 'Môi Trường Sống',
        desc: 'Không gian truyền cảm hứng',
        questions: [
            "Nhà cửa gọn gàng, ngăn nắp?",
            "Không gian an toàn, yên tĩnh?",
            "Đồ đạc hoạt động tốt, không hỏng vặt?",
            "Cảm thấy thư giãn khi về nhà?",
            "Gần gũi thiên nhiên/ánh sáng tự nhiên?"
        ]
    },
    {
        key: 'spirit',
        label: 'Tâm Linh & Tinh Thần',
        desc: 'Sự bình an nội tại',
        questions: [
            "Cảm thấy cuộc sống có ý nghĩa?",
            "Thường xuyên biết ơn điều nhỏ bé?",
            "Bình tĩnh khi gặp biến cố?",
            "Giúp đỡ người khác/cộng đồng?",
            "Kết nối với điều lớn lao hơn bản thân?"
        ]
    }
];

const OnboardingModal = () => {
    const { character, updateProfile } = useGameStore();
    const [step, setStep] = useState(0); // 0: Intro, 1-8: Aspects, 9: Result
    const [scores, setScores] = useState({}); // Lưu điểm từng phần

    // Chỉ hiện nếu chưa có Tier
    if (character.current_tier) return null;

    const handleScore = (val) => {
        const currentAspect = LIFE_ASPECTS[step - 1];
        setScores({ ...scores, [currentAspect.key]: parseInt(val) });
    };

    const nextStep = () => {
        if (step < LIFE_ASPECTS.length) {
            setStep(step + 1);
        } else {
            finishAudit();
        }
    };

    const finishAudit = () => {
        // Tính toán Tier dựa trên điểm trung bình
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        const avg = total / 8;
        
        let tier = 'survivor';
        let title = 'Người Sống Sót (Survivor)';
        
        if (avg >= 5) { tier = 'achiever'; title = 'Người Kiến Tạo (Achiever)'; }
        if (avg >= 8) { tier = 'master'; title = 'Bậc Thầy (Master)'; }

        // Lưu vào DB
        updateProfile(character.name, scores, tier);
        
        toast.success(`Đã thiết lập Bánh Xe Cuộc Đời!`, {
            description: `Cấp độ của bạn: ${title} (Trung bình: ${avg.toFixed(1)})`,
            duration: 5000,
        });
    };

    // --- MÀN HÌNH 1: GIỚI THIỆU ---
    if (step === 0) {
        return (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4 animate-fade-in">
                <div className="glass-panel p-8 rounded-3xl max-w-lg w-full text-center border-2 border-emerald-500/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    <RefreshCcw size={48} className="mx-auto text-emerald-400 mb-4 animate-spin-slow" />
                    <h2 className="text-3xl font-black text-white mb-4">LIFE AUDIT (KIỂM TOÁN)</h2>
                    <p className="text-slate-300 mb-6">
                        "Bạn không thể cải thiện những gì bạn không đo lường."<br/>
                        Hãy dành 2 phút để chấm điểm 8 khía cạnh cuộc đời bạn.
                    </p>
                    <button onClick={() => setStep(1)} className="btn-primary w-full py-3 text-lg shadow-lg hover:scale-105 transition-transform">
                        BẮT ĐẦU ĐÁNH GIÁ
                    </button>
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH 2-9: CHẤM ĐIỂM TỪNG PHẦN ---
    const aspect = LIFE_ASPECTS[step - 1];
    const currentScore = scores[aspect.key] || 5;

    // Helper: Lấy màu và lời khuyên dựa trên điểm số (Rubric của bạn)
    const getFeedback = (s) => {
        if (s <= 3) return { color: "text-red-500", text: "Vùng Báo Động: Cần can thiệp ngay!" };
        if (s <= 6) return { color: "text-yellow-500", text: "Vùng Tạm Ổn: Đang trì trệ." };
        if (s <= 8) return { color: "text-emerald-400", text: "Vùng Tăng Trưởng: Rất tốt." };
        return { color: "text-purple-400", text: "Vùng Thăng Hoa: Xuất sắc!" };
    };
    
    const feedback = getFeedback(currentScore);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4 animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl flex flex-col md:flex-row gap-6">
                
                {/* Cột trái: Câu hỏi checklist */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{aspect.label}</h3>
                        <span className="text-xs font-mono text-slate-500">{step}/8</span>
                    </div>
                    <p className="text-sm text-slate-400 italic mb-4">"{aspect.desc}"</p>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-slate-500 uppercase">Tự vấn bản thân:</p>
                        <ul className="space-y-2">
                            {aspect.questions.map((q, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-slate-600 shrink-0 mt-0.5" />
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Cột phải: Thanh trượt chấm điểm */}
                <div className="flex-1 flex flex-col justify-center bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="text-center mb-6">
                        <div className="text-6xl font-black text-white mb-2">{currentScore}</div>
                        <div className={`text-sm font-bold ${feedback.color}`}>{feedback.text}</div>
                    </div>

                    <input 
                        type="range" min="1" max="100" step="1" // Để range rộng cho mượt, sau đó chia 10
                        value={currentScore * 10} 
                        onChange={(e) => handleScore(Math.round(e.target.value / 10))}
                        className={`w-full h-3 rounded-lg appearance-none cursor-pointer mb-8 bg-slate-700 accent-emerald-500`}
                    />
                    
                    <button onClick={nextStep} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                        {step === 8 ? "HOÀN TẤT & TẠO BÁNH XE" : "TIẾP THEO"} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;