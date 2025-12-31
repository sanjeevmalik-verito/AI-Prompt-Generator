// ========================================
// Imports
// ========================================
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// ========================================
// Data: Prompting Techniques
// ========================================

const techniques = {
    'zero-shot': {
        name: 'Zero-Shot Prompting',
        icon: '🎯',
        description: 'Give the AI a direct instruction without providing any examples. The model uses its pre-trained knowledge to complete the task.',
        whenToUse: 'Best for simple, clear tasks where the expected output format is well-understood. Great for translations, summaries, and straightforward questions.',
        example: `Write a professional email declining a meeting invitation due to a scheduling conflict.

The email should be:
- Polite and apologetic
- Suggest alternative times
- Keep it under 100 words`,
        tips: [
            'Be specific about what you want',
            'Specify the format you expect',
            'Include constraints (length, style, etc.)'
        ]
    },
    'few-shot': {
        name: 'Few-Shot Prompting',
        icon: '📚',
        description: 'Provide examples of input-output pairs before asking the AI to perform the task. This helps the model understand the pattern you want.',
        whenToUse: 'Ideal for complex or nuanced tasks where showing examples helps clarify exactly what you want. Great for classification, formatting, and style-specific outputs.',
        example: `Convert informal text to professional language.

Example 1:
Input: "gonna hit up the meeting tmrw"
Output: "I will attend the meeting tomorrow."

Example 2:
Input: "can u send me that asap pls"
Output: "Could you please send me that at your earliest convenience?"

Now convert:
Input: "hey wanna grab lunch n talk bout the project?"`,
        tips: [
            'Use 2-5 diverse examples',
            'Keep examples consistent in format',
            'Choose examples that cover edge cases'
        ]
    },
    'chain-of-thought': {
        name: 'Chain-of-Thought',
        icon: '🔗',
        description: 'Ask the AI to break down its reasoning step-by-step before arriving at a conclusion. This improves accuracy for complex problems.',
        whenToUse: 'Perfect for math problems, logical reasoning, multi-step analysis, and any task requiring careful thinking. Reduces errors in complex reasoning.',
        example: `Solve this problem step by step:

A store has a "buy 2, get 1 free" promotion. If each item costs $15 and Sarah wants to buy 7 items, how much will she pay?

Let's think through this step by step:
1. First, identify how the promotion works
2. Calculate how many free items Sarah gets
3. Calculate how many items she pays for
4. Compute the total cost`,
        tips: [
            'Use phrases like "Let\'s think step by step"',
            'Break complex problems into smaller parts',
            'Ask the AI to show its work'
        ]
    },
    'role-based': {
        name: 'Role-Based Prompting',
        icon: '🎭',
        description: 'Assign a specific persona, role, or expertise to the AI. This frames its responses with specialized knowledge and appropriate tone.',
        whenToUse: 'Excellent for creative writing, specialized advice, educational content, and when you need responses from a particular perspective or expertise level.',
        example: `You are an experienced senior software architect with 20 years of experience in distributed systems.

A junior developer asks: "Should we use microservices or a monolithic architecture for our new e-commerce platform?"

Provide a balanced, mentoring response that:
- Considers their experience level
- Explains trade-offs clearly
- Gives actionable recommendations`,
        tips: [
            'Be specific about the role\'s experience',
            'Include relevant expertise areas',
            'Specify the tone (mentor, expert, friend, etc.)'
        ]
    },
    'template-based': {
        name: 'Template-Based Prompting',
        icon: '📋',
        description: 'Provide a structured template or format that the AI should follow. Ensures consistent, predictable output format.',
        whenToUse: 'Great for generating structured data, reports, documentation, and any task where consistent formatting is essential.',
        example: `Generate a product description using this template:

**Product Name:** [Name]
**Category:** [Category]
**Price Range:** [$$/$$$]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Description:**
[2-3 sentence compelling description]

**Best For:**
[Target audience]

---
Create a description for: Wireless noise-canceling headphones for remote workers`,
        tips: [
            'Use clear placeholder markers',
            'Include examples in your template',
            'Specify formatting (markdown, JSON, etc.)'
        ]
    }
};

