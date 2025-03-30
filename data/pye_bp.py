import re
import os


# Carpeta de archivos de datos
DATA_PATH = r'C:\Users\60048007\Documents\Projects\pye\pye-evaluador-dev\data'

# Banco de preguntas
questions_banks = [
    {'id': '01', 'unit': 1, 'file_path': os.path.join(DATA_PATH, r'pye_bp_ut_01.md'), 'questions': None},
]

# Listado de preguntas
questions = []


# Procesa las preguntas de los bancos de preguntas
def process_questions_banks():

    for bank_ix in range(0, len(questions_banks), 1):
        process_questions_bank(bank_ix)


# Procesa las preguntas del banco de preguntas dado por bank_ix
def process_questions_bank(bank_ix):

    global questions_banks
    global questions

    with open(questions_banks[bank_ix]['file_path'], mode='r', encoding='utf-8') as questions_bank:
        lines = questions_bank.readlines()
    
    question_indexes = []
    for ix, line in enumerate(lines):
        if re.search(f'^## {questions_banks[bank_ix]["unit"]}[0-9]{{3}}$', line):
            question_indexes.append(ix)
    
    for question_indexes_ix in range(0, len(question_indexes), 1):
        question = {
            'id': re.sub('\r?\n', '', lines[question_indexes[question_indexes_ix]].replace('## ', '')), 
            'unit': questions_banks[bank_ix]['unit'], 
            'type': '', 
            'instruction': '', 
            'answer': '',
            'topics': []
        }
        line_ix = question_indexes[question_indexes_ix] + 4
        if question_indexes_ix < len(question_indexes) - 1:
            line_ix_end = question_indexes[question_indexes_ix + 1]
        else:
            line_ix_end = len(lines) - 1
        while(line_ix < line_ix_end):
            # Type
            if re.search(r'^\*Tipo\*: ', lines[line_ix]):
                question['type'] = re.sub('\r?\n', '', lines[line_ix][8:])
            # Instruction
            elif re.search(r'^\*Consigna\*:$', lines[line_ix]):
                line_ix += 2
                while(line_ix < line_ix_end and not re.search(r'^\*Respuesta\*: ', lines[line_ix])):
                    if lines[line_ix] != '\n':
                        question['instruction'] += re.sub('\r?\n', r'\\n', lines[line_ix]).replace('/images/', r'images/').replace('\\', '\\\\').replace('\\\\n', '\\n')
                    line_ix += 1
                line_ix -= 1
            # Answer
            elif re.search(r'^\*Respuesta\*: ', lines[line_ix]):
                question['answer'] = re.sub('\r?\n', '', lines[line_ix][13:])
            # Answer
            elif re.search(r'^\*Temas\*: ', lines[line_ix]):
                question['topics'] = re.sub('\r?\n', '', lines[line_ix][9:]).split(', ')
            line_ix += 1
        questions.append(question)


# Exporta banco de preguntas
def export_questions():

    with open(os.path.join(DATA_PATH, 'pye_bp.js'), mode='w', encoding='utf-8') as f:
        f.write('questions = [\n')
        for question in questions:
            f.write(' ' * 4 + f'{{"id": {question["id"]}, "unit": {question["unit"]}, "type": "{question["type"]}", "instruction": "{question["instruction"]}", "answer": "{question["answer"]}", "topics": {question["topics"]}}},\n')
        f.write(']')
        #f.write(f'questions = {json.dumps(questions, indent=4)}')
        #json.dump(questions_banks, f, ensure_ascii=False, indent=4)


process_questions_banks()
export_questions()