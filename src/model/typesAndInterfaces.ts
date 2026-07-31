export interface UserModel{
    id:string
    username:string
    email:string
    phone:string
    password:string
    street:string
    cep:string
    number:string 
    neighbourhood:string,
    city:string,
    state:string,
    complement:string
}

export interface RestaurantModel {
    address:string,
    category:string,
    deliverytime:number,
    description:string,
    id:string,
    logourl:string,
    name:string,
    shipping:number,
    cnpj:string,
    password:string
}

export interface ProductModel{
    category:string
    description:string
    id:string
    name:string
    photoUrl:string
    price:number
    provider:string
    stock:number
}

export interface OrderModel{
    id:string
    product:string 
    price:number
    quantity:number
    total:number
    moment:string 
    client:string
}

export interface cepModel{
    cep:string 
    logradouro:string
    complemento:string 
    unidade:string 
    bairro:string 
    localidade:string 
    uf:string 
    estado:string 
    regiao:string 
    ibge:string 
    gia:string 
    ddd:string 
    siafi:string 

}