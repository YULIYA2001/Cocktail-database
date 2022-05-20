class Authentication {
    setCurrentUser(currentUser, gender) {
        // if (localStorage.getItem('userId')) {
        //     localStorage.clear('userId');
        // }
        localStorage.setItem('currentUser', currentUser.uid + '###' + currentUser.email + '###' + gender);
    }

    async signin(email, password) {
        await auth.signInWithEmailAndPassword(email, password)
            .then(async () => {
                const user = auth.currentUser;

                const databaseRef = database.ref();
                const userData = {
                    lastLogin: new Date()
                }

                await databaseRef.child('users/' + user.uid).update(userData);
                alert('Авторизован пользователь ' + user.email);

                // take gender from db
                const gender = await databaseRef.child('users/' + user.uid + '/gender').get()
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            return snapshot.val();
                        } else {
                            console.log('No data available');
                        }
                    }).catch((error) => {
                        console.error(error);
                    });

                this.setCurrentUser(user, gender);

                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert('Неверный e-mail адрес или пароль');
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
            });
    }

    async register(email, password, gender) {
        await auth.createUserWithEmailAndPassword(email, password)
            .then(async () => {
                const user = auth.currentUser;
                const databaseRef = database.ref();
                const userData = new User(email, gender, Date.now());

                await databaseRef.child('users/' + user.uid).set(userData);
                alert('Создан пользователь ' + user.email);
                this.setCurrentUser(user, gender);

                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert('Неверный или несуществующий e-mail.');
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
            });
    }

    static async signout() {
        await auth.signOut()
            .then(() => {
                const email = localStorage.getItem('currentUser').split('###')[1];
                alert('Пользователь вышел ' + email);
                localStorage.clear('currentUser');

                window.location.href = 'index.html';
            });
    }
}


const authentication = new Authentication();