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
    multiply:   '*',
    divide:     '/',
    mod:        '%',
    power:      '^',
    factorial:  '!',
    percent:    '/100',
    root:       'sqrt',
    PI:  'pi()',
    E:  'e()',
    'paren-open':'(',
    'paren-close':')',
    'dot': '.', 
    // cos: 'cos(',
    // log: 'log(',
    // sin: 'sin(',
    // tan: 'tan('
};



var onInputBlock = document.querySelector('.current-op');
var previousOpBlock = document.querySelector('.previous-op');
var calculatorBlock = document.querySelector('.calculator');

var inputForCalc = onInputBlock.textContent || '';
var Ans = 0;
var clearFlag = false;


calculatorBlock.addEventListener('click', (e)=>{
    e.stopPropagation();

    var key = e.target; 
    
    if (key.classList.contains('number') ){
        onInputBlock.textContent += key.textContent;
        inputForCalc+=key.textContent;
       
    } else if (key.classList.contains('operator')  ){
        var keyOp = key.dataset.op;
        onInputBlock.textContent += operations[keyOp] || key.textContent; 
        inputForCalc += operations[keyOp] || key.textContent;
    } else if (key.classList.contains('const')){
        var keyConst = key.dataset.const;
        onInputBlock.textContent += operations[keyConst] 
        inputForCalc += operations[keyConst]
    }
    console.log(inputForCalc)

});

var equalSign = document.querySelector('#equal');
equalSign.addEventListener('click', (e)=>{
    e.stopPropagation();
    
    var result = calculator(inputForCalc, Ans);
    
    if (!isNaN(Number.parseFloat(result))){
        Ans = Number.parseFloat(result);
        updateHistories(saveData(Number.parseFloat(result)));
    }
    onInputBlock.textContent = result;
    inputForCalc='';
    clearFlag = true;
});

var ACSign = document.querySelector('#cancel-all');
ACSign.addEventListener('click',(e)=>{
    e.stopPropagation();
    Ans = 0;
    inputForCalc='';
    onInputBlock.textContent='';
});

//keyboard support
const supportKeys = {
    'l':'log',
    's':'sin',
    'c':'cos',
    't':'tan',
    'e':'e()',
    'p':'pi()',
    'a':'Ans',
    '/':'/',
    '+':'+',
    '*':'*',
    '-':'-',
    '(':'(',
    ')':')',
    '.':'.',
    '%':'%',
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
        const result = calculator(inputForCalc, Ans);
        
        if (!isNaN(Number.parseFloat(result))){
            Ans = Number.parseFloat(result)
            updateHistories(saveData(Number.parseFloat(result)));
            
        };
        onInputBlock.textContent = result;
        inputForCalc = '';
        clearFlag = true;

    }
    var key = e.key.toLowerCase();
    if (supportKeys[key]){
         onInputBlock.textContent += supportKeys[key];
        inputForCalc += supportKeys[key];
    }

    if (e.key === 'Backspace'){
        e.preventDefault();
         onInputBlock.textContent = onInputBlock.textContent.slice(0, -1);
         inputForCalc = inputForCalc.slice(0, -1);
    }
});

var saveData = function(result){
    var histories = JSON.parse(localStorage.getItem('histories') || '[]');
    histories.push({
        'expression': onInputBlock.textContent + '=' + result
    });
    if (histories.length>4){
        histories.shift();
    }
    
    localStorage.setItem('histories', JSON.stringify(histories));
    return histories;
}

var updateHistories = function(histories){
    var ul = document.querySelector('.entire-history');
    ul.innerHTML='';
    histories.forEach(expression => {
        var li = document.createElement('li');
        console.log(li);
        li.textContent = expression.expression;
        ul.appendChild(li);
    })
}

//can lam tiep phan displayhistories