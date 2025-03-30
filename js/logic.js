/**************************************************************************************************************************************************
/* Global Objects 
/**************************************************************************************************************************************************/

const PAGE_TITLE = 'UTN-FRH - Probabilidad y estadística';
let currentViewId = undefined;
let examId = undefined;
let examIx = undefined;
let deliveryData = undefined;
let startTime = undefined;


/**************************************************************************************************************************************************
/* Main function to be executed after page load 
/**************************************************************************************************************************************************/

async function main() {

    configurePlugins();
    getUrlParameters();
    updateUI();
    startTime = new Date();
}


/**************************************************************************************************************************************************
/* Data functions 
/**************************************************************************************************************************************************/

// Gets parameters from URL query string
function getUrlParameters() {

    const params = new URLSearchParams(location.search);
    currentViewId = params.get('vista');
    examId = params.get('examen');
}


/**************************************************************************************************************************************************
/* GUI functions 
/**************************************************************************************************************************************************/

// Updates UI
function updateUI() {

    switch (currentViewId) {
        case 'preguntas':
            updateQuestionsView();
            break;
    
            case 'examenes':
            updateExamsView();
            break;

        default:
            document.getElementById('page-title').innerHTML = `${PAGE_TITLE}`;
            document.getElementById('default').classList.remove('d-none');
            break;
    }
    
    // Renders Latex contents
    MathJax.typeset();
}


// Updates UI: questions view
function updateQuestionsView() {

    // Updates page title
    document.getElementById('page-title').innerHTML = `${PAGE_TITLE} - Preguntas`;

    // Updates contents
    document.getElementById('preguntas-contenido').innerHTML = questionsCardsHtml(questions, true, false);
    
    // Shows questions view
    document.getElementById('examenes').classList.add('d-none');
    document.getElementById('examenes-info').classList.add('d-none');
    document.getElementById('preguntas-contenido').classList.remove('d-none');
    document.getElementById('preguntas-filtros').classList.remove('d-none');
}


// Returns html for questions as listed as cards
function questionsCardsHtml(questions, showAnswer, setQuestionsIx) {

    const regex = new RegExp('^[1-9]\.');
    let html = '';
    let htmlPoints = '';
    let instruction = '';
    let questionId = undefined;
    let questionIx = undefined;
    let optionIx = undefined;
    
    if (currentViewId === 'examenes') {
        for (questionIx = 0; questionIx < questions.length; questionIx++) {
            questions[questionIx].points = exams[examIx].questionsPoints[questionIx];
        }
        //questions.sort((question1, question2) => question2.points - question1.points);
    }
    
    questionIx = 0;
    questions.forEach(question => {
        switch (question.type) {
            
            // Multiple options
            case 'OM':
                instruction = '';
                optionIx = 1;
                question.instruction.split('\n').forEach(line => {
                    if (regex.test(line)) {
                        instruction += `
                            <div class="form-check mt-3">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    name="${question.id}-btn" 
                                    id="${question.id}-${optionIx}" 
                                    value="${optionIx}"
                                    onclick="updateAnswers(${questionIx}, '${question.type}', '${optionIx}', '${question.id}-${optionIx}')">
                                <label class="form-check-label" for="${question.id}-${optionIx}">&nbsp;&nbsp;&nbsp;${optionIx}.${marked.parse(line.replace(`${optionIx}.`, '')).replace('<p>', '').replace('</p>', '')}</label>
                            </div>`;
                        optionIx++;
                    } else {
                        instruction += marked.parse(line);
                    }
                });
                break;
        
            // Numeric resolution
            case 'CV':
                instruction = '';
                optionIx = 1;
                question.instruction.split('\n').forEach(line => {
                    if (regex.test(line)) {
                        instruction += `
                            <div class="mt-4 row">
                                <label class="form-label" for="${question.id}-${optionIx}">
                                    &nbsp;&nbsp;&nbsp;${optionIx}.${marked.parse(line.replace(`${optionIx}.`, '')).replace('<p>', '').replace('</p>', '')}
                                </label>
                                <input 
                                    class="form-control"
                                    style="margin-left:25px;width:70%"
                                    type="text" 
                                    name="${question.id}-btn" 
                                    id="${question.id}-${optionIx}" 
                                    value=""
                                    oninput="updateAnswers(${questionIx}, '${question.type}', '${optionIx}', '${question.id}-${optionIx}')">
                            </div>`;
                        /*instruction += `
                            <div class="mt-3 row">
                                <label class="col-sm-2 col-form-label" for="${question.id}-${optionIx}">
                                    &nbsp;&nbsp;&nbsp;${optionIx}.${marked.parse(line.replace(`${optionIx}.`, '')).replace('<p>', '').replace('</p>', '')}
                                </label>
                                <div class="col-sm-10">
                                    <input 
                                        class="form-control"
                                        type="text" 
                                        name="${question.id}-btn" 
                                        id="${question.id}-${optionIx}" 
                                        value=""
                                        oninput="updateAnswers(${questionIx}, '${question.type}', '${optionIx}', '${question.id}-${optionIx}')">
                                </div>
                            </div>`;*/
                        optionIx++;
                    } else {
                        instruction += marked.parse(line);
                    }
                });
            break;
            
            // True/False
            default:
                instruction = marked.parse(question.instruction);
                break;
        }
        questionId = setQuestionsIx ? questionIx + 1 : question.id;
        htmlPoints = question.points === undefined ? '' : `<span style="margin-left:8px">(${Number.parseFloat(question.points).toFixed(2)})</span>`;
        html += `
            <div id="${questionId}-card" class="card mt-4 mx-auto" style="width:98%">
                <div class="card-header text-muted" style="font-size:80%">
                    ${questionId} / ${questions.length}${htmlPoints}
                </div>
                <div class="card-body">
                    <div class="card-text">${instruction}</div>
                    ${questionHtmlCardAnswer(questionIx, question, showAnswer)}
                </div>
            </div>
        `;
        questionIx++;
    });
    return html;
}


