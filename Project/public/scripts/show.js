let cocktail = takeCocktailInfoFromLocalStorage();
showCocktail(cocktail);



function takeCocktailInfoFromLocalStorage() {
    return JSON.parse(localStorage.getItem('currentCocktail'));
}



function showCocktail(cocktail) {
    let descriptionRight = document.querySelector('.description-right');

    document.querySelector('.name').textContent = cocktail.name;
    document.querySelector('.name').setAttribute('title', cocktail.name);
    document.querySelector('.volume-value').textContent = cocktail.volume + ' ml';
    document.querySelector('#description-textarea').textContent = cocktail.description;
    document.querySelector('#author-p').textContent = 'Автор: ' + cocktail.author.email;

    showIngredients(cocktail);
    drawImg(cocktail.ingredients);
    showComments(cocktail);
    showRating(cocktail);
}



async function showRating(cocktail) {
    const userInfo = localStorage.getItem('currentUser');
    if (!userInfo) {
        return;
    }
    let userId = userInfo.split('###')[0];

    if (cocktail.hasOwnProperty('rating')) {
        if (userId in cocktail.rating) {
            let input = document.getElementsByName('rating');
            input[5 - cocktail.rating[userId]].checked = true;
        }
    }
}



async function addRating(inputField) {
    const userInfo = localStorage.getItem('currentUser');
    if (!userInfo) {
        alert('Войдите/зарегестрируйтесь для оценки коктейля.');
        return;
    }
    let userId = userInfo.split('###')[0];

    let stars = inputField.value;
    await database.ref(`cocktails/${cocktail.name}/rating/${userId}`).set(+stars);

    if (!cocktail.rating) {
        cocktail.rating = [];
    }
    cocktail.rating[userId] = +stars;
    let cocktailDb = (await database.ref('cocktails/'+ cocktail.name).once('value')).val();
    updateLocalStorage(cocktailDb);
    alert('Спасибо за оценку')

    console.log('show all rating')
    console.dir(Object.values(cocktailDb.rating))
}



function showComments(cocktail) {
    if (cocktail.hasOwnProperty('comments')) {
        let commentsList = document.querySelector('.comments-list');
        commentsList.innerHTML = "";
        if (cocktail.hasOwnProperty('comments')) {
            // console.log('show all comments')
            // console.dir(Object.values(cocktail.comments))
            for (let comment of Object.values(cocktail.comments)) {
                let node = document.createRange().createContextualFragment(commentHtml(comment));
                commentsList.appendChild(node);
            }
        }
    }
}

function commentHtml(comment) {
    // console.dir(comment);
    return `
    <article class="comment-article" 
        style="background-color:${comment.author.gender == 'male' ? 'rgb(215, 177, 133)' : 'rgb(253, 207, 150)'};
        border-color: ${comment.author.gender == 'male' ? 'rgb(113, 66, 13)' : 'rgb(255, 162, 41)'}">
        <li>
            <p>${comment.content}</p><br>
            <div>
                <time>${comment.date}</time>
                <p class="mail">${comment.author.email}</p>
            </div>
        </li>
    </article>`;
}



function showIngredients(cocktail) {
    if (cocktail.hasOwnProperty('ingredients')) {
        let ingredientsList = document.querySelector('.ingredients-list');
        ingredientsList.innerHTML = "";
        for (let ingredient of Object.values(cocktail.ingredients)) {
            let node = document.createRange().createContextualFragment(ingredientHtml(ingredient));
            ingredientsList.appendChild(node);
        }
    }
}

function ingredientHtml(ingredient) {
    return `
    <li>
        <span class="ingredient-name">${ingredient.name.split('-')[1]}</span>
        <span class="ingredient-count">${ingredient.volume + '%'}</span>
    </li>`;
}



function drawImg(ingredients) {
    let ingredientsCount = ingredients.length;

    let allVolumes = ingredients.reduce((volumeSum, ingr) => {
        volumeSum += +ingr.volume;
        return volumeSum;
    }, 0);

    let imageDiv = document.querySelector('.glass-image-div');
    for (let i = ingredientsCount - 1; i >= 0; i--) {
        let volume = ingredients[i].volume;
        let ingredientDiv = document.createElement("div");

        ingredientDiv.classList.add('ingredient-picture');
        ingredientDiv.classList.add(ingredients[i].name.split('-')[0]);
        ingredientDiv.setAttribute('style', ingredientStyle(100 - allVolumes | 0));
        allVolumes -= volume;
        imageDiv.appendChild(ingredientDiv);
    }
}



function ingredientStyle(value) {
    return `clip-path: polygon(0% ${value}%, 100% ${value}%, 100% 100%, 0% 100%);
    -webkit-clip-path: polygon(0% ${value}%, 100% ${value}%, 100% 100%, 0% 100%);`;
}



async function sendComment() {
    const userInfo = localStorage.getItem('currentUser');
    if (!userInfo) {
        alert('Войдите/зарегестрируйтесь для отправки комментария.');
        return;
    }
    let user = {
        email: userInfo.split('###')[1],
        gender: userInfo.split('###')[2]
    }

    let commentTextarea = document.getElementById('comment-textarea');
    let commentContent = commentTextarea.value;

    if (commentContent.trim() == '') {
        alert('Нельзя оставить пустой комментарий.');
        return;
    }

    commentTextarea.value = '';
    let comment = new Comment(commentContent, user);

    if (!cocktail.comments) {
        cocktail.comments = [];
    }
    // console.log('try push')
    // console.dir(cocktail.comments)

    let pushed = await database.ref().child('cocktails/' + cocktail.name + '/comments').push(comment);
    let lastCommentId = pushed.getKey();

    let cocktailDb = (await database.ref('cocktails/'+ cocktail.name).once('value')).val();
    //cocktailDb.comments[lastCommentId] = comment;
    console.log('1-' + cocktailDb)
    updateLocalStorage(cocktailDb);
    showComments(cocktailDb);

    console.log('comment ' + comment + ' added');
    alert('Комментарий добавлен');
}



function updateLocalStorage(cocktailDb) {
    localStorage.setItem('currentCocktail', JSON.stringify(cocktailDb));
    console.dir(cocktailDb);
}