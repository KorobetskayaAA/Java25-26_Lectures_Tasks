document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            validate(form);
            if (form.checkValidity()) {
                submitRegistrationForm(form);
            }
            form.classList.add('was-validated');
        });
        form.addEventListener('change', () => {
            form.classList.remove('was-validated');
        });
    });

    function validate(form) {
        let usernameInput = form.querySelector("#username_input");
        // Устанавливает сообщение об ошибке
        // Только пустая строка воспринимается как отсутствие ошибки
        usernameInput.setCustomValidity(isValidUsername(usernameInput) 
            ? "" 
            : "Неверное имя пользователя!"
        );

        let passwordInput = form.querySelector("#password_input");
        passwordInput.setCustomValidity(isValidPassword(passwordInput)
            ? ""
            : passwordInput.setCustomValidity("Неверный пароль!")
        );

        let passwordConformInput = form.querySelector("#password_conform_input");
        passwordConformInput.setCustomValidity(
            passwordInput.value == passwordConformInput.value
            ? ""
            : "Пароли не совпадают!"
        );

        function isValidUsername(input) {
            let username = input.value;
            const usernamePattern = /^[a-zA-Z0-9_]{5,}$/;
            return username.match(usernamePattern) != null;
        }

        function isValidPassword(input) {
            let password = input.value;
            const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
            return password.match(passwordPattern) != null;
        }
    }

    async function submitRegistrationForm(form) {
        const submitResultAlert = form.querySelector('.submit-result[role="alert"]');
        startSubmitting(form, submitResultAlert);
        try {
            await postRegistrationForm(form);
            showSubmittingResult(submitResultAlert,
                true,
                "Регистрация успешно пройдена!");
        }
        catch (err) {
            console.error(err);
            showSubmittingResult(submitResultAlert,
                false,
                "При попытке регистрации произошла ошибка!");
        }
        finally {
            finishSubmitting(form, submitResultAlert);
        }
    }

    async function postRegistrationForm(form) {
        const urlPost = 
                'https://fakeapi.extendsclass.com/peoples';
        let registerData = new FormData(form);
        // добавим к данным формы дату и время заполнения
        registerData.append("created", (new Date()).toISOString());
        // для тестов
        for (let [key, value] of registerData.entries()) {
            console.log({key, value});
        }
        let response = await fetch(urlPost, {
                method: 'POST',
                body: registerData
            });
        if (response.ok) {
            let result = await response.json();
            console.log(result);
        }
        else {
            throw Error("Failed to post form: " + response.text);
        }
    }

    function startSubmitting(form, alert) {
        form.enabled = false;
        alert.classList.add('d-none');
        alert.classList.remove('alert-success');
        alert.classList.remove('alert-danger');
    }

    function finishSubmitting(form, alert) {
        form.enabled = true;
        alert.classList.remove('d-none');
    }

    function showSubmittingResult(alert, success, message) {
        alert.innerText = message;
        alert.classList.add(success 
            ? 'alert-success' 
            : 'alert-danger'
        );
    }
});