// Returns html for question card > Answer
function questionHtmlCardAnswer(questionIx, question, showAnswer) {

    let html = '';
    let htmlAnswer = '';
    switch (question.type) {
        
        // True/False
        case 'V/F':
            if (showAnswer) {
                htmlAnswer = `
                    <div class="mt-3" style="font-size:90%">
                        <p style="margin-top:15px">
                            <button type="button" class="btn btn-link" title="Ver respuesta" onclick="toggleAnswer(${question.id})">Respuesta</button>
                            <span id="${question.id}-respuesta" class="d-none" style="margin-left:8px">${question.answer == 'V' ? 'Verdadero' : 'Falso'}</span>
                            <span id="${question.id}-respuesta-correccion" style="margin-right:5px"></span>
                    </div>  
                `;
            }
            html = `
                <div class="btn-group" role="group" style="margin-top:30px">
                    <div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="radio" 
                            name="${question.id}-btn" 
                            id="${question.id}-verdadero" 
                            value="V"
                            onclick="updateAnswers(${questionIx}, '${question.type}', 'V', '${question.id}-verdadero')">
                        <label class="form-check-label" for="${question.id}-verdadero">Verdadero</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input 
                            class="form-check-input" 
                            type="radio" 
                            name="${question.id}-btn" 
                            id="${question.id}-false" 
                            value="F"
                            onclick="updateAnswers(${questionIx}, '${question.type}', 'F', '${question.id}-falso}')">
                        <label class="form-check-label" for="${question.id}-falso">Falso</label>
                    </div>
                </div>
                ${htmlAnswer} 
            `;
            break;
        
        // Multiple options, value completion
        case 'OM':
        case 'CV':
            if (showAnswer) {
                htmlAnswer = `
                    <div class="mt-3" style="font-size:90%">
                        <p style="margin-top:15px">
                            <button type="button" class="btn btn-link" title="Ver respuesta" onclick="toggleAnswer(${question.id})">Respuesta</button>
                            <span id="${question.id}-respuesta" class="d-none" style="margin-left:8px">${question.answer}</span>
                            <span id="${question.id}-respuesta-correccion" style="margin-right:5px"></span>
                    </div>  
                `;
            }
            html += `${htmlAnswer}`;
            break;
    
        default:
            break;
    }

    return html;
}


// Toggles answer visibility
function toggleAnswer(questionId) {

    document.getElementById(`${questionId}-respuesta`).classList.toggle('d-none');
}


// Updates UI: exams view
function updateExamsView() {

    // Updates page title
    document.getElementById('page-title').innerHTML = `${PAGE_TITLE} - Exámenes `;

    // Shows questions view
    document.getElementById('preguntas-contenido').classList.add('d-none');
    document.getElementById('preguntas-filtros').classList.add('d-none');
    document.getElementById('examenes').classList.remove('d-none');
    document.getElementById('examenes-info').classList.remove('d-none');
}


