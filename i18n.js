// 国际化管理系统
const i18n = {
    currentLang: 'zh',
    resources: {
        zh: {
            // 界面文本
            "welcome_title": "AriTI",
            "welcome_subtitle": "Ariana Grande Type Indicator",
            "welcome_desc": "通过22道精心设计的题目，探索你内心深处的Ariana Grande人格特质。发现你的专属era，获得个性歌单推荐！",
            "disclaimer": "本网站由粉丝制作，非官方，请勿用作其他用途，使用PC或Pad端以获最佳体验",
            "start_test": "开始测试",
            "test_duration": "v1.0beta 测试时长约7-10分钟，若有问题请联系 新浪微博@Lexie·Ariana",
            
            "quiz_title": "AriTI 测试",
            "quiz_version": "初始版 · 22题",
            "progress": "进度",
            "question": "问题",
            "previous": "上一题",
            "next": "下一题",
            
            "single_choice_hint": "请选择最符合您的选项",
            "multiple_choice_hint": "可多选，最多选择 {max} 项",
            
            "loading": "分析您的人格...",
            "loading_subtitle": "正在匹配您与Ariana的歌曲世界",
            
            "your_result": "你的娜属性是",
            "based_on_choices": "基于你22次细心选择",
            "radar_chart": "人格维度雷达图",
            "interpretation": "深度人格解读",
            "recommended_playlist": "推荐歌单",
            "share_result": "分享结果",
            "retry_test": "再测一次"
        },
        en: {
            "welcome_title": "AriTI",
            "welcome_subtitle": "Ariana Grande Type Indicator",
            "welcome_desc": "Discover your inner Ariana Grande personality through 22 carefully designed questions. Find your era and get personalized playlist recommendations!",
            "disclaimer": "This website is fan-made, unofficial, please do not use for other purposes, for the best experience on PC or Pad.",
            "start_test": "Start Test",
            "test_duration": "v1.0beta Test duration: 7-10 minutes. Contect me: Weibo@Lexie·Ariana",
            
            "quiz_title": "AriTI Test",
            "quiz_version": "Original Edition · 22 Questions",
            "progress": "Progress",
            "question": "Question",
            "previous": "Previous",
            "next": "Next",
            
            "single_choice_hint": "Please select the option that best describes you",
            "multiple_choice_hint": "Multiple choice, select up to {max} options",
            
            "loading": "Analyzing your personality...",
            "loading_subtitle": "Matching you with Ariana's music world",
            
            "your_result": "Your Personality Is",
            "based_on_choices": "Based on your 22 choices",
            "radar_chart": "Personality Radar Chart",
            "interpretation": "In-depth Interpretation",
            "recommended_playlist": "Recommended Playlist",
            "share_result": "Share Result",
            "retry_test": "Retry Test"
        }
    },
    
    // 初始化语言
    init() {
        const savedLang = localStorage.getItem('argti_language') || 'zh';
        this.setLanguage(savedLang);
    },
    
    // 设置语言
    setLanguage(lang) {
        if (!this.resources[lang]) {
            console.warn(`Language ${lang} not found, defaulting to zh`);
            lang = 'zh';
        }
        
        this.currentLang = lang;
        localStorage.setItem('argti_language', lang);
        
        // 更新html标签的lang属性
        document.documentElement.lang = lang;
        
        this.updatePage();
        this.updateLanguageButtons();
    },
    
    // 更新页面文本
    updatePage() {
        // 更新所有带有data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (text.includes('{max}') && el.id === 'question-hint') {
                // 处理多选题的最大选择数提示
                const max = el.getAttribute('data-max') || 3;
                el.textContent = text.replace('{max}', max);
            } else {
                el.textContent = text;
            }
        });
        
        // 触发自定义事件，让其他组件知道语言已更改
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: this.currentLang }
        }));
    },
    
    // 更新语言切换按钮状态
    updateLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    // 翻译函数
    t(key) {
        return this.resources[this.currentLang]?.[key] || key;
    },
    
    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }
};
