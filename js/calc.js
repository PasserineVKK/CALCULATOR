/**
 * Hàm Token Hóa chuỗi biểu thức.
 * @param {string} expression - Chuỗi biểu thức toán học.
 * @returns {Array<string>} Mảng các token.
 */
function tokenize(expression, ans) {
    // 1. Loại bỏ khoảng trắng và chuẩn hóa ký hiệu (vd: thay 'x' bằng '*')
    const normalizedExpression = expression
        .replace(/\s/g, '')
        .replace(/x/g, '*')
        .replace(/:/g, '/')
        .replace(/(\d)([a-zA-Z])/g, '$1*$2')
        .replace(/(Ans)/g, Number.parseFloat(ans));
    // Regex để tìm kiếm các loại token:
    // - Số (có thể là số thập phân)
    // - Hàm (sin, cos, log, etc. theo sau là dấu ngoặc mở)
    // - Toán tử 1 ngôi (vd: !)
    // - Toán tử 2 ngôi (+, -, *, /, ^, (, ))
    const regex = /(\d+\.?\d*)|([a-z]+(?=\())|([!])|[%+\-*\/^()]/g;
    
    // 2. Trích xuất các token

    var match;
    var tokens = [];

    while ((match = regex.exec(normalizedExpression)) !== null){
        tokens.push(match[0]);
    }
    

    // 3. Xử lý dấu trừ một ngôi (Unary Minus)
    // Phải xử lý đặc biệt vì '-' có thể là phép trừ hoặc dấu âm.
     // Nếu nó đứng đầu biểu thức, hoặc theo sau một toán tử/dấu ngoặc mở,
    // thì nó là dấu trừ một ngôi (đánh dấu bằng 'u-')
    for (let i=0;i<tokens.length;i++){
        if (tokens[i] === '-' ){
            if (i===0 || ('(+-*/'.includes(tokens[i-1])) || /(^[a-z]+$)/.test(tokens[i-1]) ){
                tokens[i] = 'u-';
            }
        }
    }

    return tokens;

    
}
//40335.5
// Ví dụ đầu vào: 5x3+(2:9log(10)).sin(30)+8!
const expression = "5*(3%2)+sin(pi())+8!"; 
const tokens = tokenize(expression);

console.log("--- BƯỚC 1: TOKEN HÓA ---");
console.log(`Input: ${expression}`);
console.log(`Output Tokens: [${tokens.join(', ')}]`);

// Cấu hình độ ưu tiên (Precedence)
const precedence = {
    '!': 4,   // Giai thừa (Cao nhất)
    '^': 3,   // Lũy thừa
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1,
    'u-': 1,  // Unary Minus có thể coi là ưu tiên thấp để xử lý trễ
    'sin': 5, // Hàm có ưu tiên cao hơn toán tử
    'cos': 5,
    'log': 5,
    'tan': 5,
};

const operators = new Set(['+', '-', '*', '/', '^', 'u-','%']);

const leftAssoc = new Set(['+', '-', '*', '/','%']);

/**
 * Hàm kiểm tra nếu token là một hàm (sin, log, etc.).
 */
function isFunction(token) {
    return /^[a-z]+$/.test(token);
}

/**
 * Thuật toán Shunting-Yard: Chuyển token Trung tố sang Hậu tố (RPN).
 * @param {Array<string>} tokens - Mảng token Trung tố.
 * @returns {Array<string>} Mảng token Hậu tố (RPN).
 */
function shuntingYard(tokens) {
    const outputQueue = []; // Hàng đợi Đầu ra (Kết quả RPN)
    const operatorStack = []; // Ngăn xếp Toán tử

    //1. Nếu token là số, cho token vào Q
    //2. Else Nếu token là hàm, cho token vào S
    //3. Else Nếu token là (, cho token vào S
    //4. Else Nếu token là ), đẩy dần dần S vào Q cho đến khi gặp ngoặc mở thì dừng lại, không nhận ngoặc
    //5. Else Trong S, có hàm ở bên trái ngoặc mở thì lấy hàm đó từ S và Q
    //6. Else Nếu là toán tử, xét toán tử top stack, đẩy cái có độ ưu tiên cao hơn vào Q
    //7. Khi kết thúc, mở while đẩy hết những gì sót lại trong S vào Q
    for (var token of tokens){
        if (!isNaN(Number.parseFloat(token)) || token === 'pi' || token === 'e' ){
            if (token === 'pi'){
                outputQueue.push(Math.PI);
            } else if (token === 'e'){
                outputQueue.push(Math.E);
            } else {
                outputQueue.push(Number.parseFloat(token) );
            }

        } else if (token === '!') {
            // postfix operator → push thẳng output
            outputQueue.push('!');
        }
        else if (isFunction(token)){
            operatorStack.push(token);

        } else if (token === '('){
            operatorStack.push(token);

        } else if (token === ')'){
            while (operatorStack.length > 0 && operatorStack[operatorStack.length-1] !== '(' ){
                outputQueue.push(operatorStack[operatorStack.length-1]);
                operatorStack.pop();
            }

            operatorStack.pop();
            if (operatorStack.length > 0 && isFunction(operatorStack.at(-1))) {
                 outputQueue.push(operatorStack.pop());
            }
        } else if (operators.has(token)) {
            while (
                operatorStack.length > 0 &&
                operators.has(operatorStack.at(-1)) &&
                (
                    (leftAssoc.has(token) &&
                    precedence[token] <= precedence[operatorStack.at(-1)]) ||
                    (!leftAssoc.has(token) &&
                    precedence[token] < precedence[operatorStack.at(-1)])
                )
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }

    }
    
    while (operatorStack.length>0){
        outputQueue.push(operatorStack[operatorStack.length-1]);
        operatorStack.pop();
        
    }

    return outputQueue;
}

const postfixTokens = shuntingYard(tokens);

console.log("\n--- BƯỚC 2: CHUYỂN SANG HẬU TỐ (RPN) ---");
console.log(`Input Tokens: [${tokens.join(', ')}]`);
console.log(`Output RPN: [${postfixTokens.join(', ')}]`);

/**
 * Hàm đánh giá biểu thức Hậu tố (RPN).
 * @param {Array<string>} postfixTokens - Mảng token Hậu tố.
 * @returns {number} Kết quả tính toán.
 */
function evaluatePostfix(postfixTokens) {
    const valueStack = []; // Ngăn xếp để lưu trữ giá trị số

    for (const token of postfixTokens) {
        if (!isNaN(parseFloat(token))) {
            // 1. Nếu là Toán hạng (Số): Đẩy giá trị số vào Stack.
            valueStack.push(parseFloat(token));
        } else {
            // 2. Nếu là Toán tử/Hàm: Thực hiện phép tính.
            
            // Xử lý Toán tử một ngôi (Unary: !, u-, sin, cos, log, tan)
            if (token === '!' || token === 'u-' || isFunction(token)) {
                if (valueStack.length < 1) throw new Error("Lỗi: Thiếu toán hạng cho toán tử một ngôi.");
                const operand = valueStack.pop();
                let result;

                switch (token) {
                    case 'u-':
                        result = -operand;
                        break;
                    case '!':
                        // Giai thừa (Chỉ hỗ trợ số nguyên không âm)
                        if (operand < 0 || !Number.isInteger(operand)) throw new Error("Lỗi: Giai thừa chỉ áp dụng cho số nguyên không âm.");
                        result = (function factorial(n) {
                            return (n <= 1) ? 1 : n * factorial(n - 1);
                        })(operand);
                        break;
                    case 'sin':
                        // Chuyển độ sang radian
                        result = Math.sin(operand * Math.PI / 180); 
                        break;
                    case 'cos':
                        result = Math.cos(operand * Math.PI / 180);
                        break;
                    case 'tan':
                        result = Math.tan(operand * Math.PI / 180);
                        break;
                    case 'log':
                        result = Math.log10(operand); // Log cơ số 10
                        break;
                    case 'sqrt':
                        result = Math.pow(operand, 1/2);
                        break;
                    default:
                        throw new Error(`Lỗi: Toán tử/Hàm không xác định: ${token}`);
                }
                valueStack.push(result);

            } else { 
                // Xử lý Toán tử hai ngôi (Binary: +, -, *, /, ^)
                if (valueStack.length < 2) throw new Error("Lỗi: Thiếu toán hạng cho toán tử hai ngôi.");
                // Lấy toán hạng theo thứ tự: B (toán hạng 2) và A (toán hạng 1)
                const operandB = valueStack.pop(); 
                const operandA = valueStack.pop();
                let result;

                switch (token) {
                    case '+':
                        result = operandA + operandB;
                        break;
                    case '-':
                        result = operandA - operandB;
                        break;
                    case '*':
                        result = operandA * operandB;
                        break;
                    case '/':
                        if (operandB === 0) throw new Error("Lỗi: Chia cho 0.");
                        result = operandA / operandB;
                        break;
                    case '^':
                        result = Math.pow(operandA, operandB);
                        break;
                    case '%':
                        result = operandA % operandB;
                        break;
                }
                valueStack.push(result);
            }
        }
    }

    // Kết quả cuối cùng là phần tử duy nhất còn lại trong stack
    if (valueStack.length !== 1) {
        throw new Error("Lỗi: Biểu thức không hợp lệ (Số toán tử/toán hạng không khớp).");
    }

    return valueStack[0];
}

const finalResult = evaluatePostfix(postfixTokens);

console.log("\n--- BƯỚC 3: ĐÁNH GIÁ HẬU TỐ ---");
console.log(`RPN Input: [${postfixTokens.join(', ')}]`);
console.log(`Kết quả cuối cùng: ${finalResult}`);

export function calculator(input, ans){
    try {
        return evaluatePostfix(shuntingYard(tokenize(input, ans)));
    } catch (err) {
        return "ERROR!";
    }
}