// Loads exam questions
function loadExamQuestions() {

    // Sets exam ID
    examId = document.getElementById('examen-id-input').value;
    
    if (examId === '') {
        // Updates error message
        document.getElementById('examen-id-input-error-info').innerHTML = '⚠️ Inidicar un código de examen válido.';
    } else {
        // Sets exam index
        examIx = 0;
        let iterate = true;
        while (iterate) {
            if (exams[examIx].id === examId) {
                iterate = false;
            } else {
                examIx++;
                if (examIx === exams.length) {
                    iterate = false;
                    examIx = undefined;
                }
            }
        }        

        // Load exm questions
        if (examIx !== undefined) {
        
            // Updates page title
            document.getElementById('examenes-info').innerHTML = `<h6 style="margin-left:15px">Examen ${examId} - ${exams[examIx].name}</h6>`;

            // Populates answers list
            let question = undefined;
            let answers = [];
            const regex = new RegExp('^[1-9]\.');
            exams[examIx].questions.forEach(questionId => {
                question = questions.filter(question => question.id === questionId)[0];
                switch (question.type) {
                    case 'CV':
                        answers = [];
                        question.instruction.split('\n').forEach(line => {
                            if (regex.test(line)) {
                                answers.push('');
                            }
                        });
                        exams[examIx].answers.push(answers.join(';'));
                        break;
                
                    default:
                        exams[examIx].answers.push('');
                        break;
                }
            });
            

            // Updates question tab
            updateQuestionsTab();
        } else {
            // Updates error message
            document.getElementById('examen-id-input-error-info').innerHTML = '⚠️ No existe un exámen con el código indicado.';
        }
    }
}


// Updates UI: exams view > questions tab
function updateQuestionsTab() {
    let examQuestions = [];
    exams[examIx].questions.forEach(examQuestionId => {
        examQuestions.push(questions.filter(question => question.id === examQuestionId)[0]);
    });
    document.getElementById('nav-tab-contents-examenes-preguntas').innerHTML = questionsCardsHtml(examQuestions, false, true);
}


// Updates answers lists
function updateAnswers(questionIx, questionType, answerIx, answerInputId) {
    
    let currentAnswer = exams[examIx].answers[questionIx];
    let currentAnswers = undefined;
    switch (questionType) {
        case 'V/F':
            exams[examIx].answers[questionIx] = answerIx;
            break;

        case 'OM':
            if (currentAnswer === '') {
                exams[examIx].answers[questionIx] = answerIx;
            } else {
                currentAnswers = currentAnswer.split(';');
                currentAnswers.push(answerIx)
                currentAnswers.sort();
                exams[examIx].answers[questionIx] = currentAnswers.join(';');
            }
            break;

        case 'CV':
            currentAnswers = currentAnswer.split(';');
            currentAnswers[answerIx - 1] = document.getElementById(answerInputId).value;
            exams[examIx].answers[questionIx] = currentAnswers.join(';');
            break;
            
        default:
            break;
    }
}


// Updates delivery data
function updateDeliveryData() {

    let answers = [];
    let endTIme = new Date();

    // Updates delivery data > delivery tab
    let html = `UTN-FRH - Probabilidad y estadística<br>
Examen: ${examId}<br>
Fecha: ${startTime.toISOString().substring(0, 10)}<br>
Inicio: ${startTime.toTimeString().substring(0, 8)}<br>
Fin: ${endTIme.toTimeString().substring(0, 8)}<br>
Respuestas:<br>\n`;
    for (let ix = 0; ix < exams[examIx].questions.length; ix++) {
        answers = exams[examIx].answers[ix].split(';');
        if (answers.length === 1) {
            html += `${exams[examIx].questions[ix]}: ${answers[0] == "" ? "SR" : answers[0]}<br>\n`;
        } else {
            answers.forEach((answer, answerIx) => {
                html += `${exams[examIx].questions[ix]}.${answerIx + 1}: ${answer == "" ? "SR" : answer}<br>\n`;
            });
        }
        
    }
    document.getElementById('datos-entrega').innerHTML = html;

    // Updates delivery data variable and copy it to the clipboard
    navigator.clipboard.writeText(html.replaceAll('<br>', ''));
}


// Updates delivery info > student ID
function updateDeliveryId() {

    // Updates delivery tab
    document.getElementById('datos-entrega-legajo').innerHTML = `Legajo: ${document.getElementById('legajo-input').value}`;

    // Updates delivery data variable and copy it to the clipboard
    deliveryData = deliveryData.replace(/Legajo: [0-9]*/, `Legajo: ${document.getElementById('legajo-input').value}`);
    navigator.clipboard.writeText(deliveryData);

}

/**************************************************************************************************************************************************
/* Other functions 
/**************************************************************************************************************************************************/

function configurePlugins() {

    // Marked.js configuration
    marked.use({gfm: true, breaks: true});
}