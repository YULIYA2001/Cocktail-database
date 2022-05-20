async function register() {
    // get input fields
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const password2 = document.getElementsByName('password2')[0].value;
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // validate input fields
    if (validatePassword(password, password2) == false) {
        return;
    }

    console.log(email, password, gender);

    authentication.register(email, password, gender); 
}




function validatePassword(password, password2) {
    if (password != password2) {
        alert('Пароли не совпадают');
        // очистить и убрать фокус
        document.getElementsByName('password2')[0].value = '';
        document.getElementsByName('password2')[0].blur();
        return false;
    }
    if (password.length < 8) {
        alert('Длина пароля не менее 8 символов');
        return false;
    }
    return true;
}