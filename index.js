let questions = [];

document.getElementById('jsonFileInput').addEventListener('change', importJSON);

document.addEventListener("DOMContentLoaded", function() {
    loadFromLocalStorage();
    updateQuestionsDisplay();
    updateJSONDisplay();
});

function addQuestion() {
    questions.push({ text: '', type: 'CHOICE', level: 'MAIN', options: [], subQuestions: {} });
    updateQuestionsDisplay();
    updateJSONDisplay();
    saveToLocalStorage();
}

function removeQuestion(id) {
    questions.splice(id, 1);
    updateQuestionsDisplay();
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateQuestionsDisplay() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const div = document.createElement('div');
        div.classList.add('question');
        div.id = `question-${index}`;

        div.innerHTML = `
            <div class="block secondary-block question-block">
                <div class="labelsContainer">
                    <label><p class="numeration">Вопрос ${index + 1}</p> <br>
                    <input class="full-input" type="text" value="${question.text}" oninput="updateQuestion(${index}, this.value)"></label>
                    <label><span class="label-text">Тип вопроса</span><br>
                        <select onchange="updateType(${index}, this.value)">
                            <option value="CHOICE" ${question.type === 'CHOICE' ? 'selected' : ''}>CHOICE</option>
                            <option value="FREE_TEXT" ${question.type === 'FREE_TEXT' ? 'selected' : ''}>FREE_TEXT</option>
                        </select>
                    </label>
                </div>
                <div class="buttonsContainer">
                    <button onclick="addOption(${index})" ${question.type === 'FREE_TEXT' ? 'style="display: none;"' : ''}>Добавить вариант ответа</button>
                    <button class="delete-btn" onclick="removeQuestion(${index})">Удалить вопрос</button>
                </div>
                <div class="options" id="options-${index}"></div>
                <div class="subQuestionsContainer" id="subQuestions-${index}" style="display: grid; gap: 10px; margin-top: 10px;"></div>
            </div>
        `;

        container.appendChild(div);

        if (question.type === 'CHOICE') {
            updateOptionsDisplay(index);
        }

        updateSubQuestionsDisplay(index);
    });

    checkQuestionsContainer();
}

