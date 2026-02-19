document.addEventListener('DOMContentLoaded', () => {
    let op1Input = document.getElementById("arithmeticOperand1");
    let op2Input  = document.getElementById("arithmeticOperand2");
    let resultInput  = document.getElementById("arithmeticResult");

    let buttons = document.getElementsByClassName('arithmetic-button');
    console.log(buttons);

    for (let i in buttons) {
        let btn = buttons[i];
        btn.addEventListener('click', () => {
            let op1 = +op1Input.value;
            let op2 = +op2Input.value;
            let result;
            switch (btn.value) {
                case "+": result = op1 + op2; break;
                case "-": result = op1 - op2; break;
                case "*": result = op1 * op2; break;
                case "/": result = op1 / op2; break;
            }
            resultInput.value = result;
            return result;
        });
    }
});