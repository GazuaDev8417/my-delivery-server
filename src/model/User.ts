
export class User{
    private id:string
    private username:string
    private email:string
    private phone:string
    private password:string

    constructor(
        id:string,
        username:string,
        email:string,
        phone:string,
        password:string
    ){
        this.id = id.trim(),
        this.username = username.trim(),
        this.email = email.trim(),
        this.phone = phone.trim(),
        this.password = password.trim()
    }

    public getId(): string { return this.id }
    public getUsername(): string { return this.username }
    public getEmail(): string { return this.email }
    public getPhone(): string { return this.phone }
    public getPassword(): string { return this.password }
}


export default User