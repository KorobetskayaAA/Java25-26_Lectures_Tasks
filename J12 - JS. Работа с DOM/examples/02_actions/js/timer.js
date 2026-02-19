document.addEventListener('DOMContentLoaded', () => {
    let goalInput = document.querySelector('#form_timer input[name="goal"]');
    let timeLeftElement  = document.querySelector('#form_timer *[name="time-left"]');
    let startButton  = document.querySelector('#form_timer [name="start"]');
    let stopButton  = document.querySelector('#form_timer [name="stop"]');

    startButton.addEventListener('click', () => {
        toggleTimer(true);
    });

    stopButton.addEventListener('click', () => {
        toggleTimer(false);
    });

    let timerId;
    let toggleTimer = (enabled) => {
        if (enabled === undefined) {
            enabled = !timerId;
        }
        startButton.disabled = enabled;
        stopButton.disabled = !enabled;

        const clearTimer = () => {
            clearInterval(timerId);
            timerId = null;
            timeLeftElement.innerText = "00:00:00";
        }
        const getGoalDate = (h, m, s) => {
            let goal = new Date();
            goal.setHours(goal.getHours() + h);
            goal.setMinutes(goal.getMinutes() + m);
            goal.setSeconds(goal.getSeconds() + s);
            return goal;
        }
        
        if (enabled) {
            let [h, m, s] = goalInput.value.split(':').map(x => parseInt(x));
            let goal = getGoalDate(h, m, s);
            const timerHandler = () => {
                let now = new Date();
                if (goal <= now) {
                    clearTimer();
                    toggleTimer(false);
                    return;
                }
                let diff = new Date(goal - now);
                console.log(diff);
                timeLeftElement.innerText = diff.toISOString().slice(11, 19);
            };

            timerHandler();

            timerId = setInterval(timerHandler, 1000);
        }
        else {
            clearTimer();
        }
    }
});