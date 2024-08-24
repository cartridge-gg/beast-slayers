use starknet::ContractAddress;

#[derive(Serde, Copy, Drop, Introspect)]
pub struct Beast {
    pub level: u32,
    pub health: u32,
}

#[derive(Serde, Copy, Drop)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u32,
    pub current_beast: Beast
}

#[derive(Serde, Copy, Drop)]
#[dojo::model]
pub struct Warrior {
    #[key]
    pub address: ContractAddress,
    pub level: u32,
    pub last_mega_attack: u64,
    pub score: u32
}