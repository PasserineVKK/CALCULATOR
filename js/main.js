import { calculator } from "./calc.js";

// const operations = {
//     add:        (a, b) => a + b,
//     subtract:   (a, b) => a - b,
//     multiply:   (a, b) => a * b,
//     divide:     (a, b) => a / b,
//     mod:        (a, b) => a % b,
//     power:      (a, b) => Math.pow(a, b),
// };

// const unaryOperations = {
//     sin:        (x) => Math.sin(x),
//     cos:        (x) => Math.cos(x),
//     tan:        (x) => Math.tan(x),
//     factorial:  (x) => {
//         let r = 1;
//         for (let i = 1; i <= x; i++) r *= i;
//         return r;
//     },
//     percent:    (x) => x / 100,
//     root:       (x) => Math.pow(x, 0.5),
//     log:        (x) => Math.log10(x),

// };

// const constants = {
//     PI:  Math.PI,
//     E:   Math.E,
   
// };


const operations = {
    add:        '+',
    subtract:   '-',
    multiply:   'x',
    divide:     ':',
    mod:        'mod',
    power:      '^',
    factorial:  '!',
    percent:    '%',
    root:       '√(',
    PI:  'π',
    E:  'e',
    'paren-open':'(',
    'paren-close':')',
    'dot': '.', 
    cos: 'cos(',
    log: 'log(',
    sin: 'sin(',
    tan: 'tan('
};

var machineReadable = function(str){
    return str.replace(/(π)/g, 'pi()')
            .replace(/(e)/g, 'e()')
            .replace(/x/g,'*')
            .replace(/%/g, '/100')
            .replace(/:/g,'\/')
            .replace(/(mod)/g, '%')
            .replace(/(√)/g,'sqrt');
}


var onInputBlock = document.querySelector('.current-op');

var calculatorBlock = document.querySelector('.calculator');

var inputForCalc = onInputBlock.textContent || '';
var Ans = 0;
var clearFlag = false;
var radFlag = false;


function insertAtCaret(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value =
        input.value.slice(0, start) +
        text +
        input.value.slice(end);

    const newPos = start + text.length;
    input.setSelectionRange(newPos, newPos);
}

document.addEventListener('mousedown',(e)=>{
    e.stopPropagation();
    onInputBlock.focus();
})

calculatorBlock.addEventListener('click', (e)=>{
    e.stopPropagation();

    if (clearFlag){
        onInputBlock.value = '';
        inputForCalc = '';
        clearFlag = false;
    }

    var key = e.target; 

    if (key.classList.contains('number')){
        insertAtCaret(onInputBlock, key.textContent);

    } else if (key.classList.contains('operator')){
        var keyOp = key.dataset.op;
        insertAtCaret(onInputBlock, operations[keyOp] || key.textContent);

    } else if (key.classList.contains('const')){
        var keyConst = key.dataset.const;
        insertAtCaret(onInputBlock, operations[keyConst]);
    }

    inputForCalc = onInputBlock.value;
});


var equalSign = document.querySelector('#equal');
equalSign.addEventListener('click', (e)=>{
         e.stopPropagation();
        var input = onInputBlock.value;
        const result = calculator(machineReadable(inputForCalc), Ans, radFlag);

        if (!isNaN(Number.parseFloat(result))){
            
            Ans = Number.parseFloat(result);
            updateHistories(saveData(input +' = ' +result));
        }

        onInputBlock.value = result;
        inputForCalc = '';
        clearFlag = true;
});

var ACSign = document.querySelector('#cancel-all');
ACSign.addEventListener('click',(e)=>{
    e.stopPropagation();
    Ans = 0;
    inputForCalc='';
    onInputBlock.value='';
});

var DESign = document.querySelector('#delete');
DESign.addEventListener('click', () => {
    onInputBlock.focus();
    document.execCommand('delete');
    inputForCalc = onInputBlock.value;
});

//keyboard support
const supportKeys = {
    'l':'log',
    's':'sin',
    'c':'cos',
    't':'tan',
    
    'a':'Ans',
    '/':'/',
    '+':'+',
    '*':'*',
    '-':'-',
    '(':'(',
    ')':')',
    '.':'.',
    'm':'%',
    
}

document.addEventListener('keydown', (e) => {
    if (clearFlag){
        onInputBlock.textContent='';
        clearFlag=false;
}
    if (e.key >= '0' && e.key <= '9') {
        onInputBlock.textContent += e.key;
        inputForCalc += e.key;
        return;
    }

    if (e.key === 'Enter') {
        var input = onInputBlock.value;
        
        const result = calculator(machineReadable(inputForCalc), Ans, radFlag);

        if (!isNaN(Number.parseFloat(result))){
            
            Ans = Number.parseFloat(result);
            updateHistories(saveData(input +' = ' +result));
        }

        onInputBlock.value = result;
        inputForCalc = '';
        clearFlag = true;
    }

    var key = e.key.toLowerCase();
    if (supportKeys[key]) {
        e.preventDefault();
        insertAtCaret(onInputBlock, supportKeys[key]);
        inputForCalc = onInputBlock.value;
    }


    if (e.key === 'Backspace'){
        e.preventDefault();
        onInputBlock.focus();
        document.execCommand('delete');
        inputForCalc = onInputBlock.value;
    }

    
});

var saveData = function(result){
    var histories = JSON.parse(localStorage.getItem('histories') || '[]');
    histories.push({
        'expression':   result
    });
    if (histories.length>4){
        histories.shift();
    }
    console.log(histories)
    localStorage.setItem('histories', JSON.stringify(histories));
    return histories;
}

var updateHistories = function(histories){
    var ul = document.querySelector('.entire-history');
    ul.innerHTML='';
    histories.forEach(expression => {
        var li = document.createElement('li');
        console.log(li);
        if (expression.expression.length > 30){
            var ex = expression.expression;
            ex = 'Result: '+ex.slice(ex.indexOf('=')+1, -1);
            li.textContent=ex;
        } else {
            li.textContent=expression.expression;
        }
        ul.appendChild(li);
    })
}

//can lam tiep phan displayhistories

var clockIcon = document.querySelector('.clock');
var ul = document.querySelector('.entire-history');
var historyBlock = document.querySelector('.history');

historyBlock.addEventListener('click',(e)=>{
    e.stopPropagation();
    clockIcon.classList.toggle('active');
    ul.classList.toggle('active');
    onInputBlock.classList.toggle('active');
    var histories = JSON.parse(localStorage.getItem('histories') || '[]');
    updateHistories(histories);
    
});

var changeBlock = document.querySelector('.changeable-text');
onInputBlock.addEventListener('click', (e)=>{
    e.stopPropagation();
    
})

var angleUnit = document.querySelector('#angle-unit');
angleUnit.addEventListener('click', (e)=>{
    e.stopPropagation();

    var rad = document.querySelector('.rad');
    var deg = document.querySelector('.deg');


    rad.classList.toggle('active');
    deg.classList.toggle('active');
    radFlag = rad.classList.contains('active');
    console.log(radFlag);


})