// ========================================
// Data: Category to Technique Recommendations
// ========================================

const categoryRecommendations = {
    'writing': {
        primary: 'role-based',
        reason: 'Assigning a writer persona helps create content with consistent voice and style.',
        alternatives: ['zero-shot', 'template-based']
    },
    'coding': {
        primary: 'chain-of-thought',
        reason: 'Step-by-step reasoning helps catch bugs and explain complex logic.',
        alternatives: ['role-based', 'few-shot']
    },
    'analysis': {
        primary: 'chain-of-thought',
        reason: 'Breaking down analysis into steps ensures thorough and accurate insights.',
        alternatives: ['template-based', 'zero-shot']
    },
    'creative': {
        primary: 'role-based',
        reason: 'Creative personas unlock unique perspectives and imaginative responses.',
        alternatives: ['few-shot', 'zero-shot']
    },
    'learning': {
        primary: 'role-based',
        reason: 'An expert teacher persona provides clear, educational explanations.',
        alternatives: ['chain-of-thought', 'few-shot']
    },
    'business': {
        primary: 'template-based',
        reason: 'Structured templates ensure professional, consistent business documents.',
        alternatives: ['role-based', 'zero-shot']
    },
    'communication': {
        primary: 'zero-shot',
        reason: 'Direct instructions work best for clear, concise messages and responses.',
        alternatives: ['template-based', 'role-based']
    },
    'research': {
        primary: 'chain-of-thought',
        reason: 'Step-by-step research ensures comprehensive coverage and accurate findings.',
        alternatives: ['template-based', 'zero-shot']
    },
    'marketing': {
        primary: 'few-shot',
        reason: 'Examples help maintain brand voice and style consistency across campaigns.',
        alternatives: ['role-based', 'template-based']
    },
    'legal': {
        primary: 'template-based',
        reason: 'Legal documents require consistent structure and precise formatting.',
        alternatives: ['few-shot', 'zero-shot']
    },
    'support': {
        primary: 'template-based',
        reason: 'Help documentation benefits from consistent, structured formats.',
        alternatives: ['few-shot', 'zero-shot']
    },
    'translation': {
        primary: 'few-shot',
        reason: 'Examples ensure consistent terminology and style in translations.',
        alternatives: ['zero-shot', 'role-based']
    }
};

// ========================================
// State Management
// ========================================

let state = {
    currentSection: 'home',
    currentStep: 1,
    selectedCategory: null,
    selectedTechnique: null,
    formData: {
        taskDescription: '',
        tone: 'professional',
        outputFormat: 'paragraph',
        inputExample: '',
        outputExample: '',
        role: '',
        constraints: ''
    }
};

// ========================================
// Navigation Functions
// ========================================

function showSection(sectionId) {
    // Update state
    state.currentSection = sectionId;

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });

    // Reset wizard if going to generate
    if (sectionId === 'generate' && state.currentStep !== 1) {
        // Keep the current step
    }
}

// ========================================
// Technique Detail Functions
// ========================================

function showTechniqueDetail(techniqueId) {
    const technique = techniques[techniqueId];
    if (!technique) return;

    document.getElementById('detail-title').textContent = technique.name;
    document.getElementById('detail-description').textContent = technique.description;
    document.getElementById('detail-when').textContent = technique.whenToUse;
    document.getElementById('detail-example').textContent = technique.example;

    state.selectedTechnique = techniqueId;

    document.getElementById('technique-detail').classList.add('active');
}

function closeTechniqueDetail() {
    document.getElementById('technique-detail').classList.remove('active');
}

function useThisTechnique() {
    closeTechniqueDetail();
    showSection('generate');

    // Go to step 2 and set technique
    state.currentStep = 2;
    updateWizardStep();
    updateTechniqueRecommendation();
    selectTechnique(state.selectedTechnique);
}

