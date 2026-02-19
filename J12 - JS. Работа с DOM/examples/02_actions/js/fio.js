// не сработает и вызовет ошибку
/*given_name.onchange = () => {
    console.log("given_name changed")
}*/


document.addEventListener('DOMContentLoaded', () => {
    let givenNameInput = document.getElementById("given_name");
    let familyNameInput  = document.getElementById("family_name");
    let fullNameInput  = document.getElementById("full_name");

    function getFullName(givenName, familyName) {
        return givenName + ' ' + familyName;
    }

    function fillFullNameInput() {
        fullNameInput.value = getFullName(
            givenNameInput.value, 
            familyNameInput.value
        );
        console.log("name changed");
    }

    givenNameInput.addEventListener('input', fillFullNameInput);
    familyNameInput.addEventListener('change', fillFullNameInput);
});