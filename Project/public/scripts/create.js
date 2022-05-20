rangeChange();
showSelects();



function showSelects() {
    let selectsList = document.querySelector('.div-composition');
    selectsList.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        let node = document.createRange().createContextualFragment(selectHtml(i));
        selectsList.appendChild(node);
    }
}



function selectHtml(i) {
    return `
    <div class="composition-ingredients" id="ingredient-${i}">
        <select class="ingredients-select" onchange="redrawImg();">
            <option value="choose" selected disabled>Выбрать</option>
            <option value="water-Вода">Вода</option>
            <option value="milk-Молоко">Молоко</option>
            <option value="cream-Сливки">Сливки</option>
            <option value="yogurt-Йогурт">Йогурт</option>
            <optgroup label="Пюре">
                <option value="orange-Апельсин">Апельсин</option>
                <option value="watermelon-Арбуз">Арбуз</option>
                <option value="banana-Банан">Банан</option>
                <option value="strawberry-Клубника">Клубника</option>
                <option value="peach-Персик">Персик</option>
                <option value="apple-Яблоко">Яблоко</option>
            </optgroup>
            <optgroup label="Добавки">
                <option value="sugar-Сахар">Сахар</option>
                <option value="honey-Мед">Мед</option>
            </optgroup>
        </select>
        <label id="persent-label">%</label>
        <input type="number" id="ingredient-volume" name="ingredient-volume" min="0" max="500" step="5"
            value="0" oninput="redrawImg();">
    </div>
    `;
}



async function createCocktail() {
    let name = document.querySelector('#name-input').value;
    let description = document.querySelector('#description-textarea').value;
    let volume = document.querySelector('#overall-volume-range').value;
    const currentUser = localStorage.getItem('currentUser').split('###');
    let author = {
        email: currentUser[1],
        gender: currentUser[2]
    }

    if (!validateTextFieldValue(name) || !validateTextFieldValue(description)) {
        return;
    }

    const notEmptyIngredients = validateIngredients(takeIngredients());
    if (!notEmptyIngredients) {
        return;
    } else if (notEmptyIngredients == '!empty!') {
        alert('Выберите хотя бы 1 ингредиент');
        return;
    }

    let cocktail = new Cocktail(name.trim(), notEmptyIngredients, description, volume, author);
    console.dir(cocktail);

    const databaseRef = database.ref();

    // take cocktails list from db
    // let cocktailsList = await databaseRef.child('cocktails/').get()
    //     .then((snapshot) => {
    //         if (snapshot.exists()) {
    //             return snapshot.val();
    //         } else {
    //             console.log("No data available");
    //         }
    //     }).catch((error) => {
    //         console.error(error);
    //         isEmpty = true;
    //     });
    let cocktailsList = JSON.parse(localStorage.getItem('catalog'));

    console.log(Object.keys(cocktailsList));

    for (let name of Object.keys(cocktailsList)) {
        if (cocktail.name == name) {
            alert('Название коктейля уже существует. Введите уникальное.');
            return false;
        }
    }


    await databaseRef.child('cocktails/' + cocktail.name).set(cocktail);
    alert('Создан коктейль ' + cocktail.name);
    cocktailsList = await databaseRef.child('cocktails/').get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                // return snapshot.val();
                let allCocktailsObject = snapshot.val();
                let cocktailsList = [];
                for (let key in allCocktailsObject) {
                    cocktailsList.push(allCocktailsObject[key]);
                }
                return cocktailsList;
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
            isEmpty = true;
        });
    localStorage.setItem('catalog', JSON.stringify(cocktailsList));

    window.location.href = 'index.html';
}



function validateTextFieldValue(field) {
    if (field.trim() == '') {
        alert("Не заполнено поле название/описание. Заполните все поля ввода");
        return false;
    }
    return true;
}



function takeIngredients() {
    let ingredients = [];

    for (let i = 1; i <= 6; i++) {
        // save select, label, input-number
        let ingredientDivChildren = document.querySelector('#ingredient-' + i).children;
        let name = ingredientDivChildren[0].options[ingredientDivChildren[0].selectedIndex].value;
        let volume = ingredientDivChildren[2].value;
        ingredients.push(new Ingredient(name, +volume));
    }

    return ingredients;
}



function validateIngredients(ingredients) {
    let fullIngredients = [];

    ingredients.forEach(ingr => {
        if (ingr.name != 'choose' && ingr.volume != 0) {
            fullIngredients.push(ingr);
        }
    });

    if (fullIngredients.length === 0) {
        // alert('Выберите хотя бы 1 ингредиент');
        return '!empty!';
    }

    // объединение одинаковых ингредиентов
    fullIngredients = fullIngredients.reduce((ingrediensUnique, ingr) => {
        let ingredient = ingrediensUnique.find(uingr => uingr.name == ingr.name);

        if (!ingredient) {
            ingrediensUnique.push(ingr);
        } else {
            let index = ingrediensUnique.indexOf(ingredient);
            ingrediensUnique[index].volume += ingr.volume;
        }
        return ingrediensUnique;
    }, []);

    // округление значений до целых
    for (let ingr of fullIngredients) {
        if (!Number.isInteger(ingr.volume)) {
            alert('Введите целое число. Нецелое значение объема ингредиента округляется по правилам математики');
            break;
        }
    };
    fullIngredients.forEach(ingr => {
        ingr.volume = Math.round(ingr.volume);
    });

    // проверка превышения 100% ингредиентов
    const allVolume = fullIngredients.reduce((volumeSum, ingr) => {
        volumeSum += +ingr.volume;
        return volumeSum;
    }, 0);

    if (allVolume > 100) {
        alert('Сумма ингредиентов не более 100%');
        return null;
    }

    return fullIngredients;
}



function rangeChange() {
    let volume = document.querySelector('#overall-volume-range').value;
    document.querySelector('#volume-value').innerText = volume + ' ml'
}



function redrawImg() {
    let ingredientDivs = document.getElementsByClassName('ingredient-picture');
    while (ingredientDivs.length != 0) {
        ingredientDivs[0].parentNode.removeChild(ingredientDivs[0]);
    }

    const notEmptyIngredients = validateIngredients(takeIngredients());
    if (!notEmptyIngredients) {
        return;
    }
    else if (notEmptyIngredients == '!empty!') {
        return;
    }

    let ingredientsCount = notEmptyIngredients.length;

    let allVolumes = notEmptyIngredients.reduce((volumeSum, ingr) => {
        volumeSum += +ingr.volume;
        return volumeSum;
    }, 0);

    let imageDiv = document.querySelector('.glass-image-div');
    for (let i = ingredientsCount - 1; i >= 0; i--) {
        let volume = notEmptyIngredients[i].volume;
        let ingredientDiv = document.createElement("div");

        ingredientDiv.classList.add('ingredient-picture');
        ingredientDiv.classList.add(notEmptyIngredients[i].name.split('-')[0]);
        ingredientDiv.setAttribute('style', ingredientStyle(100 - allVolumes | 0));
        allVolumes -= volume;
        imageDiv.appendChild(ingredientDiv);
    }
}



function ingredientStyle(value) {
    return `clip-path: polygon(0% ${value}%, 100% ${value}%, 100% 100%, 0% 100%);
    -webkit-clip-path: polygon(0% ${value}%, 100% ${value}%, 100% 100%, 0% 100%);`;
}





