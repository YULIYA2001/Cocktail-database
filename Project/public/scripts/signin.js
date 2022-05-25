async function signin() {

    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    console.log(email, password);

    authentication.signin(email, password);
}