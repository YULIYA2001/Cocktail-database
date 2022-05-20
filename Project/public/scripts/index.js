const takeCocktailsPromise = new Promise(async (resolve) => {
    await database.ref().child('cocktails/').once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                resolve(snapshot.val());
            } else {
                console.log('No data available');
            }
        }).catch((error) => {
            console.error(error);
        });
});

async function takeCocktailsFromDb() {
    return await takeCocktailsPromise.then((allCocktailsObject) => {
        // console.log(allCocktailsObject);

        let cocktailsList = [];
        for (let key in allCocktailsObject) {
            // console.log(allCocktailsObject[key]);
            cocktailsList.push(allCocktailsObject[key]);
        }
        return cocktailsList;
    });
}


showInfo();



async function showInfo() {
    if (localStorage.getItem('currentUser')) {
        showLinksForAuthentecated();
    } else {
        hideLinksForAuthentecated();
    }

    let catalog;
    if (localStorage.getItem('catalog')) {
        catalog = JSON.parse(localStorage.getItem('catalog'));
        let lastShowed = JSON.parse(localStorage.getItem('currentCocktail'));
        console.log(lastShowed);

        if (lastShowed != null) {
            console.log(lastShowed);
            
            for (cocktail of catalog) {
                if (cocktail.name == lastShowed.name) {
                    console.log(cocktail);
                    catalog[catalog.indexOf(cocktail)] = lastShowed;
                    localStorage.setItem('catalog', JSON.stringify(catalog));
                    break;
                }
            }
        }

    } else {
        catalog = await takeCocktailsFromDb();
        localStorage.setItem('catalog', JSON.stringify(catalog));
    }
    console.dir(catalog);

    showCocktailsList('top-list', takeTopCocktailsList(catalog));
    showCocktailsList('catalog-list', catalog);
}


function showCocktailsList(divContainerId, cocktailsList) {
    let divContainer = document.getElementById(divContainerId.toString());

    divContainer.innerHTML = "";

    for (let cocktail of cocktailsList) {
        let node = document.createRange().createContextualFragment(cocktailCardHtml(cocktail, divContainerId));
        divContainer.appendChild(node);

        let ratingResultDiv = document.querySelector(
            `#${divContainerId}>div:last-child>.rating-result`
        );
        showRating(cocktail, ratingResultDiv);

        drawImg(cocktail.ingredients, divContainerId);
    }
}

function cocktailCardHtml(cocktail, divContainerId) {
    return `
    <div class="${divContainerId + '-item'}">
        <a href="show.html" title="Страничка коктейля" onclick='saveCocktail(${JSON.stringify(cocktail)})'>
            <p>${cocktail.name}</p>
            <div class="external-image-div">
                <img src="assets/images/glass.png" alt="Glass"><br>
                <div class="glass-image-div">
                </div>
            </div>
        </a>
        <div class="rating-result">
        </div>
    </div>`;
}



function showRating(cocktail, ratingDivNode) {
    for (let i = 0; i < 5; i++) {
        let starSpan = document.createElement("span");
        if (countAverageCocktailRating(cocktail) >= i + 0.5) {
            starSpan.classList.add("active");
        }
        ratingDivNode.appendChild(starSpan);
    }
    return ratingDivNode;
}



function countAverageCocktailRating(cocktail) {
    if (!('rating' in cocktail)) {
        return 0;
    }
    let stars = Object.values(cocktail.rating);
    if (stars.length == 0) {
        return 0;
    }
    return stars.reduce((a, b) => (a + b)) / stars.length;
}



function takeTopCocktailsList(cocktailsList) {
    let sorted = Object.assign([], cocktailsList);
    sorted.sort(
        (a, b) => countAverageCocktailRating(a) < countAverageCocktailRating(b) ? 1 : -1
    );
    return sorted.slice(0, 4);
}



function drawImg(ingredients, divContainerId) {
    let ingredientsCount = ingredients.length;

    let allVolumes = ingredients.reduce((volumeSum, ingr) => {
        volumeSum += +ingr.volume;
        return volumeSum;
    }, 0);

    let imageDiv = document.querySelector(`#${divContainerId}>div:last-child .glass-image-div`);

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



function showLinksForAuthentecated() {
    document.getElementById('a-signin').style.display = 'none';
    document.getElementById('a-register').style.display = 'none';
    document.getElementById('a-create').style.display = 'block';
    document.getElementById('a-signout').style.display = 'block';
}


function hideLinksForAuthentecated() {
    document.getElementById('a-signin').style.display = 'block';
    document.getElementById('a-register').style.display = 'block';
    document.getElementById('a-create').style.display = 'none';
    document.getElementById('a-signout').style.display = 'none';
}




// a-signout listener
let signoutLink = document.getElementById('a-signout');

signoutLink.addEventListener('click', () => {
    Authentication.signout();
})



function saveCocktail(cocktail) {
    localStorage.setItem('currentCocktail', JSON.stringify(cocktail));
}



async function searchCoffee() {
    let input = document.getElementById("input-search");
    let searchName = input.value.trim().toLowerCase();
    input.value = "";
    if (searchName.trim() == "") {
        return;
    }

    let cocktailsList = (await database.ref('cocktails/').once('value')).val();
    console.dir(cocktailsList);

    for (let name in cocktailsList) {
        let existedName = name.toLowerCase()
        if (existedName.includes(searchName) || searchName.includes(existedName)) {
            saveCocktail(cocktailsList[name]);
            window.location.href = 'show.html';
            return;
        }
    }
    alert("Коктейль не найден");
}
