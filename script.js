// AriTI - Ariana Grande 人格测试
// 完整修复版本，解决所有语法错误

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== AriTI 测试网站初始化开始 ===');
    
    // 检查i18n对象是否已加载
    if (typeof i18n === 'undefined') {
        console.error('错误：i18n对象未定义！请检查i18n.js是否加载');
        window.i18n = {
            currentLang: 'zh',
            init: function() { 
                console.log('使用简单i18n初始化');
                this.updatePage(); 
            },
            setLanguage: function(lang) { 
                this.currentLang = lang; 
                console.log('语言切换为:', lang);
                this.updatePage();
            },
            updatePage: function() {
                console.log('更新页面文本');
            },
            getCurrentLanguage: function() { 
                return this.currentLang; 
            },
            t: function(key) { 
                return key; 
            }
        };
    }
    
    i18n.init();
    
    // DOM元素
    const screens = {
        welcome: document.getElementById('screen-welcome'),
        quiz: document.getElementById('screen-quiz'),
        loading: document.getElementById('screen-loading'),
        result: document.getElementById('screen-result')
    };
    
    const startBtn = document.getElementById('start-btn');
    const retryBtn = document.getElementById('retry-btn');
    const shareBtn = document.getElementById('share-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');
    
    const questionText = document.getElementById('question-text');
    const questionHint = document.getElementById('question-hint');
    const questionCounter = document.getElementById('question-counter');
    const currentQuestionNum = document.getElementById('current-question-num');
    const totalQuestions = document.getElementById('total-questions');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const optionsContainer = document.getElementById('options-container');
    
    const resultEra = document.getElementById('result-era');
    const resultDesc = document.getElementById('result-desc');
    const resultBadge = document.getElementById('result-badge');
    const resultInterpretation = document.getElementById('result-interpretation');
    const resultColorBar = document.getElementById('result-color-bar');
    const resultPlaylist = document.getElementById('result-playlist');
    
    // 全局变量
    let questions = [];
    let eras = {};
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let scores = {
        yours_truly: 0, 
        my_everything: 0, 
        dangerous_woman: 0,
        sweetener: 0, 
        thank_u_next: 0, 
        positions: 0, 
        eternal_sunshine: 0
    };
    
    let dimensionScores = {
      emotional_style: { 
        yours_truly: 0, 
        my_everything: 0, 
        dangerous_woman: 0, 
        sweetener: 0, 
        thank_u_next: 0, 
        positions: 0, 
        eternal_sunshine: 0 
      },
      social_pattern: { 
        yours_truly: 0, 
        my_everything: 0, 
        dangerous_woman: 0, 
        sweetener: 0, 
        thank_u_next: 0, 
        positions: 0, 
        eternal_sunshine: 0 
      },
      value_system: { 
        yours_truly: 0, 
        my_everything: 0, 
        dangerous_woman: 0, 
        sweetener: 0, 
        thank_u_next: 0, 
        positions: 0, 
        eternal_sunshine: 0 
      }
    };

    const questionTypeWeights = { 
        emotional: 1.5, 
        social: 1.2, 
        values: 1.8, 
        lyrics: 1.4, 
        growth: 1.6 
    };
    
    const eraWeights = { 
        yours_truly: 1.0, 
        my_everything: 1.1, 
        dangerous_woman: 1.3, 
        sweetener: 1.4, 
        thank_u_next: 1.5, 
        positions: 1.2, 
        eternal_sunshine: 1.6 
    };
    
    const dimensionWeights = { 
        emotional_style: 1.5, 
        social_pattern: 1.2, 
        value_system: 1.8 
    };
    
    const eraOrder = [
        'yours_truly', 
        'my_everything', 
        'dangerous_woman', 
        'sweetener', 
        'thank_u_next', 
        'positions', 
        'eternal_sunshine'
    ];
    
    const eraLabels = {
        yours_truly: 'Yours Truly', 
        my_everything: 'My Everything', 
        dangerous_woman: 'Dangerous Woman',
        sweetener: 'Sweetener', 
        thank_u_next: 'thank u, next', 
        positions: 'Positions', 
        eternal_sunshine: 'eternal sunshine'
    };
    
    const eraColors = {
        'yours_truly': '#a0dcf6', 
        'my_everything': '#7a7878', 
        'dangerous_woman': '#000000',
        'sweetener': '#e8b786', 
        'thank_u_next': '#bd7d98', 
        'positions': '#7db2a0', 
        'eternal_sunshine': '#993136'
    };
    
    // 洗牌算法
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // 初始化 - 加载数据
    async function init() {
        try {
            console.log('正在加载测试数据...');
            
            const possiblePaths = ['./data/data.json', 'data/data.json', '/data/data.json'];
            let data = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        console.log('数据加载成功，从路径:', path);
                        break;
                    } else {
                        console.log('路径无效:', path, '状态码:', response.status);
                    }
                } catch (e) { 
                    console.log('路径失败:', path, e.message);
                }
            }
            
            if (!data) {
                console.log('使用示例数据');
                createSampleData();
            } else {
                questions = data.questions;
                eras = data.eras;
                
                // 随机化题目顺序
                console.log('原始题目顺序:', questions.map(q => q.id));
                questions = shuffleArray(questions);
                console.log('随机化后的题目顺序:', questions.map(q => q.id));
                
                // ===== 新增：随机化每个题目的选项顺序 =====
                console.log('开始随机化题目选项顺序...');
                questions.forEach((question, questionIndex) => {
                    if (question.options && Array.isArray(question.options) && question.options.length > 1) {
                        console.log(`第${questionIndex + 1}题(ID:${question.id}) 选项随机化前:`, 
                            question.options.map((opt, idx) => `${idx}:${opt.target_era}`));
                        
                        // 保存原始选项顺序（用于调试）
                        const originalOptions = [...question.options];
                        
                        // 随机化选项顺序
                        question.options = shuffleArray(question.options);
                        
                        console.log(`第${questionIndex + 1}题(ID:${question.id}) 选项随机化后:`, 
                            question.options.map((opt, idx) => `${idx}:${opt.target_era}`));
                        
                        // 记录原始索引到新索引的映射
                        question.optionIndexMap = {};
                        question.options.forEach((option, newIndex) => {
                            const originalIndex = originalOptions.findIndex(origOpt => 
                                origOpt.target_era === option.target_era && 
                                JSON.stringify(origOpt.text) === JSON.stringify(option.text));
                            if (originalIndex !== -1) {
                                question.optionIndexMap[newIndex] = originalIndex;
                            }
                        });
                    }
                });
                console.log('题目选项随机化完成');
                // ===== 选项随机化结束 =====
                
                totalQuestions.textContent = questions.length;
                userAnswers = new Array(questions.length).fill(null);
                
                console.log('数据加载成功，共', questions.length, '道题目');
            }
        } catch (error) {
            console.error('加载数据失败:', error);
            createSampleData();
        }
    }
    
    // 创建示例数据
    function createSampleData() {
        console.log('创建示例数据...');
        
        questions = [
            {
                id: 1,
                text: { 
                    zh: "在社交场合中，你通常是活跃气氛的中心人物。",
                    en: "In social situations, you are usually the center of attention."
                },
                type: "single",
                target_era: "yours_truly"
            },
            {
                id: 2,
                text: { 
                    zh: "面对过去的感情，你会选择感激经历并继续前进。",
                    en: "When facing past relationships, you choose to be grateful for the experience and move on."
                },
                type: "single",
                target_era: "my_everything"
            }
        ];
        
        // 随机化题目顺序
        questions = shuffleArray(questions);
        
        // ===== 新增：随机化每个题目的选项顺序 =====
        console.log('示例数据：开始随机化题目选项顺序...');
        questions.forEach((question, questionIndex) => {
            if (question.options && Array.isArray(question.options) && question.options.length > 1) {
                console.log(`示例数据第${questionIndex + 1}题(ID:${question.id}) 选项随机化前:`, 
                    question.options.map((opt, idx) => `${idx}:${opt.target_era}`));
                
                // 保存原始选项顺序（用于调试）
                const originalOptions = [...question.options];
                
                // 随机化选项顺序
                question.options = shuffleArray(question.options);
                
                console.log(`示例数据第${questionIndex + 1}题(ID:${question.id}) 选项随机化后:`, 
                    question.options.map((opt, idx) => `${idx}:${opt.target_era}`));
                
                // 记录原始索引到新索引的映射
                question.optionIndexMap = {};
                question.options.forEach((option, newIndex) => {
                    const originalIndex = originalOptions.findIndex(origOpt => 
                        origOpt.target_era === option.target_era && 
                        JSON.stringify(origOpt.text) === JSON.stringify(option.text));
                    if (originalIndex !== -1) {
                        question.optionIndexMap[newIndex] = originalIndex;
                    }
                });
            }
        });
        console.log('示例数据题目选项随机化完成');
        // ===== 选项随机化结束 =====
        
        eras = {
            yours_truly: {
                name: { zh: "「Yours Truly」阳光甜心", en: "「Yours Truly」Sunshine Sweetheart" },
                badge: { zh: "YOURS TRULY", en: "YOURS TRULY" },
                desc: { zh: "你像出道专辑一样，充满纯真与初心的魅力。", en: "Like the debut album, you are full of innocence and original charm." },
                interpretation: { zh: "你就像Ariana的出道专辑《Yours Truly》一样，是一位充满纯真与初心的阳光甜心。", en: "You are like Ariana's debut album 'Yours Truly' - a sunshine sweetheart full of innocence and original charm." },
                color: "#a0dcf6",
                songs: [
                    { title: "The Way", album: "Yours Truly" },
                    { title: "Right There", album: "Yours Truly" }
                ]
            }
        };
        
        console.log('示例数据创建完成，共', questions.length, '道题目');
        totalQuestions.textContent = questions.length;
        userAnswers = new Array(questions.length).fill(null);
    }
    
    // 切换到特定屏幕
    function showScreen(screenName) {
        console.log('切换到屏幕:', screenName);
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
        
        if (screenName === 'result') {
            window.scrollTo(0, 0);
        }
    }
    
    // 开始测试
    function startTest() {
        console.log('开始测试');
        
        currentQuestionIndex = 0;
        userAnswers.fill(null);
        
        for (const era in scores) {
            scores[era] = 0;
        }
        
        showScreen('quiz');
        renderQuestion();
    }
    
    // 渲染当前问题
    function renderQuestion() {
        console.log('渲染问题，索引:', currentQuestionIndex);
        
        if (currentQuestionIndex >= questions.length) {
            console.log('所有问题已回答，完成测试');
            finishTest();
            return;
        }
        
        const question = questions[currentQuestionIndex];
        const currentLang = i18n.getCurrentLanguage();
        
        const questionData = typeof question.text === 'object' 
            ? question.text[currentLang] || question.text.zh
            : question.text;
        
        questionText.textContent = questionData;
        
        const counterText = i18n.t('question') + ' ' + (currentQuestionIndex + 1);
        questionCounter.textContent = counterText;
        currentQuestionNum.textContent = currentQuestionIndex + 1;
        
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressPercent.textContent = `${Math.round(progress)}%`;
        
        optionsContainer.innerHTML = '';
        questionHint.innerHTML = '';
        
        if (question.type === 'single') {
            renderSingleChoiceOptions(question, currentLang);
        } else if (question.type === 'multiple') {
            renderMultipleChoiceOptions(question, currentLang);
        }
        
        updateNavigationButtons();
    }
    
    // 渲染单选题选项
    function renderSingleChoiceOptions(question, currentLang) {
        // 设置提示文本
        questionHint.textContent = i18n.t('single_choice_hint');
        
        // 获取当前答案
        const currentAnswer = userAnswers[currentQuestionIndex];
        const selectedOptionIndex = currentAnswer ? currentAnswer.optionIndex : null;
        
        console.log('渲染单选题，当前答案索引:', selectedOptionIndex, '完整答案:', currentAnswer);
        
        // 确保question.options存在
        if (!question.options || !Array.isArray(question.options)) {
            console.error('单选题缺少options数组:', question);
            return;
        }
        
        // 渲染每个选项
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            
            // 检查是否已选择此选项
            if (selectedOptionIndex === index) {
                optionBtn.classList.add('selected');
            }
            
            // 获取选项文本
            const optionText = typeof option.text === 'object' 
                ? option.text[currentLang] || option.text.zh
                : option.text;
            
            optionBtn.innerHTML = `
                <span class="option-text">${optionText}</span>
                <i class="fas fa-check option-check"></i>
            `;
            
            optionBtn.addEventListener('click', () => {
                console.log('单选题选择，索引:', index, '目标人格:', option.target_era, '权重:', option.weight);
                
                // 保存答案 - 确保数据结构正确
                // 注意：这里保存的是随机化后的索引
                userAnswers[currentQuestionIndex] = {
                    type: 'single',
                    optionIndex: index,  // 这个属性很重要
                    targetEra: option.target_era,
                    weight: option.weight
                };
                
                console.log('单选题答案已保存:', userAnswers[currentQuestionIndex]);
                
                // 重新渲染以更新选中状态
                renderQuestion();
            });
            
            optionsContainer.appendChild(optionBtn);
        });
    }
    
    // 渲染多选题选项
    function renderMultipleChoiceOptions(question, currentLang) {
        // 设置提示文本
        const maxSelections = question.max_selections || 3;
        questionHint.setAttribute('data-max', maxSelections);
        questionHint.textContent = i18n.t('multiple_choice_hint').replace('{max}', maxSelections);
        
        // 获取当前答案
        const currentAnswer = userAnswers[currentQuestionIndex];
        const selectedIndices = currentAnswer ? currentAnswer.selectedIndices : [];
        
        // 渲染每个选项
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multiple-option';
            
            // 检查是否已选中
            if (selectedIndices.includes(index)) {
                optionDiv.classList.add('selected');
            }
            
            // 获取选项文本
            const optionText = typeof option.text === 'object' 
                ? option.text[currentLang] || option.text.zh
                : option.text;
            
            optionDiv.innerHTML = `
                <input type="checkbox" id="option-${index}" 
                       data-index="${index}" 
                       data-target="${option.target_era}"
                       data-weight="${option.weight || 1}"
                       ${selectedIndices.includes(index) ? 'checked' : ''}>
                <label for="option-${index}">${optionText}</label>
            `;
            
            // 添加点击事件
            const checkbox = optionDiv.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                handleMultipleChoiceSelection(question, index, checkbox.checked);
            });
            
            // 整个div可点击
            optionDiv.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    handleMultipleChoiceSelection(question, index, checkbox.checked);
                }
            });
            
            optionsContainer.appendChild(optionDiv);
        });
    }
    
    // 处理多选题选择
    function handleMultipleChoiceSelection(question, index, isChecked) {
        console.log('多选题选择，索引:', index, '选中:', isChecked);
        
        let currentAnswer = userAnswers[currentQuestionIndex];
        if (!currentAnswer) {
            currentAnswer = {
                type: 'multiple',
                selectedIndices: []
            };
        }
        
        const maxSelections = question.max_selections || 3;
        
        if (isChecked) {
            if (currentAnswer.selectedIndices.length >= maxSelections) {
                currentAnswer.selectedIndices.shift();
            }
            currentAnswer.selectedIndices.push(index);
        } else {
            const idx = currentAnswer.selectedIndices.indexOf(index);
            if (idx > -1) {
                currentAnswer.selectedIndices.splice(idx, 1);
            }
        }
        
        userAnswers[currentQuestionIndex] = currentAnswer;
        renderQuestion();
    }
    
    // 更新导航按钮状态
    function updateNavigationButtons() {
        const currentAnswer = userAnswers[currentQuestionIndex];
        const question = questions[currentQuestionIndex];
        
        console.log('更新导航按钮，当前答案:', currentAnswer, '问题类型:', question?.type);
        
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (!question) {
            console.error('当前问题不存在');
            nextBtn.disabled = true;
            return;
        }
        
        if (question.type === 'single') {
            // 检查单选题是否有optionIndex
            if (currentAnswer === null || currentAnswer === undefined) {
                nextBtn.disabled = true;
                console.log('单选题未选择答案');
            } else if (currentAnswer.type === 'single') {
                if (currentAnswer.optionIndex === undefined || currentAnswer.optionIndex === null) {
                    nextBtn.disabled = true;
                    console.log('单选题答案不完整 - optionIndex缺失');
                } else {
                    nextBtn.disabled = false;
                    console.log('单选题已选择答案，索引:', currentAnswer.optionIndex);
                }
            } else {
                nextBtn.disabled = true;
                console.log('单选题答案格式错误');
            }
        } else if (question.type === 'multiple') {
            nextBtn.disabled = false;
            console.log('多选题，下一题可用');
        } else {
            nextBtn.disabled = false;
        }
        
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.innerHTML = i18n.getCurrentLanguage() === 'zh' 
                ? '查看结果 <i class="fas fa-flag-checkered"></i>' 
                : 'View Result <i class="fas fa-flag-checkered"></i>';
        } else {
            nextBtn.innerHTML = i18n.getCurrentLanguage() === 'zh' 
                ? '下一题 <i class="fas fa-arrow-right"></i>' 
                : 'Next <i class="fas fa-arrow-right"></i>';
        }
    }
    
    // 处理上一题按钮
    prevBtn.addEventListener('click', () => {
        console.log('上一题');
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });
    
    // 处理下一题按钮
    nextBtn.addEventListener('click', () => {
        console.log('下一题按钮点击，当前索引:', currentQuestionIndex);
        const question = questions[currentQuestionIndex];
        
        if (!question) {
            console.error('当前问题不存在');
            return;
        }
        
        if (question.type === 'single') {
            const currentAnswer = userAnswers[currentQuestionIndex];
            console.log('单选题检查，当前答案:', currentAnswer);
            
            if (currentAnswer === null || currentAnswer === undefined) {
                console.log('提示：请先选择答案');
                alert(i18n.getCurrentLanguage() === 'zh' 
                    ? '请先选择答案'
                    : 'Please select an answer first'
                );
                return;
            }
            
            if (currentAnswer.type === 'single' && 
                (currentAnswer.optionIndex === undefined || currentAnswer.optionIndex === null)) {
                console.log('提示：答案不完整');
                alert(i18n.getCurrentLanguage() === 'zh' 
                    ? '请先选择答案'
                    : 'Please select an answer first'
                );
                return;
            }
        }
        
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            finishTest();
        }
    });
    
    // 完成测试
    function finishTest() {
        console.log('完成测试');
        console.log('用户答案:', userAnswers);
        
        showScreen('loading');
        
        calculateAllScores();
        console.log('计算后的分数:', scores);
        
        setTimeout(() => {
            calculateResult();
        }, 2000);
    }
    
    // 计算所有题目的分数
    function calculateAllScores() {
        console.log('开始计算分数...');
        
        // 重置所有分数
        scores = { 
            yours_truly: 0, 
            my_everything: 0, 
            dangerous_woman: 0, 
            sweetener: 0, 
            thank_u_next: 0, 
            positions: 0, 
            eternal_sunshine: 0 
        };
        
        // 重置维度分数
        for (let dimension in dimensionScores) {
            for (let era in dimensionScores[dimension]) {
                dimensionScores[dimension][era] = 0;
            }
        }
        
        // 遍历所有答案
        userAnswers.forEach((answer, index) => {
            if (!answer) {
                console.log(`第${index + 1}题未回答，跳过`);
                return;
            }
            
            const question = questions[index];
            if (!question) {
                console.log(`第${index + 1}题数据缺失`);
                return;
            }
            
            const questionType = question.category;
            const typeWeight = questionTypeWeights[questionType] || 1.0;
            
            console.log(`第${index + 1}题: 类型=${questionType}, 权重=${typeWeight}, 答案类型=${answer.type}`);
            
            if (question.type === 'single' && answer.type === 'single') {
                const optionIndex = answer.optionIndex;
                const option = question.options[optionIndex];
                
                if (option) {
                    console.log(`  选项: ${option.target_era}, 权重=${option.weight}, 维度=${option.dimension}`);
                    
                    // 基础分
                    scores[option.target_era] += option.weight * typeWeight;
                    
                    // 维度分
                    if (option.dimension && dimensionScores[option.dimension]) {
                        dimensionScores[option.dimension][option.target_era] += option.weight;
                    }
                }
            } else if (question.type === 'multiple' && answer.type === 'multiple') {
                console.log(`  多选题，选中${answer.selectedIndices.length}个选项`);
                // 多选题计分
                answer.selectedIndices.forEach(optionIndex => {
                    const option = question.options[optionIndex];
                    if (option) {
                        console.log(`    选项${optionIndex}: ${option.target_era}, 权重=${option.weight}, 维度=${option.dimension}`);
                        
                        // 多选题的权重需要乘以typeWeight
                        scores[option.target_era] += option.weight * typeWeight;
                        
                        if (option.dimension && dimensionScores[option.dimension]) {
                            dimensionScores[option.dimension][option.target_era] += option.weight;
                        }
                    }
                });
            } else {
                console.log(`  第${index + 1}题答案格式不匹配`);
            }
        });
        
        console.log('基础分数:', scores);
        console.log('维度分数:', dimensionScores);
    }
    
    // 计算最终结果
    function calculateResult() {
        console.log('开始计算最终结果...');
        
        let weightedScores = {};
        let totalWeightedScore = 0;
        
        for (const era in scores) {
            const eraWeight = eraWeights[era] || 1.0;
            weightedScores[era] = scores[era] * eraWeight;
            totalWeightedScore += weightedScores[era];
        }
        
        console.log('加权分数:', weightedScores);
        
        let dimensionWeightedScores = {
            emotional_style: {},
            social_pattern: {},
            value_system: {}
        };
        
        for (const dimension in dimensionScores) {
            for (const era in dimensionScores[dimension]) {
                const dimensionWeight = dimensionWeights[dimension] || 1.0;
                dimensionWeightedScores[dimension][era] = dimensionScores[dimension][era] * dimensionWeight;
            }
        }
        
        console.log('维度加权分数:', dimensionWeightedScores);
        
        let finalScores = {};
        let scoreDetails = [];
        
        for (const era in weightedScores) {
            const emotionalScore = dimensionWeightedScores.emotional_style[era] || 0;
            const socialScore = dimensionWeightedScores.social_pattern[era] || 0;
            const valueScore = dimensionWeightedScores.value_system[era] || 0;
            
            const avgDimensionScore = (emotionalScore + socialScore + valueScore) / 3;
            
            finalScores[era] = weightedScores[era] + avgDimensionScore;
            
            scoreDetails.push({
                era: era,
                score: finalScores[era],
                baseScore: scores[era],
                weightedScore: weightedScores[era],
                dimensionAvg: avgDimensionScore
            });
        }
        
        console.log('最终分数:', finalScores);
        
        let maxScore = 0;
        let dominantEra = 'yours_truly';
        let allEraScores = [];
        
        for (const [era, score] of Object.entries(finalScores)) {
            allEraScores.push({ era, score });
            if (score > maxScore) {
                maxScore = score;
                dominantEra = era;
            }
        }
        
        console.log('最高分人格:', dominantEra, '分数:', maxScore);
        
        const sameScoreEras = allEraScores.filter(item => item.score === maxScore);
        
        if (sameScoreEras.length > 1) {
            console.log('出现同分情况，有', sameScoreEras.length, '个人格同分');
            
            for (const era of eraOrder) {
                if (sameScoreEras.find(e => e.era === era)) {
                    dominantEra = era;
                    break;
                }
            }
            console.log('最终选择的人格:', dominantEra);
        }
        
        const resultData = eras[dominantEra];
        const currentLang = i18n.getCurrentLanguage();
        
        if (resultData) {
            showResult(resultData, allEraScores, currentLang);
        } else {
            console.error('未找到人格数据:', dominantEra);
            showResult(eras.yours_truly, allEraScores, currentLang);
        }
    }
    
    // 显示单一结果
    function showResult(resultData, scoreDetails, currentLang) {
        console.log('显示单一结果:', resultData);
        
        const name = typeof resultData.name === 'object' 
            ? resultData.name[currentLang] || resultData.name.zh
            : resultData.name;
            
        const desc = typeof resultData.desc === 'object' 
            ? resultData.desc[currentLang] || resultData.desc.zh
            : resultData.desc;
            
        const interpretation = typeof resultData.interpretation === 'object' 
            ? resultData.interpretation[currentLang] || resultData.interpretation.zh
            : resultData.interpretation;
            
        const badge = typeof resultData.badge === 'object' 
            ? resultData.badge[currentLang] || resultData.badge.zh
            : resultData.badge;
        
        resultBadge.textContent = badge;
        resultEra.textContent = name;
        resultDesc.textContent = desc;
        
        const formattedInterpretation = interpretation
            .replace(/## (.*?)\n/g, '<h3 class="interpretation-heading">$1</h3>')
            .replace(/### (.*?)\n/g, '<h4 class="interpretation-subheading">$1</h4>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        resultInterpretation.innerHTML = `<p>${formattedInterpretation}</p>`;
        
        resultColorBar.style.background = resultData.color;
        
        renderPlaylist(resultData.songs, currentLang);
        renderRadarChart(scoreDetails, resultData.color);
        
        showScreen('result');
    }
    
    // 渲染歌单
    function renderPlaylist(songs, currentLang) {
        console.log('渲染歌单:', songs);
        
        if (!songs || !Array.isArray(songs)) {
            resultPlaylist.innerHTML = '<div class="playlist-item">' + 
                (currentLang === 'zh' ? '暂无歌曲推荐' : 'No songs recommended') + 
                '</div>';
            return;
        }
        
        resultPlaylist.innerHTML = '';
        
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'playlist-item';
            
            const songTitle = song.title;
            
            const songReason = typeof song.reason === 'object' 
                ? song.reason[currentLang] || song.reason.zh
                : (song.reason || '');
            
            songItem.innerHTML = `
                <div class="playlist-number">${index + 1}</div>
                <div class="playlist-info">
                    <div class="playlist-song">${songTitle}</div>
                    <div class="playlist-reason">${songReason}</div>
                </div>
            `;
            resultPlaylist.appendChild(songItem);
        });
    }
    
    // 渲染雷达图
    function renderRadarChart(scoreDetails, mainColor) {
        console.log('渲染雷达图，分数详情:', scoreDetails);
        
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        const labels = eraOrder.map(era => eraLabels[era]);
        const dataValues = eraOrder.map(era => {
            const detail = scoreDetails.find(d => d.era === era);
            return detail ? Math.round(detail.score * 10) / 10 : 0;
        });
        
        console.log('雷达图数据:', dataValues);
        
        const maxScore = Math.max(...dataValues, 1);
        const normalizedValues = dataValues.map(score => (score / maxScore) * 100);
        
        console.log('归一化数据:', normalizedValues);
        
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }
        
        window.myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: i18n.getCurrentLanguage() === 'zh' ? '人格维度得分' : 'Personality Dimensions Score',
                    data: normalizedValues,
                    backgroundColor: 'rgba(200, 200, 200, 0.7)',
                    borderColor: 'rgba(0, 0, 0, 0.6)',
                    borderWidth: 2,
                    pointBackgroundColor: eraOrder.map(era => eraColors[era]),
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        ticks: {
                            display: false,
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.3)',
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.3)',
                        },
                        pointLabels: {
                            color: '#333',
                            font: {
                                size: 13,
                                family: "'Poppins', sans-serif"
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const era = eraOrder[context.dataIndex];
                                const score = dataValues[context.dataIndex];
                                return `${context.label}: ${score.toFixed(1)} ${i18n.getCurrentLanguage() === 'zh' ? '分' : 'points'} (${Math.round(context.parsed.r)}%)`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // 分享结果
    shareBtn.addEventListener('click', function() {
        const resultText = i18n.getCurrentLanguage() === 'zh'
            ? `我的Ariana Grande人格测试结果是：${resultEra.textContent}\n\n${resultDesc.textContent}\n\n来测测你是什么人格吧！`
            : `My Ariana Grande personality test result: ${resultEra.textContent}\n\n${resultDesc.textContent}\n\nTake the test to discover your personality!`;
        
        if (navigator.share) {
            navigator.share({
                title: i18n.getCurrentLanguage() === 'zh' 
                    ? '我的Ariana Grande人格测试结果'
                    : 'My Ariana Grande Personality Test Result',
                text: resultText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(resultText + '\n\n' + 
                (i18n.getCurrentLanguage() === 'zh' ? '测试链接：' : 'Test link: ') + window.location.href)
                .then(() => {
                    alert(i18n.getCurrentLanguage() === 'zh'
                        ? '结果已复制到剪贴板！快去分享给朋友吧～'
                        : 'Result copied to clipboard! Share with your friends!'
                    );
                })
                .catch(err => {
                    console.error('复制失败: ', err);
                    alert(i18n.getCurrentLanguage() === 'zh'
                        ? '请手动复制结果文本进行分享。'
                        : 'Please copy the result text manually to share.'
                    );
                });
        }
    });
    
    // 语言切换事件
    langZhBtn.addEventListener('click', () => {
        i18n.setLanguage('zh');
        if (screens.quiz.classList.contains('active') && questions.length > 0) {
            renderQuestion();
        }
    });
    
    langEnBtn.addEventListener('click', () => {
        i18n.setLanguage('en');
        if (screens.quiz.classList.contains('active') && questions.length > 0) {
            renderQuestion();
        }
    });
    
    // 重新测试
    retryBtn.addEventListener('click', () => {
        console.log('重新测试');
        location.reload();
    });
    
    // 开始测试按钮
    startBtn.addEventListener('click', startTest);
    
    // 初始化应用
    console.log('开始初始化应用...');
    init();
    
    console.log('=== AriTI 测试网站初始化完成 ===');
});

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.message, '在', e.filename, '第', e.lineno, '行');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise错误:', e.reason);
});