class Comment {
    constructor(content, author) {
        this.content = content,
        this.date = new Date().toISOString().slice(0, 10),
        this.author = {
            email: author.email,
            gender: author.gender
        }
    }
}