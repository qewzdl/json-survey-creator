let questions = [];

document.getElementById('jsonFileInput').addEventListener('change', importJSON);
document.addEventListener("DOMContentLoaded", function() {
    updateQuestionsDisplay();
    updateJSONDisplay();
});

function addQuestion() {
    questions.push({ text: '', type: 'CHOICE', level: 'MAIN', options: [], subQuestions: {} });
    updateQuestionsDisplay();
    updateJSONDisplay();
}

function removeQuestion(id) {
    questions.splice(id, 1);
    updateQuestionsDisplay();
    updateJSONDisplay();
}

function addSubQuestion(questionId, optionValue) {
    if (!questions[questionId].subQuestions) {
        questions[questionId].subQuestions = {}; 
    }
    questions[questionId].subQuestions[optionValue] = {
        text: '',
        type: 'FREE_TEXT',
        level: 'SUB',
        options: []
    };
    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
}

function removeSubQuestion(questionId, optionValue) {
    delete questions[questionId].subQuestions[String(optionValue)];
    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
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
}

function updateType(id, type) {
    questions[id].type = type;

    if (type === 'FREE_TEXT') {
        questions[id].options = [];
        document.getElementById(`options-${id}`).innerHTML = '';
    }

    updateQuestionsDisplay(); 
    updateJSONDisplay();
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
                    <!-- Add sub-question container inside the answer-block -->
                    <div class="subQuestionsContainer" id="subQuestions-${questionId}-${index}" style="display: grid; gap: 10px; margin-top: 10px;"></div>
                </div>
            </div>
        `;
        container.appendChild(div);

        if (questionId in questions && option in questions[questionId].subQuestions) {
            updateSubQuestionsDisplay(questionId, index);
        }
    });
}


function addOption(questionId) {
    questions[questionId].options.push({ value: '', action: '' });
    updateOptionsDisplay(questionId);
    updateJSONDisplay();
}

function removeOption(questionId, optionId) {
    questions[questionId].options.splice(optionId, 1);
    updateOptionsDisplay(questionId);
    updateJSONDisplay();
}

function updateOption(questionId, optionId, value) {
    questions[questionId].options[optionId].value = value;
    updateJSONDisplay();
}

function updateAction(questionId, optionId, action) {
    questions[questionId].options[optionId].action = action;
    updateJSONDisplay();
}

function updateSubQuestionsDisplay(questionId) {
    const container = document.getElementById(`subQuestions-${questionId}`);
    container.innerHTML = '';

    const subQuestions = questions[questionId].subQuestions || {};
    for (let option in subQuestions) {
        const subQuestion = subQuestions[option];
        const div = document.createElement('div');
        div.classList.add('subQuestion');
        div.id = `subQuestion-${questionId}-${option}`;

        div.innerHTML = `
            <div class="block secondary-block sub-question-block">
                <div class="labelsContainer">
                    <div class="numeration">Подвопрос для варианта ${Object.keys(subQuestions).indexOf(option) + 1}</div>
                    <input class="full-input" type="text" value="${subQuestion.text}" oninput="updateSubQuestionText(${questionId}, '${option}', this.value)"></label>
                    <label><span class="label-text">Тип подвопроса</span><br>
                        <select onchange="updateSubQuestionType(${questionId}, '${option}', this.value)">
                            <option value="CHOICE" ${subQuestion.type === 'CHOICE' ? 'selected' : ''}>CHOICE</option>
                            <option value="FREE_TEXT" ${subQuestion.type === 'FREE_TEXT' ? 'selected' : ''}>FREE_TEXT</option>
                        </select>
                    </label>
                </div>
                <div class="buttonsContainer">
                    <button onclick="addSubQuestionOption(${questionId}, '${option}')" ${subQuestion.type === 'FREE_TEXT' ? 'style="display: none;"' : ''}>Добавить вариант ответа</button>
                    <button class="delete-btn" onclick="removeSubQuestion(${questionId}, '${option}')">Удалить подвопрос</button>
                </div>
                <div class="options" id="subOptions-${questionId}-${option}"></div>
            </div>
        `;

        container.appendChild(div);

        if (subQuestion.type === 'CHOICE') {
            updateSubQuestionOptionsDisplay(questionId, option);
        }
    }
}

function updateSubQuestionText(questionId, option, value) {
    questions[questionId].subQuestions[option].text = value;
    updateJSONDisplay();
}

function updateSubQuestionType(questionId, option, type) {
    questions[questionId].subQuestions[option].type = type;

    if (type === 'FREE_TEXT') {
        questions[questionId].subQuestions[option].options = [];
        document.getElementById(`subOptions-${questionId}-${option}`).innerHTML = '';
    }

    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
}

function addSubQuestionOption(questionId, option) {
    questions[questionId].subQuestions[option].options.push({ value: '', action: '' });
    updateSubQuestionOptionsDisplay(questionId, option);
    updateJSONDisplay();
}

function removeSubQuestionOption(questionId, optionIndex) {
    const subQuestions = questions[questionId].subQuestions;
    const optionKeys = Object.keys(subQuestions);
    const option = optionKeys.find(opt => subQuestions[opt].options[optionIndex]);

    if (option) {
        subQuestions[option].options.splice(optionIndex, 1);
        updateSubQuestionOptionsDisplay(questionId, option);
        updateJSONDisplay();
    }
}

function updateSubQuestionOptionsDisplay(questionId, option) {
    const container = document.getElementById(`subOptions-${questionId}-${option}`);
    container.innerHTML = '';

    questions[questionId].subQuestions[option].options.forEach((option, optionIndex) => {
        const div = document.createElement('div');
        div.id = `subOption-${questionId}-${option}-${optionIndex}`;
        div.innerHTML = `
            <div class="block secondary-block answer-block">
                <div class="labelsContainer answer-variant">
                    <label><p class="numeration">Ответ ${optionIndex + 1}</p> <br>
                        <input class="full-input" type="text" value="${option.value}" 
                        oninput="updateSubQuestionOption(${questionId}, '${option}', ${optionIndex}, this.value)">
                    </label>
                </div>
                <div class="answer-block-footer">
                    <label><span class="label-text">Действие</span><br>
                        <select onchange="updateSubQuestionAction(${questionId}, '${option}', ${optionIndex}, this.value)">
                            <option value="" ${option.action === '' ? 'selected' : ''}>Обычный</option>
                            <option value="SKIP" ${option.action === 'SKIP' ? 'selected' : ''}>SKIP</option>
                            <option value="FLUSH" ${option.action === 'FLUSH' ? 'selected' : ''}>FLUSH</option>
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
}

function updateSubQuestionAction(questionId, option, optionIndex, action) {
    questions[questionId].subQuestions[option].options[optionIndex].action = action;
    updateJSONDisplay();
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
        testing: false,
        initialized: false,
        questions: questions.map(question => {
            const updatedQuestion = { ...question };
            
            if (!updatedQuestion.subQuestions || Object.keys(updatedQuestion.subQuestions).length === 0) {
                delete updatedQuestion.subQuestions;
            } else {
                updatedQuestion.subQuestions = Object.fromEntries(
                    Object.entries(updatedQuestion.subQuestions).map(([key, value], index) => [
                        `Вариант ${index + 1}`,
                        value
                    ])
                );
            }
        
            return updatedQuestion;
        })        
    };

    document.getElementById('jsonPreview').textContent = JSON.stringify(survey, null, 4);
}

function checkQuestionsContainer() {
    const questionsContainer = document.getElementById('questionsContainer');
    const testSection = document.querySelector('.test-section');

    if (questionsContainer.children.length === 0) {
        testSection.style.gap = '0';
    } else {
        testSection.style.gap = '10px';
    }
}