// ========================================
// Wizard Functions
// ========================================

function updateWizardStep() {
    // Update step indicator
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum === state.currentStep) {
            step.classList.add('active');
        } else if (stepNum < state.currentStep) {
            step.classList.add('completed');
        }
    });

    // Show correct wizard step
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${state.currentStep}`).classList.add('active');

    // Update form visibility based on technique
    updateFormVisibility();
}

function updateFormVisibility() {
    const technique = state.selectedTechnique;

    // Show/hide example fields for few-shot
    const inputExampleGroup = document.getElementById('input-example-group');
    const outputExampleGroup = document.getElementById('output-example-group');
    const roleGroup = document.getElementById('role-group');

    if (technique === 'few-shot') {
        inputExampleGroup.style.display = 'block';
        outputExampleGroup.style.display = 'block';
    } else {
        inputExampleGroup.style.display = 'none';
        outputExampleGroup.style.display = 'none';
    }

    // Show role field for role-based
    if (technique === 'role-based') {
        roleGroup.style.display = 'block';
    } else {
        roleGroup.style.display = 'none';
    }
}

function selectCategory(category) {
    state.selectedCategory = category;

    // Update UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.category === category) {
            card.classList.add('selected');
        }
    });

    // Auto-advance after a short delay
    setTimeout(() => {
        nextStep();
    }, 300);
}

function selectTechnique(techniqueId) {
    state.selectedTechnique = techniqueId;

    // Update alt buttons
    document.querySelectorAll('.alt-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.technique === techniqueId) {
            btn.classList.add('selected');
        }
    });

    // Update recommendation display
    const technique = techniques[techniqueId];
    document.getElementById('rec-icon').textContent = technique.icon;
    document.getElementById('rec-name').textContent = technique.name;
    document.getElementById('rec-description').textContent = technique.description;
}

function updateTechniqueRecommendation() {
    const category = state.selectedCategory;
    const rec = categoryRecommendations[category];

    if (rec) {
        const technique = techniques[rec.primary];
        state.selectedTechnique = rec.primary;

        document.getElementById('rec-icon').textContent = technique.icon;
        document.getElementById('rec-name').textContent = technique.name;
        document.getElementById('rec-reason').textContent = rec.reason;
        document.getElementById('rec-description').textContent = technique.description;

        // Update alt buttons
        document.querySelectorAll('.alt-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.technique === rec.primary) {
                btn.classList.add('selected');
            }
        });
    }
}

function nextStep() {
    if (state.currentStep === 1 && !state.selectedCategory) {
        return; // Need to select category first
    }

    if (state.currentStep === 1) {
        updateTechniqueRecommendation();
    }

    if (state.currentStep < 4) {
        state.currentStep++;
        updateWizardStep();
    }
}

function prevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateWizardStep();
    }
}

function resetWizard() {
    state.currentStep = 1;
    state.selectedCategory = null;
    state.selectedTechnique = null;
    state.formData = {
        taskDescription: '',
        tone: 'professional',
        outputFormat: 'paragraph',
        inputExample: '',
        outputExample: '',
        role: '',
        constraints: ''
    };

    // Reset form
    document.getElementById('prompt-form').reset();

    // Reset category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });

    updateWizardStep();
}

// ========================================
// Prompt Generation
// ========================================

// ========================================
// Prompt Generation & AI Logic
// ========================================

function collectFormData() {
    state.formData = {
        taskDescription: document.getElementById('task-description').value,
        tone: document.getElementById('tone').value,
        outputFormat: document.getElementById('output-format').value,
        inputExample: document.getElementById('input-example').value,
        outputExample: document.getElementById('output-example').value,
        role: document.getElementById('role').value,
        constraints: document.getElementById('constraints').value
    };
}

async function generatePrompt() {
    collectFormData();

    const technique = state.selectedTechnique;
    const data = state.formData;
    const category = state.selectedCategory;

    // 0. Validation
    if (!data.taskDescription || data.taskDescription.trim().length < 5) {
        alert("Please provide a clearer task description (at least 5 characters) to generate a valid prompt.");
        document.getElementById('task-description').focus();
        document.getElementById('task-description').classList.add('error');
        setTimeout(() => document.getElementById('task-description').classList.remove('error'), 2000);
        return;
    }

    // 1. Generate Base Prompt (Stitched)
    let rawPrompt = '';
    switch (technique) {
        case 'zero-shot': rawPrompt = generateZeroShotPrompt(data, category); break;
        case 'few-shot': rawPrompt = generateFewShotPrompt(data, category); break;
        case 'chain-of-thought': rawPrompt = generateChainOfThoughtPrompt(data, category); break;
        case 'role-based': rawPrompt = generateRoleBasedPrompt(data, category); break;
        case 'template-based': rawPrompt = generateTemplateBasedPrompt(data, category); break;
        default: rawPrompt = generateZeroShotPrompt(data, category);
    }

    // 2. AI Optimization Step
    try {
        // Show AI Modal for progress
        const modal = document.getElementById('ai-modal');
        modal.classList.add('active');
        document.getElementById('ai-status').style.display = 'flex';
        document.getElementById('ai-result').style.display = 'none'; // Hide result comparison key

        // Initialize Engine
        const engine = await initAIEngine();

        // Update Status
        updateAIStatus("Refining your prompt with AI...", 90);

        // System Prompt - Strict Structural Enforcement
        const systemPrompt = `You are a Meta-Prompting Engine. You do not talk. You do not explain. You ONLY output a prompt.
        
        OBJECTIVE:
        Convert the user's request into a high-quality, structured prompt for an AI Chatbot (like ChatGPT).
        
        STRICT OUTPUT FORMAT (Adhere to this exactly):
        
        ### Role
        [Define the persona, e.g. "Act as a Senior Copywriter"]
        
        ### Task
        [Clear instruction of what the AI needs to do]
        
        ### Context & Constraints
        [Background info, style requirements, length limits]
        
        ### Input Data
        [Placeholders for user input if needed, e.g. {{Topic}}]
        
        RULES:
        1. Start directly with "### Role". Do not say "Here is the prompt".
        2. Write the prompt in the IMPERATIVE mood ("Write this", "Analyze that").
        3. Do NOT use first person ("I will do this"). Use second person ("You are").
        4. If the user asks for copyright content (e.g. Dune), write a prompt for a *similar* style/genre.`;

        // Generate
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate a detailed prompt for this request: "${rawPrompt}"` }
        ];

        const chunks = await engine.chat.completions.create({
            messages,
            stream: true,
        });

        let optimizedPrompt = "";

        // We will just accumulate the result here
        for await (const chunk of chunks) {
            optimizedPrompt += chunk.choices[0]?.delta?.content || "";
        }

        // 3. Success - Show Optimized Result in Step 4
        displayResult(optimizedPrompt, technique, true);

    } catch (error) {
        console.error("AI Generation Failed:", error);
        // Fallback to raw prompt
        alert("AI Model Error: " + error.message + "\n\nSwitching to standard generator.");
        displayResult(rawPrompt, technique, false);
    } finally {
        // Close Modal
        document.getElementById('ai-modal').classList.remove('active');
    }
}

