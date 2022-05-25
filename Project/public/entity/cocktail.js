class Cocktail {
    constructor(name, ingredients, description, volume, author) {
        this.name = name;
        this.rating = [];
        this.ingredients = ingredients;
        this.description = description;
        this.volume = volume;
        this.author = author;
        this.comments = [];
    }

    // for test data without firebase
    copy(cocktail) {
        let c = new Cocktail();
        c.name = cocktail.name;
        c.rating = []
        c.ingredients = cocktail.ingredients;
        c.description = cocktail.description;
        c.volume = cocktail.volume;
        c.author = cocktail.author;
        c.comments = cocktail.comments;
        return c;
    }
}