let questions = [];

document.getElementById('jsonFileInput').addEventListener('change', importJSON);
document.addEventListener("DOMContentLoaded", function() {
    updateQuestionsDisplay();
    updateJSONDisplay();
});

function addQuestion() {
    questions.push({ text: '', type: 'CHOICE', level: 'MAIN', options: [], subQuestions: [] });
    updateQuestionsDisplay();
    updateJSONDisplay();
}

function removeQuestion(id) {
    questions.splice(id, 1);
    updateQuestionsDisplay();
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
                    <button onclick="addSubQuestion(${index})">Добавить подвопрос</button>
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
        const div = document.createElement('div');
        div.id = `option-${questionId}-${index}`;
        div.innerHTML = `
            <div class="block secondary-block answer-block">
                <div class="labelsContainer answer-variant">
                    <label><p class="numeration">Ответ ${index + 1}</p> <br>
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
                        <button class="delete-btn" onclick="removeOption(${questionId}, ${index})">Удалить</button>
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

function addSubQuestion(questionId) {
    questions[questionId].subQuestions.push({ text: '', options: [] });
    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
}

function removeSubQuestion(questionId, subQuestionId) {
    questions[questionId].subQuestions.splice(subQuestionId, 1);
    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
}

function updateSubQuestionsDisplay(questionId) {
    const container = document.getElementById(`subQuestions-${questionId}`);
    container.innerHTML = '';

    questions[questionId].subQuestions.forEach((subQuestion, subIndex) => {
        const div = document.createElement('div');
        div.classList.add('subQuestion');
        div.id = `subQuestion-${questionId}-${subIndex}`;

        div.innerHTML = `
            <div class="block secondary-block sub-question-block">
                <div class="labelsContainer">
                    <label><p class="numeration">Подвопрос ${subIndex + 1}</p> <br>
                    <input class="full-input" type="text" value="${subQuestion.text}" oninput="updateSubQuestionText(${questionId}, ${subIndex}, this.value)"></label>
                    <label><span class="label-text">Тип подвопроса</span><br>
                        <select onchange="updateSubQuestionType(${questionId}, ${subIndex}, this.value)">
                            <option value="CHOICE" ${subQuestion.type === 'CHOICE' ? 'selected' : ''}>CHOICE</option>
                            <option value="FREE_TEXT" ${subQuestion.type === 'FREE_TEXT' ? 'selected' : ''}>FREE_TEXT</option>
                        </select>
                    </label>
                </div>
                <div class="buttonsContainer">
                    <button onclick="addSubQuestionOption(${questionId}, ${subIndex})" ${subQuestion.type === 'FREE_TEXT' ? 'style="display: none;"' : ''}>Добавить вариант ответа</button>
                    <button class="delete-btn" onclick="removeSubQuestion(${questionId}, ${subIndex})">Удалить подвопрос</button>
                </div>
                <div class="options" id="subOptions-${questionId}-${subIndex}"></div>
            </div>
        `;

        container.appendChild(div);

        if (subQuestion.type === 'CHOICE') {
            updateSubQuestionOptionsDisplay(questionId, subIndex);
        }
    });
}

function updateSubQuestionText(questionId, subIndex, value) {
    questions[questionId].subQuestions[subIndex].text = value;
    updateJSONDisplay();
}

function updateSubQuestionType(questionId, subIndex, type) {
    questions[questionId].subQuestions[subIndex].type = type;
    
    if (type === 'FREE_TEXT') {
        questions[questionId].subQuestions[subIndex].options = [];
        document.getElementById(`subOptions-${questionId}-${subIndex}`).innerHTML = '';
    }

    updateSubQuestionsDisplay(questionId);
    updateJSONDisplay();
}


function addSubQuestionOption(questionId, subIndex) {
    questions[questionId].subQuestions[subIndex].options.push({ value: '', action: '' });
    updateSubQuestionOptionsDisplay(questionId, subIndex);
    updateJSONDisplay();
}

function removeSubQuestionOption(questionId, subIndex, optionIndex) {
    questions[questionId].subQuestions[subIndex].options.splice(optionIndex, 1);
    updateSubQuestionOptionsDisplay(questionId, subIndex);
    updateJSONDisplay();
}

function updateSubQuestionOptionsDisplay(questionId, subIndex) {
    const container = document.getElementById(`subOptions-${questionId}-${subIndex}`);
    container.innerHTML = '';

    questions[questionId].subQuestions[subIndex].options.forEach((option, optionIndex) => {
        const div = document.createElement('div');
        div.id = `subOption-${questionId}-${subIndex}-${optionIndex}`;
        div.innerHTML = `
            <div class="block secondary-block answer-block">
                <div class="labelsContainer answer-variant">
                    <label><p class="numeration">Ответ ${optionIndex + 1}</p> <br>
                        <input class="full-input" type="text" value="${option.value}" 
                        oninput="updateSubQuestionOption(${questionId}, ${subIndex}, ${optionIndex}, this.value)">
                    </label>
                </div>
                <div class="answer-block-footer">
                    <label><span class="label-text">Действие</span><br>
                        <select onchange="updateSubQuestionAction(${questionId}, ${subIndex}, ${optionIndex}, this.value)">
                            <option value="" ${option.action === '' ? 'selected' : ''}>Обычный</option>
                            <option value="SKIP" ${option.action === 'SKIP' ? 'selected' : ''}>SKIP</option>
                            <option value="FLUSH" ${option.action === 'FLUSH' ? 'selected' : ''}>FLUSH</option>
                        </select>
                    </label>
                    <div class="buttonsContainer">
                        <button class="delete-btn" onclick="removeSubQuestionOption(${questionId}, ${subIndex}, ${optionIndex})">Удалить</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateSubQuestionOption(questionId, subIndex, optionIndex, value) {
    questions[questionId].subQuestions[subIndex].options[optionIndex].value = value;
    updateJSONDisplay();
}

function updateSubQuestionAction(questionId, subIndex, optionIndex, action) {
    questions[questionId].subQuestions[subIndex].options[optionIndex].action = action;
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
        questions: questions
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