function displayResult(promptText, techniqueId, isAiOptimized) {
    // Update Result Text
    document.getElementById('result-prompt').textContent = promptText;

    // Update Original Input Display
    const originalInput = state.formData.taskDescription || "No input provided";
    document.getElementById('original-input-text').textContent = originalInput;

    // Update Label
    const label = techniques[techniqueId].name + (isAiOptimized ? ' (AI Optimized ✨)' : '');
    document.getElementById('result-technique').textContent = label;

    // Update tips
    const tipsList = document.getElementById('result-tips-list');
    tipsList.innerHTML = techniques[techniqueId].tips
        .map(tip => `<li>${tip}</li>`)
        .join('');

    // Go to result step
    state.currentStep = 4;
    updateWizardStep();
}


// --- AI Engine Logic ---

let aiEngine = null;
let isAiInitializing = false;
const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

async function initAIEngine() {
    if (aiEngine) return aiEngine;

    isAiInitializing = true;
    updateAIStatus("Downloading AI model (first time only)...", 10);

    try {
        const initProgressCallback = (report) => {
            console.log(report.text);
            const progress = report.progress || 0;
            const percent = 10 + (progress * 90);
            updateAIStatus(report.text, percent);
        };

        // Reverting to default config for stability with 8B model
        console.log("Initializing AI Engine (Standard Config)...");

        aiEngine = await CreateMLCEngine(
            MODEL_ID,
            { initProgressCallback: initProgressCallback }
        );

        isAiInitializing = false;
        return aiEngine;
    } catch (error) {
        console.error("AI Init Error:", error);
        isAiInitializing = false;
        throw error;
    }
}