function updateQuestion(id, text) {
    questions[id].text = text;
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateType(id, type) {
    questions[id].type = type;

    if (type === 'FREE_TEXT') {
        questions[id].options = [];
        questions[id].subQuestions = {};
        document.getElementById(`options-${id}`).innerHTML = '';
        document.getElementById(`subQuestions-${id}`).innerHTML = ''; 
    }

    updateQuestionsDisplay(); 
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateOptionsDisplay(questionId) {
    const container = document.getElementById(`options-${questionId}`);
    container.innerHTML = '';

    questions[questionId].options.forEach((option, index) => {
        const isLast = index === questions[questionId].options.length - 1;
        
        const div = document.createElement('div');
        div.id = `option-${questionId}-${index}`;
        div.innerHTML = `
            <div class="option-container">
                <div class="visual-container">
                    ${isLast ? '<div class="visual-block-3"></div>' : '<div class="visual-block-1"></div><div class="visual-block-2"></div>'}
                </div>
                <div class="block secondary-block answer-block three-block">
                    <div class="labelsContainer answer-variant">
                        <label><p class="numeration">Вариант ${index + 1}</p> <br>
                            <input class="full-input" type="text" value="${option.value}" 
                            oninput="updateOption(${questionId}, ${index}, this.value)">
                        </label>
                    </div>
                    <div class="answer-block-footer">
                        <label><span class="label-text">Действие</span><br>
                            <select onchange="updateAction(${questionId}, ${index}, this.value)">
                                <option value="" ${option.action === '' ? 'selected' : ''}>Обычный</option>
                                <option value="SKIP" ${option.action === 'SKIP' ? 'selected' : ''}>SKIP</option>
                                <option value="FLUSH" ${option.action === 'FLUSH' ? 'selected' : ''}>FLUSH</option>
                            </select>
                        </label>
                        <div class="buttonsContainer">
                            <button onclick="addSubQuestion(${questionId}, ${index})">Добавить подвопрос</button>
                            <button class="delete-btn" onclick="removeOption(${questionId}, ${index})">Удалить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function addOption(questionId) {
    questions[questionId].options.push({ value: '', action: '' });
    updateOptionsDisplay(questionId);
    updateJSONDisplay();
    saveToLocalStorage();
}

function removeOption(questionId, optionId) {
    const question = questions[questionId];

    const removedKey = `Вариант ${optionId + 1}`;
    delete question.subQuestions[removedKey];

    question.options.splice(optionId, 1);

    const updatedSubQuestions = {};
    Object.keys(question.subQuestions).forEach((oldKey) => {
        const match = oldKey.match(/\d+/);
        if (match) {
            const oldIndex = parseInt(match[0], 10);
            if (oldIndex > optionId + 1) { 
                const newKey = `Вариант ${oldIndex - 1}`;
                updatedSubQuestions[newKey] = question.subQuestions[oldKey];
            } else {
                updatedSubQuestions[oldKey] = question.subQuestions[oldKey];
            }
        }
    });

    question.subQuestions = updatedSubQuestions;

    updateOptionsDisplay(questionId);
    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
    saveToLocalStorage();
}



function updateOption(questionId, optionId, value) {
    questions[questionId].options[optionId].value = value;
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateAction(questionId, optionId, action) {
    questions[questionId].options[optionId].action = action;
    updateJSONDisplay();
    saveToLocalStorage();
}

function addSubQuestion(questionId, optionIndex) {
    if (!questions[questionId].subQuestions) {
        questions[questionId].subQuestions = {};
    }

    let optionKey = `Вариант ${optionIndex + 1}`;

    if (!questions[questionId].subQuestions[optionKey]) {
        questions[questionId].subQuestions[optionKey] = {
            text: '',
            type: 'CHOICE',
            level: 'SUB',
            options: []
        };
    }

    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
    saveToLocalStorage();
}

function removeSubQuestion(questionId, option) {
    const subQuestion = questions[questionId].subQuestions[option];
    if (subQuestion) {
        subQuestion.options = []; 
    }

    delete questions[questionId].subQuestions[String(option)]; 
    updateSubQuestionsDisplay(questionId); 
    updateJSONDisplay(); 
    saveToLocalStorage();
}

function updateSubQuestionsDisplay(questionId) {
    const container = document.getElementById(`subQuestions-${questionId}`);
    container.innerHTML = '';

    const subQuestions = questions[questionId].subQuestions || {};
    
    const sortedKeys = Object.keys(subQuestions).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0]) || 0;
        const numB = parseInt(b.match(/\d+/)?.[0]) || 0;
        return numA - numB;
    });

    sortedKeys.forEach((optionKey, index) => {
        const subQuestion = subQuestions[optionKey];
        const div = document.createElement('div');
        div.classList.add('subQuestion');
        div.id = `subQuestion-${questionId}-${optionKey}`;

        div.innerHTML = `
            <div class="subQuestion-container">
                <div class="visual-block"></div>
                <div class="block secondary-block sub-question-block">
                    <div class="labelsContainer">
                        <div class="numeration">Подвопрос для ${optionKey}</div>
                        <input class="full-input" type="text" value="${subQuestion.text}" oninput="updateSubQuestionText(${questionId}, '${optionKey}', this.value)">
                        <label><span class="label-text">Тип подвопроса</span><br>
                            <select onchange="updateSubQuestionType(${questionId}, '${optionKey}', this.value)">
                                <option value="CHOICE" ${subQuestion.type === 'CHOICE' ? 'selected' : ''}>CHOICE</option>
                                <option value="FREE_TEXT" ${subQuestion.type === 'FREE_TEXT' ? 'selected' : ''}>FREE_TEXT</option>
                            </select>
                        </label>
                    </div>
                    <div class="buttonsContainer">
                        <button onclick="addSubQuestionOption(${questionId}, '${optionKey}')" ${subQuestion.type === 'FREE_TEXT' ? 'style="display: none;"' : ''}>Добавить вариант ответа</button>
                        <button class="delete-btn" onclick="removeSubQuestion(${questionId}, '${optionKey}')">Удалить подвопрос</button>
                    </div>
                    <div class="options" id="subOptions-${questionId}-${optionKey}"></div>
                </div>
            </div>
        `;
        container.appendChild(div);

        if (subQuestion.type === 'CHOICE') {
            updateSubQuestionOptionsDisplay(questionId, optionKey);
        }
    });
}

function updateSubQuestionText(questionId, option, value) {
    questions[questionId].subQuestions[option].text = value;
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateSubQuestionType(questionId, option, type) {
    questions[questionId].subQuestions[option].type = type;

    if (type === 'FREE_TEXT') {
        questions[questionId].subQuestions[option].options = [];
        document.getElementById(`subOptions-${questionId}-${option}`).innerHTML = '';
    }

    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
    saveToLocalStorage();
}

function addSubQuestionOption(questionId, option) {
    questions[questionId].subQuestions[option].options.push({ value: '', action: '' });
    updateSubQuestionOptionsDisplay(questionId, option);
    updateJSONDisplay();
    saveToLocalStorage();
}

function removeSubQuestionOption(questionId, optionIndex) {
    const subQuestions = questions[questionId].subQuestions;

    Object.keys(subQuestions).forEach(optionKey => {
        const subQuestion = subQuestions[optionKey];
        if (subQuestion.options && subQuestion.options[optionIndex]) {
            subQuestion.options.splice(optionIndex, 1);
        }
    });

    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateSubQuestionOptionsDisplay(questionId, option) {
    const container = document.getElementById(`subOptions-${questionId}-${option}`);
    
    const savedOptions = questions[questionId].subQuestions[option].options.map((opt, index) => ({
        value: opt.value,
        action: opt.action
    }));

    container.innerHTML = '';

    savedOptions.forEach((opt, optionIndex) => {
        const div = document.createElement('div');
        div.id = `subOption-${questionId}-${option}-${optionIndex}`;
        div.innerHTML = `
            <div class="block secondary-block answer-block">
                <div class="labelsContainer answer-variant">
                    <label><p class="numeration">Вариант ${optionIndex + 1}</p> <br>
                        <input class="full-input" type="text" value="${opt.value}" 
                        oninput="updateSubQuestionOption(${questionId}, '${option}', ${optionIndex}, this.value)">
                    </label>
                </div>
                <div class="answer-block-footer">
                    <label><span class="label-text">Действие</span><br>
                        <select onchange="updateSubQuestionAction(${questionId}, '${option}', ${optionIndex}, this.value)">
                            <option value="" ${opt.action === '' ? 'selected' : ''}>Обычный</option>
                            <option value="SKIP" ${opt.action === 'SKIP' ? 'selected' : ''}>SKIP</option>
                            <option value="FLUSH" ${opt.action === 'FLUSH' ? 'selected' : ''}>FLUSH</option>
                        </select>
                    </label>
                    <div class="buttonsContainer">
                        <button class="delete-btn" onclick="removeSubQuestionOption(${questionId}, ${optionIndex})">Удалить</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateSubQuestionOption(questionId, option, optionIndex, value) {
    questions[questionId].subQuestions[option].options[optionIndex].value = value;
    updateJSONDisplay();
    saveToLocalStorage();
}

function updateSubQuestionAction(questionId, option, optionIndex, action) {
    questions[questionId].subQuestions[option].options[optionIndex].action = action;
    updateJSONDisplay();
    saveToLocalStorage();
}

function downloadJSON() {
    const survey = {
        type: document.getElementById('surveyTitle').value,
        link: document.getElementById('googleSheetLink').value,
        testing: false,
        initialized: false,
        questions: questions
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(survey, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "survey.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            document.getElementById('surveyTitle').value = importedData.type || '';
            document.getElementById('googleSheetLink').value = importedData.link || '';
            questions = importedData.questions || [];
            updateQuestionsDisplay(); 
            questions.forEach((question, index) => {
                updateSubQuestionsDisplay(index);
            });
            updateJSONDisplay();
        } catch (error) {
            alert("Ошибка при загрузке JSON. Проверьте формат файла.");
        }
    };
    reader.readAsText(file);
}

function updateJSONDisplay() {
    const survey = {
        type: document.getElementById('surveyTitle').value,
        link: document.getElementById('googleSheetLink').value,
        testing: document.querySelector('.main-select-block:nth-child(1) select').value,
        initialized: document.querySelector('.main-select-block:nth-child(2) select').value,
        questions: questions.map(question => {
            const updatedQuestion = { ...question };

            if (!updatedQuestion.subQuestions || Object.keys(updatedQuestion.subQuestions).length === 0) {
                delete updatedQuestion.subQuestions;
            } else {
                updatedQuestion.subQuestions = { ...question.subQuestions };
            }

            return updatedQuestion;
        })        
    };

    document.getElementById('jsonPreview').textContent = JSON.stringify(survey, null, 4);
}

document.querySelectorAll('.main-select').forEach(select => {
    select.addEventListener('change', updateJSONDisplay);
});

function checkQuestionsContainer() {
    const questionsContainer = document.getElementById('questionsContainer');
    const testSection = document.querySelector('.test-section');

    if (questionsContainer.children.length === 0) {
        testSection.style.gap = '0';
    } else {
        testSection.style.gap = '10px';
    }
}

function saveToLocalStorage() {
    localStorage.setItem('surveyData', JSON.stringify({
        type: document.getElementById('surveyTitle').value,
        link: document.getElementById('googleSheetLink').value,
        testing: document.querySelector('.main-select-block:nth-child(1) select').value,
        initialized: document.querySelector('.main-select-block:nth-child(2) select').value,
        questions: questions
    }));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('surveyData');
    if (savedData) {
        try {
            const importedData = JSON.parse(savedData);
            document.getElementById('surveyTitle').value = importedData.type || '';
            document.getElementById('googleSheetLink').value = importedData.link || '';
            questions = importedData.questions || [];
            updateQuestionsDisplay();
            questions.forEach((_, index) => {
                updateSubQuestionsDisplay(index);
            });
            updateJSONDisplay();
        } catch (error) {
            console.error("Ошибка загрузки данных из LocalStorage:", error);
        }
    }
}

document.querySelector('.clear-btn').addEventListener('click', function() {
    document.getElementById('surveyTitle').value = '';
    document.getElementById('googleSheetLink').value = '';
    document.querySelector('.main-select-block:nth-child(1) select').value = 'false';
    document.querySelector('.main-select-block:nth-child(2) select').value = 'false';
    questions = [];
    updateQuestionsDisplay();
    updateJSONDisplay();
    saveToLocalStorage();
});