function updateAIStatus(text, percent) {
    const statusText = document.getElementById('ai-status-text');
    const progressBar = document.getElementById('ai-progress');

    if (statusText) statusText.textContent = text;
    if (progressBar) progressBar.style.width = `${percent}%`;
}

function closeAIModal() {
    document.getElementById('ai-modal').classList.remove('active');
}


function generateZeroShotPrompt(data, category) {
    let prompt = '';

    if (data.taskDescription) {
        prompt += data.taskDescription;
    } else {
        prompt += `[Describe your ${category} task here]`;
    }

    prompt += '\n\n';
    prompt += `Requirements:\n`;
    prompt += `- Tone: ${capitalizeFirst(data.tone)}\n`;
    prompt += `- Format: ${formatOutputType(data.outputFormat)}\n`;

    if (data.constraints) {
        prompt += `- Additional requirements: ${data.constraints}\n`;
    }

    return prompt;
}

function generateFewShotPrompt(data, category) {
    let prompt = '';

    prompt += `Task: ${data.taskDescription || `[Describe your ${category} task]`}\n\n`;
    prompt += `Here is an example of what I'm looking for:\n\n`;
    prompt += `Example Input:\n`;
    prompt += `${data.inputExample || '[Your example input]'}\n\n`;
    prompt += `Example Output:\n`;
    prompt += `${data.outputExample || '[Your expected output]'}\n\n`;
    prompt += `---\n\n`;
    prompt += `Now, apply the same approach to:\n`;
    prompt += `[Your actual input here]\n\n`;
    prompt += `Requirements:\n`;
    prompt += `- Tone: ${capitalizeFirst(data.tone)}\n`;
    prompt += `- Format: ${formatOutputType(data.outputFormat)}\n`;

    if (data.constraints) {
        prompt += `- ${data.constraints}\n`;
    }

    return prompt;
}

function generateChainOfThoughtPrompt(data, category) {
    let prompt = '';

    prompt += `${data.taskDescription || `[Describe your ${category} task]`}\n\n`;
    prompt += `Please solve this step by step:\n\n`;
    prompt += `1. First, analyze the problem and identify key components\n`;
    prompt += `2. Break down the task into smaller, manageable steps\n`;
    prompt += `3. Work through each step, explaining your reasoning\n`;
    prompt += `4. Synthesize your findings into a final answer\n\n`;
    prompt += `Show your thinking process for each step before providing the final result.\n\n`;
    prompt += `Output requirements:\n`;
    prompt += `- Tone: ${capitalizeFirst(data.tone)}\n`;
    prompt += `- Final format: ${formatOutputType(data.outputFormat)}\n`;

    if (data.constraints) {
        prompt += `- ${data.constraints}\n`;
    }

    return prompt;
}

function generateRoleBasedPrompt(data, category) {
    let prompt = '';

    const role = data.role || getDefaultRole(category);

    prompt += `You are ${role}.\n\n`;
    prompt += `Your task: ${data.taskDescription || `[Describe what you need from this expert]`}\n\n`;
    prompt += `Please respond with:\n`;
    prompt += `- The expertise and insight expected from your role\n`;
    prompt += `- ${capitalizeFirst(data.tone)} tone throughout\n`;
    prompt += `- Format: ${formatOutputType(data.outputFormat)}\n`;

    if (data.constraints) {
        prompt += `- ${data.constraints}\n`;
    }

    return prompt;
}

function generateTemplateBasedPrompt(data, category) {
    let prompt = '';

    prompt += `${data.taskDescription || `[Describe your ${category} task]`}\n\n`;
    prompt += `Please structure your response using the following template:\n\n`;
    prompt += `## Overview\n`;
    prompt += `[Brief summary of the main points]\n\n`;
    prompt += `## Details\n`;
    prompt += `[Detailed explanation or content]\n\n`;
    prompt += `## Key Takeaways\n`;
    prompt += `- [Point 1]\n`;
    prompt += `- [Point 2]\n`;
    prompt += `- [Point 3]\n\n`;
    prompt += `## Next Steps (if applicable)\n`;
    prompt += `[Recommended actions]\n\n`;
    prompt += `---\n`;
    prompt += `Requirements:\n`;
    prompt += `- Tone: ${capitalizeFirst(data.tone)}\n`;
    prompt += `- Output format: ${formatOutputType(data.outputFormat)}\n`;

    if (data.constraints) {
        prompt += `- ${data.constraints}\n`;
    }

    return prompt;
}

// ========================================
// Helper Functions
// ========================================

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatOutputType(type) {
    const formats = {
        'paragraph': 'flowing paragraphs',
        'bullet-points': 'bullet points',
        'numbered-list': 'numbered list',
        'table': 'table format',
        'code': 'code blocks',
        'json': 'JSON format'
    };
    return formats[type] || type;
}

function getDefaultRole(category) {
    const roles = {
        'writing': 'an experienced professional writer and editor',
        'coding': 'a senior software engineer with 15+ years of experience',
        'analysis': 'a data analyst and research expert',
        'creative': 'a creative director at a leading design agency',
        'learning': 'an expert educator and mentor',
        'business': 'a seasoned business strategist and consultant',
        'communication': 'a professional communications specialist',
        'research': 'a senior research analyst with expertise in thorough investigation',
        'marketing': 'a marketing director with 10+ years of brand experience',
        'legal': 'a legal consultant specializing in contract drafting',
        'support': 'a customer success manager with technical expertise',
        'translation': 'a professional translator and localization expert'
    };
    return roles[category] || 'an expert in your field';
}

// ========================================
// Copy to Clipboard
// ========================================

function copyPrompt() {
    const prompt = document.getElementById('result-prompt').textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const copyText = copyBtn.querySelector('.copy-text');

        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';

        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.textContent = 'Copy';
        }, 2000);
    });
}



// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.dataset.section);
        });
    });

    // Technique cards in Learn section
    document.querySelectorAll('.technique-card').forEach(card => {
        card.addEventListener('click', () => {
            showTechniqueDetail(card.dataset.technique);
        });
    });

    // Category cards in Generate section
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            selectCategory(card.dataset.category);
        });
    });

    // Alternative technique buttons
    document.querySelectorAll('.alt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectTechnique(btn.dataset.technique);
        });
    });

    // Close modal on outside click
    document.getElementById('technique-detail').addEventListener('click', (e) => {
        if (e.target.id === 'technique-detail') {
            closeTechniqueDetail();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTechniqueDetail();
        }
    });

    // Initialize
    updateWizardStep();
    updateFormVisibility();
});

// Make functions available globally
window.showSection = showSection;
window.closeTechniqueDetail = closeTechniqueDetail;
window.useThisTechnique = useThisTechnique;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.resetWizard = resetWizard;
window.generatePrompt = generatePrompt;
window.copyPrompt = copyPrompt;
window.closeAIModal = closeAIModal;
